import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CAFE_DAILY_PHRASES, getCafeGreeting } from '@cafetulia/ui';
import { CafetuliaLockup, CafetuliaLogo, PlayerAvatar } from '../art/CharacterPortrait';
import { soundEngine } from '../audio/soundEngine';
import { PlayerName } from '../components/PlayerName';
import { AvatarDropdownPicker, SubtitlesDropdownPicker } from '../components/TitlePickers';
import { useGameStore } from '../store/gameStore';
import { FloatingMenuPapers } from './FloatingMenuPapers';
import { getMenuMode, MENU_MODES, type MenuMode, type MenuModeConfig } from './menuModes';

const LazyCoffeeMenuScene = React.lazy(() => import('./CoffeeMenuScene'));

type Layout = 'mobile' | 'desktop';

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function useLayout(): Layout {
  const [layout, setLayout] = useState<Layout>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return window.matchMedia('(max-width: 900px)').matches ? 'mobile' : 'desktop';
  });

  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)');
    const onChange = () => setLayout(query.matches ? 'mobile' : 'desktop');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return layout;
}

function useScrollProgress(ref: React.RefObject<HTMLDivElement | null>): [number, () => void] {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = element.scrollHeight - element.clientHeight;
      setProgress(max > 0 ? clamp01(element.scrollTop / max) : 0);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    element.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      element.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ref]);

  const scrollToReserve = () => {
    const element = ref.current;
    if (!element) return;
    element.scrollTo({
      top: element.clientHeight,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return [progress, scrollToReserve];
}

function detectWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    const context = gl as WebGLRenderingContext;
    const extension = context.getExtension('WEBGL_debug_renderer_info');
    const renderer = extension
      ? context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
      : context.getParameter(context.RENDERER);
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return !/SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(String(renderer));
  } catch {
    return false;
  }
}

class SceneBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { failed: boolean }
> {
  public override state = { failed: false };

  public static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  public override componentDidCatch(): void {
    this.props.onError();
  }

  public override render(): React.ReactNode {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function RotateIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M5.5 8.2A8 8 0 1 1 4.2 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3.4 3.8v5.2h5.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4 9.5h3l4.5-3.5v12L7 14.5H4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {muted ? (
        <path
          d="M16 9l5 6M21 9l-5 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M15.5 9.2a4 4 0 0 1 0 5.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M18 7a7 7 0 0 1 0 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

function SettingsIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.5v2.1M12 18.4v2.1M20.5 12h-2.1M5.6 12H3.5M18 6l-1.5 1.5M7.5 16.5 6 18M18 18l-1.5-1.5M7.5 7.5 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BookIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StaticCupStage({
  mode,
  progress,
  layout,
}: {
  mode: MenuModeConfig;
  progress: number;
  layout: Layout;
}): React.ReactElement {
  const x = layout === 'desktop' ? progress * 18 : 0;
  const y = layout === 'desktop' ? 34 - progress * 34 : 26 - progress * 26;
  const scale = layout === 'desktop' ? 1.15 + progress * 0.2 : 1.05 + progress * 0.05;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{
        transform: `translateX(${x}%) translateY(${y}%) scale(${scale}) rotate(${layout === 'desktop' ? -4 : -3}deg)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        {[
          { left: 13, top: 38, size: 18 },
          { left: 24, top: 62, size: 12 },
          { left: 76, top: 34, size: 14 },
          { left: 84, top: 58, size: 22 },
          { left: 18, top: 74, size: 10 },
          { left: 70, top: 76, size: 16 },
        ].map((blob, index) => (
          <span
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${blob.left}%`,
              top: `${blob.top}%`,
              width: blob.size,
              height: blob.size * 1.35,
              background: index % 2 === 0 ? '#4B2A17' : mode.theme.canAccent,
              opacity: 0.55,
              transform: `rotate(${index * 37}deg)`,
            }}
          />
        ))}
      </div>

      <svg
        viewBox="0 0 260 380"
        className="relative h-[min(48vh,430px)] w-auto drop-shadow-[0_24px_28px_rgba(35,23,18,0.32)]"
        aria-hidden="true"
      >
        <ellipse cx="130" cy="356" rx="80" ry="13" fill="#2B1710" opacity="0.22" />

        {/* Cup body, tapered like a takeaway paper cup */}
        <path
          d="M56 70 L204 70 L184 338 Q182 346 174 346 L86 346 Q78 346 76 338 Z"
          fill={mode.theme.canColor}
        />
        <path
          d="M56 70 L204 70 L184 338 Q182 346 174 346 L86 346 Q78 346 76 338 Z"
          fill="url(#paperGrain)"
          opacity="0.75"
        />

        {/* Printed label frame and cup mark */}
        <path
          d="M68 82 L192 82 L176 228 L84 228 Z"
          fill="none"
          stroke={mode.theme.canAccent}
          strokeWidth="1.4"
          opacity="0.65"
        />
        <circle
          cx="130"
          cy="136"
          r="23"
          fill="none"
          stroke={mode.theme.canAccent}
          strokeWidth="1.5"
        />
        <path
          d="M116 132h28l-3 14a10 10 0 0 1-22 0z"
          fill={mode.theme.canInk}
          stroke={mode.theme.canInk}
          strokeWidth="1.5"
        />
        <text
          x="130"
          y="108"
          textAnchor="middle"
          fill={mode.theme.canInk}
          fontSize="12"
          fontWeight="800"
          fontFamily="Fraunces, Georgia, serif"
          letterSpacing="2"
        >
          CAFETULIA
        </text>
        <text
          x="130"
          y="194"
          textAnchor="middle"
          fill={mode.theme.canInk}
          fontSize="30"
          fontWeight="800"
          fontFamily="Fraunces, Georgia, serif"
        >
          {mode.blend}
        </text>
        <text
          x="130"
          y="215"
          textAnchor="middle"
          fill={mode.theme.canAccent}
          fontSize="8"
          fontWeight="800"
          fontFamily="Nunito Sans, sans-serif"
          letterSpacing="1"
        >
          {mode.tab.toUpperCase()}
        </text>

        {/* Kraft heat sleeve */}
        <path d="M62 240 L198 240 L191 316 L69 316 Z" fill="#C79A6B" />
        <path d="M62 240 L198 240 L197 248 L63 248 Z" fill="#7A5236" opacity="0.55" />
        <path d="M69 308 L191 308 L191 316 L69 316 Z" fill="#7A5236" opacity="0.45" />
        <circle cx="130" cy="280" r="10" fill="none" stroke="#F7EEDF" strokeWidth="1.2" opacity="0.8" />
        <text
          x="130"
          y="283"
          textAnchor="middle"
          fill="#F7EEDF"
          fontSize="5"
          fontWeight="800"
          fontFamily="Nunito Sans, sans-serif"
          letterSpacing="0.5"
          opacity="0.9"
        >
          O &amp; A
        </text>
        <text
          x="130"
          y="300"
          textAnchor="middle"
          fill="#7A5236"
          fontSize="6.5"
          fontWeight="800"
          fontFamily="Nunito Sans, sans-serif"
          letterSpacing="1"
        >
          CAFETULIA · MEZCLA DE LA CASA
        </text>

        {/* Cream lid with a sip tab */}
        <rect x="48" y="44" width="164" height="14" rx="7" fill="#F7EEDF" />
        <rect x="54" y="30" width="152" height="18" rx="8" fill="#EFE5D6" />
        <rect x="112" y="19" width="36" height="9" rx="4.5" fill="#F7EEDF" />
        <ellipse cx="130" cy="23" rx="7" ry="3.5" fill="#3A2A22" opacity="0.65" />
        <rect x="58" y="58" width="144" height="8" rx="4" fill="#DCCDBA" opacity="0.8" />

        <defs>
          <pattern id="paperGrain" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="#FFF8EC" opacity="0.22" />
            <circle cx="4" cy="4" r="0.35" fill="#FFF8EC" opacity="0.14" />
          </pattern>
        </defs>
      </svg>
    </div>
  );
}

