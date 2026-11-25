import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { createRng, finalScores } from '@cafetulia/engine';
import { formatScoreEs } from '@cafetulia/ui';
import { soundEngine } from '../audio/soundEngine';
import { PlayerAvatar } from '../art/CharacterPortrait';
import { useGameStore } from '../store/gameStore';
import {
  computeMatchAchievements,
  type AchievementIcon,
  type AchievementTone,
} from '../utils/achievements';
import { AnimatedScore } from './CoinTray';

const RESULT_BG = '/backgrounds/cafe-bar.jpg';

const CONFETTI_COLORS = ['#C9A227', '#C96F4A', '#3F5E4A', '#1E4E8C', '#FFF9F0', '#B3261E'];

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  width: number;
  height: number;
  color: string;
  shape: 'strip' | 'square' | 'round' | 'bean';
  sway: number;
  rotate: number;
};

function makeConfetti(burst: number): ConfettiPiece[] {
  const rng = createRng(`cafetulia-confetti-${burst}`);
  return Array.from({ length: 72 }, (_, id) => {
    const shapeRoll = rng.nextInt(10);
    const shape: ConfettiPiece['shape'] =
      shapeRoll < 4 ? 'strip' : shapeRoll < 7 ? 'square' : shapeRoll < 9 ? 'round' : 'bean';
    const width =
      shape === 'strip' ? 5 + rng.nextInt(4) : shape === 'bean' ? 10 : 6 + rng.nextInt(5);
    const height =
      shape === 'strip' ? 10 + rng.nextInt(8) : shape === 'bean' ? 6 : 6 + rng.nextInt(5);
    return {
      id,
      left: 2 + rng.nextInt(96),
      delay: rng.nextFloat() * 1.3,
      duration: 3.2 + rng.nextFloat() * 2.6,
      width,
      height,
      color: CONFETTI_COLORS[rng.nextInt(CONFETTI_COLORS.length)] ?? '#C9A227',
      shape,
      sway: (rng.nextFloat() - 0.5) * 180,
      rotate: (rng.nextFloat() - 0.5) * 1080,
    };
  });
}

function ResultConfetti({
  burst,
  reducedMotion,
}: {
  burst: number;
  reducedMotion: boolean;
}): React.ReactElement | null {
  const pieces = useMemo(() => makeConfetti(burst), [burst]);
  if (reducedMotion) return null;

  return (
    <div
      data-testid="final-paper-confetti"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
    >
      {pieces.map((piece) => (
        <motion.span
          key={`${burst}-${piece.id}`}
          initial={{ y: '-10vh', x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: '112vh',
            x: [0, piece.sway, piece.sway * 0.45],
            opacity: [0, 1, 1, 0.85, 0],
            rotate: [0, piece.rotate],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'linear',
          }}
          style={{
            left: `${piece.left}%`,
            width: piece.width,
            height: piece.height,
            backgroundColor: piece.color,
            borderRadius:
              piece.shape === 'round' ? '999px' : piece.shape === 'bean' ? '999px' : '2px',
          }}
          className="absolute top-0 block border border-[#231712]/25 shadow-[0_1px_2px_rgba(35,23,18,0.18)]"
        />
      ))}
    </div>
  );
}

