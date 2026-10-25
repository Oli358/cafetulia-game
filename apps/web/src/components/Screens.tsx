import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  finalScores,
  getLegalMoves,
  type Nation,
  type Seat,
  type Table,
  type Tile,
} from '@cafetulia/engine';
import {
  getCharacterProfile,
  NATION_VISUALS,
  PRESET_AVATARS,
  type NationKey,
} from '@cafetulia/ui';
import { soundEngine } from '../audio/soundEngine';
import {
  CafetuliaLogo,
  CharacterPortrait,
  FlagBadge,
  PlayerAvatar,
} from '../art/CharacterPortrait';
import { useGameStore } from '../store/gameStore';
import {
  evaluateDraftPlacements,
  inspectSeatsForSelectedTile,
} from '../utils/moveHelper';
import {
  AnimatedScore,
  CoinChip,
  CoinTray,
  FlyingCoinsLayer,
  type CoinFlightEvent,
} from './CoinTray';
import { IllustratedBoard, type ChairToastInfo } from './IllustratedBoard';

const PapercraftBoard = lazy(() =>
  import('./PapercraftBoard').then((module) => ({ default: module.PapercraftBoard })),
);

export type ArcadeCalloutEvent = {
  id: string;
  title: string;
  subtitle: string;
  tone: 'gold' | 'green' | 'red' | 'blue';
};

