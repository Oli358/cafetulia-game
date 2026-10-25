import type { Express, Request, Response } from 'express';
import { z } from 'zod';
import {
  defaultRoomRegistry,
  RoomConfigSchema,
  type RoomRegistry,
} from '../rooms/index.js';
import {
  defaultPersistenceStore,
  type GamePersistenceStore,
} from '../persistence/index.js';

export type HealthResponse = {
  status: 'ok';
};

export function getHealthPayload(): HealthResponse {
  return { status: 'ok' };
}

const CreateRoomRequestSchema = z.object({
  nickname: z.string().trim().min(1).max(30).default('Anfitrión'),
  token: z.string().trim().min(4).max(64).optional(),
  config: RoomConfigSchema.partial().optional(),
  seed: z.union([z.number(), z.string()]).optional(),
});

const JoinRoomRequestSchema = z.object({
  nickname: z.string().trim().min(1).max(30).default('Invitado'),
  token: z.string().trim().min(4).max(64),
  asSpectator: z.boolean().optional(),
});

export function registerApiRoutes(
  app: Express,
  registry: RoomRegistry = defaultRoomRegistry,
  store: GamePersistenceStore = defaultPersistenceStore,
): void {
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json(getHealthPayload());
  });

  app.post('/rooms', (req: Request, res: Response) => {
    const parsed = CreateRoomRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Datos de creación de sala inválidos.',
      });
      return;
    }

    const hostToken =
      parsed.data.token ?? `tok_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const room = registry.createRoom({
      hostToken,
      hostNickname: parsed.data.nickname,
      config: parsed.data.config,
      seed: parsed.data.seed,
    });

    const snapshot = room.getSnapshot();
    res.status(201).json({
      code: room.code,
      link: `/?room=${room.code}`,
      hostId: snapshot.hostId,
      hostToken,
      snapshot,
    });
  });

  app.get('/rooms/:code', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);

    if (!room) {
      const persisted = store.getRoom(rawCode);
      if (!persisted) {
        res.status(404).json({
          error: 'ROOM_NOT_FOUND',
          message: `La sala ${rawCode} no existe.`,
        });
        return;
      }
      res.status(200).json({
        code: persisted.code,
        phase: persisted.phase,
        config: persisted.config,
        persistedOnly: true,
      });
      return;
    }

    res.status(200).json({
      code: room.code,
      link: `/?room=${room.code}`,
      snapshot: room.getSnapshot(),
      shareResult: room.getShareResultPayload(),
    });
  });

  app.post('/rooms/:code/join', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({
        error: 'ROOM_NOT_FOUND',
        message: `La sala ${rawCode} no existe.`,
      });
      return;
    }

    const parsed = JoinRoomRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        error: 'INVALID_JOIN_PAYLOAD',
        message: 'Nickname y token son obligatorios.',
      });
      return;
    }

    const joined = room.joinOrReconnect(parsed.data);
    res.status(200).json(joined);
  });

  app.post('/rooms/:code/start', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const playerId = String(req.body?.playerId ?? '');
    const result = room.startGame(playerId, req.body?.seed);
    if (!result.ok) {
      res.status(400).json({ error: 'START_FAILED', message: result.message });
      return;
    }

    res.status(200).json(result);
  });

  app.post('/rooms/:code/moves', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const playerId = String(req.body?.playerId ?? '');
    const move = req.body?.move;
    const result = room.submitMove(playerId, move);

    if (!result.ok) {
      res.status(422).json({ error: result.error });
      return;
    }

    res.status(200).json(result);
  });

  app.post('/rooms/:code/config', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const playerId = String(req.body?.playerId ?? '');
    const patch = req.body?.config ?? {};
    const result = room.updateConfig(playerId, patch);
    if (!result.ok) {
      res.status(400).json({ error: 'CONFIG_FAILED', message: result.message });
      return;
    }
    res.status(200).json({ ok: true, snapshot: room.getSnapshot() });
  });

  app.post('/rooms/:code/ready', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const playerId = String(req.body?.playerId ?? '');
    const ready = Boolean(req.body?.ready ?? true);
    room.setPlayerReady(playerId, ready);
    res.status(200).json({ ok: true, snapshot: room.getSnapshot() });
  });

  app.post('/rooms/:code/bots', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const playerId = String(req.body?.playerId ?? '');
    const difficulty =
      req.body?.difficulty === 'hard' || req.body?.difficulty === 'medium'
        ? req.body.difficulty
        : 'basic';
    const nickname = typeof req.body?.nickname === 'string' ? req.body.nickname : undefined;
    const result = room.addBot(playerId, difficulty, nickname);
    if (!result.ok) {
      res.status(400).json({ error: 'BOT_ADD_FAILED', message: result.message });
      return;
    }
    res.status(200).json({ ok: true, botId: result.botId, snapshot: room.getSnapshot() });
  });

  app.delete('/rooms/:code/bots/:botId', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const playerId = String(req.body?.playerId ?? req.query.playerId ?? '');
    const botId = String(req.params.botId ?? '');
    const result = room.removeBot(playerId, botId);
    if (!result.ok) {
      res.status(400).json({ error: 'BOT_REMOVE_FAILED', message: result.message });
      return;
    }
    res.status(200).json({ ok: true, snapshot: room.getSnapshot() });
  });

  app.post('/rooms/:code/chat', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const senderId = String(req.body?.senderId ?? '');
    const text = String(req.body?.text ?? '');
    const result = room.sendChatMessage(senderId, { text });
    if (!result.ok) {
      res.status(400).json({ error: 'CHAT_FAILED', message: result.message });
      return;
    }
    res.status(200).json({ ok: true, message: result.message, snapshot: room.getSnapshot() });
  });

  app.post('/rooms/:code/rematch', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const playerId = String(req.body?.playerId ?? '');
    const accept = Boolean(req.body?.accept ?? true);
    const result = room.voteRematch(playerId, accept);
    if (!result.ok) {
      res.status(400).json({ error: 'REMATCH_FAILED', message: result.message });
      return;
    }
    res.status(200).json(result);
  });

  app.get('/history', (_req: Request, res: Response) => {
    res.status(200).json({
      matches: store.getRecentMatches(5),
    });
  });
}
