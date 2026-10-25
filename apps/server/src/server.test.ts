import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CafetuliaRoomController,
  GamePersistenceStore,
  RoomRegistry,
  createApp,
} from '../src/index.js';
import type { Tile } from '@cafetulia/engine';

describe('Phase 3: Online Server, Rooms, Reconnection, Timer & Persistence', () => {
  let store: GamePersistenceStore;
  let registry: RoomRegistry;

  beforeEach(() => {
    store = new GamePersistenceStore(':memory:');
    registry = new RoomRegistry(store);
  });

  afterEach(() => {
    registry.clearAll();
    store.close();
    vi.useRealTimers();
  });

  it('1 & 2. creates a private room with 6-character code, joins guests with token+nickname, and persists to SQLite', () => {
    const room = registry.createRoom({
      hostToken: 'token_host_1234',
      hostNickname: 'Ana',
      seed: 101,
    });

    expect(room.code).toHaveLength(6);
    const snap1 = room.getSnapshot();
    expect(snap1.phase).toBe('lobby');
    expect(snap1.members).toHaveLength(1);
    expect(snap1.members[0]?.nickname).toBe('Ana');
    expect(snap1.members[0]?.role).toBe('player');

    // Join second guest
    const join2 = room.joinOrReconnect({
      token: 'token_guest_5678',
      nickname: 'Bruno',
    });
    expect(join2.role).toBe('player');
    expect(join2.snapshot.members).toHaveLength(2);

    // Check SQLite persistence
    const persisted = store.getRoom(room.code);
    expect(persisted).not.toBeNull();
    expect(persisted?.code).toBe(room.code);
  });

  it('3. validates all moves with @cafetulia/engine and rejects illegal moves with typed MoveValidationError', () => {
    const room = registry.createRoom({
      hostToken: 'token_host_1234',
      hostNickname: 'Ana',
      seed: 42,
    });
    const hostId = room.getSnapshot().hostId;
    const guest = room.joinOrReconnect({
      token: 'token_guest_5678',
      nickname: 'Bruno',
    });

    const started = room.startGame(hostId, 42);
    expect(started.ok).toBe(true);
    if (!started.ok) return;

    const currentTurnId = started.snapshot.gameState!.turn;
    const wrongTurnId = currentTurnId === hostId ? guest.playerId : hostId;

    // 1) Wrong player's turn -> NOT_PLAYER_TURN
    const wrongTurnRes = room.submitMove(wrongTurnId, {
      type: 'bar',
      tileId: 'any_tile',
    });
    expect(wrongTurnRes.ok).toBe(false);
    if (!wrongTurnRes.ok) {
      expect(wrongTurnRes.error.code).toBe('NOT_PLAYER_TURN');
    }

    // 2) Tile not in hand -> TILE_NOT_IN_HAND
    const missingTileRes = room.submitMove(currentTurnId, {
      type: 'bar',
      tileId: 'non_existent_tile_999',
    });
    expect(missingTileRes.ok).toBe(false);
    if (!missingTileRes.ok) {
      expect(missingTileRes.error.code).toBe('TILE_NOT_IN_HAND');
    }

    // 3) Valid move -> succeeds and records event in SQLite move_events table
    const hand = started.snapshot.gameState!.hands[currentTurnId]!;
    const naturalTile = hand.find((t) => t.nation !== 'joker')!;
    const validRes = room.submitMove(currentTurnId, {
      type: 'bar',
      tileId: naturalTile.id,
    });
    expect(validRes.ok).toBe(true);

    const savedMoves = store.getRoomMoveEvents(room.code);
    expect(savedMoves).toHaveLength(1);
    expect(savedMoves[0]?.playerId).toBe(currentTurnId);
  });

  it('4 & 5. supports room configuration (players, bots, timer <= 180s) and spectators in read-only mode', () => {
    const room = registry.createRoom({
      hostToken: 'token_host_1234',
      hostNickname: 'Ana',
    });
    const hostId = room.getSnapshot().hostId;

    const cfgRes = room.updateConfig(hostId, {
      maxPlayers: 2,
      botCount: 1,
      botDifficulty: 'medium',
      timerEnabled: true,
      timerSeconds: 180,
    });
    expect(cfgRes.ok).toBe(true);
    if (!cfgRes.ok) return;
    expect(cfgRes.snapshot.members).toHaveLength(2); // Ana + 1 Bot

    // Third person joining a 2-player full room enters as spectator
    const specJoin = room.joinOrReconnect({
      token: 'token_spec_9999',
      nickname: 'Miron',
    });
    expect(specJoin.role).toBe('spectator');

    room.startGame(hostId, 77);

    // Spectator tries to submit a move -> rejected with INVALID_PLAYER
    const specMove = room.submitMove(specJoin.playerId, {
      type: 'bar',
      tileId: 'any',
    });
    expect(specMove.ok).toBe(false);
    if (!specMove.ok) {
      expect(specMove.error.code).toBe('INVALID_PLAYER');
    }
  });

  it('6. handles 15-second reconnection window and expulsion after timeout (hand to bag, seated stay, returns as spectator)', () => {
    vi.useFakeTimers();

    const room = new CafetuliaRoomController({
      code: 'TEST15',
      hostToken: 'token_p1_host',
      hostNickname: 'Ana',
      store,
      reconnectGraceMs: 15_000,
    });
    const p1Id = room.getSnapshot().hostId;
    const p2 = room.joinOrReconnect({ token: 'token_p2_guest', nickname: 'Bruno' });
    const p3 = room.joinOrReconnect({ token: 'token_p3_guest', nickname: 'Clara' });

    room.startGame(p1Id, 123);

    // P2 disconnects briefly (5s) and reconnects before 15s -> stays active player!
    room.handleDisconnect(p2.playerId);
    vi.advanceTimersByTime(5_000);
    const reconP2 = room.joinOrReconnect({ token: 'token_p2_guest', nickname: 'Bruno' });
    expect(reconP2.role).toBe('player');

    // Now P3 disconnects and exceeds 15s -> expelled!
    const bagBeforeExpel = room.getSnapshot().gameState!.bag.length;
    room.handleDisconnect(p3.playerId);
    vi.advanceTimersByTime(15_001);

    const snapAfterExpel = room.getSnapshot();
    expect(snapAfterExpel.gameState!.bag).toHaveLength(bagBeforeExpel + 5);
    expect(snapAfterExpel.gameState!.hands[p3.playerId]).toHaveLength(0);

    // When expelled P3 reconnects later, they become a spectator
    const rejoinP3 = room.joinOrReconnect({ token: 'token_p3_guest', nickname: 'Clara' });
    expect(rejoinP3.role).toBe('spectator');

    room.dispose();
  });

  it('6b. ends a 2-player match immediately when one player is expelled after 15s disconnect, awarding victory to the remaining player', () => {
    vi.useFakeTimers();

    const room = new CafetuliaRoomController({
      code: 'DUEL15',
      hostToken: 'token_p1_host',
      hostNickname: 'Ana',
      store,
      reconnectGraceMs: 15_000,
    });
    const p1Id = room.getSnapshot().hostId;
    const p2 = room.joinOrReconnect({ token: 'token_p2_guest', nickname: 'Bruno' });

    room.startGame(p1Id, 555);
    room.handleDisconnect(p2.playerId);
    vi.advanceTimersByTime(15_001);

    const snap = room.getSnapshot();
    expect(snap.phase).toBe('finished');
    expect(snap.gameState?.terminalReason).toBe('last_player_standing');
    expect(snap.gameState?.winners).toEqual([p1Id]);

    room.dispose();
  });

  it('7. executes a sensible automatic move when the turn timer expires and logs it in the event log (never in chat)', () => {
    vi.useFakeTimers();

    const room = new CafetuliaRoomController({
      code: 'TIMER1',
      hostToken: 'token_p1_host',
      hostNickname: 'Ana',
      config: {
        maxPlayers: 2,
        botCount: 0,
        botDifficulty: 'basic',
        timerEnabled: true,
        timerSeconds: 30,
        allowNegativeScore: true,
      },
      store,
    });
    const p1Id = room.getSnapshot().hostId;
    room.joinOrReconnect({ token: 'token_p2_guest', nickname: 'Bruno' });

    const chatMessages: unknown[] = [];
    room.onChatMessage((m) => chatMessages.push(m));

    room.startGame(p1Id, 888);
    const initialTurnPlayer = room.getSnapshot().gameState!.turn;

    // Advance 30 seconds -> turn timer fires automatic move
    vi.advanceTimersByTime(30_001);

    const snapAfter = room.getSnapshot();
    expect(snapAfter.gameState!.turnNumber).toBe(2);
    expect(snapAfter.gameState!.turn).not.toBe(initialTurnPlayer);

    // Event is logged in gameState.log, and chat remains empty
    const hasTimeoutEvent = snapAfter.gameState!.log.some(
      (ev) => ev.type === 'turn_timeout_auto_move' && ev.playerId === initialTurnPlayer,
    );
    expect(hasTimeoutEvent).toBe(true);
    expect(chatMessages).toHaveLength(0);

    room.dispose();
  });

  it('8, 9 & 10. keeps ephemeral chat separate from DB, trims match history to 5 games, and requires unanimous rematch vote', () => {
    const room = registry.createRoom({
      hostToken: 'token_p1_host',
      hostNickname: 'Ana',
      seed: 321,
    });
    const p1Id = room.getSnapshot().hostId;
    const p2 = room.joinOrReconnect({ token: 'token_p2_guest', nickname: 'Bruno' });

    const receivedChat: string[] = [];
    room.onChatMessage((msg) => {
      receivedChat.push(`${msg.nickname}:${msg.text ?? ''}:${msg.emote ?? ''}`);
    });

    const chatRes = room.sendChatMessage(p1Id, { text: '¡Buenas tardes!', emote: '☕' });
    expect(chatRes.ok).toBe(true);
    expect(receivedChat).toEqual(['Ana:¡Buenas tardes!:☕']);

    // Play a quick game to completion by setting bag to 4 tiles and playing a bar move
    room.startGame(p1Id, 321);
    const gs = room.getSnapshot().gameState!;
    gs.bag = gs.bag.slice(0, 4);
    const activeId = gs.turn;
    const natTile: Tile = gs.hands[activeId]!.find((t) => t.nation !== 'joker')!;

    const moveRes = room.submitMove(activeId, { type: 'bar', tileId: natTile.id });
    expect(moveRes.ok).toBe(true);
    expect(room.getSnapshot().phase).toBe('finished');

    // Share result payload is ready
    const shareData = room.getShareResultPayload();
    expect(shareData).not.toBeNull();
    expect(shareData?.roomCode).toBe(room.code);

    // Unanimous rematch: p1 votes yes -> waiting; p2 votes yes -> restarted!
    const v1 = room.voteRematch(p1Id, true);
    expect(v1.ok && v1.outcome).toBe('waiting');

    const v2 = room.voteRematch(p2.playerId, true);
    expect(v2.ok && v2.outcome).toBe('restarted');
    expect(room.getSnapshot().phase).toBe('playing');

    // Verify match history cap of 5 in SQLite
    for (let i = 0; i < 7; i++) {
      store.recordMatchFinished({
        roomCode: `RM000${i}`,
        winners: [p1Id],
        scores: {},
        players: [{ id: p1Id, nickname: 'Ana' }],
        terminalReason: 'bar_full',
      });
    }
    const recent = store.getRecentMatches(10);
    expect(recent).toHaveLength(5);
  });

  it('exposes HTTP endpoints GET /health, POST /rooms, GET /rooms/:code', async () => {
    const app = createApp(registry, store);
    const server = app.listen(0);
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const healthRes = await fetch(`${baseUrl}/health`);
      expect(healthRes.status).toBe(200);
      expect(await healthRes.json()).toEqual({ status: 'ok' });

      const createRes = await fetch(`${baseUrl}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: 'Anfitriona', config: { maxPlayers: 3 } }),
      });
      expect(createRes.status).toBe(201);
      const createdBody = (await createRes.json()) as { code: string; snapshot: { config: { maxPlayers: number } } };
      expect(createdBody.code).toHaveLength(6);
      expect(createdBody.snapshot.config.maxPlayers).toBe(3);

      const getRes = await fetch(`${baseUrl}/rooms/${createdBody.code}`);
      expect(getRes.status).toBe(200);
      const getBody = (await getRes.json()) as { code: string };
      expect(getBody.code).toBe(createdBody.code);
    } finally {
      server.close();
    }
  });
});
