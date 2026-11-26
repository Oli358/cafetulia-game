import { randomBytes, randomInt, randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  applyMove,
  createGame,
  finalScores,
  kickDisconnectedPlayer,
  normalizeSeed,
  selectBotMove,
  selectSensibleAutoMove,
  shuffleWithRng,
  type FinalScoreSummary,
  type GameState,
  type Move,
  type MoveEvent,
  type MoveValidationError,
} from '@cafetulia/engine';
import {
  defaultPersistenceStore,
  type GamePersistenceStore,
  type RoomConfigSettings,
} from '../persistence/index.js';

export type { RoomConfigSettings };

export const RECONNECT_GRACE_MS = 15_000;
export const MAX_TIMER_SECONDS = 180;
export const MEMBER_IDLE_MS = 90_000;
export const MAX_MEMBERS_PER_ROOM = 12;
export const MAX_ROOMS = 500;
export const ROOM_IDLE_TTL_MS = 2 * 60 * 60 * 1000;
export const BOT_REACTION_MIN_MS = 1_000;
export const BOT_REACTION_MAX_MS = 2_000;

export class RoomCapacityError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'RoomCapacityError';
  }
}

export const ALLOWED_EMOTES = ['☕', '👏', '😂', '🤔', '🎉', '🥐', '😅', '❤️'] as const;
export type AllowedEmote = (typeof ALLOWED_EMOTES)[number];

export const RoomConfigSchema = z.object({
  maxPlayers: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(4),
  botCount: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(0),
  botDifficulty: z.enum(['basic', 'medium', 'hard']).default('basic'),
  timerEnabled: z.boolean().default(false),
  timerSeconds: z.number().int().min(5).max(MAX_TIMER_SECONDS).default(60),
  allowNegativeScore: z.boolean().default(true),
});

export const MoveProposalSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('seat'),
    placements: z
      .array(
        z.object({
          tileId: z.string().min(1),
          seatId: z.string().min(1),
          jokerNation: z
            .enum(['af', 'it', 'ch', 'es', 'ru', 'in', 'am', 'al', 'tu', 'cu', 'en', 'fr'])
            .optional(),
        }),
      )
      .min(1)
      .max(2),
  }),
  z.object({
    type: z.literal('bar'),
    tileId: z.string().min(1),
  }),
  z.object({
    type: z.literal('swap'),
    seatId: z.string().min(1),
    tileId: z.string().min(1),
  }),
]);

export const ChatMessageSchema = z.object({
  text: z.string().trim().max(140).optional(),
  emote: z.enum(ALLOWED_EMOTES).optional(),
});

export type RoomMember = {
  playerId: string;
  token: string;
  nickname: string;
  avatarId: string;
  role: 'player' | 'spectator' | 'bot';
  connected: boolean;
  ready: boolean;
  isHost: boolean;
  kickedFromMatch: boolean;
  botDifficulty?: 'basic' | 'medium' | 'hard';
  rematchVote?: boolean;
  lastSeenAt: number;
};

export type EphemeralChatMessage = {
  id: string;
  senderId: string;
  nickname: string;
  avatarId?: string;
  text?: string;
  emote?: AllowedEmote;
  sentAt: number;
};

export type RoomSnapshot = {
  code: string;
  hostId: string;
  phase: 'lobby' | 'playing' | 'finished';
  config: RoomConfigSettings;
  members: (Omit<RoomMember, 'token' | 'lastSeenAt'> & { id: string })[];
  gameState: GameState | null;
  turnDeadlineAt: number | null;
  turnDeadlineMs: number | null;
  rematchVotes: Record<string, boolean>;
  chat: EphemeralChatMessage[];
};

export type ShareResultPayload = {
  roomCode: string;
  finishedAt: number;
  terminalReason: string;
  winners: string[];
  standings: (FinalScoreSummary & { nickname: string; isWinner: boolean })[];
};

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    const idx = randomInt(CODE_CHARS.length);
    code += CODE_CHARS[idx] ?? 'A';
  }
  return code;
}

export function generateSessionToken(): string {
  return `tok_${randomBytes(32).toString('base64url')}`;
}

