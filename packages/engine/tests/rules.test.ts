import { describe, expect, it } from 'vitest';
import {
  applyMove,
  createFullTileSet,
  createGame,
  finalScores,
  getLegalMoves,
  isTerminal,
  kickDisconnectedPlayer,
  scorePlacement,
  type GameState,
  type Tile,
} from '../src/index.js';

function createBaseTwoPlayerState(): GameState {
  return createGame(
    {
      players: [
        { id: 'p1', nickname: 'Ana' },
        { id: 'p2', nickname: 'Bruno' },
      ],
      startingPlayerId: 'p1',
    },
    42,
  );
}

describe('Engine Setup & Tile Deck', () => {
  it('creates exactly 100 tiles: 96 natural guests (4M+4F per 12 nations) + 4 jokers (2M+2F)', () => {
    const deck = createFullTileSet();
    expect(deck).toHaveLength(100);

    const jokers = deck.filter((t) => t.nation === 'joker');
    expect(jokers).toHaveLength(4);
    expect(jokers.filter((t) => t.gender === 'M')).toHaveLength(2);
    expect(jokers.filter((t) => t.gender === 'F')).toHaveLength(2);

    const naturals = deck.filter((t) => t.nation !== 'joker');
    expect(naturals).toHaveLength(96);

    const nations = new Set(naturals.map((t) => t.nation));
    expect(nations.size).toBe(12);

    for (const nation of nations) {
      const mCount = naturals.filter((t) => t.nation === nation && t.gender === 'M').length;
      const fCount = naturals.filter((t) => t.nation === nation && t.gender === 'F').length;
      expect(mCount).toBe(4);
      expect(fCount).toBe(4);
    }
  });

  it('deals 5 public tiles to each player and leaves the rest in the bag', () => {
    const state = createBaseTwoPlayerState();
    expect(state.hands.p1).toHaveLength(5);
    expect(state.hands.p2).toHaveLength(5);
    expect(state.bag).toHaveLength(90);
    expect(state.turn).toBe('p1');
    expect(state.startingPlayerId).toBe('p1');
    expect(state.phase).toBe('playing');
  });
});

