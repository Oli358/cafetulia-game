import type { Express, Request, Response } from 'express';
import { z } from 'zod';
import {
  defaultRoomRegistry,
  generateSessionToken,
  RoomCapacityError,
  RoomConfigSchema,
  type CafetuliaRoomController,
  type RoomRegistry,
} from '../rooms/index.js';
import { defaultPersistenceStore, type GamePersistenceStore } from '../persistence/index.js';
import { createRateLimiter } from './rateLimit.js';

export type HealthResponse = {
  status: 'ok';
};

export function getHealthPayload(): HealthResponse {
  return { status: 'ok' };
}

const SessionTokenSchema = z.string().trim().min(24).max(128);

const CreateRoomRequestSchema = z.object({
  nickname: z.string().trim().min(1).max(30).default('Anfitrión'),
  avatarId: z.string().trim().min(1).max(32).optional(),
  config: RoomConfigSchema.partial().optional(),
});

const JoinRoomRequestSchema = z.object({
  nickname: z.string().trim().min(1).max(30).default('Invitado'),
  avatarId: z.string().trim().min(1).max(32).optional(),
  token: SessionTokenSchema,
  asSpectator: z.boolean().optional(),
});

function getBearerToken(req: Request): string {
  const header = req.headers.authorization;
  if (typeof header !== 'string') return '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() ?? '';
}

function requireMember(
  room: CafetuliaRoomController,
  req: Request,
  res: Response,
): ReturnType<CafetuliaRoomController['findMemberByToken']> {
  const member = room.findMemberByToken(getBearerToken(req));
  if (!member) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Sesión no válida. Vuelve a entrar en la sala con tu enlace.',
    });
    return null;
  }
  return member;
}