function generatePlayerId(): string {
  return `p_${randomUUID().replace(/-/g, '')}`;
}

export function sanitizeNickname(raw: string): string {
  const cleaned = raw
    .replace(/[^\p{L}\p{N}_\- ]/gu, '')
    .trim()
    .slice(0, 20);
  return cleaned.length > 0 ? cleaned : 'Invitado';
}

export type RoomStateListener = (snapshot: RoomSnapshot, events: MoveEvent[]) => void;
export type ChatListener = (message: EphemeralChatMessage) => void;

/**
 * Authoritative room controller that manages lobby, configuration, bots,
 * spectators, 15s reconnection grace period, turn timer with automatic sensible play,
 * ephemeral chat (separate from turn log), unanimous rematch, and SQLite persistence.
 */
export class CafetuliaRoomController {
  public readonly code: string;
  private hostId: string;
  private phase: 'lobby' | 'playing' | 'finished' = 'lobby';
  private config: RoomConfigSettings;
  private readonly members = new Map<string, RoomMember>();
  private gameState: GameState | null = null;
  private turnDeadlineAt: number | null = null;
  private turnTimerHandle: ReturnType<typeof setTimeout> | null = null;
  private readonly reconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly store: GamePersistenceStore;
  private readonly stateListeners = new Set<RoomStateListener>();
  private readonly chatListeners = new Set<ChatListener>();
  private readonly ephemeralChat: EphemeralChatMessage[] = [];
  private readonly reconnectGraceMs: number;
  private seedOverride?: number | string;
  private lastActivityAt = Date.now();

  constructor(options: {
    code?: string;
    hostToken: string;
    hostNickname: string;
    hostAvatarId?: string;
    config?: Partial<RoomConfigSettings>;
    store?: GamePersistenceStore;
    reconnectGraceMs?: number;
    seed?: number | string;
  }) {
    this.code = (options.code ?? generateRoomCode()).toUpperCase();
    this.store = options.store ?? defaultPersistenceStore;
    this.reconnectGraceMs = options.reconnectGraceMs ?? RECONNECT_GRACE_MS;
    this.seedOverride = options.seed;

    const parsedConfig = RoomConfigSchema.parse(options.config ?? {});
    this.config = parsedConfig;

    const hostId = generatePlayerId();
    this.hostId = hostId;

    this.members.set(hostId, {
      playerId: hostId,
      token: options.hostToken,
      nickname: sanitizeNickname(options.hostNickname),
      avatarId: options.hostAvatarId || 'espresso',
      role: 'player',
      connected: true,
      ready: true,
      isHost: true,
      kickedFromMatch: false,
      lastSeenAt: Date.now(),
    });

    this.syncBotsInLobby();
    this.persistRoom();
  }

  public onStateChange(listener: RoomStateListener): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public onChatMessage(listener: ChatListener): () => void {
    this.chatListeners.add(listener);
    return () => {
      this.chatListeners.delete(listener);
    };
  }

  /**
   * The bag order, RNG state and seed are server-only while the match is live.
   * The client only needs the bag size, so placeholders preserve the length
   * without leaking the next tiles. Once the match is finished there is no
   * competitive advantage and the full state can be shown.
   */
  private getPublicGameState(): GameState | null {
    if (!this.gameState) return null;
    if (this.phase === 'finished') return this.gameState;

    const placeholders: GameState['bag'] = this.gameState.bag.map((_tile, index) => ({
      id: `hidden_bag_${index}`,
      nation: 'joker',
      gender: 'M',
    }));

    return {
      ...this.gameState,
      bag: placeholders,
      rngState: 0,
      seed: 0,
      log: this.gameState.log.map((event) =>
        event.type === 'game_started' ? { ...event, seed: 0 } : event,
      ),
    };
  }

