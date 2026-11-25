import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  MUSIC_MOODS,
  NATION_VISUALS,
  PRESET_AVATARS,
  type MusicMoodId,
  type NationKey,
} from '@cafetulia/ui';
import { soundEngine } from '../audio/soundEngine';
import { CharacterPortrait, FlagBadge, PlayerAvatar } from '../art/CharacterPortrait';
import { useGameStore } from '../store/gameStore';
import { getNationName } from '../utils/moveHelper';
import { TutorialContent } from './TutorialContent';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
  });
}

export type AnchoredPopoverProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  id?: string;
  role?: 'dialog' | 'radiogroup' | 'menu';
  ariaLabel: string;
  testId?: string;
  maxWidth?: number;
  preferPlacement?: 'bottom-end' | 'bottom-start' | 'top-end';
  children: React.ReactNode;
};

/**
 * Portal-rendered popover/bottom-sheet that measures its trigger button and its own box,
 * clamping coordinates so it NEVER overflows the viewport (0..innerWidth, 0..innerHeight).
 * Restores focus to the trigger button on close and supports Escape & outside click.
 */
export function AnchoredPopover({
  open,
  onClose,
  anchorRef,
  id,
  role = 'dialog',
  ariaLabel,
  testId,
  maxWidth = 340,
  preferPlacement = 'bottom-end',
  children,
}: AnchoredPopoverProps): React.ReactElement | null {
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{
    left: number;
    top: number;
    width: number;
    placement: 'top' | 'bottom';
    originX: number;
  }>({
    left: 12,
    top: 56,
    width: Math.min(maxWidth, typeof window !== 'undefined' ? window.innerWidth - 16 : maxWidth),
    placement: 'bottom',
    originX:
      Math.min(maxWidth, typeof window !== 'undefined' ? window.innerWidth - 16 : maxWidth) / 2,
  });

  const updatePosition = () => {
    if (typeof window === 'undefined') return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 8;
    const width = Math.min(maxWidth, vw - margin * 2);
    const panelHeight = panelRef.current?.offsetHeight || 290;

    const anchorEl = anchorRef.current;
    if (!anchorEl) {
      const left = Math.max(margin, Math.round((vw - width) / 2));
      const top = Math.max(margin, Math.round((vh - panelHeight) / 2));
      setCoords({ left, top, width, placement: 'bottom', originX: width / 2 });
      return;
    }

    const rect = anchorEl.getBoundingClientRect();
    let desiredLeft = preferPlacement === 'bottom-start' ? rect.left : rect.right - width;
    desiredLeft = Math.max(margin, Math.min(vw - width - margin, Math.round(desiredLeft)));

    // Anchor every popover to its trigger, also on mobile. If there is no room
    // below, flip above; the panel keeps its own scroll for very tall menus.
    const belowTop = rect.bottom + 10;
    const aboveTop = rect.top - panelHeight - 10;
    let desiredTop = preferPlacement === 'top-end' ? aboveTop : belowTop;
    let placement: 'top' | 'bottom' = preferPlacement === 'top-end' ? 'top' : 'bottom';
    if (placement === 'bottom') {
      if (belowTop + panelHeight + margin > vh) {
        if (aboveTop >= margin) {
          desiredTop = aboveTop;
          placement = 'top';
        } else {
          desiredTop = Math.max(margin, vh - panelHeight - margin);
          placement = desiredTop < rect.top ? 'top' : 'bottom';
        }
      }
    } else if (aboveTop < margin) {
      if (belowTop + panelHeight + margin <= vh) {
        desiredTop = belowTop;
        placement = 'bottom';
      } else {
        desiredTop = margin;
      }
    }
    desiredTop = Math.max(margin, Math.round(desiredTop));

    const anchorCenter = rect.left + rect.width / 2;
    const originX = Math.max(12, Math.min(width - 12, Math.round(anchorCenter - desiredLeft)));

    setCoords({
      left: desiredLeft,
      top: desiredTop,
      width,
      placement,
      originX,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const raf = window.requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, maxWidth, preferPlacement]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        anchorRef.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      // If clicking another overlay/modal trigger button, let that button's onClick switch the state directly
      if (
        target instanceof Element &&
        target.closest(
          '[data-testid="board-legend-btn"], [data-testid="rival-hands-btn"], [data-testid="subtitles-dropdown-btn"], [data-testid="avatar-dropdown-btn"], [data-testid="open-3d-cafe-btn"], [data-testid="open-drawer-btn"], [data-testid="header-settings-btn"], [data-testid="header-more-btn"], [data-testid="joker-swap-btn"]',
        )
      ) {
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [open, onClose, anchorRef]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <motion.div
            ref={panelRef}
            id={id}
            role={role}
            aria-label={ariaLabel}
            data-testid={testId}
            initial={
              reducedMotion
                ? { opacity: 1 }
                : {
                    opacity: 0,
                    y: coords.placement === 'top' ? 10 : -10,
                    scale: 0.96,
                  }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: coords.placement === 'top' ? 7 : -7,
                    scale: 0.97,
                  }
            }
            transition={{
              duration: reducedMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: 'fixed',
              left: `${coords.left}px`,
              top: `${coords.top}px`,
              width: `${coords.width}px`,
              maxHeight: 'calc(100dvh - 16px)',
              transformOrigin: `${coords.originX}px ${coords.placement === 'top' ? 'bottom' : 'top'}`,
            }}
            className="pointer-events-auto overflow-y-auto cafe-paper-sheet text-[#3E2F2A] rounded-2xl p-3 text-xs shadow-[0_18px_44px_rgba(35,23,18,0.24)]"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function ActiveModalLayer(): React.ReactElement | null {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const pendingNegativeConfirm = useGameStore((s) => s.pendingNegativeConfirm);
  const setPendingNegativeConfirm = useGameStore((s) => s.setPendingNegativeConfirm);
  const submitMove = useGameStore((s) => s.submitMove);
  const reducedMotion = useGameStore((s) => s.reducedMotion);

  if (pendingNegativeConfirm) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#231712]/60 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="neg-confirm-title"
      >
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.16 }}
          className="w-full max-w-md rounded-[22px] cafe-paper-sheet text-[#3E2F2A] p-6"
        >
          <h3 id="neg-confirm-title" className="font-serif font-bold text-2xl text-[#A94438]">
            Confirmar jugada con puntos negativos
          </h3>
          <p className="mt-2 text-sm text-[#6F5A4E] leading-relaxed">
            {pendingNegativeConfirm.description} Esta acción restará{' '}
            <strong className="text-[#A94438] tabular-nums">
              {Math.abs(pendingNegativeConfirm.points)} puntos
            </strong>{' '}
            a tu marcador. ¿Deseas continuar?
          </p>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('uiCancel');
                setPendingNegativeConfirm(null);
              }}
              className="px-4 py-2.5 rounded-xl cafe-btn-paper text-[#3E2F2A] font-semibold text-sm cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              data-testid="confirm-negative-move-btn"
              onClick={() => {
                soundEngine.playSfx('uiConfirm');
                const move = pendingNegativeConfirm.move;
                setPendingNegativeConfirm(null);
                void submitMove(move);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#A94438] text-[#FFF9F0] font-bold text-sm border border-[#231712] shadow-[0_2px_0_#231712] hover:opacity-95 cursor-pointer"
            >
              Sí, asumir {pendingNegativeConfirm.points} pts
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const wideModal = activeModal === 'rules' || activeModal === 'settings';

  return (
    <AnimatePresence>
      {activeModal === 'tutorial' && (
        <TutorialContent key="tutorial" onClose={() => setActiveModal(null)} />
      )}

      {activeModal && activeModal !== 'tutorial' && (
        <motion.div
          key={activeModal}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#231712]/55 p-2 sm:p-4 overflow-hidden"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
            className={
              wideModal
                ? 'w-full max-w-5xl my-auto max-h-[94dvh] overflow-hidden rounded-[24px] cafe-paper-sheet text-[#3E2F2A]'
                : 'w-full max-w-2xl rounded-[24px] cafe-paper-sheet text-[#3E2F2A] p-5 sm:p-7 my-auto max-h-[90dvh] overflow-y-auto cafe-scroll'
            }
          >
            {activeModal === 'rules' && <RulesContent onClose={() => setActiveModal(null)} />}
            {activeModal === 'stats' && <StatsContent onClose={() => setActiveModal(null)} />}
            {activeModal === 'settings' && <SettingsContent onClose={() => setActiveModal(null)} />}
            {activeModal === 'ios_pwa' && <IosPwaContent onClose={() => setActiveModal(null)} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const RULE_CHAPTERS = [
  { label: 'La mesa', hint: 'Fichas, países y manos' },
  { label: 'Sentar invitados', hint: 'Las tres reglas de oro' },
  { label: 'Puntos y monedas', hint: 'Mesas, barra y pagos' },
  { label: 'Final y comodines', hint: 'Casos especiales' },
] as const;

const BAR_VALUES = [
  1, 2, 3, 4, 5, -2, -4, -6, -8, -10, -4, -6, -8, -10, -12, -6, -8, -10, -12, -14,
];

function RulesContent({ onClose }: { onClose: () => void }): React.ReactElement {
  const [chapter, setChapter] = useState(0);
  const nationsOrder: NationKey[] = [
    'af',
    'it',
    'ch',
    'es',
    'ru',
    'in',
    'am',
    'al',
    'tu',
    'cu',
    'en',
    'fr',
  ];
  const current = RULE_CHAPTERS[chapter] ?? RULE_CHAPTERS[0];

  return (
    <div className="flex h-[min(90dvh,780px)] max-h-[94dvh] flex-col text-[#3E2F2A]">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-[#3E2F2A]/15 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#C96F4A]">
            La casa explica · Edición O &amp; A
          </span>
          <h2 className="font-serif text-xl font-bold leading-tight text-[#231712] sm:text-3xl">
            Reglamento de Cafetulia
          </h2>
          <p className="mt-0.5 hidden text-[11px] text-[#6F5A4E] sm:block">
            Cuatro capítulos, cero letra pequeña. Lo justo para sentarte a jugar.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[40px] shrink-0 rounded-xl border-2 border-[#231712] bg-gradient-to-b from-[#D1744E] to-[#BE5F3A] px-3.5 text-xs font-extrabold text-[#FFFDF8] shadow-[0_3px_0_#231712] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          Volver a la mesa
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <nav className="shrink-0 border-b border-[#3E2F2A]/12 bg-[#F5EBDD]/55 p-2 sm:w-[236px] sm:border-b-0 sm:border-r sm:p-3">
          <p className="mb-2 hidden px-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#8A7365] sm:block">
            Cuatro capítulos
          </p>
          <div className="grid grid-cols-4 gap-1 sm:flex sm:flex-col sm:gap-1.5">
            {RULE_CHAPTERS.map((c, idx) => {
              const active = idx === chapter;
              const shortLabel =
                idx === 0 ? 'La mesa' : idx === 1 ? 'Sentar' : idx === 2 ? 'Puntos' : 'Final';
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setChapter(idx)}
                  aria-current={active ? 'step' : undefined}
                  className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-1.5 text-center transition-colors sm:flex-row sm:justify-start sm:gap-2 sm:px-2.5 sm:py-2 sm:text-left ${
                    active
                      ? 'border-[#C96F4A] bg-[#FFF9F0] shadow-[0_2px_0_#231712]'
                      : 'border-transparent hover:border-[#231712]/15 hover:bg-[#FFF9F0]/60'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 font-serif text-xs font-bold sm:h-7 sm:w-7 sm:text-sm ${
                      active
                        ? 'border-[#231712] bg-[#C96F4A] text-[#FFFDF8]'
                        : 'border-[#231712]/25 bg-[#FFFDF8] text-[#7B5236]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="min-w-0 w-full sm:w-auto">
                    <span className="block truncate text-[9px] font-extrabold text-[#3E2F2A] sm:hidden">
                      {shortLabel}
                    </span>
                    <span className="hidden truncate text-[11px] font-extrabold text-[#3E2F2A] sm:block">
                      {c.label}
                    </span>
                    <span className="hidden truncate text-[9px] text-[#8A7365] sm:block">
                      {c.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto hidden rounded-xl border border-[#C9A227]/45 bg-[#FEF6E0] p-2.5 text-[10px] leading-snug text-[#6B4A2F] sm:block">
            <strong className="block font-extrabold text-[#7B5236]">Atajo de la casa</strong>
            Si dudas en tu turno, abre la leyenda <span className="font-bold">?</span> del tablero.
            Te recuerda qué es cada silla sin salir de la partida.
          </div>
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto cafe-scroll">
          <div className="mx-auto max-w-3xl p-4 pb-8 sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-3 border-b-2 border-[#3E2F2A]/12 pb-2">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#C96F4A]">
                  Capítulo {chapter + 1} de {RULE_CHAPTERS.length}
                </p>
                <h3 className="font-serif text-2xl font-bold text-[#231712] sm:text-3xl">
                  {current.label}
                </h3>
              </div>
              <span className="hidden text-[10px] font-bold text-[#8A7365] sm:block">
                {current.hint}
              </span>
            </div>

            {chapter === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      value: '100',
                      label: 'fichas en la bolsa',
                      note: '96 invitados + 4 comodines',
                    },
                    { value: '5', label: 'fichas en tu mano', note: 'siempre boca arriba' },
                    { value: '68', label: 'sillas en el café', note: '28 compartidas' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl border border-[#231712]/15 bg-[#FFF9F0] p-2.5 text-center shadow-[0_2px_0_rgba(35,23,18,0.15)] sm:p-3"
                    >
                      <div className="font-serif text-2xl font-extrabold leading-none text-[#C96F4A] sm:text-3xl">
                        {s.value}
                      </div>
                      <div className="mt-1 text-[10px] font-extrabold leading-tight text-[#3E2F2A] sm:text-[11px]">
                        {s.label}
                      </div>
                      <div className="mt-0.5 text-[8px] leading-tight text-[#8A7365] sm:text-[9px]">
                        {s.note}
                      </div>
                    </div>
                  ))}
                </div>

                <section className="rounded-2xl border border-[#231712]/15 bg-[#F5EBDD] p-3 sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-serif text-lg font-bold text-[#231712]">
                      Los 12 países, en orden horario
                    </h4>
                    <span className="rounded-full border border-[#C9A227]/50 bg-[#FEF6E0] px-2 py-0.5 text-[9px] font-extrabold text-[#7B5236]">
                      4 mesas por país
                    </span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {nationsOrder.map((code, idx) => {
                      const meta = NATION_VISUALS[code];
                      return (
                        <div
                          key={code}
                          className="flex items-center gap-1.5 rounded-xl border border-[#3E2F2A]/12 bg-[#FFF9F0] px-2 py-1.5 text-[11px]"
                        >
                          <span className="font-mono text-[9px] font-bold text-[#8A7365]">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <FlagBadge nation={code} size={16} />
                          <span className="truncate font-bold">{meta.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <div className="flex items-start gap-2.5 rounded-2xl border border-[#3F5E4A]/30 bg-[#E6F4EA] p-3 text-[11px] leading-snug text-[#3F5E4A]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3F5E4A] text-[#FFF9F0]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M3 12s3.5-5.5 9-5.5S21 12 21 12s-3.5 5.5-9 5.5S3 12 3 12Z"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.9" />
                    </svg>
                  </span>
                  <p>
                    <strong className="font-extrabold">Tu mano es pública.</strong> Todos ven tus 5
                    invitados: la partida se juega mirando también lo que pueden sentar los demás.
                  </p>
                </div>
              </div>
            )}

            {chapter === 1 && (
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#231712]/15 bg-[#FFF9F0] p-3">
                    <div className="flex items-center gap-1.5">
                      <FlagBadge nation="fr" size={20} />
                      <span className="text-xs font-extrabold">Mismo país</span>
                      <span className="ml-auto text-[15px] font-bold text-[#3F5E4A]">✓</span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-snug text-[#6F5A4E]">
                      Cada mesa solo admite invitados de su país. Las sillas compartidas aceptan una
                      de sus dos naciones.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#231712]/15 bg-[#FFF9F0] p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold">Equilibrio 2H · 2M</span>
                      <span className="ml-auto text-[15px] font-bold text-[#3F5E4A]">✓</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1">
                      {['H', 'H', 'M', 'M'].map((g, i) => (
                        <span
                          key={i}
                          className={`flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-extrabold ${
                            g === 'H'
                              ? 'border-[#1E4E8C]/35 bg-[#E6EEF8] text-[#1E4E8C]'
                              : 'border-[#9E2A2B]/30 bg-[#FDECEB] text-[#9E2A2B]'
                          }`}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11px] leading-snug text-[#6F5A4E]">
                      Máximo 2 hombres y 2 mujeres por mesa. Se permiten 1H+1M, 1H+2M, 2H+1M y
                      2H+2M.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#231712]/15 bg-[#FFF9F0] p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold">Nadie se sienta solo</span>
                      <span className="ml-auto text-[15px] font-bold text-[#3F5E4A]">✓</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1">
                      <CharacterPortrait nation="fr" gender="M" size={24} />
                      <CharacterPortrait nation="fr" gender="F" size={24} />
                      <span className="ml-1 text-[10px] font-bold text-[#3F5E4A]">pareja</span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-snug text-[#6F5A4E]">
                      Al abrir una mesa, sienta siempre una pareja. Un invitado solo solo vale en
                      una silla compartida si la otra mesa ya tiene compañía.
                    </p>
                  </div>
                </div>

                <section className="rounded-2xl border-2 border-[#C9A227]/55 bg-[#FEF6E0] p-3 sm:p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-serif text-lg font-bold text-[#231712]">
                      La silla compartida
                    </h4>
                    <span className="rounded-full border border-[#231712]/20 bg-[#FFF9F0] px-2 py-0.5 text-[9px] font-extrabold text-[#7B5236]">
                      28 en el café
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#5C3A21] shadow-inner"
                        style={{
                          background:
                            'linear-gradient(135deg, #3B5BA5 0%, #3B5BA5 50%, #C96F4A 50%, #C96F4A 100%)',
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center gap-0.5 rounded-md bg-[#FFF9F0]">
                          <FlagBadge nation="fr" size={10} />
                          <FlagBadge nation="tu" size={10} />
                        </div>
                      </div>
                      <div className="text-[11px] leading-snug text-[#6B4A2F]">
                        <strong className="block font-extrabold text-[#3E2F2A]">
                          Cojín de dos colores
                        </strong>
                        Une dos mesas vecinas. Al sentar aquí, la ficha cuenta en las dos.
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl border border-[#231712]/12 bg-[#FFF9F0] px-2.5 py-2 text-[10px] font-bold text-[#3E2F2A] sm:ml-auto">
                      <span className="rounded-full border border-[#231712]/15 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-[#8A7365]">
                        ejemplo
                      </span>
                      <span className="rounded bg-[#3F5E4A] px-1.5 py-0.5 font-mono text-[9px] text-[#FFF9F0]">
                        +3
                      </span>
                      Francia
                      <span className="text-[#8A7365]">·</span>
                      <span className="rounded bg-[#C9A227] px-1.5 py-0.5 font-mono text-[9px] text-[#231712]">
                        +2
                      </span>
                      Turquía
                    </div>
                  </div>
                </section>

                <div className="flex items-start gap-2.5 rounded-2xl border border-[#231712]/15 bg-[#F5EBDD] p-3 text-[11px] leading-snug text-[#6F5A4E]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#231712]/20 bg-[#FFF9F0] font-serif text-sm font-bold text-[#C96F4A]">
                    2
                  </span>
                  <p>
                    <strong className="text-[#3E2F2A]">
                      Puedes sentar hasta 2 invitados por turno.
                    </strong>{' '}
                    Si abres una mesa nueva, los dos tienen que formar pareja válida. Después, roba
                    hasta tu tamaño de mano actual (5 al empezar).
                  </p>
                </div>
              </div>
            )}

            {chapter === 2 && (
              <div className="space-y-3">
                <section className="rounded-2xl border border-[#231712]/15 bg-[#FFF9F0] p-3 sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-serif text-lg font-bold text-[#231712]">Puntos por mesa</h4>
                    <span className="rounded-full border border-[#C9A227]/50 bg-[#FEF6E0] px-2 py-0.5 text-[9px] font-extrabold text-[#7B5236]">
                      Misma nación = ×2
                    </span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    {[
                      { n: 2, base: 2, pure: 4 },
                      { n: 3, base: 3, pure: 6 },
                      { n: 4, base: 4, pure: 8 },
                    ].map((row) => (
                      <div
                        key={row.n}
                        className="rounded-xl border border-[#231712]/12 bg-[#F5EBDD] px-2 py-2 text-center"
                      >
                        <div className="text-[9px] font-extrabold uppercase tracking-wide text-[#8A7365]">
                          {row.n} invitados
                        </div>
                        <div className="mt-0.5 font-serif text-2xl font-extrabold leading-none text-[#3E2F2A]">
                          {row.base}
                        </div>
                        <div className="mt-0.5 text-[9px] font-bold text-[#3F5E4A]">
                          pura: {row.pure}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-[#6F5A4E]">
                    Cada invitado puntúa al sentarse. Si todos los ocupantes son del país de la
                    mesa, el valor se duplica.
                  </p>
                </section>

                <section className="rounded-2xl border border-[#231712]/15 bg-[#FFF9F0] p-3 sm:p-4">
                  <h4 className="font-serif text-lg font-bold text-[#231712]">Monedas</h4>
                  <p className="mt-0.5 text-[11px] leading-snug text-[#6F5A4E]">
                    Los puntos se guardan como monedas. Tres denominaciones, cero cuentas raras.
                  </p>
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    {[
                      { label: 'Negra', value: 1, bg: '#3E2F2A', fg: '#FFF9F0' },
                      { label: 'Roja', value: 5, bg: '#B6483C', fg: '#FFF9F0' },
                      { label: 'Azul', value: 10, bg: '#3B5BA5', fg: '#FFF9F0' },
                    ].map((coin) => (
                      <div
                        key={coin.label}
                        className="flex items-center gap-2 rounded-xl border border-[#231712]/12 bg-[#F5EBDD] px-2.5 py-2"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#231712] font-mono text-xs font-extrabold shadow-[0_2px_0_#231712]"
                          style={{ backgroundColor: coin.bg, color: coin.fg }}
                        >
                          {coin.value}
                        </span>
                        <span className="text-[11px] font-bold text-[#3E2F2A]">{coin.label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-[#231712]/15 bg-[#F5EBDD] p-3 sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-serif text-lg font-bold text-[#231712]">La barra</h4>
                    <span className="text-[9px] font-extrabold uppercase tracking-wide text-[#8A7365]">
                      20 posavasos
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-[#6F5A4E]">
                    Si no puedes sentar, sirve 1 invitado natural. Las cinco primeras plazas suman;
                    a partir de la sexta, restan.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {BAR_VALUES.map((v, idx) => (
                      <span
                        key={idx}
                        className={`flex h-6 min-w-6 items-center justify-center rounded-full border px-1 font-mono text-[9px] font-extrabold ${
                          v > 0
                            ? 'border-[#3F5E4A]/35 bg-[#E6F4EA] text-[#3F5E4A]'
                            : 'border-[#A94438]/30 bg-[#FDECEB] text-[#A94438]'
                        }`}
                        title={`Posavasos ${idx + 1}: ${v > 0 ? '+' : ''}${v}`}
                      >
                        {v > 0 ? `+${v}` : v}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {chapter === 3 && (
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <section className="rounded-2xl border border-[#231712]/15 bg-[#FFF9F0] p-3">
                    <h4 className="font-serif text-lg font-bold text-[#231712]">Cambiar comodín</h4>
                    <div className="mt-2 flex items-center gap-1.5">
                      <CharacterPortrait nation="joker" gender="F" size={34} />
                      <span className="text-lg font-bold text-[#C96F4A]">→</span>
                      <CharacterPortrait nation="fr" gender="F" size={34} />
                      <span className="ml-1 rounded-lg border border-[#C9A227]/50 bg-[#FEF6E0] px-2 py-1 text-[9px] font-extrabold text-[#7B5236]">
                        misma silla
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-snug text-[#6F5A4E]">
                      Si un comodín ocupa una silla, puedes sustituirlo por la ficha natural exacta
                      de tu mano. No puntúas y no robas carta.
                    </p>
                  </section>

                  <section className="rounded-2xl border border-[#231712]/15 bg-[#FFF9F0] p-3">
                    <h4 className="font-serif text-lg font-bold text-[#231712]">
                      Mesa nacional completa
                    </h4>
                    <div className="mt-2 flex items-center gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#231712]/25 bg-[#E6F4EA]"
                        >
                          <FlagBadge nation="fr" size={12} />
                        </span>
                      ))}
                      <span className="ml-1.5 rounded-lg bg-[#3F5E4A] px-2 py-1 text-[9px] font-extrabold text-[#FFF9F0]">
                        mano −1
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-snug text-[#6F5A4E]">
                      Al completar las 4 sillas con la misma nación, tu mano máxima baja en 1 ficha
                      para siempre. Menos mano, más cerca del final.
                    </p>
                  </section>
                </div>

                <section className="rounded-2xl border border-[#231712]/15 bg-[#F5EBDD] p-3 sm:p-4">
                  <h4 className="font-serif text-lg font-bold text-[#231712]">
                    El café cierra cuando…
                  </h4>
                  <ul className="mt-2 grid gap-1.5 text-[11px] leading-snug text-[#6F5A4E] sm:grid-cols-2">
                    {[
                      'Se ocupa la última silla libre del tablero.',
                      'Se llena la plaza 20 de la barra.',
                      'Un jugador se queda sin fichas en mano.',
                      'Quedan solo 3 fichas en la bolsa.',
                    ].map((t, i) => (
                      <li
                        key={t}
                        className="flex items-start gap-2 rounded-xl border border-[#231712]/10 bg-[#FFF9F0] px-2.5 py-2"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C96F4A] font-mono text-[9px] font-extrabold text-[#FFF9F0]">
                          {i + 1}
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border-2 border-[#A94438]/30 bg-[#FDECEB] p-3 text-[11px] leading-snug text-[#7A3028]">
                  <h4 className="font-serif text-base font-bold text-[#A94438]">
                    Al cerrar, se cuenta
                  </h4>
                  <p className="mt-1">
                    Cada ficha natural que te quede en mano resta <strong>5 puntos</strong>; cada
                    comodín, <strong>10 puntos</strong>. Suma tus mesas y tu barra, resta la mano y
                    compara con el resto de la tertulia.
                  </p>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-2 border-t-2 border-[#3E2F2A]/15 bg-[#F5EBDD]/50 px-3 py-2 sm:px-5">
        <button
          type="button"
          disabled={chapter === 0}
          onClick={() => setChapter((c) => Math.max(0, c - 1))}
          className="min-h-[38px] rounded-xl border-2 border-[#231712]/20 bg-[#FFF9F0] px-3 text-[11px] font-bold text-[#3E2F2A] transition-colors hover:bg-[#EAD9C0] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Anterior
        </button>
        <div className="flex items-center gap-1.5">
          {RULE_CHAPTERS.map((c, idx) => (
            <button
              key={c.label}
              type="button"
              aria-label={`Ir a ${c.label}`}
              onClick={() => setChapter(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === chapter ? 'w-6 bg-[#C96F4A]' : 'w-2 bg-[#231712]/20 hover:bg-[#231712]/35'
              }`}
            />
          ))}
        </div>
        {chapter < RULE_CHAPTERS.length - 1 ? (
          <button
            type="button"
            onClick={() => setChapter((c) => Math.min(RULE_CHAPTERS.length - 1, c + 1))}
            className="min-h-[40px] rounded-xl border-2 border-[#231712] bg-gradient-to-b from-[#D1744E] to-[#BE5F3A] px-3.5 text-[11px] font-extrabold text-[#FFFDF8] shadow-[0_3px_0_#231712] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          >
            Siguiente capítulo →
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] rounded-xl border-2 border-[#231712] bg-gradient-to-b from-[#466852] to-[#35513E] px-3.5 text-[11px] font-extrabold text-[#FFFDF8] shadow-[0_3px_0_#231712] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          >
            A la mesa
          </button>
        )}
      </footer>
    </div>
  );
}

function StatsContent({ onClose }: { onClose: () => void }): React.ReactElement {
  const localStats = useGameStore((s) => s.localStats);
  const recentMatches = useGameStore((s) => s.recentMatches);
  const fetchHistory = useGameStore((s) => s.fetchHistory);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const favNationEntry = Object.entries(localStats.favoriteNations).sort((a, b) => b[1] - a[1])[0];
  const topRivalEntry = Object.entries(localStats.frequentRivals).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between cafe-double-rule pb-3">
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#231712]">
          Estadísticas locales e historial
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-xl cafe-btn-primary text-xs font-bold cursor-pointer"
        >
          Cerrar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="cafe-paper-subpanel p-3.5 rounded-2xl">
          <span className="text-xs text-[#6F5A4E]">Partidas jugadas</span>
          <div className="font-serif font-bold text-2xl tabular-nums mt-1">
            {localStats.gamesPlayed}
          </div>
        </div>
        <div className="cafe-paper-subpanel p-3.5 rounded-2xl">
          <span className="text-xs text-[#6F5A4E]">Victorias</span>
          <div className="font-serif font-bold text-2xl text-[#3F5E4A] tabular-nums mt-1">
            {localStats.wins}
          </div>
        </div>
        <div className="cafe-paper-subpanel p-3.5 rounded-2xl">
          <span className="text-xs text-[#6F5A4E]">Nación favorita</span>
          <div className="font-serif font-bold text-lg mt-1">
            {favNationEntry ? getNationName(favNationEntry[0]) : 'Aún sin datos'}
          </div>
        </div>
        <div className="cafe-paper-subpanel p-3.5 rounded-2xl">
          <span className="text-xs text-[#6F5A4E]">Tertuliano habitual</span>
          <div className="font-serif font-bold text-lg mt-1 truncate">
            {topRivalEntry ? topRivalEntry[0] : 'Aún sin datos'}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-serif font-bold text-lg mb-2">
          Últimas 5 partidas registradas en el servidor
        </h3>
        {recentMatches.length === 0 ? (
          <p className="text-sm text-[#6F5A4E] cafe-paper-subpanel p-4 rounded-2xl">
            Todavía no hay partidas finalizadas en este servidor.
          </p>
        ) : (
          <div className="space-y-2">
            {recentMatches.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 cafe-paper-subpanel px-4 py-2.5 rounded-2xl text-xs"
              >
                <div>
                  <span className="font-bold">Sala {m.roomCode}</span>
                  <span className="text-[#6F5A4E] ml-2">
                    · {new Date(m.finishedAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="text-[#3E2F2A]">
                  Jugadores: {m.players.map((p) => p.nickname).join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CafeToggle({
  checked,
  onChange,
  label,
  description,
  testId,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
  testId?: string;
}): React.ReactElement {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#231712]/10 bg-[#FFF9F0] px-3 py-2 transition-colors hover:bg-[#F7EEDF]">
      <span className="min-w-0">
        <span className="block text-[11px] font-bold text-[#3E2F2A] sm:text-xs">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[9px] leading-snug text-[#8A7365]">{description}</span>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        data-testid={testId}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="cafe-switch peer-focus-visible:ring-2 peer-focus-visible:ring-[#C96F4A] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#FFF9F0]"
        data-on={checked ? 'true' : 'false'}
      />
    </label>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  testId,
  optionTestId,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
  testId?: string;
  optionTestId?: (value: T) => string;
}): React.ReactElement {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-testid={testId}
      className="grid gap-1 rounded-xl border border-[#231712]/12 bg-[#EFE3CE]/60 p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-testid={optionTestId?.(option.value)}
            onClick={() => onChange(option.value)}
            className={`min-h-[32px] rounded-lg px-1.5 text-[10px] font-bold leading-tight transition-colors sm:text-[11px] ${
              active
                ? 'border border-[#C96F4A] bg-[#FFFDF8] text-[#231712] shadow-[0_1.5px_0_rgba(35,23,18,0.35)]'
                : 'border border-transparent text-[#6F5A4E] hover:bg-[#FFF9F0]/70 hover:text-[#3E2F2A]'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function SettingsNavIcon({
  name,
}: {
  name: 'perfil' | 'sonido' | 'accesibilidad' | 'sistema';
}): React.ReactElement {
  const common = {
    width: 17,
    height: 17,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (name === 'perfil') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      </svg>
    );
  }
  if (name === 'sonido') {
    return (
      <svg {...common}>
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
        <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" />
      </svg>
    );
  }
  if (name === 'accesibilidad') {
    return (
      <svg {...common}>
        <path d="M3 12s3.5-5.5 9-5.5S21 12 21 12s-3.5 5.5-9 5.5S3 12 3 12Z" />
        <circle cx="12" cy="12" r="2.6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9M4 12h3M11 12h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="7" cy="17" r="2" />
    </svg>
  );
}

function SettingsSectionTitle({
  index,
  title,
  desc,
  icon,
}: {
  index: string;
  title: string;
  desc: string;
  icon: 'perfil' | 'sonido' | 'accesibilidad' | 'sistema';
}): React.ReactElement {
  return (
    <div className="mb-2 flex items-start justify-between gap-2 border-b border-[#3E2F2A]/10 pb-1.5">
      <div>
        <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#C96F4A]">
          Sección {index}
        </span>
        <h3 className="font-serif text-lg font-bold leading-tight text-[#231712] sm:text-xl">
          {title}
        </h3>
        <p className="mt-0.5 text-[10px] leading-snug text-[#8A7365] sm:text-[11px]">{desc}</p>
      </div>
      <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#231712]/15 bg-[#F5EBDD] text-[#7B5236] sm:flex">
        <SettingsNavIcon name={icon} />
      </span>
    </div>
  );
}

function SettingsContent({ onClose }: { onClose: () => void }): React.ReactElement {
  const [vols, setVols] = useState(soundEngine.getVolumes());
  const [avatarOpen, setAvatarOpen] = useState(false);
  const screen = useGameStore((s) => s.screen);
  const inMatch = screen === 'playing' || screen === 'finished';
  const avatarId = useGameStore((s) => s.avatarId);
  const setAvatarId = useGameStore((s) => s.setAvatarId);
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const highContrast = useGameStore((s) => s.highContrast);
  const largeText = useGameStore((s) => s.largeText);
  const nightMode = useGameStore((s) => s.nightMode);
  const contextualHints = useGameStore((s) => s.contextualHints);
  const subtitleMode = useGameStore((s) => s.subtitleMode);
  const subtitleStyle = useGameStore((s) => s.subtitleStyle);
  const setSubtitleMode = useGameStore((s) => s.setSubtitleMode);
  const setSubtitleStyle = useGameStore((s) => s.setSubtitleStyle);
  const toggleSetting = useGameStore((s) => s.toggleSetting);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const currentAvatar = PRESET_AVATARS.find((a) => a.id === avatarId) ?? PRESET_AVATARS[0];
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState<
    'perfil' | 'sonido' | 'accesibilidad' | 'sistema'
  >('perfil');

  const goToSection = (id: 'perfil' | 'sonido' | 'accesibilidad' | 'sistema') => {
    setActiveSection(id);
    const container = scrollRef.current;
    const target = container?.querySelector<HTMLElement>(`[data-settings-section="${id}"]`);
    if (!container || !target) return;
    const top =
      target.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      8;
    container.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const handleInstallPwa = async () => {
    if (deferredInstallPrompt) {
      await deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    } else {
      setActiveModal('ios_pwa');
    }
  };

  return (
    <div className="flex h-[min(90dvh,780px)] max-h-[94dvh] flex-col text-[#3E2F2A]">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-[#3E2F2A]/15 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#C96F4A]">
            Mesa de control · O &amp; A
          </span>
          <h2 className="font-serif text-xl font-bold leading-tight text-[#231712] sm:text-3xl">
            Ajustes de la casa
          </h2>
          <p className="mt-0.5 hidden text-[11px] text-[#6F5A4E] sm:block">
            Perfil, sonido y accesibilidad. Todo se guarda en este dispositivo al momento.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[40px] shrink-0 rounded-xl border-2 border-[#231712] bg-gradient-to-b from-[#D1744E] to-[#BE5F3A] px-3.5 text-xs font-extrabold text-[#FFFDF8] shadow-[0_3px_0_#231712] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          Guardar y cerrar
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <nav className="shrink-0 border-b border-[#3E2F2A]/12 bg-[#F5EBDD]/55 p-2 sm:w-[224px] sm:border-b-0 sm:border-r sm:p-3">
          <p className="mb-2 hidden px-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#8A7365] sm:block">
            Tu mesa
          </p>
          <div className="grid grid-cols-4 gap-1 sm:flex sm:flex-col sm:gap-1.5">
            {(
              [
                { id: 'perfil', label: 'Perfil', short: 'Perfil', hint: 'Apodo y emblema' },
                { id: 'sonido', label: 'Sonido', short: 'Sonido', hint: 'Música y volumen' },
                {
                  id: 'accesibilidad',
                  label: 'Accesibilidad',
                  short: 'Acceso',
                  hint: 'Subtítulos y vista',
                },
                { id: 'sistema', label: 'Sistema', short: 'Sistema', hint: 'Datos e instalación' },
              ] as const
            ).map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToSection(item.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-1.5 text-center transition-colors sm:flex-row sm:justify-start sm:gap-2 sm:px-2.5 sm:py-2 sm:text-left ${
                    active
                      ? 'border-[#C96F4A] bg-[#FFF9F0] shadow-[0_2px_0_#231712]'
                      : 'border-transparent hover:border-[#231712]/15 hover:bg-[#FFF9F0]/60'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 sm:h-7 sm:w-7 ${
                      active
                        ? 'border-[#231712] bg-[#C96F4A] text-[#FFFDF8]'
                        : 'border-[#231712]/20 bg-[#FFFDF8] text-[#7B5236]'
                    }`}
                  >
                    <SettingsNavIcon name={item.id} />
                  </span>
                  <span className="min-w-0 w-full sm:w-auto">
                    <span className="block truncate text-[9px] font-extrabold text-[#3E2F2A] sm:hidden">
                      {item.short}
                    </span>
                    <span className="hidden truncate text-[11px] font-extrabold text-[#3E2F2A] sm:block">
                      {item.label}
                    </span>
                    <span className="hidden truncate text-[9px] text-[#8A7365] sm:block">
                      {item.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto hidden rounded-xl border border-[#3F5E4A]/25 bg-[#E6F4EA] p-2.5 text-[10px] leading-snug text-[#3F5E4A] sm:block">
            <strong className="block font-extrabold">Todo guardado</strong>
            No hay botón de aplicar: cada cambio queda registrado al tocarlo.
          </div>
        </nav>

        <div ref={scrollRef} className="min-h-0 flex-1 scroll-smooth overflow-y-auto cafe-scroll">
          <div className="mx-auto max-w-3xl space-y-3 p-3 pb-8 sm:p-6">
            {/* PERFIL */}
            <section
              data-settings-section="perfil"
              className="scroll-mt-2 rounded-2xl border border-[#231712]/15 bg-[#FFF9F0] p-3 sm:p-4"
            >
              <SettingsSectionTitle
                index="01"
                title="Tu tarjeta de tertuliano"
                desc="El apodo y el emblema que verán los demás en la mesa."
                icon="perfil"
              />

              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#231712]/25 bg-[#F5EBDD] shadow-inner ring-2 ring-[#C9A227]/40">
                  <PlayerAvatar avatarId={avatarId} size={56} />
                </span>
                <div className="min-w-0 flex-1">
                  <label className="block text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#8A7365]">
                    Tu apodo
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={24}
                    disabled={inMatch}
                    aria-label="Tu apodo"
                    className="mt-1 w-full max-w-[240px] rounded-xl border-[1.5px] border-[#231712]/25 bg-[#FFFDF8] px-3 py-2 text-xs font-bold shadow-inner outline-none transition-colors focus:border-[#C96F4A] disabled:cursor-not-allowed disabled:opacity-55"
                  />
                </div>
                <button
                  type="button"
                  data-testid="settings-avatar-dropdown-btn"
                  aria-expanded={avatarOpen}
                  disabled={inMatch}
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="inline-flex min-h-[38px] items-center gap-2 rounded-xl border-2 border-[#231712] bg-[#FFFDF8] px-3 text-[11px] font-bold shadow-[0_2px_0_#231712] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <span>{currentAvatar?.label ?? 'Avatar'}</span>
                  <svg
                    width="9"
                    height="6"
                    viewBox="0 0 10 6"
                    aria-hidden="true"
                    className={`transition-transform ${avatarOpen ? 'rotate-180' : ''}`}
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
              </div>

              {inMatch && (
                <p className="mt-2 rounded-xl border border-[#A63F34]/30 bg-[#FDECEB] px-2.5 py-1.5 text-[10px] font-bold text-[#A63F34]">
                  Tu apodo y tu emblema quedan bloqueados durante la partida.
                </p>
              )}

              {avatarOpen && !inMatch && (
                <div
                  className="mt-3 rounded-2xl border border-[#231712]/15 bg-[#F5EBDD] p-2"
                  role="radiogroup"
                  aria-label="Seleccionar avatar prehecho"
                >
                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                    {PRESET_AVATARS.map((av) => {
                      const active = avatarId === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          data-testid={`settings-avatar-${av.id}`}
                          onClick={() => {
                            void setAvatarId(av.id);
                            setAvatarOpen(false);
                          }}
                          title={av.label}
                          className={`flex flex-col items-center justify-center rounded-xl border p-1.5 transition-transform ${
                            active
                              ? 'border-[#C96F4A] bg-[#FEF6E0] ring-2 ring-[#C96F4A]'
                              : 'border-[#231712]/10 bg-[#FFF9F0] hover:-translate-y-0.5 hover:border-[#231712]/30'
                          }`}
                        >
                          <PlayerAvatar avatarId={av.id} size={40} />
                          <span className="mt-0.5 line-clamp-2 min-h-[20px] w-full text-center text-[8px] font-bold leading-tight">
                            {av.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* SONIDO */}
            <section
              data-settings-section="sonido"
              data-testid="settings-sound-section"
              className="scroll-mt-2 rounded-2xl border border-[#231712]/15 bg-[#FFF9F0] p-3 sm:p-4"
            >
              <SettingsSectionTitle
                index="02"
                title="Sonido del café"
                desc="Tocadiscos lo-fi, murmullo de salón y efectos de fichas."
                icon="sonido"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    data-testid="test-sound-btn"
                    onClick={() => {
                      if (vols.muted) {
                        setVols(soundEngine.setVolumes({ muted: false }));
                      }
                      soundEngine.playSfx('uiPlay');
                    }}
                    className="min-h-[36px] rounded-xl border-[1.5px] border-[#C9A227] bg-[#FEF6E0] px-3 text-[11px] font-bold text-[#231712] shadow-[0_2px_0_#1E130E] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                  >
                    Probar sonido
                  </button>
                  <button
                    type="button"
                    data-testid="settings-mute-btn"
                    aria-pressed={vols.muted}
                    onClick={() => {
                      const nextMuted = !vols.muted;
                      const next = soundEngine.setVolumes({ muted: nextMuted });
                      setVols(next);
                      if (!nextMuted) soundEngine.playSfx('uiToggle');
                    }}
                    className={`min-h-[36px] rounded-xl px-3 text-[11px] font-bold transition-transform hover:-translate-y-0.5 active:translate-y-0.5 ${
                      vols.muted
                        ? 'border-[1.5px] border-[#1E130E] bg-[#A94438] text-[#FFF9F0] shadow-[0_2px_0_#1E130E]'
                        : 'border-2 border-[#231712]/20 bg-[#FFFDF8] text-[#3E2F2A] shadow-[0_2px_0_rgba(35,23,18,0.25)]'
                    }`}
                  >
                    {vols.muted ? 'Silenciado · activar' : 'Silenciar todo'}
                  </button>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                    vols.muted
                      ? 'border-[#A94438]/30 bg-[#FDECEB] text-[#A94438]'
                      : 'border-[#3F5E4A]/30 bg-[#E6F4EA] text-[#3F5E4A]'
                  }`}
                >
                  {vols.muted ? 'En silencio' : 'Sonando'}
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-[#231712]/10 bg-[#F5EBDD] p-2.5">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#8A7365]">
                    Ambiente del tocadiscos
                  </p>
                  <div
                    className="mt-1.5 grid grid-cols-3 gap-1.5"
                    role="radiogroup"
                    aria-label="Ambiente musical del café"
                  >
                    {MUSIC_MOODS.map((m) => {
                      const active = vols.mood === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          data-testid={`settings-mood-${m.id}`}
                          onClick={() => {
                            const next = soundEngine.setVolumes({ mood: m.id as MusicMoodId });
                            setVols(next);
                            soundEngine.playSfx('uiToggle');
                          }}
                          title={m.desc}
                          className={`min-h-[42px] rounded-xl border px-1.5 text-[10px] font-bold leading-tight transition-colors ${
                            active
                              ? 'border-[#C96F4A] bg-[#FEF6E0] text-[#231712] shadow-[0_2px_0_#1E130E]'
                              : 'border-[#231712]/15 bg-[#FFF9F0] text-[#6F5A4E] hover:text-[#3E2F2A]'
                          }`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 text-[9px] leading-snug text-[#8A7365]">
                    Cambia el ánimo del café sin cortar la partida.
                  </p>
                </div>

                <div className="space-y-2 rounded-xl border border-[#231712]/10 bg-[#F5EBDD] p-2.5">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#8A7365]">
                    Volúmenes
                  </p>
                  {[
                    {
                      key: 'music',
                      label: 'Música lo-fi',
                      testId: 'slider-music',
                      value: vols.music,
                    },
                    {
                      key: 'ambience',
                      label: 'Ambiente de cafetería',
                      testId: 'slider-ambience',
                      value: vols.ambience,
                    },
                    {
                      key: 'sfx',
                      label: 'Efectos y fichas',
                      testId: 'slider-sfx',
                      value: vols.sfx,
                    },
                  ].map((slider) => (
                    <label key={slider.key} className="block">
                      <span className="mb-1 flex items-center justify-between gap-2 text-[10px] font-bold text-[#4B3A31]">
                        {slider.label}
                        <span className="font-mono text-[9px] text-[#8A7365]">
                          {Math.round(slider.value * 100)}%
                        </span>
                      </span>
                      <input
                        type="range"
                        data-testid={slider.testId}
                        min="0"
                        max="1"
                        step="0.05"
                        value={slider.value}
                        onChange={(e) => {
                          const next = soundEngine.setVolumes({
                            [slider.key]: Number(e.target.value),
                          } as Parameters<typeof soundEngine.setVolumes>[0]);
                          setVols(next);
                          soundEngine.playSfx('uiSlider');
                        }}
                        className="cafe-range"
                        style={
                          {
                            '--fill': `${Math.round(slider.value * 100)}%`,
                          } as React.CSSProperties
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-2">
                <CafeToggle
                  checked={vols.haptics}
                  onChange={() => {
                    const next = soundEngine.setVolumes({ haptics: !vols.haptics });
                    setVols(next);
                    soundEngine.playSfx('uiToggle');
                  }}
                  label="Vibración háptica en Android"
                  description="Aviso corto al confirmar una jugada o recibir un aviso."
                  testId="settings-haptics-toggle"
                />
              </div>
              <p className="mt-2 rounded-lg bg-[#F5EBDD] px-2 py-1.5 text-[9px] leading-snug text-[#8A7365]">
                iOS no permite vibración web. En iPhone, el aviso de turno usa sonido y el marco
                cálido de la pantalla.
              </p>
            </section>

            {/* ACCESIBILIDAD */}
            <section
              data-settings-section="accesibilidad"
              className="scroll-mt-2 rounded-2xl border border-[#231712]/15 bg-[#FFF9F0] p-3 sm:p-4"
            >
              <SettingsSectionTitle
                index="03"
                title="Subtítulos, lámparas y accesibilidad"
                desc="La mesa se adapta a cómo quieres leerla y escucharla."
                icon="accesibilidad"
              />

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-[#231712]/10 bg-[#F5EBDD] p-2.5">
                  <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#8A7365]">
                    Frecuencia de subtítulos
                  </p>
                  <Segmented
                    value={subtitleMode}
                    onChange={(v) => setSubtitleMode(v)}
                    ariaLabel="Frecuencia de subtítulos"
                    testId="settings-subtitle-mode-select"
                    options={[
                      { value: 'off', label: 'Nunca' },
                      { value: 'key', label: 'Clave' },
                      { value: 'all', label: 'Todo' },
                    ]}
                  />
                </div>
                <div className="rounded-xl border border-[#231712]/10 bg-[#F5EBDD] p-2.5">
                  <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#8A7365]">
                    Estilo visual
                  </p>
                  <Segmented
                    value={subtitleStyle}
                    onChange={(v) => setSubtitleStyle(v)}
                    ariaLabel="Estilo visual de subtítulos"
                    testId="settings-subtitle-style-select"
                    options={[
                      { value: 'comic', label: 'Cómic' },
                      { value: 'cafe', label: 'Etiqueta' },
                      { value: 'arcade', label: 'Arcade' },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                <CafeToggle
                  checked={reducedMotion}
                  onChange={() => toggleSetting('reducedMotion')}
                  label="Reducción de movimiento"
                  description="Sin giros, rebotes ni animaciones largas."
                />
                <CafeToggle
                  checked={highContrast}
                  onChange={() => toggleSetting('highContrast')}
                  label="Alto contraste"
                  description="Textos y bordes más marcados."
                />
                <CafeToggle
                  checked={largeText}
                  onChange={() => toggleSetting('largeText')}
                  label="Texto ampliado"
                  description="Sube un poco el tamaño general."
                />
                <CafeToggle
                  checked={nightMode}
                  onChange={() => toggleSetting('nightMode')}
                  label="Iluminación nocturna"
                  description="Velas de tarde y tonos más cálidos."
                />
                <CafeToggle
                  checked={contextualHints}
                  onChange={() => toggleSetting('contextualHints')}
                  label="Pistas contextuales"
                  description="Muestra puntos previstos y ayuda en las sillas."
                />
              </div>
            </section>

            {/* SISTEMA */}
            <section
              data-settings-section="sistema"
              className="scroll-mt-2 rounded-2xl border border-[#231712]/15 bg-[#FFF9F0] p-3 sm:p-4"
            >
              <SettingsSectionTitle
                index="04"
                title="Sistema y memoria del café"
                desc="Historial, instalación y créditos de la casa."
                icon="sistema"
              />

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  data-testid="open-stats-from-settings"
                  onClick={() => setActiveModal('stats')}
                  className="group flex items-center gap-2.5 rounded-xl border border-[#231712]/15 bg-[#F5EBDD] p-2.5 text-left transition-transform hover:-translate-y-0.5 hover:border-[#C96F4A]/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#231712]/15 bg-[#FFF9F0] text-[#7B5236]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 20V10M12 20V4M19 20v-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-extrabold text-[#3E2F2A]">
                      Estadísticas e historial
                    </span>
                    <span className="block text-[9px] leading-snug text-[#8A7365]">
                      Partidas, victorias y últimas mesas.
                    </span>
                  </span>
                  <span className="text-[#8A7365] transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="install-pwa-btn"
                  onClick={() => void handleInstallPwa()}
                  className="group flex items-center gap-2.5 rounded-xl border border-[#231712]/15 bg-[#F5EBDD] p-2.5 text-left transition-transform hover:-translate-y-0.5 hover:border-[#C96F4A]/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#231712]/15 bg-[#FFF9F0] text-[#7B5236]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect
                        x="6"
                        y="2.5"
                        width="12"
                        height="19"
                        rx="2.5"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 7v7m0 0 3-3m-3 3-3-3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-extrabold text-[#3E2F2A]">
                      Instalar en el móvil
                    </span>
                    <span className="block text-[9px] leading-snug text-[#8A7365]">
                      A pantalla completa, como una app.
                    </span>
                  </span>
                  <span className="text-[#8A7365] transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </div>

              <p className="mt-2 rounded-lg border border-[#231712]/10 bg-[#F5EBDD] px-2 py-1.5 text-[9px] leading-relaxed text-[#8A7365]">
                Modelos 3D de café, canela y anís: Poly by Google, CC BY 3.0, vía Poly Pizza.
                Cafetulia guarda tus preferencias en este navegador.
              </p>
            </section>
          </div>
        </div>
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-2 border-t-2 border-[#3E2F2A]/15 bg-[#F5EBDD]/55 px-3 py-2 sm:px-5">
        <span className="text-[9px] leading-snug text-[#8A7365] sm:text-[10px]">
          Los cambios se guardan en este dispositivo.
        </span>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[38px] rounded-xl border-2 border-[#231712] bg-gradient-to-b from-[#466852] to-[#35513E] px-4 text-[11px] font-extrabold text-[#FFFDF8] shadow-[0_3px_0_#231712] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          Listo
        </button>
      </footer>
    </div>
  );
}

function IosPwaContent({ onClose }: { onClose: () => void }): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between cafe-double-rule pb-3">
        <h2 className="font-serif font-bold text-2xl">Instalar Cafetulia en tu móvil</h2>
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-xl cafe-btn-primary text-xs font-bold cursor-pointer"
        >
          Entendido
        </button>
      </div>
      <div className="cafe-paper-subpanel p-4 rounded-2xl space-y-2 text-sm text-[#3E2F2A]">
        <p className="font-bold">En iPhone o iPad (Safari):</p>
        <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-[#6F5A4E]">
          <li>
            Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.
          </li>
          <li>
            Desliza hacia abajo y selecciona <strong>«Añadir a pantalla de inicio»</strong>.
          </li>
          <li>
            Pulsa <strong>Añadir</strong> arriba a la derecha para jugar a pantalla completa.
          </li>
        </ol>
      </div>
      <div className="cafe-paper-subpanel p-4 rounded-2xl space-y-2 text-sm text-[#3E2F2A]">
        <p className="font-bold">En Android (Chrome):</p>
        <p className="text-xs sm:text-sm text-[#6F5A4E]">
          Abre el menú de tres puntos arriba a la derecha y pulsa{' '}
          <strong>«Instalar aplicación»</strong> o «Añadir a pantalla de inicio».
        </p>
      </div>
    </div>
  );
}
