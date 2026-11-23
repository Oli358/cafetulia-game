import React, { useEffect, useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { PlayerAvatar } from '../art/CharacterPortrait';

type TitleBarSceneProps = {
  avatarId: string;
  nickname: string;
  greeting: string;
  reducedMotion: boolean;
  menuOpen: boolean;
  onOpenMenu: () => void;
  onAvatarClick: () => void;
};

type RasterBarista = {
  id: string;
  label: string;
  src: string;
};

const RASTER_BARISTAS: RasterBarista[] = [
  { id: 'maitre', label: 'El de la casa', src: '/assets/title/barista-maitre.png' },
  { id: 'companera', label: 'La compañera de barra', src: '/assets/title/barista-companera.png' },
  { id: 'manana', label: 'La ayuda de la mañana', src: '/assets/title/barista-manana.png' },
  { id: 'noche', label: 'El turno de noche', src: '/assets/title/barista-noche.png' },
];

function pickBarista(): RasterBarista {
  const fallback = RASTER_BARISTAS[0];
  if (!fallback) throw new Error('No hay baristas disponibles');
  let lastId: string | null = null;
  try {
    lastId = window.sessionStorage.getItem('cafetulia-ultimo-barista');
  } catch {
    lastId = null;
  }
  const options = RASTER_BARISTAS.filter((barista) => barista.id !== lastId);
  return options[Math.floor(Math.random() * options.length)] ?? fallback;
}

/**
 * Portada raster: la ilustración de la cafetería y los personajes de la hoja
 * de recursos, recortados con transparencia. La carta y la interacción siguen
 * siendo HTML para poder animarlas y mantenerlas accesibles.
 */
export function TitleBarScene({
  avatarId,
  nickname,
  greeting,
  reducedMotion,
  menuOpen,
  onOpenMenu,
  onAvatarClick,
}: TitleBarSceneProps): React.ReactElement {
  const [barista] = useState(() => pickBarista());
  const [petMessage, setPetMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.sessionStorage.setItem('cafetulia-ultimo-barista', barista.id);
    } catch {
      // Sin sessionStorage la rotación sigue siendo aleatoria.
    }
  }, [barista.id]);

  const petCat = (message: string) => {
    setPetMessage(message);
    soundEngine.unlock();
    soundEngine.playSfx('uiToggle');
    window.setTimeout(() => setPetMessage(null), 1800);
  };

  return (
    <div
      data-testid="title-cafe-scene"
      aria-label="La barra de Cafetulia"
      className="absolute inset-0 z-0 overflow-hidden bg-[#142820]"
    >
      <img
        src="/assets/title/cafe-room.jpg"
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-bottom select-none"
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_36%,rgba(4,10,8,0.42)_100%)]" />

      {/* Barista de la hoja de recursos, detrás de la barra */}
      <div
        data-testid="title-barista"
        data-barista={barista.id}
        aria-label={barista.label}
        className="absolute bottom-[11%] left-1/2 z-[2] h-[47%] -translate-x-1/2 drop-shadow-[0_16px_22px_rgba(0,0,0,0.28)] sm:left-[34%]"
      >
        <img
          src={barista.src}
          alt=""
          draggable={false}
          className={`h-full w-auto select-none ${reducedMotion ? '' : 'cafe-raster-breathe'}`}
        />
      </div>

      {/* Gato siamés, a la izquierda de la barra */}
      <button
        type="button"
        data-testid="title-cat-siames"
        onClick={() => petCat('Miau. El siamés de la casa te mira con ojos azules.')}
        aria-label="Acariciar al gato siamés"
        title="Acariciar al siamés"
        className="absolute bottom-[11%] left-[5%] z-[4] w-[90px] cursor-pointer text-left transition-transform hover:-translate-y-0.5 focus:outline-2 focus:outline-offset-4 focus:outline-[#F0D278] sm:w-[150px]"
      >
        <img
          src="/assets/title/cat-siames.png"
          alt=""
          draggable={false}
          className={`w-full select-none ${reducedMotion ? '' : 'cafe-cat-breathe'}`}
        />
      </button>

      {/* Gato atigrado, a la derecha de la barra */}
      <button
        type="button"
        data-testid="title-cat-dark"
        onClick={() => petCat('Miau. El gato atigrado ronronea desde la barra.')}
        aria-label="Acariciar al gato atigrado"
        title="Acariciar al gato atigrado"
        className="absolute bottom-[11%] left-[41%] z-[4] w-[90px] -translate-x-1/2 cursor-pointer text-left transition-transform hover:-translate-y-0.5 focus:outline-2 focus:outline-offset-4 focus:outline-[#F0D278] sm:left-[60%] sm:w-[145px]"
      >
        <img
          src="/assets/title/cat-tabby.png"
          alt=""
          draggable={false}
          className={`w-full select-none ${reducedMotion ? '' : 'cafe-cat-breathe-delayed'}`}
        />
      </button>

      {petMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`pointer-events-none absolute bottom-[23%] left-[42%] z-[7] max-w-[78vw] -translate-x-1/2 border border-[#0B1D17] bg-[#F8EBD7] px-2.5 py-1.5 text-[10px] font-bold leading-snug text-[#1E3027] shadow-[3px_3px_0_#0B1D17] sm:text-xs ${
            reducedMotion ? '' : 'animate-[cafe-bubble_1.8s_ease-out_forwards]'
          }`}
        >
          {petMessage} ♥
        </div>
      )}

      {/* Placa con el jugador y el saludo */}
      <div className="absolute bottom-[3.5%] left-[3%] z-[5] flex max-w-[78vw] items-center gap-2 border-y border-[#C8A12A]/55 bg-[#10251F]/75 px-2 py-1.5 text-[#F3E6CF] shadow-[0_2px_0_rgba(7,17,13,0.3)] backdrop-blur-xs sm:gap-3 sm:px-3">
        <button
          type="button"
          data-testid="title-hero-avatar"
          onClick={onAvatarClick}
          aria-label={`Abrir la carta y cambiar tu avatar (${nickname})`}
          title="Tu avatar y la carta"
          className="shrink-0 rounded-full border-2 border-[#0B1D17] bg-[#F3E6CF] p-1 shadow-[0_3px_8px_rgba(0,0,0,0.32)] transition-transform hover:-translate-y-0.5 hover:scale-105 focus:outline-2 focus:outline-offset-2 focus:outline-[#F0D278] cursor-pointer"
        >
          <span className="block overflow-hidden rounded-full border border-[#C8A12A]/70">
            <PlayerAvatar avatarId={avatarId} size={42} />
          </span>
        </button>
        <div className="min-w-0">
          <p className="font-serif text-[15px] font-semibold leading-tight sm:text-lg" data-testid="title-greeting">
            {greeting}
          </p>
          <p className="mt-0.5 truncate text-[9px] font-semibold tracking-wide text-[#C8A12A]/90 sm:text-[10px]">
            Estás en la barra · {nickname}
          </p>
        </div>
      </div>

      {/* La carta física de la referencia */}
      <button
        type="button"
        data-testid="title-menu-card"
        onClick={onOpenMenu}
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        aria-label="Abrir el menú de Cafetulia"
        className="group absolute bottom-[11%] right-[3%] z-[5] w-[130px] rotate-[1.2deg] text-left transition-transform duration-200 hover:-translate-y-2 hover:rotate-0 focus:outline-2 focus:outline-offset-4 focus:outline-[#F0D278] sm:right-[4%] sm:w-[225px]"
      >
        <span className="block border-2 border-[#3A241B] bg-[#F2E2C8] p-2.5 text-[#2A2019] shadow-[6px_7px_0_#231712,0_18px_30px_rgba(0,0,0,0.3)] sm:p-4">
          <span className="mb-2 flex items-center justify-between">
            <svg viewBox="0 0 30 22" className="h-4 w-5 text-[#56705A]" aria-hidden="true">
              <path d="M2 17 Q8 4 15 17 Q22 4 28 17" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M15 17 Q17 9 22 8 M15 17 Q13 9 8 8" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <span className="text-[9px] font-semibold italic text-[#56705A] sm:text-[11px]">Cafetería</span>
            <svg viewBox="0 0 30 22" className="h-4 w-5 text-[#56705A]" aria-hidden="true">
              <path d="M2 17 Q8 4 15 17 Q22 4 28 17" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M15 17 Q17 9 22 8 M15 17 Q13 9 8 8" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </span>
          <span className="block border-y border-[#2A2019]/30 py-1 font-serif text-3xl font-bold leading-none sm:text-5xl">
            Menú
          </span>
          <span className="mt-2 flex items-center justify-between gap-2 text-[10px] font-bold text-[#5A3A26] sm:text-xs">
            <span>Abrir la carta</span>
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rotate-45 border-r-2 border-t-2 border-[#56705A] transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </span>
      </button>
    </div>
  );
}