  public getSnapshot(): RoomSnapshot {
    this.lastActivityAt = Date.now();
    const rematchVotes: Record<string, boolean> = {};
    const publicMembers: (Omit<RoomMember, 'token' | 'lastSeenAt'> & { id: string })[] = [];

    for (const m of this.members.values()) {
      const { token: _hiddenToken, lastSeenAt: _lastSeenAt, ...pub } = m;
      publicMembers.push({ ...pub, id: m.playerId });
      if (m.rematchVote !== undefined) {
        rematchVotes[m.playerId] = m.rematchVote;
      }
    }

    return {
      code: this.code,
      hostId: this.hostId,
      phase: this.phase,
      config: { ...this.config },
      members: publicMembers,
      gameState: this.getPublicGameState(),
      turnDeadlineAt: this.turnDeadlineAt,
      turnDeadlineMs: this.turnDeadlineAt,
      rematchVotes,
      chat: [...this.ephemeralChat],
    };
  }

  /**
   * Resolves the secret session token to the member that owns it.
   * The token is the only credential accepted by the HTTP API; public player ids
   * are never enough to act on behalf of a member.
   */
  public findMemberByToken(token: string | undefined): RoomMember | null {
    if (!token) return null;
    for (const member of this.members.values()) {
      if (member.role !== 'bot' && member.token === token) {
        const now = Date.now();
        member.lastSeenAt = now;
        this.lastActivityAt = now;
        if (!member.connected) {
          member.connected = true;
          const pendingTimer = this.reconnectTimers.get(member.playerId);
          if (pendingTimer) {
            clearTimeout(pendingTimer);
            this.reconnectTimers.delete(member.playerId);
          }
          if (this.gameState) {
            const gp = this.gameState.players.find((p) => p.id === member.playerId);
            if (gp) gp.connected = true;
          }
        }
        return member;
      }
    }
    return null;
  }

  /**
   * Handles a client joining or reconnecting using their device token and nickname.
   * - If the token matches an existing player within the 15s grace window, they reconnect seamlessly.
   * - If the player was already kicked after 15s, they rejoin strictly as a spectator.
   * - If the game is already in progress or full, new joiners enter as spectators.
   */
  public joinOrReconnect(params: {
    token: string;
    nickname: string;
    avatarId?: string;
    asSpectator?: boolean;
  }): { playerId: string; role: 'player' | 'spectator'; snapshot: RoomSnapshot } {
    const cleanName = sanitizeNickname(params.nickname);

    // Check existing member by token
    for (const member of this.members.values()) {
      if (member.token === params.token) {
        const pendingTimer = this.reconnectTimers.get(member.playerId);
        if (pendingTimer) {
          clearTimeout(pendingTimer);
          this.reconnectTimers.delete(member.playerId);
        }

        member.connected = true;
        member.nickname = cleanName;
        if (params.avatarId) {
          member.avatarId = params.avatarId;
        }

        // If they were kicked after 15s timeout, they can only return as spectator
        if (member.kickedFromMatch) {
          member.role = 'spectator';
        } else if (this.gameState) {
          const gp = this.gameState.players.find((p) => p.id === member.playerId);
          if (gp) {
            gp.connected = true;
            if (params.avatarId) gp.avatarId = params.avatarId;
          }
        }

        this.persistRoom();
        this.emitState([]);
        return {
          playerId: member.playerId,
          role: member.role === 'player' ? 'player' : 'spectator',
          snapshot: this.getSnapshot(),
        };
      }
    }

    if (this.members.size >= MAX_MEMBERS_PER_ROOM) {
      throw new RoomCapacityError('La sala está llena. Entra cuando se libere una silla.');
    }

    let playerId = generatePlayerId();
    while (this.members.has(playerId)) {
      playerId = generatePlayerId();
    }
    const activePlayerCount = Array.from(this.members.values()).filter(
      (m) => m.role === 'player' || m.role === 'bot',
    ).length;

    const canJoinAsPlayer =
      !params.asSpectator && this.phase === 'lobby' && activePlayerCount < this.config.maxPlayers;

    const role: 'player' | 'spectator' = canJoinAsPlayer ? 'player' : 'spectator';

    this.members.set(playerId, {
      playerId,
      token: params.token,
      nickname: cleanName,
      avatarId: params.avatarId || 'croissant',
      role,
      connected: true,
      ready: true,
      isHost: false,
      kickedFromMatch: false,
      lastSeenAt: Date.now(),
    });

    this.persistRoom();
    this.emitState([]);

    return {
      playerId,
      role,
      snapshot: this.getSnapshot(),
    };
  }