function AchievementIcon({
  icon,
  className = '',
}: {
  icon: AchievementIcon;
  className?: string;
}): React.ReactElement {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  };

  switch (icon) {
    case 'cup':
      return (
        <svg {...common}>
          <path d="M5 9.5h11v4.6a4.4 4.4 0 0 1-4.4 4.4H9.4A4.4 4.4 0 0 1 5 14.1V9.5Z" />
          <path d="M16 10.4h1.5a2.3 2.3 0 0 1 0 4.6H16" />
          <path d="M8.4 6.5c.8-.8.8-1.6 0-2.4M11.7 6.5c.8-.8.8-1.6 0-2.4M15 6.5c.8-.8.8-1.6 0-2.4" />
        </svg>
      );
    case 'crown':
      return (
        <svg {...common}>
          <path d="M4 18h16l1-10-5 3-4-6-4 6-5-3 1 10Z" />
          <path d="M5 21h14" />
        </svg>
      );
    case 'coin':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="5.5" strokeDasharray="2 2" />
          <path d="M10 12h4M12 10v4" />
        </svg>
      );
    case 'table':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="5.5" />
          <circle cx="12" cy="4.5" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="12" cy="19.5" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="19.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'bar':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="8" rx="7" ry="2.5" />
          <path d="M5 8v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V8" />
          <path d="M7 15.5V19M17 15.5V19M5 19h14" />
        </svg>
      );
    case 'joker':
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="16" rx="2.5" />
          <path d="m12 8 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4L12 8Z" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...common}>
          <path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case 'leaf':
      return (
        <svg {...common}>
          <path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14Z" />
          <path d="M5 19c3-4 6-7 10-9" />
        </svg>
      );
    case 'hand':
      return (
        <svg {...common}>
          <path d="M8 11V6.5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V11m0-3a1.5 1.5 0 0 1 3 0v7.5c0 3.3-2.4 5.5-5.7 5.5H10c-2 0-3.2-.9-4.2-2.4L4.4 16a1.6 1.6 0 0 1 2.5-2l1.1 1.3" />
        </svg>
      );
    case 'star':
    default:
      return (
        <svg {...common}>
          <path d="m12 3 2.6 5.5 6 .7-4.4 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.2l6-.7L12 3Z" />
        </svg>
      );
  }
}

const TONE_CLASSES: Record<AchievementTone, string> = {
  gold: 'border-[#C9A227] bg-[#FEF6E0] text-[#7B5236]',
  terracotta: 'border-[#C96F4A] bg-[#FDECE6] text-[#A94E2C]',
  sage: 'border-[#3F5E4A] bg-[#E6F4EA] text-[#3F5E4A]',
  blue: 'border-[#1E4E8C] bg-[#E6EEF8] text-[#1E4E8C]',
  plum: 'border-[#7A3E5C] bg-[#F2E6EC] text-[#7A3E5C]',
};

function rankStyle(rank: number): string {
  if (rank === 1) return 'border-[#231712] bg-[#C9A227] text-[#231712] shadow-[0_2px_0_#231712]';
  if (rank === 2) return 'border-[#8A7365]/50 bg-[#E7DFD2] text-[#4B3A31]';
  if (rank === 3) return 'border-[#7B5236] bg-[#C98A5A] text-[#FFF9F0]';
  return 'border-[#231712]/20 bg-[#FFF9F0] text-[#6F5A4E]';
}

