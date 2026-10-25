import { describe, expect, it } from 'vitest';
import { createGame } from '@cafetulia/engine';
import {
  CHARACTER_ROSTER,
  COIN_DENOMINATION_STYLES,
  decomposeCoins,
  getCharacterProfile,
  PRESET_AVATARS,
} from '@cafetulia/ui';
import {
  evaluateDraftPlacements,
  getNationName,
  inspectSeatsForSelectedTile,
} from './moveHelper';

describe('moveHelper & UI v3 specifications', () => {
  it('returns Spanish nation names', () => {
    expect(getNationName('fr')).toBe('Francia');
    expect(getNationName('es')).toBe('España');
    expect(getNationName('joker')).toBe('Comodín');
  });

  it('defines 24 named national characters + 2 jokers with MUJER/HOMBRE badges and short quotes', () => {
    const entries = Object.values(CHARACTER_ROSTER);
    expect(entries.length).toBe(26);
    for (const c of entries) {
      expect(['MUJER', 'HOMBRE']).toContain(c.genderBadge);
      expect(c.quote.length).toBeLessThanOrEqual(48);
    }
    expect(getCharacterProfile('fr', 'F').name).toBe('Colette');
    expect(getCharacterProfile('fr', 'F').genderBadge).toBe('MUJER');
    expect(getCharacterProfile('it', 'M').name).toBe('Giuseppe');
    expect(getCharacterProfile('it', 'M').genderBadge).toBe('HOMBRE');
    expect(getCharacterProfile('ch', 'F').name).toBe('Mei');
    expect(getCharacterProfile('cu', 'F').name).toBe('Rosa');
    expect(getCharacterProfile('joker', 'F', 'fr').countryName).toBe('Comodín (Francia)');
  });

  it('defines 16 pre-made selectable avatars without photo uploads', () => {
    expect(PRESET_AVATARS.length).toBe(16);
    expect(PRESET_AVATARS.some((a) => a.id === 'espresso')).toBe(true);
    expect(PRESET_AVATARS.some((a) => a.id === 'gato')).toBe(true);
  });

  it('uses official coin colors: 1 black (#1F1F1F), 5 red (#B3261E), 10 blue (#1E4E8C)', () => {
    expect(COIN_DENOMINATION_STYLES[1].fill).toBe('#1F1F1F');
    expect(COIN_DENOMINATION_STYLES[5].fill).toBe('#B3261E');
    expect(COIN_DENOMINATION_STYLES[10].fill).toBe('#1E4E8C');
    expect(COIN_DENOMINATION_STYLES[1].text).toBe('#FFF9F0');
    expect(COIN_DENOMINATION_STYLES[5].text).toBe('#FFF9F0');
    expect(COIN_DENOMINATION_STYLES[10].text).toBe('#FFF9F0');
  });

  it('decomposes exact coin balances (0 coins at 0, 8 tens at 80, exact stacks)', () => {
    const b0 = decomposeCoins(0);
    expect(b0.tens).toBe(0);
    expect(b0.fives).toBe(0);
    expect(b0.ones).toBe(0);
    expect(b0.chips.length).toBe(0);
    expect(b0.stacks.length).toBe(0);

    const b80 = decomposeCoins(80);
    expect(b80.tens).toBe(8);
    expect(b80.fives).toBe(0);
    expect(b80.ones).toBe(0);
    expect(b80.chips.length).toBe(8);
    expect(b80.stacks).toEqual([{ denomination: 10, count: 8 }]);

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
          { id: 'p1', nickname: 'Ana', avatarId: 'colette' },
          { id: 'p2', nickname: 'Bruno', avatarId: 'giuseppe' },
        ],
      },
      12345,
    );
    expect(game.players[0]?.avatarId).toBe('colette');
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