  public updateAvatar(playerId: string, avatarId: string): { ok: true; snapshot: RoomSnapshot } {
    const member = this.members.get(playerId);
    if (member && avatarId) {
      member.avatarId = avatarId;
      if (this.gameState) {
        const gp = this.gameState.players.find((p) => p.id === playerId);
        if (gp) gp.avatarId = avatarId;
      }
      this.persistRoom();
      this.emitState([]);
    }
    return { ok: true, snapshot: this.getSnapshot() };
  }

  public updateConfig(
    requesterId: string,
    partialConfig: Partial<RoomConfigSettings>,
  ): { ok: true; snapshot: RoomSnapshot } | { ok: false; message: string } {
    if (this.phase !== 'lobby') {
      return {
        ok: false,
        message: 'No se puede cambiar la configuración con la partida iniciada.',
      };
    }
    if (requesterId !== this.hostId) {
      return { ok: false, message: 'Solo el anfitrión puede configurar la sala.' };
    }

    const merged = { ...this.config, ...partialConfig };
    const parsed = RoomConfigSchema.safeParse(merged);
    if (!parsed.success) {
      return { ok: false, message: 'Configuración de sala inválida.' };
    }

    const humanPlayers = Array.from(this.members.values()).filter(
      (m) => m.role === 'player',
    ).length;
    if (humanPlayers + parsed.data.botCount > parsed.data.maxPlayers) {
      return {
        ok: false,
        message: 'La suma de jugadores humanos y bots supera el máximo de la sala.',
      };
    }

    this.config = parsed.data;
    this.syncBotsInLobby();
    this.persistRoom();
    this.emitState([]);

    return { ok: true, snapshot: this.getSnapshot() };
  }

  private syncBotsInLobby(): void {
    // Remove existing bots
    for (const [id, m] of this.members.entries()) {
      if (m.role === 'bot') {
        this.members.delete(id);
      }
    }

    const botNames = ['Barista Bot', 'Moka Bot', 'Expreso Bot'];
    const botAvatars = ['moka', 'gato', 'tetera'];
    for (let i = 0; i < this.config.botCount; i++) {
      const botId = `bot_${i + 1}`;
      this.members.set(botId, {
        playerId: botId,
        token: generateSessionToken(),
        nickname: botNames[i] ?? `Bot ${i + 1}`,
        avatarId: botAvatars[i] ?? 'moka',
        role: 'bot',
        connected: true,
        ready: true,
        isHost: false,
        kickedFromMatch: false,
        botDifficulty: this.config.botDifficulty,
        lastSeenAt: Date.now(),
      });
    }
  }

  public startGame(
    requesterId: string,
    seed?: number | string,
  ): { ok: true; snapshot: RoomSnapshot } | { ok: false; message: string } {
    if (this.phase !== 'lobby') {
      return { ok: false, message: 'La partida ya ha comenzado.' };
    }
    if (requesterId !== this.hostId) {
      return { ok: false, message: 'Solo el anfitrión puede iniciar la partida.' };
    }

    const seatedMembers = Array.from(this.members.values()).filter(
      (m) => m.role === 'player' || m.role === 'bot',
    );

    if (seatedMembers.length < 2 || seatedMembers.length > 4) {
      return { ok: false, message: 'Se necesitan entre 2 y 4 jugadores para empezar.' };
    }

    for (const m of this.members.values()) {
      m.rematchVote = undefined;
      m.kickedFromMatch = false;
    }

    const effectiveSeed = seed ?? this.seedOverride ?? Date.now();
    // Randomise the order of the table every match: it defines turn order and the
    // scoreboard order, independently of who joined the room first. The seed keeps
    // rematches/debug runs reproducible while still changing between matches.
    const tableOrder = shuffleWithRng(
      seatedMembers,
      normalizeSeed(`${effectiveSeed}:table-order`),
    ).items;
    this.gameState = createGame(
      {
        players: tableOrder.map((m) => ({
          id: m.playerId,
          nickname: m.nickname,
          avatarId: m.avatarId,
          isBot: m.role === 'bot',
          botDifficulty: m.botDifficulty,
        })),
      },
      effectiveSeed,
    );

    this.phase = 'playing';
    this.persistRoom();
    this.emitState(this.gameState.log);
    this.scheduleTurnProcessing();

    return { ok: true, snapshot: this.getSnapshot() };
  }

