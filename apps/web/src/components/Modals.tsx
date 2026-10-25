import React, { useEffect, useState } from 'react';
import { NATION_VISUALS, PRESET_AVATARS, type NationKey } from '@cafetulia/ui';
import { soundEngine } from '../audio/soundEngine';
import { CharacterPortrait, FlagBadge, PlayerAvatar } from '../art/CharacterPortrait';
import { useGameStore } from '../store/gameStore';
import { getNationName } from '../utils/moveHelper';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
  });
}

export function ActiveModalLayer(): React.ReactElement | null {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const pendingNegativeConfirm = useGameStore((s) => s.pendingNegativeConfirm);
  const setPendingNegativeConfirm = useGameStore((s) => s.setPendingNegativeConfirm);
  const submitMove = useGameStore((s) => s.submitMove);

  if (pendingNegativeConfirm) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#3E2F2A]/60 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="neg-confirm-title"
      >
        <div className="w-full max-w-md rounded-[24px] bg-[#FFF9F0] text-[#3E2F2A] p-6 shadow-[0_8px_24px_rgba(62,47,42,0.22)] border border-[#3E2F2A]/15">
          <h3 id="neg-confirm-title" className="font-serif font-bold text-2xl text-[#A94438]">
            Confirmar jugada con puntos negativos
          </h3>
          <p className="mt-2 text-sm text-[#6F5A4E] leading-relaxed">
            {pendingNegativeConfirm.description} Esta acción restará{' '}
            <strong className="text-[#A94438] tabular-nums">
              {Math.abs(pendingNegativeConfirm.points)} puntos
            </strong>{' '}
            a tu marcador. ¿Deseas continuar?
          </p>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setPendingNegativeConfirm(null)}
              className="px-4 py-2.5 rounded-xl bg-[#F7EEDF] text-[#3E2F2A] font-semibold text-sm border border-[#3E2F2A]/20 hover:bg-[#EAD9C0] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              data-testid="confirm-negative-move-btn"
              onClick={() => {
                const move = pendingNegativeConfirm.move;
                setPendingNegativeConfirm(null);
                void submitMove(move);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#A94438] text-[#FFF9F0] font-bold text-sm hover:opacity-95 cursor-pointer"
            >
              Sí, asumir {pendingNegativeConfirm.points} pts
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3E2F2A]/55 p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-[24px] bg-[#FFF9F0] text-[#3E2F2A] p-5 sm:p-7 shadow-[0_8px_24px_rgba(62,47,42,0.22)] border border-[#3E2F2A]/15 my-auto max-h-[90dvh] overflow-y-auto">
        {activeModal === 'tutorial' && <TutorialContent onClose={() => setActiveModal(null)} />}
        {activeModal === 'rules' && <RulesContent onClose={() => setActiveModal(null)} />}
        {activeModal === 'stats' && <StatsContent onClose={() => setActiveModal(null)} />}
        {activeModal === 'settings' && <SettingsContent onClose={() => setActiveModal(null)} />}
        {activeModal === 'ios_pwa' && <IosPwaContent onClose={() => setActiveModal(null)} />}
      </div>
    </div>
  );
}

