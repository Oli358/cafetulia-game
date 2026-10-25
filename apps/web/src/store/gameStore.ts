import { create } from 'zustand';
import type {
  GameState,
  Move,
  Nation,
  Placement,
  TerminalReason,
  FinalScoreSummary,
} from '@cafetulia/engine';
import { soundEngine } from '../audio/soundEngine';
import { recordFinishedGameLocally, type LocalPlayerStats, loadLocalStats } from '../utils/moveHelper';

export type RoomMemberInfo = {
  id: string;
  nickname: string;
  avatarId: string;
  role: 'player' | 'bot' | 'spectator';
  botDifficulty?: 'basic' | 'medium' | 'hard';
  connected: boolean;
  ready: boolean;
  rematchVote: boolean | null;
  disconnectDeadlineMs: number | null;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  nickname: string;
  avatarId?: string;
  text?: string;
  emote?: string;
  sentAt: number;
};

export type RoomConfigSettings = {
  maxPlayers: 2 | 3 | 4;
  botCount: 0 | 1 | 2 | 3;
  botDifficulty: 'basic' | 'medium' | 'hard';
  timerEnabled: boolean;
  timerSeconds: number;
  allowNegativeScore: boolean;
};

export type RoomSnapshot = {
  code: string;
  hostId: string;
  phase: 'lobby' | 'playing' | 'finished';
  config: RoomConfigSettings;
  members: RoomMemberInfo[];
  turnDeadlineMs: number | null;
  chat: ChatMessage[];
  gameState: GameState | null;
};

export type ShareResultPayload = {
  roomCode: string;
  finishedAt: number;
  terminalReason: TerminalReason;
  winners: string[];
  standings: Array<FinalScoreSummary & { nickname: string; isWinner: boolean }>;
};

export type MatchHistoryEntry = {
  id: number;
  roomCode: string;
  finishedAt: number;
  terminalReason: string;
  winners: string[];
  scores: Record<string, FinalScoreSummary>;
  players: Array<{ id: string; nickname: string; isBot: boolean }>;
};

export type ActiveModal = 'rules' | 'tutorial' | 'stats' | 'settings' | 'ios_pwa' | null;

type CafetuliaClientState = {
  nickname: string;
  avatarId: string;
  guestToken: string;
  screen: 'title' | 'lobby' | 'playing' | 'finished';
  activeModal: ActiveModal;
  roomCode: string | null;
  myPlayerId: string | null;
  myRole: 'player' | 'spectator';
  snapshot: RoomSnapshot | null;
  shareResult: ShareResultPayload | null;
  recentMatches: MatchHistoryEntry[];
  localStats: LocalPlayerStats;
  errorBanner: string | null;
  whyCannotBanner: string | null;
  isBusy: boolean;

  // Interactive turn state
  selectedTileId: string | null;
  draftPlacements: Placement[];
  preferredJokerNation: Nation | undefined;
  focusedTableId: string | null;
  pendingNegativeConfirm: {
    move: Move;
    points: number;
    description: string;
  } | null;

  // Camera & Accessibility settings
  viewMode: '3d' | '2d';
  cameraAngleIndex: 0 | 1 | 2 | 3;
  cameraZoom: number;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  nightMode: boolean;
  contextualHints: boolean;
  eventSubtitles: boolean;

  // Actions
  setNickname: (name: string) => void;
  setAvatarId: (avatarId: string) => Promise<void>;
  setActiveModal: (modal: ActiveModal) => void;
  setErrorBanner: (msg: string | null) => void;
  setWhyCannotBanner: (msg: string | null) => void;
  setViewMode: (mode: '3d' | '2d') => void;
  cycleCameraAngle: () => void;
  resetCamera: () => void;
  setCameraZoom: (zoom: number) => void;
  setFocusedTableId: (tableId: string | null) => void;
  toggleSetting: (
    key:
      | 'reducedMotion'
      | 'highContrast'
      | 'largeText'
      | 'nightMode'
      | 'contextualHints'
      | 'eventSubtitles',
  ) => void;

  // Hand & board selection actions
  selectTile: (tileId: string | null) => void;
  setPreferredJokerNation: (nation: Nation | undefined) => void;
  clearDraft: () => void;
  addDraftPlacement: (placement: Placement) => void;
  setPendingNegativeConfirm: (
    pending: { move: Move; points: number; description: string } | null,
  ) => void;

  // Server room actions
  createRoom: (customConfig?: Partial<RoomConfigSettings>) => Promise<boolean>;
  joinRoom: (code: string, asSpectator?: boolean) => Promise<boolean>;
  quickStartWithBots: (botCount?: number, difficulty?: 'basic' | 'medium' | 'hard') => Promise<boolean>;
  updateRoomConfig: (patch: Partial<RoomConfigSettings>) => Promise<void>;
  toggleReady: (ready: boolean) => Promise<void>;
  addBot: (difficulty: 'basic' | 'medium' | 'hard') => Promise<void>;
  removeBot: (botId: string) => Promise<void>;
  startGame: () => Promise<boolean>;
  submitMove: (move: Move) => Promise<boolean>;
  sendChat: (text: string, isEmote?: boolean) => Promise<void>;
  voteRematch: (accept: boolean) => Promise<void>;
  pollRoom: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  leaveRoom: () => void;
};

