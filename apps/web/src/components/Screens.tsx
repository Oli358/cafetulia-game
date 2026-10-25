import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  finalScores,
  getLegalMoves,
  type Nation,
  type Seat,
  type Table,
  type Tile,
} from '@cafetulia/engine';
import { getCharacterProfile, NATION_VISUALS } from '@cafetulia/ui';
import { soundEngine } from '../audio/soundEngine';
import { CafetuliaLogo, CharacterPortrait, FlagBadge } from '../art/CharacterPortrait';
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
import { PapercraftBoard } from './PapercraftBoard';

export function TitleScreen(): React.ReactElement {
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const quickStartWithBots = useGameStore((s) => s.quickStartWithBots);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const fetchHistory = useGameStore((s) => s.fetchHistory);
  const errorBanner = useGameStore((s) => s.errorBanner);
  const isBusy = useGameStore((s) => s.isBusy);

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinAsSpectator, setJoinAsSpectator] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
        <div className="lg:col-span-7 space-y-6">
          <CafetuliaLogo />

          <p className="text-base sm:text-lg text-[#6F5A4E] max-w-xl leading-relaxed">
            Acomoda a los invitados de doce naciones alrededor de las mesas del café, combina las
            sillas compartidas sin romper el equilibrio de parejas y evita que la barra se llene.
          </p>

          <div className="bg-[#FFF9F0] p-4 sm:p-5 rounded-[24px] border border-[#3E2F2A]/12 shadow-[0_8px_24px_rgba(62,47,42,0.08)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center -space-x-2">
              <CharacterPortrait nation="fr" gender="F" size={54} sipping />
              <CharacterPortrait nation="it" gender="M" size={54} />
              <CharacterPortrait nation="ch" gender="F" size={54} />
              <CharacterPortrait nation="cu" gender="F" size={54} />
            </div>
            <div className="text-xs sm:text-sm text-[#6F5A4E]">
              <strong className="text-[#3E2F2A] block font-serif text-base">
                Tablero oficial de 24 mesas y 68 sillas
              </strong>
              <span>24 personajes con carácter · Manos públicas · Sin registro</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#FFF9F0] p-6 sm:p-7 rounded-[24px] border border-[#3E2F2A]/15 shadow-[0_8px_24px_rgba(62,47,42,0.12)] space-y-5">
          <div>
            <label
              htmlFor="nickname-input"
              className="block text-xs font-bold text-[#6F5A4E] mb-1.5"
            >
              Tu apodo en la tertulia
            </label>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ej. Cafetero"
              maxLength={24}
              className="w-full h-11 px-3.5 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/25 text-[#3E2F2A] font-semibold focus:outline-2 focus:outline-[#C96F4A]"
            />
          </div>

          {errorBanner && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-[#FDECEB] border border-[#A94438]/30 text-xs font-semibold text-[#A94438]"
            >
              {errorBanner}
            </div>
          )}

          <div className="space-y-2.5">
            <button
              type="button"
              data-start="true"
              data-testid="quick-start-btn"
              disabled={isBusy}
              onClick={() => {
                soundEngine.unlock();
                void quickStartWithBots(1, 'medium');
              }}
              className="w-full h-12 rounded-xl bg-[#C96F4A] text-[#FFF9F0] font-bold text-base shadow-sm hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
            >
              Partida rápida (contra Bot)
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
              Crear mesa privada (2–4 jugadores)
            </button>
          </div>

          <hr className="border-[#3E2F2A]/10" />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              soundEngine.unlock();
              void joinRoom(joinCodeInput, joinAsSpectator);
            }}
            className="space-y-2.5"
          >
            <label
              htmlFor="room-code-input"
              className="block text-xs font-bold text-[#6F5A4E]"
            >
              Unirse a una mesa con código
            </label>
            <div className="flex gap-2">
              <input
                id="room-code-input"
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="CÓDIGO (6 letras)"
                maxLength={8}
                className="flex-1 h-11 px-3.5 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/25 text-[#3E2F2A] font-mono font-bold uppercase tracking-wider focus:outline-2 focus:outline-[#C96F4A]"
              />
              <button
                type="submit"
                data-testid="join-room-btn"
                disabled={isBusy}
                className="px-5 h-11 rounded-xl bg-[#3F5E4A] text-[#FFF9F0] font-bold text-sm hover:opacity-95 cursor-pointer disabled:opacity-50"
              >
                Unirse
              </button>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-[#6F5A4E] cursor-pointer pt-0.5">
              <input
                type="checkbox"
                checked={joinAsSpectator}
                onChange={(e) => setJoinAsSpectator(e.target.checked)}
                className="accent-[#C96F4A]"
              />
              <span>Entrar solo como espectador</span>
            </label>
          </form>
        </div>
      </div>

      <footer className="pt-4 border-t border-[#3E2F2A]/10 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-[#6F5A4E]">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveModal('tutorial')}
            className="font-semibold text-[#3E2F2A] hover:underline cursor-pointer"
          >
            Tutorial (3 pasos)
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setActiveModal('rules')}
            className="font-semibold text-[#3E2F2A] hover:underline cursor-pointer"
          >
            Reglamento
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => {
              void fetchHistory();
              setActiveModal('stats');
            }}
            className="font-semibold text-[#3E2F2A] hover:underline cursor-pointer"
          >
            Estadísticas e historial
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setActiveModal('settings')}
            className="font-semibold text-[#3E2F2A] hover:underline cursor-pointer"
          >
            Ajustes
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setActiveModal('ios_pwa')}
            className="font-semibold text-[#C96F4A] hover:underline cursor-pointer"
          >
            Instalar en móvil
          </button>
        </div>
        <div className="text-xs text-[#6F5A4E]">
          Toca carta y silla · Sin scroll · Enter para partida rápida
        </div>
      </footer>
    </div>
  );
}

