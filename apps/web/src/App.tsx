import React, { useEffect } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { soundEngine } from './audio/soundEngine';
import { ActiveModalLayer } from './components/Modals';
import { FinishedScreen, LobbyScreen, PlayingScreen } from './components/Screens';
import { TitleExperience } from './title/TitleExperience';
import { useGameStore } from './store/gameStore';

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
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setActiveOverlay = useGameStore((s) => s.setActiveOverlay);

  // Sync body dataset state for E2E & Ultra Mode inspection + crossfade music theme per screen
  useEffect(() => {
    const mapped =
      screen === 'playing'
        ? 'playing'
        : screen === 'finished'
          ? 'gameover'
          : 'title';
    document.body.dataset.state = mapped;
    soundEngine.setScreenTheme(screen);
  }, [screen]);

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
    } else if (autostart === '1') {
      void quickStartWithBots(1, 'medium');
    }
  }, [joinRoom, quickStartWithBots]);

  // Poll authoritative room state while in lobby or playing
  useEffect(() => {
    if (screen !== 'lobby' && screen !== 'playing') return;
    const interval = setInterval(() => {
      void pollRoom();
    }, 1500);
    return () => clearInterval(interval);
  }, [screen, pollRoom]);

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
            initial={
              reducedMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 12, scale: 0.992 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -10, scale: 1.006 }
            }
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
      </main>
    </MotionConfig>
  );
}

export default App;
