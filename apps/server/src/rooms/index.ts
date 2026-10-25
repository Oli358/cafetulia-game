import colyseusPkg, { type Client } from 'colyseus';
import {
  CafetuliaRoomController,
  defaultRoomRegistry,
  type RoomConfigSettings,
} from './roomManager.js';

const { Room } = colyseusPkg;

export type JoinOptions = {
  code?: string;
  token?: string;
  nickname?: string;
  avatarId?: string;
  asSpectator?: boolean;
  config?: Partial<RoomConfigSettings>;
};

export class CafetuliaColyseusRoom extends Room {
  private controller!: CafetuliaRoomController;
  private readonly sessionToPlayerId = new Map<string, string>();
  private unsubscribeState?: () => void;
  private unsubscribeChat?: () => void;

  public override onCreate(options: JoinOptions): void {
    const existing = options.code ? defaultRoomRegistry.getRoom(options.code) : undefined;

    if (existing) {
      this.controller = existing;
    } else {
      this.controller = defaultRoomRegistry.createRoom({
        hostToken: options.token ?? `tok_${Date.now()}`,
        hostNickname: options.nickname ?? 'Anfitrión',
        hostAvatarId: options.avatarId,
        config: options.config,
      });
    }

    this.roomId = this.controller.code;

    this.unsubscribeState = this.controller.onStateChange((snapshot, events) => {
      this.broadcast('room_state', { snapshot, events });
    });

    this.unsubscribeChat = this.controller.onChatMessage((message) => {
      this.broadcast('chat_message', message);
    });

    this.onMessage('update_config', (client, payload: Partial<RoomConfigSettings>) => {
      const playerId = this.sessionToPlayerId.get(client.sessionId);
      if (!playerId) return;
      const res = this.controller.updateConfig(playerId, payload);
      if (!res.ok) {
        client.send('error_message', { code: 'CONFIG_ERROR', message: res.message });
      }
    });

    this.onMessage('update_avatar', (client, payload: { avatarId?: string }) => {
      const playerId = this.sessionToPlayerId.get(client.sessionId);
      if (!playerId || !payload?.avatarId) return;
      this.controller.updateAvatar(playerId, payload.avatarId);
    });

    this.onMessage('start_game', (client, payload?: { seed?: number | string }) => {
      const playerId = this.sessionToPlayerId.get(client.sessionId);
      if (!playerId) return;
      const res = this.controller.startGame(playerId, payload?.seed);
      if (!res.ok) {
        client.send('error_message', { code: 'START_ERROR', message: res.message });
      }
    });

    this.onMessage('propose_move', (client, payload: unknown) => {
      const playerId = this.sessionToPlayerId.get(client.sessionId);
      if (!playerId) return;
      const res = this.controller.submitMove(playerId, payload);
      if (!res.ok) {
        client.send('move_rejected', res.error);
      }
    });

    this.onMessage('chat', (client, payload: unknown) => {
      const playerId = this.sessionToPlayerId.get(client.sessionId);
      if (!playerId) return;
      const res = this.controller.sendChatMessage(playerId, payload);
      if (!res.ok) {
        client.send('error_message', { code: 'CHAT_ERROR', message: res.message });
      }
    });

    this.onMessage('vote_rematch', (client, payload: { vote?: boolean }) => {
      const playerId = this.sessionToPlayerId.get(client.sessionId);
      if (!playerId) return;
      const res = this.controller.voteRematch(playerId, Boolean(payload?.vote));
      if (!res.ok) {
        client.send('error_message', { code: 'REMATCH_ERROR', message: res.message });
      }
    });
  }

  public override onJoin(client: Client, options: JoinOptions): void {
    const token = options.token ?? client.sessionId;
    const nickname = options.nickname ?? 'Invitado';

    const joined = this.controller.joinOrReconnect({
      token,
      nickname,
      avatarId: options.avatarId,
      asSpectator: options.asSpectator,
    });

    this.sessionToPlayerId.set(client.sessionId, joined.playerId);
    client.send('joined_room', {
      playerId: joined.playerId,
      role: joined.role,
      snapshot: joined.snapshot,
    });
  }

  public override onLeave(client: Client, _consented: boolean): void {
    const playerId = this.sessionToPlayerId.get(client.sessionId);
    this.sessionToPlayerId.delete(client.sessionId);
    if (playerId) {
      this.controller.handleDisconnect(playerId);
    }
  }

  public override onDispose(): void {
    this.unsubscribeState?.();
    this.unsubscribeChat?.();
  }
}

export * from './roomManager.js';