export function registerApiRoutes(
  app: Express,
  registry: RoomRegistry = defaultRoomRegistry,
  store: GamePersistenceStore = defaultPersistenceStore,
): void {
  app.use((_req: Request, res: Response, next: () => void) => {
    // Room snapshots and chat must never be cached by browsers or proxies.
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json(getHealthPayload());
  });

  const requireJson = (req: Request, res: Response, next: () => void): void => {
    if (!req.is('application/json')) {
      res.status(415).json({
        error: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Esta ruta solo acepta application/json.',
      });
      return;
    }
    next();
  };

  // Local development and Playwright need generous buckets; production keeps
  // the strict values from docs/SEGURIDAD.md.
  const rateLimitMax = (productionMax: number): number =>
    process.env.NODE_ENV === 'production' ? productionMax : 10_000;

  const roomTrafficLimiter = createRateLimiter({
    windowMs: 60_000,
    max: rateLimitMax(600),
    keyPrefix: 'rooms',
  });
  const createRoomLimiter = createRateLimiter({
    windowMs: 60 * 60_000,
    max: rateLimitMax(30),
    keyPrefix: 'create-room',
    message: 'Se han creado demasiadas salas desde esta conexión. Espera un rato.',
  });
  const joinRoomLimiter = createRateLimiter({
    windowMs: 60_000,
    max: rateLimitMax(60),
    keyPrefix: 'join-room',
    message: 'Demasiados intentos de entrada. Espera un momento.',
  });
  const moveLimiter = createRateLimiter({
    windowMs: 60_000,
    max: rateLimitMax(180),
    keyPrefix: 'moves',
    message: 'Demasiadas jugadas seguidas. Espera un momento.',
  });
  const chatLimiter = createRateLimiter({
    windowMs: 60_000,
    max: rateLimitMax(60),
    keyPrefix: 'chat',
    message: 'El chat va demasiado rápido. Espera un momento.',
  });
  const historyLimiter = createRateLimiter({
    windowMs: 60_000,
    max: rateLimitMax(60),
    keyPrefix: 'history',
    message: 'Demasiadas consultas al historial. Espera un momento.',
  });

  app.use('/rooms', roomTrafficLimiter);

  app.post('/rooms', requireJson, createRoomLimiter, (req: Request, res: Response) => {
    const parsed = CreateRoomRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Datos de creación de sala inválidos.',
      });
      return;
    }

    // Host tokens are always generated server-side: a weak client-chosen token
    // would weaken the room's only credential.
    const hostToken = generateSessionToken();

    let room: CafetuliaRoomController;
    try {
      room = registry.createRoom({
        hostToken,
        hostNickname: parsed.data.nickname,
        hostAvatarId: parsed.data.avatarId,
        config: parsed.data.config,
      });
    } catch (error) {
      if (error instanceof RoomCapacityError) {
        res.status(503).json({ error: 'ROOM_LIMIT_REACHED', message: error.message });
        return;
      }
      throw error;
    }

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

    const member = requireMember(room, req, res);
    if (!member) return;

    res.status(200).json({
      code: room.code,
      link: `/?room=${room.code}`,
      snapshot: room.getSnapshot(),
      shareResult: room.getShareResultPayload(),
    });
  });

  app.post('/rooms/:code/join', requireJson, joinRoomLimiter, (req: Request, res: Response) => {
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

    try {
      const joined = room.joinOrReconnect(parsed.data);
      res.status(200).json(joined);
    } catch (error) {
      if (error instanceof RoomCapacityError) {
        res.status(409).json({ error: 'ROOM_FULL', message: error.message });
        return;
      }
      throw error;
    }
  });

  app.post('/rooms/:code/start', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const member = requireMember(room, req, res);
    if (!member) return;

    const result = room.startGame(member.playerId);
    if (!result.ok) {
      res.status(400).json({ error: 'START_FAILED', message: result.message });
      return;
    }

    res.status(200).json(result);
  });

  app.post('/rooms/:code/moves', moveLimiter, (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const member = requireMember(room, req, res);
    if (!member) return;

    const move = req.body?.move;
    const result = room.submitMove(member.playerId, move);

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

    const member = requireMember(room, req, res);
    if (!member) return;

    const patch = req.body?.config ?? {};
    const result = room.updateConfig(member.playerId, patch);
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

    const member = requireMember(room, req, res);
    if (!member) return;

    const ready = Boolean(req.body?.ready ?? true);
    room.setPlayerReady(member.playerId, ready);
    res.status(200).json({ ok: true, snapshot: room.getSnapshot() });
  });

  app.post('/rooms/:code/avatar', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const member = requireMember(room, req, res);
    if (!member) return;

    const avatarId = String(req.body?.avatarId ?? 'espresso').slice(0, 32);
    const result = room.updateAvatar(member.playerId, avatarId);
    res.status(200).json(result);
  });

  app.post('/rooms/:code/bots', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const member = requireMember(room, req, res);
    if (!member) return;

    const difficulty =
      req.body?.difficulty === 'hard' || req.body?.difficulty === 'medium'
        ? req.body.difficulty
        : 'basic';
    const nickname = typeof req.body?.nickname === 'string' ? req.body.nickname : undefined;
    const result = room.addBot(member.playerId, difficulty, nickname);
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

    const member = requireMember(room, req, res);
    if (!member) return;

    const botId = String(req.params.botId ?? '');
    const result = room.removeBot(member.playerId, botId);
    if (!result.ok) {
      res.status(400).json({ error: 'BOT_REMOVE_FAILED', message: result.message });
      return;
    }
    res.status(200).json({ ok: true, snapshot: room.getSnapshot() });
  });

  app.post('/rooms/:code/chat', chatLimiter, (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const member = requireMember(room, req, res);
    if (!member) return;

    const text = String(req.body?.text ?? '');
    const result = room.sendChatMessage(member.playerId, { text });
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

    const member = requireMember(room, req, res);
    if (!member) return;

    const accept = Boolean(req.body?.accept ?? true);
    const result = room.voteRematch(member.playerId, accept);
    if (!result.ok) {
      res.status(400).json({ error: 'REMATCH_FAILED', message: result.message });
      return;
    }
    res.status(200).json(result);
  });

  app.post('/rooms/:code/leave', (req: Request, res: Response) => {
    const rawCode = String(req.params.code ?? '').toUpperCase();
    const room = registry.getRoom(rawCode);
    if (!room) {
      res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' });
      return;
    }

    const member = requireMember(room, req, res);
    if (!member) return;

    room.leaveRoom(member.playerId);
    if (room.memberCount() === 0) {
      registry.removeRoom(room.code);
    }
    res.status(200).json({ ok: true });
  });

  app.get('/history', historyLimiter, (_req: Request, res: Response) => {
    res.status(200).json({
      matches: store.getRecentMatches(5),
    });
  });
}
