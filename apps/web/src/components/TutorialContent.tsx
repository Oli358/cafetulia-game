import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  createFullTileSet,
  createGame,
  type GameState,
  type Seat,
  type Table,
  type Tile,
} from '@cafetulia/engine';
import { CharacterPortrait, FlagBadge } from '../art/CharacterPortrait';
import { soundEngine } from '../audio/soundEngine';
import { useGameStore } from '../store/gameStore';
import { getNationName, type SeatInspectResult } from '../utils/moveHelper';
import { IllustratedBoard } from './IllustratedBoard';

const ALL_TILES = createFullTileSet();

function tileById(id: string): Tile {
  const found = ALL_TILES.find((t) => t.id === id);
  if (!found) throw new Error(`Tutorial tile not found: ${id}`);
  return found;
}

const YOU = 'tutorial-you';
const BOT = 'tutorial-bot';

type Scenario = {
  occupants: Record<string, Tile>;
  barOccupant: Tile | null;
  hand: Tile[];
  score: number;
  inspections: Record<string, SeatInspectResult>;
  selectedTile: Tile | null;
  focusTableId: string | null;
};

function inspect(
  seatId: string,
  status: SeatInspectResult['status'],
  pointsDelta: number,
  previewText: string,
): SeatInspectResult {
  return {
    seatId,
    status,
    pointsDelta,
    previewText,
    whyCannotText: '',
    validJokerNations: [],
  };
}

function buildScenario(step: number, done: boolean): Scenario {
  const frM = tileById('tile_fr_m_1');
  const frF = tileById('tile_fr_f_1');
  const tuM = tileById('tile_tu_m_1');
  const tuF = tileById('tile_tu_f_1');

  if (step === 0) {
    const henri = tileById('tile_fr_m_2');
    const colette = tileById('tile_fr_f_2');
    const fillers = [tileById('tile_joker_f_1'), tileById('tile_en_m_2'), tileById('tile_it_f_3')];
    const drawnAfter = [tileById('tile_es_m_1'), tileById('tile_cu_f_1')];
    return {
      occupants: done ? { s_8_3: henri, s_9_4: colette } : {},
      barOccupant: null,
      hand: done ? [...fillers, ...drawnAfter] : [henri, colette, ...fillers],
      score: done ? 4 : 0,
      inspections: done
        ? {}
        : {
            s_8_3: inspect('s_8_3', 'legal_needs_pair', 0, 'Primera ficha de la pareja'),
            s_9_4: inspect('s_9_4', 'legal_complete', 4, 'Pareja francesa: +4 monedas'),
          },
      selectedTile: done ? null : colette,
      focusTableId: 't_fr_1',
    };
  }

  if (step === 1) {
    const sharedGuest = tileById('tile_fr_f_2');
    const fillers = [
      tileById('tile_joker_m_1'),
      tileById('tile_en_f_2'),
      tileById('tile_am_m_3'),
      tileById('tile_it_m_2'),
    ];
    const base = {
      s_8_3: frM,
      s_9_4: frF,
      s_9_0: tuM,
      s_10_1: tuF,
    };
    return {
      occupants: done ? { ...base, s_9_2: sharedGuest } : base,
      barOccupant: null,
      hand: done ? [...fillers, tileById('tile_cu_m_2')] : [sharedGuest, ...fillers],
      score: done ? 13 : 4,
      inspections: done
        ? {}
        : {
            s_9_2: inspect(
              's_9_2',
              'legal_complete',
              9,
              'Silla compartida: +6 en Francia y +3 en Turquía',
            ),
          },
      selectedTile: done ? null : sharedGuest,
      focusTableId: 't_fr_1',
    };
  }

  const barGuest = tileById('tile_en_f_1');
  const fillers = [
    tileById('tile_joker_m_2'),
    tileById('tile_it_f_4'),
    tileById('tile_am_m_1'),
    tileById('tile_al_f_2'),
  ];
  return {
    occupants: {
      s_8_3: frM,
      s_9_4: frF,
      s_9_2: tileById('tile_fr_f_2'),
      s_9_0: tuM,
      s_10_1: tuF,
    },
    barOccupant: done ? barGuest : null,
    hand: done ? [...fillers, tileById('tile_ru_f_1')] : [barGuest, ...fillers],
    score: done ? 14 : 13,
    inspections: {},
    selectedTile: done ? null : barGuest,
    focusTableId: null,
  };
}