function ModeTabs({
  mode,
  onChange,
}: {
  mode: MenuMode;
  onChange: (mode: MenuMode) => void;
}): React.ReactElement {
  return (
    <div
      role="tablist"
      aria-label="Tipo de reserva"
      className="mt-1.5 grid grid-cols-3 gap-1 rounded-full border border-[#231712]/10 bg-[#F7EEDF] p-1"
    >
      {MENU_MODES.map((item) => {
        const active = item.id === mode;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            data-testid={`menu-mode-${item.id}`}
            onClick={() => {
              soundEngine.unlock();
              soundEngine.playSfx('uiToggle');
              onChange(item.id);
            }}
            className={`min-h-[38px] rounded-full px-2 text-[11px] sm:text-xs font-extrabold transition-colors duration-500 cursor-pointer ${
              active
                ? 'shadow-[0_2px_0_rgba(35,23,18,0.25)]'
                : 'text-[#6C564A] hover:text-[#2B1710]'
            }`}
            style={
              active
                ? {
                    backgroundColor: item.theme.accent,
                    color: item.id === 'solo' ? '#2B1710' : '#FFF8EC',
                  }
                : undefined
            }
          >
            {item.tab}
          </button>
        );
      })}
    </div>
  );
}

function ServeControl({
  mode,
  canServe,
  serving,
  isBusy,
  onServe,
}: {
  mode: MenuMode;
  canServe: boolean;
  serving: boolean;
  isBusy: boolean;
  onServe: () => void;
}): React.ReactElement {
  const testId =
    mode === 'join' ? 'join-room-btn' : mode === 'create' ? 'create-room-btn' : 'quick-start-btn';
  const label =
    mode === 'join' ? 'Entrar a la mesa' : mode === 'create' ? 'Reservar mesa' : 'Servir café';
  const disabled = !canServe || isBusy || serving;

  return (
    <div className="mt-1.5 flex items-stretch justify-between gap-3 border-t border-[#231712]/10 pt-2 lg:items-end">
      <div className="hidden min-w-0 lg:block">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#B8512F]">
          {canServe ? 'Gira el vaso para servir' : 'Completa la reserva'}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-[#6C564A]">
          {canServe
            ? 'Arrastra, usa la rueda o pulsa el botón.'
            : mode === 'join'
              ? 'Necesitamos un código y tu nombre.'
              : 'Escribe tu nombre en la mesa.'}
        </p>
      </div>
      <button
        type="button"
        data-testid={testId}
        disabled={disabled}
        onClick={onServe}
        className="group inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-[#231712] bg-[#B8512F] px-3.5 py-1.5 text-left text-[#FFF8EC] shadow-[0_3px_0_#231712] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 lg:w-auto"
      >
        <RotateIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
        <span className="leading-tight">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider opacity-80">
            {serving ? 'Sirviendo…' : 'Girar y'}
          </span>
          <span className="block font-serif text-sm font-bold">
            {serving ? 'un momento' : label}
          </span>
        </span>
      </button>
    </div>
  );
}

function ReservationCard({
  mode,
  setMode,
  layout,
  progress,
  onServe,
  canServe,
  serving,
  isBusy,
  errorBanner,
  onBack,
  joinCode,
  setJoinCode,
  difficulty,
  setDifficulty,
}: {
  mode: MenuMode;
  setMode: (mode: MenuMode) => void;
  layout: Layout;
  progress: number;
  onServe: () => void;
  canServe: boolean;
  serving: boolean;
  isBusy: boolean;
  errorBanner: string | null;
  onBack: () => void;
  joinCode: string;
  setJoinCode: (value: string) => void;
  difficulty: 'basic' | 'medium' | 'hard';
  setDifficulty: (value: 'basic' | 'medium' | 'hard') => void;
}): React.ReactElement {
  const modeConfig = getMenuMode(mode);
  const theme = modeConfig.theme;
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const avatarId = useGameStore((s) => s.avatarId);
  const toggleOverlay = useGameStore((s) => s.toggleOverlay);
  const active = progress > 0.55;

  return (
    <div
      className={`pointer-events-none absolute z-30 ${
        layout === 'desktop' ? 'bottom-[4%] left-[4%] w-[min(430px,42vw)]' : 'inset-x-2 bottom-2'
      }`}
      style={{
        opacity: smoothstep(0.55, 0.9, progress),
        transform:
          layout === 'desktop'
            ? `translateY(${(1 - progress) * 60}px)`
            : `translateY(${(1 - progress) * 90}px)`,
      }}
      aria-hidden={!active}
    >
      <motion.section
        data-testid="title-menu-card"
        className="menu-reservation-card pointer-events-auto rounded-[24px] border border-[#231712]/15 p-3 shadow-[0_18px_60px_rgba(35,23,18,0.24)] backdrop-blur-md transition-colors duration-700"
        style={{
          backgroundColor: `${theme.paper}f2`,
          color: '#2B1710',
          pointerEvents: active ? 'auto' : 'none',
        }}
        animate={{ borderColor: `${theme.accent}55` }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-[9px] font-extrabold uppercase tracking-[0.22em]"
              style={{ color: theme.accent }}
            >
              Reserva de la casa · {modeConfig.blend}
            </p>
            <h2 className="mt-0.5 font-serif text-lg font-bold leading-tight sm:text-[22px]">
              {modeConfig.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="hidden min-h-[34px] shrink-0 items-center gap-1 rounded-full border border-[#231712]/15 bg-[#FFF8EC]/70 px-2.5 text-[10px] font-extrabold text-[#6C564A] hover:text-[#2B1710] sm:inline-flex"
          >
            ← Carta
          </button>
        </div>

        <ModeTabs mode={mode} onChange={setMode} />

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="mt-1.5 space-y-1.5"
        >
          {mode === 'join' && (
            <label className="block">
              <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6C564A]">
                Código de la reserva
              </span>
              <input
                id="room-code-input"
                type="text"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                maxLength={8}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                className="min-h-[46px] w-full rounded-xl border border-[#231712]/20 bg-[#FFFDF8] px-3 font-mono text-base font-extrabold uppercase tracking-[0.18em] text-[#2B1710] outline-none transition focus:border-[#B8512F] focus:ring-2 focus:ring-[#B8512F]/20"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6C564A]">
              Tu nombre en la mesa
            </span>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="Tu apodo"
              maxLength={24}
              className="min-h-[46px] w-full rounded-xl border border-[#231712]/20 bg-[#FFFDF8] px-3 text-sm font-bold text-[#2B1710] outline-none transition focus:border-[#B8512F] focus:ring-2 focus:ring-[#B8512F]/20"
            />
          </label>

          {mode === 'create' && (
            <p className="rounded-xl border border-[#3F5E4A]/20 bg-[#E9EEDC]/70 px-2.5 py-1.5 text-[10px] font-semibold leading-snug text-[#3F5E4A]">
              La sala se prepara al instante. Comensales, bots y tiempo se ajustan en el lobby.
            </p>
          )}

          {mode === 'solo' && (
            <div>
              <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6C564A]">
                Dificultad del bot
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'basic', label: 'Básico' },
                  { id: 'medium', label: 'Medio' },
                  { id: 'hard', label: 'Difícil' },
                ].map((item) => {
                  const selected = difficulty === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-testid={`difficulty-${item.id}`}
                      onClick={() => setDifficulty(item.id as 'basic' | 'medium' | 'hard')}
                      className={`min-h-[38px] rounded-xl border text-xs font-bold transition-colors ${
                        selected
                          ? 'border-[#C8A12A] bg-[#C8A12A]/15 text-[#2B1710]'
                          : 'border-[#231712]/10 bg-[#FFF8EC]/60 text-[#6C564A] hover:text-[#2B1710]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="menu-card-avatar hidden items-center justify-between gap-2 rounded-xl border border-[#231712]/10 bg-[#FFF8EC]/55 px-2.5 py-1.5 sm:flex">
            <button
              type="button"
              onClick={() => toggleOverlay('avatar')}
              className="inline-flex min-h-[34px] items-center gap-2 rounded-lg px-1 text-left text-[11px] font-bold text-[#2B1710] hover:bg-[#F7EEDF]"
            >
              <PlayerAvatar avatarId={avatarId} size={32} />
              <span className="min-w-0">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#6C564A]">
                  Tu ficha
                </span>
                <PlayerName
                  nickname={nickname || 'Cafetero'}
                  className="block max-w-[120px] truncate font-bold"
                  showAura={false}
                />
              </span>
            </button>
            <SubtitlesDropdownPicker compact />
          </div>

          {errorBanner && progress >= 0.2 && (
            <div
              role="alert"
              className="rounded-xl border border-[#A63F34]/30 bg-[#FDECEB] px-2.5 py-1.5 text-[11px] font-bold text-[#A63F34]"
            >
              {errorBanner}
            </div>
          )}
        </motion.div>

        <ServeControl
          mode={mode}
          canServe={canServe}
          serving={serving}
          isBusy={isBusy}
          onServe={onServe}
        />
      </motion.section>
    </div>
  );
}

export function TitleExperience(): React.ReactElement {
  const nickname = useGameStore((s) => s.nickname);
  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const quickStartWithBots = useGameStore((s) => s.quickStartWithBots);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setActiveOverlay = useGameStore((s) => s.setActiveOverlay);
  const errorBanner = useGameStore((s) => s.errorBanner);
  const isBusy = useGameStore((s) => s.isBusy);
  const reducedMotion = useGameStore((s) => s.reducedMotion);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, scrollToReserve] = useScrollProgress(scrollRef);
  const layout = useLayout();
  const [mode, setMode] = useState<MenuMode>('join');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [serving, setServing] = useState(false);
  const [muted, setMuted] = useState(() => soundEngine.getVolumes().muted);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [sceneError, setSceneError] = useState(false);
  const [webglAvailable] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.has('no3d')) return false;
    if (params.has('force3d')) return true;
    return detectWebGL();
  });
  const [joinCode, setJoinCode] = useState('');
  const [difficulty, setDifficulty] = useState<'basic' | 'medium' | 'hard'>('medium');

  const modeConfig = getMenuMode(mode);
  const theme = modeConfig.theme;
  const greetingText = useMemo(() => getCafeGreeting(nickname), [nickname]);
  const greetingName = nickname.trim();
  const greetingPrefix =
    greetingName && greetingText.endsWith(greetingName)
      ? greetingText.slice(0, -greetingName.length)
      : null;
  const dailyPhrase = CAFE_DAILY_PHRASES[phraseIndex] ?? CAFE_DAILY_PHRASES[0];

  const heroOpacity = 1 - smoothstep(0.2, 0.58, progress);
  const worldLayer = smoothstep(0.28, 0.72, progress);
  const reserveVisible = progress > 0.55;
  const canInteractive = progress > 0.84;
  const canServe = nickname.trim().length >= 2 && (mode !== 'join' || joinCode.trim().length >= 4);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      setPhraseIndex((previous) => (previous + 1) % CAFE_DAILY_PHRASES.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  // A single wheel notch moves between the two acts: down opens the
  // reservation card; up returns to the poster. The listener lives on the
  // scroll container, so it also works over the card, the header, the logo and
  // any open overlay. Inside the menu, the cup only uses downward wheel to
  // cycle worlds, so an upward tick always leaves the menu.
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    let locked = false;
    let unlockTimer = 0;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) < 2) return;
      const goingDown = event.deltaY > 0;
      const atPoster = element.scrollTop < element.clientHeight * 0.12;
      const atMenu = element.scrollTop > element.clientHeight * 0.88;
      if (goingDown ? !atPoster : !atMenu) return;
      event.preventDefault();
      if (locked) return;
      locked = true;
      if (!goingDown) setActiveOverlay(null);
      element.scrollTo({
        top: goingDown ? element.clientHeight : 0,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
      unlockTimer = window.setTimeout(
        () => {
          locked = false;
        },
        reducedMotion ? 120 : 900,
      );
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      element.removeEventListener('wheel', onWheel);
      window.clearTimeout(unlockTimer);
    };
  }, [reducedMotion, setActiveOverlay]);

  const handleModeChange = (next: MenuMode) => {
    setMode(next);
    setHasInteracted(true);
  };

  const handleServe = async () => {
    if (!canServe || serving || isBusy) return;
    soundEngine.unlock();
    soundEngine.playSfx('uiConfirm');
    setServing(true);
    setHasInteracted(true);
    await new Promise((resolve) => {
      window.setTimeout(resolve, reducedMotion ? 160 : 1500);
    });
    let ok = false;
    if (mode === 'join') {
      ok = await joinRoom(joinCode);
    } else if (mode === 'create') {
      ok = await createRoom();
    } else {
      ok = await quickStartWithBots(1, difficulty);
    }
    if (!ok) setServing(false);
  };

  const handleBack = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    setActiveOverlay(null);
  };

  return (
    <div
      data-testid="title-screen"
      ref={scrollRef}
      className="title-experience relative h-[100dvh] w-full overflow-y-auto overflow-x-hidden"
      style={{ scrollBehavior: reducedMotion ? 'auto' : 'smooth' }}
    >
      <div className="relative h-[200dvh] w-full">
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,#FCF8F0_0%,#F3E9D9_52%,#E6D2B6_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 transition-opacity duration-150"
            style={{ opacity: worldLayer }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ backgroundColor: theme.bgBottom }}
              transition={{ duration: reducedMotion ? 0 : 1.4, ease: [0.33, 0, 0.2, 1] }}
            />
            <motion.div
              className="absolute inset-0"
              animate={{ backgroundColor: theme.bgTop }}
              transition={{ duration: reducedMotion ? 0 : 1.4, ease: [0.33, 0, 0.2, 1] }}
              style={{
                maskImage:
                  'linear-gradient(180deg, #000 0%, rgba(0,0,0,0.55) 58%, transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(180deg, #000 0%, rgba(0,0,0,0.55) 58%, transparent 100%)',
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(255,248,236,0.32),transparent_42%),linear-gradient(180deg,transparent_45%,rgba(35,23,18,0.28))]" />
          </div>
          <div aria-hidden="true" className="title-grain absolute inset-0 opacity-50" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(255,252,245,0.5),transparent_58%)] transition-opacity duration-200"
            style={{ opacity: heroOpacity }}
          />

          <FloatingMenuPapers progress={progress} />

          <div data-testid="title-cafe-scene" className="absolute inset-0 z-10">
            {!webglAvailable || sceneError ? (
              <StaticCupStage mode={modeConfig} progress={progress} layout={layout} />
            ) : (
              <SceneBoundary onError={() => setSceneError(true)}>
                <Suspense
                  fallback={
                    <StaticCupStage mode={modeConfig} progress={progress} layout={layout} />
                  }
                >
                  <LazyCoffeeMenuScene
                    mode={mode}
                    progress={progress}
                    layout={layout}
                    interactive={canInteractive && !serving}
                    reducedMotion={reducedMotion}
                    serving={serving}
                    canServe={canServe}
                    onModeChange={handleModeChange}
                    onServe={() => {
                      void handleServe();
                    }}
                  />
                </Suspense>
              </SceneBoundary>
            )}
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-[8] overflow-hidden"
            style={{ opacity: heroOpacity, transform: `translateY(${-progress * 22}px)` }}
            aria-hidden={heroOpacity < 0.12}
          >
            <div className="absolute inset-x-[4%] top-[31.5%] sm:top-[36.5%]">
              <h1 className="font-serif text-[clamp(3.55rem,15vw,4.8rem)] font-normal uppercase leading-[0.72] tracking-[-0.055em] text-[#2B1710] sm:text-[clamp(4rem,10.8vw,13.5rem)]">
                Cafetulia<span style={{ color: theme.accent }}>.</span>
                <br />
                El juego<span style={{ color: theme.accent }}>.</span>
              </h1>
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{ opacity: heroOpacity }}
            aria-hidden={heroOpacity < 0.12}
          >
            <div
              className="absolute left-[4%] right-[4%] top-[22%] sm:top-[27%]"
              style={{ color: '#2B1710' }}
            >
              <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
                <CafetuliaLockup className="h-11 shrink-0 drop-shadow-[0_2px_4px_rgba(35,23,18,0.12)] sm:h-16" />
                <div className="min-w-0">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] opacity-75 sm:text-[11px]">
                    Salón de té y tertulia · Juego para 2–4
                  </p>
                  <p
                    data-testid="title-greeting"
                    className="mt-1.5 inline-flex max-w-full items-center gap-1.5 text-[10px] font-bold opacity-70 sm:text-xs"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <span className="truncate">
                    {greetingPrefix !== null ? (
                      <>
                        {greetingPrefix}
                        <PlayerName nickname={greetingName} showAura={false} />
                      </>
                    ) : (
                      greetingText
                    )}
                  </span>
                  </p>
                </div>
              </div>

              {errorBanner && progress < 0.2 && (
                <div
                  role="alert"
                  className="pointer-events-auto mt-3 max-w-[min(92vw,520px)] rounded-xl border border-[#A63F34]/30 bg-[#FFF8EC] px-3 py-2 text-xs font-bold text-[#A63F34] shadow-sm"
                >
                  {errorBanner}
                </div>
              )}
            </div>

            <aside
              className="pointer-events-auto absolute bottom-[5.5%] right-[3.5%] hidden w-[min(300px,24vw)] rounded-[22px] border border-[#231712]/12 bg-[#FFF8EC]/72 p-4 shadow-[0_18px_50px_rgba(35,23,18,0.14)] backdrop-blur-md lg:block"
              style={{ color: '#2B1710' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                />
                <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#6C564A]">
                  La casa invita
                </p>
              </div>
              <p className="mt-2 font-serif text-[26px] font-bold leading-[1.02] tracking-[-0.02em]">
                El vaso es el menú.
              </p>
              <p className="mt-1.5 text-[11px] font-semibold leading-snug text-[#6C564A]">
                Gíralo para cambiar de mundo. Desliza para reservar tu mesa.
              </p>
              <div className="mt-3 flex items-center gap-2 border-t border-[#231712]/10 pt-2.5">
                {MENU_MODES.map((item) => (
                  <span key={item.id} className="flex items-center gap-1">
                    <span
                      className="block h-2.5 w-1.5 rounded-[2px]"
                      style={{ backgroundColor: item.theme.canColor }}
                    />
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#6C564A]">
                      {item.blend}
                    </span>
                  </span>
                ))}
              </div>
            </aside>

            <div className="pointer-events-auto absolute bottom-[3.2%] left-[4%] z-30 flex flex-wrap items-center gap-1.5 pr-3 sm:bottom-[5%] sm:gap-2">
              <button
                type="button"
                data-testid="title-scroll-hint"
                onClick={() => {
                  soundEngine.unlock();
                  scrollToReserve();
                }}
                className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full border border-[#2B1710] bg-[#2B1710] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#FFF8EC] shadow-[0_3px_0_rgba(184,81,47,0.9)] transition-transform hover:-translate-y-0.5 sm:text-[11px]"
              >
                <span className="sm:hidden">Entrar</span>
                <span className="hidden sm:inline">Entrar a la tertulia</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 4v14M6 12l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {[
                { label: 'Tutorial', testId: 'title-tutorial-btn', modal: 'tutorial' as const },
                { label: 'Reglas', testId: 'title-rules-btn', modal: 'rules' as const },
              ].map((item) => (
                <button
                  key={item.testId}
                  type="button"
                  data-testid={item.testId}
                  onClick={() => {
                    soundEngine.unlock();
                    setActiveModal(item.modal);
                  }}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#231712]/15 bg-[#FFF8EC]/65 px-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#2B1710] backdrop-blur-sm transition-colors hover:bg-[#FFF8EC] sm:text-[11px]"
                >
                  <BookIcon />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-30"
            style={{ opacity: smoothstep(0.55, 0.9, progress) }}
            aria-hidden={!reserveVisible}
          >
            <div
              className="pointer-events-none absolute left-[4%] top-[10%] max-w-[88%] sm:top-[12%] sm:max-w-[58%]"
              style={{ color: '#FFF8EC' }}
            >
              <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] opacity-70 sm:text-[11px]">
                Mundo 0{modeConfig.index + 1} · Mezcla de la casa
              </p>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={mode}
                  initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                  transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="mt-1 font-serif text-[clamp(2.6rem,13vw,4rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em] sm:text-[clamp(3rem,6.6vw,7.5rem)]">
                    {modeConfig.blend}
                    <span style={{ color: theme.glow }}>.</span>
                  </h2>
                  <p className="mt-1 font-serif text-sm italic opacity-90 sm:mt-2 sm:text-lg">
                    {modeConfig.blendNote}
                  </p>
                  <p className="menu-world-description mt-1 hidden max-w-[380px] text-[11px] font-semibold leading-snug opacity-65 sm:block sm:text-xs">
                    {modeConfig.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              className="pointer-events-none absolute bottom-[4%] right-[5%] hidden text-right sm:block"
              style={{ color: '#FFF8EC' }}
            >
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.22em] transition-opacity duration-300"
                style={{ opacity: canInteractive && !hasInteracted ? 0.58 : 0 }}
              >
                Gira el vaso · arrastra o usa la rueda
              </p>
            </div>

            <ReservationCard
              mode={mode}
              setMode={(next) => {
                setHasInteracted(true);
                setMode(next);
              }}
              layout={layout}
              progress={progress}
              onServe={() => {
                void handleServe();
              }}
              canServe={canServe}
              serving={serving}
              isBusy={isBusy}
              errorBanner={errorBanner}
              onBack={handleBack}
              joinCode={joinCode}
              setJoinCode={setJoinCode}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
            />
          </div>

          <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between gap-2 px-2.5 py-2 sm:px-5 sm:py-3">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Volver a la portada de Cafetulia"
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#231712]/10 bg-[#FFF8EC]/85 px-2.5 py-1 text-left shadow-[0_2px_0_rgba(35,23,18,0.08)] backdrop-blur-md transition-colors hover:bg-[#FFF8EC]"
              style={{ color: '#2B1710' }}
            >
              <CafetuliaLogo compact hideTextOnMobile />
            </button>

            <button
              type="button"
              data-testid="title-daily-phrase"
              onClick={() => {
                soundEngine.unlock();
                soundEngine.playSfx('uiToggle');
                setPhraseIndex((previous) => (previous + 1) % CAFE_DAILY_PHRASES.length);
              }}
              title="Cambiar nota de la pizarra del día"
              className="pointer-events-auto inline-flex max-w-[30vw] items-center gap-1.5 truncate rounded-full border border-[#231712]/10 bg-[#FFF8EC]/75 px-2 py-1.5 text-[9px] font-serif italic text-[#2B1710] backdrop-blur-md sm:max-w-[38vw] sm:px-2.5 sm:text-xs"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8A12A]" aria-hidden="true" />
              <span className="truncate">«{dailyPhrase}»</span>
            </button>

            <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
              <div data-testid="title-hero-avatar">
                <AvatarDropdownPicker compact iconOnly />
              </div>
              <button
                type="button"
                aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
                title={muted ? 'Activar sonido' : 'Silenciar sonido'}
                onClick={() => {
                  soundEngine.unlock();
                  const next = !muted;
                  soundEngine.setVolumes({ muted: next });
                  setMuted(next);
                }}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#231712]/10 bg-[#FFF8EC]/80 text-[#2B1710] backdrop-blur-md transition-colors hover:bg-[#FFF8EC]"
              >
                <SpeakerIcon muted={muted} />
              </button>
              <button
                type="button"
                data-testid="title-settings-btn"
                aria-label="Ajustes"
                title="Ajustes"
                onClick={() => {
                  soundEngine.unlock();
                  setActiveModal('settings');
                }}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#231712]/10 bg-[#FFF8EC]/80 text-[#2B1710] backdrop-blur-md transition-colors hover:bg-[#FFF8EC]"
              >
                <SettingsIcon />
              </button>
            </div>
          </header>
        </div>
      </div>
    </div>
  );
}