export function FinishedScreen(): React.ReactElement {
  const snapshot = useGameStore((s) => s.snapshot);
  const shareResult = useGameStore((s) => s.shareResult);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const voteRematch = useGameStore((s) => s.voteRematch);
  const leaveRoom = useGameStore((s) => s.leaveRoom);
  const [postcardUrl, setPostcardUrl] = useState<string | null>(null);
  const [confettiBurst, setConfettiBurst] = useState(0);
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
      setConfettiBurst((value) => value + 1);
    }, 1150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reducedMotion, sequenceSkipped]);

  const gameState = snapshot?.gameState;
  const summary = useMemo(() => (gameState ? finalScores(gameState) : null), [gameState]);

  const standings = useMemo(() => {
    if (!snapshot || !gameState || !summary) return [];
    return gameState.players
      .map((p) => {
        const score = summary.scores[p.id];
        const member = snapshot.members.find((m) => m.id === p.id);
        const isBot = p.isBot || member?.role === 'bot';
        return {
          id: p.id,
          nickname: p.nickname,
          isBot,
          avatarId: member?.avatarId ?? p.avatarId ?? 'moka',
          tablePoints: score?.tableAndBarScore ?? p.score,
          naturalLeft: score?.naturalTilesRemaining ?? 0,
          jokerLeft: score?.jokersRemaining ?? 0,
          penalty: score?.handPenalty ?? 0,
          finalScore: score?.finalScore ?? p.score,
          isWinner: summary.winners.includes(p.id),
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);
  }, [snapshot, gameState, summary]);

  const achievements = useMemo(
    () => (gameState ? computeMatchAchievements(gameState) : []),
    [gameState],
  );

  if (!snapshot || !gameState || !summary) return <div />;

  const avatarById = new Map(standings.map((st) => [st.id, st.avatarId]));
  const nicknameById = new Map(standings.map((st) => [st.id, st.nickname]));
  const winners = standings.filter((st) => st.isWinner);
  const isSharedVictory = winners.length > 1;
  const topWinner = winners[0] ?? standings[0];
  const humanPlayers = snapshot.members.filter((m) => m.role === 'player');
  const rematchVotesCount = humanPlayers.filter((m) => m.rematchVote === true).length;

  const reasonLabels: Record<string, string> = {
    last_seat_occupied: 'Se ha ocupado la última silla del café.',
    bar_full: 'Se ha llenado la vigésima plaza de la barra.',
    player_empty_hand: 'Un jugador ha agotado su mano sin fichas para robar.',
    bag_threshold_reached: 'Quedan solo 3 fichas en la bolsa de terciopelo.',
    last_player_standing: 'El resto de jugadores abandonaron la mesa.',
  };
  const terminalReason =
    shareResult?.terminalReason ?? gameState.terminalReason ?? 'last_seat_occupied';
  const reasonText = reasonLabels[terminalReason] ?? 'Partida concluida.';

  const totalSeated = gameState.log.filter((event) => event.type === 'tile_seated').length;
  const totalPureTables = gameState.log.reduce(
    (total, event) => (event.type === 'tile_seated' ? total + event.pureTablesCompleted : total),
    0,
  );
  const totalBar = gameState.log.filter((event) => event.type === 'tile_bar').length;
  const rounds = Math.max(1, gameState.turnNumber - 1);

  const generatePostcard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 560;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#F7EEDF';
    ctx.fillRect(0, 0, 900, 560);
    ctx.strokeStyle = '#C9A227';
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, 864, 524);

    ctx.fillStyle = '#3E2F2A';
    ctx.font = 'bold 38px serif';
    ctx.fillText('Cafetulia — el álbum de la tertulia', 48, 76);

    ctx.fillStyle = '#6F5A4E';
    ctx.font = '18px sans-serif';
    ctx.fillText(
      `Mesa #${snapshot.code} · ${new Date().toLocaleDateString('es-ES')} · O & A`,
      48,
      110,
    );
    ctx.fillText(reasonText, 48, 138);

    standings.forEach((row, idx) => {
      const y = 190 + idx * 54;
      ctx.fillStyle = row.isWinner ? '#FEF6E0' : '#FFF9F0';
      ctx.fillRect(48, y - 34, 804, 44);
      ctx.fillStyle = '#3E2F2A';
      ctx.font = 'bold 21px sans-serif';
      ctx.fillText(
        `${idx + 1}º ${row.nickname}${row.isBot ? ' (Bot)' : ''} ${row.isWinner ? '★' : ''}`,
        66,
        y - 4,
      );
      ctx.textAlign = 'right';
      ctx.fillText(
        `${formatScoreEs(row.tablePoints)} pts − ${formatScoreEs(Math.abs(row.penalty))} penal. = ${formatScoreEs(row.finalScore)} pts`,
        832,
        y - 4,
      );
      ctx.textAlign = 'left';
    });

    setPostcardUrl(canvas.toDataURL('image/png'));
  };

  const columnsClass =
    standings.length === 2
      ? 'sm:grid-cols-2'
      : standings.length === 3
        ? 'sm:grid-cols-3'
        : 'sm:grid-cols-4';

  return (
    <div
      data-testid="finished-screen"
      className="relative h-[100dvh] max-h-[100dvh] w-full select-none overflow-hidden bg-[#251812] safe-bottom"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 8%, rgba(255, 233, 190, 0.22), transparent 45%), radial-gradient(circle at 50% 55%, rgba(255, 203, 130, 0.12), transparent 55%), linear-gradient(180deg, rgba(24, 14, 10, 0.34) 0%, rgba(30, 18, 13, 0.68) 58%, rgba(20, 12, 9, 0.84) 100%), url(${RESULT_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 42%',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 20%, rgba(255, 214, 128, 0.4) 0 2px, transparent 3px), radial-gradient(circle at 82% 18%, rgba(255, 214, 128, 0.35) 0 2px, transparent 3px), radial-gradient(circle at 30% 8%, rgba(255, 214, 128, 0.25) 0 2px, transparent 3px), radial-gradient(circle at 70% 10%, rgba(255, 214, 128, 0.3) 0 2px, transparent 3px)',
          backgroundSize: '260px 160px, 300px 180px, 220px 140px, 280px 160px',
        }}
      />

      <ResultConfetti burst={confettiBurst} reducedMotion={reducedMotion} />

      <div className="relative z-20 mx-auto flex h-full w-full max-w-6xl flex-col gap-2 px-2 py-2 sm:px-4 sm:py-4">
        <header className="flex shrink-0 items-center justify-between gap-2 rounded-2xl border border-[#FFF9F0]/10 bg-[#231712]/45 px-2 py-1.5 text-[#FFF9F0] backdrop-blur-sm sm:px-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <motion.span
              data-testid="final-stamp-heading"
              initial={reducedMotion ? false : { scale: 1.35, rotate: -6, opacity: 0 }}
              animate={{ scale: 1, rotate: -2, opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.28, ease: 'easeOut' }}
              className="inline-block shrink-0 rounded-xl border-2 border-[#1E130E] bg-[#C96F4A] px-3 py-1 font-serif text-lg font-extrabold uppercase tracking-wider text-[#FFF9F0] shadow-[3px_3px_0_#1E130E] sm:text-2xl"
            >
              ¡FINAL!
            </motion.span>
            <div className="min-w-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#F2C14E]">
                <span className="hidden sm:inline">El álbum de la tertulia · </span>Sala #
                {snapshot.code}
              </p>
              <p className="max-w-[190px] truncate text-[10px] text-[#FFF9F0]/75 sm:max-w-none sm:text-xs">
                {reasonText}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {recountStep !== 'final' && (
              <button
                type="button"
                data-testid="skip-final-sequence-btn"
                onClick={() => {
                  setSequenceSkipped(true);
                  setRecountStep('final');
                  setConfettiBurst((value) => value + 1);
                }}
                className="min-h-[34px] rounded-xl border border-[#FFF9F0]/25 bg-[#FFF9F0]/10 px-2.5 text-[10px] font-bold text-[#FFF9F0] transition-colors hover:bg-[#FFF9F0]/20"
              >
                Saltar
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfettiBurst((value) => value + 1)}
              className="min-h-[34px] rounded-xl border border-[#C9A227]/60 bg-[#C9A227]/15 px-2.5 text-[10px] font-extrabold text-[#F2C14E] transition-colors hover:bg-[#C9A227]/25"
            >
              Confeti ✦
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto cafe-scroll pr-0.5">
          <div className="flex min-h-full flex-col justify-center gap-2.5">
            <div className="grid gap-2.5 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
              <div className="space-y-2.5">
                {topWinner && (
                  <motion.section
                    data-testid="final-winner-hero"
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.24 }}
                    className="relative overflow-hidden rounded-[26px] border-2 border-[#C9A227] bg-[#FFFDF8] p-4 shadow-[0_5px_0_#1E130E,0_18px_36px_rgba(0,0,0,0.28)] sm:p-5"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[10px] border-[#C9A227]/15"
                    />
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="rounded-2xl border-2 border-[#1E130E] bg-[#FEF6E0] p-1 shadow-[0_2px_0_#1E130E]">
                          <PlayerAvatar avatarId={topWinner.avatarId} size={64} />
                        </div>
                        <span className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1E130E] bg-[#C9A227] text-[#231712] shadow-[0_2px_0_#1E130E]">
                          <AchievementIcon icon="crown" className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-[#C9A227] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#231712]">
                            {isSharedVictory ? 'Victoria compartida' : 'Ganador de la velada'}
                          </span>
                          {topWinner.isBot && (
                            <span className="rounded-full bg-[#3E2F2A] px-2 py-0.5 text-[9px] font-bold text-[#FFF9F0]">
                              Autómata del café
                            </span>
                          )}
                        </div>
                        <h1 className="mt-1 truncate font-serif text-3xl font-extrabold leading-tight text-[#231712] sm:text-5xl">
                          {isSharedVictory
                            ? winners.map((winner) => winner.nickname).join(' & ')
                            : topWinner.nickname}
                        </h1>
                        <p className="mt-0.5 text-[11px] text-[#6F5A4E]">
                          {isSharedVictory
                            ? 'La mesa se reparte el título de esta noche.'
                            : 'La cuenta más alta de la tertulia.'}
                        </p>
                      </div>
                      <div className="shrink-0 text-right leading-none">
                        <AnimatedScore
                          value={
                            recountStep === 'table' ? topWinner.tablePoints : topWinner.finalScore
                          }
                          reducedMotion={reducedMotion || sequenceSkipped}
                          font="serif"
                          pulseTone="none"
                          className="text-5xl text-[#231712] sm:text-7xl"
                        />
                        <span className="block text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#8A7365]">
                          monedas
                        </span>
                      </div>
                    </div>

                    {isSharedVictory && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-[#C9A227]/45 bg-[#FEF6E0] px-2.5 py-1.5 text-[10px] font-bold text-[#7B5236]">
                        <AchievementIcon icon="star" className="h-3.5 w-3.5" />
                        Empate en cabeza: la victoria es de todas las sillas implicadas.
                      </div>
                    )}
                  </motion.section>
                )}

                <div
                  data-testid="final-standings-list"
                  className={`grid grid-cols-2 gap-2 ${columnsClass}`}
                >
                  {standings.map((st, idx) => {
                    const shownScore = recountStep === 'table' ? st.tablePoints : st.finalScore;
                    const rank = idx + 1;
                    return (
                      <motion.div
                        key={st.id}
                        data-testid={`final-standing-row-${idx + 1}`}
                        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: reducedMotion ? 0 : 0.22,
                          delay: reducedMotion ? 0 : idx * 0.07,
                        }}
                        className={`relative flex flex-col items-center rounded-2xl border-2 p-3 text-center shadow-[0_3px_0_#1E130E] ${
                          st.isWinner
                            ? 'border-[#C9A227] bg-[#FEF6E0]'
                            : 'border-[#231712]/20 bg-[#FFF9F0]/95'
                        } ${rank === 1 ? 'ring-2 ring-[#C9A227]/55' : ''}`}
                      >
                        <div className="flex w-full items-center justify-between gap-1">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border font-serif text-[11px] font-extrabold ${rankStyle(rank)}`}
                          >
                            {rank}º
                          </span>
                          {st.isBot ? (
                            <span className="rounded bg-[#231712]/10 px-1.5 py-0.5 text-[8px] font-bold text-[#6F5A4E]">
                              Bot
                            </span>
                          ) : (
                            <span className="text-[8px] font-extrabold uppercase tracking-wide text-[#8A7365]">
                              {st.isWinner ? 'Ganador' : 'En mesa'}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 rounded-xl border border-[#231712]/15 bg-[#F5EBDD] p-1">
                          <PlayerAvatar avatarId={st.avatarId} size={40} />
                        </div>
                        <h3 className="mt-1 w-full truncate font-serif text-sm font-bold text-[#231712]">
                          {st.nickname}
                        </h3>
                        <div className="mt-0.5 flex items-baseline justify-center gap-0.5">
                          <AnimatedScore
                            value={shownScore}
                            reducedMotion={reducedMotion || sequenceSkipped}
                            font="serif"
                            pulseTone="none"
                            className={`text-4xl leading-none ${
                              shownScore < 0 ? 'text-[#A94438]' : 'text-[#231712]'
                            }`}
                          />
                          <span className="text-[8px] font-extrabold uppercase tracking-wide text-[#8A7365]">
                            pts
                          </span>
                        </div>
                        <p className="mt-1 text-[9px] font-semibold leading-tight text-[#6F5A4E]">
                          {recountStep === 'table' ? (
                            <>mesas y barra</>
                          ) : (
                            <>
                              {formatScoreEs(st.tablePoints)} −{' '}
                              {formatScoreEs(Math.abs(st.penalty))} penal.
                            </>
                          )}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="rounded-2xl border-2 border-[#C9A227]/60 bg-[#FEF6E0] p-2.5 text-[#3E2F2A] shadow-[0_3px_0_#1E130E]">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#C96F4A]">
                        Sellos de la noche
                      </p>
                      <h2 className="font-serif text-xl font-bold leading-tight text-[#231712]">
                        Logros de esta partida
                      </h2>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C9A227]/60 bg-[#FFF9F0] text-[#7B5236]">
                      <AchievementIcon icon="star" className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] leading-snug text-[#6F5A4E]">
                    Cada tertulia reparte sus propios sellos. Estos son los de hoy.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {achievements.map((achievement, idx) => {
                    const owner = nicknameById.get(achievement.playerId) ?? 'Invitado';
                    return (
                      <motion.div
                        key={`${achievement.id}-${achievement.playerId}`}
                        initial={reducedMotion ? false : { opacity: 0, y: 8, rotate: -1 }}
                        animate={{ opacity: 1, y: 0, rotate: idx % 2 === 0 ? -0.6 : 0.6 }}
                        transition={{ duration: reducedMotion ? 0 : 0.22, delay: idx * 0.06 }}
                        className="relative rounded-2xl border-2 border-[#231712] bg-[#FFFDF8] p-2.5 shadow-[0_3px_0_#1E130E]"
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 ${TONE_CLASSES[achievement.tone]}`}
                          >
                            <AchievementIcon icon={achievement.icon} className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-serif text-sm font-extrabold leading-tight text-[#231712]">
                                {achievement.title}
                              </h3>
                              <span className="shrink-0 rounded-full border border-[#C9A227]/45 bg-[#FEF6E0] px-1.5 py-0.5 text-[8px] font-extrabold text-[#7B5236]">
                                {achievement.value}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[10px] leading-snug text-[#6F5A4E]">
                              {achievement.description}
                            </p>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <PlayerAvatar
                                avatarId={avatarById.get(achievement.playerId) ?? 'moka'}
                                size={18}
                              />
                              <span className="truncate text-[10px] font-extrabold text-[#3E2F2A]">
                                {owner}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {achievements.length === 0 && (
                    <p className="rounded-2xl border border-[#FFF9F0]/15 bg-[#FFF9F0]/10 p-3 text-[11px] text-[#FFF9F0]/70">
                      La noche fue tan corta que no hubo tiempo para repartir sellos.
                    </p>
                  )}
                </div>

                {postcardUrl && (
                  <div className="rounded-2xl border border-[#FFF9F0]/20 bg-[#FFF9F0]/10 p-2.5 text-center">
                    <img
                      src={postcardUrl}
                      alt="Postal de resultado de Cafetulia"
                      referrerPolicy="no-referrer"
                      className="mx-auto max-h-36 rounded-xl border border-[#FFF9F0]/25"
                    />
                    <a
                      href={postcardUrl}
                      download={`cafetulia-${snapshot.code}.png`}
                      className="mt-1.5 inline-block rounded-xl border border-[#C9A227]/60 bg-[#C9A227]/15 px-3 py-1 text-[10px] font-extrabold text-[#F2C14E]"
                    >
                      Descargar postal PNG
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#FFF9F0]/65">
              <span className="h-px flex-1 bg-[#FFF9F0]/15" />
              <span className="text-[9px] font-extrabold uppercase tracking-[0.16em]">
                La cuenta de la noche
              </span>
              <span className="h-px flex-1 bg-[#FFF9F0]/15" />
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {[
                { label: 'Rondas', value: rounds },
                { label: 'Invitados', value: totalSeated },
                { label: 'Mesas puras', value: totalPureTables },
                { label: 'Posavasos', value: totalBar },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[#FFF9F0]/20 bg-[#FFF9F0]/10 px-2.5 py-2 text-center text-[#FFF9F0] backdrop-blur-sm"
                >
                  <div className="font-serif text-2xl font-extrabold leading-none text-[#F2C14E]">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#FFF9F0]/65">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#C9A227]/45 bg-[#FEF6E0] px-3 py-2.5 text-[#3E2F2A] shadow-[0_3px_0_#1E130E]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C9A227]/60 bg-[#FFF9F0] text-[#C96F4A]">
                  <AchievementIcon icon="cup" className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-serif text-base font-bold leading-tight">
                    Hasta la próxima tertulia.
                  </p>
                  <p className="text-[10px] leading-snug text-[#6F5A4E]">
                    La casa recoge las tazas. Gracias por sentarte con nosotros.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif text-xs font-bold text-[#231712]">
                  Cafetulia · Sala #{snapshot.code}
                </p>
                <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#8A7365]">
                  {new Date().toLocaleDateString('es-ES')} · O &amp; A
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer
          data-testid="final-credits-block"
          className="shrink-0 rounded-2xl border border-[#FFF9F0]/15 bg-[#FFF9F0]/10 px-2.5 py-2 backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-[#FFF9F0]/65">
              <span className="font-serif text-xs font-bold text-[#FFF9F0]">
                Cafetulia — una tertulia de café
              </span>
              <span>· Arte original</span>
              <span>· Gracias por jugar</span>
              <span
                data-testid="final-credits-oa"
                className="rounded-lg border border-[#C9A227]/55 bg-[#FEF6E0] px-1.5 py-0.5 font-serif text-[10px] font-bold text-[#231712]"
                title="Dedicatoria del café"
              >
                Dedicatoria: O &amp; A
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <button
                type="button"
                data-testid="generate-postcard-btn"
                onClick={generatePostcard}
                className="min-h-[34px] rounded-xl border border-[#FFF9F0]/25 bg-[#FFF9F0]/10 px-2.5 text-[10px] font-bold text-[#FFF9F0] transition-colors hover:bg-[#FFF9F0]/20"
              >
                Generar postal
              </button>
              <button
                type="button"
                data-testid="back-to-title-btn"
                onClick={leaveRoom}
                className="min-h-[34px] rounded-xl border border-[#FFF9F0]/25 bg-[#FFF9F0]/10 px-2.5 text-[10px] font-bold text-[#FFF9F0] transition-colors hover:bg-[#FFF9F0]/20"
              >
                Volver a la portada
              </button>
              <button
                type="button"
                data-testid="rematch-btn"
                onClick={() => void voteRematch(true)}
                className="min-h-[36px] rounded-xl border-2 border-[#231712] bg-gradient-to-b from-[#D1744E] to-[#BE5F3A] px-3 text-[10px] font-extrabold text-[#FFFDF8] shadow-[0_3px_0_#1E130E] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              >
                Votar revancha ({rematchVotesCount}/{Math.max(1, humanPlayers.length)})
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
