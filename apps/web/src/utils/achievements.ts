import { createRng, finalScores, type GameState, type Player } from '@cafetulia/engine';

export type AchievementIcon =
  'cup' | 'crown' | 'coin' | 'table' | 'bar' | 'joker' | 'spark' | 'leaf' | 'hand' | 'star';

export type AchievementTone = 'gold' | 'terracotta' | 'sage' | 'blue' | 'plum';

export type MatchAchievement = {
  id: string;
  title: string;
  description: string;
  playerId: string;
  icon: AchievementIcon;
  tone: AchievementTone;
  value: string;
};

type PlayerStats = {
  player: Player;
  seated: number;
  bar: number;
  jokersUsed: number;
  pureTables: number;
  bestTurn: number;
  doubleHits: number;
  firstSeatIndex: number;
  lastActionIndex: number;
  penalty: number;
  tablePoints: number;
  finalScore: number;
};

function sortBest(
  stats: PlayerStats[],
  scorer: (s: PlayerStats) => number,
  tieBreaker: (a: PlayerStats, b: PlayerStats) => number = (a, b) => b.finalScore - a.finalScore,
): PlayerStats | null {
  const eligible = stats.filter((s) => scorer(s) > 0);
  if (eligible.length === 0) return null;
  eligible.sort((a, b) => scorer(b) - scorer(a) || tieBreaker(a, b));
  return eligible[0] ?? null;
}

function pickOne(
  stats: PlayerStats[],
  predicate: (s: PlayerStats) => boolean,
  compare: (a: PlayerStats, b: PlayerStats) => number,
): PlayerStats | null {
  const eligible = stats.filter(predicate);
  eligible.sort(compare);
  return eligible[0] ?? null;
}

/**
 * Builds 2-4 "sellos de la noche" from the real match log.
 * The pool is filtered by what actually happened and then shuffled with a seed
 * derived from the match, so every game gets a different combination while the
 * result stays stable on re-renders/reloads.
 */
