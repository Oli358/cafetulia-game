import type { FinalScoreSummary, GameState, PlayerId, TerminalReason } from './types.js';

export const NATURAL_TILE_PENALTY = 5;
export const JOKER_TILE_PENALTY = 10;
export const CLASSIC_BAG_END_THRESHOLD = 3; // Drawing the 4th from last leaves <= 3 tiles in the bag

/**
 * Checks whether the current state satisfies any of the 4 official end-of-game conditions
 * (or last player standing in a 2-player game after disconnect).
 */
export function checkTerminalCondition(state: GameState): {
  terminal: boolean;
  reason?: TerminalReason;
} {
  if (state.phase === 'finished') {
    return { terminal: true, reason: state.terminalReason };
  }

  const connectedPlayers = state.players.filter((p) => p.connected);
  if (state.players.length === 2 && connectedPlayers.length < 2) {
    return { terminal: true, reason: 'last_player_standing' };
  }

  // 1. Last free table seat is occupied
  const allSeatsOccupied = state.seats.every((s) => s.occupant !== null);
  if (allSeatsOccupied) {
    return { terminal: true, reason: 'last_seat_occupied' };
  }

  // 2. Bar slot 20 (index 19) is occupied
  const barSlot20Occupied = state.bar.length >= 20 && state.bar[19] !== null;
  if (barSlot20Occupied) {
    return { terminal: true, reason: 'bar_full' };
  }

  // 3. A connected player has no tiles in hand and does not need to draw (handSize === 0 or bag empty)
  for (const player of connectedPlayers) {
    const hand = state.hands[player.id] ?? [];
    const maxHand = state.handSize[player.id] ?? 0;
    if (hand.length === 0 && (maxHand === 0 || state.bag.length === 0)) {
      return { terminal: true, reason: 'player_empty_hand' };
    }
  }

  // 4. A player draws the 4th tile from the end of the bag (classic_2009: <= 3 tiles left in bag)
  // or the last tile (rio_grande_2015: 0 tiles left in bag)
  const threshold =
    state.config.edition === 'rio_grande_2015' ? 0 : CLASSIC_BAG_END_THRESHOLD;
  if (state.bag.length <= threshold) {
    return { terminal: true, reason: 'bag_threshold_reached' };
  }

  return { terminal: false };
}

/**
 * Returns true if the game has reached a terminal state.
 */
export function isTerminal(state: GameState): boolean {
  return checkTerminalCondition(state).terminal;
}

/**
 * Computes the final scores for all players, subtracting 5 points per natural tile
 * and 10 points per joker tile remaining in each player's hand, and determines the winner(s).
 * Tie rule: shared victory.
 */
export function finalScores(state: GameState): {
  scores: Record<PlayerId, FinalScoreSummary>;
  winners: PlayerId[];
} {
  const scores: Record<PlayerId, FinalScoreSummary> = {};
  const connectedPlayers = state.players.filter((p) => p.connected);

  // Special case: in a 2-player game where one player was kicked, the remaining player wins
  if (state.terminalReason === 'last_player_standing' && connectedPlayers.length === 1) {
    for (const player of state.players) {
      const hand = state.hands[player.id] ?? [];
      const naturalTilesRemaining = hand.filter((t) => t.nation !== 'joker').length;
      const jokersRemaining = hand.filter((t) => t.nation === 'joker').length;
      const handPenalty = player.connected
        ? naturalTilesRemaining * NATURAL_TILE_PENALTY + jokersRemaining * JOKER_TILE_PENALTY
        : 0;
      scores[player.id] = {
        playerId: player.id,
        tableAndBarScore: player.score,
        naturalTilesRemaining,
        jokersRemaining,
        handPenalty,
        finalScore: player.score - handPenalty,
      };
    }
    const soleWinner = connectedPlayers[0];
    return {
      scores,
      winners: soleWinner ? [soleWinner.id] : [],
    };
  }

  let bestScore = Number.NEGATIVE_INFINITY;
  for (const player of state.players) {
    const hand = state.hands[player.id] ?? [];
    const naturalTilesRemaining = hand.filter((t) => t.nation !== 'joker').length;
    const jokersRemaining = hand.filter((t) => t.nation === 'joker').length;
    const handPenalty =
      naturalTilesRemaining * NATURAL_TILE_PENALTY + jokersRemaining * JOKER_TILE_PENALTY;
    const finalScore = player.score - handPenalty;

    scores[player.id] = {
      playerId: player.id,
      tableAndBarScore: player.score,
      naturalTilesRemaining,
      jokersRemaining,
      handPenalty,
      finalScore,
    };

    if (player.connected && finalScore > bestScore) {
      bestScore = finalScore;
    }
  }

  const winners = state.players
    .filter((p) => p.connected && scores[p.id]?.finalScore === bestScore)
    .map((p) => p.id);

  return { scores, winners };
}
