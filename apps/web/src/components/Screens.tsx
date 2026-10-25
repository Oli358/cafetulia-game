import React, { useEffect, useMemo, useState } from 'react';
import {
  finalScores,
  getLegalMoves,
  type Nation,
  type Seat,
  type Table,
  type Tile,
} from '@cafetulia/engine';
import { NATION_VISUALS, type NationKey } from '@cafetulia/ui';
import { soundEngine } from '../audio/soundEngine';
import { CafetuliaLogo, CharacterPortrait, FlagBadge } from '../art/CharacterPortrait';
import { useGameStore } from '../store/gameStore';
import {
  evaluateDraftPlacements,
  getNationName,
  inspectSeatsForSelectedTile,
} from '../utils/moveHelper';
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
      {/* Main Hero & Interactive Showcase */}
      <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
        {/* Left column: Brand lockup + Cozy Cafe Vignette */}
        <div className="lg:col-span-7 space-y-6">
          <CafetuliaLogo />

          <p className="text-base sm:text-lg text-[#6F5A4E] max-w-xl leading-relaxed">
            Acomoda a los invitados de doce naciones alrededor de las mesas del café, combina las
            sillas compartidas sin romper el equilibrio de parejas y evita que la barra se llene.
          </p>

          {/* Character showcase vignette */}
          <div className="bg-[#FFF9F0] p-4 sm:p-5 rounded-[24px] border border-[#3E2F2A]/12 shadow-[0_8px_24px_rgba(62,47,42,0.08)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center -space-x-2">
              <CharacterPortrait nation="fr" gender="F" size={54} sipping />
              <CharacterPortrait nation="it" gender="M" size={54} />
              <CharacterPortrait nation="es" gender="F" size={54} />
              <CharacterPortrait nation="joker" gender="M" size={54} />
            </div>
            <div className="text-xs sm:text-sm text-[#6F5A4E]">
              <strong className="text-[#3E2F2A] block font-serif text-base">
                Tablero oficial de 24 mesas y 68 sillas
              </strong>
              <span>100 fichas · Manos públicas · Sin registro ni cuentas</span>
            </div>
          </div>
        </div>

        {/* Right column: Action Panel */}
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

          {/* Join by Room Code */}
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

      {/* Footer Clean Navigation & Control Hints */}
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
          Toca carta y silla · Vista 2.5D y 2D · Enter para partida rápida
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
          {/* Players and Bots list */}
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

            {/* Host Bot Adder */}
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

          {/* Room Configuration */}
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

        {/* Bottom Lobby CTAs */}
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
  const viewMode = useGameStore((s) => s.viewMode);
  const cameraAngleIndex = useGameStore((s) => s.cameraAngleIndex);
  const cameraZoom = useGameStore((s) => s.cameraZoom);
  const nightMode = useGameStore((s) => s.nightMode);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const contextualHints = useGameStore((s) => s.contextualHints);
  const errorBanner = useGameStore((s) => s.errorBanner);
  const whyCannotBanner = useGameStore((s) => s.whyCannotBanner);

  const selectTile = useGameStore((s) => s.selectTile);
  const setPreferredJokerNation = useGameStore((s) => s.setPreferredJokerNation);
  const clearDraft = useGameStore((s) => s.clearDraft);
  const addDraftPlacement = useGameStore((s) => s.addDraftPlacement);
  const setPendingNegativeConfirm = useGameStore((s) => s.setPendingNegativeConfirm);
  const setWhyCannotBanner = useGameStore((s) => s.setWhyCannotBanner);
  const setFocusedTableId = useGameStore((s) => s.setFocusedTableId);
  const setViewMode = useGameStore((s) => s.setViewMode);
  const cycleCameraAngle = useGameStore((s) => s.cycleCameraAngle);
  const resetCamera = useGameStore((s) => s.resetCamera);
  const setCameraZoom = useGameStore((s) => s.setCameraZoom);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const submitMove = useGameStore((s) => s.submitMove);
  const sendChat = useGameStore((s) => s.sendChat);
  const leaveRoom = useGameStore((s) => s.leaveRoom);

  const [sideTab, setSideTab] = useState<'log' | 'chat'>('log');
  const [chatInput, setChatInput] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const gameState = snapshot?.gameState;

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

  const handleSeatClick = (seat: Seat) => {
    if (!isMyTurn) {
      setWhyCannotBanner('Espera tu turno para colocar invitados en las mesas.');
      return;
    }
    if (!selectedTile) {
      setWhyCannotBanner('Primero selecciona una carta de tu mano en la parte inferior.');
      return;
    }
    const inspect = seatInspections[seat.id];
    if (!inspect || inspect.status === 'illegal') {
      setWhyCannotBanner(inspect?.whyCannotText ?? 'No puedes colocar esta ficha en esa silla.');
      return;
    }
    if (inspect.status === 'selected') {
      return;
    }

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
      setWhyCannotBanner('Solo puedes enviar invitados a la barra durante tu turno.');
      return;
    }
    if (draftPlacements.length > 0) {
      setWhyCannotBanner(
        'No puedes combinar sillas de mesa y barra en el mismo turno. Limpia primero tu selección.',
      );
      return;
    }
    if (!selectedTile) {
      setWhyCannotBanner('Selecciona primero una carta natural de tu mano para enviarla a la barra.');
      return;
    }
    if (selectedTile.nation === 'joker') {
      setWhyCannotBanner('Los comodines nunca pueden enviarse a la barra.');
      return;
    }

    const nextBarIdx = gameState.bar.findIndex((b) => b === null);
    const barPoints = nextBarIdx >= 0 ? (gameState.barValues[nextBarIdx] ?? -14) : -14;
    const barMove = { type: 'bar' as const, tileId: selectedTile.id };

    if (barPoints < 0) {
      setPendingNegativeConfirm({
        move: barMove,
        points: barPoints,
        description: `Vas a colocar a tu invitado de ${getNationName(
          selectedTile.nation,
        )} en la plaza ${nextBarIdx + 1} de la barra.`,
      });
      return;
    }

    void submitMove(barMove);
  };

  return (
    <div className="min-h-screen flex flex-col p-2 sm:p-4 max-w-[1440px] mx-auto gap-3">
      {/* Top Discrete Header HUD */}
      <header className="bg-[#FFF9F0] rounded-2xl border border-[#3E2F2A]/15 px-3.5 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <CafetuliaLogo compact />
          <span className="text-xs font-mono font-bold text-[#6F5A4E] bg-[#F7EEDF] px-2.5 py-1 rounded-lg">
            Sala {snapshot.code}
          </span>
          <div
            className={`px-3 py-1 rounded-xl text-xs font-bold ${
              isMyTurn
                ? 'bg-[#C96F4A] text-[#FFF9F0]'
                : 'bg-[#F7EEDF] text-[#3E2F2A] border border-[#3E2F2A]/15'
            }`}
            data-testid="turn-indicator"
          >
            {isMyTurn
              ? `Tu turno (${activePlayerObj?.nickname ?? 'Jugador'})`
              : `Turno de ${activePlayerObj?.nickname ?? 'Rival'}`}
          </div>
          {remainingSeconds !== null && (
            <span
              className={`text-xs font-mono font-bold tabular-nums px-2.5 py-1 rounded-lg ${
                remainingSeconds <= 10
                  ? 'bg-[#FDECEB] text-[#A94438]'
                  : 'bg-[#F7EEDF] text-[#3E2F2A]'
              }`}
            >
              ⏱ {remainingSeconds}s
            </span>
          )}
        </div>

        {/* Camera & Utility Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className="px-2.5 py-1.5 rounded-lg bg-[#F7EEDF] font-semibold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            {viewMode === '3d' ? 'Vista 2D' : 'Vista 2.5D'}
          </button>
          {viewMode === '3d' && (
            <>
              <button
                type="button"
                onClick={cycleCameraAngle}
                className="px-2.5 py-1.5 rounded-lg bg-[#F7EEDF] font-semibold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
              >
                Girar 90°
              </button>
              <button
                type="button"
                onClick={() => setCameraZoom(cameraZoom + 0.15)}
                aria-label="Acercar cámara"
                className="px-2 py-1.5 rounded-lg bg-[#F7EEDF] font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setCameraZoom(cameraZoom - 0.15)}
                aria-label="Alejar cámara"
                className="px-2 py-1.5 rounded-lg bg-[#F7EEDF] font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
              >
                −
              </button>
              <button
                type="button"
                onClick={resetCamera}
                className="px-2.5 py-1.5 rounded-lg bg-[#F7EEDF] font-semibold text-[#6F5A4E] hover:text-[#3E2F2A] cursor-pointer"
              >
                Centrar
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setActiveModal('rules')}
            className="px-2.5 py-1.5 rounded-lg bg-[#F7EEDF] font-semibold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            Reglas
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('settings')}
            className="px-2.5 py-1.5 rounded-lg bg-[#F7EEDF] font-semibold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
          >
            Ajustes
          </button>
          <button
            type="button"
            onClick={leaveRoom}
            className="px-2.5 py-1.5 rounded-lg text-[#A94438] font-semibold hover:bg-[#FDECEB] cursor-pointer"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main Split Play Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 items-start">
        {/* Left / Center: Board + Contextual Assistance + Active Hand Dock */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-3">
          {/* Contextual Preview / "¿Por qué no puedo?" / Error Banner */}
          {(errorBanner || whyCannotBanner || contextualHints) && (
            <div
              className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2 ${
                errorBanner || whyCannotBanner
                  ? 'bg-[#FEF6E0] border-[#C9A227] text-[#3E2F2A]'
                  : 'bg-[#FFF9F0] border-[#3E2F2A]/15 text-[#3E2F2A]'
              }`}
              data-testid="assistance-banner"
            >
              <div className="font-medium">
                {errorBanner ? (
                  <span className="text-[#A94438] font-bold">{errorBanner}</span>
                ) : whyCannotBanner ? (
                  <span>
                    <strong className="text-[#C96F4A]">¿Por qué no puedo?:</strong>{' '}
                    {whyCannotBanner}
                  </span>
                ) : draftPlacements.length > 0 ? (
                  <span>
                    <strong className="text-[#3F5E4A]">Vista previa:</strong>{' '}
                    {draftEvaluation.summaryText}
                  </span>
                ) : selectedTile ? (
                  <span>
                    Carta seleccionada:{' '}
                    <strong>
                      {getNationName(selectedTile.nation)} (
                      {selectedTile.gender === 'M' ? 'Hombre' : 'Mujer'})
                    </strong>
                    . Toca una silla iluminada en verde/dorado o una silla atenuada para saber por
                    qué no admite a este invitado.
                  </span>
                ) : (
                  <span>
                    Toca una carta de tu mano abajo y luego una silla del tablero (o la barra).
                  </span>
                )}
              </div>

              {/* If selected tile is a Joker, allow choosing preferred represented nation */}
              {selectedTile?.nation === 'joker' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#6F5A4E]">Nación del comodín:</span>
                  <select
                    aria-label="Nacionalidad para el comodín"
                    value={preferredJokerNation ?? ''}
                    onChange={(e) =>
                      setPreferredJokerNation(
                        e.target.value ? (e.target.value as Nation) : undefined,
                      )
                    }
                    className="h-8 px-2 rounded-lg bg-[#F7EEDF] border border-[#3E2F2A]/25 text-xs font-bold"
                  >
                    <option value="">Automática según silla</option>
                    {Object.values(NATION_VISUALS).map((n) => (
                      <option key={n.code} value={n.code}>
                        {n.name} ({n.shortCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* 2.5D / 2D Interactive Board */}
          <PapercraftBoard
            gameState={gameState}
            selectedTile={selectedTile}
            draftPlacements={draftPlacements}
            seatInspections={seatInspections}
            focusedTableId={focusedTableId}
            viewMode={viewMode}
            cameraAngleIndex={cameraAngleIndex}
            cameraZoom={cameraZoom}
            nightMode={nightMode}
            reducedMotion={reducedMotion}
            onSeatClick={handleSeatClick}
            onTableClick={handleTableClick}
            onBarClick={handleBarClick}
          />

          {/* Player Hand & Turn Action Bar */}
          <div
            className="bg-[#FFF9F0] rounded-[20px] border border-[#3E2F2A]/15 p-2.5 sm:p-3 shadow-[0_8px_24px_rgba(62,47,42,0.08)]"
            data-testid="player-hand-dock"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#3E2F2A]">
                  Tu mano pública ({myHand.length} cartas · máx.{' '}
                  {gameState.handSize[myPlayerId ?? activePlayerId] ?? 5})
                </h3>
                <span className="text-xs text-[#6F5A4E] hidden sm:inline">
                  · Todas las manos están boca arriba
                </span>
              </div>

              {/* Action Controls for Draft & Joker Swaps */}
              <div className="flex flex-wrap items-center gap-2">
                {draftPlacements.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={clearDraft}
                      className="px-3 py-1.5 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/20 text-xs font-bold text-[#3E2F2A] hover:bg-[#EAD9C0] cursor-pointer"
                    >
                      Limpiar ({draftPlacements.length})
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
                      className="px-3.5 py-1.5 rounded-xl bg-[#3F5E4A] text-[#FFF9F0] text-xs font-bold shadow-xs hover:opacity-95 disabled:opacity-40 cursor-pointer"
                    >
                      Confirmar jugada (+{draftEvaluation.totalPoints} pts)
                    </button>
                  </>
                )}

                {availableSwapMoves.map((sw, idx) => (
                  <button
                    key={`${sw.seatId}-${idx}`}
                    type="button"
                    onClick={() => void submitMove(sw)}
                    className="px-3 py-1.5 rounded-xl bg-[#C9A227] text-[#3E2F2A] text-xs font-bold hover:opacity-95 cursor-pointer"
                  >
                    Cambiar comodín en silla {sw.seatId}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards Grid (compact guest cards) */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {myHand.map((tile) => {
                const isSelected = selectedTileId === tile.id;
                const isInDraft = draftPlacements.some((d) => d.tileId === tile.id);
                const meta =
                  tile.nation === 'joker'
                    ? null
                    : NATION_VISUALS[tile.nation as NationKey];

                return (
                  <button
                    key={tile.id}
                    type="button"
                    data-tile-id={tile.id}
                    disabled={isInDraft}
                    onClick={() => selectTile(isSelected ? null : tile.id)}
                    aria-label={`Carta ${getNationName(tile.nation)} ${
                      tile.gender === 'M' ? 'Hombre' : 'Mujer'
                    }`}
                    className={`group flex items-center gap-2 p-2 rounded-xl border-2 transition-all cursor-pointer select-none ${
                      isInDraft
                        ? 'opacity-40 bg-[#F7EEDF] border-[#3E2F2A]/20'
                        : isSelected
                          ? 'bg-[#FEF6E0] border-[#C96F4A] -translate-y-0.5 shadow-sm'
                          : 'bg-[#F7EEDF] border-[#3E2F2A]/20 hover:border-[#3E2F2A]'
                    }`}
                  >
                    <CharacterPortrait nation={tile.nation} gender={tile.gender} size={38} />
                    <div className="text-left min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <FlagBadge nation={tile.nation} size={13} />
                        <span className="font-mono font-bold text-[10px] text-[#3E2F2A]">
                          {tile.nation === 'joker' ? '★ COM' : meta?.shortCode}·
                          {tile.gender === 'M' ? 'H' : 'M'}
                        </span>
                      </div>
                      <span className="block font-serif font-bold text-xs text-[#3E2F2A] truncate mt-0.5">
                        {getNationName(tile.nation)}
                      </span>
                      <span className="block text-[10px] text-[#6F5A4E] leading-none">
                        {tile.gender === 'M' ? 'Caballero' : 'Dama'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Scoreboard, Bag, Rivals' Public Hands, Log & Chat */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-3">
          {/* Scoreboard & Bag Counter */}
          <div className="bg-[#FFF9F0] rounded-[24px] border border-[#3E2F2A]/15 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base">Marcador y manos</h3>
              <span
                className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${
                  gameState.bag.length <= 6
                    ? 'bg-[#FDECEB] text-[#A94438]'
                    : 'bg-[#F7EEDF] text-[#6F5A4E]'
                }`}
                title="La partida termina si quedan 3 fichas en la bolsa tras robar"
              >
                Bolsa: {gameState.bag.length} fichas
              </span>
            </div>

            <div className="space-y-2.5">
              {gameState.players.map((p) => {
                const pHand = gameState.hands[p.id] ?? [];
                const isTurn = gameState.turn === p.id;
                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-2xl border ${
                      isTurn
                        ? 'bg-[#FEF6E0] border-[#C96F4A]'
                        : 'bg-[#F7EEDF] border-[#3E2F2A]/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#3E2F2A]">
                        {p.nickname} {p.id === myPlayerId ? '(Tú)' : ''}
                      </span>
                      <span className="font-serif font-bold text-lg text-[#3E2F2A] tabular-nums">
                        {p.score} pts
                      </span>
                    </div>
                    {/* Public rival hand mini-cards */}
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {pHand.map((t) => (
                        <span
                          key={t.id}
                          title={`${getNationName(t.nation)} (${
                            t.gender === 'M' ? 'Hombre' : 'Mujer'
                          })`}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FFF9F0] border border-[#3E2F2A]/20 text-[10px] font-mono font-bold"
                        >
                          <FlagBadge nation={t.nation} size={12} />
                          {t.nation === 'joker' ? '★' : t.nation.toUpperCase()}·
                          {t.gender === 'M' ? 'H' : 'M'}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Separate Log & Chat Tabs */}
          <div className="bg-[#FFF9F0] rounded-[24px] border border-[#3E2F2A]/15 p-4 shadow-xs flex flex-col h-[340px]">
            <div className="flex items-center gap-1 p-1 bg-[#F7EEDF] rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setSideTab('log')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  sideTab === 'log'
                    ? 'bg-[#FFF9F0] text-[#3E2F2A] shadow-xs'
                    : 'text-[#6F5A4E]'
                }`}
              >
                Registro ({gameState.log.length})
              </button>
              <button
                type="button"
                onClick={() => setSideTab('chat')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  sideTab === 'chat'
                    ? 'bg-[#FFF9F0] text-[#3E2F2A] shadow-xs'
                    : 'text-[#6F5A4E]'
                }`}
              >
                Chat ({snapshot.chat.length})
              </button>
            </div>

            {sideTab === 'log' ? (
              <div
                className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs"
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
                        pid = ev.playerId;
                        desc = `sentó a ${getNationName(ev.tile.nation)} en ${ev.seatId}`;
                        delta = ev.pointsEarned;
                      } else if (ev.type === 'tile_bar') {
                        pid = ev.playerId;
                        desc = `envió a ${getNationName(ev.tile.nation)} a la barra (#${ev.barIndex + 1})`;
                        delta = ev.pointsDelta;
                      } else if (ev.type === 'joker_swapped') {
                        pid = ev.playerId;
                        desc = `intercambió el comodín de ${ev.seatId}`;
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
                          className="p-2 rounded-xl bg-[#F7EEDF] text-[#3E2F2A] flex items-center justify-between gap-2"
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
              <div className="flex-1 flex flex-col min-h-0">
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

                {/* Quick Emote Bar */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  {['☕ ¡Salud!', '🥐 ¡Buena mesa!', '👏 ¡Bravo!', '🎩 ¡Qué elegancia!'].map(
                    (emote) => (
                      <button
                        key={emote}
                        type="button"
                        onClick={() => void sendChat(emote, true)}
                        className="px-2 py-1 rounded-lg bg-[#F7EEDF] hover:bg-[#EAD9C0] text-[11px] font-semibold cursor-pointer"
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
                    className="flex-1 h-9 px-2.5 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/20 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3 h-9 rounded-xl bg-[#C96F4A] text-[#FFF9F0] text-xs font-bold cursor-pointer"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function FinishedScreen(): React.ReactElement {
  const snapshot = useGameStore((s) => s.snapshot);
  const shareResult = useGameStore((s) => s.shareResult);
  const voteRematch = useGameStore((s) => s.voteRematch);
  const leaveRoom = useGameStore((s) => s.leaveRoom);
  const [postcardUrl, setPostcardUrl] = useState<string | null>(null);

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
    <div className="min-h-screen p-4 sm:p-8 max-w-3xl mx-auto flex flex-col justify-center">
      <div className="bg-[#FFF9F0] rounded-[24px] border border-[#3E2F2A]/15 p-6 sm:p-8 shadow-[0_8px_24px_rgba(62,47,42,0.14)] space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-[#C96F4A]">Recuento de cierre del café</span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#3E2F2A]">
            {summary.winners.length > 1 ? '¡Victoria compartida!' : '¡Fin de la partida!'}
          </h1>
          <p className="text-sm text-[#6F5A4E]">
            {reasonLabels[
              shareResult?.terminalReason ??
                snapshot.gameState.terminalReason ??
                'last_seat_occupied'
            ] ?? 'Partida concluida.'}
          </p>
        </div>

        {/* Final Standings Breakdown */}
        <div className="space-y-2.5">
          {standings.map((st, idx) => (
            <div
              key={st.id}
              className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                st.isWinner
                  ? 'bg-[#FEF6E0] border-[#C9A227] border-2'
                  : 'bg-[#F7EEDF] border-[#3E2F2A]/10'
              }`}
            >
              <div>
                <span className="font-serif font-bold text-lg text-[#3E2F2A]">
                  {idx + 1}. {st.nickname} {st.isWinner ? '🏆' : ''}
                </span>
                <span className="block text-xs text-[#6F5A4E] tabular-nums">
                  Mesas y barra: {st.tablePoints} pts · En mano: {st.naturalLeft} naturales (-
                  {st.naturalLeft * 5}) y {st.jokerLeft} comodines (-{st.jokerLeft * 10})
                </span>
              </div>
              <div className="font-serif font-bold text-2xl text-[#3E2F2A] tabular-nums">
                {st.finalScore} pts
              </div>
            </div>
          ))}
        </div>

        {postcardUrl && (
          <div className="bg-[#F7EEDF] p-4 rounded-2xl text-center space-y-2">
            <img
              src={postcardUrl}
              alt="Postal de resultado de Cafetulia"
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
