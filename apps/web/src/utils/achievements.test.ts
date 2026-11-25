import { describe, expect, it } from 'vitest';
import { createGame, type GameState, type MoveEvent } from '@cafetulia/engine';
import { computeMatchAchievements } from './achievements';

function finishedGame(seed = 42): GameState {
  const base = createGame(
    {
      players: [
        { id: 'ana', nickname: 'Ana' },
        { id: 'bruno', nickname: 'Bruno' },
      ],
      startingPlayerId: 'ana',
    },
    seed,
  );

  const events: MoveEvent[] = [
    {
      type: 'tile_seated',
      playerId: 'ana',
      tile: { id: 'fr-m-1', nation: 'fr', gender: 'M' },
      seatId: 's_8_3',
      pointsEarned: 6,
      tableBreakdowns: [
        {
          tableId: 't_fr_1',
          occupantCount: 2,
          unanimousNation: true,
          points: 6,
          completedPureTable: true,
        },
        {
          tableId: 't_tu_1',
          occupantCount: 2,
          unanimousNation: false,
          points: 3,
          completedPureTable: false,
        },
      ],
      pureTablesCompleted: 1,
      isOpeningFreeMove: false,
    },
    {
      type: 'tile_bar',
      playerId: 'bruno',
      tile: { id: 'en-f-1', nation: 'en', gender: 'F' },
      barIndex: 0,
      pointsDelta: 1,
    },
    {
      type: 'joker_swapped',
      playerId: 'ana',
      seatId: 's_9_4',
      naturalTile: { id: 'fr-f-1', nation: 'fr', gender: 'F' },
      jokerTile: { id: 'joker-f-1', nation: 'joker', gender: 'F' },
    },
  ];

  return {
    ...base,
    players: base.players.map((player, index) => ({
      ...player,
      score: index === 0 ? 20 : 10,
    })),
    phase: 'finished',
    terminalReason: 'last_seat_occupied',
    log: events,
  };
}

describe('computeMatchAchievements', () => {
  it('returns at most four seals, all assigned to real players', () => {
    const game = finishedGame(42);
    const achievements = computeMatchAchievements(game);

    expect(achievements.length).toBeGreaterThan(0);
    expect(achievements.length).toBeLessThanOrEqual(4);
    for (const achievement of achievements) {
      expect(['ana', 'bruno']).toContain(achievement.playerId);
      expect(achievement.title.length).toBeGreaterThan(0);
      expect(achievement.description.length).toBeGreaterThan(0);
    }
  });

  it('is stable for the same finished match (no flicker between renders)', () => {
    const game = finishedGame(7);
    const first = computeMatchAchievements(game).map((a) => `${a.id}:${a.playerId}`);
    const second = computeMatchAchievements(game).map((a) => `${a.id}:${a.playerId}`);
    expect(second).toEqual(first);
  });

  it('still returns the closing seals when the log is empty', () => {
    const game = { ...finishedGame(1), log: [] };
    const achievements = computeMatchAchievements(game);
    expect(achievements.length).toBeGreaterThanOrEqual(1);
    expect(achievements.every((a) => a.playerId === 'ana' || a.playerId === 'bruno')).toBe(true);
  });
});
