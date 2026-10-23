import { checkTerminalCondition, finalScores } from './endgame.js';
import { isBoardCompletelyEmpty, validateMove } from './legal.js';
import { shuffleWithRng } from './rng.js';
import { scorePlacement } from './scoring.js';
import type {
  ApplyMoveResult,
  GameState,
  Move,
  MoveEvent,
  Nation,
  PlayerId,
  Seat,
  Tile,
} from './types.js';

function cloneState(state: GameState): GameState {
  const handsCopy: Record<PlayerId, Tile[]> = {};
  for (const [pid, hand] of Object.entries(state.hands)) {
    handsCopy[pid] = hand.map((t) => ({ ...t }));
  }

  return {
    config: { ...state.config },
    seed: state.seed,
    rngState: state.rngState,
    players: state.players.map((p) => ({ ...p })),
    bag: state.bag.map((t) => ({ ...t })),
    hands: handsCopy,
    handSize: { ...state.handSize },
    tables: state.tables.map((t) => ({ ...t, seatIds: [...t.seatIds] })),
    seats: state.seats.map((s) => ({
      ...s,
      tableIds: [...s.tableIds],
      allowedNations: [...s.allowedNations],
      occupant: s.occupant ? { ...s.occupant } : null,
    })),
    bar: state.bar.map((t) => (t ? { ...t } : null)),
    barValues: [...state.barValues],
    turn: state.turn,
    startingPlayerId: state.startingPlayerId,
    turnNumber: state.turnNumber,
    phase: state.phase,
    terminalReason: state.terminalReason,
    winners: state.winners ? [...state.winners] : undefined,
    log: [...state.log],
  };
}

function getNextConnectedPlayerId(state: GameState, currentPlayerId: PlayerId): PlayerId {
  const count = state.players.length;
  const startIdx = state.players.findIndex((p) => p.id === currentPlayerId);
  if (startIdx === -1) {
    return currentPlayerId;
  }

  for (let offset = 1; offset <= count; offset++) {
    const candidate = state.players[(startIdx + offset) % count];
    if (candidate?.connected) {
      return candidate.id;
    }
  }

  return currentPlayerId;
}

/**
 * Validates and applies a player's move to the GameState, returning a brand-new immutable
 * GameState and the list of MoveEvents produced during the turn.
 */