function getInitialToken(): string {
  if (typeof window === 'undefined') return 'tok_default_guest';
  try {
    const existing = window.localStorage.getItem('cafetulia_guest_token');
    if (existing && existing.length >= 6) return existing;
    const created = `tok_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
    window.localStorage.setItem('cafetulia_guest_token', created);
    return created;
  } catch {
    return `tok_${Date.now().toString(36)}_guest`;
  }
}

function getInitialNickname(): string {
  if (typeof window === 'undefined') return 'Cafetero';
  try {
    return window.localStorage.getItem('cafetulia_nickname') || 'Cafetero';
  } catch {
    return 'Cafetero';
  }
}

function getInitialAvatarId(): string {
  if (typeof window === 'undefined') return 'moka';
  try {
    return window.localStorage.getItem('cafetulia_avatar_id') || 'moka';
  } catch {
    return 'moka';
  }
}

function getInitialEventSubtitles(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const saved = window.localStorage.getItem('cafetulia_event_subtitles');
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

export const useGameStore = create<CafetuliaClientState>((set, get) => ({
  nickname: getInitialNickname(),
  avatarId: getInitialAvatarId(),
  guestToken: getInitialToken(),
  screen: 'title',
  activeModal: null,
  roomCode: null,
  myPlayerId: null,
  myRole: 'player',
  snapshot: null,
  shareResult: null,
  recentMatches: [],
  localStats: loadLocalStats(),
  errorBanner: null,
  whyCannotBanner: null,
  isBusy: false,

  selectedTileId: null,
  draftPlacements: [],
  preferredJokerNation: undefined,
  focusedTableId: null,
  pendingNegativeConfirm: null,

  viewMode: '3d',
  cameraAngleIndex: 0,
  cameraZoom: 1.0,
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  nightMode: false,
  contextualHints: true,
  eventSubtitles: getInitialEventSubtitles(),

  setNickname: (name: string) => {
    const clean = name.slice(0, 26);
    set({ nickname: clean });
    try {
      window.localStorage.setItem('cafetulia_nickname', clean);
    } catch {
      // ignore
    }
  },

  setAvatarId: async (avatarId: string) => {
    const clean = avatarId.trim().slice(0, 24) || 'moka';
    set({ avatarId: clean });
    try {
      window.localStorage.setItem('cafetulia_avatar_id', clean);
    } catch {
      // ignore
    }
    const { roomCode, myPlayerId } = get();
    if (roomCode && myPlayerId) {
      try {
        const res = await fetch(`/rooms/${roomCode}/avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: myPlayerId, avatarId: clean }),
        });
        const data = await res.json();
        if (res.ok && data.snapshot) {
          set({ snapshot: data.snapshot });
        }
      } catch {
        // ignore transient network errors
      }
    }
  },

  setActiveModal: (modal) => set({ activeModal: modal }),
  setErrorBanner: (msg) => set({ errorBanner: msg }),
  setWhyCannotBanner: (msg) => set({ whyCannotBanner: msg }),
  setViewMode: (mode) => set({ viewMode: mode }),
  cycleCameraAngle: () =>
    set((s) => ({
      cameraAngleIndex: ((s.cameraAngleIndex + 1) % 4) as 0 | 1 | 2 | 3,
    })),
  resetCamera: () => set({ cameraAngleIndex: 0, cameraZoom: 1.0, focusedTableId: null }),
  setCameraZoom: (zoom) =>
    set({ cameraZoom: Math.min(1.6, Math.max(0.8, Number(zoom.toFixed(2)))) }),
  setFocusedTableId: (tableId) =>
    set((s) => ({
      focusedTableId: tableId,
      cameraZoom: tableId ? 1.35 : s.focusedTableId ? 1.0 : s.cameraZoom,
    })),

  toggleSetting: (key) =>
    set((s) => {
      const nextVal = !s[key];
      if (key === 'eventSubtitles') {
        try {
          window.localStorage.setItem('cafetulia_event_subtitles', String(nextVal));
        } catch {
          // ignore
        }
      }
      return { [key]: nextVal };
    }),

  selectTile: (tileId) => {
    soundEngine.playSfx('cardSelect');
    set({
      selectedTileId: tileId,
      whyCannotBanner: null,
    });
  },

  setPreferredJokerNation: (nation) => set({ preferredJokerNation: nation }),

  clearDraft: () =>
    set({
      selectedTileId: null,
      draftPlacements: [],
      preferredJokerNation: undefined,
      whyCannotBanner: null,
      pendingNegativeConfirm: null,
    }),

  addDraftPlacement: (placement) => {
    soundEngine.playSfx('chairSlide');
    set((s) => ({
      draftPlacements: [...s.draftPlacements, placement],
      selectedTileId: null,
      whyCannotBanner: null,
    }));
  },

  setPendingNegativeConfirm: (pending) => set({ pendingNegativeConfirm: pending }),

  createRoom: async (customConfig) => {
    const { nickname, avatarId, guestToken } = get();
    const trimmed = nickname.trim() || 'Anfitrión';
    set({ isBusy: true, errorBanner: null });
    try {
      const res = await fetch('/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: trimmed,
          avatarId,
          token: guestToken,
          config: customConfig,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isBusy: false, errorBanner: data.message ?? 'No se pudo crear la sala.' });
        return false;
      }
      soundEngine.playSfx('bell');
      set({
        isBusy: false,
        roomCode: data.code,
        myPlayerId: data.hostId,
        myRole: 'player',
        snapshot: data.snapshot,
        screen: data.snapshot.phase === 'playing' ? 'playing' : 'lobby',
      });
      return true;
    } catch {
      set({ isBusy: false, errorBanner: 'Error de conexión con el servidor.' });
      return false;
    }
  },

  joinRoom: async (code, asSpectator = false) => {
    const { nickname, avatarId, guestToken } = get();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      set({ errorBanner: 'Introduce un código de sala válido.' });
      return false;
    }
    set({ isBusy: true, errorBanner: null });
    try {
      const res = await fetch(`/rooms/${cleanCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim() || 'Invitado',
          avatarId,
          token: guestToken,
          asSpectator,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isBusy: false, errorBanner: data.message ?? 'Sala no encontrada.' });
        return false;
      }
      soundEngine.playSfx('bell');
      const phase = data.snapshot.phase as 'lobby' | 'playing' | 'finished';
      set({
        isBusy: false,
        roomCode: cleanCode,
        myPlayerId: data.playerId,
        myRole: data.role,
        snapshot: data.snapshot,
        screen: phase,
      });
      return true;
    } catch {
      set({ isBusy: false, errorBanner: 'No se pudo conectar a la sala.' });
      return false;
    }
  },

  quickStartWithBots: async (botCount = 1, difficulty = 'medium') => {
    const clampedMax = Math.min(4, Math.max(2, botCount + 1)) as 2 | 3 | 4;
    const created = await get().createRoom({
      maxPlayers: clampedMax,
      botCount: Math.min(3, Math.max(0, botCount)) as 0 | 1 | 2 | 3,
      botDifficulty: difficulty,
      timerEnabled: false,
      timerSeconds: 60,
      allowNegativeScore: true,
    });
    if (!created) return false;
    return await get().startGame();
  },

  updateRoomConfig: async (patch) => {
    const { roomCode, myPlayerId } = get();
    if (!roomCode || !myPlayerId) return;
    const res = await fetch(`/rooms/${roomCode}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: myPlayerId, config: patch }),
    });
    const data = await res.json();
    if (res.ok && data.snapshot) {
      set({ snapshot: data.snapshot });
    }
  },

  toggleReady: async (ready) => {
    const { roomCode, myPlayerId } = get();
    if (!roomCode || !myPlayerId) return;
    const res = await fetch(`/rooms/${roomCode}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: myPlayerId, ready }),
    });
    const data = await res.json();
    if (res.ok && data.snapshot) {
      set({ snapshot: data.snapshot });
    }
  },

  addBot: async (difficulty) => {
    const { roomCode, myPlayerId } = get();
    if (!roomCode || !myPlayerId) return;
    const res = await fetch(`/rooms/${roomCode}/bots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: myPlayerId, difficulty }),
    });
    const data = await res.json();
    if (res.ok && data.snapshot) {
      set({ snapshot: data.snapshot });
    } else if (data.message) {
      set({ errorBanner: data.message });
    }
  },

  removeBot: async (botId) => {
    const { roomCode, myPlayerId } = get();
    if (!roomCode || !myPlayerId) return;
    const res = await fetch(`/rooms/${roomCode}/bots/${botId}?playerId=${myPlayerId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (res.ok && data.snapshot) {
      set({ snapshot: data.snapshot });
    }
  },

  startGame: async () => {
    const { roomCode, myPlayerId } = get();
    if (!roomCode || !myPlayerId) return false;
    const res = await fetch(`/rooms/${roomCode}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: myPlayerId }),
    });
    const data = await res.json();
    if (!res.ok) {
      set({ errorBanner: data.message ?? 'No se pudo iniciar la partida.' });
      return false;
    }
    soundEngine.playSfx('bell');
    set({
      snapshot: data.snapshot,
      screen: data.snapshot.phase,
      selectedTileId: null,
      draftPlacements: [],
      errorBanner: null,
    });
    return true;
  },

  submitMove: async (move) => {
    const { roomCode, myPlayerId } = get();
    if (!roomCode || !myPlayerId) return false;
    const res = await fetch(`/rooms/${roomCode}/moves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: myPlayerId, move }),
    });
    const data = await res.json();
    if (!res.ok) {
      set({
        errorBanner: data.error?.message ?? 'Jugada inválida.',
      });
      return false;
    }

    const snap = data.snapshot as RoomSnapshot;
    const recentEvents = snap.gameState?.log.slice(-4) ?? [];
    const hasPure = recentEvents.some(
      (ev) => ev.type === 'tile_seated' && ev.pureTablesCompleted > 0,
    );
    const barEv = recentEvents.find(
      (ev): ev is Extract<typeof ev, { type: 'tile_bar' }> => ev.type === 'tile_bar',
    );
    if (hasPure) {
      soundEngine.playSfx('pureTableToast');
    } else if (barEv && barEv.pointsDelta < 0) {
      soundEngine.playSfx('barNegative');
    } else if (barEv) {
      soundEngine.playSfx('barPositive');
    } else {
      soundEngine.playSfx('tilePlace');
    }

    let nextLocalStats = get().localStats;
    if (snap.phase === 'finished' && snap.gameState) {
      soundEngine.playSfx('victoryFanfare');
      void get().pollRoom();
      const winners =
        get().shareResult?.winners ??
        snap.gameState.players
          .slice()
          .sort((a, b) => b.score - a.score)
          .slice(0, 1)
          .map((p) => p.id);
      nextLocalStats = recordFinishedGameLocally(snap.gameState, myPlayerId, winners);
    }

    set({
      snapshot: snap,
      screen: snap.phase,
      selectedTileId: null,
      draftPlacements: [],
      preferredJokerNation: undefined,
      pendingNegativeConfirm: null,
      errorBanner: null,
      whyCannotBanner: null,
      localStats: nextLocalStats,
    });
    return true;
  },

  sendChat: async (text, isEmote = false) => {
    const { roomCode, myPlayerId } = get();
    if (!roomCode || !myPlayerId || !text.trim()) return;
    const res = await fetch(`/rooms/${roomCode}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: myPlayerId, text, isEmote }),
    });
    const data = await res.json();
    if (res.ok && data.snapshot) {
      set({ snapshot: data.snapshot });
    }
  },

  voteRematch: async (accept) => {
    const { roomCode, myPlayerId } = get();
    if (!roomCode || !myPlayerId) return;
    const res = await fetch(`/rooms/${roomCode}/rematch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: myPlayerId, accept }),
    });
    const data = await res.json();
    if (res.ok && data.snapshot) {
      set({
        snapshot: data.snapshot,
        screen: data.snapshot.phase,
        selectedTileId: null,
        draftPlacements: [],
      });
    }
  },

  pollRoom: async () => {
    const { roomCode, screen } = get();
    if (!roomCode || screen === 'title') return;
    try {
      const res = await fetch(`/rooms/${roomCode}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.snapshot) {
        const nextPhase = data.snapshot.phase as 'lobby' | 'playing' | 'finished';
        set({
          snapshot: data.snapshot,
          shareResult: data.shareResult ?? null,
          screen: nextPhase,
        });
      }
    } catch {
      // ignore transient network errors during poll
    }
  },

  fetchHistory: async () => {
    try {
      const res = await fetch('/history');
      if (!res.ok) return;
      const data = await res.json();
      set({ recentMatches: data.matches ?? [], localStats: loadLocalStats() });
    } catch {
      // ignore
    }
  },

  leaveRoom: () =>
    set({
      screen: 'title',
      roomCode: null,
      myPlayerId: null,
      snapshot: null,
      shareResult: null,
      selectedTileId: null,
      draftPlacements: [],
      focusedTableId: null,
      errorBanner: null,
      whyCannotBanner: null,
      pendingNegativeConfirm: null,
    }),
}));