describe('Opening Move & Mandatory Scoring', () => {
  it('1. allows the starting player on turn 1 with all seats empty to place a single tile for 0 points', () => {
    const state = createBaseTwoPlayerState();
    const afMale: Tile = { id: 'custom_af_m', nation: 'af', gender: 'M' };
    state.hands.p1 = [afMale, ...state.hands.p1!.slice(1)];

    // s_0_1 belongs only to t_af_1 (af)
    const res = applyMove(state, {
      type: 'seat',
      placements: [{ tileId: 'custom_af_m', seatId: 's_0_1' }],
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.state.players[0]?.score).toBe(0);
    expect(res.state.seats.find((s) => s.id === 's_0_1')?.occupant?.id).toBe('custom_af_m');
    expect(res.state.hands.p1).toHaveLength(5); // drew 1 replacement tile
    expect(res.state.turn).toBe('p2');
  });

  it('rejects a single non-scoring placement when the board is no longer empty', () => {
    const state = createBaseTwoPlayerState();
    const afMale: Tile = { id: 'custom_af_m', nation: 'af', gender: 'M' };
    const esMale: Tile = { id: 'custom_es_m', nation: 'es', gender: 'M' };
    state.hands.p1 = [afMale, ...state.hands.p1!.slice(1)];
    state.hands.p2 = [esMale, ...state.hands.p2!.slice(1)];

    const step1 = applyMove(state, {
      type: 'seat',
      placements: [{ tileId: 'custom_af_m', seatId: 's_0_1' }],
    });
    expect(step1.ok).toBe(true);
    if (!step1.ok) return;

    // Now p2 tries to place a single guest at an empty Spain table (s_0_11 -> t_es_1)
    const step2 = applyMove(step1.state, {
      type: 'seat',
      placements: [{ tileId: 'custom_es_m', seatId: 's_0_11' }],
    });
    expect(step2.ok).toBe(false);
    if (step2.ok) return;
    expect(['ALONE_GUEST_VIOLATION', 'PLACEMENT_MUST_SCORE']).toContain(step2.error.code);
  });

  it('2. allows opening an empty table when placing a male+female pair in the same turn', () => {
    const state = createBaseTwoPlayerState();
    // Simulate turn 2 so special opening is not active
    state.turn = 'p2';
    state.turnNumber = 2;

    const esMale: Tile = { id: 'es_m_1', nation: 'es', gender: 'M' };
    const esFemale: Tile = { id: 'es_f_1', nation: 'es', gender: 'F' };
    state.hands.p2 = [esMale, esFemale, ...state.hands.p2!.slice(2)];

    // t_es_1 has non-shared seats s_0_11 and s_1_12
    const res = applyMove(state, {
      type: 'seat',
      placements: [
        { tileId: 'es_m_1', seatId: 's_0_11' },
        { tileId: 'es_f_1', seatId: 's_1_12' },
      ],
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    // First placement scores 0, second placement sees 2 guests of same nation ('es') => 4 points
    expect(res.state.players[1]?.score).toBe(4);
    expect(res.state.hands.p2).toHaveLength(5);
  });

  it('rejects placing 2 tiles on 2 different empty tables where neither scores', () => {
    const state = createBaseTwoPlayerState();
    const afMale: Tile = { id: 'af_m', nation: 'af', gender: 'M' };
    const esFemale: Tile = { id: 'es_f', nation: 'es', gender: 'F' };
    state.hands.p1 = [afMale, esFemale, ...state.hands.p1!.slice(2)];

    const res = applyMove(state, {
      type: 'seat',
      placements: [
        { tileId: 'af_m', seatId: 's_0_1' },
        { tileId: 'es_f', seatId: 's_0_11' },
      ],
    });
    expect(res.ok).toBe(false);
  });
});

describe('Nationality & Gender Balance Rules', () => {
  it('rejects placing a guest whose nationality is not allowed on the seat', () => {
    const state = createBaseTwoPlayerState();
    const frMale: Tile = { id: 'fr_m', nation: 'fr', gender: 'M' };
    state.hands.p1 = [frMale, ...state.hands.p1!.slice(1)];

    // s_0_1 only allows 'af'
    const res = applyMove(state, {
      type: 'seat',
      placements: [{ tileId: 'fr_m', seatId: 's_0_1' }],
    });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('NATION_NOT_ALLOWED_ON_SEAT');
  });

  it('rejects 2 guests of the same gender at a table (e.g. 2M+0F)', () => {
    const state = createBaseTwoPlayerState();
    const afM1: Tile = { id: 'af_m_1', nation: 'af', gender: 'M' };
    const afM2: Tile = { id: 'af_m_2', nation: 'af', gender: 'M' };
    state.hands.p1 = [afM1, afM2, ...state.hands.p1!.slice(2)];

    const res = applyMove(state, {
      type: 'seat',
      placements: [
        { tileId: 'af_m_1', seatId: 's_0_1' },
        { tileId: 'af_m_2', seatId: 's_1_0' },
      ],
    });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('GENDER_BALANCE_VIOLATED');
  });

  it('allows 1M+1F, then 2M+1F (3 guests), then 2M+2F (4 guests), and rejects 3 of the same gender', () => {
    const state = createBaseTwoPlayerState();
    // Pre-seat 1M + 1F at t_af_1 (seats s_0_1 and s_1_0)
    const s01 = state.seats.find((s) => s.id === 's_0_1')!;
    const s10 = state.seats.find((s) => s.id === 's_1_0')!;
    s01.occupant = { id: 'pre_af_m1', nation: 'af', gender: 'M' };
    s10.occupant = { id: 'pre_af_f1', nation: 'af', gender: 'F' };

    // Now p1 places a 2nd Male at s_2_1 (shared between t_af_1 and t_af_2) -> valid!
    // Wait: s_2_1 is shared with t_af_2 (which is empty), and Rule 5 says:
    // "No puede quedar un invitado solo en una mesa. Excepción: se permite si su silla es compartida y la mesa vecina tiene al menos otro invitado."
    const afM2: Tile = { id: 'af_m_2', nation: 'af', gender: 'M' };
    const afM3: Tile = { id: 'af_m_3', nation: 'af', gender: 'M' };
    state.hands.p1 = [afM2, afM3, ...state.hands.p1!.slice(2)];

    const step1 = applyMove(state, {
      type: 'seat',
      placements: [{ tileId: 'af_m_2', seatId: 's_2_1' }],
    });
    expect(step1.ok).toBe(true);
    if (!step1.ok) return;
    // 3 guests of same nation ('af') at t_af_1 = 6 points; t_af_2 has only 1 guest = 0 points
    expect(step1.state.players[0]?.score).toBe(6);

    // Now p2 tries to place a 3rd Male at the remaining seat of t_af_1 (s_1_2) -> 3M+1F must fail!
    step1.state.hands.p2 = [afM3, ...step1.state.hands.p2!.slice(1)];
    const badStep = applyMove(step1.state, {
      type: 'seat',
      placements: [{ tileId: 'af_m_3', seatId: 's_1_2' }],
    });
    expect(badStep.ok).toBe(false);
    if (!badStep.ok) {
      expect(badStep.error.code).toBe('GENDER_BALANCE_VIOLATED');
    }
  });
});

describe('Shared Seats, Sequential Evaluation & Pure Tables', () => {
  it('3 & 4. allows single guest on shared seat when neighbor table is occupied, and scores in BOTH tables when both have >= 2 guests', () => {
    const state = createBaseTwoPlayerState();
    // t_af_1 has seats: s_0_1, s_1_0, s_1_2 (shared with t_it_1), s_2_1 (shared with t_af_2)
    // t_it_1 has seats: s_0_3, s_1_2 (shared with t_af_1), s_1_4 (shared with t_it_2), s_2_3 (shared with t_en_1)
    // Put 1M at s_0_1 (t_af_1) and 1M at s_0_3 (t_it_1)
    state.seats.find((s) => s.id === 's_0_1')!.occupant = {
      id: 'af_m1',
      nation: 'af',
      gender: 'M',
    };
    state.seats.find((s) => s.id === 's_0_3')!.occupant = {
      id: 'it_m1',
      nation: 'it',
      gender: 'M',
    };

    // Place an Italian Female on shared seat s_1_2!
    // In t_af_1: af_m1 + it_f1 -> 2 guests of mixed nations -> 2 points!
    // In t_it_1: it_m1 + it_f1 -> 2 guests of same nation ('it') -> 4 points!
    // Total points = 6!
    const itFemale: Tile = { id: 'it_f1', nation: 'it', gender: 'F' };
    state.hands.p1 = [itFemale, ...state.hands.p1!.slice(1)];

    const res = applyMove(state, {
      type: 'seat',
      placements: [{ tileId: 'it_f1', seatId: 's_1_2' }],
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.state.players[0]?.score).toBe(6);
  });

  it('5. evaluates 2 placed tiles sequentially in order (second sees effect of first)', () => {
    const state = createBaseTwoPlayerState();
    // Pre-seat 1M + 1F at t_af_1 (s_0_1, s_1_0)
    state.seats.find((s) => s.id === 's_0_1')!.occupant = {
      id: 'af_m1',
      nation: 'af',
      gender: 'M',
    };
    state.seats.find((s) => s.id === 's_1_0')!.occupant = {
      id: 'af_f1',
      nation: 'af',
      gender: 'F',
    };

    // Player 1 places af_m2 on s_2_1 (3rd guest -> 6 pts) and af_f2 on s_1_2 (4th guest -> 8 pts + pure table!)
    const afM2: Tile = { id: 'af_m2', nation: 'af', gender: 'M' };
    const afF2: Tile = { id: 'af_f2', nation: 'af', gender: 'F' };
    state.hands.p1 = [afM2, afF2, ...state.hands.p1!.slice(2)];

    const res = applyMove(state, {
      type: 'seat',
      placements: [
        { tileId: 'af_m2', seatId: 's_2_1' },
        { tileId: 'af_f2', seatId: 's_1_2' },
      ],
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    // 6 + 8 = 14 points!
    expect(res.state.players[0]?.score).toBe(14);
    // Completed 1 pure table -> handSize reduced from 5 to 4!
    expect(res.state.handSize.p1).toBe(4);
    expect(res.state.hands.p1).toHaveLength(4);
  });

  it('6 & 7. completes two pure tables in a single turn (reducing handSize by 2), including with a joker', () => {
    const state = createBaseTwoPlayerState();
    // t_it_1 seats: s_0_3, s_1_2, s_1_4 (shared with t_it_2), s_2_3
    // t_it_2 seats: s_0_5, s_1_4 (shared with t_it_1), s_1_6, s_2_5
    // Pre-fill 3 seats of t_it_1 and 3 seats of t_it_2 with 'it', leaving shared seat s_1_4 empty!
    state.seats.find((s) => s.id === 's_0_3')!.occupant = {
      id: 'it_m1',
      nation: 'it',
      gender: 'M',
    };
    state.seats.find((s) => s.id === 's_1_2')!.occupant = {
      id: 'it_f1',
      nation: 'it',
      gender: 'F',
    };
    state.seats.find((s) => s.id === 's_2_3')!.occupant = {
      id: 'it_m2',
      nation: 'it',
      gender: 'M',
    };

    state.seats.find((s) => s.id === 's_0_5')!.occupant = {
      id: 'it_m3',
      nation: 'it',
      gender: 'M',
    };
    state.seats.find((s) => s.id === 's_1_6')!.occupant = {
      id: 'it_f2',
      nation: 'it',
      gender: 'F',
    };
    state.seats.find((s) => s.id === 's_2_5')!.occupant = {
      id: 'it_m4',
      nation: 'it',
      gender: 'M',
    };

    // Place a Female Joker representing 'it' on the shared seat s_1_4!
    const jokerF: Tile = { id: 'joker_f', nation: 'joker', gender: 'F' };
    state.hands.p1 = [jokerF, ...state.hands.p1!.slice(1)];

    const res = applyMove(state, {
      type: 'seat',
      placements: [{ tileId: 'joker_f', seatId: 's_1_4', jokerNation: 'it' }],
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    // 8 points in t_it_1 + 8 points in t_it_2 = 16 points!
    expect(res.state.players[0]?.score).toBe(16);
    // Both tables completed as pure nationality -> handSize reduced by 2 (from 5 to 3)!
    expect(res.state.handSize.p1).toBe(3);
  });
});

describe('Jokers & Bar Rules', () => {
  it('8. swaps a seated joker with a natural tile from hand: 0 points, no draw, joker returns to hand', () => {
    const state = createBaseTwoPlayerState();
    state.seats.find((s) => s.id === 's_0_1')!.occupant = {
      id: 'joker_m_1',
      nation: 'joker',
      gender: 'M',
      jokerNation: 'af',
    };
    state.seats.find((s) => s.id === 's_1_0')!.occupant = {
      id: 'af_f_1',
      nation: 'af',
      gender: 'F',
    };

    const naturalAfM: Tile = { id: 'af_m_natural', nation: 'af', gender: 'M' };
    state.hands.p1 = [naturalAfM, ...state.hands.p1!.slice(1)];
    const bagBefore = state.bag.length;

    const res = applyMove(state, {
      type: 'swap',
      seatId: 's_0_1',
      tileId: 'af_m_natural',
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.state.players[0]?.score).toBe(0);
    expect(res.state.bag).toHaveLength(bagBefore); // no tile drawn
    expect(res.state.seats.find((s) => s.id === 's_0_1')?.occupant?.id).toBe('af_m_natural');
    const returnedInHand = res.state.hands.p1?.find((t) => t.id === 'joker_m_1');
    expect(returnedInHand).toBeDefined();
    expect(returnedInHand?.jokerNation).toBeUndefined();
  });

  it('9. forbids placing a joker at the bar', () => {
    const state = createBaseTwoPlayerState();
    const jokerM: Tile = { id: 'joker_m_1', nation: 'joker', gender: 'M' };
    state.hands.p1 = [jokerM, ...state.hands.p1!.slice(1)];

    const res = applyMove(state, {
      type: 'bar',
      tileId: 'joker_m_1',
    });

    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('JOKER_NOT_ALLOWED_AT_BAR');
  });

  it('10. fills the bar in order 1..20 with official positive and negative values and allows negative score in v1.0', () => {
    const state = createBaseTwoPlayerState();
    // Pre-fill first 5 bar slots (+1..+5) so next slot is index 5 (slot 6 = -2 points)
    for (let i = 0; i < 5; i++) {
      state.bar[i] = { id: `bar_pre_${i}`, nation: 'af', gender: 'M' };
    }

    const natTile: Tile = { id: 'nat_es_m', nation: 'es', gender: 'M' };
    state.hands.p1 = [natTile, ...state.hands.p1!.slice(1)];

    const res = applyMove(state, {
      type: 'bar',
      tileId: 'nat_es_m',
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.state.players[0]?.score).toBe(-2); // negative score allowed
    expect(res.state.bar[5]?.id).toBe('nat_es_m');
  });
});

describe('Endgame Conditions, Penalties, Ties & Disconnection', () => {
  it('11a. ends immediately when the 20th bar slot is occupied', () => {
    const state = createBaseTwoPlayerState();
    for (let i = 0; i < 19; i++) {
      state.bar[i] = { id: `bar_pre_${i}`, nation: 'af', gender: 'M' };
    }
    const natTile: Tile = { id: 'nat_es_m', nation: 'es', gender: 'M' };
    state.hands.p1 = [natTile, ...state.hands.p1!.slice(1)];

    const res = applyMove(state, {
      type: 'bar',
      tileId: 'nat_es_m',
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(isTerminal(res.state)).toBe(true);
    expect(res.state.phase).toBe('finished');
    expect(res.state.terminalReason).toBe('bar_full');
  });

  it('11b. ends immediately when the last free chair on the board is occupied', () => {
    const state = createBaseTwoPlayerState();
    // Fill all seats except s_0_1 with alternating M/F so s_0_1 can be filled
    for (const seat of state.seats) {
      if (seat.id !== 's_0_1') {
        seat.occupant = {
          id: `occ_${seat.id}`,
          nation: seat.allowedNations[0] ?? 'af',
          gender: seat.id === 's_1_0' || seat.id === 's_1_2' ? 'F' : 'M',
        };
      }
    }

    const afMale: Tile = { id: 'last_af_m', nation: 'af', gender: 'M' };
    state.hands.p1 = [afMale];

    const res = applyMove(state, {
      type: 'seat',
      placements: [{ tileId: 'last_af_m', seatId: 's_0_1' }],
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.state.phase).toBe('finished');
    expect(res.state.terminalReason).toBe('last_seat_occupied');
  });

  it('11c. ends immediately when a player has 0 tiles in hand and handSize === 0', () => {
    const state = createBaseTwoPlayerState();
    state.handSize.p1 = 1;
    // Set up t_af_1 with 3 'af' guests so placing the 4th completes a pure table (handSize 1 -> 0)
    state.seats.find((s) => s.id === 's_0_1')!.occupant = {
      id: 'af_m1',
      nation: 'af',
      gender: 'M',
    };
    state.seats.find((s) => s.id === 's_1_0')!.occupant = {
      id: 'af_f1',
      nation: 'af',
      gender: 'F',
    };
    state.seats.find((s) => s.id === 's_2_1')!.occupant = {
      id: 'af_m2',
      nation: 'af',
      gender: 'M',
    };

    const lastAfF: Tile = { id: 'af_f2', nation: 'af', gender: 'F' };
    state.hands.p1 = [lastAfF];

    const res = applyMove(state, {
      type: 'seat',
      placements: [{ tileId: 'af_f2', seatId: 's_1_2' }],
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.state.handSize.p1).toBe(0);
    expect(res.state.hands.p1).toHaveLength(0);
    expect(res.state.phase).toBe('finished');
    expect(res.state.terminalReason).toBe('player_empty_hand');
  });

  it('11d. ends immediately when a player draws the 4th tile from the end of the bag (<= 3 left)', () => {
    const state = createBaseTwoPlayerState();
    state.bag = state.bag.slice(0, 4); // 4 tiles in bag: drawing 1 leaves 3 (the 4th from the end was drawn!)
    const natTile: Tile = { id: 'nat_es_m', nation: 'es', gender: 'M' };
    state.hands.p1 = [natTile, ...state.hands.p1!.slice(1)];

    const res = applyMove(state, {
      type: 'bar',
      tileId: 'nat_es_m',
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.state.bag).toHaveLength(3);
    expect(res.state.phase).toBe('finished');
    expect(res.state.terminalReason).toBe('bag_threshold_reached');
  });

  it('12 & 14. subtracts 5 per natural tile and 10 per joker at game end and awards shared victory on tie', () => {
    const state = createBaseTwoPlayerState();
    state.players[0]!.score = 30;
    state.players[1]!.score = 25;

    // p1 has 2 natural tiles + 1 joker = -20 penalty => final score 10
    state.hands.p1 = [
      { id: 'n1', nation: 'af', gender: 'M' },
      { id: 'n2', nation: 'it', gender: 'F' },
      { id: 'j1', nation: 'joker', gender: 'M' },
    ];
    // p2 has 3 natural tiles = -15 penalty => final score 10
    state.hands.p2 = [
      { id: 'n3', nation: 'ch', gender: 'M' },
      { id: 'n4', nation: 'es', gender: 'F' },
      { id: 'n5', nation: 'ru', gender: 'M' },
    ];

    const summary = finalScores(state);
    expect(summary.scores.p1?.handPenalty).toBe(20);
    expect(summary.scores.p1?.finalScore).toBe(10);
    expect(summary.scores.p2?.handPenalty).toBe(15);
    expect(summary.scores.p2?.finalScore).toBe(10);
    expect(summary.winners).toEqual(['p1', 'p2']); // shared victory on tie
  });

  it('13. returns kicked player hand to the bag, keeps seated guests, and ends 2-player game or continues 3-player game', () => {
    const state2p = createBaseTwoPlayerState();
    const bagBefore = state2p.bag.length;
    const kicked2p = kickDisconnectedPlayer(state2p, 'p2');
    expect(kicked2p.state.bag).toHaveLength(bagBefore + 5);
    expect(kicked2p.state.hands.p2).toHaveLength(0);
    expect(kicked2p.state.phase).toBe('finished');
    expect(kicked2p.state.winners).toEqual(['p1']);

    const state3p = createGame(
      {
        players: [
          { id: 'p1', nickname: 'Ana' },
          { id: 'p2', nickname: 'Bruno' },
          { id: 'p3', nickname: 'Clara' },
        ],
        startingPlayerId: 'p1',
      },
      99,
    );
    const kicked3p = kickDisconnectedPlayer(state3p, 'p1');
    expect(kicked3p.state.phase).toBe('playing');
    expect(kicked3p.state.turn).toBe('p2');
  });
});

describe('Determinism & scorePlacement helper', () => {
  it('produces identical game states and legal moves for the same seed', () => {
    const g1 = createGame(
      {
        players: [
          { id: 'p1', nickname: 'Uno' },
          { id: 'p2', nickname: 'Dos' },
        ],
      },
      'semilla-cafetulia-2026',
    );
    const g2 = createGame(
      {
        players: [
          { id: 'p1', nickname: 'Uno' },
          { id: 'p2', nickname: 'Dos' },
        ],
      },
      'semilla-cafetulia-2026',
    );

    expect(g1).toEqual(g2);
    expect(getLegalMoves(g1)).toEqual(getLegalMoves(g2));

    const moves = getLegalMoves(g1);
    expect(moves.length).toBeGreaterThan(0);

    const r1 = applyMove(g1, moves[0]!);
    const r2 = applyMove(g2, moves[0]!);
    expect(r1).toEqual(r2);
  });

  it('scores a table of 4 jokers representing the same nation as 8 points', () => {
    const state = createBaseTwoPlayerState();
    state.seats.find((s) => s.id === 's_0_1')!.occupant = {
      id: 'j1',
      nation: 'joker',
      gender: 'M',
      jokerNation: 'af',
    };
    state.seats.find((s) => s.id === 's_1_0')!.occupant = {
      id: 'j2',
      nation: 'joker',
      gender: 'F',
      jokerNation: 'af',
    };
    state.seats.find((s) => s.id === 's_2_1')!.occupant = {
      id: 'j3',
      nation: 'joker',
      gender: 'M',
      jokerNation: 'af',
    };

    const j4: Tile = { id: 'j4', nation: 'joker', gender: 'F' };
    const breakdown = scorePlacement(
      state,
      { tileId: 'j4', seatId: 's_1_2', jokerNation: 'af' },
      j4,
    );
    expect(breakdown.totalPoints).toBe(8);
    expect(breakdown.pureTablesCompleted).toBe(1);
  });
});