export function LobbyScreen(): React.ReactElement {
  const snapshot = useGameStore((s) => s.snapshot);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const updateRoomConfig = useGameStore((s) => s.updateRoomConfig);
  const toggleReady = useGameStore((s) => s.toggleReady);
  const addBot = useGameStore((s) => s.addBot);
  const removeBot = useGameStore((s) => s.removeBot);
  const startGame = useGameStore((s) => s.startGame);
  const leaveRoom = useGameStore((s) => s.leaveRoom);
  const errorBanner = useGameStore((s) => s.errorBanner);

  const [copied, setCopied] = useState(false);
  const [botDiff, setBotDiff] = useState<'basic' | 'medium' | 'hard'>('medium');

  if (!snapshot) return <div />;

  const isHost = snapshot.hostId === myPlayerId;
  const me = snapshot.members.find((m) => m.id === myPlayerId);
  const activeSeatMembers = snapshot.members.filter(
    (m) => m.role === 'player' || m.role === 'bot',
  );
  const spectators = snapshot.members.filter((m) => m.role === 'spectator');

  const copyInvite = () => {
    const url = `${window.location.origin}/?room=${snapshot.code}`;
    void navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto flex flex-col justify-center">
      <div className="bg-[#FFF9F0] rounded-[24px] border border-[#3E2F2A]/15 p-6 sm:p-8 shadow-[0_8px_24px_rgba(62,47,42,0.12)] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3E2F2A]/10 pb-4">
          <div>
            <span className="text-xs font-bold text-[#6F5A4E]">Sala de espera</span>
            <h1 className="font-serif font-bold text-3xl text-[#3E2F2A] mt-0.5">
              Mesa #{snapshot.code}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyInvite}
              className="px-4 py-2 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/20 text-xs font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
            >
              {copied ? '✓ Enlace copiado' : 'Copiar invitación'}
            </button>
            <button
              type="button"
              onClick={leaveRoom}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#A94438] hover:bg-[#FDECEB] cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>

        {errorBanner && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-[#FDECEB] border border-[#A94438]/30 text-xs font-semibold text-[#A94438]"
          >
            {errorBanner}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="font-serif font-bold text-lg">
              Tertulianos en la mesa ({activeSeatMembers.length}/{snapshot.config.maxPlayers})
            </h2>
            <div className="space-y-2">
              {activeSeatMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between bg-[#F7EEDF] px-4 py-3 rounded-2xl border border-[#3E2F2A]/10"
                >
                  <div>
                    <span className="font-bold text-sm text-[#3E2F2A]">
                      {m.nickname}
                      {m.id === snapshot.hostId ? ' (Anfitrión)' : ''}
                      {m.id === myPlayerId ? ' · Tú' : ''}
                    </span>
                    <span className="block text-xs text-[#6F5A4E]">
                      {m.role === 'bot'
                        ? `Autómata · Nivel ${
                            m.botDifficulty === 'hard'
                              ? 'Difícil'
                              : m.botDifficulty === 'medium'
                                ? 'Medio'
                                : 'Básico'
                          }`
                        : m.ready
                          ? 'Listo para empezar'
                          : 'Preparándose...'}
                    </span>
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

            {isHost && activeSeatMembers.length < snapshot.config.maxPlayers && (
              <div className="pt-2 flex items-center gap-2">
                <select
                  aria-label="Nivel del bot"
                  value={botDiff}
                  onChange={(e) => setBotDiff(e.target.value as 'basic' | 'medium' | 'hard')}
                  className="h-10 px-3 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/20 text-xs font-semibold"
                >
                  <option value="basic">Bot Básico</option>
                  <option value="medium">Bot Medio</option>
                  <option value="hard">Bot Difícil</option>
                </select>
                <button
                  type="button"
                  data-testid="add-bot-btn"
                  onClick={() => void addBot(botDiff)}
                  className="px-4 h-10 rounded-xl bg-[#3F5E4A] text-[#FFF9F0] text-xs font-bold cursor-pointer"
                >
                  + Añadir Bot
                </button>
              </div>
            )}

            {spectators.length > 0 && (
              <div className="pt-2 text-xs text-[#6F5A4E]">
                Espectadores ({spectators.length}): {spectators.map((s) => s.nickname).join(', ')}
              </div>
            )}
          </div>

          <div className="bg-[#F7EEDF] p-4 sm:p-5 rounded-2xl space-y-4">
            <h2 className="font-serif font-bold text-lg">Opciones de la partida</h2>

            <label className="block text-xs font-semibold text-[#6F5A4E]">
              Máximo de jugadores
              <select
                disabled={!isHost}
                value={snapshot.config.maxPlayers}
                onChange={(e) =>
                  void updateRoomConfig({
                    maxPlayers: Number(e.target.value) as 2 | 3 | 4,
                  })
                }
                className="mt-1 w-full h-10 px-3 rounded-xl bg-[#FFF9F0] border border-[#3E2F2A]/20 text-sm text-[#3E2F2A] font-semibold"
              >
                <option value={2}>2 jugadores</option>
                <option value={3}>3 jugadores</option>
                <option value={4}>4 jugadores</option>
              </select>
            </label>

            <label className="block text-xs font-semibold text-[#6F5A4E]">
              Temporizador por turno (máx. 180 s)
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
                className="mt-1 w-full h-10 px-3 rounded-xl bg-[#FFF9F0] border border-[#3E2F2A]/20 text-sm text-[#3E2F2A] font-semibold"
              >
                <option value={0}>Sin reloj (partida relajada)</option>
                <option value={30}>30 segundos</option>
                <option value={60}>60 segundos</option>
                <option value={90}>90 segundos</option>
                <option value={120}>120 segundos</option>
                <option value={180}>180 segundos</option>
              </select>
            </label>

            <p className="text-xs text-[#6F5A4E] leading-relaxed">
              Si el reloj llega a cero, el servidor ejecuta una jugada automática sensata y la
              anota en el registro de la partida.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#3E2F2A]/10 flex flex-wrap items-center justify-between gap-3">
          {me && me.role === 'player' && (
            <button
              type="button"
              onClick={() => void toggleReady(!me.ready)}
              className={`px-5 h-11 rounded-xl font-bold text-sm cursor-pointer ${
                me.ready
                  ? 'bg-[#3F5E4A] text-[#FFF9F0]'
                  : 'bg-[#F7EEDF] text-[#3E2F2A] border border-[#3E2F2A]/25'
              }`}
            >
              {me.ready ? '✓ Estoy listo' : 'Marcar como listo'}
            </button>
          )}

          {isHost && (
            <button
              type="button"
              data-testid="start-game-btn"
              disabled={activeSeatMembers.length < 2}
              onClick={() => void startGame()}
              className="px-6 h-12 rounded-xl bg-[#C96F4A] text-[#FFF9F0] font-bold text-base shadow-sm hover:opacity-95 disabled:opacity-45 cursor-pointer ml-auto"
            >
              Empezar partida ({activeSeatMembers.length} jugadores)
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
  const lastLogLengthRef = useRef<number>(0);

  const gameState = snapshot?.gameState;

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

  // Auto-dismiss chair toast after 3.5 seconds
  useEffect(() => {
    if (!chairToast) return;
    const t = setTimeout(() => setChairToast(null), 3500);
    return () => clearTimeout(t);
  }, [chairToast]);

  // Detect new scoring or bar penalty events in gameState.log and trigger flying coins + ceramic clink
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
    for (let i = 0; i < newEvents.length; i++) {
      const ev = newEvents[i];
      if (!ev) continue;
      if (ev.type === 'tile_seated' && ev.pointsEarned > 0) {
        flights.push({
          id: `flight-${Date.now()}-${i}`,
          playerId: ev.playerId,
          delta: ev.pointsEarned,
          sourceSelector: `[data-seat-id="${ev.seatId}"]`,
          targetSelector: `[data-player-tray="${ev.playerId}"]`,
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
        }
      }
    }

    if (flights.length > 0) {
      const hasNegative = flights.some((f) => f.delta < 0);
      soundEngine.playSfx(hasNegative ? 'coinPenalty' : 'coinClink');
      setCoinFlights(flights);
      const clearTimer = setTimeout(() => setCoinFlights([]), 900);
      return () => clearTimeout(clearTimer);
    }
  }, [gameState, gameState?.log.length]);

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
      className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between px-2 py-1.5 sm:px-4 sm:py-2 max-w-[1440px] mx-auto select-none"
      data-testid="playing-viewport"
    >
      {/* Flying Coins Animation Overlay */}
      <FlyingCoinsLayer flights={coinFlights} reducedMotion={reducedMotion} />

      {/* TOP COMPACT HEADER + SCOREBOARD BAR */}
      <header className="shrink-0 bg-[#FFF9F0] rounded-2xl border border-[#3E2F2A]/15 px-2.5 py-1.5 shadow-xs flex flex-wrap items-center justify-between gap-1.5 z-30">
        {/* Left: Brand, Room Code, Turn Pill, Timer */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <CafetuliaLogo compact />
          <span className="hidden sm:inline-block text-[11px] font-mono font-bold text-[#6F5A4E] bg-[#F7EEDF] px-2 py-0.5 rounded-lg">
            #{snapshot.code}
          </span>
          <div
            className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              isMyTurn
                ? 'bg-[#C96F4A] text-[#FFF9F0] shadow-xs'
                : 'bg-[#F7EEDF] text-[#3E2F2A] border border-[#3E2F2A]/15'
            }`}
            data-testid="turn-indicator"
          >
            {isMyTurn
              ? `Tu turno`
              : `Turno: ${activePlayerObj?.nickname ?? 'Rival'}`}
          </div>
          {remainingSeconds !== null && (
            <span
              className={`text-[11px] font-mono font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                remainingSeconds <= 10
                  ? 'bg-[#FDECEB] text-[#A94438]'
                  : 'bg-[#F7EEDF] text-[#3E2F2A]'
              }`}
            >
              ⏱ {remainingSeconds}s
            </span>
          )}
        </div>

        {/* Center: Compact Player Scoreboard with Coin Trays & Card Counts */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full py-0.5"
          data-testid="compact-scoreboard"
        >
          {gameState.players.map((p) => {
            const pHandCount = (gameState.hands[p.id] ?? []).length;
            const isTurn = gameState.turn === p.id;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs transition-colors whitespace-nowrap ${
                  isTurn
                    ? 'bg-[#FEF6E0] border-[#C96F4A] font-bold'
                    : 'bg-[#F7EEDF] border-[#3E2F2A]/12'
                }`}
              >
                <span className="font-bold text-[#3E2F2A] truncate max-w-[72px] sm:max-w-[96px]">
                  {p.nickname}
                </span>
                <CoinTray
                  score={p.score}
                  playerId={p.id}
                  compact
                  reducedMotion={reducedMotion}
                />
                <span
                  className="text-[10px] font-mono font-semibold text-[#6F5A4E] bg-[#FFF9F0] px-1.5 py-0.2 rounded border border-[#3E2F2A]/15 tabular-nums"
                  title={`${pHandCount} cartas en mano`}
                >
                  {pHandCount}c
                </span>
              </div>
            );
          })}

          <span
            className="hidden md:inline-block text-[11px] font-mono font-bold text-[#6F5A4E] bg-[#F7EEDF] px-2 py-1 rounded-xl tabular-nums"
            title="Fichas restantes en la bolsa"
          >
            Bolsa: {gameState.bag.length}
          </span>
        </div>

        {/* Right: Rival Hands Dropdown, "Ver café" 3D Modal, Log/Chat Drawer, Settings */}
        <div className="flex items-center gap-1 text-xs relative">
          {/* Rival Hands Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              data-testid="rival-hands-btn"
              onClick={() => setRivalHandsOpen((v) => !v)}
              aria-expanded={rivalHandsOpen}
              className="min-h-[36px] sm:min-h-[34px] px-2.5 py-1 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/15 font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer whitespace-nowrap"
            >
              Manos
            </button>

            {rivalHandsOpen && (
              <div
                data-testid="rival-hands-popover"
                className="
                  fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full mt-1 z-50
                  w-[min(92vw,340px)] bg-[#FFF9F0] text-[#3E2F2A] rounded-2xl p-3
                  border-2 border-[#8B5E3C] shadow-[0_12px_32px_rgba(62,47,42,0.25)] space-y-2.5
                "
              >
                <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-1.5">
                  <span className="font-serif font-bold text-sm">
                    Manos públicas en la mesa
                  </span>
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
                  return (
                    <div key={p.id} className="bg-[#F7EEDF] p-2 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold">
                          {p.nickname} {p.id === myPlayerId ? '(Tú)' : ''}
                        </span>
                        <span className="font-mono text-[11px] text-[#6F5A4E]">
                          {p.score} pts · {pHand.length} cartas
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
                              <span className="text-[#6F5A4E]">{prof.genderSymbol}</span>
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

          {/* "Ver café" 3D Diorama Modal Button */}
          <button
            type="button"
            data-testid="open-3d-cafe-btn"
            onClick={() => setCafeModalOpen(true)}
            className="min-h-[36px] sm:min-h-[34px] px-2.5 py-1 rounded-xl bg-[#3F5E4A] text-[#FFF9F0] font-bold hover:opacity-95 cursor-pointer whitespace-nowrap"
          >
            Ver café
          </button>

          {/* Lateral Log & Chat Drawer Toggle */}
          <button
            type="button"
            data-testid="open-drawer-btn"
            onClick={() => setDrawerOpen((v) => !v)}
            className="min-h-[36px] sm:min-h-[34px] px-2.5 py-1 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/15 font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer whitespace-nowrap"
          >
            Tertulia ({gameState.log.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('rules')}
            aria-label="Reglamento"
            className="min-h-[36px] sm:min-h-[34px] px-2 py-1 rounded-xl bg-[#F7EEDF] font-semibold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer hidden sm:inline-block"
          >
            Reglas
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('settings')}
            aria-label="Ajustes"
            className="min-h-[36px] sm:min-h-[34px] px-2.5 py-1 rounded-xl bg-[#F7EEDF] font-semibold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            Ajustes
          </button>

          <button
            type="button"
            onClick={leaveRoom}
            aria-label="Salir de la partida"
            className="min-h-[36px] sm:min-h-[34px] px-2 py-1 rounded-xl text-[#A94438] font-bold hover:bg-[#FDECEB] cursor-pointer"
          >
            Salir
          </button>
        </div>
      </header>

      {/* CENTER BOARD WORKSPACE (Takes remaining height, zero overflow) */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center relative overflow-hidden">
        {errorBanner && (
          <div
            role="alert"
            className="absolute top-2 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-xl bg-[#FDECEB] border border-[#A94438] text-xs font-bold text-[#A94438] shadow-md"
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

      {/* BOTTOM FIXED HAND DOCK (2:3 Fanned Character Cards + Confirm Action) */}
      <section
        aria-label="Tu mano de invitados"
        data-testid="player-hand-dock"
        className="shrink-0 bg-[#FFF9F0] rounded-2xl border border-[#3E2F2A]/15 px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-[0_-4px_18px_rgba(62,47,42,0.08)] z-30 flex flex-col sm:flex-row items-center justify-between gap-2"
      >
        {/* Left / Top Mini Status & Joker Nation Selector */}
        <div className="flex flex-wrap items-center justify-between w-full sm:w-auto gap-2">
          <div className="text-xs">
            <span className="font-serif font-bold text-[#3E2F2A] block leading-tight">
              Tu mano ({myHand.length}/{gameState.handSize[myPlayerId ?? activePlayerId] ?? 5})
            </span>
            <span className="text-[11px] text-[#6F5A4E] hidden md:inline">
              {draftPlacements.length > 0
                ? draftEvaluation.summaryText
                : selectedTile
                  ? 'Elige una silla iluminada o sirve en la barra central'
                  : 'Toca un personaje para iluminar sus sillas'}
            </span>
          </div>

          {selectedTile?.nation === 'joker' && (
            <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6F5A4E]">
              <span>País comodín:</span>
              <select
                aria-label="Nacionalidad para el comodín"
                value={preferredJokerNation ?? ''}
                onChange={(e) =>
                  setPreferredJokerNation(
                    e.target.value ? (e.target.value as Nation) : undefined,
                  )
                }
                className="h-8 px-2 rounded-lg bg-[#F7EEDF] border border-[#3E2F2A]/25 text-xs font-bold text-[#3E2F2A]"
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

        {/* Center: Fanned 2:3 Character Cards (5-col fit on mobile, fanned arc on desktop) */}
        <div className="grid grid-cols-5 gap-1 w-full sm:w-auto sm:flex sm:items-end sm:justify-center sm:gap-2.5 py-0.5">
          {myHand.map((tile, idx) => {
            const isSelected = selectedTileId === tile.id;
            const isInDraft = draftPlacements.some((d) => d.tileId === tile.id);
            const profile = getCharacterProfile(tile.nation, tile.gender, tile.jokerNation);
            const mid = (myHand.length - 1) / 2;
            const fanAngle = reducedMotion ? 0 : (idx - mid) * 2.2;
            const fanLift = reducedMotion ? 0 : Math.abs(idx - mid) * 1.5;

            return (
              <button
                key={tile.id}
                type="button"
                data-tile-id={tile.id}
                disabled={isInDraft}
                onClick={() => selectTile(isSelected ? null : tile.id)}
                aria-label={`Carta ${profile.name}, ${profile.countryName}, ${profile.genderLabel}`}
                style={{
                  transform: isSelected
                    ? 'translateY(-6px) scale(1.04)'
                    : `translateY(${fanLift}px) rotate(${fanAngle}deg)`,
                }}
                className={`group relative aspect-[2/3] w-full sm:w-auto sm:h-[124px] min-h-[92px] rounded-xl border-2 px-1 sm:px-1.5 py-1 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none shrink-0 ${
                  isInDraft
                    ? 'opacity-35 bg-[#F7EEDF] border-[#3E2F2A]/20'
                    : isSelected
                      ? 'bg-[#FEF6E0] border-[#C96F4A] shadow-[0_8px_18px_rgba(201,111,74,0.28)] z-20'
                      : 'bg-[#FFF9F0] border-[#3E2F2A]/25 hover:border-[#3E2F2A] shadow-xs'
                }`}
              >
                {/* Card Header: Flag + Country Name + Gender Symbol */}
                <div className="w-full flex items-center justify-between gap-0.5 text-[8px] sm:text-[10px] font-bold text-[#3E2F2A]">
                  <span className="inline-flex items-center gap-0.5 truncate">
                    <FlagBadge nation={tile.nation} size={10} />
                    <span className="truncate">{profile.countryName}</span>
                  </span>
                  <span
                    className={`shrink-0 font-extrabold ${
                      tile.gender === 'F' ? 'text-[#C96F4A]' : 'text-[#2F4A6D]'
                    }`}
                    title={profile.genderLabel}
                  >
                    {profile.genderSymbol}
                  </span>
                </div>

                {/* Large Portrait */}
                <div className="my-auto flex items-center justify-center">
                  <CharacterPortrait
                    nation={tile.nation}
                    gender={tile.gender}
                    size={38}
                    sipping={isSelected}
                  />
                </div>

                {/* Character Proper Name & Personality Quote */}
                <div className="w-full">
                  <span className="block font-serif font-bold text-[10px] sm:text-xs text-[#3E2F2A] leading-none truncate">
                    {profile.name}
                  </span>
                  <span className="hidden sm:block text-[8px] text-[#6F5A4E] italic leading-tight line-clamp-2 mt-0.5">
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

      {/* ON-DEMAND "VER CAFÉ" 3D DIORAMA MODAL */}
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
                  Diorama 3D del Café
                </h2>
                <p className="text-xs text-[#6F5A4E]">
                  Vista panorámica en papercraft de las 24 mesas, las fichas y el gato junto al tirador
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
                        desc = 'jugada automática por agotarse el tiempo';
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
                      return (
                        <div
                          key={`${ev.type}-${i}`}
                          className="p-2.5 rounded-xl bg-[#F7EEDF] text-[#3E2F2A] flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold">{pl?.nickname ?? pid}:</span>{' '}
                            <span>{desc}</span>
                          </div>
                          {delta !== null && (
                            <span
                              className={`font-mono font-bold tabular-nums ${
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
                    snapshot.chat.map((msg) => (
                      <div key={msg.id} className="p-2 rounded-xl bg-[#F7EEDF]">
                        <span className="font-bold text-[#3E2F2A]">{msg.nickname}: </span>
                        <span className={msg.emote ? 'text-base' : 'text-[#6F5A4E]'}>
                          {msg.emote ?? msg.text}
                        </span>
                      </div>
                    ))
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
      return {
        id: p.id,
        nickname: p.nickname,
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
    <div className="min-h-screen p-4 sm:p-8 max-w-3xl mx-auto flex flex-col justify-center relative overflow-hidden">
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

      <div className="relative z-20 bg-[#FFF9F0] rounded-[24px] border border-[#3E2F2A]/15 p-6 sm:p-8 shadow-[0_8px_24px_rgba(62,47,42,0.14)] space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-[#C96F4A]">Recuento de cierre del café</span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#3E2F2A]">
            {isSharedVictory ? '¡Victoria compartida!' : '¡Fin de la partida!'}
          </h1>
          <p className="text-sm text-[#6F5A4E]">
            {reasonLabels[
              shareResult?.terminalReason ??
                snapshot.gameState.terminalReason ??
                'last_seat_occupied'
            ] ?? 'Partida concluida.'}
          </p>
        </div>

        {/* Final Standings Breakdown with Animated Recount & Coin Trays */}
        <div className="space-y-2.5">
          {standings.map((st, idx) => {
            const shownScore =
              recountStep === 'table' ? st.tablePoints : st.finalScore;

            return (
              <div
                key={st.id}
                className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 transition-all ${
                  st.isWinner
                    ? 'bg-[#FEF6E0] border-[#C9A227] border-2 shadow-sm'
                    : 'bg-[#F7EEDF] border-[#3E2F2A]/10'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-lg text-[#3E2F2A]">
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
                        {' · '}Penalización de mano:{' '}
                        <strong className="text-[#A94438]">
                          -{Math.abs(st.penalty)} pts
                        </strong>{' '}
                        ({st.naturalLeft} naturales y {st.jokerLeft} comodines)
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CoinTray
                    score={shownScore}
                    playerId={st.id}
                    reducedMotion={reducedMotion}
                  />
                  <div className="font-serif font-bold text-2xl text-[#3E2F2A] tabular-nums">
                    <AnimatedScore value={shownScore} reducedMotion={reducedMotion} /> pts
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {postcardUrl && (
          <div className="bg-[#F7EEDF] p-4 rounded-2xl text-center space-y-2">
            <img
              src={postcardUrl}
              alt="Postal de resultado de Cafetulia"
              referrerPolicy="no-referrer"
              className="mx-auto rounded-xl border border-[#3E2F2A]/20 max-h-60"
            />
            <a
              href={postcardUrl}
              download={`cafetulia-${snapshot.code}.png`}
              className="inline-block px-4 py-2 rounded-xl bg-[#3F5E4A] text-[#FFF9F0] text-xs font-bold"
            >
              Descargar imagen PNG
            </a>
          </div>
        )}

        <div className="pt-4 border-t border-[#3E2F2A]/10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={generatePostcard}
            className="px-4 py-2.5 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/20 text-xs sm:text-sm font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            Generar postal para compartir
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={leaveRoom}
              className="px-4 py-2.5 rounded-xl bg-[#F7EEDF] text-xs sm:text-sm font-semibold text-[#6F5A4E] hover:text-[#3E2F2A] cursor-pointer"
            >
              Volver a portada
            </button>
            <button
              type="button"
              data-start="true"
              data-testid="rematch-btn"
              onClick={() => void voteRematch(true)}
              className="px-5 py-2.5 rounded-xl bg-[#C96F4A] text-[#FFF9F0] text-xs sm:text-sm font-bold cursor-pointer"
            >
              Votar revancha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
