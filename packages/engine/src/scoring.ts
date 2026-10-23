import type {
  GameState,
  Nation,
  Placement,
  PlacementScoreBreakdown,
  Seat,
  Table,
  TableScoreBreakdown,
  Tile,
} from './types.js';

/**
 * Returns the effective nation represented by a seated tile.
 */
export function getEffectiveTileNation(tile: Tile): Nation {
  if (tile.nation === 'joker') {
    if (!tile.jokerNation) {
      throw new Error(`Joker tile ${tile.id} does not have a jokerNation assigned.`);
    }
    return tile.jokerNation;
  }
  return tile.nation;
}

/**
 * Evaluates the score of a single table right after a tile has been placed on one of its seats.
 * Rules:
 * - 1 guest: 0 points
 * - 2 guests: 2 points (mixed) or 4 points (same nationality)
 * - 3 guests: 3 points (mixed) or 6 points (same nationality)
 * - 4 guests: 4 points (mixed) or 8 points (same nationality)
 * Note: Table nationality does not dictate unanimous nationality; what matters is whether all
 * seated guests at that table share the same represented nationality.
 */
export function evaluateTableAfterPlacement(
  table: Table,
  seatsById: ReadonlyMap<string, Seat>,
): TableScoreBreakdown {
  const occupiedTiles: Tile[] = [];

  for (const seatId of table.seatIds) {
    const seat = seatsById.get(seatId);
    if (seat?.occupant) {
      occupiedTiles.push(seat.occupant);
    }
  }

  const occupantCount = occupiedTiles.length;
  if (occupantCount < 2) {
    return {
      tableId: table.id,
      occupantCount,
      unanimousNation: false,
      points: 0,
      completedPureTable: false,
    };
  }

  const representedNations = occupiedTiles.map(getEffectiveTileNation);
  const firstNation = representedNations[0];
  const unanimousNation =
    firstNation !== undefined && representedNations.every((n) => n === firstNation);

  const points = unanimousNation ? occupantCount * 2 : occupantCount;
  const completedPureTable = occupantCount === 4 && unanimousNation;

  return {
    tableId: table.id,
    occupantCount,
    unanimousNation,
    points,
    completedPureTable,
  };
}

/**
 * Computes the score breakdown of placing a single tile on a seat,
 * assuming the state passed in is the state BEFORE the placement (or after the first placement in a 2-tile turn).
 */
export function scorePlacement(
  state: Pick<GameState, 'tables' | 'seats'> & {
    hands?: GameState['hands'];
  },
  placement: Placement,
  explicitTile?: Tile,
): PlacementScoreBreakdown {
  const targetSeat = state.seats.find((s) => s.id === placement.seatId);
  if (!targetSeat) {
    throw new Error(`Seat ${placement.seatId} not found.`);
  }

  let tileToPlace = explicitTile;
  if (!tileToPlace && state.hands) {
    for (const hand of Object.values(state.hands)) {
      const found = hand.find((t) => t.id === placement.tileId);
      if (found) {
        tileToPlace = found;
        break;
      }
    }
  }

  if (!tileToPlace) {
    throw new Error(`Tile ${placement.tileId} not found for scoring.`);
  }

  const representedNation: Nation =
    tileToPlace.nation === 'joker'
      ? (placement.jokerNation ?? targetSeat.allowedNations[0] ?? 'af')
      : tileToPlace.nation;

  const seatedTile: Tile =
    tileToPlace.nation === 'joker'
      ? { ...tileToPlace, jokerNation: representedNation }
      : { ...tileToPlace };

  const seatsById = new Map<string, Seat>();
  for (const seat of state.seats) {
    if (seat.id === targetSeat.id) {
      seatsById.set(seat.id, { ...seat, occupant: seatedTile });
    } else {
      seatsById.set(seat.id, seat);
    }
  }

  const tableBreakdowns: TableScoreBreakdown[] = [];
  let totalPoints = 0;
  let pureTablesCompleted = 0;

  for (const tableId of targetSeat.tableIds) {
    const table = state.tables.find((t) => t.id === tableId);
    if (!table) {
      throw new Error(`Table ${tableId} not found.`);
    }
    const breakdown = evaluateTableAfterPlacement(table, seatsById);
    tableBreakdowns.push(breakdown);
    totalPoints += breakdown.points;
    if (breakdown.completedPureTable) {
      pureTablesCompleted += 1;
    }
  }

  return {
    seatId: targetSeat.id,
    tileId: tileToPlace.id,
    representedNation,
    tableBreakdowns,
    totalPoints,
    pureTablesCompleted,
  };
}
