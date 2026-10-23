import type { NationCode } from '@cafetulia/content';

export type Nation = NationCode;
export type Gender = 'M' | 'F';
export type PlayerId = string;

export type Tile = {
  id: string;
  nation: Nation | 'joker';
  gender: Gender;
  /**
   * Only set when nation === 'joker' and the tile is seated on a chair.
   * Indicates the nation represented by this joker.
   */
  jokerNation?: Nation;
};

export type Seat = {
  id: string;
  row: number;
  col: number;
  tableIds: string[];
  allowedNations: Nation[];
  shared: boolean;
  occupant: Tile | null;
};

export type Table = {
  id: string;
  nation: Nation;
  row: number;
  col: number;
  seatIds: string[];
};

export type BarSlot = {
  index: number;
  value: number;
  occupant: Tile | null;
};

export type Player = {
  id: PlayerId;
  nickname: string;
  score: number;
  connected: boolean;
  isBot?: boolean;
  botDifficulty?: 'basic' | 'medium' | 'hard';
};

export type RulesetEdition = 'classic_2009' | 'rio_grande_2015';

export type GameConfig = {
  players: {
    id: PlayerId;
    nickname: string;
    isBot?: boolean;
    botDifficulty?: 'basic' | 'medium' | 'hard';
  }[];
  startingPlayerId?: PlayerId;
  edition?: RulesetEdition;
};

export type Placement = {
  tileId: string;
  seatId: string;
  /**
   * Required when placing a joker tile; optional for natural tiles
   * (must match one of the seat's allowed nations).
   */
  jokerNation?: Nation;
};

export type Move =
  | {
      type: 'seat';
      placements: [Placement] | [Placement, Placement];
    }
  | {
      type: 'bar';
      tileId: string;
    }
  | {
      type: 'swap';
      seatId: string;
      tileId: string;
    };

export type TableScoreBreakdown = {
  tableId: string;
  occupantCount: number;
  unanimousNation: boolean;
  points: number;
  completedPureTable: boolean;
};

export type PlacementScoreBreakdown = {
  seatId: string;
  tileId: string;
  representedNation: Nation;
  tableBreakdowns: TableScoreBreakdown[];
  totalPoints: number;
  pureTablesCompleted: number;
};

export type TerminalReason =
  | 'last_seat_occupied'
  | 'bar_full'
  | 'player_empty_hand'
  | 'bag_threshold_reached'
  | 'last_player_standing';

export type MoveEvent =
  | {
      type: 'game_started';
      startingPlayerId: PlayerId;
      seed: number | string;
    }
  | {
      type: 'tile_seated';
      playerId: PlayerId;
      tile: Tile;
      seatId: string;
      pointsEarned: number;
      tableBreakdowns: TableScoreBreakdown[];
      pureTablesCompleted: number;
      isOpeningFreeMove: boolean;
    }
  | {
      type: 'tile_bar';
      playerId: PlayerId;
      tile: Tile;
      barIndex: number;
      pointsDelta: number;
    }
  | {
      type: 'joker_swapped';
      playerId: PlayerId;
      seatId: string;
      naturalTile: Tile;
      jokerTile: Tile;
    }
  | {
      type: 'tiles_drawn';
      playerId: PlayerId;
      count: number;
      drawnTileIds: string[];
      bagRemaining: number;
    }
  | {
      type: 'hand_size_reduced';
      playerId: PlayerId;
      previousHandSize: number;
      newHandSize: number;
      reason: 'pure_table';
    }
  | {
      type: 'player_kicked';
      playerId: PlayerId;
      returnedTilesCount: number;
    }
  | {
      type: 'turn_changed';
      playerId: PlayerId;
      turnNumber: number;
    }
  | {
      type: 'game_finished';
      reason: TerminalReason;
      winners: PlayerId[];
      finalScores: Record<PlayerId, FinalScoreSummary>;
    };

export type FinalScoreSummary = {
  playerId: PlayerId;
  tableAndBarScore: number;
  naturalTilesRemaining: number;
  jokersRemaining: number;
  handPenalty: number;
  finalScore: number;
};

export type GameState = {
  config: {
    edition: RulesetEdition;
  };
  seed: number;
  rngState: number;
  players: Player[];
  bag: Tile[];
  hands: Record<PlayerId, Tile[]>;
  handSize: Record<PlayerId, number>;
  tables: Table[];
  seats: Seat[];
  bar: (Tile | null)[];
  barValues: number[];
  turn: PlayerId;
  startingPlayerId: PlayerId;
  turnNumber: number;
  phase: 'lobby' | 'playing' | 'finished';
  terminalReason?: TerminalReason;
  winners?: PlayerId[];
  log: MoveEvent[];
};

export type MoveErrorCode =
  | 'GAME_NOT_PLAYING'
  | 'NOT_PLAYER_TURN'
  | 'INVALID_PLAYER'
  | 'INVALID_PLACEMENT_COUNT'
  | 'DUPLICATE_TILE_IN_MOVE'
  | 'DUPLICATE_SEAT_IN_MOVE'
  | 'TILE_NOT_IN_HAND'
  | 'SEAT_NOT_FOUND'
  | 'SEAT_ALREADY_OCCUPIED'
  | 'SEAT_EMPTY'
  | 'SEAT_NOT_JOKER'
  | 'SWAP_REQUIRES_NATURAL_TILE'
  | 'SWAP_GENDER_MISMATCH'
  | 'NATION_NOT_ALLOWED_ON_SEAT'
  | 'JOKER_NATION_REQUIRED'
  | 'JOKER_NOT_ALLOWED_AT_BAR'
  | 'BAR_FULL'
  | 'GENDER_BALANCE_VIOLATED'
  | 'ALONE_GUEST_VIOLATION'
  | 'PLACEMENT_MUST_SCORE';

export type MoveValidationError = {
  code: MoveErrorCode;
  message: string;
};

export type ApplyMoveResult =
  | {
      ok: true;
      state: GameState;
      events: MoveEvent[];
    }
  | {
      ok: false;
      error: MoveValidationError;
    };
