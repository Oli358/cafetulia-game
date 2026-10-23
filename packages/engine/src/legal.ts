import type {
  GameState,
  Move,
  MoveValidationError,
  Nation,
  Placement,
  PlayerId,
  Seat,
  Table,
  Tile,
} from './types.js';

/**
 * Checks whether all 68 chairs on the board are currently empty.
 */
export function isBoardCompletelyEmpty(seats: readonly Seat[]): boolean {
  return seats.every((s) => s.occupant === null);
}

/**
 * Checks end-of-turn table constraints for a single table:
 * 1. Gender balance:
 *    - 0 guests
 *    - 1M + 1F (2 guests)
 *    - 1M + 2F (3 guests)
 *    - 2M + 1F (3 guests)
 *    - 2M + 2F (4 guests)
 *    Never more than 2 guests of the same gender.
 * 2. Alone guest rule:
 *    - A table cannot have 1 single guest at the end of a turn, UNLESS:
 *      a) It is the special opening move of the starting player on a completely empty board, OR
 *      b) That single guest sits on a shared seat AND the neighboring table of that shared seat
 *         has at least one other guest (so the neighboring table has >= 2 guests total).
 */
export function checkTableConstraintsAtTurnEnd(
  table: Table,
  seatsById: ReadonlyMap<string, Seat>,
  tablesById: ReadonlyMap<string, Table>,
  allowOpeningSingleGuest: boolean,
): MoveValidationError | null {
  const occupiedSeats: Seat[] = [];
  let maleCount = 0;
  let femaleCount = 0;

  for (const seatId of table.seatIds) {
    const seat = seatsById.get(seatId);
    if (seat?.occupant) {
      occupiedSeats.push(seat);
      if (seat.occupant.gender === 'M') {
        maleCount += 1;
      } else {
        femaleCount += 1;
      }
    }
  }

  const totalGuests = occupiedSeats.length;
  if (totalGuests === 0) {
    return null;
  }

  if (maleCount > 2 || femaleCount > 2) {
    return {
      code: 'GENDER_BALANCE_VIOLATED',
      message: `La mesa ${table.id} supera el máximo de 2 personas del mismo sexo (${maleCount}M, ${femaleCount}F).`,
    };
  }

  if (totalGuests === 1) {
    if (allowOpeningSingleGuest) {
      return null;
    }

    const soleSeat = occupiedSeats[0];
    if (!soleSeat || !soleSeat.shared) {
      return {
        code: 'ALONE_GUEST_VIOLATION',
        message: `No puede quedar un invitado solo en la mesa ${table.id}.`,
      };
    }

    const neighborTableId = soleSeat.tableIds.find((id) => id !== table.id);
    const neighborTable = neighborTableId ? tablesById.get(neighborTableId) : undefined;
    if (!neighborTable) {
      return {
        code: 'ALONE_GUEST_VIOLATION',
        message: `No puede quedar un invitado solo en la mesa ${table.id}.`,
      };
    }

    let neighborCount = 0;
    for (const nSeatId of neighborTable.seatIds) {
      if (seatsById.get(nSeatId)?.occupant) {
        neighborCount += 1;
      }
    }

    // Because soleSeat is shared, it also counts in neighborTable.
    // "la mesa vecina tenga al menos otro invitado" => neighborCount >= 2.
    if (neighborCount < 2) {
      return {
        code: 'ALONE_GUEST_VIOLATION',
        message: `El invitado en la silla compartida ${soleSeat.id} quedaría solo en ambas mesas.`,
      };
    }

    return null;
  }

  // When totalGuests === 2, must be 1M + 1F (already guaranteed by maleCount <= 2 && femaleCount <= 2, except 2M+0F or 0M+2F!)
  if (totalGuests === 2 && (maleCount !== 1 || femaleCount !== 1)) {
    return {
      code: 'GENDER_BALANCE_VIOLATED',
      message: `Una mesa con 2 invitados (${table.id}) debe tener exactamente 1 hombre y 1 mujer (${maleCount}M, ${femaleCount}F).`,
    };
  }

  // When totalGuests === 3, maleCount <= 2 && femaleCount <= 2 guarantees (2M+1F or 1M+2F).
  // When totalGuests === 4, maleCount <= 2 && femaleCount <= 2 guarantees (2M+2F).
  return null;
}

/**
 * Validates any proposed move against the current GameState for playerId.
 * Returns null if the move is legal, or a typed MoveValidationError if illegal.
 */
