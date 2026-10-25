import { OFFICIAL_NATION_ORDER, createInitialBoard } from './board.js';
import { nextInt, normalizeSeed, shuffleWithRng } from './rng.js';
import type { GameConfig, GameState, Player, PlayerId, Tile } from './types.js';

export const INITIAL_HAND_SIZE = 5;

/**
 * Generates the official 100 tiles:
 * - 96 guest tiles: 4 Male ('M') + 4 Female ('F') for each of the 12 nations.
 * - 4 joker tiles: 2 Male ('M') + 2 Female ('F').
 */
export function createFullTileSet(): Tile[] {
  const tiles: Tile[] = [];

  for (const nation of OFFICIAL_NATION_ORDER) {
    for (let i = 1; i <= 4; i++) {
      tiles.push({
        id: `tile_${nation}_m_${i}`,
        nation,
        gender: 'M',
      });
    }
    for (let i = 1; i <= 4; i++) {
      tiles.push({
        id: `tile_${nation}_f_${i}`,
        nation,
        gender: 'F',
      });
    }
  }

  tiles.push({ id: 'tile_joker_m_1', nation: 'joker', gender: 'M' });
  tiles.push({ id: 'tile_joker_m_2', nation: 'joker', gender: 'M' });
  tiles.push({ id: 'tile_joker_f_1', nation: 'joker', gender: 'F' });
  tiles.push({ id: 'tile_joker_f_2', nation: 'joker', gender: 'F' });

  return tiles;
}

/**
 * Creates a new deterministic game state, shuffles the 100 tiles,
 * deals 5 public tiles to each player, and selects the starting player.
 */
export function createGame(config: GameConfig, seed: number | string = 1): GameState {
  if (config.players.length < 2 || config.players.length > 4) {
    throw new Error(`Invalid player count ${config.players.length}: expected 2 to 4 players.`);
  }

  const uniquePlayerIds = new Set(config.players.map((p) => p.id));
  if (uniquePlayerIds.size !== config.players.length) {
    throw new Error('Player IDs must be unique.');
  }

  const normalizedSeed = normalizeSeed(seed);
  const fullDeck = createFullTileSet();
  const shuffled = shuffleWithRng(fullDeck, normalizedSeed);
  const bag = shuffled.items;
  let rngState = shuffled.nextState;

  const players: Player[] = config.players.map((p) => ({
    id: p.id,
    nickname: p.nickname,
    avatarId: p.avatarId,
    score: 0,
    connected: true,
    isBot: p.isBot,
    botDifficulty: p.botDifficulty,
  }));

  const hands: Record<PlayerId, Tile[]> = {};
  const handSize: Record<PlayerId, number> = {};

  for (const player of players) {
    handSize[player.id] = INITIAL_HAND_SIZE;
    hands[player.id] = bag.splice(0, INITIAL_HAND_SIZE);
  }

  let startingPlayerId: PlayerId;
  if (config.startingPlayerId !== undefined) {
    const exists = players.some((p) => p.id === config.startingPlayerId);
    if (!exists) {
      throw new Error(`Configured startingPlayerId "${config.startingPlayerId}" is not in players.`);
    }
    startingPlayerId = config.startingPlayerId;
  } else {
    const pick = nextInt(rngState, players.length);
    rngState = pick.nextState;
    const chosenPlayer = players[pick.value];
    if (!chosenPlayer) {
      throw new Error('Failed to select starting player.');
    }
    startingPlayerId = chosenPlayer.id;
  }

  const { tables, seats, bar, barValues } = createInitialBoard();

  return {
    config: {
      edition: config.edition ?? 'classic_2009',
    },
    seed: normalizedSeed,
    rngState,
    players,
    bag,
    hands,
    handSize,
    tables,
    seats,
    bar,
    barValues,
    turn: startingPlayerId,
    startingPlayerId,
    turnNumber: 1,
    phase: 'playing',
    log: [
      {
        type: 'game_started',
        startingPlayerId,
        seed,
      },
    ],
  };
}