export function TitleScreen(): React.ReactElement {
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const avatarId = useGameStore((s) => s.avatarId);
  const setAvatarId = useGameStore((s) => s.setAvatarId);
  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const quickStartWithBots = useGameStore((s) => s.quickStartWithBots);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const errorBanner = useGameStore((s) => s.errorBanner);
  const isBusy = useGameStore((s) => s.isBusy);

  const [joinCodeInput, setJoinCodeInput] = useState('');

  return (
    <div
      className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between px-3 py-2.5 sm:px-6 sm:py-5 max-w-4xl mx-auto select-none"
      data-testid="title-screen"
    >
      {/* Top compact header: Logo + 1 short phrase */}
      <header className="shrink-0 flex flex-col items-center text-center pt-0.5 sm:pt-2">
        <CafetuliaLogo />
        <p className="text-xs sm:text-sm text-[#6F5A4E] font-medium mt-1">
          Sienta parejas de 12 países en las mesas sin llenar la barra central.
        </p>
      </header>

      {/* Main Direct Card: Nickname + Preset Avatar Picker + Direct Action Buttons */}
      <div className="my-auto w-full max-w-xl mx-auto bg-[#FFF9F0] p-3.5 sm:p-5 rounded-[22px] border border-[#3E2F2A]/15 shadow-[0_8px_24px_rgba(62,47,42,0.1)] space-y-3">
        {/* Profile row: Current avatar + Nickname input */}
        <div className="flex items-center gap-2.5">
          <div className="shrink-0 p-1 rounded-2xl bg-[#F7EEDF] border border-[#3E2F2A]/15">
            <PlayerAvatar avatarId={avatarId} size={40} />
          </div>
          <div className="flex-1 min-w-0">
            <label
              htmlFor="nickname-input"
              className="block text-[11px] font-bold text-[#6F5A4E] mb-0.5"
            >
              Tu nombre y avatar
            </label>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Tu apodo"
              maxLength={24}
              className="w-full h-9 sm:h-10 px-3 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/25 text-sm text-[#3E2F2A] font-bold focus:outline-2 focus:outline-[#C96F4A]"
            />
          </div>
        </div>

        {/* Preset Avatars Strip (16 selectable avatars, scrollable horizontally on small screens) */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5"
          role="radiogroup"
          aria-label="Elige tu avatar"
          data-testid="title-avatar-picker"
        >
          {PRESET_AVATARS.map((av) => {
            const active = avatarId === av.id;
            return (
              <button
                key={av.id}
                type="button"
                role="radio"
                aria-checked={active}
                data-testid={`avatar-option-${av.id}`}
                onClick={() => void setAvatarId(av.id)}
                title={av.label}
                className={`shrink-0 p-1 rounded-xl border transition-transform cursor-pointer ${
                  active
                    ? 'bg-[#FEF6E0] border-[#C96F4A] ring-2 ring-[#C96F4A] scale-105'
                    : 'bg-[#F7EEDF]/70 border-[#3E2F2A]/10 hover:bg-[#F7EEDF]'
                }`}
              >
                <PlayerAvatar avatarId={av.id} size={26} />
              </button>
            );
          })}
        </div>

        {errorBanner && (
          <div
            role="alert"
            className="p-2 rounded-xl bg-[#FDECEB] border border-[#A94438]/30 text-xs font-semibold text-[#A94438]"
          >
            {errorBanner}
          </div>
        )}

        {/* Primary Play Buttons: "Jugar contra bot" & "Crear sala" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            data-start="true"
            data-testid="quick-start-btn"
            disabled={isBusy}
            onClick={() => {
              soundEngine.unlock();
              void quickStartWithBots(1, 'medium');
            }}
            className="w-full h-11 rounded-xl bg-[#C96F4A] text-[#FFF9F0] font-bold text-sm sm:text-base shadow-xs hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
          >
            Jugar contra bot
          </button>

          <button
            type="button"
            data-testid="create-room-btn"
            disabled={isBusy}
            onClick={() => {
              soundEngine.unlock();
              void createRoom();
            }}
            className="w-full h-11 rounded-xl bg-[#F7EEDF] text-[#3E2F2A] border border-[#3E2F2A]/25 font-bold text-sm hover:bg-[#EAD9C0] transition-colors cursor-pointer disabled:opacity-50"
          >
            Crear sala
          </button>
        </div>

        {/* Join Room Form: "Unirse" */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            soundEngine.unlock();
            void joinRoom(joinCodeInput, false);
          }}
          className="flex gap-2 pt-0.5"
        >
          <input
            id="room-code-input"
            type="text"
            aria-label="Código de sala"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
            placeholder="CÓDIGO DE SALA"
            maxLength={8}
            className="flex-1 h-10 px-3 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/25 text-xs sm:text-sm text-[#3E2F2A] font-mono font-bold uppercase tracking-wider focus:outline-2 focus:outline-[#C96F4A]"
          />
          <button
            type="submit"
            data-testid="join-room-btn"
            disabled={isBusy}
            className="px-5 h-10 rounded-xl bg-[#3F5E4A] text-[#FFF9F0] font-bold text-xs sm:text-sm hover:opacity-95 cursor-pointer disabled:opacity-50"
          >
            Unirse
          </button>
        </form>

        {/* Secondary Direct Buttons: "Tutorial", "Reglas", "Ajustes" */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#3E2F2A]/10">
          <button
            type="button"
            data-testid="title-tutorial-btn"
            onClick={() => setActiveModal('tutorial')}
            className="h-9 rounded-xl bg-[#F7EEDF] text-xs font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            Tutorial
          </button>
          <button
            type="button"
            data-testid="title-rules-btn"
            onClick={() => setActiveModal('rules')}
            className="h-9 rounded-xl bg-[#F7EEDF] text-xs font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            Reglas
          </button>
          <button
            type="button"
            data-testid="title-settings-btn"
            onClick={() => setActiveModal('settings')}
            className="h-9 rounded-xl bg-[#F7EEDF] text-xs font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            Ajustes
          </button>
        </div>
      </div>

      {/* Minimal footer */}
      <footer className="shrink-0 text-center text-[11px] text-[#6F5A4E] pb-0.5">
        2–4 jugadores · Manos públicas · Pulsa Enter para empezar
      </footer>
    </div>
  );
}

export function LobbyScreen(): React.ReactElement {
  const snapshot = useGameStore((s) => s.snapshot);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const avatarId = useGameStore((s) => s.avatarId);
  const setAvatarId = useGameStore((s) => s.setAvatarId);
  const updateRoomConfig = useGameStore((s) => s.updateRoomConfig);
  const toggleReady = useGameStore((s) => s.toggleReady);
  const addBot = useGameStore((s) => s.addBot);
  const removeBot = useGameStore((s) => s.removeBot);
  const startGame = useGameStore((s) => s.startGame);
  const leaveRoom = useGameStore((s) => s.leaveRoom);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const errorBanner = useGameStore((s) => s.errorBanner);

  const [copied, setCopied] = useState(false);
  const [botDiff, setBotDiff] = useState<'basic' | 'medium' | 'hard'>('medium');

  if (!snapshot) return <div />;

  const isHost = snapshot.hostId === myPlayerId;
  const me = snapshot.members.find((m) => m.id === myPlayerId);
  const activeSeatMembers = snapshot.members.filter(
    (m) => m.role === 'player' || m.role === 'bot',
  );

  const copyInvite = () => {
    const url = `${window.location.origin}/?room=${snapshot.code}`;
    void navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden p-2.5 sm:p-6 max-w-4xl mx-auto flex flex-col justify-center select-none"
      data-testid="lobby-screen"
    >
      <div className="bg-[#FFF9F0] rounded-[22px] border border-[#3E2F2A]/15 p-3.5 sm:p-6 shadow-[0_8px_24px_rgba(62,47,42,0.12)] flex flex-col justify-between max-h-[95dvh] overflow-hidden space-y-3">
        {/* Top Lobby Bar */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-[#3E2F2A]/10 pb-2.5">
          <div>
            <span className="text-[11px] font-bold text-[#6F5A4E]">Sala</span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#3E2F2A] leading-none">
              #{snapshot.code}
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={copyInvite}
              className="px-3 py-1.5 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/20 text-xs font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
            >
              {copied ? '✓ Copiado' : 'Invitar'}
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('settings')}
              className="px-3 py-1.5 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/15 text-xs font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
            >
              Ajustes
            </button>
            <button
              type="button"
              onClick={leaveRoom}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#A94438] hover:bg-[#FDECEB] cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>

        {errorBanner && (
          <div
            role="alert"
            className="shrink-0 p-2 rounded-xl bg-[#FDECEB] border border-[#A94438]/30 text-xs font-semibold text-[#A94438]"
          >
            {errorBanner}
          </div>
        )}

        {/* Quick Avatar Switcher in Lobby */}
        <div className="shrink-0 flex items-center gap-2 bg-[#F7EEDF] px-3 py-1.5 rounded-xl">
          <span className="text-[11px] font-bold text-[#6F5A4E] shrink-0">Tu avatar:</span>
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {PRESET_AVATARS.map((av) => {
              const active = avatarId === av.id;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => void setAvatarId(av.id)}
                  title={av.label}
                  className={`shrink-0 p-0.5 rounded-lg border cursor-pointer ${
                    active
                      ? 'bg-[#FFF9F0] border-[#C96F4A] ring-1 ring-[#C96F4A]'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <PlayerAvatar avatarId={av.id} size={22} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Center 2-column grid: Players + Short Options */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-0.5">
          {/* Players column */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-base">
                Jugadores ({activeSeatMembers.length}/{snapshot.config.maxPlayers})
              </h2>
              {isHost && activeSeatMembers.length < snapshot.config.maxPlayers && (
                <div className="flex items-center gap-1">
                  <select
                    aria-label="Nivel del bot"
                    value={botDiff}
                    onChange={(e) => setBotDiff(e.target.value as 'basic' | 'medium' | 'hard')}
                    className="h-8 px-2 rounded-lg bg-[#F7EEDF] border border-[#3E2F2A]/20 text-xs font-semibold"
                  >
                    <option value="basic">Básico</option>
                    <option value="medium">Medio</option>
                    <option value="hard">Difícil</option>
                  </select>
                  <button
                    type="button"
                    data-testid="add-bot-btn"
                    onClick={() => void addBot(botDiff)}
                    className="px-2.5 h-8 rounded-lg bg-[#3F5E4A] text-[#FFF9F0] text-xs font-bold cursor-pointer"
                  >
                    + Bot
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              {activeSeatMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between bg-[#F7EEDF] px-3 py-2 rounded-xl border border-[#3E2F2A]/10"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <PlayerAvatar avatarId={m.avatarId} size={28} />
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-[#3E2F2A] block truncate">
                        {m.nickname}
                        {m.id === snapshot.hostId ? ' (Anfitrión)' : ''}
                        {m.id === myPlayerId ? ' · Tú' : ''}
                      </span>
                      <span className="block text-[11px] text-[#6F5A4E]">
                        {m.role === 'bot'
                          ? `Bot ${
                              m.botDifficulty === 'hard'
                                ? 'Difícil'
                                : m.botDifficulty === 'medium'
                                  ? 'Medio'
                                  : 'Básico'
                            }`
                          : m.ready
                            ? 'Listo'
                            : 'En espera'}
                      </span>
                    </div>
                  </div>
                  {isHost && m.role === 'bot' && (
                    <button
                      type="button"
                      onClick={() => void removeBot(m.id)}
                      className="text-xs font-bold text-[#A94438] hover:underline cursor-pointer"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Direct Room Options column */}
          <div className="bg-[#F7EEDF] p-3 rounded-2xl space-y-2.5 self-start">
            <h2 className="font-serif font-bold text-base">Opciones</h2>

            <label className="block text-xs font-semibold text-[#6F5A4E]">
              Jugadores
              <select
                disabled={!isHost}
                value={snapshot.config.maxPlayers}
                onChange={(e) =>
                  void updateRoomConfig({
                    maxPlayers: Number(e.target.value) as 2 | 3 | 4,
                  })
                }
                className="mt-1 w-full h-9 px-2.5 rounded-xl bg-[#FFF9F0] border border-[#3E2F2A]/20 text-xs sm:text-sm text-[#3E2F2A] font-semibold"
              >
                <option value={2}>2 jugadores</option>
                <option value={3}>3 jugadores</option>
                <option value={4}>4 jugadores</option>
              </select>
            </label>

            <label className="block text-xs font-semibold text-[#6F5A4E]">
              Tiempo por turno
              <select
                disabled={!isHost}
                value={snapshot.config.timerEnabled ? snapshot.config.timerSeconds : 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  void updateRoomConfig({
                    timerEnabled: val > 0,
                    timerSeconds: val > 0 ? val : 60,
                  });
                }}
                className="mt-1 w-full h-9 px-2.5 rounded-xl bg-[#FFF9F0] border border-[#3E2F2A]/20 text-xs sm:text-sm text-[#3E2F2A] font-semibold"
              >
                <option value={0}>Sin reloj</option>
                <option value={30}>30 s</option>
                <option value={60}>60 s</option>
                <option value={90}>90 s</option>
                <option value={120}>120 s</option>
              </select>
            </label>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="shrink-0 pt-2.5 border-t border-[#3E2F2A]/10 flex items-center justify-between gap-2">
          {me && me.role === 'player' && (
            <button
              type="button"
              onClick={() => void toggleReady(!me.ready)}
              className={`px-4 h-10 rounded-xl font-bold text-xs sm:text-sm cursor-pointer ${
                me.ready
                  ? 'bg-[#3F5E4A] text-[#FFF9F0]'
                  : 'bg-[#F7EEDF] text-[#3E2F2A] border border-[#3E2F2A]/25'
              }`}
            >
              {me.ready ? '✓ Listo' : 'Estoy listo'}
            </button>
          )}

          {isHost && (
            <button
              type="button"
              data-testid="start-game-btn"
              disabled={activeSeatMembers.length < 2}
              onClick={() => void startGame()}
              className="px-5 h-10 sm:h-11 rounded-xl bg-[#C96F4A] text-[#FFF9F0] font-bold text-xs sm:text-sm shadow-xs hover:opacity-95 disabled:opacity-45 cursor-pointer ml-auto"
            >
              Empezar partida ({activeSeatMembers.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PlayingScreen(): React.ReactElement {
  const snapshot = useGameStore((s) => s.snapshot);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const myRole = useGameStore((s) => s.myRole);
  const selectedTileId = useGameStore((s) => s.selectedTileId);
  const draftPlacements = useGameStore((s) => s.draftPlacements);
  const preferredJokerNation = useGameStore((s) => s.preferredJokerNation);
  const focusedTableId = useGameStore((s) => s.focusedTableId);
  const cameraAngleIndex = useGameStore((s) => s.cameraAngleIndex);
  const cameraZoom = useGameStore((s) => s.cameraZoom);
  const nightMode = useGameStore((s) => s.nightMode);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const eventSubtitles = useGameStore((s) => s.eventSubtitles);
  const errorBanner = useGameStore((s) => s.errorBanner);

  const selectTile = useGameStore((s) => s.selectTile);
  const setPreferredJokerNation = useGameStore((s) => s.setPreferredJokerNation);
  const clearDraft = useGameStore((s) => s.clearDraft);
  const addDraftPlacement = useGameStore((s) => s.addDraftPlacement);
  const setPendingNegativeConfirm = useGameStore((s) => s.setPendingNegativeConfirm);
  const setWhyCannotBanner = useGameStore((s) => s.setWhyCannotBanner);
  const setFocusedTableId = useGameStore((s) => s.setFocusedTableId);
  const cycleCameraAngle = useGameStore((s) => s.cycleCameraAngle);
  const resetCamera = useGameStore((s) => s.resetCamera);
  const setCameraZoom = useGameStore((s) => s.setCameraZoom);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const submitMove = useGameStore((s) => s.submitMove);
  const sendChat = useGameStore((s) => s.sendChat);
  const leaveRoom = useGameStore((s) => s.leaveRoom);

  const [cafeModalOpen, setCafeModalOpen] = useState(false);
  const [rivalHandsOpen, setRivalHandsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sideTab, setSideTab] = useState<'log' | 'chat'>('log');
  const [chatInput, setChatInput] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [chairToast, setChairToast] = useState<ChairToastInfo | null>(null);
  const [coinFlights, setCoinFlights] = useState<CoinFlightEvent[]>([]);
  const [calloutQueue, setCalloutQueue] = useState<ArcadeCalloutEvent[]>([]);
  const lastLogLengthRef = useRef<number>(0);
  const announcedLastRoundRef = useRef<boolean>(false);

  const gameState = snapshot?.gameState;

  // Prefetch the 3D Café chunk in background after the 2D board renders
  useEffect(() => {
    void import('./PapercraftBoard');
  }, []);

  // Map player avatarId from room members or player state
  const avatarByPlayerId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of snapshot?.members ?? []) {
      map[m.id] = m.avatarId || 'moka';
    }
    for (const p of gameState?.players ?? []) {
      if (p.avatarId && !map[p.id]) {
        map[p.id] = p.avatarId;
      }
    }
    return map;
  }, [snapshot?.members, gameState?.players]);

  // Turn countdown timer
  useEffect(() => {
    const deadline = snapshot?.turnDeadlineMs ?? null;
    if (!deadline) {
      setRemainingSeconds(null);
      return;
    }
    const updateClock = () => {
      const diff = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(diff);
    };
    updateClock();
    const timer = setInterval(updateClock, 500);
    return () => clearInterval(timer);
  }, [snapshot?.turnDeadlineMs]);

  // Auto-dismiss chair toast after 3.2 seconds
  useEffect(() => {
    if (!chairToast) return;
    const t = setTimeout(() => setChairToast(null), 3200);
    return () => clearTimeout(t);
  }, [chairToast]);

  // Pop Rocket League-style arcade callout queue every 1.45s
  useEffect(() => {
    if (calloutQueue.length === 0) return;
    soundEngine.playSfx('calloutSting');
    const timer = setTimeout(() => {
      setCalloutQueue((q) => q.slice(1));
    }, 1450);
    return () => clearTimeout(timer);
  }, [calloutQueue]);

  // Detect new scoring, bar penalty, joker, table completion, and last round events
  useEffect(() => {
    if (!gameState) return;
    const currentLen = gameState.log.length;
    if (lastLogLengthRef.current === 0) {
      lastLogLengthRef.current = currentLen;
      return;
    }
    if (currentLen <= lastLogLengthRef.current) {
      lastLogLengthRef.current = currentLen;
      return;
    }

    const newEvents = gameState.log.slice(lastLogLengthRef.current);
    lastLogLengthRef.current = currentLen;

    const flights: CoinFlightEvent[] = [];
    const newCallouts: ArcadeCalloutEvent[] = [];

    for (let i = 0; i < newEvents.length; i++) {
      const ev = newEvents[i];
      if (!ev) continue;
      const plName =
        gameState.players.find((p) => 'playerId' in ev && p.id === ev.playerId)?.nickname ??
        'Jugador';

      if (ev.type === 'tile_seated') {
        if (ev.pointsEarned > 0) {
          flights.push({
            id: `flight-${Date.now()}-${i}`,
            playerId: ev.playerId,
            delta: ev.pointsEarned,
            sourceSelector: `[data-seat-id="${ev.seatId}"]`,
            targetSelector: `[data-player-tray="${ev.playerId}"]`,
          });
        }
        if (ev.tile.nation === 'joker') {
          newCallouts.push({
            id: `callout-joker-${Date.now()}-${i}`,
            title: '¡EL JOKER!',
            subtitle: `${plName} sienta comodín (+${ev.pointsEarned} pts)`,
            tone: 'gold',
          });
        }
        if (ev.pureTablesCompleted > 0) {
          newCallouts.push({
            id: `callout-table-${Date.now()}-${i}`,
            title: '¡MESA COMPLETA!',
            subtitle: `${plName} completa mesa nacional`,
            tone: 'green',
          });
        } else {
          // Check if any table containing ev.seatId just reached 4/4 occupants
          const completedTable = gameState.tables.find(
            (t) =>
              t.seatIds.includes(ev.seatId) &&
              t.seatIds.every((sid) => gameState.seats.find((s) => s.id === sid)?.occupant !== null),
          );
          if (completedTable) {
            newCallouts.push({
              id: `callout-full-${Date.now()}-${i}`,
              title: '¡MESA COMPLETA!',
              subtitle: `Mesa de ${NATION_VISUALS[completedTable.nation]?.name ?? completedTable.nation} (4/4)`,
              tone: 'green',
            });
          }
        }
      } else if (ev.type === 'joker_swapped') {
        newCallouts.push({
          id: `callout-swap-${Date.now()}-${i}`,
          title: '¡EL JOKER!',
          subtitle: `${plName} recupera el comodín de la mesa`,
          tone: 'gold',
        });
      } else if (ev.type === 'tile_bar' && ev.pointsDelta !== 0) {
        if (ev.pointsDelta > 0) {
          flights.push({
            id: `flight-${Date.now()}-${i}`,
            playerId: ev.playerId,
            delta: ev.pointsDelta,
            sourceSelector: '[data-testid="bar-center-button"]',
            targetSelector: `[data-player-tray="${ev.playerId}"]`,
          });
        } else {
          // Reverse trajectory: from player's coin tray to the central bar
          flights.push({
            id: `flight-${Date.now()}-${i}`,
            playerId: ev.playerId,
            delta: ev.pointsDelta,
            sourceSelector: `[data-player-tray="${ev.playerId}"]`,
            targetSelector: '[data-testid="bar-center-button"]',
          });
          newCallouts.push({
            id: `callout-pen-${Date.now()}-${i}`,
            title: '¡PENALIZACIÓN!',
            subtitle: `${plName} sirve en la barra (${ev.pointsDelta} pts)`,
            tone: 'red',
          });
        }

        if (ev.barIndex >= 18) {
          newCallouts.push({
            id: `callout-bar-${Date.now()}-${i}`,
            title: '¡BARRA LLENA!',
            subtitle: `Posavasos ${ev.barIndex + 1}/20 ocupado`,
            tone: 'red',
          });
        }
      } else if (ev.type === 'game_finished') {
        newCallouts.push({
          id: `callout-win-${Date.now()}-${i}`,
          title: '¡VICTORIA!',
          subtitle: 'Cerrando recuento del café',
          tone: 'gold',
        });
      }
    }

    if (!announcedLastRoundRef.current && gameState.bag.length <= 7 && gameState.bag.length > 3) {
      announcedLastRoundRef.current = true;
      newCallouts.push({
        id: `callout-last-${Date.now()}`,
        title: '¡ÚLTIMA RONDA!',
        subtitle: `Quedan solo ${gameState.bag.length} fichas en la bolsa`,
        tone: 'blue',
      });
    }

    if (eventSubtitles && newCallouts.length > 0) {
      setCalloutQueue((prev) => [...prev, ...newCallouts]);
    }

    if (flights.length > 0) {
      const hasNegative = flights.some((f) => f.delta < 0);
      soundEngine.playSfx(hasNegative ? 'coinPenalty' : 'coinClink');
      setCoinFlights(flights);
      const clearTimer = setTimeout(() => setCoinFlights([]), 1600);
      return () => clearTimeout(clearTimer);
    }
  }, [gameState, gameState?.log.length, eventSubtitles]);

  const activePlayerId = gameState?.turn ?? '';
  const isMyTurn = myRole === 'player' && activePlayerId === myPlayerId;
  const activeHand = useMemo(
    () => (gameState ? (gameState.hands[activePlayerId] ?? []) : []),
    [gameState, activePlayerId],
  );
  const myHand = useMemo(
    () =>
      gameState
        ? (gameState.hands[myPlayerId ?? activePlayerId] ?? activeHand)
        : [],
    [gameState, myPlayerId, activePlayerId, activeHand],
  );

  const selectedTile: Tile | null = useMemo(
    () => myHand.find((t) => t.id === selectedTileId) ?? null,
    [myHand, selectedTileId],
  );
  const selectedProfile = useMemo(
    () =>
      selectedTile
        ? getCharacterProfile(selectedTile.nation, selectedTile.gender, selectedTile.jokerNation)
        : null,
    [selectedTile],
  );

  const seatInspections = useMemo(() => {
    if (!gameState) return {};
    return inspectSeatsForSelectedTile(
      gameState,
      selectedTile,
      draftPlacements,
      preferredJokerNation,
    );
  }, [gameState, selectedTile, draftPlacements, preferredJokerNation]);

  const draftEvaluation = useMemo(() => {
    if (!gameState) {
      return {
        isValidCompleteMove: false,
        totalPoints: 0,
        pureTablesCount: 0,
        summaryText: '',
        errorReason: null,
      };
    }
    return evaluateDraftPlacements(gameState, draftPlacements);
  }, [gameState, draftPlacements]);

  const availableSwapMoves = useMemo(() => {
    if (!gameState || !isMyTurn) return [];
    return getLegalMoves(gameState, activePlayerId).filter(
      (m): m is Extract<typeof m, { type: 'swap' }> => m.type === 'swap',
    );
  }, [gameState, isMyTurn, activePlayerId]);

  if (!snapshot || !gameState) return <div />;

  const activePlayerObj = gameState.players.find((p) => p.id === activePlayerId);
  const activeCallout = eventSubtitles ? (calloutQueue[0] ?? null) : null;

  const showAnchoredToast = (row: number, col: number, text: string) => {
    setWhyCannotBanner(text);
    setChairToast({
      id: Date.now(),
      row,
      col,
      text,
    });
  };

  const handleSeatClick = (seat: Seat) => {
    if (!isMyTurn) {
      showAnchoredToast(seat.row, seat.col, 'Espera tu turno para sentar invitados.');
      return;
    }
    if (!selectedTile) {
      showAnchoredToast(
        seat.row,
        seat.col,
        'Primero elige una carta de tu mano en la parte inferior.',
      );
      return;
    }
    const inspect = seatInspections[seat.id];
    if (!inspect || inspect.status === 'illegal') {
      showAnchoredToast(
        seat.row,
        seat.col,
        inspect?.whyCannotText ?? 'No puedes sentar a este invitado en esta silla.',
      );
      return;
    }
    if (inspect.status === 'selected') {
      return;
    }

    setChairToast(null);
    const chosenNation: Nation | undefined =
      selectedTile.nation === 'joker'
        ? (preferredJokerNation && inspect.validJokerNations.includes(preferredJokerNation)
            ? preferredJokerNation
            : inspect.validJokerNations[0] ?? seat.allowedNations[0])
        : undefined;

    const newPlacement =
      selectedTile.nation === 'joker'
        ? { tileId: selectedTile.id, seatId: seat.id, jokerNation: chosenNation }
        : { tileId: selectedTile.id, seatId: seat.id };

    addDraftPlacement(newPlacement);
  };

  const handleTableClick = (table: Table) => {
    setFocusedTableId(focusedTableId === table.id ? null : table.id);
  };

  const handleBarClick = () => {
    if (!isMyTurn) {
      showAnchoredToast(6, 6, 'Solo puedes servir en la barra durante tu turno.');
      return;
    }
    if (draftPlacements.length > 0) {
      showAnchoredToast(
        6,
        6,
        'No puedes combinar sillas de mesa y barra. Pulsa Limpiar primero.',
      );
      return;
    }
    if (!selectedTile) {
      showAnchoredToast(6, 6, 'Selecciona primero una carta natural de tu mano.');
      return;
    }
    if (selectedTile.nation === 'joker') {
      showAnchoredToast(6, 6, 'Los comodines nunca pueden enviarse a la barra.');
      return;
    }

    setChairToast(null);
    const nextBarIdx = gameState.bar.findIndex((b) => b === null);
    const barPoints = nextBarIdx >= 0 ? (gameState.barValues[nextBarIdx] ?? -14) : -14;
    const barMove = { type: 'bar' as const, tileId: selectedTile.id };
    const profile = getCharacterProfile(selectedTile.nation, selectedTile.gender);

    if (barPoints < 0) {
      setPendingNegativeConfirm({
        move: barMove,
        points: barPoints,
        description: `Vas a sentar a ${profile.name} (${profile.countryName}) en el posavasos ${nextBarIdx + 1} de la barra.`,
      });
      return;
    }

    void submitMove(barMove);
  };

  return (
    <div
      className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between px-1.5 py-1 sm:px-4 sm:py-2 gap-1 max-w-[1440px] mx-auto select-none"
      data-testid="playing-viewport"
    >
      {/* 3D Coin Flip Animation Overlay */}
      <FlyingCoinsLayer flights={coinFlights} reducedMotion={reducedMotion} />

      {/* ROCKET LEAGUE STYLE EVENT CALLOUT OVERLAY (P1.3) */}
      {activeCallout && (
        <div
          role="status"
          aria-live="polite"
          data-testid="arcade-event-callout"
          className={`pointer-events-none fixed top-14 left-1/2 -translate-x-1/2 z-50 px-5 py-2 rounded-2xl border-2 shadow-[0_12px_30px_rgba(0,0,0,0.35)] text-center ${
            reducedMotion ? '' : 'animate-bounce'
          } ${
            activeCallout.tone === 'gold'
              ? 'bg-[#3E2F2A] border-[#F2C14E] text-[#FFF9F0]'
              : activeCallout.tone === 'green'
                ? 'bg-[#224A36] border-[#8CE0B5] text-[#FFF9F0]'
                : activeCallout.tone === 'red'
                  ? 'bg-[#6E1B16] border-[#FFB4AB] text-[#FFF9F0]'
                  : 'bg-[#1E4E8C] border-[#FFF9F0] text-[#FFF9F0]'
          }`}
        >
          <div className="font-serif font-extrabold text-lg sm:text-2xl tracking-wider uppercase text-[#F2C14E] drop-shadow">
            {activeCallout.title}
          </div>
          <div className="text-[11px] sm:text-xs font-bold text-[#FFF9F0]/95">
            {activeCallout.subtitle}
          </div>
        </div>
      )}

      {/* TOP COMPACT HEADER + SCOREBOARD BAR */}
      <header className="shrink-0 bg-[#FFF9F0] rounded-2xl border border-[#3E2F2A]/15 px-2 py-1 sm:px-3 sm:py-1.5 shadow-xs flex flex-wrap items-center justify-between gap-1 z-30">
        {/* Left: Brand, Room Code, Turn Pill, Timer */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <CafetuliaLogo compact />
          <span className="hidden sm:inline-block text-[11px] font-mono font-bold text-[#6F5A4E] bg-[#F7EEDF] px-2 py-0.5 rounded-lg">
            #{snapshot.code}
          </span>
          <div
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 whitespace-nowrap ${
              isMyTurn
                ? 'bg-[#C96F4A] text-[#FFF9F0] shadow-xs'
                : 'bg-[#F7EEDF] text-[#3E2F2A] border border-[#3E2F2A]/15'
            }`}
            data-testid="turn-indicator"
          >
            {isMyTurn ? 'Tu turno' : `Turno: ${activePlayerObj?.nickname ?? 'Rival'}`}
          </div>
          {remainingSeconds !== null && (
            <span
              className={`text-[11px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded-lg ${
                remainingSeconds <= 10
                  ? 'bg-[#FDECEB] text-[#A94438]'
                  : 'bg-[#F7EEDF] text-[#3E2F2A]'
              }`}
            >
              ⏱ {remainingSeconds}s
            </span>
          )}
        </div>

        {/* Center: Compact Player Scoreboard with Avatars, Exact Coin Trays & Card Counts */}
        <div
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full py-0.5"
          data-testid="compact-scoreboard"
        >
          {gameState.players.map((p) => {
            const pHandCount = (gameState.hands[p.id] ?? []).length;
            const isTurn = gameState.turn === p.id;
            const pAvatar = avatarByPlayerId[p.id] ?? p.avatarId ?? 'moka';
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border text-xs transition-colors duration-200 whitespace-nowrap ${
                  isTurn
                    ? 'bg-[#FEF6E0] border-[#C96F4A] font-bold'
                    : 'bg-[#F7EEDF] border-[#3E2F2A]/12'
                }`}
              >
                <PlayerAvatar avatarId={pAvatar} size={18} />
                <span className="font-bold text-[#3E2F2A] truncate max-w-[64px] sm:max-w-[92px]">
                  {p.nickname}
                </span>
                <CoinTray
                  score={p.score}
                  playerId={p.id}
                  compact
                  reducedMotion={reducedMotion}
                />
                <span
                  className="text-[10px] font-mono font-semibold text-[#6F5A4E] bg-[#FFF9F0] px-1 py-0.2 rounded border border-[#3E2F2A]/15 tabular-nums"
                  title={`${pHandCount} cartas en mano`}
                >
                  {pHandCount}c
                </span>
              </div>
            );
          })}

          <span
            className="hidden lg:inline-block text-[11px] font-mono font-bold text-[#6F5A4E] bg-[#F7EEDF] px-2 py-1 rounded-xl tabular-nums"
            title="Fichas restantes en la bolsa"
          >
            Bolsa: {gameState.bag.length}
          </span>
        </div>

        {/* Right: Rival Hands Dropdown, "Ver café" 3D Modal, Log/Chat Drawer, Settings */}
        <div className="flex items-center gap-1 text-xs relative">
          <div className="relative">
            <button
              type="button"
              data-testid="rival-hands-btn"
              onClick={() => setRivalHandsOpen((v) => !v)}
              aria-expanded={rivalHandsOpen}
              className="min-h-[34px] px-2 sm:px-2.5 py-1 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/15 font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer whitespace-nowrap"
            >
              Manos
            </button>

            {rivalHandsOpen && (
              <div
                data-testid="rival-hands-popover"
                className="fixed sm:absolute right-2 sm:right-0 top-13 sm:top-full mt-1 z-50 w-[min(92vw,340px)] bg-[#FFF9F0] text-[#3E2F2A] rounded-2xl p-3 border-2 border-[#8B5E3C] shadow-[0_12px_32px_rgba(62,47,42,0.25)] space-y-2"
              >
                <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-1.5">
                  <span className="font-serif font-bold text-sm">Manos públicas</span>
                  <button
                    type="button"
                    onClick={() => setRivalHandsOpen(false)}
                    className="text-xs font-bold text-[#6F5A4E] hover:text-[#3E2F2A] px-1.5 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                {gameState.players.map((p) => {
                  const pHand = gameState.hands[p.id] ?? [];
                  const pAvatar = avatarByPlayerId[p.id] ?? p.avatarId ?? 'moka';
                  return (
                    <div key={p.id} className="bg-[#F7EEDF] p-2 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1.5 font-bold">
                          <PlayerAvatar avatarId={pAvatar} size={18} />
                          <span>
                            {p.nickname} {p.id === myPlayerId ? '(Tú)' : ''}
                          </span>
                        </span>
                        <span className="font-mono text-[11px] text-[#6F5A4E]">
                          {p.score} pts · {pHand.length}c
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {pHand.map((t) => {
                          const prof = getCharacterProfile(t.nation, t.gender);
                          return (
                            <div
                              key={t.id}
                              className="inline-flex items-center gap-1 bg-[#FFF9F0] px-1.5 py-0.5 rounded-lg border border-[#3E2F2A]/15 text-[10px]"
                            >
                              <FlagBadge nation={t.nation} size={11} />
                              <span className="font-bold">{prof.name}</span>
                              <span className="text-[#6F5A4E] font-semibold">
                                {prof.genderBadge}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            data-testid="open-3d-cafe-btn"
            onClick={() => setCafeModalOpen(true)}
            className="min-h-[34px] px-2 sm:px-2.5 py-1 rounded-xl bg-[#3F5E4A] text-[#FFF9F0] font-bold hover:opacity-95 cursor-pointer whitespace-nowrap"
          >
            Ver café
          </button>

          <button
            type="button"
            data-testid="open-drawer-btn"
            onClick={() => setDrawerOpen((v) => !v)}
            className="min-h-[34px] px-2 sm:px-2.5 py-1 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/15 font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer whitespace-nowrap"
          >
            Tertulia ({gameState.log.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('settings')}
            aria-label="Ajustes"
            className="min-h-[34px] px-2 sm:px-2.5 py-1 rounded-xl bg-[#F7EEDF] font-semibold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            Ajustes
          </button>

          <button
            type="button"
            onClick={leaveRoom}
            aria-label="Salir de la partida"
            className="min-h-[34px] px-2 py-1 rounded-xl text-[#A94438] font-bold hover:bg-[#FDECEB] cursor-pointer"
          >
            Salir
          </button>
        </div>
      </header>

      {/* CENTER BOARD WORKSPACE (Takes remaining height, zero overflow, tight to header on mobile) */}
      <div className="flex-1 min-h-0 w-full flex items-start pt-0.5 sm:items-center sm:pt-0 justify-center relative overflow-hidden">
        {errorBanner && (
          <div
            role="alert"
            className="absolute top-1.5 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1 rounded-xl bg-[#FDECEB] border border-[#A94438] text-xs font-bold text-[#A94438] shadow-md"
          >
            {errorBanner}
          </div>
        )}

        <IllustratedBoard
          gameState={gameState}
          selectedTile={selectedTile}
          draftPlacements={draftPlacements}
          seatInspections={seatInspections}
          focusedTableId={focusedTableId}
          nightMode={nightMode}
          reducedMotion={reducedMotion}
          chairToast={chairToast}
          onDismissToast={() => setChairToast(null)}
          onSeatClick={handleSeatClick}
          onTableClick={handleTableClick}
          onBarClick={handleBarClick}
        />
      </div>

      {/* BOTTOM FIXED HAND DOCK (Clear 2:3 Character Cards + Confirm Action) */}
      <section
        aria-label="Tu mano de invitados"
        data-testid="player-hand-dock"
        className="shrink-0 bg-[#FFF9F0] rounded-2xl border border-[#3E2F2A]/15 px-2 py-1 sm:px-3.5 sm:py-1.5 shadow-[0_-4px_18px_rgba(62,47,42,0.08)] z-30 flex flex-col sm:flex-row items-center justify-between gap-1.5"
      >
        {/* Left / Top Mini Status & Joker Nation Selector */}
        <div className="flex flex-wrap items-center justify-between w-full sm:w-auto gap-1.5">
          <div className="text-xs min-w-0">
            <span className="font-serif font-bold text-[#3E2F2A] block leading-tight">
              Tu mano ({myHand.length}/{gameState.handSize[myPlayerId ?? activePlayerId] ?? 5})
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#6F5A4E] truncate block max-w-[240px]">
              {draftPlacements.length > 0
                ? draftEvaluation.summaryText
                : selectedProfile
                  ? `${selectedProfile.name}: «${selectedProfile.quote}»`
                  : 'Elige una carta para iluminar sus sillas'}
            </span>
          </div>

          {selectedTile?.nation === 'joker' && (
            <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6F5A4E]">
              <span>País:</span>
              <select
                aria-label="Nacionalidad para el comodín"
                value={preferredJokerNation ?? ''}
                onChange={(e) =>
                  setPreferredJokerNation(
                    e.target.value ? (e.target.value as Nation) : undefined,
                  )
                }
                className="h-7 px-2 rounded-lg bg-[#F7EEDF] border border-[#3E2F2A]/25 text-xs font-bold text-[#3E2F2A]"
              >
                <option value="">Automático</option>
                {Object.values(NATION_VISUALS).map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {/* Center: Clear 2:3 Character Cards (P0.6: Top Country Ribbon + Large MUJER/HOMBRE Badge + Big Portrait) */}
        <div className="grid grid-cols-5 gap-1 w-full sm:w-auto sm:flex sm:items-end sm:justify-center sm:gap-2 py-0.5">
          {myHand.map((tile, idx) => {
            const isSelected = selectedTileId === tile.id;
            const isInDraft = draftPlacements.some((d) => d.tileId === tile.id);
            const profile = getCharacterProfile(tile.nation, tile.gender, tile.jokerNation);
            const natVisual =
              tile.nation === 'joker'
                ? null
                : (NATION_VISUALS[tile.nation as NationKey] ?? NATION_VISUALS.fr);
            const ribbonBg = natVisual ? natVisual.primaryColor : '#8A3F5D';
            const mid = (myHand.length - 1) / 2;
            const fanAngle = reducedMotion ? 0 : (idx - mid) * 1.8;
            const fanLift = reducedMotion ? 0 : Math.abs(idx - mid) * 1.2;

            return (
              <button
                key={tile.id}
                type="button"
                data-tile-id={tile.id}
                disabled={isInDraft}
                onClick={() => selectTile(isSelected ? null : tile.id)}
                aria-label={`Carta ${profile.name}, ${profile.countryName}, ${profile.genderBadge}`}
                style={{
                  transform: isSelected
                    ? 'translateY(-6px) scale(1.04)'
                    : `translateY(${fanLift}px) rotate(${fanAngle}deg)`,
                }}
                className={`group relative aspect-[2/3] w-full sm:w-[92px] sm:h-[134px] min-h-[96px] rounded-xl border-2 p-1 flex flex-col items-center justify-between text-center transition-all duration-150 cursor-pointer select-none shrink-0 overflow-hidden ${
                  isInDraft
                    ? 'opacity-35 bg-[#F7EEDF] border-[#3E2F2A]/20'
                    : isSelected
                      ? 'bg-[#FEF6E0] border-[#C96F4A] shadow-[0_8px_18px_rgba(201,111,74,0.28)] z-20'
                      : 'bg-[#FFF9F0] border-[#3E2F2A]/25 hover:border-[#3E2F2A] shadow-xs'
                }`}
              >
                {/* 1. TOP RIBBON: Flag + UPPERCASE COUNTRY NAME */}
                <div
                  style={{ backgroundColor: ribbonBg }}
                  className="w-full rounded-md px-1 py-0.5 flex items-center justify-center gap-1 text-[#FFF9F0] shadow-2xs"
                  data-testid="card-country-ribbon"
                >
                  <FlagBadge nation={tile.nation} size={11} />
                  <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-tight truncate">
                    {profile.countryName}
                  </span>
                </div>

                {/* 2. LARGE GENDER BADGE ("MUJER" or "HOMBRE") */}
                <span
                  data-testid="card-gender-badge"
                  className={`w-full rounded px-1 py-0.2 text-[8px] sm:text-[9px] font-extrabold tracking-wide uppercase leading-tight ${
                    tile.gender === 'F'
                      ? 'bg-[#FDECEB] text-[#9E2A2B] border border-[#9E2A2B]/25'
                      : 'bg-[#E6EEF8] text-[#1E4E8C] border border-[#1E4E8C]/25'
                  }`}
                >
                  {profile.genderBadge}
                </span>

                {/* 3. LARGER PORTRAIT */}
                <div className="my-auto flex items-center justify-center">
                  <CharacterPortrait
                    nation={tile.nation}
                    gender={tile.gender}
                    size={40}
                    sipping={isSelected}
                  />
                </div>

                {/* 4. PROPER NAME + SHORT PERSONALITY QUOTE */}
                <div className="w-full">
                  <span className="block font-serif font-bold text-[10px] sm:text-xs text-[#3E2F2A] leading-none truncate">
                    {profile.name}
                  </span>
                  <span className="hidden sm:block text-[8px] text-[#6F5A4E] italic leading-tight truncate mt-0.5">
                    «{profile.quote}»
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Confirm Move / Clear Draft / Joker Swap Actions */}
        <div className="flex items-center justify-end gap-1.5 w-full sm:w-auto">
          {draftPlacements.length > 0 && (
            <>
              <button
                type="button"
                onClick={clearDraft}
                className="min-h-[44px] sm:min-h-[38px] px-3 py-1.5 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/20 text-xs font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
              >
                Limpiar
              </button>
              <button
                type="button"
                data-testid="confirm-move-btn"
                disabled={!draftEvaluation.isValidCompleteMove}
                onClick={() => {
                  const first = draftPlacements[0];
                  if (!first) return;
                  const second = draftPlacements[1];
                  void submitMove({
                    type: 'seat',
                    placements: second ? [first, second] : [first],
                  });
                }}
                className="min-h-[44px] sm:min-h-[38px] px-4 py-1.5 rounded-xl bg-[#3F5E4A] text-[#FFF9F0] text-xs font-bold shadow-sm hover:opacity-95 disabled:opacity-40 cursor-pointer whitespace-nowrap"
              >
                Confirmar (+{draftEvaluation.totalPoints})
              </button>
            </>
          )}

          {availableSwapMoves.map((sw, idx) => (
            <button
              key={`${sw.seatId}-${idx}`}
              type="button"
              onClick={() => void submitMove(sw)}
              className="min-h-[44px] sm:min-h-[38px] px-3 py-1.5 rounded-xl bg-[#C9A227] text-[#3E2F2A] text-xs font-bold hover:opacity-95 cursor-pointer whitespace-nowrap"
            >
              Canjear comodín
            </button>
          ))}
        </div>
      </section>

      {/* ON-DEMAND LAZY-LOADED "VER CAFÉ" 3D DIORAMA MODAL */}
      {cafeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3E2F2A]/65 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cafe-3d-modal-title"
          data-testid="cafe-3d-modal"
        >
          <div className="w-full max-w-4xl bg-[#FFF9F0] text-[#3E2F2A] rounded-[24px] border-2 border-[#8B5E3C] p-4 sm:p-6 shadow-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3E2F2A]/10 pb-2.5">
              <div>
                <h2 id="cafe-3d-modal-title" className="font-serif font-bold text-xl sm:text-2xl">
                  Café Vivo en 3D
                </h2>
                <p className="text-xs text-[#6F5A4E]">
                  Invitados 3D tomando café en las 24 mesas y los 20 posavasos de la barra
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={cycleCameraAngle}
                  className="px-3 py-1.5 rounded-xl bg-[#F7EEDF] font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
                >
                  Girar 90°
                </button>
                <button
                  type="button"
                  onClick={() => setCameraZoom(cameraZoom + 0.15)}
                  aria-label="Acercar cámara"
                  className="px-2.5 py-1.5 rounded-xl bg-[#F7EEDF] font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setCameraZoom(cameraZoom - 0.15)}
                  aria-label="Alejar cámara"
                  className="px-2.5 py-1.5 rounded-xl bg-[#F7EEDF] font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={resetCamera}
                  className="px-3 py-1.5 rounded-xl bg-[#F7EEDF] font-semibold text-[#6F5A4E] hover:text-[#3E2F2A] cursor-pointer"
                >
                  Centrar
                </button>
                <button
                  type="button"
                  data-testid="close-3d-cafe-btn"
                  onClick={() => setCafeModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-[#C96F4A] text-[#FFF9F0] font-bold cursor-pointer"
                >
                  Volver al tablero
                </button>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="h-[380px] sm:h-[480px] flex items-center justify-center bg-[#F7EEDF] rounded-2xl border border-[#3E2F2A]/15 text-sm font-bold text-[#6F5A4E]">
                  Preparando el café en 3D…
                </div>
              }
            >
              <PapercraftBoard
                gameState={gameState}
                selectedTile={selectedTile}
                draftPlacements={draftPlacements}
                seatInspections={seatInspections}
                focusedTableId={focusedTableId}
                viewMode="3d"
                cameraAngleIndex={cameraAngleIndex}
                cameraZoom={cameraZoom}
                nightMode={nightMode}
                reducedMotion={reducedMotion}
                onSeatClick={handleSeatClick}
                onTableClick={handleTableClick}
                onBarClick={handleBarClick}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* ON-DEMAND SLIDE-OVER LATERAL DRAWER FOR MOVE LOG & CHAT */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#3E2F2A]/40"
          role="dialog"
          aria-modal="true"
          aria-label="Registro de jugadas y chat"
          data-testid="log-chat-drawer"
        >
          <div className="w-full max-w-sm h-full bg-[#FFF9F0] text-[#3E2F2A] p-4 shadow-2xl border-l-2 border-[#8B5E3C] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-3">
              <div className="flex items-center gap-1 bg-[#F7EEDF] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSideTab('log')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    sideTab === 'log'
                      ? 'bg-[#FFF9F0] text-[#3E2F2A] shadow-2xs'
                      : 'text-[#6F5A4E]'
                  }`}
                >
                  Registro ({gameState.log.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSideTab('chat')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    sideTab === 'chat'
                      ? 'bg-[#FFF9F0] text-[#3E2F2A] shadow-2xs'
                      : 'text-[#6F5A4E]'
                  }`}
                >
                  Chat ({snapshot.chat.length})
                </button>
              </div>
              <button
                type="button"
                data-testid="close-drawer-btn"
                onClick={() => setDrawerOpen(false)}
                className="px-3 py-1 rounded-xl bg-[#F7EEDF] text-xs font-bold text-[#3E2F2A] cursor-pointer"
              >
                Cerrar ✕
              </button>
            </div>

            {sideTab === 'log' ? (
              <div
                className="flex-1 overflow-y-auto space-y-2 py-3 pr-1 text-xs"
                data-testid="move-log-list"
              >
                {gameState.log.length === 0 ? (
                  <p className="text-[#6F5A4E] italic">
                    Aún no se han realizado jugadas. El jugador inicial abre el café.
                  </p>
                ) : (
                  gameState.log
                    .slice()
                    .reverse()
                    .map((ev, i) => {
                      let pid = '';
                      let desc = '';
                      let delta: number | null = null;
                      if (ev.type === 'tile_seated') {
                        const prof = getCharacterProfile(
                          ev.tile.nation,
                          ev.tile.gender,
                          ev.tile.jokerNation,
                        );
                        pid = ev.playerId;
                        desc = `sentó a ${prof.name} (${prof.countryName})`;
                        delta = ev.pointsEarned;
                      } else if (ev.type === 'tile_bar') {
                        const prof = getCharacterProfile(ev.tile.nation, ev.tile.gender);
                        pid = ev.playerId;
                        desc = `sirvió a ${prof.name} en la barra (#${ev.barIndex + 1})`;
                        delta = ev.pointsDelta;
                      } else if (ev.type === 'joker_swapped') {
                        pid = ev.playerId;
                        desc = `canjeó el comodín en mesa`;
                        delta = 0;
                      } else if (ev.type === 'turn_timeout_auto_move') {
                        pid = ev.playerId;
                        desc = 'jugada automática por tiempo';
                      } else if (ev.type === 'hand_size_reduced') {
                        pid = ev.playerId;
                        desc = `completó mesa nacional (mano máx. ${ev.newHandSize})`;
                      } else if (ev.type === 'game_started') {
                        pid = ev.startingPlayerId;
                        desc = 'abrió las puertas del café';
                      } else {
                        return null;
                      }
                      const pl = gameState.players.find((p) => p.id === pid);
                      const plAvatar = avatarByPlayerId[pid] ?? pl?.avatarId ?? 'moka';
                      return (
                        <div
                          key={`${ev.type}-${i}`}
                          className="p-2.5 rounded-xl bg-[#F7EEDF] text-[#3E2F2A] flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <PlayerAvatar avatarId={plAvatar} size={18} />
                            <div className="truncate">
                              <span className="font-bold">{pl?.nickname ?? pid}:</span>{' '}
                              <span>{desc}</span>
                            </div>
                          </div>
                          {delta !== null && (
                            <span
                              className={`font-mono font-bold tabular-nums shrink-0 ${
                                delta >= 0 ? 'text-[#3F5E4A]' : 'text-[#A94438]'
                              }`}
                            >
                              {delta >= 0 ? `+${delta}` : delta}
                            </span>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 py-3">
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs mb-2">
                  {snapshot.chat.length === 0 ? (
                    <p className="text-[#6F5A4E] italic">
                      Saluda a la mesa o envía una reacción rápida.
                    </p>
                  ) : (
                    snapshot.chat.map((msg) => {
                      const msgAvatar =
                        msg.avatarId ?? avatarByPlayerId[msg.senderId] ?? 'moka';
                      return (
                        <div
                          key={msg.id}
                          className="p-2 rounded-xl bg-[#F7EEDF] flex items-center gap-2"
                        >
                          <PlayerAvatar avatarId={msgAvatar} size={20} />
                          <div>
                            <span className="font-bold text-[#3E2F2A]">{msg.nickname}: </span>
                            <span className={msg.emote ? 'text-base' : 'text-[#6F5A4E]'}>
                              {msg.emote ?? msg.text}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 mb-2">
                  {['☕ ¡Salud!', '🥐 ¡Buena mesa!', '👏 ¡Bravo!', '🎩 ¡Qué elegancia!'].map(
                    (emote) => (
                      <button
                        key={emote}
                        type="button"
                        onClick={() => void sendChat(emote, true)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#F7EEDF] hover:bg-[#EAD9C0] text-xs font-semibold cursor-pointer"
                      >
                        {emote.split(' ')[0]}
                      </button>
                    ),
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatInput.trim()) return;
                    void sendChat(chatInput, false);
                    setChatInput('');
                  }}
                  className="flex gap-1.5"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Mensaje corto..."
                    maxLength={120}
                    className="flex-1 h-10 px-3 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/20 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3.5 h-10 rounded-xl bg-[#C96F4A] text-[#FFF9F0] text-xs font-bold cursor-pointer"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function FinishedScreen(): React.ReactElement {
  const snapshot = useGameStore((s) => s.snapshot);
  const shareResult = useGameStore((s) => s.shareResult);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const voteRematch = useGameStore((s) => s.voteRematch);
  const leaveRoom = useGameStore((s) => s.leaveRoom);
  const [postcardUrl, setPostcardUrl] = useState<string | null>(null);
  const [recountStep, setRecountStep] = useState<'table' | 'penalty' | 'final'>('table');

  useEffect(() => {
    if (reducedMotion) {
      setRecountStep('final');
      return;
    }
    const t1 = setTimeout(() => {
      soundEngine.playSfx('coinPenalty');
      setRecountStep('penalty');
    }, 650);
    const t2 = setTimeout(() => {
      soundEngine.playSfx('coinClink');
      setRecountStep('final');
    }, 1350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reducedMotion]);

  if (!snapshot || !snapshot.gameState) return <div />;

  const summary = finalScores(snapshot.gameState);
  const standings = snapshot.gameState.players
    .map((p) => {
      const s = summary.scores[p.id];
      const member = snapshot.members.find((m) => m.id === p.id);
      return {
        id: p.id,
        nickname: p.nickname,
        avatarId: member?.avatarId ?? p.avatarId ?? 'moka',
        tablePoints: s?.tableAndBarScore ?? p.score,
        naturalLeft: s?.naturalTilesRemaining ?? 0,
        jokerLeft: s?.jokersRemaining ?? 0,
        penalty: s?.handPenalty ?? 0,
        finalScore: s?.finalScore ?? p.score,
        isWinner: summary.winners.includes(p.id),
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  const isSharedVictory = summary.winners.length > 1;

  const reasonLabels: Record<string, string> = {
    last_seat_occupied: 'Se ha ocupado la última silla del café.',
    bar_full: 'Se ha llenado la vigésima plaza de la barra.',
    player_empty_hand: 'Un jugador ha agotado su mano sin fichas para robar.',
    bag_threshold_reached: 'Se ha robado la cuarta ficha por el final de la bolsa.',
    last_player_standing: 'El resto de jugadores abandonaron la mesa.',
  };

  const generatePostcard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 460;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#F7EEDF';
    ctx.fillRect(0, 0, 800, 460);
    ctx.strokeStyle = '#C9A227';
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, 764, 424);

    ctx.fillStyle = '#3E2F2A';
    ctx.font = 'bold 38px serif';
    ctx.fillText('Cafetulia · Postal de Sobremesa', 48, 76);

    ctx.fillStyle = '#6F5A4E';
    ctx.font = '18px sans-serif';
    ctx.fillText(
      `Mesa #${snapshot.code} · ${new Date().toLocaleDateString('es-ES')}`,
      48,
      110,
    );

    standings.forEach((row, idx) => {
      const y = 175 + idx * 58;
      ctx.fillStyle = row.isWinner ? '#FEF6E0' : '#FFF9F0';
      ctx.fillRect(48, y - 34, 704, 46);
      ctx.fillStyle = '#3E2F2A';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(
        `${idx + 1}. ${row.nickname} ${row.isWinner ? '★ Ganador' : ''}`,
        66,
        y - 4,
      );
      ctx.textAlign = 'right';
      ctx.fillText(
        `${row.tablePoints} pts − ${Math.abs(row.penalty)} penaliz. = ${row.finalScore} pts`,
        730,
        y - 4,
      );
      ctx.textAlign = 'left';
    });

    setPostcardUrl(canvas.toDataURL('image/png'));
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden p-3 sm:p-6 max-w-3xl mx-auto flex flex-col justify-center relative">
      {/* Winner Coin Shower Animation */}
      {!reducedMotion && recountStep === 'final' && (
        <div
          className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
          aria-hidden="true"
          data-testid="winner-coin-shower"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((idx) => (
            <div
              key={idx}
              style={{
                left: `${8 + idx * 7.8}%`,
                top: '-32px',
                animation: `fallCoin ${1.8 + (idx % 3) * 0.4}s ease-in ${(idx % 4) * 0.18}s forwards`,
              }}
              className="fixed"
            >
              <CoinChip denomination={idx % 3 === 0 ? 10 : idx % 2 === 0 ? 5 : 1} size={26} />
            </div>
          ))}
          <style>{`
            @keyframes fallCoin {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              85% { opacity: 1; }
              100% { transform: translateY(92vh) rotate(320deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      <div className="relative z-20 bg-[#FFF9F0] rounded-[24px] border border-[#3E2F2A]/15 p-5 sm:p-7 shadow-[0_8px_24px_rgba(62,47,42,0.14)] max-h-[94dvh] overflow-y-auto space-y-5">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-[#C96F4A]">Recuento de cierre del café</span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#3E2F2A]">
            {isSharedVictory ? '¡Victoria compartida!' : '¡VICTORIA!'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6F5A4E]">
            {reasonLabels[
              shareResult?.terminalReason ??
                snapshot.gameState.terminalReason ??
                'last_seat_occupied'
            ] ?? 'Partida concluida.'}
          </p>
        </div>

        {/* Final Standings Breakdown with Animated Recount & Coin Trays */}
        <div className="space-y-2">
          {standings.map((st, idx) => {
            const shownScore =
              recountStep === 'table' ? st.tablePoints : st.finalScore;

            return (
              <div
                key={st.id}
                className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2.5 transition-all ${
                  st.isWinner
                    ? 'bg-[#FEF6E0] border-[#C9A227] border-2 shadow-sm'
                    : 'bg-[#F7EEDF] border-[#3E2F2A]/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PlayerAvatar avatarId={st.avatarId} size={32} />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base sm:text-lg text-[#3E2F2A]">
                        {idx + 1}. {st.nickname} {st.isWinner ? '🏆' : ''}
                      </span>
                      {st.isWinner && isSharedVictory && (
                        <span className="text-xs font-bold text-[#3F5E4A]">
                          · Victoria compartida
                        </span>
                      )}
                    </div>
                    <span className="block text-xs text-[#6F5A4E] tabular-nums">
                      Mesas y barra: <strong>{st.tablePoints} pts</strong>
                      {recountStep !== 'table' && (
                        <>
                          {' · '}Penalización:{' '}
                          <strong className="text-[#A94438]">
                            -{Math.abs(st.penalty)} pts
                          </strong>{' '}
                          ({st.naturalLeft} nat. / {st.jokerLeft} com.)
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CoinTray
                    score={shownScore}
                    playerId={st.id}
                    reducedMotion={reducedMotion}
                  />
                  <div className="font-serif font-bold text-xl sm:text-2xl text-[#3E2F2A] tabular-nums">
                    <AnimatedScore value={shownScore} reducedMotion={reducedMotion} /> pts
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {postcardUrl && (
          <div className="bg-[#F7EEDF] p-3 rounded-2xl text-center space-y-2">
            <img
              src={postcardUrl}
              alt="Postal de resultado de Cafetulia"
              referrerPolicy="no-referrer"
              className="mx-auto rounded-xl border border-[#3E2F2A]/20 max-h-48"
            />
            <a
              href={postcardUrl}
              download={`cafetulia-${snapshot.code}.png`}
              className="inline-block px-4 py-1.5 rounded-xl bg-[#3F5E4A] text-[#FFF9F0] text-xs font-bold"
            >
              Descargar imagen PNG
            </a>
          </div>
        )}

        <div className="pt-3 border-t border-[#3E2F2A]/10 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={generatePostcard}
            className="px-3.5 py-2 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/20 text-xs font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            Generar postal
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={leaveRoom}
              className="px-3.5 py-2 rounded-xl bg-[#F7EEDF] text-xs font-semibold text-[#6F5A4E] hover:text-[#3E2F2A] cursor-pointer"
            >
              Portada
            </button>
            <button
              type="button"
              data-start="true"
              data-testid="rematch-btn"
              onClick={() => void voteRematch(true)}
              className="px-4 py-2 rounded-xl bg-[#C96F4A] text-[#FFF9F0] text-xs font-bold cursor-pointer"
            >
              Votar revancha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
