import React from 'react';
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
              stroke="url(#tbBrass)"
              strokeWidth="12"
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
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_42%_30%,rgba(255,208,128,0.12),transparent_46%),linear-gradient(180deg,rgba(5,15,12,0.1),rgba(5,15,12,0.36))]" />

      {/* Barista: el jugador detrás de la barra, secando una copa */}
      <div className="absolute bottom-[22%] left-[31%] z-[2] w-[164px] -translate-x-1/2 origin-bottom sm:left-[37%] sm:w-[clamp(250px,23vw,330px)]">
        <div className="relative">
          <svg viewBox="0 0 240 330" className="block w-full" aria-hidden="true">
            <defs>
              <linearGradient id="tbApron" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#315A48" />
                <stop offset="100%" stopColor="#1D3A2E" />
              </linearGradient>
            </defs>
            <ellipse cx="120" cy="321" rx="98" ry="12" fill="#07110D" opacity="0.5" />

            {/* Cabeza y cuello del barista */}
            <path d="M102 100 Q120 112 138 100 L145 125 H95 Z" fill="#D7A37F" stroke="#0B1D17" strokeWidth="3.5" />
            <circle cx="120" cy="68" r="43" fill="#D7A37F" stroke="#0B1D17" strokeWidth="4" />
            <path
              d="M78 65 Q78 19 120 19 Q162 19 162 65 Q150 42 120 42 Q90 42 78 65 Z"
              fill="#3A2921"
              stroke="#0B1D17"
              strokeWidth="3"
            />
            <path d="M78 65 Q72 78 80 91 Q86 71 86 62 Z" fill="#3A2921" stroke="#0B1D17" strokeWidth="2.4" />
            <path d="M162 65 Q168 78 160 91 Q154 71 154 62 Z" fill="#3A2921" stroke="#0B1D17" strokeWidth="2.4" />
            <circle cx="104" cy="70" r="3.2" fill="#241A16" />
            <circle cx="136" cy="70" r="3.2" fill="#241A16" />
            <path d="M110 84 Q120 91 130 84" fill="none" stroke="#8A513B" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M98 58 Q104 54 110 58" fill="none" stroke="#3A2921" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M130 58 Q136 54 142 58" fill="none" stroke="#3A2921" strokeWidth="2.4" strokeLinecap="round" />

            <path
              d="M53 139 Q64 102 120 100 Q176 102 187 139 L204 310 Q120 335 36 310 Z"
              fill="#E8D6B9"
              stroke="#0B1D17"
              strokeWidth="5"
            />
            <path
              d="M74 154 Q120 137 166 154 L178 300 Q120 321 62 300 Z"
              fill="url(#tbApron)"
              stroke="#0B1D17"
              strokeWidth="4"
            />
            <path d="M84 210 H156" stroke="#C8A12A" strokeWidth="3" opacity="0.75" />
            <rect x="98" y="224" width="44" height="27" rx="3" fill="#C86B46" stroke="#0B1D17" strokeWidth="3" />
            <path d="M108 236 H132" stroke="#F0D9B2" strokeWidth="3" strokeLinecap="round" />
            <path d="M120 142 V184" stroke="#0B1D17" strokeWidth="3" opacity="0.35" />
            <path d="M62 310 Q110 330 180 304" fill="none" stroke="#0B1D17" strokeWidth="3" opacity="0.35" />

            {/* Brazo izquierdo apoyado en la barra */}
            <path
              d="M70 156 Q38 204 48 252"
              fill="none"
              stroke="#D7A37F"
              strokeWidth="19"
              strokeLinecap="round"
            />
            <path
              d="M70 156 Q44 196 54 235"
              fill="none"
              stroke="#E8D6B9"
              strokeWidth="25"
              strokeLinecap="round"
            />
            <circle cx="50" cy="257" r="11" fill="#D7A37F" stroke="#0B1D17" strokeWidth="2.8" />
            <path d="M43 253 Q50 247 58 253" fill="none" stroke="#B97D5C" strokeWidth="1.8" opacity="0.6" />

            {/* Brazo derecho: paño de lino y copa que se seca */}
            <g
              className={reducedMotion ? '' : 'cafe-wipe'}
              style={{ transformOrigin: '178px 158px' }}
            >
              <path
                d="M172 154 Q222 170 211 220"
                fill="none"
                stroke="#D7A37F"
                strokeWidth="19"
                strokeLinecap="round"
              />
              <path
                d="M172 154 Q220 168 207 208"
                fill="none"
                stroke="#E8D6B9"
                strokeWidth="25"
                strokeLinecap="round"
              />

              {/* Copa de vino */}
              <path
                d="M196 170 H230 L223 195 Q213 204 203 195 Z"
                fill="#D9EEE3"
                fillOpacity="0.42"
                stroke="#BFDCCB"
                strokeWidth="3.2"
              />
              <path d="M213 195 V222" stroke="#BFDCCB" strokeWidth="3.2" />
              <path d="M201 222 H225" stroke="#BFDCCB" strokeWidth="3.6" strokeLinecap="round" />
              <path d="M202 177 Q208 183 211 190" fill="none" stroke="#FFFDF8" strokeWidth="1.8" opacity="0.75" />

              {/* Mano y paño de lino verde */}
              <circle cx="209" cy="224" r="11" fill="#D7A37F" stroke="#0B1D17" strokeWidth="2.8" />
              <path
                d="M194 212 Q212 202 230 216 Q218 235 196 228 Q190 220 194 212 Z"
                fill="#9FB5A4"
                stroke="#0B1D17"
                strokeWidth="2.8"
              />
              <path d="M203 211 Q215 218 224 212" fill="none" stroke="#D7E4D9" strokeWidth="2" />
              <path d="M199 221 Q211 227 222 220" fill="none" stroke="#D7E4D9" strokeWidth="1.8" opacity="0.8" />
            </g>
          </svg>

          <button
            type="button"
            data-testid="title-hero-avatar"
            onClick={onAvatarClick}
            aria-label={`Cambiar tu avatar (${nickname})`}
            title="Cambiar tu avatar"
            className="absolute left-1/2 top-[57%] z-[2] -translate-x-1/2 rounded-full border-[3px] border-[#0B1D17] bg-[#F3E6CF] p-1 shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5 hover:scale-105 focus:outline-2 focus:outline-offset-4 focus:outline-[#F0D278] cursor-pointer"
          >
            <span className="block overflow-hidden rounded-full border border-[#C8A12A]/70">
              <PlayerAvatar avatarId={avatarId} size={42} />
            </span>
          </button>
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
        </div>
      </div>

      {/* Placa con el nombre y el saludo, atornillada a la barra */}
      <div className="absolute bottom-6 left-4 z-[4] max-w-[62vw] border-y border-[#C8A12A]/50 bg-[#07110D]/20 px-1.5 py-1 text-[#F3E6CF] sm:bottom-8 sm:left-8 sm:max-w-none sm:px-2.5">
        <p className="font-serif text-[15px] font-semibold leading-tight sm:text-lg" data-testid="title-greeting">
          {greeting}
        </p>
        <p className="mt-0.5 text-[9px] font-semibold tracking-wide text-[#C8A12A]/90 sm:text-[10px]">
          Estás en la barra · {nickname}
        </p>
      </div>

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

      {/* La carta física sobre la barra */}
      <button
        type="button"
        data-testid="title-menu-card"
        onClick={onOpenMenu}
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        aria-label="Abrir el menú de Cafetulia"
        className="group absolute bottom-[31%] right-[4%] z-[5] w-[132px] rotate-[1.5deg] text-left transition-transform duration-200 hover:-translate-y-2 hover:rotate-0 focus:outline-2 focus:outline-offset-4 focus:outline-[#F0D278] sm:right-[8%] sm:w-[196px]"
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