export function computeMatchAchievements(state: GameState): MatchAchievement[] {
  const summary = finalScores(state);
  const statsById = new Map<string, PlayerStats>();

  for (const player of state.players) {
    const score = summary.scores[player.id];
    statsById.set(player.id, {
      player,
      seated: 0,
      bar: 0,
      jokersUsed: 0,
      pureTables: 0,
      bestTurn: 0,
      doubleHits: 0,
      firstSeatIndex: -1,
      lastActionIndex: -1,
      penalty: score?.handPenalty ?? 0,
      tablePoints: score?.tableAndBarScore ?? player.score,
      finalScore: score?.finalScore ?? player.score,
    });
  }

  state.log.forEach((event, index) => {
    if (event.type === 'tile_seated') {
      const stat = statsById.get(event.playerId);
      if (!stat) return;
      stat.seated += 1;
      stat.jokersUsed += event.tile.nation === 'joker' ? 1 : 0;
      stat.pureTables += event.pureTablesCompleted;
      stat.bestTurn = Math.max(stat.bestTurn, event.pointsEarned);
      if (event.tableBreakdowns.filter((table) => table.points > 0).length >= 2) {
        stat.doubleHits += 1;
      }
      if (stat.firstSeatIndex < 0) stat.firstSeatIndex = index;
      stat.lastActionIndex = index;
      return;
    }
    if (event.type === 'tile_bar') {
      const stat = statsById.get(event.playerId);
      if (!stat) return;
      stat.bar += 1;
      stat.lastActionIndex = index;
      return;
    }
    if (event.type === 'joker_swapped') {
      const stat = statsById.get(event.playerId);
      if (!stat) return;
      stat.jokersUsed += 1;
      stat.lastActionIndex = index;
    }
  });

  const stats = [...statsById.values()];
  const winners = state.players.filter((p) => summary.winners.includes(p.id));
  const bestTablePoints = Math.max(...stats.map((s) => s.tablePoints));

  const candidates: MatchAchievement[] = [];
  const add = (stat: PlayerStats | null, data: Omit<MatchAchievement, 'playerId'>): void => {
    if (!stat) return;
    if (candidates.some((c) => c.id === data.id && c.playerId === stat.player.id)) return;
    candidates.push({ ...data, playerId: stat.player.id });
  };

  const firstSeat = pickOne(
    stats,
    (s) => s.firstSeatIndex >= 0,
    (a, b) => a.firstSeatIndex - b.firstSeatIndex,
  );
  add(firstSeat, {
    id: 'primera-taza',
    title: 'Primera taza',
    description: 'Abrió la primera mesa de la noche.',
    icon: 'cup',
    tone: 'terracotta',
    value: 'Primera jugada',
  });

  const host = sortBest(stats, (s) => s.seated);
  if (host && host.seated >= 2) {
    add(host, {
      id: 'anfitrion',
      title: 'Anfitrión de la noche',
      description: `Sentó a ${host.seated} invitados en las mesas.`,
      icon: 'hand',
      tone: 'sage',
      value: `${host.seated} invitados`,
    });
  }

  const bigPlay = sortBest(stats, (s) => s.bestTurn);
  if (bigPlay && bigPlay.bestTurn >= 4) {
    add(bigPlay, {
      id: 'golpe-de-monedas',
      title: 'Golpe de monedas',
      description: `Su mejor jugada valió ${bigPlay.bestTurn} puntos de una vez.`,
      icon: 'coin',
      tone: 'gold',
      value: `+${bigPlay.bestTurn} pts`,
    });
  }

  const barKing = sortBest(stats, (s) => s.bar);
  if (barKing) {
    add(barKing, {
      id: 'rey-de-la-barra',
      title: 'Rey de la barra',
      description: `Sirvió ${barKing.bar} posavasos sin perder la sonrisa.`,
      icon: 'bar',
      tone: 'terracotta',
      value: `${barKing.bar} posavasos`,
    });
  }

  const pureTable = sortBest(stats, (s) => s.pureTables);
  if (pureTable) {
    add(pureTable, {
      id: 'mesa-de-la-casa',
      title: 'Mesa de la casa',
      description: `Completó ${pureTable.pureTables} mesa${
        pureTable.pureTables === 1 ? '' : 's'
      } nacional${pureTable.pureTables === 1 ? '' : 'es'}.`,
      icon: 'table',
      tone: 'sage',
      value: `${pureTable.pureTables} pura${pureTable.pureTables === 1 ? '' : 's'}`,
    });
  }

  const jokerFan = sortBest(stats, (s) => s.jokersUsed);
  if (jokerFan) {
    add(jokerFan, {
      id: 'comodin-de-la-casa',
      title: 'Comodín de la casa',
      description: 'Puso a trabajar un comodín en el momento justo.',
      icon: 'joker',
      tone: 'plum',
      value: `${jokerFan.jokersUsed} comodín${jokerFan.jokersUsed === 1 ? '' : 'es'}`,
    });
  }

  const doubleRound = sortBest(stats, (s) => s.doubleHits);
  if (doubleRound) {
    add(doubleRound, {
      id: 'doble-ronda',
      title: 'Doble ronda',
      description: 'Puntuó en dos mesas con una sola silla compartida.',
      icon: 'spark',
      tone: 'blue',
      value: `${doubleRound.doubleHits} ${doubleRound.doubleHits === 1 ? 'vez' : 'veces'}`,
    });
  }

  const cleanBar = pickOne(
    stats,
    (s) => s.bar === 0 && s.seated > 0,
    (a, b) => b.finalScore - a.finalScore,
  );
  add(cleanBar, {
    id: 'sin-pasar-por-la-barra',
    title: 'Sin pasar por la barra',
    description: 'Resolvió toda la noche en las mesas.',
    icon: 'leaf',
    tone: 'sage',
    value: '0 posavasos',
  });

  const softHand = pickOne(
    stats,
    () => true,
    (a, b) => a.penalty - b.penalty || b.finalScore - a.finalScore,
  );
  add(softHand, {
    id: 'mano-de-seda',
    title: 'Mano de seda',
    description:
      softHand && softHand.penalty === 0
        ? 'Cerró la partida sin una sola ficha en la mano.'
        : `Solo ${softHand?.penalty ?? 0} puntos de penalización al cerrar.`,
    icon: 'leaf',
    tone: 'gold',
    value: softHand && softHand.penalty === 0 ? '0 pts' : `-${softHand?.penalty ?? 0} pts`,
  });

  const lastAction = pickOne(
    stats,
    (s) => s.lastActionIndex >= 0,
    (a, b) => b.lastActionIndex - a.lastActionIndex,
  );
  add(lastAction, {
    id: 'ultimo-cafe',
    title: 'El último café',
    description: 'Puso la última ficha de la partida.',
    icon: 'cup',
    tone: 'terracotta',
    value: 'Última jugada',
  });

  const winnerStat = pickOne(
    stats.filter((s) => winners.some((w) => w.id === s.player.id)),
    () => true,
    (a, b) => b.finalScore - a.finalScore,
  );
  add(winnerStat, {
    id: 'la-cuenta-final',
    title: 'La cuenta final',
    description: 'Se llevó la tertulia con la cuenta más alta.',
    icon: 'crown',
    tone: 'gold',
    value: winnerStat ? `${winnerStat.finalScore} pts` : '',
  });

  const comeback = pickOne(
    stats.filter((s) => winners.some((w) => w.id === s.player.id)),
    (s) => s.tablePoints < bestTablePoints,
    (a, b) => b.finalScore - a.finalScore,
  );
  add(comeback, {
    id: 'remontada',
    title: 'Remontada',
    description: 'La mano más limpia le dio la vuelta a la cuenta final.',
    icon: 'spark',
    tone: 'blue',
    value: comeback ? `${comeback.finalScore} pts` : '',
  });

  const noJokerWin = pickOne(
    stats.filter((s) => winners.some((w) => w.id === s.player.id)),
    (s) => s.jokersUsed === 0 && s.seated > 0,
    (a, b) => b.finalScore - a.finalScore,
  );
  add(noJokerWin, {
    id: 'victoria-sin-comodin',
    title: 'Victoria sin comodín',
    description: 'Ganó sin gastar ni un solo comodín.',
    icon: 'star',
    tone: 'sage',
    value: 'Sin comodines',
  });

  if (candidates.length === 0) return [];

  const seed = `${state.seed}:${state.log.length}:${state.players.map((p) => p.id).join(',')}:sellos`;
  const shuffled = createRng(seed).shuffle(candidates);
  const maxPerPlayer = state.players.length <= 2 ? 2 : 1;
  const countByPlayer = new Map<string, number>();
  const selected: MatchAchievement[] = [];

  for (const achievement of shuffled) {
    if (selected.length >= 4) break;
    const count = countByPlayer.get(achievement.playerId) ?? 0;
    if (count >= maxPerPlayer) continue;
    selected.push(achievement);
    countByPlayer.set(achievement.playerId, count + 1);
  }

  if (selected.length < Math.min(4, candidates.length)) {
    for (const achievement of shuffled) {
      if (selected.length >= Math.min(4, candidates.length)) break;
      if (selected.includes(achievement)) continue;
      selected.push(achievement);
    }
  }

  return selected;
}