export function validateMove(
  state: GameState,
  move: Move,
  playerId: PlayerId = state.turn,
): MoveValidationError | null {
  if (state.phase !== 'playing') {
    return {
      code: 'GAME_NOT_PLAYING',
      message: 'La partida no está en curso.',
    };
  }

  if (state.turn !== playerId) {
    return {
      code: 'NOT_PLAYER_TURN',
      message: `No es el turno del jugador ${playerId}.`,
    };
  }

  const hand = state.hands[playerId];
  if (!hand) {
    return {
      code: 'INVALID_PLAYER',
      message: `Jugador ${playerId} no encontrado.`,
    };
  }

  if (move.type === 'bar') {
    const tile = hand.find((t) => t.id === move.tileId);
    if (!tile) {
      return {
        code: 'TILE_NOT_IN_HAND',
        message: `La ficha ${move.tileId} no está en la mano del jugador.`,
      };
    }

    if (tile.nation === 'joker') {
      return {
        code: 'JOKER_NOT_ALLOWED_AT_BAR',
        message: 'Los comodines no pueden ir a la barra.',
      };
    }

    const nextFreeBarIdx = state.bar.findIndex((slot) => slot === null);
    if (nextFreeBarIdx === -1) {
      return {
        code: 'BAR_FULL',
        message: 'La barra ya está llena.',
      };
    }

    return null;
  }

  if (move.type === 'swap') {
    const tile = hand.find((t) => t.id === move.tileId);
    if (!tile) {
      return {
        code: 'TILE_NOT_IN_HAND',
        message: `La ficha ${move.tileId} no está en la mano del jugador.`,
      };
    }

    if (tile.nation === 'joker') {
      return {
        code: 'SWAP_REQUIRES_NATURAL_TILE',
        message: 'Solo se puede cambiar un comodín por una ficha natural.',
      };
    }

    const seat = state.seats.find((s) => s.id === move.seatId);
    if (!seat) {
      return {
        code: 'SEAT_NOT_FOUND',
        message: `La silla ${move.seatId} no existe.`,
      };
    }

    if (!seat.occupant) {
      return {
        code: 'SEAT_EMPTY',
        message: `La silla ${move.seatId} está vacía.`,
      };
    }

    if (seat.occupant.nation !== 'joker') {
      return {
        code: 'SEAT_NOT_JOKER',
        message: `La silla ${move.seatId} no está ocupada por un comodín.`,
      };
    }

    if (seat.occupant.gender !== tile.gender) {
      return {
        code: 'SWAP_GENDER_MISMATCH',
        message: 'La ficha natural debe tener el mismo sexo que el comodín sentado.',
      };
    }

    if (!seat.allowedNations.includes(tile.nation)) {
      return {
        code: 'NATION_NOT_ALLOWED_ON_SEAT',
        message: `La silla ${move.seatId} no admite la nacionalidad ${tile.nation}.`,
      };
    }

    return null;
  }

  // move.type === 'seat'
  const placements = move.placements;
  if (placements.length < 1 || placements.length > 2) {
    return {
      code: 'INVALID_PLACEMENT_COUNT',
      message: 'Debes colocar 1 o 2 invitados en las mesas.',
    };
  }

  if (placements.length === 2 && placements[0].tileId === placements[1].tileId) {
    return {
      code: 'DUPLICATE_TILE_IN_MOVE',
      message: 'No puedes colocar la misma ficha dos veces.',
    };
  }

  if (placements.length === 2 && placements[0].seatId === placements[1].seatId) {
    return {
      code: 'DUPLICATE_SEAT_IN_MOVE',
      message: 'No puedes colocar dos fichas en la misma silla.',
    };
  }

  const boardEmptyAtTurnStart = isBoardCompletelyEmpty(state.seats);
  const isSpecialOpeningAllowed =
    boardEmptyAtTurnStart &&
    state.turn === state.startingPlayerId &&
    state.turnNumber === 1 &&
    placements.length === 1;

  // Clone seats into a working map to simulate sequential placements
  const seatsById = new Map<string, Seat>();
  for (const seat of state.seats) {
    seatsById.set(seat.id, { ...seat });
  }

  const tablesById = new Map<string, Table>();
  for (const table of state.tables) {
    tablesById.set(table.id, table);
  }

  const scoresPerPlacement: number[] = [];
  const affectedTableIds = new Set<string>();

  for (let i = 0; i < placements.length; i++) {
    const p = placements[i];
    if (!p) continue;

    const tile = hand.find((t) => t.id === p.tileId);
    if (!tile) {
      return {
        code: 'TILE_NOT_IN_HAND',
        message: `La ficha ${p.tileId} no está en la mano del jugador.`,
      };
    }

    const seat = seatsById.get(p.seatId);
    if (!seat) {
      return {
        code: 'SEAT_NOT_FOUND',
        message: `La silla ${p.seatId} no existe.`,
      };
    }

    if (seat.occupant !== null) {
      return {
        code: 'SEAT_ALREADY_OCCUPIED',
        message: `La silla ${p.seatId} ya está ocupada.`,
      };
    }

    let representedNation: Nation;
    if (tile.nation === 'joker') {
      const chosen = p.jokerNation ?? (seat.allowedNations.length === 1 ? seat.allowedNations[0] : undefined);
      if (!chosen) {
        return {
          code: 'JOKER_NATION_REQUIRED',
          message: 'Debes elegir qué nacionalidad representa el comodín al sentarse.',
        };
      }
      if (!seat.allowedNations.includes(chosen)) {
        return {
          code: 'NATION_NOT_ALLOWED_ON_SEAT',
          message: `El comodín no puede representar ${chosen} en la silla ${seat.id}.`,
        };
      }
      representedNation = chosen;
    } else {
      if (!seat.allowedNations.includes(tile.nation)) {
        return {
          code: 'NATION_NOT_ALLOWED_ON_SEAT',
          message: `Un invitado de ${tile.nation} no puede sentarse en la silla ${seat.id}.`,
        };
      }
      if (p.jokerNation !== undefined && p.jokerNation !== tile.nation) {
        return {
          code: 'NATION_NOT_ALLOWED_ON_SEAT',
          message: 'Una ficha natural no puede cambiar su nacionalidad.',
        };
      }
      representedNation = tile.nation;
    }

    const seatedTile: Tile =
      tile.nation === 'joker'
        ? { ...tile, jokerNation: representedNation }
        : { ...tile };

    seatsById.set(seat.id, {
      ...seat,
      occupant: seatedTile,
    });

    let placementPoints = 0;
    for (const tableId of seat.tableIds) {
      affectedTableIds.add(tableId);
      const table = tablesById.get(tableId);
      if (!table) continue;
      let occCount = 0;
      let firstNat: Nation | undefined;
      let sameNat = true;
      for (const sid of table.seatIds) {
        const occ = seatsById.get(sid)?.occupant;
        if (occ) {
          occCount += 1;
          const effNat = occ.nation === 'joker' ? occ.jokerNation : occ.nation;
          if (firstNat === undefined) {
            firstNat = effNat;
          } else if (effNat !== firstNat) {
            sameNat = false;
          }
        }
      }
      if (occCount >= 2) {
        placementPoints += sameNat ? occCount * 2 : occCount;
      }
    }

    scoresPerPlacement.push(placementPoints);
  }

  // Check end-of-turn table constraints (gender balance and alone guest) on all affected tables
  for (const tableId of affectedTableIds) {
    const table = tablesById.get(tableId);
    if (!table) continue;
    const constraintError = checkTableConstraintsAtTurnEnd(
      table,
      seatsById,
      tablesById,
      isSpecialOpeningAllowed,
    );
    if (constraintError) {
      return constraintError;
    }
  }

  // Check mandatory scoring rules:
  // - Single placement: must score > 0 unless it is the special opening move.
  if (placements.length === 1) {
    const points0 = scoresPerPlacement[0] ?? 0;
    if (!isSpecialOpeningAllowed && points0 <= 0) {
      return {
        code: 'PLACEMENT_MUST_SCORE',
        message: 'Cada ficha colocada debe puntuar, salvo la apertura inicial.',
      };
    }
  } else if (placements.length === 2) {
    const p0 = placements[0];
    const p1 = placements[1];
    const points0 = scoresPerPlacement[0] ?? 0;
    const points1 = scoresPerPlacement[1] ?? 0;

    // Second tile must always score > 0
    if (points1 <= 0) {
      return {
        code: 'PLACEMENT_MUST_SCORE',
        message: 'La segunda ficha colocada debe puntuar.',
      };
    }

    // If the first tile scored 0, it is only legal if it opened an empty table
    // and the second tile sits at that same table to complete the pair in the same turn.
    if (points0 <= 0) {
      const seat0 = state.seats.find((s) => s.id === p0.seatId);
      const seat1 = state.seats.find((s) => s.id === p1.seatId);
      const sharedTables =
        seat0 && seat1
          ? seat0.tableIds.filter((tid) => seat1.tableIds.includes(tid))
          : [];
      if (sharedTables.length === 0) {
        return {
          code: 'PLACEMENT_MUST_SCORE',
          message:
            'Si se colocan dos fichas en mesas distintas, las dos deben puntuar; si la primera abre una mesa sin puntuar, la segunda debe acompañarla en esa misma mesa.',
        };
      }
    }
  }

  return null;
}