function TutorialContent({ onClose }: { onClose: () => void }): React.ReactElement {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stepDone, setStepDone] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 border-b border-[#3E2F2A]/10 pb-3">
        <div>
          <span className="text-xs font-semibold text-[#C96F4A]">
            Tutorial interactivo · Paso {step} de 3
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl mt-0.5">
            {step === 1 && '1. Abrir una mesa con una pareja'}
            {step === 2 && '2. Aprovechar una silla compartida'}
            {step === 3 && '3. Mandar un invitado a la barra'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-[#F7EEDF] text-xs font-semibold text-[#6F5A4E] hover:text-[#3E2F2A] border border-[#3E2F2A]/15 cursor-pointer"
        >
          Cerrar
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {step === 1 && (
          <div className="bg-[#F7EEDF] p-4 rounded-2xl border border-[#3E2F2A]/10 space-y-3">
            <p className="text-sm text-[#3E2F2A] leading-relaxed">
              En <strong>Cafetulia</strong> ningún invitado puede quedarse solo en una mesa vacía
              (salvo en la jugada inaugural de la partida). Para abrir una mesa nueva debes sentar{' '}
              <strong>un hombre y una mujer del país</strong> en el mismo turno.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 py-2">
              <div className="flex items-center gap-2 bg-[#FFF9F0] px-3 py-2 rounded-xl border border-[#3E2F2A]/15">
                <CharacterPortrait nation="fr" gender="M" size={44} />
                <div className="text-xs">
                  <div className="font-bold">Henri · Francia (HOMBRE)</div>
                  <div className="text-[#6F5A4E]">1ª ficha en mesa FR</div>
                </div>
              </div>
              <span className="font-serif font-bold text-xl text-[#C96F4A]">+</span>
              <div className="flex items-center gap-2 bg-[#FFF9F0] px-3 py-2 rounded-xl border border-[#3E2F2A]/15">
                <CharacterPortrait nation="fr" gender="F" size={44} />
                <div className="text-xs">
                  <div className="font-bold">Colette · Francia (MUJER)</div>
                  <div className="text-[#6F5A4E]">2ª ficha = ¡Mesa abierta (+4 pts)!</div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('tilePlace');
                setStepDone(true);
              }}
              className="w-full py-2.5 rounded-xl bg-[#C96F4A] text-[#FFF9F0] font-bold text-sm cursor-pointer"
            >
              {stepDone
                ? '✓ ¡Pareja sentada en Francia (+4 pts por misma nacionalidad)!'
                : 'Probar: Sentar pareja francesa en su mesa'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-[#F7EEDF] p-4 rounded-2xl border border-[#3E2F2A]/10 space-y-3">
            <p className="text-sm text-[#3E2F2A] leading-relaxed">
              Hay <strong>28 sillas compartidas</strong> con cojín bicolor entre dos mesas vecinas.
              Al sentar allí un invitado válido, <strong>puntúas en las dos mesas a la vez</strong>,
              siempre que en ninguna rompas el equilibrio de sexos (máximo 2H y 2M por mesa).
            </p>
            <div className="flex items-center justify-center gap-3 py-2">
              <FlagBadge nation="fr" size={28} />
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FFF9F0] border border-[#3E2F2A]/20">
                Silla compartida Francia / Inglaterra · Suma en ambas
              </span>
              <FlagBadge nation="en" size={28} />
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('pureTableToast');
                setStepDone(true);
              }}
              className="w-full py-2.5 rounded-xl bg-[#3F5E4A] text-[#FFF9F0] font-bold text-sm cursor-pointer"
            >
              {stepDone
                ? '✓ ¡Silla compartida usada (+3 en Francia y +2 en Inglaterra = +5 pts)!'
                : 'Probar: Sentar invitado en silla compartida'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="bg-[#F7EEDF] p-4 rounded-2xl border border-[#3E2F2A]/10 space-y-3">
            <p className="text-sm text-[#3E2F2A] leading-relaxed">
              Si no tienes jugada legal en las mesas (o prefieres reservar tus cartas), puedes
              enviar <strong>1 invitado natural a la barra</strong> (los comodines nunca van a la
              barra). Las primeras 5 plazas dan puntos positivos (<strong>+1 a +5</strong>); a
              partir de la 6ª restan puntos (<strong>-2 hasta -14</strong>).
            </p>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('barPositive');
                setStepDone(true);
              }}
              className="w-full py-2.5 rounded-xl bg-[#8B5E3C] text-[#FFF9F0] font-bold text-sm cursor-pointer"
            >
              {stepDone
                ? '✓ ¡Invitado colocado en el primer posavasos de la barra (+1 pt)!'
                : 'Probar: Colocar invitado en la barra (+1 pt)'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#3E2F2A]/10">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => {
            setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
            setStepDone(false);
          }}
          className="px-4 py-2 rounded-xl bg-[#F7EEDF] text-sm font-semibold disabled:opacity-40 cursor-pointer"
        >
          Anterior
        </button>
        {step < 3 ? (
          <button
            type="button"
            onClick={() => {
              setStep((s) => ((s + 1) as 1 | 2 | 3));
              setStepDone(false);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#C96F4A] text-[#FFF9F0] font-bold text-sm cursor-pointer"
          >
            Siguiente paso
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#3F5E4A] text-[#FFF9F0] font-bold text-sm cursor-pointer"
          >
            Terminar tutorial
          </button>
        )}
      </div>
    </div>
  );
}

function RulesContent({ onClose }: { onClose: () => void }): React.ReactElement {
  const nationsOrder: NationKey[] = [
    'af',
    'it',
    'ch',
    'es',
    'ru',
    'in',
    'am',
    'al',
    'tu',
    'cu',
    'en',
    'fr',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-3">
        <h2 className="font-serif font-bold text-2xl sm:text-3xl">Reglamento oficial de Cafetulia</h2>
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-xl bg-[#C96F4A] text-[#FFF9F0] text-xs font-bold cursor-pointer"
        >
          Cerrar
        </button>
      </div>

      <div className="space-y-3 text-sm text-[#3E2F2A] leading-relaxed">
        <section className="bg-[#F7EEDF] p-3.5 rounded-2xl">
          <h3 className="font-serif font-bold text-base">1. Componentes y manos públicas</h3>
          <p className="mt-1 text-xs sm:text-sm text-[#6F5A4E]">
            100 fichas en la bolsa: 96 invitados (4 hombres y 4 mujeres de cada uno de los 12
            países) más 4 comodines (2 hombres y 2 mujeres). Cada jugador mantiene 5 fichas boca
            arriba visibles para todos.
          </p>
        </section>

        <section className="bg-[#F7EEDF] p-3.5 rounded-2xl">
          <h3 className="font-serif font-bold text-base">2. Los 12 países (orden horario)</h3>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {nationsOrder.map((code, idx) => {
              const meta = NATION_VISUALS[code];
              return (
                <div
                  key={code}
                  className="flex items-center gap-2 bg-[#FFF9F0] px-2.5 py-1.5 rounded-xl border border-[#3E2F2A]/10 text-xs"
                >
                  <FlagBadge nation={code} size={18} />
                  <span className="font-semibold">
                    {idx + 1}. {meta.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-[#F7EEDF] p-3.5 rounded-2xl">
          <h3 className="font-serif font-bold text-base">3. Reglas para sentar invitados</h3>
          <ul className="mt-1 list-disc list-inside text-xs sm:text-sm text-[#6F5A4E] space-y-1">
            <li>
              <strong>Nacionalidad:</strong> cada mesa admite invitados de su país; las 28 sillas
              compartidas admiten cualquiera de las dos mesas que conectan.
            </li>
            <li>
              <strong>Equilibrio de sexos:</strong> en ninguna mesa puede haber más de 2 hombres ni
              más de 2 mujeres. Combinaciones válidas: 0, 1H+1M, 1H+2M, 2H+1M o 2H+2M.
            </li>
            <li>
              <strong>Nadie se sienta solo:</strong> no puede quedar un invitado solo en una mesa,
              salvo en la jugada de apertura con todo el café vacío o si su silla es compartida y
              la otra mesa ya tiene acompañante.
            </li>
          </ul>
        </section>

        <section className="bg-[#F7EEDF] p-3.5 rounded-2xl">
          <h3 className="font-serif font-bold text-base">
            4. Puntuación, monedas, comodines y barra
          </h3>
          <ul className="mt-1 list-disc list-inside text-xs sm:text-sm text-[#6F5A4E] space-y-1">
            <li>
              <strong>Puntos por mesa:</strong> 2 invitados = 2 pts, 3 = 3 pts, 4 = 4 pts. Si todos
              los ocupantes son de la nacionalidad de la mesa, ¡vale el doble (4, 6 u 8 pts)!
            </li>
            <li>
              <strong>Monedas:</strong> ficha negra = 1, roja = 5, azul = 10.
            </li>
            <li>
              <strong>Mesa nacional completa (4/4 misma nación):</strong> tu tamaño máximo de mano
              se reduce permanentemente en 1 ficha.
            </li>
            <li>
              <strong>Final de partida:</strong> al ocupar la última silla, la 20ª plaza de barra,
              quedarse sin fichas en mano o quedar solo 3 fichas en la bolsa. Se restan 5 pts por
              ficha natural en mano y 10 pts por comodín.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatsContent({ onClose }: { onClose: () => void }): React.ReactElement {
  const localStats = useGameStore((s) => s.localStats);
  const recentMatches = useGameStore((s) => s.recentMatches);
  const fetchHistory = useGameStore((s) => s.fetchHistory);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const favNationEntry = Object.entries(localStats.favoriteNations).sort((a, b) => b[1] - a[1])[0];
  const topRivalEntry = Object.entries(localStats.frequentRivals).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-3">
        <h2 className="font-serif font-bold text-2xl sm:text-3xl">
          Estadísticas locales e historial
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-xl bg-[#C96F4A] text-[#FFF9F0] text-xs font-bold cursor-pointer"
        >
          Cerrar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#F7EEDF] p-3.5 rounded-2xl">
          <span className="text-xs text-[#6F5A4E]">Partidas jugadas</span>
          <div className="font-serif font-bold text-2xl tabular-nums mt-1">
            {localStats.gamesPlayed}
          </div>
        </div>
        <div className="bg-[#F7EEDF] p-3.5 rounded-2xl">
          <span className="text-xs text-[#6F5A4E]">Victorias</span>
          <div className="font-serif font-bold text-2xl text-[#3F5E4A] tabular-nums mt-1">
            {localStats.wins}
          </div>
        </div>
        <div className="bg-[#F7EEDF] p-3.5 rounded-2xl">
          <span className="text-xs text-[#6F5A4E]">Nación favorita</span>
          <div className="font-serif font-bold text-lg mt-1">
            {favNationEntry ? getNationName(favNationEntry[0]) : 'Aún sin datos'}
          </div>
        </div>
        <div className="bg-[#F7EEDF] p-3.5 rounded-2xl">
          <span className="text-xs text-[#6F5A4E]">Tertuliano habitual</span>
          <div className="font-serif font-bold text-lg mt-1 truncate">
            {topRivalEntry ? topRivalEntry[0] : 'Aún sin datos'}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-serif font-bold text-lg mb-2">
          Últimas 5 partidas registradas en el servidor
        </h3>
        {recentMatches.length === 0 ? (
          <p className="text-sm text-[#6F5A4E] bg-[#F7EEDF] p-4 rounded-2xl">
            Todavía no hay partidas finalizadas en este servidor.
          </p>
        ) : (
          <div className="space-y-2">
            {recentMatches.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 bg-[#F7EEDF] px-4 py-2.5 rounded-2xl text-xs"
              >
                <div>
                  <span className="font-bold">Sala {m.roomCode}</span>
                  <span className="text-[#6F5A4E] ml-2">
                    · {new Date(m.finishedAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="text-[#3E2F2A]">
                  Jugadores: {m.players.map((p) => p.nickname).join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsContent({ onClose }: { onClose: () => void }): React.ReactElement {
  const [vols, setVols] = useState(soundEngine.getVolumes());
  const avatarId = useGameStore((s) => s.avatarId);
  const setAvatarId = useGameStore((s) => s.setAvatarId);
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const highContrast = useGameStore((s) => s.highContrast);
  const largeText = useGameStore((s) => s.largeText);
  const nightMode = useGameStore((s) => s.nightMode);
  const contextualHints = useGameStore((s) => s.contextualHints);
  const eventSubtitles = useGameStore((s) => s.eventSubtitles);
  const toggleSetting = useGameStore((s) => s.toggleSetting);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const handleInstallPwa = async () => {
    if (deferredInstallPrompt) {
      await deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    } else {
      setActiveModal('ios_pwa');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-3">
        <h2 className="font-serif font-bold text-2xl sm:text-3xl">Ajustes y perfil</h2>
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-xl bg-[#C96F4A] text-[#FFF9F0] text-xs font-bold cursor-pointer"
        >
          Guardar y cerrar
        </button>
      </div>

      {/* Profile & Preset Avatars (16 pre-made avatars, no photo upload) */}
      <div className="bg-[#F7EEDF] p-3.5 rounded-2xl space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-serif font-bold text-base">Tu perfil y avatar</h3>
          <div className="flex items-center gap-2">
            <PlayerAvatar avatarId={avatarId} size={28} />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={24}
              aria-label="Tu apodo"
              className="px-2.5 py-1 rounded-lg bg-[#FFF9F0] border border-[#3E2F2A]/20 text-xs font-bold w-36"
            />
          </div>
        </div>
        <div
          className="grid grid-cols-8 gap-1.5"
          role="radiogroup"
          aria-label="Seleccionar avatar prehecho"
        >
          {PRESET_AVATARS.map((av) => {
            const active = avatarId === av.id;
            return (
              <button
                key={av.id}
                type="button"
                role="radio"
                aria-checked={active}
                data-testid={`settings-avatar-${av.id}`}
                onClick={() => void setAvatarId(av.id)}
                title={av.label}
                className={`flex flex-col items-center justify-center p-1 rounded-xl border transition-transform cursor-pointer ${
                  active
                    ? 'bg-[#FFF9F0] border-[#C96F4A] ring-2 ring-[#C96F4A] scale-105'
                    : 'bg-[#FFF9F0]/60 border-[#3E2F2A]/10 hover:bg-[#FFF9F0]'
                }`}
              >
                <PlayerAvatar avatarId={av.id} size={28} />
                <span className="text-[9px] font-semibold truncate w-full text-center mt-0.5">
                  {av.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sound Controls */}
      <div className="bg-[#F7EEDF] p-3.5 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base">Sonido del café</h3>
          <button
            type="button"
            onClick={() => setVols(soundEngine.setVolumes({ muted: !vols.muted }))}
            className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
              vols.muted
                ? 'bg-[#A94438] text-[#FFF9F0]'
                : 'bg-[#FFF9F0] text-[#3E2F2A] border border-[#3E2F2A]/20'
            }`}
          >
            {vols.muted ? 'Sonido silenciado (activar)' : 'Silenciar todo'}
          </button>
        </div>

        <label className="flex items-center justify-between gap-4 text-xs font-semibold">
          <span>Música lo-fi ({Math.round(vols.music * 100)}%)</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={vols.music}
            onChange={(e) => setVols(soundEngine.setVolumes({ music: Number(e.target.value) }))}
            className="w-40 accent-[#C96F4A]"
          />
        </label>

        <label className="flex items-center justify-between gap-4 text-xs font-semibold">
          <span>Ambiente de cafetería ({Math.round(vols.ambience * 100)}%)</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={vols.ambience}
            onChange={(e) => setVols(soundEngine.setVolumes({ ambience: Number(e.target.value) }))}
            className="w-40 accent-[#C96F4A]"
          />
        </label>

        <label className="flex items-center justify-between gap-4 text-xs font-semibold">
          <span>Efectos de fichas y tazas ({Math.round(vols.sfx * 100)}%)</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={vols.sfx}
            onChange={(e) => {
              const next = soundEngine.setVolumes({ sfx: Number(e.target.value) });
              setVols(next);
              soundEngine.playSfx('cardSelect');
            }}
            className="w-40 accent-[#C96F4A]"
          />
        </label>
      </div>

      {/* Visual & Accessibility toggles */}
      <div className="bg-[#F7EEDF] p-3.5 rounded-2xl space-y-2 text-xs sm:text-sm">
        <h3 className="font-serif font-bold text-base mb-1">Avisos, pantalla y accesibilidad</h3>

        <label className="flex items-center justify-between py-1 cursor-pointer">
          <span>Subtítulos grandes de eventos («¡EL JOKER!», «¡MESA COMPLETA!»)</span>
          <input
            type="checkbox"
            data-testid="toggle-event-subtitles"
            checked={eventSubtitles}
            onChange={() => toggleSetting('eventSubtitles')}
            className="w-4 h-4 accent-[#C96F4A]"
          />
        </label>

        <label className="flex items-center justify-between py-1 cursor-pointer">
          <span>Reducción de movimiento (sin giros ni rebotes)</span>
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={() => toggleSetting('reducedMotion')}
            className="w-4 h-4 accent-[#C96F4A]"
          />
        </label>

        <label className="flex items-center justify-between py-1 cursor-pointer">
          <span>Alto contraste en textos y bordes</span>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={() => toggleSetting('highContrast')}
            className="w-4 h-4 accent-[#C96F4A]"
          />
        </label>

        <label className="flex items-center justify-between py-1 cursor-pointer">
          <span>Tamaño de texto ampliado</span>
          <input
            type="checkbox"
            checked={largeText}
            onChange={() => toggleSetting('largeText')}
            className="w-4 h-4 accent-[#C96F4A]"
          />
        </label>

        <label className="flex items-center justify-between py-1 cursor-pointer">
          <span>Iluminación nocturna (velas de tarde)</span>
          <input
            type="checkbox"
            checked={nightMode}
            onChange={() => toggleSetting('nightMode')}
            className="w-4 h-4 accent-[#C96F4A]"
          />
        </label>

        <label className="flex items-center justify-between py-1 cursor-pointer">
          <span>Pistas contextuales y puntos previstos</span>
          <input
            type="checkbox"
            checked={contextualHints}
            onChange={() => toggleSetting('contextualHints')}
            className="w-4 h-4 accent-[#C96F4A]"
          />
        </label>
      </div>

      {/* Secondary actions moved from TitleScreen per 1.1 */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button
          type="button"
          data-testid="open-stats-from-settings"
          onClick={() => setActiveModal('stats')}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/15 text-xs font-bold hover:bg-[#EAD9C0] cursor-pointer"
        >
          Estadísticas e historial
        </button>
        <button
          type="button"
          data-testid="install-pwa-btn"
          onClick={() => void handleInstallPwa()}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#F7EEDF] border border-[#3E2F2A]/15 text-xs font-bold hover:bg-[#EAD9C0] cursor-pointer"
        >
          Instalar en móvil (PWA)
        </button>
      </div>
    </div>
  );
}

function IosPwaContent({ onClose }: { onClose: () => void }): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#3E2F2A]/10 pb-3">
        <h2 className="font-serif font-bold text-2xl">Instalar Cafetulia en tu móvil</h2>
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-xl bg-[#C96F4A] text-[#FFF9F0] text-xs font-bold cursor-pointer"
        >
          Entendido
        </button>
      </div>
      <div className="bg-[#F7EEDF] p-4 rounded-2xl space-y-2 text-sm text-[#3E2F2A]">
        <p className="font-bold">En iPhone o iPad (Safari):</p>
        <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-[#6F5A4E]">
          <li>
            Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.
          </li>
          <li>
            Desliza hacia abajo y selecciona <strong>«Añadir a pantalla de inicio»</strong>.
          </li>
          <li>
            Pulsa <strong>Añadir</strong> arriba a la derecha para jugar a pantalla completa.
          </li>
        </ol>
      </div>
      <div className="bg-[#F7EEDF] p-4 rounded-2xl space-y-2 text-sm text-[#3E2F2A]">
        <p className="font-bold">En Android (Chrome):</p>
        <p className="text-xs sm:text-sm text-[#6F5A4E]">
          Abre el menú de tres puntos arriba a la derecha y pulsa{' '}
          <strong>«Instalar aplicación»</strong> o «Añadir a pantalla de inicio».
        </p>
      </div>
    </div>
  );
}
