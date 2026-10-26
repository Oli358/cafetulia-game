import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  finalScores,
  getLegalMoves,
  type Nation,
  type Seat,
  type Table,
  type Tile,
} from '@cafetulia/engine';
import {
  CAFE_DAILY_PHRASES,
  formatScoreEs,
  getCafeGreeting,
  getCharacterProfile,
  NATION_VISUALS,
  PRESET_AVATARS,
  SUBTITLE_MODES,
  SUBTITLE_STYLES,
} from '@cafetulia/ui';
import { soundEngine } from '../audio/soundEngine';
import {
  CafetuliaLogo,
  CharacterPortrait,
  FlagBadge,
  PlayerAvatar,
} from '../art/CharacterPortrait';
import { useGameStore } from '../store/gameStore';
import {
  evaluateDraftPlacements,
  getNationName,
  inspectSeatsForSelectedTile,
} from '../utils/moveHelper';
import {
  CoinTray,
  FlyingCoinsLayer,
  type CoinFlightEvent,
} from './CoinTray';
import { IllustratedBoard, type ChairToastInfo } from './IllustratedBoard';
import { AnchoredPopover } from './Modals';

const LazyPapercraftBoard = React.lazy(() => import('./PapercraftBoard'));

export type ArcadeCalloutEvent = {
  id: string;
  title: string;
  subtitle: string;
  tone: 'gold' | 'green' | 'red' | 'blue';
  isKeyMoment: boolean;
};

const JOKER_SWAP_EXPLANATION =
  'Entregas una ficha natural que podría ocupar esa silla y recuperas el comodín. No puntúas y no robas. Úsalo solo si te conviene.';

/**
 * Keyboard & ARIA accessible Avatar Dropdown / Bottom Sheet (P0.2 & P0.4)
 * Uses global activeOverlay === 'avatar' and portal AnchoredPopover.
 */