  /**
   * Authoritatively validates and applies a player's proposed move using @cafetulia/engine.
   */
  public submitMove(
    playerId: string,
    rawMove: unknown,
  ):
    | { ok: true; snapshot: RoomSnapshot; events: MoveEvent[] }
    | { ok: false; error: MoveValidationError } {
    if (!this.gameState || this.phase !== 'playing') {
      return {
        ok: false,
        error: { code: 'GAME_NOT_PLAYING', message: 'La partida no está en curso.' },
      };
    }

    const member = this.members.get(playerId);
    if (!member || member.role === 'spectator' || member.kickedFromMatch) {
      return {
        ok: false,
        error: {
          code: 'INVALID_PLAYER',
          message: 'Los espectadores no pueden realizar jugadas.',
        },
      };
    }

    const parsed = MoveProposalSchema.safeParse(rawMove);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          code: 'INVALID_PLACEMENT_COUNT',
          message: 'Formato de jugada inválido.',
        },
      };
    }

    const move = parsed.data as Move;
    const turnBefore = this.gameState.turnNumber;
    const result = applyMove(this.gameState, move, playerId);

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    this.clearTurnTimer();
    this.gameState = result.state;

    this.store.recordMoveEvent({
      roomCode: this.code,
      turnNumber: turnBefore,
      playerId,
      move,
      events: result.events,
    });

    if (this.gameState.phase === 'finished') {
      this.handleGameFinished();
    }

    this.persistRoom();
    this.emitState(result.events);

    if (this.phase === 'playing') {
      this.scheduleTurnProcessing();
    }

    return {
      ok: true,
      snapshot: this.getSnapshot(),
      events: result.events,
    };
  }

  /**
   * Handles a player disconnect and starts the 15-second reconnection timer.
   * After 15 seconds without reconnecting:
   * - Expels the player from active play.
   * - Returns their hand tiles to the bag.
   * - Keeps their seated guests on the board.
   * - Allows them to return as a spectator.
   */
  public handleDisconnect(playerId: string): void {
    const member = this.members.get(playerId);
    if (!member) return;

    member.connected = false;

    if (member.isHost) {
      const nextHost = Array.from(this.members.values()).find(
        (candidate) =>
          candidate.playerId !== member.playerId &&
          candidate.connected &&
          candidate.role === 'player',
      );
      if (nextHost) {
        member.isHost = false;
        nextHost.isHost = true;
        this.hostId = nextHost.playerId;
      }
    }

    if (this.phase !== 'playing' || member.role !== 'player' || member.kickedFromMatch) {
      this.emitState([]);
      return;
    }

    this.emitState([]);

    const existingTimer = this.reconnectTimers.get(playerId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.reconnectTimers.delete(playerId);
      this.expelDisconnectedPlayer(playerId);
    }, this.reconnectGraceMs);

    this.reconnectTimers.set(playerId, timer);
  }

  public leaveRoom(playerId: string): void {
    const member = this.members.get(playerId);
    if (!member) return;

    if (this.phase === 'lobby') {
      if (member.isHost) {
        const nextHost = Array.from(this.members.values()).find(
          (candidate) =>
            candidate.playerId !== member.playerId &&
            candidate.connected &&
            candidate.role === 'player',
        );
        if (nextHost) {
          nextHost.isHost = true;
          this.hostId = nextHost.playerId;
        }
      }
      this.members.delete(playerId);
      this.persistRoom();
      this.emitState([]);
      return;
    }

    this.handleDisconnect(playerId);
  }

  public memberCount(): number {
    return this.members.size;
  }

  public expelDisconnectedPlayer(playerId: string): void {
    const member = this.members.get(playerId);
    if (!member || member.connected || !this.gameState || this.phase !== 'playing') {
      return;
    }

    member.kickedFromMatch = true;
    member.role = 'spectator';

    const wasCurrentTurn = this.gameState.turn === playerId;
    if (wasCurrentTurn) {
      this.clearTurnTimer();
    }

    const kicked = kickDisconnectedPlayer(this.gameState, playerId);
    this.gameState = kicked.state;

    if (this.gameState.phase === 'finished') {
      this.handleGameFinished();
    }

    this.persistRoom();
    this.emitState(kicked.events);

    if (this.phase === 'playing' && wasCurrentTurn) {
      this.scheduleTurnProcessing();
    }
  }

  /**
   * Schedules a bot move with a short "thinking" pause, or the optional turn
   * timer (max 180s) for humans. When the timer expires, executes a sensible
   * automatic move and logs it in the event log (never in chat).
   */
  private scheduleTurnProcessing(): void {
    this.clearTurnTimer();

    if (!this.gameState || this.phase !== 'playing') {
      return;
    }

    const currentTurnPlayerId = this.gameState.turn;
    const currentMember = this.members.get(currentTurnPlayerId);

    if (currentMember?.role === 'bot') {
      const delayMs = randomInt(BOT_REACTION_MIN_MS, BOT_REACTION_MAX_MS + 1);
      this.turnTimerHandle = setTimeout(() => {
        this.turnTimerHandle = null;
        if (!this.gameState || this.phase !== 'playing') return;
        if (this.gameState.turn !== currentTurnPlayerId) return;

        const stillBot = this.members.get(currentTurnPlayerId);
        if (!stillBot || stillBot.role !== 'bot') return;

        const botMove = selectBotMove(
          this.gameState,
          currentTurnPlayerId,
          stillBot.botDifficulty ?? this.config.botDifficulty,
        );
        if (botMove) {
          this.submitMove(currentTurnPlayerId, botMove);
        }
      }, delayMs);
      return;
    }

    if (this.config.timerEnabled) {
      const durationMs = Math.min(MAX_TIMER_SECONDS, Math.max(1, this.config.timerSeconds)) * 1000;
      this.turnDeadlineAt = Date.now() + durationMs;
      this.turnTimerHandle = setTimeout(() => {
        this.executeTimeoutAutoMove();
      }, durationMs);
    } else {
      this.turnDeadlineAt = null;
    }
  }

  public executeTimeoutAutoMove(): void {
    if (!this.gameState || this.phase !== 'playing') {
      return;
    }

    const timedOutPlayerId = this.gameState.turn;
    const autoMove = selectSensibleAutoMove(this.gameState, timedOutPlayerId);
    if (!autoMove) {
      return;
    }

    const timeoutEvent: MoveEvent = {
      type: 'turn_timeout_auto_move',
      playerId: timedOutPlayerId,
      move: autoMove,
    };

    this.gameState.log.push(timeoutEvent);
    const res = this.submitMove(timedOutPlayerId, autoMove);
    if (res.ok) {
      this.emitState([timeoutEvent, ...res.events]);
    }
  }

  private clearTurnTimer(): void {
    if (this.turnTimerHandle) {
      clearTimeout(this.turnTimerHandle);
      this.turnTimerHandle = null;
    }
    this.turnDeadlineAt = null;
  }

  private handleGameFinished(): void {
    if (!this.gameState) return;
    this.phase = 'finished';
    this.clearTurnTimer();

    const summary = finalScores(this.gameState);
    this.store.recordMatchFinished({
      roomCode: this.code,
      winners: summary.winners,
      scores: summary.scores,
      players: this.gameState.players.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        isBot: p.isBot,
      })),
      terminalReason: this.gameState.terminalReason ?? 'last_seat_occupied',
    });
  }

  /**
   * Ephemeral text + emote chat channel.
   * Separate from turn event log and never persisted in the database.
   */
  public sendChatMessage(
    senderId: string,
    rawPayload: unknown,
  ): { ok: true; message: EphemeralChatMessage } | { ok: false; message: string } {
    const member = this.members.get(senderId);
    if (!member) {
      return { ok: false, message: 'Miembro no encontrado en la sala.' };
    }

    const parsed = ChatMessageSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return { ok: false, message: 'Mensaje de chat inválido.' };
    }

    const cleanText = parsed.data.text
      ?.replace(/\p{C}/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 140);
    if (!cleanText && !parsed.data.emote) {
      return { ok: false, message: 'Mensaje de chat inválido.' };
    }

    const chatMsg: EphemeralChatMessage = {
      id: `chat_${Date.now()}_${randomBytes(4).toString('hex')}`,
      senderId,
      nickname: member.nickname,
      avatarId: member.avatarId,
      text: cleanText,
      emote: parsed.data.emote,
      sentAt: Date.now(),
    };

    this.ephemeralChat.push(chatMsg);
    if (this.ephemeralChat.length > 50) {
      this.ephemeralChat.shift();
    }

    for (const listener of this.chatListeners) {
      listener(chatMsg);
    }

    return { ok: true, message: chatMsg };
  }

  public setPlayerReady(playerId: string, ready: boolean): void {
    const member = this.members.get(playerId);
    if (member && member.role === 'player') {
      member.ready = ready;
      this.emitState([]);
    }
  }

  public addBot(
    requesterId: string,
    difficulty: 'basic' | 'medium' | 'hard' = 'basic',
    _nickname?: string,
  ): { ok: true; botId: string } | { ok: false; message: string } {
    if (requesterId !== this.hostId) {
      return { ok: false, message: 'Solo el anfitrión puede añadir bots.' };
    }
    const nextCount = Math.min(3, this.config.botCount + 1) as 0 | 1 | 2 | 3;
    const res = this.updateConfig(requesterId, {
      botCount: nextCount,
      botDifficulty: difficulty,
    });
    if (!res.ok) {
      return res;
    }
    return { ok: true, botId: `bot_${nextCount}` };
  }

  public removeBot(
    requesterId: string,
    _botId: string,
  ): { ok: true } | { ok: false; message: string } {
    if (requesterId !== this.hostId) {
      return { ok: false, message: 'Solo el anfitrión puede quitar bots.' };
    }
    const nextCount = Math.max(0, this.config.botCount - 1) as 0 | 1 | 2 | 3;
    const res = this.updateConfig(requesterId, { botCount: nextCount });
    if (!res.ok) {
      return res;
    }
    return { ok: true };
  }

  /**
   * Unanimous rematch vote:
   * - If all connected human players vote `true`, a new game starts immediately.
   * - If any human player votes `false`, the room returns to the lobby ('lobby').
   */
  public voteRematch(
    playerId: string,
    vote: boolean,
  ):
    | { ok: true; outcome: 'waiting' | 'restarted' | 'returned_to_lobby'; snapshot: RoomSnapshot }
    | { ok: false; message: string } {
    if (this.phase !== 'finished') {
      return {
        ok: false,
        message: 'La votación de revancha solo está disponible al terminar la partida.',
      };
    }

    const member = this.members.get(playerId);
    if (!member || member.role !== 'player') {
      return { ok: false, message: 'Solo los jugadores activos pueden votar revancha.' };
    }

    member.rematchVote = vote;

    if (!vote) {
      // Any "no" vote returns the room to the lobby
      this.phase = 'lobby';
      this.gameState = null;
      for (const m of this.members.values()) {
        m.rematchVote = undefined;
      }
      this.persistRoom();
      this.emitState([]);
      return { ok: true, outcome: 'returned_to_lobby', snapshot: this.getSnapshot() };
    }

    const humanPlayers = Array.from(this.members.values()).filter(
      (m) => m.role === 'player' && m.connected,
    );

    const allVotedYes =
      humanPlayers.length > 0 && humanPlayers.every((m) => m.rematchVote === true);

    if (allVotedYes) {
      this.phase = 'lobby';
      this.startGame(this.hostId);
      return { ok: true, outcome: 'restarted', snapshot: this.getSnapshot() };
    }

    this.emitState([]);
    return { ok: true, outcome: 'waiting', snapshot: this.getSnapshot() };
  }

  /**
   * Returns structured match result data so the client can generate a shareable postcard image.
   */
  public getShareResultPayload(): ShareResultPayload | null {
    if (!this.gameState || this.phase !== 'finished') {
      return null;
    }

    const summary = finalScores(this.gameState);
    const standings = this.gameState.players
      .map((p) => {
        const s = summary.scores[p.id] ?? {
          playerId: p.id,
          tableAndBarScore: p.score,
          naturalTilesRemaining: 0,
          jokersRemaining: 0,
          handPenalty: 0,
          finalScore: p.score,
        };
        return {
          ...s,
          nickname: p.nickname,
          isWinner: summary.winners.includes(p.id),
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);

    return {
      roomCode: this.code,
      finishedAt: Date.now(),
      terminalReason: this.gameState.terminalReason ?? 'last_seat_occupied',
      winners: summary.winners,
      standings,
    };
  }

  private persistRoom(): void {
    this.store.saveRoom({
      code: this.code,
      hostId: this.hostId,
      phase: this.phase,
      config: this.config,
      state: this.gameState,
    });
  }

  private emitState(events: MoveEvent[]): void {
    const snap = this.getSnapshot();
    for (const listener of this.stateListeners) {
      listener(snap, events);
    }
  }

  /**
   * Marks silent human members as disconnected after a heartbeat gap and starts
   * the normal reconnection/expulsion flow. Runs periodically from the registry.
   */
  public sweepPresence(now: number = Date.now(), idleMs: number = MEMBER_IDLE_MS): void {
    for (const member of this.members.values()) {
      if (member.role === 'bot' || !member.connected) continue;
      if (now - member.lastSeenAt > idleMs) {
        this.handleDisconnect(member.playerId);
      }
    }
  }

  public isIdle(now: number = Date.now(), ttlMs: number = ROOM_IDLE_TTL_MS): boolean {
    return now - this.lastActivityAt > ttlMs;
  }

  public dispose(): void {
    this.clearTurnTimer();
    for (const timer of this.reconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.reconnectTimers.clear();
  }
}

export class RoomRegistry {
  private readonly rooms = new Map<string, CafetuliaRoomController>();
  private readonly store: GamePersistenceStore;

  constructor(store: GamePersistenceStore = defaultPersistenceStore) {
    this.store = store;
  }

  public createRoom(params: {
    hostToken: string;
    hostNickname: string;
    hostAvatarId?: string;
    config?: Partial<RoomConfigSettings>;
    reconnectGraceMs?: number;
    seed?: number | string;
  }): CafetuliaRoomController {
    if (this.rooms.size >= MAX_ROOMS) {
      throw new RoomCapacityError(
        'El café está lleno de mesas. Espera un momento o reinicia el servidor.',
      );
    }

    let code = generateRoomCode();
    while (this.rooms.has(code)) {
      code = generateRoomCode();
    }

    const controller = new CafetuliaRoomController({
      code,
      hostToken: params.hostToken,
      hostNickname: params.hostNickname,
      hostAvatarId: params.hostAvatarId,
      config: params.config,
      store: this.store,
      reconnectGraceMs: params.reconnectGraceMs,
      seed: params.seed,
    });

    this.rooms.set(code, controller);
    return controller;
  }

  public getRoom(code: string): CafetuliaRoomController | undefined {
    const normalized = code.toUpperCase();
    const room = this.rooms.get(normalized);
    if (room && room.isIdle()) {
      room.dispose();
      this.rooms.delete(normalized);
      return undefined;
    }
    return room;
  }

  public removeRoom(code: string): void {
    const normalized = code.toUpperCase();
    const room = this.rooms.get(normalized);
    if (!room) return;
    room.dispose();
    this.rooms.delete(normalized);
  }

  public sweepPresence(now: number = Date.now()): void {
    for (const [code, room] of this.rooms) {
      if (room.isIdle(now)) {
        room.dispose();
        this.rooms.delete(code);
        continue;
      }
      room.sweepPresence(now);
    }
  }

  public clearAll(): void {
    for (const room of this.rooms.values()) {
      room.dispose();
    }
    this.rooms.clear();
  }
}

export const defaultRoomRegistry = new RoomRegistry();
