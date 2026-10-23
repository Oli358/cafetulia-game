import { describe, expect, it } from 'vitest';
import { boardData, validateBoardData } from '../src/index.js';

describe('packages/content/board.json invariants', () => {
  it('has 12 nations in exact clockwise order from top-left', () => {
    expect(boardData.nations).toHaveLength(12);
    expect(boardData.nations.map((n) => n.code)).toEqual([
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
    ]);
  });

  it('has exactly 24 tables (2 per nation)', () => {
    expect(boardData.tables).toHaveLength(24);
    for (const nation of boardData.nations) {
      const tablesForNation = boardData.tables.filter((t) => t.nation === nation.code);
      expect(tablesForNation).toHaveLength(2);
    }
  });

  it('has exactly 68 unique seats', () => {
    expect(boardData.seats).toHaveLength(68);
    const uniqueIds = new Set(boardData.seats.map((s) => s.id));
    expect(uniqueIds.size).toBe(68);
    const uniqueCoords = new Set(boardData.seats.map((s) => `${s.row},${s.col}`));
    expect(uniqueCoords.size).toBe(68);
  });

  it('has exactly 28 shared seats', () => {
    const sharedSeats = boardData.seats.filter((s) => s.shared);
    expect(sharedSeats).toHaveLength(28);
  });

  it('has exactly 20 bar slots with official classical values', () => {
    expect(boardData.bar).toHaveLength(20);
    expect(boardData.bar.map((b) => b.index)).toEqual(
      Array.from({ length: 20 }, (_, idx) => idx + 1),
    );
    expect(boardData.bar.map((b) => b.value)).toEqual([
      1, 2, 3, 4, 5, -2, -4, -6, -8, -10, -4, -6, -8, -10, -12, -6, -8, -10, -12, -14,
    ]);
  });

  it('assigns exactly 4 seats to each table', () => {
    for (const table of boardData.tables) {
      const seatsForTable = boardData.seats.filter((s) => s.tableIds.includes(table.id));
      expect(seatsForTable).toHaveLength(4);
    }
  });

  it('ensures every shared seat belongs to exactly 2 tables and non-shared to 1 table', () => {
    for (const seat of boardData.seats) {
      if (seat.shared) {
        expect(seat.tableIds).toHaveLength(2);
      } else {
        expect(seat.tableIds).toHaveLength(1);
      }
    }
  });

  it('passes full validateBoardData helper without errors', () => {
    const result = validateBoardData(boardData);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.stats).toEqual({
      nationCount: 12,
      tableCount: 24,
      uniqueSeatCount: 68,
      sharedSeatCount: 28,
      barSlotCount: 20,
    });
  });
});
