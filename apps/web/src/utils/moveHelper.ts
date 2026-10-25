import {
  scorePlacement,
  validateMove,
  type GameState,
  type Move,
  type Nation,
  type Placement,
  type Seat,
  type Tile,
} from '@cafetulia/engine';
import { NATION_VISUALS, type NationKey } from '@cafetulia/ui';

export type SeatInspectResult = {
  seatId: string;
  status: 'legal_complete' | 'legal_needs_pair' | 'selected' | 'illegal';
  pointsDelta: number;
  previewText: string;
  whyCannotText: string;
  validJokerNations: Nation[];
};

export function getNationName(code: string): string {
  if (code === 'joker') return 'Comodín';
  const meta = NATION_VISUALS[code as NationKey];
  return meta ? meta.name : code.toUpperCase();
}

export function evaluateDraftPlacements(
  state: GameState,
  placements: Placement[],
): {
  isValidCompleteMove: boolean;
  totalPoints: number;
  pureTablesCount: number;
  summaryText: string;
  errorReason: string | null;
} {
  const first = placements[0];
  if (!first) {
    return {
      isValidCompleteMove: false,
      totalPoints: 0,
      pureTablesCount: 0,
      summaryText: 'Selecciona una ficha de tu mano y toca una silla libre.',
      errorReason: null,
    };
  }

  const second = placements[1];
  const tuplePlacements: [Placement] | [Placement, Placement] = second
    ? [first, second]
    : [first];

  const candidateMove: Move = {
    type: 'seat',
    placements: tuplePlacements,
  };

  const validationError = validateMove(state, candidateMove);
  const hand = state.hands[state.turn] ?? [];
  const workingSeats = state.seats.map((s) => ({
    ...s,
    occupant: s.occupant ? { ...s.occupant } : null,
  }));

  let totalPoints = 0;
  let pureTablesCount = 0;
  const parts: string[] = [];

  for (const p of tuplePlacements) {
    const tile = hand.find((t) => t.id === p.tileId);
    const seat = workingSeats.find((s) => s.id === p.seatId);
    if (!tile || !seat) continue;

    const effNation: Nation =
      tile.nation === 'joker'
        ? (p.jokerNation ?? seat.allowedNations[0] ?? 'fr')
        : tile.nation;

    const breakdown = scorePlacement(
      { tables: state.tables, seats: workingSeats },
      { ...p, jokerNation: effNation },
      tile,
    );

    totalPoints += breakdown.totalPoints;
    pureTablesCount += breakdown.pureTablesCompleted;

    for (const tb of breakdown.tableBreakdowns) {
      const tableObj = state.tables.find((t) => t.id === tb.tableId);
      const countryName = tableObj ? getNationName(tableObj.nation) : tb.tableId;
      if (tb.points > 0) {
        parts.push(
          `Mesa ${countryName}: ${tb.occupantCount}º invitado ${tb.unanimousNation ? '(pura) ' : ''}+${tb.points}`,
        );
      }
    }

    seat.occupant =
      tile.nation === 'joker' ? { ...tile, jokerNation: effNation } : { ...tile };
  }

  if (validationError === null) {
    const summaryText =
      parts.length > 0
        ? `${parts.join(' · ')} = +${totalPoints} pts${
            pureTablesCount > 0 ? ' · ¡Mesa nacional completa! (-1 carta en mano)' : ''
          }`
        : 'Jugada de apertura válida (0 pts en el primer turno con cafetería vacía).';
    return {
      isValidCompleteMove: true,
      totalPoints,
      pureTablesCount,
      summaryText,
      errorReason: null,
    };
  }

  return {
    isValidCompleteMove: false,
    totalPoints,
    pureTablesCount,
    summaryText: validationError.message,
    errorReason: validationError.message,
  };
}

/**
 * Inspects every seat on the board for a currently selected hand tile (and optional first draft placement),
 * returning whether the seat is legal immediately, legal as the first step of a 2-tile pair, or why it is illegal.
 */