function buildDemoState(step: number, done: boolean): GameState {
  const scenario = buildScenario(step, done);
  const base = createGame(
    {
      players: [
        { id: YOU, nickname: 'Tú', avatarId: 'moka' },
        { id: BOT, nickname: 'Barista Bot', isBot: true, botDifficulty: 'medium' },
      ],
      startingPlayerId: YOU,
    },
    20261125,
  );

  const usedIds = new Set<string>([
    ...Object.values(scenario.occupants).map((t) => t.id),
    ...scenario.hand.map((t) => t.id),
    ...(scenario.barOccupant ? [scenario.barOccupant.id] : []),
  ]);

  return {
    ...base,
    players: base.players.map((p) => (p.id === YOU ? { ...p, score: scenario.score } : p)),
    seats: base.seats.map((s) => ({
      ...s,
      occupant: scenario.occupants[s.id] ?? null,
    })),
    bar: base.bar.map((_, idx) => (idx === 0 ? scenario.barOccupant : null)),
    hands: {
      [YOU]: scenario.hand,
      [BOT]: base.hands[BOT] ?? [],
    },
    bag: ALL_TILES.filter((t) => !usedIds.has(t.id)),
    turn: YOU,
    turnNumber: 8,
    log: [],
  };
}

type TutorialStep = {
  kicker: string;
  title: string;
  body: React.ReactNode;
  rule: string;
  chips: React.ReactNode;
  actionLabel: string;
  doneLabel: string;
  result: React.ReactNode;
};

