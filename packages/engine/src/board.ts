import { boardData, type BoardData, type NationCode } from '@cafetulia/content';
import type { Seat, Table } from './types.js';

export type BoardValidationResult = {
  valid: boolean;
  errors: string[];
  stats: {
    nationCount: number;
    tableCount: number;
    uniqueSeatCount: number;
    sharedSeatCount: number;
    barSlotCount: number;
  };
};

export const OFFICIAL_NATION_ORDER: readonly NationCode[] = [
  'af',
  'it',
  'ch',
  'es',
  'ru',
  'in',
  'am',
  'al',
  'tu',
  'cu',
  'en',
  'fr',
] as const;

export const OFFICIAL_BAR_VALUES: readonly number[] = [
  1, 2, 3, 4, 5, -2, -4, -6, -8, -10, -4, -6, -8, -10, -12, -6, -8, -10, -12, -14,
] as const;

/**
 * Validates that a BoardData structure strictly satisfies all official
 * Café International / Cafetulia board invariants.
 */
export function validateBoardData(data: BoardData = boardData): BoardValidationResult {
  const errors: string[] = [];

  if (data.nations.length !== 12) {
    errors.push(`Expected 12 nations, found ${data.nations.length}`);
  }

  const actualOrder = data.nations.map((n) => n.code);
  if (actualOrder.join(',') !== OFFICIAL_NATION_ORDER.join(',')) {
    errors.push(
      `Expected nation order ${OFFICIAL_NATION_ORDER.join(',')}, found ${actualOrder.join(',')}`,
    );
  }

  if (data.tables.length !== 24) {
    errors.push(`Expected 24 tables, found ${data.tables.length}`);
  }

  for (const nation of data.nations) {
    const nationTables = data.tables.filter((t) => t.nation === nation.code);
    if (nationTables.length !== 2) {
      errors.push(`Expected 2 tables for nation ${nation.code}, found ${nationTables.length}`);
    }
  }

  const uniqueSeatIds = new Set(data.seats.map((s) => s.id));
  if (data.seats.length !== 68 || uniqueSeatIds.size !== 68) {
    errors.push(
      `Expected 68 unique seats, found ${data.seats.length} (unique IDs: ${uniqueSeatIds.size})`,
    );
  }

  const sharedSeats = data.seats.filter((s) => s.shared || s.tableIds.length > 1);
  if (sharedSeats.length !== 28) {
    errors.push(`Expected 28 shared seats, found ${sharedSeats.length}`);
  }

  for (const seat of data.seats) {
    if (seat.shared) {
      if (seat.tableIds.length !== 2) {
        errors.push(
          `Shared seat ${seat.id} belongs to ${seat.tableIds.length} tables instead of 2`,
        );
      }
    } else {
      if (seat.tableIds.length !== 1) {
        errors.push(
          `Non-shared seat ${seat.id} belongs to ${seat.tableIds.length} tables instead of 1`,
        );
      }
    }
  }

  for (const table of data.tables) {
    const tableSeats = data.seats.filter((s) => s.tableIds.includes(table.id));
    if (tableSeats.length !== 4) {
      errors.push(`Table ${table.id} has ${tableSeats.length} seats instead of 4`);
    }
  }

  if (data.bar.length !== 20) {
    errors.push(`Expected 20 bar slots, found ${data.bar.length}`);
  }

  const actualBarValues = data.bar.map((b) => b.value);
  if (actualBarValues.join(',') !== OFFICIAL_BAR_VALUES.join(',')) {
    errors.push(
      `Bar values mismatch: expected [${OFFICIAL_BAR_VALUES.join(',')}], found [${actualBarValues.join(',')}]`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      nationCount: data.nations.length,
      tableCount: data.tables.length,
      uniqueSeatCount: uniqueSeatIds.size,
      sharedSeatCount: sharedSeats.length,
      barSlotCount: data.bar.length,
    },
  };
}

/**
 * Creates fresh, unoccupied tables, seats, and bar arrays from board.json.
 */
export function createInitialBoard(data: BoardData = boardData): {
  tables: Table[];
  seats: Seat[];
  bar: (null)[];
  barValues: number[];
} {
  const seats: Seat[] = data.seats.map((s) => ({
    id: s.id,
    row: s.row,
    col: s.col,
    tableIds: [...s.tableIds],
    allowedNations: [...s.allowedNations],
    shared: s.shared,
    occupant: null,
  }));

  const tables: Table[] = data.tables.map((t) => ({
    id: t.id,
    nation: t.nation,
    row: t.row,
    col: t.col,
    seatIds: seats.filter((s) => s.tableIds.includes(t.id)).map((s) => s.id),
  }));

  const barValues = data.bar.map((b) => b.value);
  const bar = data.bar.map(() => null);

  return { tables, seats, bar, barValues };
}

export { boardData, type BoardData };
