import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  applyMove,
  createGame,
  createRng,
  finalScores,
  getLegalMoves,
  isTerminal,
  type GameState,
  type Move,
} from '../src/index.js';

/**
 * Picks a legal move using a fast heuristic / RNG mix so simulations exercise
 * table placements (1 and 2 tiles), joker swaps, and bar placements, while
 * remaining 100% deterministic for any given seed.
 */
function pickSimulatedMove(state: GameState, rng: ReturnType<typeof createRng>): Move {
  const playerId = state.turn;
  const hand = state.hands[playerId] ?? [];

  // Exercise full getLegalMoves (1-tile, 2-tile table placements, swaps) on turn 1 and turn 2
  // so every simulated game exercises table placements + bar placements deterministically and fast
  if (state.turnNumber <= 2) {
    const allMoves = getLegalMoves(state, playerId);
    const seatMoves = allMoves.filter((m) => m.type === 'seat' || m.type === 'swap');
    const pool = seatMoves.length > 0 ? seatMoves : allMoves;
    const chosen = pool[rng.nextInt(pool.length)];
    if (chosen) {
      return chosen;
    }
  }

  // Fast path: if a natural tile can go to the bar, or fall back to getLegalMoves
  const naturalTiles = hand.filter((t) => t.nation !== 'joker');
  const barHasSpace = state.bar.some((slot) => slot === null);
  if (naturalTiles.length > 0 && barHasSpace) {
    const tile = naturalTiles[rng.nextInt(naturalTiles.length)]!;
    return { type: 'bar', tileId: tile.id };
  }

  const allMoves = getLegalMoves(state, playerId);
  const chosen = allMoves[rng.nextInt(allMoves.length)];
  if (!chosen) {
    throw new Error(`No legal moves found for player ${playerId} on turn ${state.turnNumber}`);
  }
  return chosen;
}

function verifyStateInvariants(state: GameState): void {
  // 1. Total tiles in existence must always be 100
  const bagCount = state.bag.length;
  const handCount = Object.values(state.hands).reduce((acc, h) => acc + h.length, 0);
  const seatedCount = state.seats.filter((s) => s.occupant !== null).length;
  const barCount = state.bar.filter((b) => b !== null).length;
  expect(bagCount + handCount + seatedCount + barCount).toBe(100);

  // 2. Bar never contains a joker in classic_2009
  for (const slot of state.bar) {
    if (slot) {
      expect(slot.nation).not.toBe('joker');
    }
  }

  // 3. Every occupied table respects gender balance (never > 2 of same gender)
  const seatsById = new Map(state.seats.map((s) => [s.id, s]));
  for (const table of state.tables) {
    let m = 0;
    let f = 0;
    for (const sid of table.seatIds) {
      const occ = seatsById.get(sid)?.occupant;
      if (occ?.gender === 'M') m++;
      if (occ?.gender === 'F') f++;
    }
    expect(m).toBeLessThanOrEqual(2);
    expect(f).toBeLessThanOrEqual(2);
    if (m + f === 2) {
      expect(m).toBe(1);
      expect(f).toBe(1);
    }
  }
}

function reconstructScoresFromLog(state: GameState): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const p of state.players) {
    totals[p.id] = 0;
  }

  for (const ev of state.log) {
    if (ev.type === 'tile_seated') {
      totals[ev.playerId] = (totals[ev.playerId] ?? 0) + ev.pointsEarned;
    } else if (ev.type === 'tile_bar') {
      totals[ev.playerId] = (totals[ev.playerId] ?? 0) + ev.pointsDelta;
    }
  }

  return totals;
}

describe('Property-based simulations (1,000 random games)', () => {
  it('simulates 1,000 random games with seeded RNG without illegal states, always terminating and matching log score reconstruction', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 1_000_000 }),
        fc.integer({ min: 2, max: 4 }),
        async (seed, playerCount) => {
          const players = Array.from({ length: playerCount }, (_, idx) => ({
            id: `p${idx + 1}`,
            nickname: `Jugador ${idx + 1}`,
          }));

          let state = createGame({ players }, seed);
          const simRng = createRng(seed ^ 0x9e3779b9);

          let safetyCounter = 0;
          while (!isTerminal(state) && safetyCounter < 300) {
            const move = pickSimulatedMove(state, simRng);
            const res = applyMove(state, move);
            expect(res.ok).toBe(true);
            if (!res.ok) {
              throw new Error(`Move failed: ${res.error.code} - ${res.error.message}`);
            }
            state = res.state;
            verifyStateInvariants(state);
            safetyCounter += 1;

            // Yield periodically so Vitest's worker can report progress and avoid
            // the "Timeout calling onTaskUpdate" false positive on long runs.
            if (safetyCounter % 20 === 0) {
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }

          // Game must always terminate
          expect(isTerminal(state)).toBe(true);
          expect(state.phase).toBe('finished');
          expect(state.terminalReason).toBeDefined();

          // Reconstruct score from log and verify against finalScores
          const logScores = reconstructScoresFromLog(state);
          const summary = finalScores(state);

          for (const player of state.players) {
            expect(player.score).toBe(logScores[player.id]);
            const playerSummary = summary.scores[player.id];
            expect(playerSummary).toBeDefined();
            if (playerSummary) {
              expect(playerSummary.tableAndBarScore).toBe(logScores[player.id]);
              expect(playerSummary.finalScore).toBe(
                playerSummary.tableAndBarScore - playerSummary.handPenalty,
              );
            }
          }
        },
      ),
      { numRuns: 1000 },
    );
  });
});