const STEPS: TutorialStep[] = [
  {
    kicker: 'Paso 1 · Abrir una mesa',
    title: 'Dos invitados abren una mesa',
    body: (
      <>
        Para estrenar una mesa necesitas <strong>un hombre y una mujer del mismo país</strong>. Se
        sientan juntos en el mismo turno, así nunca queda un invitado solo.
      </>
    ),
    rule: 'Nunca dejes a un invitado solo en una mesa vacía.',
    chips: (
      <>
        <span className="inline-flex items-center gap-1 rounded-lg border border-[#231712]/15 bg-[#FFF9F0] px-2 py-1 text-[11px] font-bold">
          <FlagBadge nation="fr" size={13} /> Henri + Colette
        </span>
        <span className="rounded-lg border border-[#C9A227]/50 bg-[#FEF6E0] px-2 py-1 text-[11px] font-extrabold text-[#7B5236]">
          Francia · misma nación ×2
        </span>
      </>
    ),
    actionLabel: 'Sentar la pareja',
    doneLabel: 'Siguiente paso',
    result: (
      <>
        <strong>+4 monedas</strong> · Mesa de Francia 2/4 · misma nacionalidad ×2
      </>
    ),
  },
  {
    kicker: 'Paso 2 · Silla compartida',
    title: 'Una silla, dos mesas',
    body: (
      <>
        Las <strong>28 sillas compartidas</strong> tienen cojín de dos colores. Si sientas ahí un
        invitado válido, <strong>puntúa en las dos mesas a la vez</strong>.
      </>
    ),
    rule: 'Respeta el equilibrio de sexos de las dos mesas.',
    chips: (
      <>
        <span className="inline-flex items-center gap-1 rounded-lg border border-[#231712]/15 bg-[#FFF9F0] px-2 py-1 text-[11px] font-bold">
          <FlagBadge nation="fr" size={13} /> Francia
        </span>
        <span className="text-[11px] font-bold text-[#6F5A4E]">+</span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-[#231712]/15 bg-[#FFF9F0] px-2 py-1 text-[11px] font-bold">
          <FlagBadge nation="tu" size={13} /> Turquía
        </span>
        <span className="rounded-lg border border-[#C9A227]/50 bg-[#FEF6E0] px-2 py-1 text-[11px] font-extrabold text-[#7B5236]">
          +6 +3 = +9
        </span>
      </>
    ),
    actionLabel: 'Sentar en la silla compartida',
    doneLabel: 'Siguiente paso',
    result: (
      <>
        <strong>+9 monedas</strong> · +6 en Francia y +3 en Turquía
      </>
    ),
  },
  {
    kicker: 'Paso 3 · La barra',
    title: 'Cuando la mesa no te conviene',
    body: (
      <>
        Si no tienes una jugada legal —o prefieres guardar tus cartas— puedes{' '}
        <strong>servir 1 invitado en la barra</strong>. Las 5 primeras plazas suman; de la 6ª en
        adelante restan.
      </>
    ),
    rule: 'Los comodines nunca van a la barra.',
    chips: (
      <>
        <span className="rounded-lg border border-[#3F5E4A]/40 bg-[#E6F4EA] px-2 py-1 text-[11px] font-extrabold text-[#3F5E4A]">
          +1 a +5
        </span>
        <span className="rounded-lg border border-[#A94438]/35 bg-[#FDECEB] px-2 py-1 text-[11px] font-extrabold text-[#A94438]">
          -2 a -14
        </span>
        <span className="rounded-lg border border-[#231712]/15 bg-[#FFF9F0] px-2 py-1 text-[11px] font-bold">
          20 posavasos
        </span>
      </>
    ),
    actionLabel: 'Servir en la barra',
    doneLabel: 'Terminar tutorial',
    result: (
      <>
        <strong>+1 moneda</strong> · Posavasos 1/20
      </>
    ),
  },
];

function TutorialHand({
  hand,
  relevantIds,
  label,
}: {
  hand: Tile[];
  relevantIds: string[];
  label: string;
}): React.ReactElement {
  return (
    <div className="w-full rounded-2xl border-2 border-[#231712]/35 bg-[#FFF9F0]/80 p-2 shadow-[0_3px_0_rgba(35,23,18,0.2)] backdrop-blur-sm">
      <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
        <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#7B5236]">
          Tu mano · {hand.length} fichas
        </span>
        <span className="truncate text-[10px] font-bold text-[#6F5A4E]">{label}</span>
      </div>
      <div className="flex items-end justify-center gap-1.5 sm:gap-2">
        {hand.map((tile) => {
          const relevant = relevantIds.includes(tile.id);
          return (
            <div
              key={tile.id}
              className={`relative flex h-12 w-11 items-center justify-center overflow-hidden rounded-lg border-2 bg-[#FFF9F0] transition-all sm:h-14 sm:w-12 ${
                relevant
                  ? 'z-10 scale-105 border-[#C96F4A] shadow-[0_3px_0_#231712] ring-2 ring-[#C96F4A]/35'
                  : 'border-[#231712]/60 opacity-55 shadow-[0_2px_0_#231712]'
              }`}
              title={`${getNationName(tile.nation)}`}
            >
              <CharacterPortrait
                nation={tile.nation}
                gender={tile.gender}
                tileId={tile.id}
                size={44}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TutorialContent({ onClose }: { onClose: () => void }): React.ReactElement {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const reducedMotion = useGameStore((s) => s.reducedMotion);

  const scenario = useMemo(() => buildScenario(step, done), [step, done]);
  const demo = useMemo(() => buildDemoState(step, done), [step, done]);
  const stepMeta = (STEPS[step] ?? STEPS[0]) as TutorialStep;
  const isLast = step === STEPS.length - 1;

  const relevantIds = done
    ? []
    : step === 0
      ? ['tile_fr_m_2', 'tile_fr_f_2']
      : step === 1
        ? ['tile_fr_f_2']
        : ['tile_en_f_1'];

  const handLabel = done
    ? 'Mano repuesta · 5 fichas'
    : step === 0
      ? 'Henri y Colette · pareja francesa'
      : step === 1
        ? 'Colette · Francia · Mujer'
        : 'Margaret · Inglaterra · Mujer';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const trigger = () => {
    if (done) return;
    const sfx = step === 0 ? 'tilePlace' : step === 1 ? 'pureTableToast' : 'barPositive';
    soundEngine.playSfx(sfx);
    setHint(null);
    setDone(true);
  };

  const goTo = (next: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, next)));
    setDone(false);
    setHint(null);
  };

  const handleSeatClick = (seat: Seat) => {
    if (done) return;
    if (step === 0 && (seat.id === 's_8_3' || seat.id === 's_9_4')) {
      trigger();
      return;
    }
    if (step === 1 && seat.id === 's_9_2') {
      trigger();
      return;
    }
    setHint(
      step === 2
        ? 'En este paso, toca el primer posavasos de la barra.'
        : 'En este paso, toca la silla que tiene el aro verde y el punto dorado.',
    );
  };

  const handleBarClick = () => {
    if (step !== 2) {
      setHint('La barra se practica en el paso 3.');
      return;
    }
    trigger();
  };

  const handleTableClick = (_table: Table) => {
    // The demo keeps its spotlight fixed so the lesson stays readable.
  };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      className="fixed inset-0 z-[70] flex flex-col bg-[#231712]/80 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <header className="shrink-0 border-b border-[#FFF9F0]/15 bg-[#231712]/55 px-3 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C9A227]/60 bg-[#FFF9F0] text-[#C96F4A]">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 9.5h11v5.2a4.3 4.3 0 0 1-4.3 4.3H9.3A4.3 4.3 0 0 1 5 14.7V9.5Z"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 10.5h1.4a2.3 2.3 0 0 1 0 4.6H16"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
                <path
                  d="M8.5 6.8c.7-.8.7-1.7 0-2.5M12 6.8c.7-.8.7-1.7 0-2.5M15.5 6.8c.7-.8.7-1.7 0-2.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#F2C14E]">
                Cafetulia · Tutorial
              </p>
              <p className="truncate font-serif text-sm font-bold text-[#FFF9F0] sm:text-base">
                Aprende en la mesa de demostración
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-1.5 sm:flex">
            {STEPS.map((s, idx) => (
              <button
                key={s.kicker}
                type="button"
                onClick={() => goTo(idx)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold transition-colors ${
                  idx === step
                    ? 'border-[#F2C14E] bg-[#F2C14E] text-[#231712]'
                    : 'border-[#FFF9F0]/25 text-[#FFF9F0]/75 hover:bg-[#FFF9F0]/10'
                }`}
              >
                <span>{idx + 1}</span>
                <span className="hidden lg:inline">
                  {idx === 0 ? 'Abrir mesa' : idx === 1 ? 'Silla compartida' : 'Barra'}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] shrink-0 rounded-xl border-2 border-[#FFF9F0]/35 bg-[#FFF9F0]/10 px-3 text-xs font-bold text-[#FFF9F0] transition-colors hover:bg-[#FFF9F0]/20"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto cafe-scroll">
        <div className="mx-auto flex min-h-full w-full max-w-[1180px] flex-col gap-3 p-3 sm:p-4 lg:grid lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start lg:gap-6 lg:p-6">
          <section className="flex min-w-0 flex-col items-center gap-2">
            <div className="flex w-full max-w-[520px] items-center justify-between gap-2">
              <span className="rounded-full border border-[#FFF9F0]/25 bg-[#231712]/45 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#FFF9F0]/85">
                Mesa de demostración
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A227]/60 bg-[#FEF6E0] px-2.5 py-1 text-[10px] font-extrabold text-[#7B5236]">
                Tú · <span className="font-mono tabular-nums">{scenario.score}</span> monedas
              </span>
            </div>

            <div className="relative aspect-square w-full max-w-[min(90vw,520px)] overflow-hidden rounded-[22px] border-2 border-[#231712] bg-[#EFE3CE] shadow-[0_6px_0_#1E130E,0_18px_36px_rgba(0,0,0,0.28)]">
              <IllustratedBoard
                embedded
                showTableDetail={false}
                softFocus
                showBarAction={step === 2}
                gameState={demo}
                selectedTile={scenario.selectedTile}
                draftPlacements={[]}
                seatInspections={scenario.inspections}
                focusedTableId={scenario.focusTableId}
                nightMode={false}
                reducedMotion={reducedMotion}
                chairToast={null}
                onDismissToast={() => undefined}
                onSeatClick={handleSeatClick}
                onTableClick={handleTableClick}
                onBarClick={handleBarClick}
              />

              {hint && (
                <div
                  role="status"
                  className="absolute inset-x-3 bottom-3 z-40 mx-auto max-w-sm rounded-xl border border-[#C9A227] bg-[#3E2F2A] px-3 py-2 text-center text-[11px] font-semibold text-[#FFF9F0] shadow-lg"
                >
                  {hint}
                </div>
              )}
            </div>

            <TutorialHand
              hand={demo.hands[YOU] ?? []}
              relevantIds={relevantIds}
              label={handLabel}
            />
          </section>

          <aside className="w-full">
            <motion.div
              key={step}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
              className="rounded-[24px] border-2 border-[#231712] bg-[#FFFDF8] p-4 text-[#3E2F2A] shadow-[0_5px_0_#1E130E,0_18px_32px_rgba(0,0,0,0.24)] sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#C96F4A]">
                  {stepMeta.kicker}
                </span>
                <span className="font-mono text-[10px] font-bold text-[#8A7365]">
                  {step + 1} / {STEPS.length}
                </span>
              </div>
              <h2
                id="tutorial-title"
                className="mt-1 font-serif text-2xl font-bold leading-tight text-[#231712] sm:text-3xl"
              >
                {stepMeta.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4B3A31]">{stepMeta.body}</p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">{stepMeta.chips}</div>

              <div className="mt-3 rounded-xl border border-[#C9A227]/55 bg-[#FEF6E0] px-3 py-2 text-[11px] leading-snug text-[#6B4A2F]">
                <strong className="font-extrabold text-[#7B5236]">Regla de oro:</strong>{' '}
                {stepMeta.rule}
              </div>

              {done && (
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 flex items-center gap-2 rounded-xl border border-[#3F5E4A]/35 bg-[#E6F4EA] px-3 py-2 text-[11px] font-semibold text-[#3F5E4A]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3F5E4A] text-[11px] text-[#FFF9F0]">
                    ✓
                  </span>
                  <span>{stepMeta.result}</span>
                </motion.div>
              )}

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#3E2F2A]/12 pt-3">
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => goTo(step - 1)}
                  className="min-h-[40px] rounded-xl border-2 border-[#231712]/20 bg-[#F7EEDF] px-3 text-xs font-bold text-[#3E2F2A] transition-colors hover:bg-[#EAD9C0] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Anterior
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!done) {
                      trigger();
                    } else if (isLast) {
                      onClose();
                    } else {
                      goTo(step + 1);
                    }
                  }}
                  className="min-h-[42px] rounded-xl border-2 border-[#231712] bg-gradient-to-b from-[#D1744E] to-[#BE5F3A] px-4 text-xs font-extrabold text-[#FFFDF8] shadow-[0_3px_0_#231712] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                >
                  {done ? stepMeta.doneLabel : stepMeta.actionLabel}
                </button>
              </div>

              <p className="mt-2 text-center text-[10px] text-[#8A7365]">
                {done
                  ? isLast
                    ? 'Tutorial completado. Pulsa «Terminar tutorial» para volver a la mesa.'
                    : 'Puedes repetir el gesto en la siguiente lección.'
                  : step === 2
                    ? 'También puedes tocar el primer posavasos de la barra.'
                    : 'También puedes tocar directamente la silla marcada en el tablero.'}
              </p>
            </motion.div>

            <div className="mt-3 hidden rounded-2xl border border-[#FFF9F0]/20 bg-[#231712]/45 p-3 text-[#FFF9F0] backdrop-blur-sm lg:block">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#F2C14E]">
                Tu recorrido
              </p>
              <div className="mt-2 space-y-1.5">
                {STEPS.map((s, idx) => {
                  const complete = idx < step || (idx === step && done);
                  const current = idx === step;
                  return (
                    <button
                      key={s.kicker}
                      type="button"
                      onClick={() => goTo(idx)}
                      className={`flex w-full items-center gap-2 rounded-xl border px-2 py-1.5 text-left text-[11px] transition-colors ${
                        current
                          ? 'border-[#F2C14E]/70 bg-[#FFF9F0]/10'
                          : 'border-transparent hover:bg-[#FFF9F0]/8'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-extrabold ${
                          complete
                            ? 'border-[#3F5E4A] bg-[#3F5E4A] text-[#FFF9F0]'
                            : current
                              ? 'border-[#F2C14E] bg-[#F2C14E] text-[#231712]'
                              : 'border-[#FFF9F0]/30 text-[#FFF9F0]/60'
                        }`}
                      >
                        {complete ? '✓' : idx + 1}
                      </span>
                      <span className={current ? 'font-bold text-[#FFF9F0]' : 'text-[#FFF9F0]/75'}>
                        {idx === 0 ? 'Abrir una mesa' : idx === 1 ? 'Silla compartida' : 'La barra'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
