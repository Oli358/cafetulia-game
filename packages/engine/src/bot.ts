import { createRng } from './rng.js';
import { getLegalMoves } from './legal.js';
import { scorePlacement } from './scoring.js';
import type { GameState, Move, PlayerId } from './types.js';

export type BotDifficulty = 'basic' | 'medium' | 'hard';

/**
 * Evaluates the net points and pure tables gained by a candidate Move.
 */
export function evaluateMovePoints(
  state: GameState,
  move: Move,
): { points: number; pureTables: number; tilesPlaced: number } {
  if (move.type === 'swap') {
    return { points: 0, pureTables: 0, tilesPlaced: 0 };
  }

  if (move.type === 'bar') {
    const nextIdx = state.bar.findIndex((slot) => slot === null);
    const barPoints = nextIdx >= 0 ? (state.barValues[nextIdx] ?? -14) : -14;
    return { points: barPoints, pureTables: 0, tilesPlaced: 1 };
  }

  let totalPoints = 0;
  let totalPure = 0;
  const workingSeats = state.seats.map((s) => ({ ...s }));
  const playerId = state.turn;
  const hand = state.hands[playerId] ?? [];

  for (const placement of move.placements) {
    const tile = hand.find((t) => t.id === placement.tileId);
    if (!tile) continue;
    const seat = workingSeats.find((s) => s.id === placement.seatId);
    if (!seat) continue;

    const representedNation =
      tile.nation === 'joker'
        ? (placement.jokerNation ?? seat.allowedNations[0] ?? 'af')
        : tile.nation;

    const breakdown = scorePlacement(
      { tables: state.tables, seats: workingSeats },
      { ...placement, jokerNation: representedNation },
      tile,
    );

    totalPoints += breakdown.totalPoints;
    totalPure += breakdown.pureTablesCompleted;
    seat.occupant =
      tile.nation === 'joker'
        ? { ...tile, jokerNation: representedNation }
        : { ...tile };
  }

  return {
    points: totalPoints,
    pureTables: totalPure,
    tilesPlaced: move.placements.length,
  };
}

/**
 * Selects a sensible automatic move when a player's turn timer expires:
 * 1. If there is a legal table placement that scores points (> 0) or is the opening move, pick the highest-scoring one.
 * 2. Otherwise, send the least valuable natural tile from hand to the bar (preferring a tile whose nation has fewer free seats left).
 * 3. Otherwise, pick any remaining legal move (e.g. swap).
 */
export function selectSensibleAutoMove(
  state: GameState,
  playerId: PlayerId = state.turn,
): Move | null {
  const legalMoves = getLegalMoves(state, playerId);
  if (legalMoves.length === 0) {
    return null;
  }

  const seatMoves = legalMoves.filter((m) => m.type === 'seat');
  const firstSeatMove = seatMoves[0];
  if (firstSeatMove) {
    let bestSeatMove = firstSeatMove;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const candidate of seatMoves) {
      const evalResult = evaluateMovePoints(state, candidate);
      const composite =
        evalResult.points * 100 + evalResult.pureTables * 50 + evalResult.tilesPlaced * 10;
      if (composite > bestScore) {
        bestScore = composite;
        bestSeatMove = candidate;
      }
    }

    return bestSeatMove;
  }

  const barMoves = legalMoves.filter(
    (m): m is Extract<Move, { type: 'bar' }> => m.type === 'bar',
  );
  const firstBarMove = barMoves[0];
  if (firstBarMove) {
    const hand = state.hands[playerId] ?? [];
    const emptySeats = state.seats.filter((s) => s.occupant === null);

    let leastValuableBarMove = firstBarMove;
    let minFreeSeatsForNation = Number.POSITIVE_INFINITY;

    for (const bm of barMoves) {
      const tile = hand.find((t) => t.id === bm.tileId);
      if (!tile || tile.nation === 'joker') continue;
      const freeForNation = emptySeats.filter((s) =>
        s.allowedNations.includes(tile.nation as never),
      ).length;
      if (freeForNation < minFreeSeatsForNation) {
        minFreeSeatsForNation = freeForNation;
        leastValuableBarMove = bm;
      }
    }

    return leastValuableBarMove;
  }

  return legalMoves[0] ?? null;
}

/**
 * Selects a move for a Bot according to its configured difficulty level:
 * - 'basic': picks a random valid table placement if available, otherwise bar/swap.
 * - 'medium': picks a table placement prioritizing points, or bar if none.
 * - 'hard': maximizes points + pure tables + shared seat bonuses, and uses joker swaps strategically.
 */
export function selectBotMove(
  state: GameState,
  playerId: PlayerId = state.turn,
  difficulty: BotDifficulty = 'basic',
): Move | null {
  const legalMoves = getLegalMoves(state, playerId);
  if (legalMoves.length === 0) {
    return null;
  }

  if (difficulty === 'basic') {
    const rng = createRng(state.rngState ^ state.turnNumber);
    const seatMoves = legalMoves.filter((m) => m.type === 'seat');
    const firstSeatMove = seatMoves[0];
    if (firstSeatMove) {
      return seatMoves[rng.nextInt(seatMoves.length)] ?? firstSeatMove;
    }
    return selectSensibleAutoMove(state, playerId);
  }

  if (difficulty === 'medium') {
    return selectSensibleAutoMove(state, playerId);
  }

  // 'hard': evaluate swaps if hand has no high-scoring 2-tile placement, and penalize wasting jokers on low points
  const swapMoves = legalMoves.filter((m) => m.type === 'swap');
  const seatMoves = legalMoves.filter((m) => m.type === 'seat');
  const hand = state.hands[playerId] ?? [];

  const firstSeatMove = seatMoves[0];
  if (firstSeatMove) {
    let bestMove = firstSeatMove;
    let bestUtility = Number.NEGATIVE_INFINITY;

    for (const candidate of seatMoves) {
      const evalResult = evaluateMovePoints(state, candidate);
      let usesJoker = false;
      if (candidate.type === 'seat') {
        for (const p of candidate.placements) {
          const t = hand.find((item) => item.id === p.tileId);
          if (t?.nation === 'joker') {
            usesJoker = true;
          }
        }
      }
      const jokerCost = usesJoker ? -250 : 0;
      const utility =
        evalResult.points * 100 +
        evalResult.pureTables * 400 +
        evalResult.tilesPlaced * 25 +
        jokerCost;

      if (utility > bestUtility) {
        bestUtility = utility;
        bestMove = candidate;
      }
    }

    // If best seat move scores very little (< 3 pts) and a free joker swap is available, take the joker!
    const firstSwapMove = swapMoves[0];
    if (bestUtility < 300 && firstSwapMove) {
      return firstSwapMove;
    }

    return bestMove;
  }

  const firstSwapMove = swapMoves[0];
  if (firstSwapMove) {
    return firstSwapMove;
  }

  return selectSensibleAutoMove(state, playerId);
}