export function inspectSeatsForSelectedTile(
  state: GameState,
  selectedTile: Tile | null,
  existingDraft: Placement[],
  preferredJokerNation?: Nation,
): Record<string, SeatInspectResult> {
  const result: Record<string, SeatInspectResult> = {};
  const hand = state.hands[state.turn] ?? [];

  for (const seat of state.seats) {
    const alreadyInDraft = existingDraft.some((d) => d.seatId === seat.id);
    if (alreadyInDraft) {
      result[seat.id] = {
        seatId: seat.id,
        status: 'selected',
        pointsDelta: 0,
        previewText: 'Silla seleccionada en el borrador actual.',
        whyCannotText: '',
        validJokerNations: seat.allowedNations,
      };
      continue;
    }

    if (seat.occupant !== null) {
      result[seat.id] = {
        seatId: seat.id,
        status: 'illegal',
        pointsDelta: 0,
        previewText: '',
        whyCannotText: 'Esta silla ya está ocupada por otro invitado.',
        validJokerNations: [],
      };
      continue;
    }

    if (!selectedTile) {
      result[seat.id] = {
        seatId: seat.id,
        status: 'illegal',
        pointsDelta: 0,
        previewText: '',
        whyCannotText: 'Selecciona primero una carta de tu mano.',
        validJokerNations: seat.allowedNations,
      };
      continue;
    }

    if (existingDraft.length >= 2) {
      result[seat.id] = {
        seatId: seat.id,
        status: 'illegal',
        pointsDelta: 0,
        previewText: '',
        whyCannotText: 'Solo puedes sentar un máximo de 2 invitados por turno.',
        validJokerNations: [],
      };
      continue;
    }

    // Check nationality compatibility first
    if (
      selectedTile.nation !== 'joker' &&
      !seat.allowedNations.includes(selectedTile.nation)
    ) {
      const allowedNames = seat.allowedNations.map((n) => getNationName(n)).join(' o ');
      result[seat.id] = {
        seatId: seat.id,
        status: 'illegal',
        pointsDelta: 0,
        previewText: '',
        whyCannotText: `Nacionalidad incompatible: tu invitado es de ${getNationName(
          selectedTile.nation,
        )}, pero esta silla solo admite ${allowedNames}.`,
        validJokerNations: [],
      };
      continue;
    }

    const candidateNations: Nation[] =
      selectedTile.nation === 'joker'
        ? preferredJokerNation && seat.allowedNations.includes(preferredJokerNation)
          ? [preferredJokerNation, ...seat.allowedNations.filter((n) => n !== preferredJokerNation)]
          : seat.allowedNations
        : [selectedTile.nation];

    let foundComplete = false;
    let bestPoints = 0;
    let bestPreview = '';
    const validNations: Nation[] = [];
    let firstFailureMessage = 'Jugada no permitida en esta silla.';

    for (const nat of candidateNations) {
      const placement: Placement =
        selectedTile.nation === 'joker'
          ? { tileId: selectedTile.id, seatId: seat.id, jokerNation: nat }
          : { tileId: selectedTile.id, seatId: seat.id };

      const candidatePlacements = [...existingDraft, placement];
      const evalRes = evaluateDraftPlacements(state, candidatePlacements);

      if (evalRes.isValidCompleteMove) {
        validNations.push(nat);
        if (!foundComplete || evalRes.totalPoints > bestPoints) {
          foundComplete = true;
          bestPoints = evalRes.totalPoints;
          bestPreview = evalRes.summaryText;
        }
      } else if (evalRes.errorReason) {
        firstFailureMessage = evalRes.errorReason;
      }
    }

    if (foundComplete) {
      result[seat.id] = {
        seatId: seat.id,
        status: 'legal_complete',
        pointsDelta: bestPoints,
        previewText: bestPreview,
        whyCannotText: '',
        validJokerNations: validNations,
      };
      continue;
    }

    // If existingDraft is empty, check if this seat can be the FIRST placement of a valid 2-tile move!
    if (existingDraft.length === 0) {
      const remainingTiles = hand.filter((t) => t.id !== selectedTile.id);
      let canPair = false;
      let pairPreview = '';

      for (const nat of candidateNations) {
        const firstPlacement: Placement =
          selectedTile.nation === 'joker'
            ? { tileId: selectedTile.id, seatId: seat.id, jokerNation: nat }
            : { tileId: selectedTile.id, seatId: seat.id };

        const candidateSecondSeats = state.seats.filter(
          (s) =>
            s.occupant === null &&
            s.id !== seat.id &&
            s.tableIds.some((tid) => seat.tableIds.includes(tid)),
        );

        for (const secondTile of remainingTiles) {
          for (const secondSeat of candidateSecondSeats) {
            if (
              secondTile.nation !== 'joker' &&
              !secondSeat.allowedNations.includes(secondTile.nation)
            ) {
              continue;
            }
            const secondNat =
              secondTile.nation === 'joker'
                ? (secondSeat.allowedNations[0] ?? 'fr')
                : secondTile.nation;
            const secondPlacement: Placement =
              secondTile.nation === 'joker'
                ? { tileId: secondTile.id, seatId: secondSeat.id, jokerNation: secondNat }
                : { tileId: secondTile.id, seatId: secondSeat.id };

            const checkPair = validateMove(state, {
              type: 'seat',
              placements: [firstPlacement, secondPlacement],
            });
            if (checkPair === null) {
              canPair = true;
              if (!validNations.includes(nat)) validNations.push(nat);
              pairPreview =
                '1ª ficha de pareja: coloca a continuación su acompañante en la misma mesa.';
              break;
            }
          }
          if (canPair) break;
        }
      }

      if (canPair) {
        result[seat.id] = {
          seatId: seat.id,
          status: 'legal_needs_pair',
          pointsDelta: 2,
          previewText: pairPreview,
          whyCannotText: '',
          validJokerNations: validNations,
        };
        continue;
      }
    }

    result[seat.id] = {
      seatId: seat.id,
      status: 'illegal',
      pointsDelta: 0,
      previewText: '',
      whyCannotText: explainSeatRejection(state, seat, selectedTile, firstFailureMessage),
      validJokerNations: [],
    };
  }

  return result;
}

