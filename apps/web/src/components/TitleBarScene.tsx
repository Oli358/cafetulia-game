import React, { useEffect, useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { PlayerAvatar } from '../art/CharacterPortrait';
import { nextBarista, pickRandomBarista, TitleBarBarista } from './TitleBarBarista';
import { DarkCat, SiameseCat } from './TitleBarCats';

type TitleBarSceneProps = {
  avatarId: string;
  nickname: string;
  greeting: string;
  reducedMotion: boolean;
  menuOpen: boolean;
  onOpenMenu: () => void;
  onAvatarClick: () => void;
};

/**
 * Portada de Cafetulia: la barra del café.
 * La escena es el menú; la carta impresa solo aparece al pulsar "Menú".
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
  const [menuHovered, setMenuHovered] = useState(false);
  const [barista, setBarista] = useState(() => pickRandomBarista());
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
      className="absolute inset-0 z-0 overflow-hidden bg-[#10251F]"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="block h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="tbWall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10251F" />
              <stop offset="52%" stopColor="#1A3A2F" />
              <stop offset="100%" stopColor="#244B3C" />
            </linearGradient>
            <linearGradient id="tbWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8A5B3B" />
              <stop offset="34%" stopColor="#6B432D" />
              <stop offset="100%" stopColor="#3D2419" />
            </linearGradient>
            <linearGradient id="tbMirror" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#365F50" />
              <stop offset="48%" stopColor="#274E40" />
              <stop offset="100%" stopColor="#19392F" />
            </linearGradient>
            <linearGradient id="tbWindow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F9D89A" />
              <stop offset="48%" stopColor="#E9A25D" />
              <stop offset="100%" stopColor="#7B4E4A" />
            </linearGradient>
            <radialGradient id="tbLampGlow" cx="50%" cy="42%" r="55%">
              <stop offset="0%" stopColor="#FFE6A8" stopOpacity="0.58" />
              <stop offset="52%" stopColor="#D9A64A" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#D9A64A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="tbBrass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F0D278" />
              <stop offset="45%" stopColor="#C8A12A" />
              <stop offset="100%" stopColor="#8B681C" />
            </linearGradient>
          </defs>

          {/* Pared verde, molduras y zócalo de madera */}
          <rect x="0" y="0" width="1600" height="900" fill="url(#tbWall)" />
          {[70, 170, 270, 370, 470, 570, 670, 770, 870, 970, 1070, 1170, 1270, 1370, 1470, 1570].map(
            (x) => (
              <line
                key={x}
                x1={x}
                y1="0"
                x2={x}
                y2="590"
                stroke="#8FB7A2"
                strokeWidth="1"
                opacity="0.075"
              />
            ),
          )}
          <rect x="0" y="0" width="1600" height="20" fill="#0A1813" />
          <rect x="0" y="575" width="1600" height="18" fill="#0B1D17" />
          <rect x="0" y="593" width="1600" height="80" fill="#173429" />
          {[0, 160, 320, 480, 640, 800, 960, 1120, 1280, 1440].map((x) => (
            <line
              key={`wain-${x}`}
              x1={x}
              y1="593"
              x2={x}
              y2="673"
              stroke="#0B1D17"
              strokeWidth="2"
              opacity="0.55"
            />
          ))}

          {/* Grieta antigua y luz diagonal de la ventana */}
          <path
            d="M338 0 Q346 42 324 72 Q310 91 318 118"
            fill="none"
            stroke="#DFF0E3"
            strokeWidth="1.4"
            opacity="0.08"
          />
          <polygon
            points="74 250 330 302 1130 900 440 900"
            fill="#FFE4A8"
            opacity="0.055"
            style={{ mixBlendMode: 'screen' }}
          />

          {/* Ventana arqueada con última luz de la tarde */}
          <g transform="translate(64 80)">
            <path
              d="M0 410 V155 A160 150 0 0 1 320 155 V410 Z"
              fill="url(#tbWindow)"
              stroke="#0B1D17"
              strokeWidth="8"
            />
            <circle cx="216" cy="116" r="43" fill="#FFF0C6" opacity="0.72" />
            <path d="M0 410 L84 305 L170 410 Z" fill="#513D36" opacity="0.48" />
            <path d="M122 410 L225 278 L320 410 Z" fill="#2D3731" opacity="0.55" />
            <line x1="160" y1="15" x2="160" y2="410" stroke="#0B1D17" strokeWidth="7" />
            <line x1="0" y1="205" x2="320" y2="205" stroke="#0B1D17" strokeWidth="7" />
            <line x1="0" y1="315" x2="320" y2="315" stroke="#0B1D17" strokeWidth="6" />
            <rect x="-18" y="405" width="356" height="18" rx="4" fill="#5A3A26" stroke="#0B1D17" strokeWidth="5" />
            <path
              d="M-18 423 Q-26 470 -12 512 L26 512 Q16 467 28 423 Z"
              fill="#2B4F3E"
              stroke="#0B1D17"
              strokeWidth="4"
            />
          </g>

          {/* Espejo de la barra, con marco de latón */}
          <g>
            <path
              d="M475 535 V208 A325 190 0 0 1 1125 208 V535 Z"
              fill="#0B1D17"
              opacity="0.65"
            />
            <path
              d="M490 522 V214 A310 178 0 0 1 1110 214 V522 Z"
              fill="url(#tbMirror)"
              stroke="#6B432D"
              strokeWidth="16"
            />
            <path
              d="M498 518 V218 A302 170 0 0 1 1102 218 V518 Z"
              fill="none"
              stroke="#C8A12A"
              strokeWidth="2.5"
              opacity="0.7"
            />
            <path
              d="M520 510 V240 A280 148 0 0 1 1080 240 V510 Z"
              fill="none"
              stroke="#B7D5C1"
              strokeWidth="2"
              opacity="0.22"
            />
            <path d="M590 510 L710 235 L790 235 L670 510 Z" fill="#6F9B83" opacity="0.08" />
            <circle cx="930" cy="280" r="96" fill="#D6A54F" opacity="0.07" />

            {/* Pizarra de la casa */}
            <g fill="#EFE3C9" fontFamily="Fraunces, serif">
              <text x="958" y="250" textAnchor="middle" fontSize="18" opacity="0.9" fontStyle="italic">
                La casa
              </text>
              <path d="M888 263 H1028" stroke="#C8A12A" strokeWidth="1.5" opacity="0.55" />
              <g fontSize="17" opacity="0.82">
                <text x="882" y="302">Café</text>
                <text x="1032" y="302" textAnchor="end">2,00</text>
                <text x="882" y="338">Capuchino</text>
                <text x="1032" y="338" textAnchor="end">2,50</text>
                <text x="882" y="374">Latte</text>
                <text x="1032" y="374" textAnchor="end">2,50</text>
                <text x="882" y="410">Té</text>
                <text x="1032" y="410" textAnchor="end">1,50</text>
                <text x="882" y="446">Infusión</text>
                <text x="1032" y="446" textAnchor="end">1,50</text>
              </g>
              <path d="M922 476 Q938 489 954 476 Q944 498 938 498 Q932 498 922 476 Z" fill="none" stroke="#C8A12A" strokeWidth="1.4" opacity="0.65" />
              <path d="M938 468 V480 M932 478 Q938 484 944 478" fill="none" stroke="#EFE3C9" strokeWidth="1.8" opacity="0.55" />
            </g>

            {[0, 1, 2].map((i) => (
              <g key={`mirror-glow-${i}`} transform={`translate(${660 + i * 140} 180)`}>
                <line x1="0" y1="0" x2="0" y2="36" stroke="#C8A12A" strokeWidth="3" opacity="0.4" />
                <path d="M-24 36 Q0 12 24 36 Z" fill="#C8A12A" opacity="0.38" />
              </g>
            ))}
          </g>

          {/* Estanterías laterales con botellas y copas */}
          {[1].map((side) => {
            const left = 1280;
            return (
              <g key={`shelf-${side}`} transform={`translate(${left} 228)`}>
                <rect x="0" y="0" width="220" height="10" rx="2" fill="#6B432D" stroke="#0B1D17" strokeWidth="3" />
                <rect x="0" y="118" width="220" height="10" rx="2" fill="#6B432D" stroke="#0B1D17" strokeWidth="3" />
                {[18, 58, 98, 138, 178].map((x, i) => (
                  <g key={`bottle-${side}-${x}`} transform={`translate(${x} 0)`}>
                    <path
                      d={`M8 0 V${28 + (i % 3) * 10} Q8 ${44 + (i % 3) * 10} 16 ${44 + (i % 3) * 10} V0 Z`}
                      fill={i % 2 === 0 ? '#3D5B47' : '#7B4E3B'}
                      stroke="#0B1D17"
                      strokeWidth="2"
                    />
                    <rect x="7" y="-12" width="10" height="13" rx="2" fill="#C8A12A" stroke="#0B1D17" strokeWidth="1.5" />
                  </g>
                ))}
                {[20, 65, 110, 155, 200].map((x) => (
                  <g key={`glass-${side}-${x}`} transform={`translate(${x} 118)`}>
                    <path d="M4 -40 L20 -40 L17 -16 L7 -16 Z" fill="#E5F1E7" opacity="0.6" stroke="#B7D5C1" strokeWidth="1.4" />
                    <line x1="12" y1="-16" x2="12" y2="-3" stroke="#B7D5C1" strokeWidth="1.6" />
                    <line x1="6" y1="-3" x2="18" y2="-3" stroke="#B7D5C1" strokeWidth="1.8" />
                  </g>
                ))}
              </g>
            );
          })}

          {/* Lámparas colgantes */}
          {[350, 1240].map((x, i) => (
            <g key={`lamp-${x}`}>
              <circle cx={x} cy="235" r={i === 0 ? 190 : 165} fill="url(#tbLampGlow)" />
              <line x1={x} y1="0" x2={x} y2={i === 0 ? 120 : 106} stroke="#0B1D17" strokeWidth="4" />
              <path
                d={`M${x - 62} ${i === 0 ? 148 : 134} Q${x} ${i === 0 ? 98 : 86} ${x + 62} ${i === 0 ? 148 : 134} Z`}
                fill="url(#tbBrass)"
                stroke="#0B1D17"
                strokeWidth="4"
              />
              <ellipse cx={x} cy={i === 0 ? 151 : 137} rx="39" ry="12" fill="#FFF2C4" opacity="0.8" />
            </g>
          ))}

          {/* Hierbas colgadas junto a la ventana */}
          <g transform="translate(404 78)">
            <line x1="0" y1="0" x2="0" y2="42" stroke="#0B1D17" strokeWidth="3" />
            <path d="M-16 43 H16 L10 68 H-10 Z" fill="#7B4E3B" stroke="#0B1D17" strokeWidth="3" />
            <path d="M0 42 Q-22 70 -15 110 M0 42 Q20 68 12 102 M0 42 Q-4 82 2 122" fill="none" stroke="#7A9A80" strokeWidth="3" />
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse
                key={`herb-${i}`}
                cx={i % 2 === 0 ? -18 + i * 3 : 14 - i * 3}
                cy={62 + i * 12}
                rx="10"
                ry="4.5"
                transform={`rotate(${i % 2 === 0 ? -32 : 28} ${i % 2 === 0 ? -18 : 14} ${62 + i * 12})`}
                fill={i % 2 === 0 ? '#52745E' : '#65876D'}
                stroke="#0B1D17"
                strokeWidth="1.5"
              />
            ))}
          </g>

          {/* Pequeño cuadro de la casa */}
          <g transform="translate(1148 180)">
            <rect x="0" y="0" width="64" height="78" rx="4" fill="#D7C5A7" stroke="#0B1D17" strokeWidth="3" />
            <rect x="7" y="7" width="50" height="64" fill="#F1E3CC" stroke="#C8A12A" strokeWidth="1.5" />
            <path d="M18 42 H46 L42 58 Q32 64 22 58 Z" fill="#C86B46" stroke="#0B1D17" strokeWidth="2" />
            <path d="M46 46 Q55 46 53 53 Q51 58 44 56" fill="none" stroke="#0B1D17" strokeWidth="2" />
            <path d="M27 37 Q24 29 29 24 M34 37 Q31 28 37 22" fill="none" stroke="#6B432D" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* Planta de pared */}
          <g transform="translate(1390 330)">
            <path d="M0 0 Q-20 50 -8 102 M8 0 Q26 54 16 104" stroke="#58806A" strokeWidth="4" fill="none" />
            {[0, 1, 2, 3].map((i) => (
              <ellipse
                key={i}
                cx={i % 2 === 0 ? -14 - i * 4 : 18 + i * 3}
                cy={24 + i * 18}
                rx="18"
                ry="8"
                transform={`rotate(${i % 2 === 0 ? -28 : 24} ${i % 2 === 0 ? -14 : 18} ${24 + i * 18})`}
                fill={i % 2 === 0 ? '#3D5B47' : '#4E735B'}
              />
            ))}
            <path d="M-34 106 H42 L34 150 H-26 Z" fill="#7B4E3B" stroke="#0B1D17" strokeWidth="3" />
          </g>
        </svg>
      </div>

      {/* Luz cálida ambiental, sin lavar la escena */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_36%_28%,rgba(255,208,128,0.2),transparent_46%),linear-gradient(180deg,rgba(5,15,12,0.06),rgba(5,15,12,0.36))]" />
      <div
        className="pointer-events-none absolute inset-0 z-[2] opacity-[0.14] mix-blend-soft-light"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.14) 0.55px, transparent 0.75px), radial-gradient(rgba(0,0,0,0.16) 0.5px, transparent 0.8px)',
          backgroundSize: '4px 4px, 5px 5px',
          backgroundPosition: '0 0, 2px 2px',
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full opacity-[0.26] mix-blend-overlay"
      >
        <filter id="tbNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#tbNoise)" />
      </svg>
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_32%_48%,rgba(255,198,112,0.26),transparent_30%),radial-gradient(ellipse_at_center,transparent_38%,rgba(4,10,8,0.54)_100%)]" />

      {/* Barista de turno: cambia al recargar y al tocar la campana */}
      <div className="absolute bottom-[22%] left-[28%] z-[2] w-[190px] -translate-x-1/2 origin-bottom drop-shadow-[0_16px_20px_rgba(0,0,0,0.24)] sm:left-[34%] sm:w-[clamp(310px,25vw,400px)]" data-testid="title-barista" data-barista={barista.id}>
        <div className="relative">
          <TitleBarBarista variant={barista} reducedMotion={reducedMotion} menuHovered={menuHovered} />
        </div>
      </div>

      {/* Barra de madera en primer plano */}
      <div className="absolute inset-x-0 bottom-0 z-[3] h-[30%]">
        <div className="absolute inset-x-0 top-0 h-5 border-y-[3px] border-[#0B1D17] bg-gradient-to-b from-[#9A6847] via-[#6B432D] to-[#3D2419] shadow-[0_4px_0_#0B1D17]" />
        <div
          className="absolute inset-x-0 bottom-0 top-5 border-t border-[#B78661]/40"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,223,178,0.09) 0 2px, transparent 2px 96px), repeating-linear-gradient(90deg, transparent 0 94px, rgba(7,17,13,0.34) 94px 98px), linear-gradient(180deg, #5A3A26 0%, #43291D 100%)',
            boxShadow: 'inset 0 10px 22px rgba(0,0,0,0.3), inset 0 -12px 26px rgba(0,0,0,0.24)',
          }}
        >
          <div className="absolute inset-x-0 top-[20%] h-px bg-[#C8A12A]/22" />
          <div className="absolute inset-x-0 top-[58%] h-[3px] bg-[#C8A12A]/50" />
          <div className="absolute inset-x-0 bottom-[13%] h-[5px] bg-[#C8A12A]/70 shadow-[0_2px_0_#0B1D17]" />
          <div className="absolute inset-x-0 bottom-[26%] h-px bg-[#F3E6CF]/10" />
          {[12, 34, 56, 78, 88].map((left) => (
            <span
              key={`rivet-${left}`}
              aria-hidden="true"
              className="absolute top-[8%] h-1.5 w-1.5 rounded-full bg-[#C8A12A]/65 shadow-[0_1px_0_#0B1D17]"
              style={{ left: `${left}%` }}
            />
          ))}
          <svg
            aria-hidden="true"
            viewBox="0 0 1600 300"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]"
          >
            {[34, 92, 158, 224, 280].map((y) => (
              <path
                key={`grain-${y}`}
                d={`M0 ${y} C180 ${y - 8}, 310 ${y + 9}, 470 ${y + 1} S760 ${y - 5}, 930 ${y + 3} S1240 ${y - 7}, 1600 ${y + 2}`}
                fill="none"
                stroke="#E6C28D"
                strokeWidth="1.1"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Placa con el nombre y el saludo, atornillada a la barra */}
      <div className="absolute bottom-6 left-4 z-[4] flex max-w-[72vw] items-center gap-2.5 border-y border-[#C8A12A]/50 bg-[#07110D]/20 px-1.5 py-1.5 text-[#F3E6CF] sm:bottom-8 sm:left-8 sm:max-w-none sm:gap-3 sm:px-2.5">
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

      {/* Campana del turno: easter egg para cambiar de barista sin recargar */}
      <button
        type="button"
        data-testid="title-barista-bell"
        onClick={() => {
          setBarista((current) => nextBarista(current));
          soundEngine.unlock();
          soundEngine.playSfx('bell');
        }}
        aria-label="Cambiar el barista de turno"
        title="Tocar la campana del turno"
        className="absolute bottom-[31%] left-[53%] z-[5] hidden h-10 w-10 -translate-x-1/2 items-center justify-center text-[#C8A12A] transition-transform hover:-translate-y-0.5 focus:outline-2 focus:outline-offset-2 focus:outline-[#F0D278] sm:flex"
      >
        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
          <path d="M6 22 Q7 13 16 11 Q25 13 26 22 Z" fill="#C8A12A" stroke="#0B1D17" strokeWidth="2.2" />
          <path d="M5 23 H27" stroke="#0B1D17" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="16" cy="27" r="2.5" fill="#C8A12A" stroke="#0B1D17" strokeWidth="1.6" />
          <path d="M12 9 Q16 4 20 9" fill="none" stroke="#0B1D17" strokeWidth="2" />
        </svg>
      </button>

      {/* Marca de una taza que ya se fue */}
      <div className="pointer-events-none absolute bottom-[30.6%] left-[63%] z-[4] hidden h-4 w-16 -rotate-12 rounded-[50%] border border-[#3D2419]/35 opacity-45 sm:block" />

      {/* Taza de la casa sobre la barra */}
      <div className="pointer-events-none absolute bottom-[31%] left-[60%] z-[4] hidden w-28 -translate-x-1/2 sm:block">
        <svg viewBox="0 0 150 90" className="block w-full" aria-hidden="true">
          <ellipse cx="75" cy="77" rx="49" ry="8" fill="#0B1D17" opacity="0.35" />
          <ellipse cx="75" cy="72" rx="45" ry="10" fill="#E9D8BC" stroke="#0B1D17" strokeWidth="3" />
          <path d="M47 37 H101 L95 62 Q89 72 75 72 Q61 72 55 62 Z" fill="#F1E3CC" stroke="#0B1D17" strokeWidth="3.5" />
          <ellipse cx="74" cy="38" rx="27" ry="7" fill="#6B432D" stroke="#0B1D17" strokeWidth="3" />
          <path d="M101 44 Q119 42 118 55 Q117 66 97 64" fill="none" stroke="#0B1D17" strokeWidth="4" />
          <path d="M62 29 Q57 19 63 11" fill="none" stroke="#F1E3CC" strokeWidth="2.6" strokeLinecap="round" opacity="0.7" className={reducedMotion ? '' : 'animate-cafe-steam'} />
          <path d="M79 27 Q74 16 80 7" fill="none" stroke="#F1E3CC" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" className={reducedMotion ? '' : 'animate-cafe-steam-delayed'} />
        </svg>
      </div>

      {/* Dos gatos de la casa: siamés en la estantería y oscuro en la barra */}
      <div className="pointer-events-none absolute bottom-[59.3%] right-[6.5%] z-[3] h-2 w-20 border-y border-[#0B1D17] bg-[#8B5E3C] shadow-[0_2px_0_#0B1D17] sm:right-[16.5%] sm:w-32" />
      <div className="pointer-events-none absolute bottom-[60.2%] right-[8%] z-[3] h-2.5 w-14 rounded-[50%] bg-[#7A3F32]/80 sm:right-[18.5%] sm:w-24" />
      <button
        type="button"
        data-testid="title-cat-siames"
        onClick={() => petCat('Miau. El siamés de la casa te mira con ojos azules.')}
        aria-label="Acariciar al gato siamés"
        title="Acariciar al siamés"
        className="absolute bottom-[60%] right-[8%] z-[4] w-[72px] cursor-pointer text-left transition-transform hover:-translate-y-0.5 focus:outline-2 focus:outline-offset-4 focus:outline-[#F0D278] sm:right-[18.5%] sm:w-32"
      >
        <SiameseCat reducedMotion={reducedMotion} />
      </button>

      <button
        type="button"
        data-testid="title-cat-dark"
        onClick={() => petCat('Miau. El gato oscuro ronronea desde la barra.')}
        aria-label="Acariciar al gato oscuro"
        title="Acariciar al gato oscuro"
        className="absolute bottom-[31%] left-[55%] z-[4] w-[72px] -translate-x-1/2 cursor-pointer text-left transition-transform hover:-translate-y-0.5 focus:outline-2 focus:outline-offset-4 focus:outline-[#F0D278] sm:left-[69%] sm:w-28"
      >
        <DarkCat reducedMotion={reducedMotion} />
      </button>

      {petMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`pointer-events-none absolute bottom-[43%] left-[58%] z-[7] max-w-[78vw] border border-[#0B1D17] bg-[#F1E3CC] px-2.5 py-1.5 text-[10px] font-bold leading-snug text-[#1E3027] shadow-[3px_3px_0_#0B1D17] sm:bottom-[45%] sm:left-[60%] sm:text-xs ${
            reducedMotion ? '' : 'animate-[cafe-bubble_1.8s_ease-out_forwards]'
          }`}
        >
          {petMessage} ♥
        </div>
      )}

      {/* La carta física sobre la barra */}
      <button
        type="button"
        data-testid="title-menu-card"
        onClick={onOpenMenu}
        onMouseEnter={() => setMenuHovered(true)}
        onMouseLeave={() => setMenuHovered(false)}
        onFocus={() => setMenuHovered(true)}
        onBlur={() => setMenuHovered(false)}
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        aria-label="Abrir el menú de Cafetulia"
        className="group absolute bottom-[31%] right-[2%] z-[5] w-[120px] rotate-[1.5deg] text-left transition-transform duration-200 hover:-translate-y-2 hover:rotate-0 focus:outline-2 focus:outline-offset-4 focus:outline-[#F0D278] sm:right-[8%] sm:w-[196px]"
      >
        <span className="block border-2 border-[#0B1D17] bg-[#F1E3CC] p-3 shadow-[6px_7px_0_#0B1D17,0_20px_32px_rgba(0,0,0,0.3)] sm:p-4">
          <span className="mb-2.5 block h-px w-10 bg-[#C86B46]" />
          <span className="block font-serif text-[11px] font-semibold italic text-[#315A48] sm:text-sm">
            Cafetulia
          </span>
          <span className="mt-0.5 block border-y border-[#0B1D17]/25 py-1.5 font-serif text-3xl font-bold leading-none text-[#1E3027] sm:text-5xl">
            Menú
          </span>
          <span className="mt-2.5 flex items-center justify-between gap-2 text-[10px] font-bold text-[#5A3A26] sm:text-[11px]">
            <span>Abrir la carta</span>
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rotate-45 border-r-2 border-t-2 border-[#315A48] transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </span>
      </button>

      {/* Brillo suave de las lámparas sobre la barra */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[25%] z-[1] h-32 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,213,136,0.18),transparent_64%)]" />
    </div>
  );
}