/**
 * Generates all possible Placement options for a single tile from hand on currently empty seats.
 */
function getCandidateSinglePlacements(hand: readonly Tile[], seats: readonly Seat[]): Placement[] {
  const candidates: Placement[] = [];
  const emptySeats = seats.filter((s) => s.occupant === null);

  for (const tile of hand) {
    for (const seat of emptySeats) {
      if (tile.nation === 'joker') {
        for (const nation of seat.allowedNations) {
          candidates.push({
            tileId: tile.id,
            seatId: seat.id,
            jokerNation: nation,
          });
        }
      } else if (seat.allowedNations.includes(tile.nation)) {
        candidates.push({
          tileId: tile.id,
          seatId: seat.id,
        });
      }
    }
  }

  return candidates;
}

/**
 * Returns all legal moves for the specified player in the current GameState.
 */
export function getLegalMoves(state: GameState, playerId: PlayerId = state.turn): Move[] {
  if (state.phase !== 'playing' || state.turn !== playerId) {
    return [];
  }

  const hand = state.hands[playerId];
  if (!hand || hand.length === 0) {
    return [];
  }

  const legalMoves: Move[] = [];

  // 1. Bar moves (1 natural tile from hand if bar is not full)
  const barHasSpace = state.bar.some((slot) => slot === null);
  if (barHasSpace) {
    for (const tile of hand) {
      if (tile.nation !== 'joker') {
        const move: Move = { type: 'bar', tileId: tile.id };
        if (validateMove(state, move, playerId) === null) {
          legalMoves.push(move);
        }
      }
    }
  }

  // 2. Joker swap moves
  const jokerSeats = state.seats.filter((s) => s.occupant?.nation === 'joker');
  if (jokerSeats.length > 0) {
    for (const seat of jokerSeats) {
      for (const tile of hand) {
        if (
          tile.nation !== 'joker' &&
          seat.occupant?.gender === tile.gender &&
          seat.allowedNations.includes(tile.nation)
        ) {
          const move: Move = { type: 'swap', seatId: seat.id, tileId: tile.id };
          if (validateMove(state, move, playerId) === null) {
            legalMoves.push(move);
          }
        }
      }
    }
  }

  // 3. 1-tile seat placements
  const candidates = getCandidateSinglePlacements(hand, state.seats);
  const validSingleCandidates: Placement[] = [];
  const seatById = new Map<string, Seat>(state.seats.map((s) => [s.id, s]));
  const tableOccupantCount = new Map<string, number>();

  for (const table of state.tables) {
    let count = 0;
    for (const sid of table.seatIds) {
      if (seatById.get(sid)?.occupant) {
        count += 1;
      }
    }
    tableOccupantCount.set(table.id, count);
  }

  for (const c1 of candidates) {
    const move: Move = { type: 'seat', placements: [c1] };
    if (validateMove(state, move, playerId) === null) {
      legalMoves.push(move);
      validSingleCandidates.push(c1);
    }
  }

  // 4. 2-tile seat placements:
  // Either c1 already scores (so c1 is in validSingleCandidates, and c2 must also touch an occupied table or share a table with c1),
  // OR c1 opens an empty table (0 points) and c2 must sit at one of c1's tables!
  if (hand.length >= 2) {
    const validSingleSet = new Set(validSingleCandidates);

    for (let i = 0; i < candidates.length; i++) {
      const c1 = candidates[i];
      if (!c1) continue;
      const seat1 = seatById.get(c1.seatId);
      if (!seat1) continue;

      const c1ScoresAlone = validSingleSet.has(c1);

      for (let j = 0; j < candidates.length; j++) {
        if (i === j) continue;
        const c2 = candidates[j];
        if (!c2) continue;
        if (c1.tileId === c2.tileId || c1.seatId === c2.seatId) {
          continue;
        }
        const seat2 = seatById.get(c2.seatId);
        if (!seat2) continue;

        const sharesTableWithC1 = seat1.tableIds.some((tid) => seat2.tableIds.includes(tid));

        if (!c1ScoresAlone && !sharesTableWithC1) {
          continue;
        }

        // For c2 to score > 0, at least one of seat2's tables must either share a table with c1 or already have >= 1 occupant
        const c2CanScore =
          sharesTableWithC1 ||
          seat2.tableIds.some((tid) => (tableOccupantCount.get(tid) ?? 0) >= 1);

        if (!c2CanScore) {
          continue;
        }

        const move: Move = { type: 'seat', placements: [c1, c2] };
        if (validateMove(state, move, playerId) === null) {
          legalMoves.push(move);
        }
      }
    }
  }

  return legalMoves;
}
