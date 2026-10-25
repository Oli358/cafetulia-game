import { describe, expect, it } from 'vitest';
import { createGame } from '@cafetulia/engine';
import {
  evaluateDraftPlacements,
  getNationName,
  inspectSeatsForSelectedTile,
} from './moveHelper';

describe('moveHelper client assistance', () => {
  it('returns Spanish nation names', () => {
    expect(getNationName('fr')).toBe('Francia');
    expect(getNationName('es')).toBe('España');
    expect(getNationName('joker')).toBe('Comodín');
  });

  it('identifies legal opening seats on turn 1 when all seats are empty', () => {
    const game = createGame(
      {
        players: [
          { id: 'p1', nickname: 'Ana' },
          { id: 'p2', nickname: 'Bruno' },
        ],
      },
      12345,
    );
    const activePlayer = game.turn;
    const hand = game.hands[activePlayer] ?? [];
    const firstTile = hand[0]!;
    const inspected = inspectSeatsForSelectedTile(game, firstTile, []);
    const legalSeats = Object.values(inspected).filter(
      (s) => s.status === 'legal_complete' || s.status === 'legal_needs_pair',
    );
    expect(legalSeats.length).toBeGreaterThan(0);

    const sampleEval = evaluateDraftPlacements(game, [
      {
        tileId: firstTile.id,
        seatId: legalSeats[0]!.seatId,
        jokerNation:
          firstTile.nation === 'joker'
            ? legalSeats[0]!.validJokerNations[0]
            : undefined,
      },
    ]);
    expect(sampleEval.isValidCompleteMove).toBe(true);
  });
});
