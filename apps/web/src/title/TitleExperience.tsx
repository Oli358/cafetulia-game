import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CAFE_DAILY_PHRASES, getCafeGreeting } from '@cafetulia/ui';
import { CafetuliaLogo, PlayerAvatar } from '../art/CharacterPortrait';
import { soundEngine } from '../audio/soundEngine';
import {
  AvatarDropdownPicker,
  SubtitlesDropdownPicker,
} from '../components/TitlePickers';
import { useGameStore } from '../store/gameStore';
import {
  getMenuMode,
  MENU_MODES,
  type MenuMode,
  type MenuModeConfig,
} from './menuModes';

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
    return window.matchMedia('(max-width: 1023px)').matches ? 'mobile' : 'desktop';
  });

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setLayout(query.matches ? 'mobile' : 'desktop');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return layout;
}

function useScrollProgress(
  ref: React.RefObject<HTMLDivElement | null>,
): [number, () => void] {
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
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
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

function CupSeal({
  color,
  accent,
  className,
}: {
  color: string;
  accent: string;
  className?: string;
}): React.ReactElement {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <circle cx="32" cy="32" r="30" fill="rgba(255,248,236,0.35)" stroke={accent} strokeWidth="1.5" />
      <ellipse cx="32" cy="52" rx="21" ry="5" fill={accent} opacity="0.9" />
      <path
        d="M17 25 L47 25 L43 44 Q41 50 32 50 Q23 50 21 44 Z"
        fill="#FFF8EC"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M18.5 32 L45.5 32 L44 38 L20 38 Z" fill={accent} />
      <path
        d="M47 28 Q56 28 54 37 Q52 43 44 41"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M26 19 Q24 13 28 9 M36 20 Q34 12 39 8"
        stroke={accent}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
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
          <path d="M15.5 9.2a4 4 0 0 1 0 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M18 7a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

function StaticCanStage({
  mode,
  progress,
  layout,
}: {
  mode: MenuModeConfig;
  progress: number;
  layout: Layout;
}): React.ReactElement {
  const shift = layout === 'desktop' ? -progress * 12 : 0;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{
        transform: `translateX(${shift}%) translateY(${8 - progress * 4}%) scale(${0.92 + progress * 0.06})`,
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
              background: index % 2 === 0 ? '#4B2A17' : mode.theme.accent,
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
        <ellipse cx="130" cy="352" rx="82" ry="14" fill="#2B1710" opacity="0.22" />
        <rect x="58" y="20" width="144" height="322" rx="26" fill="#B68950" />
        <ellipse cx="130" cy="22" rx="72" ry="12" fill="#D7AD72" />
        <rect x="58" y="50" width="144" height="250" fill={mode.theme.paper} />
        <rect x="58" y="50" width="144" height="250" fill="url(#paperGrain)" opacity="0.7" />
        <rect x="68" y="60" width="124" height="230" fill="none" stroke={mode.theme.accent} strokeWidth="1.4" opacity="0.6" />
        <rect x="73" y="65" width="114" height="220" fill="none" stroke={mode.theme.accent} strokeWidth="0.8" opacity="0.35" />
        <circle cx="130" cy="108" r="24" fill="none" stroke={mode.theme.accent} strokeWidth="1.5" />
        <path
          d="M116 104h28l-3 14a10 10 0 0 1-22 0z"
          fill="#FFF8EC"
          stroke={mode.theme.ink}
          strokeWidth="1.5"
        />
        <text x="130" y="163" textAnchor="middle" fill={mode.theme.ink} fontSize="13" fontWeight="800" fontFamily="Fraunces, Georgia, serif" letterSpacing="2">
          CAFETULIA
        </text>
        <text x="130" y="198" textAnchor="middle" fill={mode.theme.ink} fontSize="30" fontWeight="800" fontFamily="Fraunces, Georgia, serif">
          {mode.blend}
        </text>
        <text x="130" y="219" textAnchor="middle" fill={mode.theme.accent} fontSize="8" fontWeight="800" fontFamily="Nunito Sans, sans-serif" letterSpacing="1">
          {mode.tab.toUpperCase()}
        </text>
        <line x1="94" y1="232" x2="166" y2="232" stroke={mode.theme.accent} strokeWidth="1.2" />
        <text x="130" y="249" textAnchor="middle" fill={mode.theme.ink} fontSize="9" fontWeight="600" fontFamily="Nunito Sans, sans-serif" opacity="0.75">
          {mode.blendNote}
        </text>
        <text x="130" y="280" textAnchor="middle" fill={mode.theme.accent} fontSize="7" fontWeight="800" fontFamily="Nunito Sans, sans-serif" letterSpacing="0.6">
          MEZCLA DE LA CASA · O &amp; A
        </text>
        <rect x="58" y="300" width="144" height="42" fill={mode.theme.accent} />
        <text x="130" y="325" textAnchor="middle" fill={mode.theme.paper} fontSize="8" fontWeight="800" fontFamily="Nunito Sans, sans-serif" letterSpacing="1">
          RESERVA DE LA CASA
        </text>
        <ellipse cx="130" cy="342" rx="66" ry="8" fill="#7A542F" opacity="0.55" />
        <defs>
          <pattern id="paperGrain" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="#3E2F2A" opacity="0.16" />
            <circle cx="4" cy="4" r="0.35" fill="#3E2F2A" opacity="0.1" />
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
      className="mt-3 grid grid-cols-3 gap-1 rounded-full border border-[#231712]/10 bg-[#F7EEDF] p-1"
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
            className={`min-h-[42px] rounded-full px-2 text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer ${
              active ? 'shadow-[0_2px_0_rgba(35,23,18,0.25)]' : 'text-[#6C564A] hover:text-[#2B1710]'
            }`}
            style={
              active
                ? { backgroundColor: item.theme.accent, color: item.theme.paper }
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
  const label = mode === 'join' ? 'Entrar a la mesa' : mode === 'create' ? 'Reservar mesa' : 'Servir café';
  const disabled = !canServe || isBusy || serving;

  return (
    <div className="mt-3 flex items-end justify-between gap-3 border-t border-[#231712]/10 pt-3">
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#B8512F]">
          {canServe ? 'Gira la lata para servir' : 'Completa la reserva'}
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
        className="group inline-flex min-h-[52px] shrink-0 items-center gap-2 rounded-2xl border-2 border-[#231712] bg-[#B8512F] px-3.5 py-2 text-left text-[#FFF8EC] shadow-[0_3px_0_#231712] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <RotateIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
        <span className="leading-tight">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider opacity-80">
            {serving ? 'Sirviendo…' : 'Girar y'}
          </span>
          <span className="block font-serif text-sm font-bold">{serving ? 'un momento' : label}</span>
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
  const active = progress > 0.52;

  return (
    <div
      className={`pointer-events-none absolute z-30 ${
        layout === 'desktop'
          ? 'right-[3.5%] top-1/2 w-[min(430px,40vw)]'
          : 'inset-x-2 bottom-2'
      }`}
      style={{
        opacity: smoothstep(0.32, 0.72, progress),
        transform:
          layout === 'desktop'
            ? 'translateY(-50%)'
            : `translateY(${(1 - progress) * 32}px)`,
      }}
      aria-hidden={!active}
    >
      <motion.section
        data-testid="title-menu-card"
        className="pointer-events-auto overflow-y-auto overscroll-contain rounded-[24px] border border-[#231712]/15 p-3.5 shadow-[0_18px_60px_rgba(35,23,18,0.24)] backdrop-blur-md sm:p-5"
        style={{
          backgroundColor: `${theme.paper}f2`,
          color: '#2B1710',
          pointerEvents: active ? 'auto' : 'none',
          maxHeight: layout === 'mobile' ? '57dvh' : 'calc(100dvh - 96px)',
        }}
        animate={{ borderColor: `${theme.accent}55` }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-[9px] font-extrabold uppercase tracking-[0.22em]"
              style={{ color: theme.accent }}
            >
              Reserva de la casa · {modeConfig.blend}
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold leading-tight sm:text-3xl">
              {modeConfig.title}
            </h2>
            <p className="mt-1 text-[11px] leading-snug text-[#6C564A] sm:text-xs">
              {modeConfig.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="hidden min-h-[38px] shrink-0 items-center gap-1 rounded-full border border-[#231712]/15 bg-[#FFF8EC]/70 px-2.5 text-[10px] font-extrabold text-[#6C564A] hover:text-[#2B1710] sm:inline-flex"
          >
            ← Carta
          </button>
        </div>

        <ModeTabs mode={mode} onChange={setMode} />

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="mt-3 space-y-2.5"
        >
          {mode === 'join' && (
            <label className="block">
              <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6C564A]">
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
                className="min-h-[50px] w-full rounded-xl border border-[#231712]/20 bg-[#FFFDF8] px-3 font-mono text-lg font-extrabold uppercase tracking-[0.18em] text-[#2B1710] outline-none transition focus:border-[#B8512F] focus:ring-2 focus:ring-[#B8512F]/20"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6C564A]">
              Tu nombre en la mesa
            </span>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="Tu apodo"
              maxLength={24}
              className="min-h-[50px] w-full rounded-xl border border-[#231712]/20 bg-[#FFFDF8] px-3 text-sm font-bold text-[#2B1710] outline-none transition focus:border-[#B8512F] focus:ring-2 focus:ring-[#B8512F]/20"
            />
          </label>

          {mode === 'create' && (
            <p className="rounded-xl border border-[#3F5E4A]/20 bg-[#E9EEDC]/70 px-3 py-2 text-[11px] font-semibold leading-snug text-[#3F5E4A]">
              La sala se prepara al instante. Comensales, bots y tiempo se ajustan en el lobby.
            </p>
          )}

          {mode === 'solo' && (
            <div>
              <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6C564A]">
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
                      className={`min-h-[42px] rounded-xl border text-xs font-bold transition-colors ${
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

          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#231712]/10 bg-[#FFF8EC]/55 px-2.5 py-2">
            <button
              type="button"
              onClick={() => toggleOverlay('avatar')}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-lg px-1 text-left text-[11px] font-bold text-[#2B1710] hover:bg-[#F7EEDF]"
            >
              <PlayerAvatar avatarId={avatarId} size={30} />
              <span className="min-w-0">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#6C564A]">
                  Tu ficha
                </span>
                <span className="block max-w-[120px] truncate">{nickname || 'Cafetero'}</span>
              </span>
            </button>
            <SubtitlesDropdownPicker compact />
          </div>

          {errorBanner && progress >= 0.2 && (
            <div
              role="alert"
              className="rounded-xl border border-[#A63F34]/30 bg-[#FDECEB] px-3 py-2 text-xs font-bold text-[#A63F34]"
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
  const dailyPhrase = CAFE_DAILY_PHRASES[phraseIndex] ?? CAFE_DAILY_PHRASES[0];

  const heroOpacity = 1 - smoothstep(0.18, 0.62, progress);
  const reserveVisible = progress > 0.48;
  const canInteractive = progress > 0.84;
  const canServe =
    nickname.trim().length >= 2 && (mode !== 'join' || joinCode.trim().length >= 4);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      setPhraseIndex((previous) => (previous + 1) % CAFE_DAILY_PHRASES.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

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
      window.setTimeout(resolve, reducedMotion ? 160 : 1100);
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
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            animate={{ backgroundColor: theme.bgBottom }}
            transition={{ duration: 0.7 }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            animate={{ backgroundColor: theme.bgTop, opacity: 0.72 }}
            transition={{ duration: 0.7 }}
          />
          <div aria-hidden="true" className="title-grain absolute inset-0 opacity-50" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,248,236,0.5),transparent_38%),linear-gradient(180deg,transparent_55%,rgba(35,23,18,0.18))]"
          />

          <div data-testid="title-cafe-scene" className="absolute inset-0 z-10">
            {!webglAvailable || sceneError ? (
              <StaticCanStage mode={modeConfig} progress={progress} layout={layout} />
            ) : (
              <SceneBoundary onError={() => setSceneError(true)}>
                <Suspense
                  fallback={
                    <StaticCanStage mode={modeConfig} progress={progress} layout={layout} />
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
            className="pointer-events-none absolute inset-0 z-20"
            style={{ opacity: heroOpacity }}
            aria-hidden={heroOpacity < 0.12}
          >
            <div
              className="absolute inset-x-0 top-[10%] flex flex-col items-center px-4 text-center"
              style={{
                color: theme.ink,
                transform: `translateY(${-progress * 26}px)`,
              }}
            >
              <p className="text-[9px] font-extrabold uppercase tracking-[0.28em] opacity-60 sm:text-[11px]">
                Café de autor · 2–4 comensales
              </p>
              <div className="mt-2 flex items-center justify-center gap-2.5 sm:gap-4">
                <CupSeal
                  color={theme.ink}
                  accent={theme.accent}
                  className="h-10 w-10 shrink-0 sm:h-16 sm:w-16"
                />
                <h1 className="font-serif text-[clamp(3.35rem,11.5vw,7.8rem)] font-extrabold leading-[0.8] tracking-[-0.055em]">
                  Cafetulia
                </h1>
              </div>
              <p className="mt-2 font-serif text-sm italic opacity-80 sm:text-lg">
                Salón de té y tertulia internacional
              </p>
              <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.24em] opacity-55 sm:text-[11px]">
                O &amp; A · treinta años de sobremesa
              </p>
              <p
                data-testid="title-greeting"
                className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-current/15 bg-[#FFF8EC]/35 px-3 py-1 text-[10px] font-bold backdrop-blur-sm sm:text-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                <span className="truncate">{greetingText}</span>
              </p>
              {errorBanner && progress < 0.2 && (
                <div
                  role="alert"
                  className="pointer-events-auto mt-3 max-w-[min(92vw,520px)] rounded-xl border border-[#A63F34]/40 bg-[#FDECEB] px-3 py-2 text-xs font-bold text-[#A63F34] shadow-sm"
                >
                  {errorBanner}
                </div>
              )}
            </div>

            <button
              type="button"
              data-testid="title-scroll-hint"
              onClick={() => {
                soundEngine.unlock();
                scrollToReserve();
              }}
              className="pointer-events-auto absolute bottom-[8%] left-1/2 inline-flex -translate-x-1/2 flex-col items-center gap-1 rounded-full border border-[#231712]/10 bg-[#FFF8EC]/85 px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-[0_2px_0_rgba(35,23,18,0.12)] backdrop-blur-md transition-opacity hover:opacity-100"
              style={{ color: '#2B1710', opacity: 0.8 * (1 - progress * 4) }}
            >
              Desliza para reservar
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 4v14M6 12l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="pointer-events-auto absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5 px-3 sm:gap-3">
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
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-current/15 bg-[#FFF8EC]/35 px-3 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm transition-colors hover:bg-[#FFF8EC]/65 sm:text-[11px]"
                  style={{ color: theme.ink }}
                >
                  <BookIcon />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-30"
            style={{ opacity: smoothstep(0.35, 0.75, progress) }}
            aria-hidden={!reserveVisible}
          >
            <div
              className="absolute left-3 top-16 sm:left-6 sm:top-20"
              style={{ color: theme.ink }}
            >
              <button
                type="button"
                onClick={handleBack}
                className="pointer-events-auto inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-current/15 bg-[#FFF8EC]/30 px-3 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm hover:bg-[#FFF8EC]/60"
              >
                ← Volver a la carta
              </button>
              <p className="mt-4 hidden font-serif text-5xl font-bold italic opacity-25 lg:block">
                {modeConfig.blend}
              </p>
              <p className="mt-1 hidden max-w-[190px] text-xs font-semibold leading-snug opacity-45 lg:block">
                {modeConfig.blendNote}
              </p>
            </div>

            <div
              className="pointer-events-none absolute bottom-[9%] left-1/2 -translate-x-1/2 text-center lg:left-[30%]"
              style={{ color: theme.ink }}
            >
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.22em] transition-opacity duration-300"
                style={{ opacity: canInteractive && !hasInteracted ? 0.65 : 0 }}
              >
                Gira la lata · arrastra o usa la rueda
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
            <div
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#231712]/10 bg-[#FFF8EC]/85 px-2.5 py-1 shadow-[0_2px_0_rgba(35,23,18,0.08)] backdrop-blur-md"
              style={{ color: '#2B1710' }}
            >
              <CafetuliaLogo compact hideTextOnMobile />
            </div>

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
