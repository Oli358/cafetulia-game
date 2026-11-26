import React, { useEffect } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { soundEngine } from './audio/soundEngine';
import { ActiveModalLayer } from './components/Modals';
import { FinishedScreen, LobbyScreen, PlayingScreen } from './components/Screens';
import { TitleExperience } from './title/TitleExperience';
import { useGameStore } from './store/gameStore';

function OrientationGuard(): React.ReactElement {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: 'portrait') => Promise<void>;
    };
    if (orientation && typeof orientation.lock === 'function') {
      void orientation.lock('portrait').catch(() => {
        /* Browsers usually require fullscreen; the CSS guard still covers it. */
      });
    }
  }, []);

  return (
    <div
      data-testid="orientation-guard"
      role="dialog"
      aria-modal="true"
      aria-label="Gira el teléfono"
      className="orientation-guard fixed inset-0 z-[200] flex-col items-center justify-center gap-4 bg-[#231712] p-6 text-center text-[#FFF9F0]"
    >
      <svg width="54" height="54" viewBox="0 0 54 54" fill="none" aria-hidden="true">
        <rect x="18" y="6" width="18" height="42" rx="3" stroke="#F2C14E" strokeWidth="2.4" />
        <path d="M23 10h8" stroke="#F2C14E" strokeWidth="2" strokeLinecap="round" />
        <circle cx="27" cy="43" r="1.6" fill="#F2C14E" />
        <path d="M8 17a20 20 0 0 1 9-9" stroke="#C96F4A" strokeWidth="2.2" strokeLinecap="round" />
        <path
          d="M8 12v5h5"
          stroke="#C96F4A"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="font-serif text-2xl font-bold">Gira el teléfono</p>
      <p className="max-w-xs text-sm leading-relaxed text-[#FFF9F0]/80">
        Cafetulia se juega en vertical. Pon el móvil de pie para seguir con la tertulia.
      </p>
    </div>
  );
}

export function App(): React.ReactElement {
  const screen = useGameStore((s) => s.screen);
  const activeModal = useGameStore((s) => s.activeModal);
  const activeOverlay = useGameStore((s) => s.activeOverlay);
  const highContrast = useGameStore((s) => s.highContrast);
  const largeText = useGameStore((s) => s.largeText);
  const nightMode = useGameStore((s) => s.nightMode);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const quickStartWithBots = useGameStore((s) => s.quickStartWithBots);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const pollRoom = useGameStore((s) => s.pollRoom);
  const notifyLeaving = useGameStore((s) => s.notifyLeaving);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setActiveOverlay = useGameStore((s) => s.setActiveOverlay);

  // Sync body dataset state for E2E & Ultra Mode inspection + crossfade music theme per screen
  useEffect(() => {
    const mapped = screen === 'playing' ? 'playing' : screen === 'finished' ? 'gameover' : 'title';
    document.body.dataset.state = mapped;
    soundEngine.setScreenTheme(screen);
  }, [screen]);

  // Avisa a la sala si la pestaña se cierra o se navega fuera. Así los demás
  // ven la desconexión sin esperar al barrido de presencia de 90 s.
  useEffect(() => {
    const onPageHide = (event: PageTransitionEvent) => {
      if (event.persisted) return;
      notifyLeaving();
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, [notifyLeaving]);

  // Unlock Web Audio on first tap/click/keydown for iOS Safari & Android Chrome
  useEffect(() => {
    const unlockOnce = () => {
      soundEngine.unlock();
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
    };
    window.addEventListener('pointerdown', unlockOnce, { passive: true });
    window.addEventListener('keydown', unlockOnce, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
    };
  }, []);

  // Handle ?autostart=1 and ?room=CODE query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const autostart = params.get('autostart');
    if (roomParam) {
      void joinRoom(roomParam);
    } else if (autostart === '1' && import.meta.env.DEV) {
      // E2E/dev convenience only: a shared production link must not create
      // and start a room without the user touching the interface.
      void quickStartWithBots(1, 'medium');
    }
  }, [joinRoom, quickStartWithBots]);

  // Poll authoritative room state while in lobby, playing or final. The final
  // screen needs it to see rematch votes and returns to the room from others.
  useEffect(() => {
    if (screen === 'title') return;
    const interval = setInterval(() => {
      void pollRoom();
    }, 1500);
    return () => clearInterval(interval);
  }, [screen, pollRoom]);

  // Render Free duerme el servicio tras 15 minutos sin tráfico. Mientras haya
  // una sala o partida abierta, mandamos un latido ligero además del poll.
  // El ping externo de .github/workflows/render-keepalive.yml cubre el resto.
  useEffect(() => {
    if (screen === 'title') return;
    const ping = () => {
      void fetch(`/health?t=${Date.now()}`, { cache: 'no-store' }).catch(() => {
        /* El servidor puede estar despertando; el siguiente latido lo reintenta. */
      });
    };
    ping();
    const interval = window.setInterval(ping, 25_000);
    return () => window.clearInterval(interval);
  }, [screen]);

  // Global keyboard shortcuts. The title now has a reservation form, so we
  // only keep Escape for closing overlays/modals.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (activeOverlay) {
        setActiveOverlay(null);
        return;
      }
      if (activeModal) {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeModal, activeOverlay, setActiveModal, setActiveOverlay]);

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
      <main
        className={`relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden transition-colors ${
          nightMode
            ? 'bg-[#181C26] text-[#FFF9F0]'
            : highContrast
              ? 'bg-[#FFF9F0] text-[#1A110E]'
              : 'bg-[#F7EEDF] text-[#3E2F2A]'
        } ${largeText ? 'text-lg' : 'text-base'}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 1.006 }}
            transition={{
              duration: reducedMotion ? 0 : 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="h-full w-full relative"
          >
            {/* Subtle paper/steam veil that sweeps across during screen transitions */}
            {!reducedMotion && (
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0.45, y: 18 }}
                animate={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                className="pointer-events-none fixed inset-x-0 top-0 h-24 bg-gradient-to-b from-[#FFF9F0]/60 to-transparent z-40"
              />
            )}
            {screen === 'title' && <TitleExperience />}
            {screen === 'lobby' && <LobbyScreen />}
            {screen === 'playing' && <PlayingScreen />}
            {screen === 'finished' && <FinishedScreen />}
          </motion.div>
        </AnimatePresence>
        <ActiveModalLayer />
        <OrientationGuard />
      </main>
    </MotionConfig>
  );
}

export default App;
