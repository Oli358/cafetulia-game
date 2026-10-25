import { describe, expect, it } from 'vitest';
import { createGame } from '@cafetulia/engine';
import { CHARACTER_ROSTER, decomposeCoins, getCharacterProfile } from '@cafetulia/ui';
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

  it('defines 24 named national characters + 2 jokers with personality quotes', () => {
    expect(Object.keys(CHARACTER_ROSTER).length).toBe(26);
    expect(getCharacterProfile('fr', 'F').name).toBe('Colette');
    expect(getCharacterProfile('fr', 'F').quote).toContain('croissant');
    expect(getCharacterProfile('it', 'M').name).toBe('Giuseppe');
    expect(getCharacterProfile('ch', 'F').name).toBe('Mei');
    expect(getCharacterProfile('cu', 'F').name).toBe('Rosa');
    expect(getCharacterProfile('joker', 'F', 'fr').countryName).toBe('Comodín (Francia)');
  });

  it('decomposes scores into 10, 5, and 1 coin denominations', () => {
    const b17 = decomposeCoins(17);
    expect(b17.tens).toBe(1);
    expect(b17.fives).toBe(1);
    expect(b17.ones).toBe(2);
    expect(b17.isNegative).toBe(false);

    const neg8 = decomposeCoins(-8);
    expect(neg8.tens).toBe(0);
    expect(neg8.fives).toBe(1);
    expect(neg8.ones).toBe(3);
    expect(neg8.isNegative).toBe(true);
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