export function applyMove(
  state: GameState,
  move: Move,
  playerId: PlayerId = state.turn,
): ApplyMoveResult {
  const validationError = validateMove(state, move, playerId);
  if (validationError) {
    return {
      ok: false,
      error: validationError,
    };
  }

  const next = cloneState(state);
  const events: MoveEvent[] = [];
  const player = next.players.find((p) => p.id === playerId);
  const hand = next.hands[playerId];

  if (!player || !hand) {
    return {
      ok: false,
      error: {
        code: 'INVALID_PLAYER',
        message: `Jugador ${playerId} no encontrado.`,
      },
    };
  }

  if (move.type === 'bar') {
    const tileIdx = hand.findIndex((t) => t.id === move.tileId);
    const [tile] = hand.splice(tileIdx, 1);
    if (!tile) {
      return {
        ok: false,
        error: {
          code: 'TILE_NOT_IN_HAND',
          message: `La ficha ${move.tileId} no está en la mano.`,
        },
      };
    }

    const barSlotIdx = next.bar.findIndex((slot) => slot === null);
    const pointsDelta = next.barValues[barSlotIdx] ?? 0;
    next.bar[barSlotIdx] = { ...tile };
    player.score += pointsDelta;

    events.push({
      type: 'tile_bar',
      playerId,
      tile: { ...tile },
      barIndex: barSlotIdx + 1,
      pointsDelta,
    });
  } else if (move.type === 'swap') {
    const tileIdx = hand.findIndex((t) => t.id === move.tileId);
    const [naturalTile] = hand.splice(tileIdx, 1);
    const seat = next.seats.find((s: Seat) => s.id === move.seatId);

    if (!naturalTile || !seat || !seat.occupant) {
      return {
        ok: false,
        error: {
          code: 'SEAT_NOT_JOKER',
          message: 'No se pudo completar el cambio de comodín.',
        },
      };
    }

    const returnedJoker: Tile = {
      id: seat.occupant.id,
      nation: 'joker',
      gender: seat.occupant.gender,
    };

    seat.occupant = { ...naturalTile };
    hand.push(returnedJoker);

    events.push({
      type: 'joker_swapped',
      playerId,
      seatId: seat.id,
      naturalTile: { ...naturalTile },
      jokerTile: returnedJoker,
    });
  } else {
    // move.type === 'seat'
    const boardWasEmpty = isBoardCompletelyEmpty(next.seats);
    const isOpeningFreeMove =
      boardWasEmpty &&
      next.turn === next.startingPlayerId &&
      next.turnNumber === 1 &&
      move.placements.length === 1;

    for (const placement of move.placements) {
      const tileIdx = hand.findIndex((t) => t.id === placement.tileId);
      const [tile] = hand.splice(tileIdx, 1);
      const seat = next.seats.find((s: Seat) => s.id === placement.seatId);
      if (!tile || !seat) {
        continue;
      }

      const representedNation: Nation =
        tile.nation === 'joker'
          ? (placement.jokerNation ?? seat.allowedNations[0] ?? 'af')
          : tile.nation;

      const breakdown = scorePlacement(
        { tables: next.tables, seats: next.seats },
        { ...placement, jokerNation: representedNation },
        tile,
      );

      const seatedTile: Tile =
        tile.nation === 'joker'
          ? { ...tile, jokerNation: representedNation }
          : { ...tile };

      seat.occupant = seatedTile;
      player.score += breakdown.totalPoints;

      events.push({
        type: 'tile_seated',
        playerId,
        tile: seatedTile,
        seatId: seat.id,
        pointsEarned: breakdown.totalPoints,
        tableBreakdowns: breakdown.tableBreakdowns,
        pureTablesCompleted: breakdown.pureTablesCompleted,
        isOpeningFreeMove,
      });

      if (breakdown.pureTablesCompleted > 0) {
        for (let c = 0; c < breakdown.pureTablesCompleted; c++) {
          const prevSize = next.handSize[playerId] ?? 0;
          const newSize = Math.max(0, prevSize - 1);
          next.handSize[playerId] = newSize;
          events.push({
            type: 'hand_size_reduced',
            playerId,
            previousHandSize: prevSize,
            newHandSize: newSize,
            reason: 'pure_table',
          });
        }
      }
    }
  }

  // Check if the board or bar or empty-hand condition already ended the game BEFORE drawing,
  // or draw tiles if move is 'seat' or 'bar'
  let terminalCheck = checkTerminalCondition(next);

  if (!terminalCheck.terminal && move.type !== 'swap') {
    const targetHandSize = next.handSize[playerId] ?? 0;
    const needed = Math.max(0, targetHandSize - hand.length);
    const drawnIds: string[] = [];
    const bagThreshold = next.config.edition === 'rio_grande_2015' ? 0 : 3;

    for (let d = 0; d < needed; d++) {
      if (next.bag.length === 0) {
        break;
      }
      const drawn = next.bag.shift();
      if (drawn) {
        hand.push(drawn);
        drawnIds.push(drawn.id);
      }
      // Classic rule: game ends immediately when a player draws the 4th tile from the end of the bag
      if (next.bag.length <= bagThreshold) {
        break;
      }
    }

    if (drawnIds.length > 0) {
      events.push({
        type: 'tiles_drawn',
        playerId,
        count: drawnIds.length,
        drawnTileIds: drawnIds,
        bagRemaining: next.bag.length,
      });
    }

    terminalCheck = checkTerminalCondition(next);
  }

  if (terminalCheck.terminal && terminalCheck.reason) {
    next.phase = 'finished';
    next.terminalReason = terminalCheck.reason;
    const summary = finalScores(next);
    next.winners = summary.winners;

    events.push({
      type: 'game_finished',
      reason: terminalCheck.reason,
      winners: summary.winners,
      finalScores: summary.scores,
    });
  } else {
    const nextPlayerId = getNextConnectedPlayerId(next, playerId);
    next.turn = nextPlayerId;
    next.turnNumber += 1;
    events.push({
      type: 'turn_changed',
      playerId: nextPlayerId,
      turnNumber: next.turnNumber,
    });
  }

  next.log.push(...events);

  return {
    ok: true,
    state: next,
    events,
  };
}

/**
 * Handles player disconnection expulsion (after 15s timeout):
 * - Marks the player as disconnected.
 * - Returns all tiles from the expelled player's hand back to the bag and reshuffles deterministically.
 * - Seated guests remain on the board.
 * - In a 2-player game, the match ends immediately and the remaining player wins.
 * - In a 3–4 player game, play continues and turn advances if it was the expelled player's turn.
 */
export function kickDisconnectedPlayer(
  state: GameState,
  playerId: PlayerId,
): { state: GameState; events: MoveEvent[] } {
  const next = cloneState(state);
  const events: MoveEvent[] = [];
  const player = next.players.find((p) => p.id === playerId);

  if (!player || !player.connected || next.phase !== 'playing') {
    return { state: next, events };
  }

  player.connected = false;
  const hand = next.hands[playerId] ?? [];
  const returnedCount = hand.length;

  if (returnedCount > 0) {
    const cleanedTiles: Tile[] = hand.map((t) => ({
      id: t.id,
      nation: t.nation,
      gender: t.gender,
    }));
    next.bag.push(...cleanedTiles);
    next.hands[playerId] = [];
    const reshuffled = shuffleWithRng(next.bag, next.rngState);
    next.bag = reshuffled.items;
    next.rngState = reshuffled.nextState;
  }

  events.push({
    type: 'player_kicked',
    playerId,
    returnedTilesCount: returnedCount,
  });

  const terminalCheck = checkTerminalCondition(next);
  if (terminalCheck.terminal && terminalCheck.reason) {
    next.phase = 'finished';
    next.terminalReason = terminalCheck.reason;
    const summary = finalScores(next);
    next.winners = summary.winners;
    events.push({
      type: 'game_finished',
      reason: terminalCheck.reason,
      winners: summary.winners,
      finalScores: summary.scores,
    });
  } else if (next.turn === playerId) {
    const nextPlayerId = getNextConnectedPlayerId(next, playerId);
    next.turn = nextPlayerId;
    next.turnNumber += 1;
    events.push({
      type: 'turn_changed',
      playerId: nextPlayerId,
      turnNumber: next.turnNumber,
    });
  }

  next.log.push(...events);
  return { state: next, events };
}
