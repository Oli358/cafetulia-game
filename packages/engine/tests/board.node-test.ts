import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyMove,
  boardData,
  createGame,
  getLegalMoves,
  validateBoardData,
} from '../src/index';

test('board.json invariants via node:test', () => {
  const result = validateBoardData(boardData);
  assert.equal(result.valid, true, `Validation errors: ${result.errors.join(', ')}`);
  assert.equal(result.stats.nationCount, 12);
  assert.equal(result.stats.tableCount, 24);
  assert.equal(result.stats.uniqueSeatCount, 68);
  assert.equal(result.stats.sharedSeatCount, 28);
  assert.equal(result.stats.barSlotCount, 20);
});

test('deterministic game creation and first legal move via node:test', () => {
  const g1 = createGame(
    {
      players: [
        { id: 'p1', nickname: 'Ana' },
        { id: 'p2', nickname: 'Bruno' },
      ],
    },
    12345,
  );
  const g2 = createGame(
    {
      players: [
        { id: 'p1', nickname: 'Ana' },
        { id: 'p2', nickname: 'Bruno' },
      ],
    },
    12345,
  );
  assert.deepEqual(g1, g2);
  const moves = getLegalMoves(g1);
  assert.equal(moves.length > 0, true);
  const res = applyMove(g1, moves[0]!);
  assert.equal(res.ok, true);
});