function explainSeatRejection(
  state: GameState,
  seat: Seat,
  tile: Tile,
  fallbackMessage: string,
): string {
  for (const tableId of seat.tableIds) {
    const table = state.tables.find((t) => t.id === tableId);
    if (!table) continue;
    const occupants = table.seatIds
      .map((sid) => state.seats.find((s) => s.id === sid)?.occupant)
      .filter((occ): occ is NonNullable<typeof occ> => occ !== null && occ !== undefined);
    const males = occupants.filter((o) => o.gender === 'M').length + (tile.gender === 'M' ? 1 : 0);
    const females = occupants.filter((o) => o.gender === 'F').length + (tile.gender === 'F' ? 1 : 0);

    if (males > 2 || females > 2) {
      return `Desequilibrio de sexos en la mesa de ${getNationName(
        table.nation,
      )}: nunca puede haber más de 2 hombres ni más de 2 mujeres en una mesa.`;
    }
    if (occupants.length === 1 && (males === 2 || females === 2)) {
      return `Pareja obligatoria en la mesa de ${getNationName(
        table.nation,
      )}: con 2 invitados debe haber exactamente 1 hombre y 1 mujer (salvo que completes el trío en este mismo turno).`;
    }
  }

  return fallbackMessage;
}

export type LocalPlayerStats = {
  gamesPlayed: number;
  wins: number;
  favoriteNations: Record<string, number>;
  frequentRivals: Record<string, number>;
};

const STATS_KEY = 'cafetulia_local_stats_v1';

export function loadLocalStats(): LocalPlayerStats {
  if (typeof window === 'undefined') {
    return { gamesPlayed: 0, wins: 0, favoriteNations: {}, frequentRivals: {} };
  }
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) {
      return { gamesPlayed: 0, wins: 0, favoriteNations: {}, frequentRivals: {} };
    }
    return JSON.parse(raw) as LocalPlayerStats;
  } catch {
    return { gamesPlayed: 0, wins: 0, favoriteNations: {}, frequentRivals: {} };
  }
}

export function recordFinishedGameLocally(
  state: GameState,
  myPlayerId: string,
  winners: string[],
): LocalPlayerStats {
  const stats = loadLocalStats();
  stats.gamesPlayed += 1;
  if (winners.includes(myPlayerId)) {
    stats.wins += 1;
  }
  for (const p of state.players) {
    if (p.id !== myPlayerId) {
      stats.frequentRivals[p.nickname] = (stats.frequentRivals[p.nickname] ?? 0) + 1;
    }
  }
  for (const ev of state.log) {
    if (ev.type === 'tile_seated' && ev.playerId === myPlayerId) {
      const nat = ev.tile.nation === 'joker' ? ev.tile.jokerNation : ev.tile.nation;
      if (nat) {
        stats.favoriteNations[nat] = (stats.favoriteNations[nat] ?? 0) + 1;
      }
    }
  }
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore storage quota errors
  }
  return stats;
}