function AvatarDropdownPicker({ compact = false }: { compact?: boolean }): React.ReactElement {
  const avatarId = useGameStore((s) => s.avatarId);
  const setAvatarId = useGameStore((s) => s.setAvatarId);
  const activeOverlay = useGameStore((s) => s.activeOverlay);
  const toggleOverlay = useGameStore((s) => s.toggleOverlay);
  const setActiveOverlay = useGameStore((s) => s.setActiveOverlay);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const open = activeOverlay === 'avatar';

  const currentAvatar =
    PRESET_AVATARS.find((a) => a.id === avatarId) ?? {
      id: 'espresso',
      label: 'Taza Espresso',
      bg: '#C96F4A',
      kind: 'icon' as const,
    };

  return (
    <div className="relative" data-testid="title-avatar-picker">
      <button
        ref={btnRef}
        type="button"
        data-testid="avatar-dropdown-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="avatar-dropdown-popover"
        onClick={() => toggleOverlay('avatar')}
        className={`inline-flex items-center justify-between gap-2 rounded-xl bg-[#F7EEDF] border border-[#231712]/25 text-[#3E2F2A] font-bold hover:bg-[#EAD9C0] transition-colors cursor-pointer ${
          compact ? 'min-h-[38px] px-2.5 text-xs' : 'min-h-[44px] px-3 text-xs sm:text-sm w-full'
        }`}
      >
        <span className="inline-flex items-center gap-2 min-w-0">
          <PlayerAvatar avatarId={avatarId} size={compact ? 22 : 26} />
          <span className="truncate">{currentAvatar.label}</span>
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          aria-hidden="true"
          className="text-[#6F5A4E] shrink-0"
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnchoredPopover
        open={open}
        onClose={() => setActiveOverlay(null)}
        anchorRef={btnRef}
        id="avatar-dropdown-popover"
        role="radiogroup"
        ariaLabel="Elige tu avatar"
        testId="avatar-dropdown-popover"
        maxWidth={360}
        preferPlacement="bottom-start"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-1.5">
            <span className="font-serif font-bold text-sm">Elige tu avatar (16)</span>
            <button
              type="button"
              onClick={() => {
                setActiveOverlay(null);
                btnRef.current?.focus();
              }}
              aria-label="Cerrar selector de avatar"
              className="px-2 py-1 rounded-lg bg-[#F7EEDF] text-xs font-bold text-[#6F5A4E] hover:text-[#3E2F2A] cursor-pointer inline-flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path
                  d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 max-h-[52dvh] overflow-y-auto">
            {PRESET_AVATARS.map((av) => {
              const active = avatarId === av.id;
              return (
                <button
                  key={av.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-testid={`avatar-option-${av.id}`}
                  onClick={() => {
                    void setAvatarId(av.id);
                    setActiveOverlay(null);
                    btnRef.current?.focus();
                  }}
                  title={av.label}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-transform cursor-pointer ${
                    active
                      ? 'bg-[#FEF6E0] border-[#C96F4A] ring-2 ring-[#C96F4A] scale-103'
                      : 'bg-[#F7EEDF]/75 border-[#3E2F2A]/10 hover:bg-[#F7EEDF]'
                  }`}
                >
                  <PlayerAvatar avatarId={av.id} size={28} />
                  <span className="text-[9px] font-bold truncate w-full text-center mt-1">
                    {av.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </AnchoredPopover>
    </div>
  );
}

/**
 * Keyboard & ARIA accessible Subtitles Dropdown (Mode + Visual Style) (P0.2)
 * Uses global activeOverlay === 'subtitles' and portal AnchoredPopover.
 */
function SubtitlesDropdownPicker({ compact = false }: { compact?: boolean }): React.ReactElement {
  const subtitleMode = useGameStore((s) => s.subtitleMode);
  const subtitleStyle = useGameStore((s) => s.subtitleStyle);
  const setSubtitleMode = useGameStore((s) => s.setSubtitleMode);
  const setSubtitleStyle = useGameStore((s) => s.setSubtitleStyle);
  const activeOverlay = useGameStore((s) => s.activeOverlay);
  const toggleOverlay = useGameStore((s) => s.toggleOverlay);
  const setActiveOverlay = useGameStore((s) => s.setActiveOverlay);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const open = activeOverlay === 'subtitles';

  const modeMeta = SUBTITLE_MODES.find((m) => m.id === subtitleMode) ?? {
    id: 'key' as const,
    label: 'Solo momentos clave',
    desc: '',
  };
  const styleMeta = SUBTITLE_STYLES.find((st) => st.id === subtitleStyle) ?? {
    id: 'comic' as const,
    label: 'Cómic',
    desc: '',
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        data-testid="subtitles-dropdown-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="subtitles-dropdown-popover"
        onClick={() => toggleOverlay('subtitles')}
        className={`inline-flex items-center justify-between gap-1.5 rounded-xl bg-[#F7EEDF] border border-[#231712]/20 text-[#3E2F2A] font-bold hover:bg-[#EAD9C0] transition-colors cursor-pointer ${
          compact ? 'min-h-[32px] px-2 py-1 text-xs' : 'min-h-[44px] px-3 text-xs w-full'
        }`}
      >
        <span className="truncate">
          {compact
            ? `Subtítulos: ${styleMeta.label}`
            : `Subtítulos: ${modeMeta.label} · ${styleMeta.label}`}
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          aria-hidden="true"
          className="text-[#6F5A4E] shrink-0"
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnchoredPopover
        open={open}
        onClose={() => setActiveOverlay(null)}
        anchorRef={btnRef}
        id="subtitles-dropdown-popover"
        role="dialog"
        ariaLabel="Configuración de subtítulos de eventos"
        testId="subtitles-dropdown-popover"
        maxWidth={340}
        preferPlacement="bottom-end"
      >
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-1.5">
            <span className="font-serif font-bold text-sm">Subtítulos de partida</span>
            <button
              type="button"
              onClick={() => {
                setActiveOverlay(null);
                btnRef.current?.focus();
              }}
              aria-label="Cerrar opciones de subtítulos"
              className="px-2 py-1 rounded-lg bg-[#F7EEDF] text-xs font-bold text-[#6F5A4E] hover:text-[#3E2F2A] cursor-pointer inline-flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path
                  d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-[11px] text-[#6F5A4E] block">Frecuencia</span>
            <div className="grid grid-cols-1 gap-1">
              {SUBTITLE_MODES.map((m) => {
                const active = subtitleMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    data-testid={`subtitle-mode-${m.id}`}
                    onClick={() => setSubtitleMode(m.id)}
                    className={`text-left px-2.5 py-1.5 rounded-xl border cursor-pointer flex items-center justify-between ${
                      active
                        ? 'bg-[#FEF6E0] border-[#C96F4A] font-bold'
                        : 'bg-[#F7EEDF]/70 border-[#3E2F2A]/10 hover:bg-[#F7EEDF]'
                    }`}
                  >
                    <span>{m.label}</span>
                    {active && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                        className="text-[#3F5E4A] shrink-0"
                      >
                        <path
                          d="M2.2 6.2L4.8 8.8L9.8 3.2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-[11px] text-[#6F5A4E] block">Estilo visual</span>
            <div className="grid grid-cols-3 gap-1.5">
              {SUBTITLE_STYLES.map((st) => {
                const active = subtitleStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    data-testid={`subtitle-style-${st.id}`}
                    onClick={() => setSubtitleStyle(st.id)}
                    className={`px-2 py-1.5 rounded-xl border text-center cursor-pointer ${
                      active
                        ? 'bg-[#FEF6E0] border-[#C96F4A] font-bold ring-1 ring-[#C96F4A]'
                        : 'bg-[#F7EEDF]/70 border-[#3E2F2A]/10 hover:bg-[#F7EEDF]'
                    }`}
                  >
                    <span className="block font-bold">{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </AnchoredPopover>
    </div>
  );
}

/**
 * Panoramic Layered Café Stage SVG:
 * Used both as the full-stage atmospheric backdrop and the interactive counter corner.
 * Includes arched window with golden sunbeams, swaying hanging plant, spinning vinyl turntable,
 * sleeping cat moving its tail, brass O & A plaque, espresso machine, and steaming cup.
 */
function CafeCornerIllustration({
  reducedMotion,
  parallax = { x: 0, y: 0 },
  compact = false,
}: {
  reducedMotion: boolean;
  parallax?: { x: number; y: number };
  compact?: boolean;
}): React.ReactElement {
  const bgTx = reducedMotion ? 0 : parallax.x * 2.5;
  const bgTy = reducedMotion ? 0 : parallax.y * 1.8;
  const midTx = reducedMotion ? 0 : parallax.x * 5;
  const midTy = reducedMotion ? 0 : parallax.y * 3.5;
  const fgTx = reducedMotion ? 0 : parallax.x * 7.5;
  const fgTy = reducedMotion ? 0 : parallax.y * 4.5;

  return (
    <svg
      viewBox="0 0 460 230"
      preserveAspectRatio={compact ? 'xMidYMid meet' : 'xMidYMid slice'}
      aria-hidden="true"
      className={
        compact
          ? 'w-full h-[104px] sm:h-[126px] rounded-2xl border-2 border-[#231712] bg-[#F2E3CA] shadow-[inset_0_2px_8px_rgba(35,23,18,0.12),0_3px_0_#231712] block'
          : 'w-full h-[192px] xl:h-[220px] rounded-[20px] border-2 border-[#231712] bg-[#F2E3CA] shadow-[inset_0_2px_10px_rgba(35,23,18,0.14),0_4px_0_#231712] block'
      }
    >
      <defs>
        <linearGradient id="cafeWallGradV8" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9EFE0" />
          <stop offset="68%" stopColor="#EAD6B8" />
          <stop offset="100%" stopColor="#DEC39E" />
        </linearGradient>
        <linearGradient id="windowSkyGradV8" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF2C2" />
          <stop offset="55%" stopColor="#F5C47E" />
          <stop offset="100%" stopColor="#D68C54" />
        </linearGradient>
        <linearGradient id="sunbeamGradV8" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF7D6" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#FFF7D6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* LAYER 1: Wallpaper, Wainscoting & Framed Prints */}
      <g transform={`translate(${bgTx}, ${bgTy})`}>
        <rect x="-16" y="-16" width="492" height="262" fill="url(#cafeWallGradV8)" />
        {/* Subtle vertical café wallpaper stripes */}
        {[30, 80, 130, 180, 230, 280, 330, 380, 430].map((x) => (
          <line
            key={x}
            x1={x}
            y1="0"
            x2={x}
            y2="156"
            stroke="#8B5E3C"
            strokeWidth="1"
            opacity="0.11"
          />
        ))}
        {/* Dark wood wainscoting paneling */}
        <rect x="-16" y="154" width="492" height="86" fill="#6E472B" opacity="0.28" />
        <line x1="-16" y1="154" x2="476" y2="154" stroke="#231712" strokeWidth="2.2" />
      </g>

      {/* LAYER 2: Arched Window, Sunbeams, Hanging Plant, Brass O & A Plaque, Turntable */}
      <g transform={`translate(${midTx}, ${midTy})`}>
        {/* Arched Café Window (Left) */}
        <g transform="translate(22, 14)">
          <path
            d="M0 128 L0 54 A62 52 0 0 1 124 54 L124 128 Z"
            fill="url(#windowSkyGradV8)"
            stroke="#231712"
            strokeWidth="3.4"
          />
          {/* Afternoon sun & European café rooftops */}
          <circle cx="88" cy="40" r="14" fill="#FFFDF4" opacity="0.9" />
          <path d="M4 126 L30 92 L58 126 Z" fill="#8C583A" opacity="0.42" />
          <path d="M44 126 L80 84 L120 126 Z" fill="#5C3A28" opacity="0.45" />
          {/* Window muntin bars */}
          <line x1="62" y1="3" x2="62" y2="128" stroke="#231712" strokeWidth="2.6" />
          <line x1="3" y1="68" x2="121" y2="68" stroke="#231712" strokeWidth="2.6" />

          {/* Diagonal golden afternoon sunbeam across the café room */}
          <polygon
            points="16,42 122,68 230,175 74,175"
            fill="url(#sunbeamGradV8)"
          />

          {/* Sleeping Cat on the windowsill with animated tail */}
          <g transform="translate(68, 106)">
            <ellipse cx="18" cy="12" rx="16" ry="8.5" fill="#2F211C" stroke="#231712" strokeWidth="1.5" />
            <circle cx="7" cy="10" r="7" fill="#2F211C" stroke="#231712" strokeWidth="1.5" />
            <polygon points="2,5 5,-1 9,5" fill="#2F211C" />
            <polygon points="8,5 12,-1 14,5" fill="#2F211C" />
            <path d="M4 10 Q6.5 12 9 10" stroke="#FFFDF8" strokeWidth="1.4" fill="none" />
            <path
              d="M31 14 Q41 16 37 23"
              stroke="#2F211C"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              className={reducedMotion ? '' : 'animate-cafe-tail'}
            />
          </g>

          {/* Wooden Windowsill */}
          <rect
            x="-6"
            y="125"
            width="136"
            height="7"
            rx="2.5"
            fill="#6E472B"
            stroke="#231712"
            strokeWidth="2.2"
          />
        </g>

        {/* Hanging Botanical Plant (Swaying gently) */}
        <g
          transform="translate(188, 0)"
          className={reducedMotion ? '' : 'animate-cafe-plant'}
        >
          <line x1="22" y1="0" x2="22" y2="26" stroke="#231712" strokeWidth="2" />
          <path
            d="M10 26 L34 26 L30 43 L14 43 Z"
            fill="#C86B46"
            stroke="#231712"
            strokeWidth="2"
          />
          <ellipse cx="7" cy="32" rx="9" ry="4.5" transform="rotate(-25 7 32)" fill="#3D5B47" stroke="#231712" strokeWidth="1.5" />
          <ellipse cx="37" cy="32" rx="9" ry="4.5" transform="rotate(25 37 32)" fill="#3D5B47" stroke="#231712" strokeWidth="1.5" />
          <ellipse cx="22" cy="23" rx="8" ry="4.5" fill="#4E735B" stroke="#231712" strokeWidth="1.5" />
          <path
            d="M16 43 Q9 56 14 70"
            stroke="#3D5B47"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="11" cy="56" r="4" fill="#3D5B47" stroke="#231712" strokeWidth="1.2" />
          <circle cx="14" cy="68" r="3.5" fill="#4E735B" stroke="#231712" strokeWidth="1.2" />
        </g>

        {/* Brass O & A Commemorative Plaque on the Café Wall */}
        <g transform="translate(182, 86)">
          <rect
            x="2"
            y="3"
            width="70"
            height="28"
            rx="5"
            fill="#231712"
            opacity="0.3"
          />
          <rect
            x="0"
            y="0"
            width="70"
            height="28"
            rx="5"
            fill="#FEF6E0"
            stroke="#231712"
            strokeWidth="2.2"
          />
          <rect
            x="3"
            y="3"
            width="64"
            height="22"
            rx="3"
            fill="none"
            stroke="#C8A12A"
            strokeWidth="1.8"
          />
          <circle cx="7" cy="14" r="1.5" fill="#C8A12A" />
          <circle cx="63" cy="14" r="1.5" fill="#C8A12A" />
          <text
            x="35"
            y="18"
            textAnchor="middle"
            fill="#231712"
            fontSize="11.5"
            fontFamily="Fraunces, serif"
            fontWeight="800"
          >
            O &amp; A
          </text>
        </g>

        {/* Wooden Shelf with Spinning Vinyl Turntable & Books (Right) */}
        <g transform="translate(292, 58)">
          {/* Books on left of shelf */}
          <rect x="2" y="28" width="11" height="28" rx="1.5" fill="#3D5B47" stroke="#231712" strokeWidth="1.8" />
          <rect x="13" y="24" width="12" height="32" rx="1.5" fill="#C86B46" stroke="#231712" strokeWidth="1.8" />
          {/* Turntable Wooden Plinth */}
          <rect
            x="32"
            y="38"
            width="94"
            height="18"
            rx="3.5"
            fill="#8C583A"
            stroke="#231712"
            strokeWidth="2.2"
          />
          {/* Spinning Vinyl Record Platter */}
          <g transform="translate(76, 33)">
            <ellipse
              cx="0"
              cy="0"
              rx="32"
              ry="9"
              fill="#231712"
              stroke="#3E2F2A"
              strokeWidth="1.5"
            />
            <ellipse cx="0" cy="0" rx="22" ry="6" fill="none" stroke="#FFFDF8" strokeWidth="0.7" opacity="0.35" />
            <ellipse cx="0" cy="0" rx="11" ry="3.2" fill="#C86B46" />
            <circle cx="0" cy="0" r="2" fill="#FFFDF8" />
          </g>
          {/* Brass Tonearm */}
          <line
            x1="112"
            y1="27"
            x2="88"
            y2="34"
            stroke="#C8A12A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Shelf plank */}
          <rect
            x="-6"
            y="56"
            width="148"
            height="7"
            rx="2.5"
            fill="#6E472B"
            stroke="#231712"
            strokeWidth="2.2"
          />
          {/* Hand-drawn SVG music notes */}
          <g
            transform="translate(52, 6)"
            className={reducedMotion ? '' : 'animate-cafe-steam'}
          >
            <circle cx="4" cy="12" r="3" fill="#C86B46" />
            <path d="M6.5 12 V2 L14 4 V7 L6.5 5" fill="#C86B46" stroke="#231712" strokeWidth="1.2" />
          </g>
          <g
            transform="translate(96, 2)"
            className={reducedMotion ? '' : 'animate-cafe-steam-delayed'}
          >
            <circle cx="4" cy="11" r="2.8" fill="#3D5B47" />
            <line x1="6.5" y1="11" x2="6.5" y2="2" stroke="#3D5B47" strokeWidth="2" />
          </g>
        </g>
      </g>

      {/* LAYER 3: Foreground Café Counter, Linen Runner & Steaming Cup */}
      <g transform={`translate(${fgTx}, ${fgTy})`}>
        <g transform="translate(0, 162)">
          {/* Polished wood bar counter top */}
          <path
            d="M-12 16 L472 16 L484 68 L-24 68 Z"
            fill="#7B5236"
            stroke="#231712"
            strokeWidth="2.6"
          />
          <line x1="0" y1="21" x2="460" y2="21" stroke="#FFFDF8" strokeWidth="1.5" opacity="0.28" />

          {/* Cream linen runner mat */}
          <path
            d="M124 20 L336 20 L348 64 L112 64 Z"
            fill="#FFFDF8"
            stroke="#231712"
            strokeWidth="2"
          />
          <path
            d="M130 24 L330 24 L340 60 L120 60 Z"
            fill="none"
            stroke="#C8A12A"
            strokeWidth="1.4"
            strokeDasharray="5 3"
          />

          {/* Croissant on small plate (Left of cup) */}
          <g transform="translate(158, 38)">
            <ellipse cx="0" cy="7" rx="18" ry="5.5" fill="#FFFDF8" stroke="#231712" strokeWidth="1.8" />
            <path
              d="M-11 5 Q-8 -4 0 -4 Q8 -4 11 5 Q6 8 3 3 Q0 1 -3 3 Q-6 8 -11 5 Z"
              fill="#D69B43"
              stroke="#231712"
              strokeWidth="1.8"
            />
          </g>

          {/* Steaming Porcelain Espresso Cup (Center-Right) */}
          <g transform="translate(248, 8)">
            <path
              d="M-7 -4 Q-12 -16 -4 -26"
              stroke="#FFFDF8"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
              className={reducedMotion ? '' : 'animate-cafe-steam'}
            />
            <path
              d="M5 -2 Q10 -14 3 -24"
              stroke="#FFFDF8"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              className={reducedMotion ? '' : 'animate-cafe-steam-delayed'}
            />
            <ellipse
              cx="0"
              cy="30"
              rx="25"
              ry="7"
              fill="#FFFDF8"
              stroke="#231712"
              strokeWidth="2"
            />
            <path
              d="M-16 10 L16 10 L12 28 C12 32 -12 32 -12 28 Z"
              fill="#C86B46"
              stroke="#231712"
              strokeWidth="2.2"
            />
            <ellipse
              cx="0"
              cy="10"
              rx="16"
              ry="4.2"
              fill="#2F211C"
              stroke="#231712"
              strokeWidth="1.8"
            />
            <path
              d="M15 13 C23 13 23 24 14 24"
              stroke="#C86B46"
              strokeWidth="3.2"
              fill="none"
            />
            <path
              d="M15 13 C23 13 23 24 14 24"
              stroke="#231712"
              strokeWidth="1.4"
              fill="none"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

export function TitleScreen(): React.ReactElement {
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const avatarId = useGameStore((s) => s.avatarId);
  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const quickStartWithBots = useGameStore((s) => s.quickStartWithBots);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const toggleOverlay = useGameStore((s) => s.toggleOverlay);
  const errorBanner = useGameStore((s) => s.errorBanner);
  const isBusy = useGameStore((s) => s.isBusy);
  const reducedMotion = useGameStore((s) => s.reducedMotion);

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [parallax, setParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % CAFE_DAILY_PHRASES.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const greetingText = useMemo(() => getCafeGreeting(nickname), [nickname]);
  const dailyPhrase = CAFE_DAILY_PHRASES[phraseIndex] ?? CAFE_DAILY_PHRASES[0];
  const currentAvatar =
    PRESET_AVATARS.find((a) => a.id === avatarId) ?? {
      id: 'espresso',
      label: 'Taza Espresso',
      bg: '#C96F4A',
      kind: 'icon' as const,
    };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setParallax({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) });
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setParallax({ x: 0, y: 0 })}
      className="relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between select-none"
      data-testid="title-screen"
    >
      {/* FULL-STAGE ARCHITECTURAL CAFÉ BACKDROP (Envelops the entire viewport on 1280/1920 & mobile) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full block"
        >
          <defs>
            <linearGradient id="stageRoomWallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EFE0C6" />
              <stop offset="62%" stopColor="#E4CEAC" />
              <stop offset="100%" stopColor="#D3B48C" />
            </linearGradient>
            <radialGradient id="lampGlowGrad" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#FFF6D1" stopOpacity="0.78" />
              <stop offset="55%" stopColor="#F9DF9B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F9DF9B" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="stageWindowSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF4C9" />
              <stop offset="60%" stopColor="#F4C37E" />
              <stop offset="100%" stopColor="#D88D56" />
            </linearGradient>
          </defs>

          {/* Warm afternoon plaster wall */}
          <rect x="0" y="0" width="1600" height="900" fill="url(#stageRoomWallGrad)" />

          {/* Subtle vintage café wallpaper stripes */}
          {[
            80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960, 1040, 1120, 1200, 1280,
            1360, 1440, 1520,
          ].map((x) => (
            <line
              key={x}
              x1={x}
              y1="0"
              x2={x}
              y2="620"
              stroke="#7B5236"
              strokeWidth="1.5"
              opacity="0.09"
            />
          ))}

          {/* Top wooden crown molding beam */}
          <rect x="0" y="0" width="1600" height="22" fill="#5A3A26" />
          <line x1="0" y1="22" x2="1600" y2="22" stroke="#231712" strokeWidth="3" />

          {/* Left Panoramic Arched Café Window & Golden Afternoon Sunbeam */}
          <g transform="translate(56, 88)" opacity="0.88">
            <path
              d="M0 440 L0 160 A165 145 0 0 1 330 160 L330 440 Z"
              fill="url(#stageWindowSky)"
              stroke="#231712"
              strokeWidth="5"
            />
            <circle cx="235" cy="115" r="36" fill="#FFFDF6" opacity="0.85" />
            <line x1="165" y1="15" x2="165" y2="440" stroke="#231712" strokeWidth="4" />
            <line x1="0" y1="210" x2="330" y2="210" stroke="#231712" strokeWidth="4" />
            <line x1="0" y1="330" x2="330" y2="330" stroke="#231712" strokeWidth="3.5" />
            <rect
              x="-14"
              y="436"
              width="358"
              height="16"
              rx="5"
              fill="#6E472B"
              stroke="#231712"
              strokeWidth="3.5"
            />
            {/* Diagonal sunbeam across the room */}
            <polygon
              points="30,120 325,205 780,620 210,620"
              fill="#FFF8DC"
               opacity="0.22"
            />
          </g>

          {/* Right Café Wall Wooden Shelves with Coffee Canisters, Carafe & Framed Prints */}
          <g transform="translate(1190, 128)" opacity="0.88">
            {/* Framed botanical & coffee press prints */}
            <rect
              x="20"
              y="0"
              width="110"
              height="138"
              rx="8"
              fill="#FFFDF8"
              stroke="#231712"
              strokeWidth="3.5"
            />
            <rect
              x="32"
              y="12"
              width="86"
              height="114"
              rx="4"
              fill="#F3E5CE"
              stroke="#C8A12A"
              strokeWidth="2"
            />
            <circle cx="75" cy="68" r="24" fill="#C86B46" opacity="0.85" />
            <path d="M62 82 Q75 50 88 82" stroke="#231712" strokeWidth="3" fill="none" />

            <rect
              x="156"
              y="18"
              width="124"
              height="120"
              rx="8"
              fill="#FFFDF8"
              stroke="#231712"
              strokeWidth="3.5"
            />
            <rect
              x="168"
              y="30"
              width="100"
              height="96"
              rx="4"
              fill="#E9F0E8"
              stroke="#3D5B47"
              strokeWidth="2"
            />
            <ellipse cx="218" cy="78" rx="28" ry="15" fill="#3D5B47" opacity="0.75" />

            {/* Lower wooden shelf with brass espresso tins */}
            <rect x="40" y="218" width="42" height="54" rx="5" fill="#C86B46" stroke="#231712" strokeWidth="3" />
            <rect x="92" y="206" width="46" height="66" rx="5" fill="#3D5B47" stroke="#231712" strokeWidth="3" />
            <rect x="150" y="224" width="38" height="48" rx="5" fill="#C8A12A" stroke="#231712" strokeWidth="3" />
            <rect
              x="0"
              y="272"
              width="310"
              height="14"
              rx="4"
              fill="#6E472B"
              stroke="#231712"
              strokeWidth="3.5"
            />
          </g>

          {/* Three Hanging Warm Brass & Milk-Glass Café Pendant Lamps */}
          {[310, 800, 1290].map((lx, idx) => (
            <g key={lx} transform={`translate(${lx}, 0)`}>
              <circle cx="0" cy="180" r={idx === 1 ? 260 : 210} fill="url(#lampGlowGrad)" />
              <line x1="0" y1="22" x2="0" y2={idx === 1 ? 94 : 112} stroke="#231712" strokeWidth="3.5" />
              <path
                d={`M-38 ${idx === 1 ? 118 : 136} Q0 ${idx === 1 ? 82 : 100} 38 ${idx === 1 ? 118 : 136} Z`}
                fill="#C8A12A"
                stroke="#231712"
                strokeWidth="3"
              />
              <ellipse
                cx="0"
                cy={idx === 1 ? 122 : 140}
                rx="22"
                ry="9"
                fill="#FFFDF4"
                stroke="#231712"
                strokeWidth="2.5"
              />
            </g>
          ))}

          {/* Carved Wood Wainscoting & Continuous Café Bar Horizon Across Bottom */}
          <rect x="0" y="610" width="1600" height="290" fill="#6E472B" />
          <rect x="0" y="610" width="1600" height="18" fill="#8C583A" stroke="#231712" strokeWidth="3" />
          <line x1="0" y1="615" x2="1600" y2="615" stroke="#C8A12A" strokeWidth="2" opacity="0.65" />
          {[120, 340, 560, 780, 1000, 1220, 1440].map((px) => (
            <rect
              key={px}
              x={px - 80}
              y="646"
              width="160"
              height="210"
              rx="8"
              fill="#5A3A26"
              stroke="#231712"
              strokeWidth="2.5"
              opacity="0.65"
            />
          ))}
        </svg>
      </div>

      {/* Top Café Awning & Chalkboard Header */}
      <header className="relative z-10 shrink-0 w-full max-w-6xl mx-auto px-3 pt-1.5 sm:px-6 sm:pt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 bg-[#FFFDF8]/92 px-3 py-1 rounded-2xl border-2 border-[#231712] shadow-[0_3px_0_#231712]">
          <CafetuliaLogo compact />
          <span className="hidden md:inline-block text-xs text-[#5A453B] font-semibold border-l-2 border-[#231712]/20 pl-2.5">
            Salón de té y tertulia internacional · O &amp; A
          </span>
        </div>

        {/* Hanging Slate Chalkboard with Daily Phrase */}
        <button
          type="button"
          data-testid="title-daily-phrase"
          onClick={() => {
            soundEngine.playSfx('uiToggle');
            setPhraseIndex((prev) => (prev + 1) % CAFE_DAILY_PHRASES.length);
          }}
          title="Cambiar nota de la pizarra del día"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#261B16] text-[#FEF6E0] border-2 border-[#C8A12A] shadow-[0_3px_0_#140D0B] text-[11px] sm:text-xs font-serif italic hover:bg-[#34251F] active:translate-y-0.5 transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#C8A12A] shrink-0" aria-hidden="true" />
          <span>«{dailyPhrase}»</span>
        </button>
      </header>

      {/* Main Stage Content: Integrated Counter Scene + Unfolded Printed Café Menu Sheet */}
      <div className="relative z-10 my-auto w-full max-w-6xl mx-auto px-3 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-5 items-center min-h-0">
        {/* Left / Top Column (lg:col-span-5): Living Café Corner + Protagonist Seated at the Bar */}
        <section
          data-testid="title-cafe-scene"
          aria-label="Escena del salón de Cafetulia"
          className="lg:col-span-5 rounded-[22px] border-2 border-[#231712] bg-[#3A261D] text-[#FFFDF8] shadow-[0_8px_0_#1E130E,0_16px_28px_rgba(35,23,18,0.28)] p-2 sm:p-3.5 flex flex-col justify-between gap-2"
        >
          {/* Full Café Scene on both desktop and mobile (gives real scene weight on mobile) */}
          <div className="w-full relative">
            <div className="hidden sm:block">
              <CafeCornerIllustration
                reducedMotion={reducedMotion}
                parallax={parallax}
                compact={false}
              />
            </div>
            <div className="block sm:hidden">
              <CafeCornerIllustration
                reducedMotion={reducedMotion}
                parallax={parallax}
                compact
              />
            </div>
            <span className="pointer-events-none absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#231712]/85 text-[#FEF6E0] border border-[#C8A12A] text-[9px] font-serif italic">
              Rincón O &amp; A
            </span>
          </div>

          {/* Seated Protagonist Avatar at the Counter + Time-of-Day Greeting */}
          <div className="bg-[#FFFDF8] text-[#231712] p-2 sm:p-2.5 rounded-2xl border-2 border-[#231712] shadow-[0_3px_0_#231712] flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              data-testid="title-hero-avatar"
              onClick={() => {
                soundEngine.unlock();
                toggleOverlay('avatar');
              }}
              aria-label={`Cambiar avatar actual (${currentAvatar.label})`}
              title="Pulsa para cambiar tu avatar"
              className="relative group shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-[#FEF6E0] border-2 border-[#231712] shadow-[0_3px_0_#231712] flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0.5 transition-transform cursor-pointer focus:outline-2 focus:outline-[#C86B46]"
            >
              <PlayerAvatar avatarId={avatarId} size={38} />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-[#C86B46] text-[#FFFDF8] text-[9px] font-extrabold border border-[#231712]">
                Ficha
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C86B46]">
                  Tu sitio en la barra
                </span>
                <span className="text-[10px] font-serif italic text-[#6C564A]">
                  · Café servido
                </span>
              </div>
              <h1
                data-testid="title-greeting"
                className="font-serif font-bold text-sm sm:text-lg text-[#231712] leading-tight truncate"
              >
                {greetingText}
              </h1>
              <p className="text-[11px] text-[#6C564A] truncate">
                Sienta parejas de 12 naciones sin desbordar la barra.
              </p>
            </div>
          </div>

          {/* Guest Registry Tag (Nickname + Avatar & Subtitles Pickers) */}
          <div className="space-y-1.5 pt-1 border-t border-dashed border-[#FFFDF8]/20">
            <div className="flex items-center gap-2">
              <label
                htmlFor="nickname-input"
                className="text-[11px] font-extrabold uppercase tracking-wide text-[#F5E6CE] shrink-0"
              >
                Reserva a nombre de:
              </label>
              <input
                id="nickname-input"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Tu apodo en la mesa"
                maxLength={24}
                className="flex-1 min-h-[36px] sm:min-h-[40px] px-2.5 rounded-xl bg-[#FFFDF8] border-2 border-[#231712] text-xs sm:text-sm text-[#231712] font-bold focus:outline-2 focus:outline-[#C86B46]"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <AvatarDropdownPicker compact />
              <SubtitlesDropdownPicker compact />
            </div>
          </div>
        </section>

        {/* Right / Bottom Column (lg:col-span-7): Printed Café Menu Sheet ("Carta de la Casa") */}
        <section
          data-testid="title-menu-card"
          aria-label="Carta de menú del café"
          className="lg:col-span-7 relative cafe-paper-sheet cafe-double-frame rounded-[22px] border-2 border-[#231712] p-2.5 sm:p-5 flex flex-col justify-between gap-1.5 sm:gap-3 lg:rotate-[0.35deg]"
        >
          {/* Decorative Brass Menu Clip at Top Center */}
          <div
            aria-hidden="true"
            className="hidden sm:flex absolute -top-2.5 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-[#C8A12A] border-2 border-[#231712] shadow-[0_2px_0_#231712] items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#231712]" />
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#231712]">
              Menú de salón
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#231712]" />
          </div>

          {/* Editorial Double-Rule Menu Header */}
          <div className="flex items-center justify-between cafe-double-rule pb-1.5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C86B46] block">
                Carta de la casa · Imprenta O &amp; A
              </span>
              <h2 className="font-serif font-bold text-base sm:text-2xl text-[#231712] leading-tight">
                Especialidades de mesa
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#FEF6E0] border-2 border-[#231712] shadow-[2px_2px_0_#231712] text-[10px] font-extrabold uppercase tracking-wider text-[#231712] -rotate-2">
              2–4 comensales
            </span>
          </div>

          {errorBanner && (
            <div
              role="alert"
              className="p-2 rounded-xl bg-[#FDECEB] border-2 border-[#A63F34] text-xs font-bold text-[#A63F34]"
            >
              {errorBanner}
            </div>
          )}

          {/* Featured Dish #1 (Protagonist CTA): Jugar contra bot */}
          <button
            type="button"
            data-start="true"
            data-testid="quick-start-btn"
            disabled={isBusy}
            onMouseEnter={() => soundEngine.playHover()}
            onClick={() => {
              soundEngine.unlock();
              void quickStartWithBots(1, 'medium');
            }}
            className="group relative overflow-hidden w-full min-h-[50px] sm:min-h-[66px] px-3.5 py-1.5 sm:py-2 rounded-2xl cafe-btn-primary cursor-pointer disabled:opacity-50 text-left flex items-center justify-between gap-3 focus:outline-2 focus:outline-[#231712]"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Hand-drawn steaming cup icon that lifts on hover */}
              <span
                aria-hidden="true"
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-[#231712]/20 border border-[#FFFDF8]/40 flex items-center justify-center shrink-0 group-hover:-translate-y-0.5 group-hover:rotate-[-4deg] transition-transform"
              >
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path
                    d="M9 3.5 C8 5.5 10.5 6.5 9.5 8.5 M14.5 3 C13.5 5 16 6 15 8"
                    stroke="#FFFDF8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 10.5 H19 L17.5 19.5 C17 22 14.5 23 12 23 C9.5 23 7 22 6.5 19.5 Z"
                    fill="#FFFDF8"
                    stroke="#231712"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 12 H21.5 C23.2 12 24 13.2 24 14.8 C24 16.4 23.2 17.5 21.5 17.5 H18.2"
                    stroke="#FFFDF8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <line x1="3.5" y1="24.5" x2="20.5" y2="24.5" stroke="#FFFDF8" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFFDF8]/90 block">
                  Recomendación del maître · Partida inmediata
                </span>
                <span className="block font-serif font-extrabold text-sm sm:text-xl leading-tight">
                  Jugar contra bot
                </span>
                <span className="block text-[10px] sm:text-[11px] text-[#FFFDF8]/90 truncate">
                  Mesa lista al instante con un autómata de la casa
                </span>
              </span>
            </div>

            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-[#231712] text-[#FEF6E0] font-serif font-bold text-xs border border-[#C8A12A] shrink-0 group-hover:scale-105 transition-transform">
              Servir →
            </span>
          </button>

          {/* Secondary Dishes Row: Crear sala + Unirse con código */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-2 items-stretch">
            {/* Dish #2: Crear sala */}
            <button
              type="button"
              data-testid="create-room-btn"
              disabled={isBusy}
              onMouseEnter={() => soundEngine.playHover()}
              onClick={() => {
                soundEngine.unlock();
                void createRoom();
              }}
              className="sm:col-span-5 group w-full min-h-[44px] sm:min-h-[56px] px-3 py-1.5 sm:py-2 rounded-2xl cafe-btn-paper cursor-pointer disabled:opacity-50 text-left flex items-center gap-2.5 focus:outline-2 focus:outline-[#C86B46]"
            >
              <span
                aria-hidden="true"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FEF6E0] border-2 border-[#231712] flex items-center justify-center shrink-0 text-[#C86B46] group-hover:rotate-3 transition-transform"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 18 L9 6 L15 6 L20 18 Z"
                    fill="#FFFDF8"
                    stroke="#231712"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path d="M9 12 H15" stroke="#C86B46" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="2" y1="19" x2="22" y2="19" stroke="#231712" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif font-bold text-xs sm:text-base text-[#231712] leading-tight">
                  Crear sala
                </span>
                <span className="block text-[10px] sm:text-[11px] text-[#6C564A] truncate">
                  Reserva mesa privada
                </span>
              </span>
            </button>

            {/* Dish #3: Unirse con código (Perforated Paper Ticket) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                soundEngine.unlock();
                void joinRoom(joinCodeInput, false);
              }}
              className="sm:col-span-7 cafe-paper-subpanel px-2.5 py-1 rounded-2xl border-2 border-[#231712] flex items-center gap-2"
            >
              <span
                aria-hidden="true"
                className="w-8 h-8 rounded-xl bg-[#FFFDF8] border-2 border-[#231712] flex items-center justify-center text-[#3D5B47] shrink-0"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="7.5" cy="12" r="4" stroke="currentColor" strokeWidth="2.2" />
                  <path
                    d="M11.5 12 H21 M18 12 V15.5 M15 12 V14.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                id="room-code-input"
                type="text"
                aria-label="Código de sala"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                maxLength={8}
                className="min-w-0 flex-1 min-h-[38px] sm:min-h-[42px] px-2.5 rounded-xl bg-[#FFFDF8] border-2 border-[#231712]/35 text-xs sm:text-sm text-[#231712] font-mono font-extrabold uppercase tracking-wider focus:outline-2 focus:outline-[#C86B46]"
              />
              <button
                type="submit"
                data-testid="join-room-btn"
                disabled={isBusy}
                onMouseEnter={() => soundEngine.playHover()}
                className="px-3.5 min-h-[44px] rounded-xl cafe-btn-sage font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-1 shrink-0"
              >
                <span>Unirse</span>
              </button>
            </form>
          </div>

          {/* Menu Footer Strip: Tutorial, Reglas, Ajustes with custom ink-line SVGs */}
          <div className="grid grid-cols-3 gap-2 pt-1.5 border-t-2 border-dashed border-[#231712]/20">
            <button
              type="button"
              data-testid="title-tutorial-btn"
              onMouseEnter={() => soundEngine.playHover()}
              onClick={() => setActiveModal('tutorial')}
              className="min-h-[44px] px-2.5 py-1 rounded-xl cafe-btn-paper cursor-pointer flex items-center gap-2 text-left"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="text-[#C86B46] shrink-0"
              >
                <path
                  d="M3 5.5 C3 4.5 4 4 5.5 4 H11 V19 H5.5 C4 19 3 19.5 3 20.5 Z M21 5.5 C21 4.5 20 4 18.5 4 H13 V19 H18.5 C20 19 21 19.5 21 20.5 Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="min-w-0">
                <span className="block text-xs font-extrabold text-[#231712] truncate">Tutorial</span>
                <span className="hidden sm:block text-[10px] text-[#6C564A] truncate">
                  3 pasos en mesa
                </span>
              </span>
            </button>

            <button
              type="button"
              data-testid="title-rules-btn"
              onMouseEnter={() => soundEngine.playHover()}
              onClick={() => setActiveModal('rules')}
              className="min-h-[44px] px-2.5 py-1 rounded-xl cafe-btn-paper cursor-pointer flex items-center gap-2 text-left"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="text-[#3D5B47] shrink-0"
              >
                <rect x="5" y="3.5" width="14" height="17" rx="2.5" stroke="currentColor" strokeWidth="2" />
                <path d="M8.5 8 H15.5 M8.5 12 H15.5 M8.5 16 H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="min-w-0">
                <span className="block text-xs font-extrabold text-[#231712] truncate">Reglas</span>
                <span className="hidden sm:block text-[10px] text-[#6C564A] truncate">
                  Manual ilustrado
                </span>
              </span>
            </button>

            <button
              type="button"
              data-testid="title-settings-btn"
              onMouseEnter={() => soundEngine.playHover()}
              onClick={() => setActiveModal('settings')}
              className="min-h-[44px] px-2.5 py-1 rounded-xl cafe-btn-paper cursor-pointer flex items-center gap-2 text-left"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="text-[#7B5236] shrink-0"
              >
                <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <path d="M12 12 L15.5 8.5 M7 16 H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="min-w-0">
                <span className="block text-xs font-extrabold text-[#231712] truncate">Ajustes</span>
                <span className="hidden sm:block text-[10px] text-[#6C564A] truncate">
                  Sonido y vista
                </span>
              </span>
            </button>
          </div>
        </section>
      </div>

      {/* Minimal café print footer */}
      <footer className="relative z-10 shrink-0 text-center text-[11px] font-semibold text-[#FEF6E0] drop-shadow-[0_1px_1px_rgba(35,23,18,0.85)] pb-1">
        100 fichas de cartón · Manos a la vista · Pulsa Enter para servir mesa rápida
      </footer>
    </div>
  );
}

export function LobbyScreen(): React.ReactElement {
  const snapshot = useGameStore((s) => s.snapshot);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const updateRoomConfig = useGameStore((s) => s.updateRoomConfig);
  const toggleReady = useGameStore((s) => s.toggleReady);
  const addBot = useGameStore((s) => s.addBot);
  const removeBot = useGameStore((s) => s.removeBot);
  const startGame = useGameStore((s) => s.startGame);
  const leaveRoom = useGameStore((s) => s.leaveRoom);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const errorBanner = useGameStore((s) => s.errorBanner);

  const [copied, setCopied] = useState(false);
  const [botDiff, setBotDiff] = useState<'basic' | 'medium' | 'hard'>('medium');

  if (!snapshot) return <div />;

  const isHost = snapshot.hostId === myPlayerId;
  const me = snapshot.members.find((m) => m.id === myPlayerId);
  const activeSeatMembers = snapshot.members.filter(
    (m) => m.role === 'player' || m.role === 'bot',
  );

  const copyInvite = async () => {
    soundEngine.playSfx('uiCopy');
    const url = `${window.location.origin}/?room=${snapshot.code}`;
    let copiedOk = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        copiedOk = true;
      }
    } catch {
      copiedOk = false;
    }
    if (!copiedOk) {
      try {
        const area = document.createElement('textarea');
        area.value = url;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        copiedOk = document.execCommand('copy');
        area.remove();
      } catch {
        copiedOk = false;
      }
    }
    if (copiedOk) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const chairSlots = [0, 1, 2, 3].map((idx) => {
    const member = activeSeatMembers[idx] ?? null;
    const isLocked = idx >= snapshot.config.maxPlayers;
    return { idx, member, isLocked };
  });

  const currentTimerVal = snapshot.config.timerEnabled ? snapshot.config.timerSeconds : 0;

  return (
    <div
      className="relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden p-2 sm:p-5 max-w-6xl mx-auto flex flex-col justify-center select-none"
      data-testid="lobby-screen"
    >
      <div className="cafe-paper-sheet cafe-double-frame rounded-[24px] border-2 border-[#231712] p-3 sm:p-5 flex flex-col justify-between max-h-[96dvh] overflow-hidden gap-2.5">
        {/* Top Lobby Bar: Paper Napkin Room Code Card + Quick Actions */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 cafe-double-rule pb-2">
          {/* Paper Napkin / Coaster Room Code Card with folded corner */}
          <div
            data-testid="lobby-napkin-code"
            className="group relative flex items-center gap-3 bg-[#FEF6E0] px-3.5 py-1.5 rounded-2xl border-2 border-[#231712] shadow-[3px_3px_0_#231712] -rotate-1 hover:rotate-0 transition-transform"
          >
            {/* Napkin inner stitch border */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-1 rounded-xl border border-dashed border-[#C8A12A]"
            />
            <div className="relative z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7B5236] block">
                Servilleta de reserva
              </span>
              <div className="flex items-center gap-2.5">
                <h1 className="font-mono font-extrabold text-xl sm:text-2xl text-[#231712] tracking-wider leading-none">
                  #{snapshot.code}
                </h1>
                <button
                  type="button"
                  data-testid="lobby-copy-code-btn"
                  onClick={() => void copyInvite()}
                  className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-extrabold border-2 cursor-pointer inline-flex items-center gap-1.5 ${
                    copied
                      ? 'bg-[#3D5B47] text-[#FFFDF8] border-[#231712] shadow-[0_2px_0_#231712]'
                      : 'bg-[#FFFDF8] text-[#231712] border-[#231712] shadow-[0_2px_0_#231712] hover:bg-[#EAD8BE]'
                  }`}
                >
                  {copied ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M2.2 6.2L4.8 8.8L9.8 3.2"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M3 11V3h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  )}
                  <span>{copied ? 'Sello copiado' : 'Copiar invitación'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <AvatarDropdownPicker compact />
            <button
              type="button"
              onClick={() => setActiveModal('settings')}
              className="min-h-[38px] px-3 py-1.5 rounded-xl cafe-btn-paper text-xs font-bold cursor-pointer"
            >
              Ajustes
            </button>
            <button
              type="button"
              onClick={leaveRoom}
              className="min-h-[38px] px-3 py-1.5 rounded-xl border-2 border-[#A63F34]/40 bg-[#FDECEB] text-xs font-extrabold text-[#A63F34] hover:bg-[#F9D7D5] cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>

        {errorBanner && (
          <div
            role="alert"
            className="shrink-0 p-2 rounded-xl bg-[#FDECEB] border-2 border-[#A63F34] text-xs font-bold text-[#A63F34]"
          >
            {errorBanner}
          </div>
        )}

        {/* Center 2-column grid: Visual Prepared 4-Chair Café Table + Tactile Room Controls */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-y-auto pr-0.5 items-stretch">
          {/* Left 7 cols: Visual Round Café Table with 4 Physical Chairs Around the Tablecloth */}
          <div
            data-testid="lobby-table-scene"
            className="lg:col-span-7 cafe-paper-subpanel p-3 sm:p-4 rounded-2xl border-2 border-[#231712]/25 flex flex-col justify-between gap-2.5 relative overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
              <div>
                <h2 className="font-serif font-bold text-sm sm:text-lg text-[#231712]">
                  Mesa preparada ({activeSeatMembers.length}/{snapshot.config.maxPlayers} comensales)
                </h2>
                <p className="text-[11px] text-[#6C564A]">
                  Toma asiento alrededor del mantel bordado antes de tocar la campana.
                </p>
              </div>

              {isHost && activeSeatMembers.length < snapshot.config.maxPlayers && (
                <div className="flex items-center gap-1 bg-[#FFFDF8] p-1 rounded-xl border-2 border-[#231712] shadow-[0_2px_0_#231712]">
                  {(['basic', 'medium', 'hard'] as const).map((diff) => {
                    const label =
                      diff === 'basic' ? 'Básico' : diff === 'medium' ? 'Medio' : 'Difícil';
                    const active = botDiff === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => {
                          soundEngine.playSfx('uiToggle');
                          setBotDiff(diff);
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer ${
                          active
                            ? 'bg-[#231712] text-[#FFFDF8]'
                            : 'text-[#6C564A] hover:text-[#231712]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    data-testid="add-bot-btn"
                    onClick={() => void addBot(botDiff)}
                    className="ml-1 px-2.5 py-1 min-h-[32px] rounded-lg cafe-btn-sage text-xs font-extrabold cursor-pointer"
                  >
                    + Bot
                  </button>
                </div>
              )}
            </div>

            {/* VISUAL CAFÉ TABLE STAGE: 3-column grid [Left Chairs | Unobstructed Central Round Table | Right Chairs] */}
            <div className="relative py-2 my-auto grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 items-center">
              {/* Central Illustrated Round Café Table with Embroidered Linen Tablecloth (Unobstructed in center col) */}
              <div
                aria-hidden="true"
                className="pointer-events-none hidden sm:flex sm:col-span-4 sm:col-start-5 sm:row-start-1 sm:row-span-2 flex-col items-center justify-center py-1"
              >
                <div className="relative w-38 h-38 xl:w-44 xl:h-44 rounded-full bg-[#7B5236] border-[3px] border-[#231712] shadow-[0_10px_22px_rgba(35,23,18,0.28),0_4px_0_#231712] flex items-center justify-center">
                  {/* Four wooden chair-connector arms extending toward the 4 seats */}
                  <span className="absolute -left-3 top-6 w-4 h-3 rounded-l-full bg-[#5A3A26] border-2 border-[#231712]" />
                  <span className="absolute -right-3 top-6 w-4 h-3 rounded-r-full bg-[#5A3A26] border-2 border-[#231712]" />
                  <span className="absolute -left-3 bottom-6 w-4 h-3 rounded-l-full bg-[#5A3A26] border-2 border-[#231712]" />
                  <span className="absolute -right-3 bottom-6 w-4 h-3 rounded-r-full bg-[#5A3A26] border-2 border-[#231712]" />

                  {/* Cream embroidered linen tablecloth */}
                  <div className="w-[84%] h-[84%] rounded-full bg-[#FFFDF8] border-2 border-[#231712] flex flex-col items-center justify-center relative shadow-inner">
                    <span className="absolute inset-1.5 rounded-full border border-dashed border-[#C86B46]/65" />
                    {/* Centerpiece Porcelain Service & 4 Cups Oriented Toward the 4 Chairs */}
                    <svg width="110" height="110" viewBox="0 0 100 100" fill="none" className="w-[82%] h-[82%]">
                      <circle cx="50" cy="50" r="36" fill="#FEF6E0" stroke="#C8A12A" strokeWidth="1.8" />
                      {/* 4 place-setting cups & saucers oriented toward the 4 chairs */}
                      {[
                        { cx: 24, cy: 26, occupied: Boolean(chairSlots[0]?.member) },
                        { cx: 76, cy: 26, occupied: Boolean(chairSlots[1]?.member) },
                        { cx: 24, cy: 74, occupied: Boolean(chairSlots[2]?.member) },
                        { cx: 76, cy: 74, occupied: Boolean(chairSlots[3]?.member) },
                      ].map((cup, cIdx) => (
                        <g key={cIdx} transform={`translate(${cup.cx}, ${cup.cy})`}>
                          <circle
                            cx="0"
                            cy="0"
                            r="9"
                            fill="#FFFDF8"
                            stroke="#231712"
                            strokeWidth="1.8"
                          />
                          <circle
                            cx="0"
                            cy="0"
                            r="5.5"
                            fill={cup.occupied ? '#3A241B' : '#EAD9C0'}
                            stroke="#231712"
                            strokeWidth="1.4"
                          />
                        </g>
                      ))}
                      {/* Small plate with croissant at top & bottom */}
                      <ellipse cx="50" cy="20" rx="8" ry="4.5" fill="#D69B43" stroke="#231712" strokeWidth="1.4" />
                      <ellipse cx="50" cy="80" rx="8" ry="4.5" fill="#D69B43" stroke="#231712" strokeWidth="1.4" />
                      {/* Center brass O & A emblem */}
                      <rect
                        x="30"
                        y="40"
                        width="40"
                        height="20"
                        rx="5"
                        fill="#231712"
                        stroke="#C8A12A"
                        strokeWidth="1.8"
                      />
                      <text
                        x="50"
                        y="53"
                        textAnchor="middle"
                        fill="#FEF6E0"
                        fontSize="10.5"
                        fontFamily="Fraunces, serif"
                        fontWeight="800"
                      >
                        O &amp; A
                      </text>
                    </svg>
                  </div>
                </div>
                <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF6E0] border border-[#231712]/40 text-[10px] font-serif italic text-[#5A453B]">
                  Mesa de tertulia · {activeSeatMembers.length}/{snapshot.config.maxPlayers}
                </span>
              </div>

              {/* 4 Physical Café Chairs Positioned Left (0, 2) and Right (1, 3) of the Round Table */}
              {chairSlots.map(({ idx, member, isLocked }) => {
                const isMe = member?.id === myPlayerId;
                const isBot = member?.role === 'bot';
                const gridPosClass =
                  idx === 0
                    ? 'sm:col-span-4 sm:col-start-1 sm:row-start-1'
                    : idx === 1
                      ? 'sm:col-span-4 sm:col-start-9 sm:row-start-1'
                      : idx === 2
                        ? 'sm:col-span-4 sm:col-start-1 sm:row-start-2'
                        : 'sm:col-span-4 sm:col-start-9 sm:row-start-2';

                return (
                  <motion.div
                    key={member ? member.id : `empty-seat-${idx}`}
                    data-testid={`lobby-seat-${idx}`}
                    initial={
                      reducedMotion || !member
                        ? false
                        : { scale: 0.9, opacity: 0, y: isBot ? -10 : 8 }
                    }
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.24 }}
                    className={`${gridPosClass} relative min-h-[72px] sm:min-h-[88px] pt-3 px-2.5 pb-2 rounded-2xl border-2 flex items-center justify-between gap-2 transition-all ${
                      member
                        ? isMe
                          ? 'bg-[#FFFDF8] border-[#C86B46] shadow-[0_4px_0_#231712]'
                          : 'bg-[#FFFDF8] border-[#231712] shadow-[0_3px_0_#231712]'
                        : isLocked
                          ? 'bg-[#EAD9C0]/45 border-dashed border-[#231712]/20 opacity-55'
                          : 'bg-[#F7EEDF]/92 border-2 border-[#7B5236] shadow-[0_3px_0_#5A3A26]'
                    }`}
                  >
                    {/* Curved Wooden Chair Backrest Bar at the top of every seat */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -top-2 left-4 right-4 h-3 rounded-t-full border-2 border-[#231712] ${
                        member ? 'bg-[#7B5236]' : isLocked ? 'bg-[#9E8C7A]' : 'bg-[#8C583A]'
                      }`}
                    />

                    {member ? (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative shrink-0">
                            <div className="p-0.5 rounded-xl bg-[#FEF6E0] border-2 border-[#231712]">
                              <PlayerAvatar avatarId={member.avatarId} size={34} />
                            </div>
                            <span className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 rounded-full bg-[#231712] text-[#FFFDF8] text-[9px] font-mono font-extrabold flex items-center justify-center">
                              {idx + 1}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="font-serif font-bold text-xs sm:text-sm text-[#231712] block truncate">
                              {member.nickname}
                              {member.id === snapshot.hostId ? ' · Anfitrión' : ''}
                              {isMe ? ' (Tú)' : ''}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {isBot ? (
                                <span className="px-1.5 py-0.2 rounded-md bg-[#FEF6E0] border border-[#231712] text-[10px] font-extrabold text-[#231712]">
                                  Autómata{' '}
                                  {member.botDifficulty === 'hard'
                                    ? 'Difícil'
                                    : member.botDifficulty === 'medium'
                                      ? 'Medio'
                                      : 'Básico'}
                                </span>
                              ) : member.ready ? (
                                <span
                                  data-testid={isMe ? 'lobby-ready-stamp' : undefined}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-[#E6F4EA] border-2 border-[#3D5B47] text-[10px] font-extrabold text-[#3D5B47] uppercase tracking-wider -rotate-1 shadow-[1px_1px_0_#231712]"
                                >
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    aria-hidden="true"
                                    className="shrink-0"
                                  >
                                    <path
                                      d="M2.2 6.2L4.8 8.8L9.8 3.2"
                                      stroke="currentColor"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <span>Listo</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-[#6C564A]">
                                  Mirando la carta…
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isHost && isBot && (
                          <button
                            type="button"
                            onClick={() => void removeBot(member.id)}
                            className="px-2 py-1 rounded-lg bg-[#FDECEB] border border-[#A63F34]/40 text-[10px] font-extrabold text-[#A63F34] hover:bg-[#F9D7D5] cursor-pointer shrink-0"
                          >
                            Retirar
                          </button>
                        )}
                      </>
                    ) : (
                      /* Empty Wooden Chair with Upholstered Cushion & Table Place Setting */
                      <div className="flex items-center gap-2 text-xs text-[#5A453B] w-full">
                        <span className="w-8 h-8 rounded-xl bg-[#FFFDF8] border-2 border-dashed border-[#7B5236] flex items-center justify-center font-mono text-xs font-extrabold text-[#7B5236] shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-serif font-bold text-xs text-[#231712] block">
                            {isLocked ? 'Silla retirada' : 'Silla libre'}
                          </span>
                          <span className="text-[10px] text-[#6C564A] block truncate">
                            {isLocked ? 'Sin cubierto' : 'Esperando comensal…'}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right 5 cols: Tactile Café Tokens for Players & Turn Clock */}
          <div className="lg:col-span-5 cafe-paper-subpanel p-3 sm:p-4 rounded-2xl border-2 border-[#231712]/25 space-y-3 self-stretch flex flex-col justify-between">
            <div className="space-y-3">
              <div className="cafe-double-rule pb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C86B46] block">
                  Comanda del anfitrión
                </span>
                <h2 className="font-serif font-bold text-base sm:text-lg text-[#231712]">
                  Ajustes de la mesa
                </h2>
              </div>

              {/* Tactile Max Players Tokens */}
              <div className="space-y-1.5" data-testid="lobby-maxplayers-control">
                <span className="block text-xs font-extrabold text-[#231712]">
                  Cubiertos en la mesa
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {([2, 3, 4] as const).map((count) => {
                    const active = snapshot.config.maxPlayers === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        disabled={!isHost}
                        data-testid={`lobby-maxplayers-${count}`}
                        onClick={() => {
                          soundEngine.playSfx('uiToggle');
                          void updateRoomConfig({ maxPlayers: count });
                        }}
                        className={`min-h-[42px] px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-60 ${
                          active
                            ? 'cafe-btn-primary'
                            : 'cafe-btn-paper'
                        }`}
                      >
                        {count} sillas
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tactile Turn Clock Tokens */}
              <div className="space-y-1.5" data-testid="lobby-timer-control">
                <span className="block text-xs font-extrabold text-[#231712]">
                  Reloj de cortesía por turno
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 gap-1.5">
                  {[
                    { val: 0, label: 'Sin reloj' },
                    { val: 30, label: '30 s' },
                    { val: 60, label: '60 s' },
                    { val: 90, label: '90 s' },
                    { val: 120, label: '120 s' },
                  ].map((opt) => {
                    const active = currentTimerVal === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        disabled={!isHost}
                        data-testid={`lobby-timer-${opt.val}`}
                        onClick={() => {
                          soundEngine.playSfx('uiToggle');
                          void updateRoomConfig({
                            timerEnabled: opt.val > 0,
                            timerSeconds: opt.val > 0 ? opt.val : 60,
                          });
                        }}
                        className={`min-h-[38px] px-2 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-60 ${
                          active
                            ? 'cafe-btn-primary'
                            : 'cafe-btn-paper'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-dashed border-[#231712]/15 text-[11px] font-semibold text-[#5A453B] flex items-center justify-between">
              <span>Bolsa de terciopelo: 100 fichas</span>
              <span className="font-serif font-bold text-[#231712] bg-[#FEF6E0] px-2 py-0.5 rounded border border-[#C8A12A]">
                O &amp; A
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar: Ready Ink Stamp + Café Service Bell Start */}
        <div className="shrink-0 pt-2 border-t-2 border-[#231712]/15 flex items-center justify-between gap-2">
          {me && me.role === 'player' && (
            <button
              type="button"
              data-testid="lobby-ready-btn"
              onClick={() => void toggleReady(!me.ready)}
              className={`px-4 min-h-[44px] rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer transition-all inline-flex items-center gap-2 ${
                me.ready ? 'cafe-btn-sage' : 'cafe-btn-paper'
              }`}
            >
              {me.ready && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path
                    d="M2.2 6.2L4.8 8.8L9.8 3.2"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span>{me.ready ? 'Sello: Listo en mesa' : 'Sellar: Estoy listo'}</span>
            </button>
          )}

          {isHost && (
            <button
              type="button"
              data-testid="start-game-btn"
              disabled={activeSeatMembers.length < 2}
              onClick={() => void startGame()}
              className="px-5 min-h-[44px] rounded-xl cafe-btn-primary font-extrabold text-xs sm:text-sm disabled:opacity-45 cursor-pointer ml-auto inline-flex items-center gap-2"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 4v2m-7 11h14a7 7 0 0 0-14 0Zm-2 3h18"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Tocar timbre y empezar ({activeSeatMembers.length})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PlayingScreen(): React.ReactElement {
  const snapshot = useGameStore((s) => s.snapshot);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const myRole = useGameStore((s) => s.myRole);
  const selectedTileId = useGameStore((s) => s.selectedTileId);
  const draftPlacements = useGameStore((s) => s.draftPlacements);
  const preferredJokerNation = useGameStore((s) => s.preferredJokerNation);
  const focusedTableId = useGameStore((s) => s.focusedTableId);
  const cameraPreset = useGameStore((s) => s.cameraPreset);
  const cameraAngleIndex = useGameStore((s) => s.cameraAngleIndex);
  const cameraZoom = useGameStore((s) => s.cameraZoom);
  const nightMode = useGameStore((s) => s.nightMode);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const subtitleMode = useGameStore((s) => s.subtitleMode);
  const subtitleStyle = useGameStore((s) => s.subtitleStyle);
  const errorBanner = useGameStore((s) => s.errorBanner);
  const activeOverlay = useGameStore((s) => s.activeOverlay);

  const selectTile = useGameStore((s) => s.selectTile);
  const setPreferredJokerNation = useGameStore((s) => s.setPreferredJokerNation);
  const clearDraft = useGameStore((s) => s.clearDraft);
  const addDraftPlacement = useGameStore((s) => s.addDraftPlacement);
  const setPendingNegativeConfirm = useGameStore((s) => s.setPendingNegativeConfirm);
  const setWhyCannotBanner = useGameStore((s) => s.setWhyCannotBanner);
  const setFocusedTableId = useGameStore((s) => s.setFocusedTableId);
  const setCameraPreset = useGameStore((s) => s.setCameraPreset);
  const cycleCameraAngle = useGameStore((s) => s.cycleCameraAngle);
  const resetCamera = useGameStore((s) => s.resetCamera);
  const setCameraZoom = useGameStore((s) => s.setCameraZoom);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setActiveOverlay = useGameStore((s) => s.setActiveOverlay);
  const toggleOverlay = useGameStore((s) => s.toggleOverlay);
  const submitMove = useGameStore((s) => s.submitMove);
  const sendChat = useGameStore((s) => s.sendChat);
  const leaveRoom = useGameStore((s) => s.leaveRoom);

  const legendBtnRef = useRef<HTMLButtonElement | null>(null);
  const rivalHandsBtnRef = useRef<HTMLButtonElement | null>(null);
  const moreMenuBtnRef = useRef<HTMLButtonElement | null>(null);
  const jokerSwapBtnRef = useRef<HTMLButtonElement | null>(null);

  const [sideTab, setSideTab] = useState<'log' | 'chat'>('log');
  const [chatInput, setChatInput] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [chairToast, setChairToast] = useState<ChairToastInfo | null>(null);
  const [coinFlights, setCoinFlights] = useState<CoinFlightEvent[]>([]);
  const [calloutQueue, setCalloutQueue] = useState<ArcadeCalloutEvent[]>([]);
  const lastLogLengthRef = useRef<number>(0);
  const announcedLastRoundRef = useRef<boolean>(false);

  const gameState = snapshot?.gameState;

  const legendOpen = activeOverlay === 'legend';
  const rivalHandsOpen = activeOverlay === 'hands';
  const cafeModalOpen = activeOverlay === 'cafe3d';
  const drawerOpen = activeOverlay === 'drawer';
  const jokerSwapOpen = activeOverlay === 'joker_swap';
  const moreMenuOpen = activeOverlay === 'more_menu';

  // Prefetch the 3D Café chunk in background after the 2D board renders
  useEffect(() => {
    void import('./PapercraftBoard');
  }, []);

  // Map player avatarId from room members or player state
  const avatarByPlayerId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of snapshot?.members ?? []) {
      map[m.id] = m.avatarId || 'moka';
    }
    for (const p of gameState?.players ?? []) {
      if (p.avatarId && !map[p.id]) {
        map[p.id] = p.avatarId;
      }
    }
    return map;
  }, [snapshot?.members, gameState?.players]);

  // Turn countdown timer
  useEffect(() => {
    const deadline = snapshot?.turnDeadlineMs ?? null;
    if (!deadline) {
      setRemainingSeconds(null);
      return;
    }
    const updateClock = () => {
      const diff = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(diff);
    };
    updateClock();
    const timer = setInterval(updateClock, 500);
    return () => clearInterval(timer);
  }, [snapshot?.turnDeadlineMs]);

  // Auto-dismiss chair toast after 3.2 seconds
  useEffect(() => {
    if (!chairToast) return;
    const t = setTimeout(() => setChairToast(null), 3200);
    return () => clearTimeout(t);
  }, [chairToast]);

  // Pop event callout queue every 1.45s
  useEffect(() => {
    if (calloutQueue.length === 0) return;
    soundEngine.playSfx('calloutSting');
    const timer = setTimeout(() => {
      setCalloutQueue((q) => q.slice(1));
    }, 1450);
    return () => clearTimeout(timer);
  }, [calloutQueue]);

  // Detect new scoring, bar penalty, joker, table completion, and last round events
  useEffect(() => {
    if (!gameState) return;
    const currentLen = gameState.log.length;
    if (lastLogLengthRef.current === 0) {
      lastLogLengthRef.current = currentLen;
      return;
    }
    if (currentLen <= lastLogLengthRef.current) {
      lastLogLengthRef.current = currentLen;
      return;
    }

    const newEvents = gameState.log.slice(lastLogLengthRef.current);
    lastLogLengthRef.current = currentLen;

    const flights: CoinFlightEvent[] = [];
    const newCallouts: ArcadeCalloutEvent[] = [];

    for (let i = 0; i < newEvents.length; i++) {
      const ev = newEvents[i];
      if (!ev) continue;
      const plName =
        gameState.players.find((p) => 'playerId' in ev && p.id === ev.playerId)?.nickname ??
        'Jugador';

      if (ev.type === 'tile_seated') {
        if (ev.pointsEarned > 0) {
          flights.push({
            id: `flight-${Date.now()}-${i}`,
            playerId: ev.playerId,
            delta: ev.pointsEarned,
            sourceSelector: `[data-seat-id="${ev.seatId}"]`,
            targetSelector: `[data-player-tray="${ev.playerId}"]`,
          });
        }
        if (ev.tile.nation === 'joker') {
          newCallouts.push({
            id: `callout-joker-${Date.now()}-${i}`,
            title: '¡EL JOKER!',
            subtitle: `${plName} sienta comodín (+${ev.pointsEarned} pts)`,
            tone: 'gold',
            isKeyMoment: true,
          });
        }
        if (ev.pureTablesCompleted > 0) {
          newCallouts.push({
            id: `callout-table-${Date.now()}-${i}`,
            title: '¡MESA COMPLETA!',
            subtitle: `${plName} completa mesa nacional`,
            tone: 'green',
            isKeyMoment: true,
          });
        } else {
          const completedTable = gameState.tables.find(
            (t) =>
              t.seatIds.includes(ev.seatId) &&
              t.seatIds.every((sid) => gameState.seats.find((s) => s.id === sid)?.occupant !== null),
          );
          if (completedTable) {
            newCallouts.push({
              id: `callout-full-${Date.now()}-${i}`,
              title: '¡MESA COMPLETA!',
              subtitle: `Mesa de ${NATION_VISUALS[completedTable.nation]?.name ?? completedTable.nation} (4/4)`,
              tone: 'green',
              isKeyMoment: true,
            });
          } else if (ev.pointsEarned > 0) {
            newCallouts.push({
              id: `callout-seat-${Date.now()}-${i}`,
              title: '¡INVITADO SENTADO!',
              subtitle: `${plName} suma +${ev.pointsEarned} monedas`,
              tone: 'green',
              isKeyMoment: false,
            });
          }
        }
      } else if (ev.type === 'joker_swapped') {
        newCallouts.push({
          id: `callout-swap-${Date.now()}-${i}`,
          title: '¡EL JOKER!',
          subtitle: `${plName} cambia comodín de la mesa`,
          tone: 'gold',
          isKeyMoment: true,
        });
      } else if (ev.type === 'tile_bar' && ev.pointsDelta !== 0) {
        if (ev.pointsDelta > 0) {
          flights.push({
            id: `flight-${Date.now()}-${i}`,
            playerId: ev.playerId,
            delta: ev.pointsDelta,
            sourceSelector: '[data-testid="bar-center-button"]',
            targetSelector: `[data-player-tray="${ev.playerId}"]`,
          });
          newCallouts.push({
            id: `callout-barpos-${Date.now()}-${i}`,
            title: '¡SERVICIO EN BARRA!',
            subtitle: `${plName} gana +${ev.pointsDelta} monedas`,
            tone: 'blue',
            isKeyMoment: false,
          });
        } else {
          flights.push({
            id: `flight-${Date.now()}-${i}`,
            playerId: ev.playerId,
            delta: ev.pointsDelta,
            sourceSelector: `[data-player-tray="${ev.playerId}"]`,
            targetSelector: '[data-testid="bar-center-button"]',
          });
          newCallouts.push({
            id: `callout-pen-${Date.now()}-${i}`,
            title: '¡PENALIZACIÓN!',
            subtitle: `${plName} sirve en la barra (${ev.pointsDelta} pts)`,
            tone: 'red',
            isKeyMoment: true,
          });
        }

        if (ev.barIndex >= 18) {
          newCallouts.push({
            id: `callout-bar-${Date.now()}-${i}`,
            title: '¡BARRA LLENA!',
            subtitle: `Posavasos ${ev.barIndex + 1}/20 ocupado`,
            tone: 'red',
            isKeyMoment: true,
          });
        }
      } else if (ev.type === 'game_finished') {
        newCallouts.push({
          id: `callout-win-${Date.now()}-${i}`,
          title: '¡VICTORIA!',
          subtitle: 'Cerrando recuento del café',
          tone: 'gold',
          isKeyMoment: true,
        });
      }
    }

    if (!announcedLastRoundRef.current && gameState.bag.length <= 7 && gameState.bag.length > 3) {
      announcedLastRoundRef.current = true;
      newCallouts.push({
        id: `callout-last-${Date.now()}`,
        title: '¡ÚLTIMA RONDA!',
        subtitle: `Quedan solo ${gameState.bag.length} fichas en la bolsa`,
        tone: 'blue',
        isKeyMoment: true,
      });
    }

    if (subtitleMode !== 'off' && newCallouts.length > 0) {
      const filtered =
        subtitleMode === 'all'
          ? newCallouts
          : newCallouts.filter((c) => c.isKeyMoment);
      if (filtered.length > 0) {
        setCalloutQueue((prev) => [...prev, ...filtered]);
      }
    }

    if (flights.length > 0) {
      const hasNegative = flights.some((f) => f.delta < 0);
      soundEngine.playSfx(hasNegative ? 'coinPenalty' : 'coinClink');
      setCoinFlights(flights);
      const clearTimer = setTimeout(() => setCoinFlights([]), 1600);
      return () => clearTimeout(clearTimer);
    }
  }, [gameState, gameState?.log.length, subtitleMode]);

  const activePlayerId = gameState?.turn ?? '';
  const isMyTurn = myRole === 'player' && activePlayerId === myPlayerId;
  const activeHand = useMemo(
    () => (gameState ? (gameState.hands[activePlayerId] ?? []) : []),
    [gameState, activePlayerId],
  );
  const myHand = useMemo(
    () =>
      gameState
        ? (gameState.hands[myPlayerId ?? activePlayerId] ?? activeHand)
        : [],
    [gameState, myPlayerId, activePlayerId, activeHand],
  );

  const selectedTile: Tile | null = useMemo(
    () => myHand.find((t) => t.id === selectedTileId) ?? null,
    [myHand, selectedTileId],
  );
  const selectedProfile = useMemo(
    () =>
      selectedTile
        ? getCharacterProfile(
            selectedTile.nation,
            selectedTile.gender,
            selectedTile.jokerNation,
            selectedTile.id,
          )
        : null,
    [selectedTile],
  );

  const seatInspections = useMemo(() => {
    if (!gameState) return {};
    return inspectSeatsForSelectedTile(
      gameState,
      selectedTile,
      draftPlacements,
      preferredJokerNation,
    );
  }, [gameState, selectedTile, draftPlacements, preferredJokerNation]);

  const draftEvaluation = useMemo(() => {
    if (!gameState) {
      return {
        isValidCompleteMove: false,
        totalPoints: 0,
        pureTablesCount: 0,
        summaryText: '',
        errorReason: null,
      };
    }
    return evaluateDraftPlacements(gameState, draftPlacements);
  }, [gameState, draftPlacements]);

  const availableSwapMoves = useMemo(() => {
    if (!gameState || !isMyTurn) return [];
    return getLegalMoves(gameState, activePlayerId).filter(
      (m): m is Extract<typeof m, { type: 'swap' }> => m.type === 'swap',
    );
  }, [gameState, isMyTurn, activePlayerId]);

  const detailedSwapOptions = useMemo(() => {
    if (!gameState) return [];
    return availableSwapMoves.map((move) => {
      const handTile = myHand.find((t) => t.id === move.tileId);
      const seat = gameState.seats.find((s) => s.id === move.seatId);
      const profile = handTile
        ? getCharacterProfile(
            handTile.nation,
            handTile.gender,
            handTile.jokerNation,
            handTile.id,
          )
        : null;
      const seatNations = seat
        ? seat.allowedNations.map((n) => getNationName(n)).join(' / ')
        : move.seatId;
      return {
        move,
        handTile,
        profile,
        seatNations,
      };
    });
  }, [availableSwapMoves, myHand, gameState]);

  if (!snapshot || !gameState) return <div />;

  const activePlayerObj = gameState.players.find((p) => p.id === activePlayerId);
  const activeCallout = subtitleMode !== 'off' ? (calloutQueue[0] ?? null) : null;

  const showAnchoredToast = (row: number, col: number, text: string) => {
    setWhyCannotBanner(text);
    setChairToast({
      id: Date.now(),
      row,
      col,
      text,
    });
  };

  const handleSeatClick = (seat: Seat) => {
    if (!isMyTurn) {
      showAnchoredToast(seat.row, seat.col, 'Espera tu turno para sentar invitados.');
      return;
    }
    if (!selectedTile) {
      showAnchoredToast(
        seat.row,
        seat.col,
        'Primero elige una ficha de tu mano en la parte inferior.',
      );
      return;
    }
    const inspect = seatInspections[seat.id];
    if (!inspect || inspect.status === 'illegal') {
      showAnchoredToast(
        seat.row,
        seat.col,
        inspect?.whyCannotText ?? 'No puedes sentar a este invitado en esta silla.',
      );
      return;
    }
    if (inspect.status === 'selected') {
      return;
    }

    setChairToast(null);
    const chosenNation: Nation | undefined =
      selectedTile.nation === 'joker'
        ? (preferredJokerNation && inspect.validJokerNations.includes(preferredJokerNation)
            ? preferredJokerNation
            : inspect.validJokerNations[0] ?? seat.allowedNations[0])
        : undefined;

    const newPlacement =
      selectedTile.nation === 'joker'
        ? { tileId: selectedTile.id, seatId: seat.id, jokerNation: chosenNation }
        : { tileId: selectedTile.id, seatId: seat.id };

    addDraftPlacement(newPlacement);
  };

  const handleTableClick = (table: Table) => {
    setFocusedTableId(focusedTableId === table.id ? null : table.id);
  };

  const handleCycleFocusedTable3D = () => {
    const occupiedTables = gameState.tables.filter((t) =>
      t.seatIds.some((sid) => gameState.seats.find((s) => s.id === sid)?.occupant !== null),
    );
    const pool = occupiedTables.length > 0 ? occupiedTables : gameState.tables;
    if (pool.length === 0) return;
    const currentIdx = pool.findIndex((t) => t.id === focusedTableId);
    const nextTable = pool[(currentIdx + 1) % pool.length];
    if (nextTable) {
      setFocusedTableId(nextTable.id);
    }
  };

  const handleBarClick = () => {
    if (!isMyTurn) {
      showAnchoredToast(6, 6, 'Solo puedes servir en la barra durante tu turno.');
      return;
    }
    if (draftPlacements.length > 0) {
      showAnchoredToast(
        6,
        6,
        'No puedes combinar sillas de mesa y barra. Pulsa Limpiar primero.',
      );
      return;
    }
    if (!selectedTile) {
      showAnchoredToast(6, 6, 'Selecciona primero una ficha natural de tu mano.');
      return;
    }
    if (selectedTile.nation === 'joker') {
      showAnchoredToast(6, 6, 'Los comodines nunca pueden enviarse a la barra.');
      return;
    }

    setChairToast(null);
    const nextBarIdx = gameState.bar.findIndex((b) => b === null);
    const barPoints = nextBarIdx >= 0 ? (gameState.barValues[nextBarIdx] ?? -14) : -14;
    const barMove = { type: 'bar' as const, tileId: selectedTile.id };
    const profile = getCharacterProfile(
      selectedTile.nation,
      selectedTile.gender,
      selectedTile.jokerNation,
      selectedTile.id,
    );

    if (barPoints < 0) {
      setPendingNegativeConfirm({
        move: barMove,
        points: barPoints,
        description: `Vas a sentar a ${profile.name} (${profile.countryName}) en el posavasos ${nextBarIdx + 1} de la barra.`,
      });
      return;
    }

    void submitMove(barMove);
  };

  return (
    <div
      className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between px-1.5 py-1 sm:px-4 sm:py-1.5 gap-0.5 sm:gap-1 max-w-[1440px] mx-auto select-none"
      data-testid="playing-viewport"
    >
      {/* 3D Coin Flip Animation Overlay */}
      <FlyingCoinsLayer flights={coinFlights} reducedMotion={reducedMotion} />

      {/* ORIGINAL HANDCRAFTED EVENT SUBTITLE CALLOUT OVERLAY (Cómic / Café / Arcade) */}
      {activeCallout && (
        <div
          role="status"
          aria-live="polite"
          data-testid="arcade-event-callout"
          data-subtitle-style={subtitleStyle}
          className={`pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-50 text-center transition-transform ${
            reducedMotion ? '' : 'animate-bounce'
          } ${
            subtitleStyle === 'comic'
              ? 'bg-[#FFF9F0] text-[#231712] border-[3px] border-[#231712] shadow-[5px_5px_0px_#231712] rounded-2xl px-5 py-2 -rotate-1'
              : subtitleStyle === 'cafe'
                ? 'bg-[#F7EEDF] text-[#3E2F2A] border-2 border-[#8B5E3C] ring-2 ring-inset ring-[#C9A227]/75 shadow-[0_10px_24px_rgba(62,47,42,0.28)] rounded-xl px-5 py-2'
                : activeCallout.tone === 'gold'
                  ? 'bg-[#3E2F2A] border-2 border-[#F2C14E] text-[#FFF9F0] rounded-2xl px-5 py-2 shadow-xl'
                  : activeCallout.tone === 'green'
                    ? 'bg-[#224A36] border-2 border-[#8CE0B5] text-[#FFF9F0] rounded-2xl px-5 py-2 shadow-xl'
                    : activeCallout.tone === 'red'
                      ? 'bg-[#6E1B16] border-2 border-[#FFB4AB] text-[#FFF9F0] rounded-2xl px-5 py-2 shadow-xl'
                      : 'bg-[#1E4E8C] border-2 border-[#FFF9F0] text-[#FFF9F0] rounded-2xl px-5 py-2 shadow-xl'
          }`}
        >
          <div
            className={`font-serif font-extrabold text-lg sm:text-2xl tracking-wider uppercase ${
              subtitleStyle === 'comic'
                ? activeCallout.tone === 'red'
                  ? 'text-[#A94438]'
                  : activeCallout.tone === 'green'
                    ? 'text-[#2E7D52]'
                    : 'text-[#C96F4A]'
                : subtitleStyle === 'cafe'
                  ? 'text-[#3E2F2A]'
                  : 'text-[#F2C14E]'
            }`}
          >
            {activeCallout.title}
          </div>
          <div
            className={`text-[11px] sm:text-xs font-bold ${
              subtitleStyle === 'comic' || subtitleStyle === 'cafe'
                ? 'text-[#6F5A4E]'
                : 'text-[#FFF9F0]/95'
            }`}
          >
            {activeCallout.subtitle}
          </div>
          {subtitleStyle === 'comic' && (
            <svg
              width="20"
              height="12"
              viewBox="0 0 20 12"
              aria-hidden="true"
              className="mx-auto -mb-4 mt-0.5"
            >
              <polygon points="2,0 18,0 10,11" fill="#FFF9F0" stroke="#231712" strokeWidth="3" />
            </svg>
          )}
        </div>
      )}

      {/* P0.1 TWO-ROW STABLE HEADER (Never wraps action buttons even with 9.999 pts) */}
      <header
        data-testid="playing-header"
        className="shrink-0 bg-[#FFF9F0] rounded-2xl border-2 border-[#231712]/25 px-2 py-1 sm:px-3 sm:py-1.5 shadow-[0_3px_10px_rgba(35,23,18,0.08)] flex flex-col gap-1 z-30"
      >
        {/* ROW 1: Brand + Turn Indicator (Left) & Non-Wrapping Action Buttons (Right) */}
        <div
          data-testid="header-top-row"
          className="flex items-center justify-between gap-1.5 flex-nowrap min-w-0"
        >
          {/* Left: Brand, Room Code, Turn Pill, Timer */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
            <CafetuliaLogo compact hideTextOnMobile />
            <span className="hidden md:inline-block text-[11px] font-mono font-bold text-[#6F5A4E] bg-[#F7EEDF] px-2 py-0.5 rounded-lg border border-[#231712]/10 shrink-0">
              #{snapshot.code}
            </span>
            <div
              className={`px-2 py-0.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 whitespace-nowrap truncate max-w-[130px] sm:max-w-[190px] ${
                isMyTurn
                  ? 'bg-[#C96F4A] text-[#FFF9F0] border border-[#231712] shadow-2xs'
                  : 'bg-[#F7EEDF] text-[#3E2F2A] border border-[#231712]/15'
              }`}
              data-testid="turn-indicator"
            >
              {isMyTurn ? 'Tu turno' : `Turno: ${activePlayerObj?.nickname ?? 'Rival'}`}
            </div>
            {remainingSeconds !== null && (
              <span
                className={`text-[11px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded-lg shrink-0 ${
                  remainingSeconds <= 10
                    ? 'bg-[#FDECEB] text-[#A94438]'
                    : 'bg-[#F7EEDF] text-[#3E2F2A]'
                }`}
              >
                ⏱ {remainingSeconds}s
              </span>
            )}
          </div>

          {/* Right: Single-line Action Buttons (flex-nowrap, never jumps to x=0) */}
          <div
            data-testid="header-actions-row"
            className="flex items-center gap-1 text-xs flex-nowrap shrink-0"
          >
            {/* Board Legend '?' Button */}
            <button
              ref={legendBtnRef}
              type="button"
              data-testid="board-legend-btn"
              onClick={() => toggleOverlay('legend')}
              aria-expanded={legendOpen}
              aria-controls="board-legend-popover"
              aria-label="Leyenda del tablero"
              title="Leyenda del tablero: mesa, silla, silla compartida, ficha, barra y cambiar comodín"
              className="min-h-[32px] w-8 rounded-xl bg-[#FEF6E0] border border-[#C9A227] font-serif font-extrabold text-sm text-[#3E2F2A] hover:bg-[#F2C14E]/40 cursor-pointer shrink-0"
            >
              ?
            </button>

            {/* Rival Public Hands Button */}
            <button
              ref={rivalHandsBtnRef}
              type="button"
              data-testid="rival-hands-btn"
              onClick={() => toggleOverlay('hands')}
              aria-expanded={rivalHandsOpen}
              aria-controls="rival-hands-popover"
              className="min-h-[32px] px-2 sm:px-2.5 py-1 rounded-xl bg-[#F7EEDF] border border-[#231712]/20 font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer whitespace-nowrap shrink-0"
            >
              Manos
            </button>

            {/* Subtitles Dropdown (visible on lg+) */}
            <div className="hidden lg:block shrink-0">
              <SubtitlesDropdownPicker compact />
            </div>

            {/* 3D Café Button */}
            <button
              type="button"
              data-testid="open-3d-cafe-btn"
              onClick={() => setActiveOverlay('cafe3d')}
              className="min-h-[32px] px-2 sm:px-2.5 py-1 rounded-xl bg-[#3F5E4A] text-[#FFF9F0] border border-[#231712] font-bold hover:opacity-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              Ver café
            </button>

            {/* Desktop/Tablet direct buttons */}
            <button
              type="button"
              data-testid="open-drawer-btn"
              onClick={() => toggleOverlay('drawer')}
              aria-expanded={drawerOpen}
              className="hidden sm:inline-flex items-center min-h-[32px] px-2.5 py-1 rounded-xl bg-[#F7EEDF] border border-[#231712]/20 font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer whitespace-nowrap shrink-0"
            >
              Tertulia ({gameState.log.length})
            </button>

            <button
              type="button"
              data-testid="header-settings-btn"
              onClick={() => setActiveModal('settings')}
              aria-label="Ajustes"
              className="hidden sm:inline-flex items-center min-h-[32px] px-2.5 py-1 rounded-xl bg-[#F7EEDF] border border-[#231712]/15 font-semibold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer whitespace-nowrap shrink-0"
            >
              Ajustes
            </button>

            <button
              type="button"
              data-testid="header-leave-btn"
              onClick={leaveRoom}
              aria-label="Salir de la partida"
              className="hidden sm:inline-flex items-center min-h-[32px] px-2 py-1 rounded-xl text-[#A94438] font-bold hover:bg-[#FDECEB] cursor-pointer whitespace-nowrap shrink-0"
            >
              Salir
            </button>

            {/* Compact Mobile 'Más' Menu Button (< 640px) */}
            <button
              ref={moreMenuBtnRef}
              type="button"
              data-testid="header-more-btn"
              aria-expanded={moreMenuOpen}
              aria-controls="header-more-popover"
              onClick={() => toggleOverlay('more_menu')}
              className="sm:hidden min-h-[32px] px-2 py-1 rounded-xl bg-[#F7EEDF] border border-[#231712]/20 font-bold text-[#3E2F2A] cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1"
            >
              <span>Más</span>
              <svg width="9" height="6" viewBox="0 0 10 6" aria-hidden="true">
                <path
                  d="M1 1l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ROW 2: Full-Width Compact Scoreboard with Summary CoinTrays & Bag Counter */}
        <div
          className="flex items-center justify-between gap-1 sm:gap-1.5 overflow-x-auto max-w-full pt-0.5 border-t border-[#3E2F2A]/10"
          data-testid="compact-scoreboard"
        >
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            {gameState.players.map((p) => {
              const pHandCount = (gameState.hands[p.id] ?? []).length;
              const isTurn = gameState.turn === p.id;
              const pAvatar = avatarByPlayerId[p.id] ?? p.avatarId ?? 'moka';
              return (
                <div
                  key={p.id}
                  data-testid={`scoreboard-player-${p.id}`}
                  className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-xl border text-xs transition-colors duration-200 whitespace-nowrap shrink-0 ${
                    isTurn
                      ? 'bg-[#FEF6E0] border-[#C96F4A] font-bold'
                      : 'bg-[#F7EEDF] border-[#231712]/12'
                  }`}
                >
                  <PlayerAvatar avatarId={pAvatar} size={16} />
                  <span className="font-bold text-[#3E2F2A] truncate max-w-[54px] sm:max-w-[100px]">
                    {p.nickname}
                  </span>
                  <CoinTray
                    score={p.score}
                    playerId={p.id}
                    compact
                    summaryOnly
                    reducedMotion={reducedMotion}
                  />
                  <span
                    className="text-[10px] font-mono font-semibold text-[#6F5A4E] bg-[#FFF9F0] px-1 py-0.2 rounded border border-[#231712]/15 tabular-nums"
                    title={`${pHandCount} fichas en mano`}
                  >
                    {pHandCount}c
                  </span>
                </div>
              );
            })}
          </div>

          <span
            data-testid="bag-counter-pill"
            className="text-[10px] sm:text-[11px] font-mono font-bold text-[#6F5A4E] bg-[#F7EEDF] px-1.5 sm:px-2 py-0.5 rounded-xl border border-[#231712]/12 tabular-nums whitespace-nowrap shrink-0"
            title="Fichas restantes en la bolsa"
          >
            Bolsa: {gameState.bag.length}
          </span>
        </div>
      </header>

      {/* PORTAL POPOVER: Board Legend '?' (P0.2 & P0.5) */}
      <AnchoredPopover
        open={legendOpen}
        onClose={() => setActiveOverlay(null)}
        anchorRef={legendBtnRef}
        id="board-legend-popover"
        role="dialog"
        ariaLabel="Leyenda visual del tablero"
        testId="board-legend-popover"
        maxWidth={340}
        preferPlacement="bottom-end"
      >
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-1.5">
            <span className="font-serif font-bold text-sm">Cómo leer el tablero</span>
            <button
              type="button"
              onClick={() => {
                setActiveOverlay(null);
                legendBtnRef.current?.focus();
              }}
              aria-label="Cerrar leyenda"
              className="text-xs font-bold text-[#6F5A4E] hover:text-[#3E2F2A] px-1.5 py-1 cursor-pointer inline-flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path
                  d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <ul className="space-y-1.5 text-[11px] leading-snug">
            <li className="flex items-center gap-2 bg-[#F7EEDF] p-1.5 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-[#FFF9F0] border-2 border-[#3B5BA5] flex items-center justify-center shrink-0">
                <FlagBadge nation="fr" size={11} />
              </span>
              <div>
                <strong>Mesa nacional:</strong> mantel crema con su bandera en el centro. Tócala
                para activar el <em>Modo enfoque</em>.
              </div>
            </li>
            <li className="flex items-center gap-2 bg-[#F7EEDF] p-1.5 rounded-xl">
              <span className="w-6 h-6 rounded-md bg-[#FFF9F0] border border-[#231712] flex items-center justify-center shrink-0 overflow-hidden">
                <CharacterPortrait nation="fr" gender="F" size={22} />
              </span>
              <div>
                <strong>Ficha sentada:</strong> mini-ficha cuadrada prominente con bandera de fondo
                y caricatura del invitado.
              </div>
            </li>
            <li className="flex items-center gap-2 bg-[#F7EEDF] p-1.5 rounded-xl">
              <span className="w-6 h-6 rounded-md bg-[#FFF9F0] border-2 border-[#5C3A21] flex items-center justify-center gap-0.5 shrink-0">
                <FlagBadge nation="fr" size={6} />
                <FlagBadge nation="en" size={6} />
              </span>
              <div>
                <strong>Silla compartida:</strong> cojín bicolor con 2 banderitas; puntúa en ambas
                mesas.
              </div>
            </li>
            <li className="flex items-center gap-2 bg-[#F7EEDF] p-1.5 rounded-xl">
              <span className="w-6 h-6 rounded-md bg-[#8B5E3C] border border-[#5C3A21] flex items-center justify-center shrink-0">
                <span className="w-3.5 h-3.5 rounded-xs bg-[#F7EEDF]" />
              </span>
              <div>
                <strong>Silla vacía:</strong> madera y cojín neutro crema, sin bandera.
              </div>
            </li>
            <li className="flex items-center gap-2 bg-[#F7EEDF] p-1.5 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-[#F2C14E] border border-[#231712] font-mono font-bold text-[9px] flex items-center justify-center shrink-0">
                +1
              </span>
              <div>
                <strong>Barra central:</strong> 20 posavasos (+1 a +5 y luego -2 a -14).
              </div>
            </li>
            <li className="flex items-center gap-2 bg-[#FEF6E0] p-1.5 rounded-xl border border-[#C9A227]/50">
              <span className="w-6 h-6 rounded-md bg-[#FFF9F0] border border-[#231712] flex items-center justify-center shrink-0 overflow-hidden">
                <CharacterPortrait nation="joker" gender="M" size={22} />
              </span>
              <div>
                <strong>Cambiar comodín:</strong> sustituye un comodín sentado por la ficha natural
                exacta de tu mano (sin puntuar ni robar).
              </div>
            </li>
          </ul>
        </div>
      </AnchoredPopover>

      {/* PORTAL POPOVER: Rival Public Hands (P0.2) */}
      <AnchoredPopover
        open={rivalHandsOpen}
        onClose={() => setActiveOverlay(null)}
        anchorRef={rivalHandsBtnRef}
        id="rival-hands-popover"
        role="dialog"
        ariaLabel="Manos públicas de los jugadores"
        testId="rival-hands-popover"
        maxWidth={350}
        preferPlacement="bottom-end"
      >
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-1.5">
            <span className="font-serif font-bold text-sm">Manos públicas y monedas</span>
            <button
              type="button"
              onClick={() => {
                setActiveOverlay(null);
                rivalHandsBtnRef.current?.focus();
              }}
              aria-label="Cerrar manos públicas"
              className="text-xs font-bold text-[#6F5A4E] hover:text-[#3E2F2A] px-1.5 py-1 cursor-pointer inline-flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path
                  d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          {gameState.players.map((p) => {
            const pHand = gameState.hands[p.id] ?? [];
            const pAvatar = avatarByPlayerId[p.id] ?? p.avatarId ?? 'moka';
            return (
              <div key={p.id} className="bg-[#F7EEDF] p-2 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="inline-flex items-center gap-1.5 font-bold min-w-0 truncate">
                    <PlayerAvatar avatarId={pAvatar} size={18} />
                    <span className="truncate">
                      {p.nickname} {p.id === myPlayerId ? '(Tú)' : ''}
                    </span>
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <CoinTray
                      score={p.score}
                      playerId={`popover-${p.id}`}
                      compact
                      reducedMotion={reducedMotion}
                    />
                    <span className="font-mono text-[10px] text-[#6F5A4E]">
                      · {pHand.length}c
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pHand.map((t) => {
                    const prof = getCharacterProfile(
                      t.nation,
                      t.gender,
                      t.jokerNation,
                      t.id,
                    );
                    return (
                      <div
                        key={t.id}
                        aria-label={`${prof.name}, ${prof.countryName}, ${
                          t.gender === 'F' ? 'Mujer' : 'Hombre'
                        }`}
                        title={`${prof.name} · ${prof.countryName} (${prof.genderBadge})`}
                        className="inline-flex items-center gap-1 bg-[#FFF9F0] p-0.5 pr-1.5 rounded-lg border border-[#231712]/20 text-[10px]"
                      >
                        <CharacterPortrait
                          nation={t.nation}
                          gender={t.gender}
                          tileId={t.id}
                          size={22}
                        />
                        <span className="font-bold">{prof.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </AnchoredPopover>

      {/* PORTAL POPOVER: Mobile 'Más' Menu (< 640px) */}
      <AnchoredPopover
        open={moreMenuOpen}
        onClose={() => setActiveOverlay(null)}
        anchorRef={moreMenuBtnRef}
        id="header-more-popover"
        role="dialog"
        ariaLabel="Más opciones de partida"
        testId="header-more-popover"
        maxWidth={280}
        preferPlacement="bottom-end"
      >
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-1">
            <span className="font-serif font-bold text-sm">Opciones de mesa</span>
            <button
              type="button"
              onClick={() => setActiveOverlay(null)}
              className="px-1.5 py-1 text-[#6F5A4E] font-bold cursor-pointer inline-flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path
                  d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setActiveOverlay('drawer')}
            className="w-full text-left px-3 py-2 rounded-xl bg-[#F7EEDF] font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            Tertulia y registro ({gameState.log.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveOverlay('subtitles')}
            className="w-full text-left px-3 py-2 rounded-xl bg-[#F7EEDF] font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            Subtítulos de eventos
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('settings')}
            className="w-full text-left px-3 py-2 rounded-xl bg-[#F7EEDF] font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            Ajustes y sonido
          </button>
          <button
            type="button"
            onClick={leaveRoom}
            className="w-full text-left px-3 py-2 rounded-xl bg-[#FDECEB] font-bold text-[#A94438] cursor-pointer"
          >
            Salir de la partida
          </button>
        </div>
      </AnchoredPopover>

      {/* PORTAL POPOVER: Cambiar comodín explanation & confirmation (P0.5) */}
      <AnchoredPopover
        open={jokerSwapOpen}
        onClose={() => setActiveOverlay(null)}
        anchorRef={jokerSwapBtnRef}
        id="joker-swap-popover"
        role="dialog"
        ariaLabel="Cambiar comodín sentado en el tablero"
        testId="joker-swap-popover"
        maxWidth={350}
        preferPlacement="top-end"
      >
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-1.5">
            <span className="font-serif font-bold text-sm text-[#3E2F2A]">
              Cambiar comodín
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveOverlay(null);
                jokerSwapBtnRef.current?.focus();
              }}
              aria-label="Cerrar cambio de comodín"
              className="px-1.5 py-1 rounded-lg bg-[#F7EEDF] text-[#6F5A4E] font-bold cursor-pointer inline-flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path
                  d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <p
            data-testid="joker-swap-explanation"
            className="bg-[#FEF6E0] p-2.5 rounded-xl border border-[#C9A227]/60 text-[11px] text-[#3E2F2A] leading-relaxed"
          >
            {JOKER_SWAP_EXPLANATION}
          </p>

          <div className="space-y-1.5">
            {detailedSwapOptions.map((opt, idx) => (
              <div
                key={`${opt.move.seatId}-${opt.move.tileId}-${idx}`}
                className="flex items-center justify-between gap-2 bg-[#F7EEDF] p-2 rounded-xl border border-[#231712]/15"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {opt.handTile && (
                    <CharacterPortrait
                      nation={opt.handTile.nation}
                      gender={opt.handTile.gender}
                      tileId={opt.handTile.id}
                      size={30}
                    />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold text-[#3E2F2A] block truncate">
                      Por {opt.profile?.name ?? 'invitado'} ({opt.profile?.countryName ?? ''})
                    </span>
                    <span className="text-[10px] text-[#6F5A4E] block truncate">
                      Silla: {opt.seatNations} · 0 pts · Sin robo
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="confirm-joker-swap-btn"
                  onClick={() => {
                    setActiveOverlay(null);
                    void submitMove(opt.move);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#C9A227] text-[#231712] border border-[#231712] font-bold text-[11px] hover:opacity-95 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Confirmar
                </button>
              </div>
            ))}
          </div>
        </div>
      </AnchoredPopover>

      {/* CENTER BOARD WORKSPACE (Row 2: Occupies its own dedicated row without overlapping hand dock) */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center relative overflow-hidden">
        {errorBanner && (
          <div
            role="alert"
            className="absolute top-1.5 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1 rounded-xl bg-[#FDECEB] border border-[#A94438] text-xs font-bold text-[#A94438] shadow-md"
          >
            {errorBanner}
          </div>
        )}

        <IllustratedBoard
          gameState={gameState}
          selectedTile={selectedTile}
          draftPlacements={draftPlacements}
          seatInspections={seatInspections}
          focusedTableId={focusedTableId}
          nightMode={nightMode}
          reducedMotion={reducedMotion}
          chairToast={chairToast}
          onDismissToast={() => setChairToast(null)}
          onSeatClick={handleSeatClick}
          onTableClick={handleTableClick}
          onBarClick={handleBarClick}
        />
      </div>

      {/* BOTTOM TRANSLUCENT HAND DOCK (P1.2 — bg-[#FFF9F0]/45 backdrop-blur-lg + centered 3-col grid + cardboard tiles with subtle fan) */}
      <section
        aria-label="Tu mano de invitados"
        data-testid="player-hand-dock"
        className="shrink-0 bg-[#FFF9F0]/55 backdrop-blur-lg rounded-2xl border-2 border-[#231712]/35 px-2 py-1 sm:px-3.5 sm:py-1.5 shadow-[0_-6px_20px_rgba(35,23,18,0.14)] z-30 flex flex-col sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center justify-between sm:justify-normal gap-1.5"
      >
        {/* Left / Top: Printed Café Tasting Note / Luggage Tag for Selected Guest */}
        <div className="flex flex-wrap items-center justify-between w-full sm:w-full sm:min-w-0 sm:max-w-[305px] gap-1.5 sm:justify-self-start">
          {selectedTile && selectedProfile ? (
            <div
              data-testid="selected-tile-detail"
              className="relative flex items-center gap-2 bg-[#FFF9F0] pl-5 pr-2.5 py-1 rounded-xl border-2 border-[#C96F4A] shadow-[0_3px_0_#1E130E] w-full"
            >
              {/* Brass luggage-tag eyelet */}
              <span
                aria-hidden="true"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#3E2F2A] border-[1.5px] border-[#C9A227]"
              />
              <FlagBadge nation={selectedTile.nation} size={20} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-xs sm:text-sm text-[#231712] truncate">
                    {selectedProfile.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#6F5A4E] truncate">
                    · {selectedProfile.countryName}
                  </span>
                  <span
                    data-testid="selected-gender-badge"
                    className={`ml-auto px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${
                      selectedTile.gender === 'F'
                        ? 'bg-[#FDECEB] text-[#9E2A2B] border-[#9E2A2B]/30'
                        : 'bg-[#E6EEF8] text-[#1E4E8C] border-[#1E4E8C]/30'
                    }`}
                  >
                    {selectedProfile.genderBadge}
                  </span>
                </div>
                <span className="block text-[10px] text-[#6F5A4E] italic truncate">
                  «{selectedProfile.quote}»
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs min-w-0 bg-[#FFF9F0]/92 px-2.5 py-1 rounded-xl border border-[#231712]/20 shadow-[0_2px_0_rgba(35,23,18,0.12)] w-full sm:w-auto">
              <span className="font-serif font-bold text-[#231712] block leading-tight">
                Tu mano ({myHand.length}/{gameState.handSize[myPlayerId ?? activePlayerId] ?? 5})
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#6F5A4E] truncate block max-w-[245px]">
                {draftPlacements.length > 0
                  ? draftEvaluation.summaryText
                  : 'Toca o arrastra una ficha para ver sillas'}
              </span>
            </div>
          )}

          {selectedTile?.nation === 'joker' && (
            <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3E2F2A] bg-[#FFF9F0]/95 px-2 py-0.5 rounded-lg border border-[#231712]/25">
              <span>País:</span>
              <select
                aria-label="Nacionalidad para el comodín"
                value={preferredJokerNation ?? ''}
                onChange={(e) =>
                  setPreferredJokerNation(
                    e.target.value ? (e.target.value as Nation) : undefined,
                  )
                }
                className="h-6 px-1.5 rounded bg-[#FFF9F0] border border-[#231712]/25 text-xs font-bold text-[#3E2F2A]"
              >
                <option value="">Automático</option>
                {Object.values(NATION_VISUALS).map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {/* Center: 5 Opaque Square Rounded Cardboard Tiles (Flag Background + Caricature, ZERO visible text) */}
        <div
          className="grid grid-cols-5 gap-1.5 w-full max-w-[356px] sm:max-w-none sm:w-auto sm:flex sm:items-center sm:justify-center sm:justify-self-center sm:gap-2.5 py-0.5"
          data-testid="hand-tiles-row"
        >
          {myHand.map((tile, idx) => {
            const isSelected = selectedTileId === tile.id;
            const isInDraft = draftPlacements.some((d) => d.tileId === tile.id);
            const profile = getCharacterProfile(
              tile.nation,
              tile.gender,
              tile.jokerNation,
              tile.id,
            );
            const genderWord = tile.gender === 'F' ? 'Mujer' : 'Hombre';
            const mid = (myHand.length - 1) / 2;
            const fanDeg = !reducedMotion && !isSelected ? (idx - mid) * 1.4 : 0;
            const fanLift = !reducedMotion && !isSelected ? Math.abs(idx - mid) * 1.2 : 0;

            return (
              <button
                key={tile.id}
                type="button"
                data-tile-id={tile.id}
                data-testid="hand-square-tile"
                disabled={isInDraft}
                draggable={!isInDraft && isMyTurn}
                onDragStart={() => {
                  if (!isSelected) selectTile(tile.id);
                }}
                onClick={() => selectTile(isSelected ? null : tile.id)}
                aria-label={`${profile.name}, ${profile.countryName}, ${genderWord}`}
                title={`${profile.name} · ${profile.countryName} (${genderWord})`}
                style={{
                  transform:
                    isSelected && !reducedMotion
                      ? 'translateY(-7px) scale(1.07)'
                      : !reducedMotion
                        ? `translateY(${fanLift.toFixed(1)}px) rotate(${fanDeg.toFixed(1)}deg)`
                        : undefined,
                }}
                className={`group relative aspect-square w-full sm:w-[72px] sm:h-[72px] rounded-[14px] p-0.5 flex items-center justify-center transition-all duration-150 cursor-pointer select-none shrink-0 ${
                  isInDraft
                    ? 'opacity-35 bg-[#FFF9F0] ring-1 ring-[#3E2F2A]/20'
                    : isSelected
                      ? 'bg-[#FFF9F0] cafe-cardboard-tile-selected ring-2 ring-[#C96F4A] z-20'
                      : 'bg-[#FFF9F0] cafe-cardboard-tile hover:-translate-y-1 hover:scale-103'
                }`}
              >
                <CharacterPortrait
                  nation={tile.nation}
                  gender={tile.gender}
                  tileId={tile.id}
                  size={66}
                  sipping={isSelected}
                />
              </button>
            );
          })}
        </div>

        {/* Right: Confirm Move / Clear Draft / Contextual Deprioritized "Cambiar comodín" (P0.5) */}
        <div className="flex items-center justify-end gap-1.5 w-full sm:w-auto sm:justify-self-end">
          {draftPlacements.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx('uiCancel');
                  clearDraft();
                }}
                className="min-h-[38px] px-3 py-1 rounded-xl cafe-btn-paper text-xs font-bold text-[#3E2F2A] cursor-pointer"
              >
                Limpiar
              </button>
              <button
                type="button"
                data-testid="confirm-move-btn"
                disabled={!draftEvaluation.isValidCompleteMove}
                onClick={() => {
                  soundEngine.playSfx('uiConfirm');
                  const first = draftPlacements[0];
                  if (!first) return;
                  const second = draftPlacements[1];
                  void submitMove({
                    type: 'seat',
                    placements: second ? [first, second] : [first],
                  });
                }}
                className="min-h-[38px] px-4 py-1 rounded-xl cafe-btn-sage text-xs font-bold disabled:opacity-40 cursor-pointer whitespace-nowrap"
              >
                Confirmar (+{draftEvaluation.totalPoints})
              </button>
            </>
          )}

          {detailedSwapOptions.length > 0 && (
            <button
              ref={jokerSwapBtnRef}
              type="button"
              data-testid="joker-swap-btn"
              aria-expanded={jokerSwapOpen}
              aria-controls="joker-swap-popover"
              title={JOKER_SWAP_EXPLANATION}
              onClick={() => toggleOverlay('joker_swap')}
              className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#FEF6E0] text-[#3E2F2A] border border-[#C9A227] shadow-[0_2px_0_#1E130E] text-[11px] font-bold hover:bg-[#F2C14E]/35 cursor-pointer whitespace-nowrap inline-flex items-center gap-1"
            >
              <span>
                {detailedSwapOptions[0]?.profile
                  ? `Cambiar comodín por ${detailedSwapOptions[0].profile.name}${
                      detailedSwapOptions.length > 1 ? ` (${detailedSwapOptions.length})` : ''
                    }`
                  : `Cambiar comodín (${detailedSwapOptions.length})`}
              </span>
              <span
                aria-hidden="true"
                className="w-4 h-4 rounded-full bg-[#C9A227]/40 text-[#231712] text-[10px] font-serif font-extrabold inline-flex items-center justify-center"
              >
                ?
              </span>
            </button>
          )}
        </div>
      </section>

      {/* ON-DEMAND LAZY-LOADED "VER CAFÉ" 3D DIORAMA MODAL WITH CAMERA PRESETS */}
      <AnimatePresence>
        {cafeModalOpen && (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#231712]/65 p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cafe-3d-modal-title"
            data-testid="cafe-3d-modal"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveOverlay(null);
            }}
          >
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: reducedMotion ? 0 : 0.18 }}
              className="w-full max-w-4xl cafe-paper-sheet text-[#3E2F2A] rounded-[24px] p-4 sm:p-6 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 cafe-double-rule pb-2.5">
                <div>
                  <h2 id="cafe-3d-modal-title" className="font-serif font-bold text-xl sm:text-2xl">
                    Café Vivo en 3D
                  </h2>
                  <p className="text-xs text-[#6F5A4E]">
                    Invitados 3D tomando café en las 24 mesas y los 20 posavasos de la barra · Placa
                    O &amp; A
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    data-testid="camera-preset-general"
                    onClick={() => setCameraPreset('general')}
                    className={`px-2.5 py-1.5 rounded-xl font-bold cursor-pointer ${
                      cameraPreset === 'general' && !focusedTableId
                        ? 'bg-[#3F5E4A] text-[#FFF9F0]'
                        : 'bg-[#F7EEDF] text-[#3E2F2A] hover:bg-[#EAD9C0]'
                    }`}
                  >
                    Plano general
                  </button>
                  <button
                    type="button"
                    data-testid="camera-preset-tables"
                    onClick={() => setCameraPreset('tables')}
                    className={`px-2.5 py-1.5 rounded-xl font-bold cursor-pointer ${
                      cameraPreset === 'tables'
                        ? 'bg-[#3F5E4A] text-[#FFF9F0]'
                        : 'bg-[#F7EEDF] text-[#3E2F2A] hover:bg-[#EAD9C0]'
                    }`}
                  >
                    Mesas
                  </button>
                  <button
                    type="button"
                    data-testid="camera-preset-bar"
                    onClick={() => setCameraPreset('bar')}
                    className={`px-2.5 py-1.5 rounded-xl font-bold cursor-pointer ${
                      cameraPreset === 'bar'
                        ? 'bg-[#3F5E4A] text-[#FFF9F0]'
                        : 'bg-[#F7EEDF] text-[#3E2F2A] hover:bg-[#EAD9C0]'
                    }`}
                  >
                    Barra
                  </button>
                  <button
                    type="button"
                    data-testid="focus-table-3d-btn"
                    onClick={handleCycleFocusedTable3D}
                    className="px-2.5 py-1.5 rounded-xl bg-[#FEF6E0] border border-[#C9A227] font-bold text-[#3E2F2A] hover:bg-[#F2C14E]/35 cursor-pointer"
                  >
                    Enfocar mesa
                  </button>
                  <button
                    type="button"
                    onClick={cycleCameraAngle}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F7EEDF] font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
                  >
                    Girar 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraZoom(cameraZoom + 0.15)}
                    aria-label="Acercar cámara"
                    className="px-2.5 py-1.5 rounded-xl bg-[#F7EEDF] font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraZoom(cameraZoom - 0.15)}
                    aria-label="Alejar cámara"
                    className="px-2.5 py-1.5 rounded-xl bg-[#F7EEDF] font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={resetCamera}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F7EEDF] font-semibold text-[#6F5A4E] hover:text-[#3E2F2A] cursor-pointer"
                  >
                    Centrar
                  </button>
                  <button
                    type="button"
                    data-testid="close-3d-cafe-btn"
                    onClick={() => setActiveOverlay(null)}
                    className="px-3.5 py-1.5 rounded-xl cafe-btn-primary font-bold cursor-pointer"
                  >
                    Volver al tablero
                  </button>
                </div>
              </div>

              <Suspense
                fallback={
                  <div
                    className="w-full h-[360px] sm:h-[460px] rounded-2xl bg-[#F7EEDF] flex items-center justify-center text-sm font-serif font-bold text-[#6F5A4E]"
                    data-testid="cafe-3d-diorama"
                  >
                    Preparando el salón 3D del café...
                  </div>
                }
              >
                <LazyPapercraftBoard
                  gameState={gameState}
                  selectedTile={selectedTile}
                  draftPlacements={draftPlacements}
                  seatInspections={seatInspections}
                  focusedTableId={focusedTableId}
                  viewMode="3d"
                  cameraPreset={cameraPreset}
                  cameraAngleIndex={cameraAngleIndex}
                  cameraZoom={cameraZoom}
                  nightMode={nightMode}
                  reducedMotion={reducedMotion}
                  onSeatClick={handleSeatClick}
                  onTableClick={handleTableClick}
                  onBarClick={handleBarClick}
                />
              </Suspense>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ON-DEMAND SLIDE-OVER LATERAL DRAWER FOR MOVE LOG & CHAT (Waiter's Notepad / Cuaderno de Tertulia) */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
            className="fixed inset-0 z-50 flex justify-end bg-[#231712]/45"
            role="dialog"
            aria-modal="true"
            aria-label="Registro de jugadas y chat"
            data-testid="log-chat-drawer"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveOverlay(null);
            }}
          >
            <motion.div
              initial={reducedMotion ? false : { x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { x: 80, opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
              className="w-full max-w-sm h-full cafe-paper-sheet text-[#3E2F2A] p-4 border-l-3 border-[#1E130E] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#C96F4A]">
                    Cuaderno de camarero · O &amp; A
                  </span>
                </div>
                <div className="flex items-center justify-between cafe-double-rule pb-3">
                  <div className="flex items-center gap-1 bg-[#F7EEDF] p-1 rounded-xl border border-[#231712]/15">
                    <button
                      type="button"
                      onClick={() => setSideTab('log')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        sideTab === 'log'
                          ? 'bg-[#FFF9F0] text-[#231712] shadow-2xs border border-[#231712]/15'
                          : 'text-[#6F5A4E]'
                      }`}
                    >
                      Registro ({gameState.log.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSideTab('chat')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        sideTab === 'chat'
                          ? 'bg-[#FFF9F0] text-[#231712] shadow-2xs border border-[#231712]/15'
                          : 'text-[#6F5A4E]'
                      }`}
                    >
                      Chat ({snapshot.chat.length})
                    </button>
                  </div>
                  <button
                    type="button"
                    data-testid="close-drawer-btn"
                    onClick={() => setActiveOverlay(null)}
                    className="px-3 py-1 rounded-xl cafe-btn-paper text-xs font-bold text-[#3E2F2A] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Cerrar</span>
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                      <path
                        d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {sideTab === 'log' ? (
                <div
                  className="flex-1 overflow-y-auto space-y-2 py-3 pr-1 text-xs"
                  data-testid="move-log-list"
                >
                  {gameState.log.length === 0 ? (
                    <p className="text-[#6F5A4E] italic">
                      Aún no se han realizado jugadas. El jugador inicial abre el café.
                    </p>
                  ) : (
                    gameState.log
                      .slice()
                      .reverse()
                      .map((ev, i) => {
                        let pid = '';
                        let desc = '';
                        let delta: number | null = null;
                        if (ev.type === 'tile_seated') {
                          const prof = getCharacterProfile(
                            ev.tile.nation,
                            ev.tile.gender,
                            ev.tile.jokerNation,
                            ev.tile.id,
                          );
                          pid = ev.playerId;
                          desc = `sentó a ${prof.name} (${prof.countryName})`;
                          delta = ev.pointsEarned;
                        } else if (ev.type === 'tile_bar') {
                          const prof = getCharacterProfile(
                            ev.tile.nation,
                            ev.tile.gender,
                            ev.tile.jokerNation,
                            ev.tile.id,
                          );
                          pid = ev.playerId;
                          desc = `sirvió a ${prof.name} en la barra (#${ev.barIndex + 1})`;
                          delta = ev.pointsDelta;
                        } else if (ev.type === 'joker_swapped') {
                          pid = ev.playerId;
                          desc = `cambió el comodín en mesa`;
                          delta = 0;
                        } else if (ev.type === 'turn_timeout_auto_move') {
                          pid = ev.playerId;
                          desc = 'jugada automática por tiempo';
                        } else if (ev.type === 'hand_size_reduced') {
                          pid = ev.playerId;
                          desc = `completó mesa nacional (mano máx. ${ev.newHandSize})`;
                        } else if (ev.type === 'game_started') {
                          pid = ev.startingPlayerId;
                          desc = 'abrió las puertas del café';
                        } else {
                          return null;
                        }
                        const pl = gameState.players.find((p) => p.id === pid);
                        const plAvatar = avatarByPlayerId[pid] ?? pl?.avatarId ?? 'moka';
                        return (
                          <div
                            key={`${ev.type}-${i}`}
                            className="p-2.5 rounded-xl cafe-paper-subpanel text-[#3E2F2A] flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <PlayerAvatar avatarId={plAvatar} size={18} />
                              <div className="truncate">
                                <span className="font-bold">{pl?.nickname ?? pid}:</span>{' '}
                                <span>{desc}</span>
                              </div>
                            </div>
                            {delta !== null && (
                              <span
                                className={`font-serif font-bold tabular-nums shrink-0 ${
                                  delta >= 0 ? 'text-[#3F5E4A]' : 'text-[#A94438]'
                                }`}
                              >
                                {delta >= 0 ? `+${delta}` : delta}
                              </span>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0 py-3">
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs mb-2">
                    {snapshot.chat.length === 0 ? (
                      <p className="text-[#6F5A4E] italic">
                        Saluda a la mesa o envía una reacción rápida.
                      </p>
                    ) : (
                      snapshot.chat.map((msg) => {
                        const msgAvatar =
                          msg.avatarId ?? avatarByPlayerId[msg.senderId] ?? 'moka';
                        return (
                          <div
                            key={msg.id}
                            className="p-2 rounded-xl cafe-paper-subpanel flex items-center gap-2"
                          >
                            <PlayerAvatar avatarId={msgAvatar} size={20} />
                            <div>
                              <span className="font-bold text-[#3E2F2A]">{msg.nickname}: </span>
                              <span className={msg.emote ? 'text-base' : 'text-[#6F5A4E]'}>
                                {msg.emote ?? msg.text}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-2">
                    {['☕ ¡Salud!', '🥐 ¡Buena mesa!', '👏 ¡Bravo!', '🎩 ¡Qué elegancia!'].map(
                      (emote) => (
                        <button
                          key={emote}
                          type="button"
                          onClick={() => void sendChat(emote, true)}
                          className="px-2.5 py-1.5 rounded-lg cafe-btn-paper text-xs font-semibold cursor-pointer"
                        >
                          {emote.split(' ')[0]}
                        </button>
                      ),
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!chatInput.trim()) return;
                      void sendChat(chatInput, false);
                      setChatInput('');
                    }}
                    className="flex gap-1.5"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Mensaje corto..."
                      maxLength={120}
                      className="flex-1 h-10 px-3 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/25 text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3.5 h-10 rounded-xl cafe-btn-primary text-xs font-bold cursor-pointer"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PAPER_CONFETTI_PIECES = Array.from({ length: 36 }, (_, idx) => ({
  id: idx,
  leftPct: 3 + ((idx * 29) % 94),
  color:
    idx % 5 === 0
      ? '#C9A227'
      : idx % 5 === 1
        ? '#B3261E'
        : idx % 5 === 2
          ? '#1E4E8C'
          : idx % 5 === 3
            ? '#3F5E4A'
            : '#C96F4A',
  delay: (idx % 7) * 0.12,
  duration: 2.0 + (idx % 4) * 0.35,
  rotate: (idx % 2 === 0 ? 1 : -1) * (180 + idx * 14),
}));

/**
 * P0.3 — Full-Screen Staged Closing Celebration & Farewell Café Postcard (FinishedScreen)
 */
export function FinishedScreen(): React.ReactElement {
  const snapshot = useGameStore((s) => s.snapshot);
  const shareResult = useGameStore((s) => s.shareResult);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const voteRematch = useGameStore((s) => s.voteRematch);
  const leaveRoom = useGameStore((s) => s.leaveRoom);
  const [postcardUrl, setPostcardUrl] = useState<string | null>(null);
  const [recountStep, setRecountStep] = useState<'table' | 'penalty' | 'final'>(
    reducedMotion ? 'final' : 'table',
  );
  const [sequenceSkipped, setSequenceSkipped] = useState<boolean>(reducedMotion);

  useEffect(() => {
    if (reducedMotion || sequenceSkipped) {
      setRecountStep('final');
      return;
    }
    soundEngine.playSfx('bell');
    const t1 = setTimeout(() => {
      soundEngine.playSfx('coinPenalty');
      setRecountStep('penalty');
    }, 550);
    const t2 = setTimeout(() => {
      soundEngine.playSfx('victoryFanfare');
      setRecountStep('final');
    }, 1150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reducedMotion, sequenceSkipped]);

  if (!snapshot || !snapshot.gameState) return <div />;

  const summary = finalScores(snapshot.gameState);
  const standings = snapshot.gameState.players
    .map((p) => {
      const s = summary.scores[p.id];
      const member = snapshot.members.find((m) => m.id === p.id);
      const isBot = p.isBot || member?.role === 'bot';
      return {
        id: p.id,
        nickname: p.nickname,
        isBot,
        avatarId: member?.avatarId ?? p.avatarId ?? 'moka',
        tablePoints: s?.tableAndBarScore ?? p.score,
        naturalLeft: s?.naturalTilesRemaining ?? 0,
        jokerLeft: s?.jokersRemaining ?? 0,
        penalty: s?.handPenalty ?? 0,
        finalScore: s?.finalScore ?? p.score,
        isWinner: summary.winners.includes(p.id),
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  const isSharedVictory = summary.winners.length > 1;
  const topWinner = standings.find((st) => st.isWinner) ?? standings[0];

  const humanPlayers = snapshot.members.filter((m) => m.role === 'player');
  const rematchVotesCount = humanPlayers.filter((m) => m.rematchVote === true).length;

  const reasonLabels: Record<string, string> = {
    last_seat_occupied: 'Se ha ocupado la última silla del café.',
    bar_full: 'Se ha llenado la vigésima plaza de la barra.',
    player_empty_hand: 'Un jugador ha agotado su mano sin fichas para robar.',
    bag_threshold_reached: 'Quedan solo 3 fichas en la bolsa de terciopelo.',
    last_player_standing: 'El resto de jugadores abandonaron la mesa.',
  };

  const generatePostcard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 460;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#F7EEDF';
    ctx.fillRect(0, 0, 800, 460);
    ctx.strokeStyle = '#C9A227';
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, 764, 424);

    ctx.fillStyle = '#3E2F2A';
    ctx.font = 'bold 36px serif';
    ctx.fillText('Cafetulia — una tertulia de café', 48, 72);

    ctx.fillStyle = '#6F5A4E';
    ctx.font = '18px sans-serif';
    ctx.fillText(
      `Mesa #${snapshot.code} · ${new Date().toLocaleDateString('es-ES')} · O & A`,
      48,
      106,
    );

    standings.forEach((row, idx) => {
      const y = 168 + idx * 56;
      ctx.fillStyle = row.isWinner ? '#FEF6E0' : '#FFF9F0';
      ctx.fillRect(48, y - 34, 704, 46);
      ctx.fillStyle = '#3E2F2A';
      ctx.font = 'bold 21px sans-serif';
      ctx.fillText(
        `${idx + 1}. ${row.nickname}${row.isBot ? ' (Bot)' : ''} ${row.isWinner ? '★ Ganador' : ''}`,
        66,
        y - 4,
      );
      ctx.textAlign = 'right';
      ctx.fillText(
        `${formatScoreEs(row.tablePoints)} pts − ${formatScoreEs(Math.abs(row.penalty))} penaliz. = ${formatScoreEs(row.finalScore)} pts`,
        730,
        y - 4,
      );
      ctx.textAlign = 'left';
    });

    setPostcardUrl(canvas.toDataURL('image/png'));
  };

  return (
    <div
      data-testid="finished-screen"
      className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden p-2 sm:p-5 flex flex-col items-center justify-center relative select-none bg-[#E6D3B8]"
    >
      {/* Warm Evening Café Window Backdrop */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="closing-glow" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF7E4" stopOpacity="0.88" />
            <stop offset="55%" stopColor="#EAD9C0" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#5C3A21" stopOpacity="0.35" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="1440" height="900" fill="url(#closing-glow)" />
        {/* Wood wainscot & brass lamps */}
        <rect x="0" y="650" width="1440" height="250" fill="#5C3A21" opacity="0.85" />
        <line x1="0" y1="650" x2="1440" y2="650" stroke="#C9A227" strokeWidth="4" />
        <circle cx="240" cy="180" r="85" fill="#FFF6DE" opacity="0.45" />
        <circle cx="1200" cy="180" r="85" fill="#FFF6DE" opacity="0.45" />
      </svg>

      {/* 3. Joyful 36-Piece Paper Confetti Shower (2–3 s, café/crema/rojo/azul) */}
      {!reducedMotion && (
        <div
          className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
          aria-hidden="true"
          data-testid="final-paper-confetti"
        >
          {PAPER_CONFETTI_PIECES.map((piece) => (
            <motion.span
              key={piece.id}
              initial={{ y: -24, opacity: 1, rotate: 0 }}
              animate={{ y: '94vh', opacity: [1, 1, 0], rotate: piece.rotate }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeOut',
              }}
              style={{
                left: `${piece.leftPct}%`,
                backgroundColor: piece.color,
              }}
              className="fixed top-0 w-3 h-2 rounded-[2px] border border-[#231712]/40 shadow-2xs"
            />
          ))}
        </div>
      )}

      {/* Main Farewell Café Postcard Sheet */}
      <div className="relative z-20 w-full max-w-4xl cafe-paper-sheet rounded-[24px] p-3.5 sm:p-6 max-h-[96dvh] flex flex-col justify-between overflow-hidden gap-2.5 sm:gap-3.5">
        {/* Decorative Washi Tape & Postmark Stamp */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-4 rotate-[-1deg] bg-[#EAD9C0]/90 border border-[#8B5E3C]/35 rounded-xs shadow-2xs"
        />

        {/* Top Row: 1. Large Stamp «¡FINAL!» + Terminal Reason + Skip Button */}
        <div className="shrink-0 flex items-center justify-between gap-2 cafe-double-rule pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <motion.span
              data-testid="final-stamp-heading"
              initial={reducedMotion ? false : { scale: 1.35, rotate: -6, opacity: 0 }}
              animate={{ scale: 1, rotate: -2, opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.28, ease: 'easeOut' }}
              className="inline-block px-3 py-1 rounded-xl bg-[#C96F4A] text-[#FFF9F0] border-2 border-[#1E130E] shadow-[3px_3px_0_#1E130E] font-serif font-extrabold text-lg sm:text-2xl tracking-wider uppercase shrink-0"
            >
              ¡FINAL!
            </motion.span>
            <div className="min-w-0">
              <span className="text-[11px] font-extrabold text-[#C96F4A] block uppercase tracking-[0.14em]">
                Postal de despedida · Sala #{snapshot.code}
              </span>
              <p className="text-xs text-[#6F5A4E] truncate">
                {reasonLabels[
                  shareResult?.terminalReason ??
                    snapshot.gameState.terminalReason ??
                    'last_seat_occupied'
                ] ?? 'Partida concluida.'}
              </p>
            </div>
          </div>

          {recountStep !== 'final' && (
            <button
              type="button"
              data-testid="skip-final-sequence-btn"
              onClick={() => {
                setSequenceSkipped(true);
                setRecountStep('final');
              }}
              className="px-3 py-1 rounded-xl cafe-btn-paper text-xs font-bold text-[#3E2F2A] cursor-pointer shrink-0"
            >
              Saltar
            </button>
          )}
        </div>

        {/* 2. Winner Hero Showcase («Gana [nombre]» or «Victoria compartida») */}
        {topWinner && (
          <motion.div
            data-testid="final-winner-hero"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.24 }}
            className="shrink-0 bg-[#FEF6E0] rounded-2xl border-2 border-[#C9A227] shadow-[0_3px_0_#1E130E] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1 rounded-2xl bg-[#FFF9F0] border-2 border-[#1E130E] shadow-[0_2px_0_#1E130E] shrink-0">
                <PlayerAvatar avatarId={topWinner.avatarId} size={48} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-[#C9A227] text-[#231712] text-[10px] font-extrabold uppercase tracking-wider">
                    {isSharedVictory ? 'Empate en cabeza' : 'Ganador de la velada'}
                  </span>
                  {topWinner.isBot && (
                    <span className="px-2 py-0.5 rounded-full bg-[#3E2F2A] text-[#FFF9F0] text-[10px] font-bold">
                      Autómata del café
                    </span>
                  )}
                </div>
                <h1 className="font-serif font-extrabold text-xl sm:text-3xl text-[#231712] truncate mt-0.5">
                  {isSharedVictory
                    ? '¡Victoria compartida!'
                    : `Gana ${topWinner.nickname}`}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <CoinTray
                score={topWinner.finalScore}
                playerId={`hero-${topWinner.id}`}
                reducedMotion={reducedMotion || sequenceSkipped}
              />
            </div>
          </motion.div>
        )}

        {/* 4. Staggered Standings List (1st to last, including bots) */}
        <div
          data-testid="final-standings-list"
          className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5"
        >
          {standings.map((st, idx) => {
            const shownScore =
              recountStep === 'table' ? st.tablePoints : st.finalScore;

            return (
              <motion.div
                key={st.id}
                data-testid={`final-standing-row-${idx + 1}`}
                initial={reducedMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.2,
                  delay: reducedMotion ? 0 : idx * 0.08,
                }}
                className={`p-2.5 sm:p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2 transition-all ${
                  st.isWinner
                    ? 'bg-[#FEF6E0]/95 border-[#C9A227] border-2 shadow-[0_2px_0_#1E130E]'
                    : 'cafe-paper-subpanel'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-[#231712] text-[#FFF9F0] font-serif font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <PlayerAvatar avatarId={st.avatarId} size={30} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-serif font-bold text-sm sm:text-base text-[#231712] truncate">
                        {st.nickname}
                      </span>
                      {st.isBot && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FFF9F0] border border-[#231712]/20 text-[#6F5A4E]">
                          Bot
                        </span>
                      )}
                      {st.isWinner && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#3F5E4A] bg-[#E6F4EA] px-1.5 py-0.2 rounded border border-[#3F5E4A]/30">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 12 12"
                            aria-hidden="true"
                            className="shrink-0"
                          >
                            <polygon
                              points="6,0.8 7.6,4.1 11.2,4.6 8.6,7.1 9.2,10.7 6,9 2.8,10.7 3.4,7.1 0.8,4.6 4.4,4.1"
                              fill="currentColor"
                            />
                          </svg>
                          <span>{isSharedVictory ? 'Victoria compartida' : 'Ganador'}</span>
                        </span>
                      )}
                    </div>
                    <span className="block text-[11px] text-[#6F5A4E] tabular-nums">
                      Mesas y barra: <strong>{formatScoreEs(st.tablePoints)} pts</strong>
                      {recountStep !== 'table' && (
                        <>
                          {' · '}Penalización:{' '}
                          <strong className="text-[#A94438]">
                            -{formatScoreEs(Math.abs(st.penalty))} pts
                          </strong>{' '}
                          ({st.naturalLeft} nat. / {st.jokerLeft} com.)
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 ml-auto">
                  <CoinTray
                    score={shownScore}
                    playerId={st.id}
                    reducedMotion={reducedMotion || sequenceSkipped}
                  />
                </div>
              </motion.div>
            );
          })}

          {postcardUrl && (
            <div className="cafe-paper-subpanel p-2.5 rounded-2xl text-center space-y-1.5">
              <img
                src={postcardUrl}
                alt="Postal de resultado de Cafetulia"
                referrerPolicy="no-referrer"
                className="mx-auto rounded-xl border border-[#231712]/20 max-h-36"
              />
              <a
                href={postcardUrl}
                download={`cafetulia-${snapshot.code}.png`}
                className="inline-block px-3.5 py-1 rounded-xl cafe-btn-sage text-xs font-bold"
              >
                Descargar postal PNG
              </a>
            </div>
          )}
        </div>

        {/* 5. Warm Credits & Dedication Block (O & A) */}
        <div
          data-testid="final-credits-block"
          className="shrink-0 cafe-paper-subpanel px-3 py-2 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6F5A4E]"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif font-bold text-[#231712]">
              Cafetulia — una tertulia de café
            </span>
            <span>· Arte original</span>
            <span>· Gracias por jugar</span>
          </div>
          <span
            data-testid="final-credits-oa"
            className="font-serif font-bold text-[#231712] bg-[#FEF6E0] px-2.5 py-0.5 rounded-lg border border-[#C9A227] shadow-[0_1px_0_#1E130E]"
            title="Dedicatoria del café"
          >
            Dedicatoria: O &amp; A
          </span>
        </div>

        {/* 6. Clear Footer Actions */}
        <div className="shrink-0 pt-2 border-t border-[#3E2F2A]/15 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            data-testid="generate-postcard-btn"
            onClick={generatePostcard}
            className="px-3.5 py-2 rounded-xl cafe-btn-paper text-xs font-bold text-[#3E2F2A] cursor-pointer"
          >
            Generar postal
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              data-testid="back-to-title-btn"
              onClick={leaveRoom}
              className="px-3.5 py-2 rounded-xl cafe-btn-paper text-xs font-bold text-[#3E2F2A] cursor-pointer"
            >
              Volver a la portada
            </button>
            <button
              type="button"
              data-start="true"
              data-testid="rematch-btn"
              onClick={() => void voteRematch(true)}
              className="px-4 py-2 rounded-xl cafe-btn-primary text-xs font-bold cursor-pointer"
            >
              Votar revancha ({rematchVotesCount}/{Math.max(1, humanPlayers.length)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
