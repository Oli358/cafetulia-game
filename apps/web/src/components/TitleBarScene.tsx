import React, { useState } from 'react';
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
  const [menuHovered, setMenuHovered] = useState(false);

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

      {/* Barista: el jugador detrás de la barra, secando una copa */}
      <div className="absolute bottom-[22%] left-[32%] z-[2] w-[200px] -translate-x-1/2 origin-bottom drop-shadow-[0_16px_20px_rgba(0,0,0,0.24)] sm:left-[34%] sm:w-[clamp(310px,25vw,400px)]">
        <div className="relative">
          <svg viewBox="0 0 300 420" className="block w-full" aria-hidden="true">
            <defs>
              <linearGradient id="tbApron" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#345D49" />
                <stop offset="100%" stopColor="#1E3B2E" />
              </linearGradient>
              <linearGradient id="tbShirt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F0E1C8" />
                <stop offset="100%" stopColor="#D8C5A7" />
              </linearGradient>
              <linearGradient id="tbSkin" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D9A27D" />
                <stop offset="100%" stopColor="#C48662" />
              </linearGradient>
            </defs>

            <ellipse cx="150" cy="405" rx="112" ry="13" fill="#07110D" opacity="0.48" />

            <g className={reducedMotion ? '' : 'cafe-breathe'} style={{ transformOrigin: '150px 405px' }}>
              {/* Camisa con mangas remangadas */}
              <path
                d="M58 164 Q76 126 150 123 Q224 126 242 164 L258 393 Q150 420 42 393 Z"
                fill="url(#tbShirt)"
                stroke="#0B1D17"
                strokeWidth="5"
              />
              <path
                d="M58 164 Q76 126 150 123 Q224 126 242 164 L240 183 Q196 160 150 160 Q104 160 60 183 Z"
                fill="#E6D2B5"
                stroke="#0B1D17"
                strokeWidth="3"
                opacity="0.8"
              />

              {/* Cuello y pañuelo de la casa */}
              <path d="M122 112 Q150 130 178 112 L188 150 Q150 168 112 150 Z" fill="#C48662" stroke="#0B1D17" strokeWidth="3.5" />
              <path d="M128 129 Q150 143 172 129 L158 160 L150 151 L142 160 Z" fill="#7A3F32" stroke="#0B1D17" strokeWidth="3" />

              {/* Delantal de lino verde */}
              <path
                d="M92 184 Q150 164 208 184 L220 390 Q150 414 80 390 Z"
                fill="url(#tbApron)"
                stroke="#0B1D17"
                strokeWidth="4.5"
              />
              <path d="M108 186 L100 158 M192 186 L200 158" stroke="#0B1D17" strokeWidth="4" />
              <path d="M86 244 H214" stroke="#C8A12A" strokeWidth="2.2" opacity="0.65" />
              <path d="M94 300 H206" stroke="#0B1D17" strokeWidth="2" opacity="0.25" />
              <path d="M132 190 Q150 202 168 190" fill="none" stroke="#C8A12A" strokeWidth="2" opacity="0.55" />

              {/* Bolsillo, libreta y cuchara de barra */}
              <path d="M148 250 H214 Q220 290 206 318 H154 Q140 286 148 250 Z" fill="#294B3B" stroke="#0B1D17" strokeWidth="3" />
              <path d="M160 258 H202" stroke="#B7D0BE" strokeWidth="2" opacity="0.45" />
              <rect x="166" y="271" width="33" height="25" rx="2" fill="#D7C5A7" stroke="#0B1D17" strokeWidth="2.4" />
              <path d="M170 279 H195 M170 285 H189" stroke="#7A5A43" strokeWidth="1.8" />
              <path d="M208 263 L218 220" stroke="#C8A12A" strokeWidth="3.2" strokeLinecap="round" />
              <circle cx="218" cy="218" r="4" fill="#C8A12A" stroke="#0B1D17" strokeWidth="1.6" />

              {/* Pliegues y costuras del delantal */}
              <path d="M108 350 Q150 366 196 344" fill="none" stroke="#0B1D17" strokeWidth="2.4" opacity="0.28" />
              <path d="M112 210 Q128 225 122 250" fill="none" stroke="#0B1D17" strokeWidth="2" opacity="0.22" />
              <path d="M188 210 Q174 230 180 252" fill="none" stroke="#0B1D17" strokeWidth="2" opacity="0.22" />
            </g>

            {/* Cabeza: pelo negro peinado hacia delante, nariz y lunar */}
            <g className={menuHovered ? 'cafe-head-gaze' : ''}>
            <g className={reducedMotion ? '' : 'cafe-head-sway'} style={{ transformOrigin: '150px 130px' }}>
              <circle cx="103" cy="89" r="10" fill="#C48662" stroke="#0B1D17" strokeWidth="3" />
              <circle cx="197" cy="89" r="10" fill="#C48662" stroke="#0B1D17" strokeWidth="3" />

              {/* Melena negra con raya lateral y flequillo hacia delante */}
              <path
                d="M99 82 C96 38 117 18 150 18 C184 18 205 37 202 82 C195 59 181 48 164 44 C155 60 139 68 123 64 C116 62 111 59 107 54 C103 62 100 71 99 82 Z"
                fill="#151210"
                stroke="#0B1D17"
                strokeWidth="4"
              />
              <path
                d="M104 60 C113 51 124 43 136 38 C152 31 170 32 186 40 C179 54 171 60 161 64 C151 75 132 77 117 69 C109 65 105 62 104 60 Z"
                fill="#201B18"
                stroke="#0B1D17"
                strokeWidth="2.8"
              />
              <path
                d="M104 52 C116 43 130 40 143 43 C157 46 167 53 179 50 C186 48 191 43 194 38 C196 48 193 58 187 66 C176 75 162 75 150 69 C137 63 126 67 116 71 C109 73 105 64 104 52 Z"
                fill="#151210"
                stroke="#0B1D17"
                strokeWidth="3"
              />
              <path
                d="M107 57 C119 67 136 73 153 68 C166 64 177 56 184 45 C188 52 190 60 190 68 C176 67 163 73 152 81 C137 89 120 84 107 72 C105 67 105 61 107 57 Z"
                fill="#28211D"
                stroke="#0B1D17"
                strokeWidth="2.6"
              />
              <path d="M108 37 Q114 26 123 27 Q117 35 111 44 Z" fill="#151210" />
              <path d="M176 28 Q186 26 191 35 Q182 36 175 43 Z" fill="#151210" />
              <path d="M114 66 Q122 76 132 77 Q126 82 118 76 C114 73 112 69 114 66 Z" fill="#151210" />
              <path d="M159 52 Q167 61 165 72 Q172 66 173 55 Z" fill="#201B18" opacity="0.9" />
              <path d="M112 55 C124 65 139 70 154 65 C167 60 177 53 184 45" fill="none" stroke="#5D5048" strokeWidth="1.8" opacity="0.55" />
              <path d="M119 47 C131 58 147 63 162 57" fill="none" stroke="#5D5048" strokeWidth="1.5" opacity="0.45" />
              <path d="M109 48 C124 61 143 65 161 57 C172 52 180 45 185 40" fill="none" stroke="#62534A" strokeWidth="2.2" opacity="0.68" />
              <path d="M122 41 C136 53 152 56 171 48" fill="none" stroke="#62534A" strokeWidth="1.8" opacity="0.45" />
              <path d="M127 42 Q137 59 133 78" fill="none" stroke="#5D5048" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
              <path d="M168 38 Q175 54 167 66" fill="none" stroke="#5D5048" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
              <path d="M188 40 Q194 53 192 70" fill="none" stroke="#5D5048" strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
              <path d="M101 78 Q98 85 101 92 Q105 85 106 77 Z" fill="#151210" stroke="#0B1D17" strokeWidth="2.4" />
              <path d="M199 78 Q202 85 199 92 Q195 85 194 77 Z" fill="#151210" stroke="#0B1D17" strokeWidth="2.4" />
              <path d="M117 52 Q125 67 121 82" fill="none" stroke="#151210" strokeWidth="5" strokeLinecap="round" />
              <path d="M187 46 Q192 57 189 70" fill="none" stroke="#151210" strokeWidth="3.2" strokeLinecap="round" />

              {/* Cara con mandíbula y pómulo */}
              <path
                d="M106 78 C106 47 124 31 150 31 C176 31 194 47 194 78 L191 97 Q182 121 150 127 Q118 121 109 97 Z"
                fill="url(#tbSkin)"
                stroke="#0B1D17"
                strokeWidth="4"
              />

              {/* Flequillo delantero, por delante de la cara */}
              <path
                d="M106 63 C111 43 128 32 150 32 C171 32 188 43 194 60 C184 52 172 48 159 50 C146 52 134 60 124 67 C116 72 109 70 106 63 Z"
                fill="#151210"
                stroke="#0B1D17"
                strokeWidth="3"
              />
              <path d="M111 57 C124 68 143 72 160 65 C171 60 180 52 188 44" fill="none" stroke="#5D5048" strokeWidth="2" opacity="0.65" />
              <path d="M120 47 C131 58 143 64 157 61" fill="none" stroke="#5D5048" strokeWidth="1.7" opacity="0.5" />
              <path d="M126 45 Q136 59 131 73" fill="none" stroke="#5D5048" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
              <path d="M167 37 Q175 52 168 66" fill="none" stroke="#5D5048" strokeWidth="1.7" strokeLinecap="round" opacity="0.45" />
              <path d="M118 68 Q127 76 139 75" fill="none" stroke="#151210" strokeWidth="4.5" strokeLinecap="round" />

              <path d="M108 95 Q113 121 139 129" fill="none" stroke="#B97D5C" strokeWidth="2.6" opacity="0.36" />
              <path d="M178 100 Q181 115 171 126" fill="none" stroke="#A96D50" strokeWidth="2" opacity="0.3" />
              <path d="M128 127 Q150 138 174 125" fill="none" stroke="#B97D5C" strokeWidth="1.6" opacity="0.28" />
              <path d="M112 86 Q116 106 128 119" fill="none" stroke="#F1C79C" strokeWidth="2.4" opacity="0.55" />
              <path d="M112 40 Q126 27 144 26" fill="none" stroke="#8B7768" strokeWidth="2.2" opacity="0.55" />
              <path d="M76 176 Q64 202 71 229" fill="none" stroke="#FFF0D1" strokeWidth="3" opacity="0.3" />
              <path d="M108 94 Q112 121 138 128" fill="none" stroke="#B97D5C" strokeWidth="2.4" opacity="0.35" />

              {/* Cejas y ojos con mirada hacia la copa */}
              <path d="M115 70 Q128 64 141 68" fill="none" stroke="#1B1715" strokeWidth="4.2" strokeLinecap="round" />
              <path d="M160 64 Q173 57 185 66" fill="none" stroke="#1B1715" strokeWidth="4.2" strokeLinecap="round" />
              <ellipse cx="130" cy="81" rx="6.5" ry="5" fill="#F4E4CC" stroke="#8E553E" strokeWidth="1" />
              <ellipse cx="170" cy="81" rx="6.5" ry="5" fill="#F4E4CC" stroke="#8E553E" strokeWidth="1" />
              <ellipse cx="135" cy="83" rx="3.2" ry="3.8" fill="#201916" />
              <ellipse cx="175" cy="83" rx="3.2" ry="3.8" fill="#201916" />
              <circle cx="136" cy="81" r="1.1" fill="#FFF4DD" />
              <circle cx="176" cy="81" r="1.1" fill="#FFF4DD" />
              <path d="M124 78 Q130 74 136 78" fill="none" stroke="#8E553E" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M164 78 Q170 74 176 78" fill="none" stroke="#8E553E" strokeWidth="1.5" strokeLinecap="round" />
              <g className={reducedMotion ? '' : 'cafe-blink'}>
                <path d="M123 81 Q130 76 137 81 Q130 85 123 81 Z" fill="#D9A27D" />
                <path d="M163 81 Q170 76 177 81 Q170 85 163 81 Z" fill="#D9A27D" />
              </g>

              {/* Nariz característica */}
              <path
                d="M152 66 C160 77 162 88 157 97 C153 104 143 103 139 96"
                fill="none"
                stroke="#8E553E"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path d="M139 96 Q149 106 161 97" fill="#D9A27D" fillOpacity="0.35" stroke="#E1B08C" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M155 73 Q162 84 158 95" fill="none" stroke="#B97D5C" strokeWidth="1.5" opacity="0.58" />
              <path d="M146 92 Q151 97 157 92" fill="none" stroke="#F1C79C" strokeWidth="1.5" opacity="0.8" />
              <circle cx="140" cy="98" r="1.5" fill="#8E553E" opacity="0.9" />
              <circle cx="157" cy="99" r="1.5" fill="#8E553E" opacity="0.9" />
              <path d="M134 101 Q139 107 144 105" fill="none" stroke="#B97D5C" strokeWidth="1.4" opacity="0.35" />

              {/* Pequeño lunar en su mejilla izquierda */}
              <circle cx="179" cy="102" r="3" fill="#3A241C" />
              <path d="M110 101 Q115 109 124 111" fill="none" stroke="#B97D5C" strokeWidth="2" opacity="0.28" />

              {/* Boca contenida y mentón */}
              <path d="M135 112 Q148 121 165 109" fill="none" stroke="#7D3F35" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M143 120 Q151 124 159 117" fill="none" stroke="#B97D5C" strokeWidth="1.8" opacity="0.65" />
              <path d="M136 112 Q141 117 147 118" fill="none" stroke="#7D3F35" strokeWidth="1.2" opacity="0.45" />
              <path d="M137 130 Q150 135 163 129" fill="none" stroke="#8E553E" strokeWidth="1.5" opacity="0.25" />
            </g>
            </g>

            {/* Mano izquierda: sujeta la copa */}
            <g className={reducedMotion ? '' : 'cafe-hold'} style={{ transformOrigin: '196px 280px' }}>
              <path
                d="M72 164 Q72 213 107 246"
                fill="none"
                stroke="#E8D6B9"
                strokeWidth="30"
                strokeLinecap="round"
              />
              <path d="M102 238 Q105 248 112 253" fill="none" stroke="#D8C5A7" strokeWidth="10" strokeLinecap="round" />
              <path
                d="M112 252 Q137 275 175 289"
                fill="none"
                stroke="#C48662"
                strokeWidth="21"
                strokeLinecap="round"
              />
              <path d="M114 257 Q120 265 128 269" fill="none" stroke="#8E553E" strokeWidth="1.7" opacity="0.5" />
              <path d="M108 243 Q114 250 121 251" fill="none" stroke="#8E553E" strokeWidth="1.8" opacity="0.35" />
              <path
                d="M172 281 Q190 270 206 281 Q214 291 201 299 Q182 305 168 295 Q163 287 172 281 Z"
                fill="#C48662"
                stroke="#0B1D17"
                strokeWidth="2.8"
              />
              <path d="M178 285 Q189 293 200 286" fill="none" stroke="#8E553E" strokeWidth="1.8" />
              <path d="M181 294 Q191 301 202 293" fill="none" stroke="#8E553E" strokeWidth="1.6" opacity="0.8" />
              <path d="M173 293 Q168 298 165 303" fill="none" stroke="#8E553E" strokeWidth="2" strokeLinecap="round" />

              {/* Copa de balón */}
              <path
                d="M174 198 H218 L210 235 Q198 249 184 235 Z"
                fill="#D9EEE3"
                fillOpacity="0.38"
                stroke="#BFDCCB"
                strokeWidth="3.4"
              />
              <path d="M196 240 V282" stroke="#BFDCCB" strokeWidth="3.4" />
              <path d="M179 285 H213" stroke="#BFDCCB" strokeWidth="3.6" strokeLinecap="round" />
              <path d="M178 208 Q190 220 192 235" fill="none" stroke="#FFFDF8" strokeWidth="2" opacity="0.8" />
              <circle cx="207" cy="212" r="1.4" fill="#FFFDF8" opacity="0.9" className={reducedMotion ? '' : 'cafe-glint'} />
            </g>

            {/* Mano derecha: pasa el paño por la copa */}
            <g className={reducedMotion ? '' : 'cafe-wipe'} style={{ transformOrigin: '228px 170px' }}>
              <path
                d="M228 164 Q252 188 242 216"
                fill="none"
                stroke="#E8D6B9"
                strokeWidth="30"
                strokeLinecap="round"
              />
              <path d="M239 210 Q244 220 237 228" fill="none" stroke="#D8C5A7" strokeWidth="9" strokeLinecap="round" />
              <path d="M242 216 Q236 226 224 232" fill="none" stroke="#C48662" strokeWidth="20" strokeLinecap="round" />
              <path d="M240 220 Q236 228 229 232" fill="none" stroke="#8E553E" strokeWidth="1.6" opacity="0.5" />
              <path
                d="M218 208 Q238 198 248 214 Q242 231 224 234 Q211 224 218 208 Z"
                fill="#9FB5A4"
                stroke="#0B1D17"
                strokeWidth="2.8"
              />
              <path d="M224 212 Q235 219 242 213" fill="none" stroke="#D7E4D9" strokeWidth="2" />
              <path d="M219 223 Q230 228 240 221" fill="none" stroke="#D7E4D9" strokeWidth="1.8" opacity="0.8" />
              <circle cx="213" cy="230" r="9" fill="#C48662" stroke="#0B1D17" strokeWidth="2.4" />
              <path d="M208 226 Q213 224 217 228" fill="none" stroke="#8E553E" strokeWidth="1.6" />
              <path d="M218 226 Q223 223 226 228" fill="none" stroke="#8E553E" strokeWidth="1.4" />
              <path d="M220 232 Q225 229 229 233" fill="none" stroke="#8E553E" strokeWidth="1.4" />
            </g>
          </svg>

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

      {/* Gato dormilón de la casa, sobre la barra */}
      <div className="pointer-events-none absolute bottom-[31%] left-[69%] z-[4] hidden w-24 -translate-x-1/2 sm:block">
        <svg viewBox="0 0 120 70" className="block w-full" aria-hidden="true">
          <ellipse cx="60" cy="62" rx="42" ry="6" fill="#0B1D17" opacity="0.34" />
          <ellipse cx="60" cy="45" rx="38" ry="19" fill="#1B1715" stroke="#0B1D17" strokeWidth="3" />
          <path d="M42 38 Q60 28 79 38 Q72 45 60 45 Q48 45 42 38 Z" fill="#2A211D" />
          <path d="M22 46 Q8 45 9 31 Q10 22 19 23" fill="none" stroke="#1B1715" strokeWidth="8" strokeLinecap="round" className={reducedMotion ? '' : 'animate-cafe-tail'} />
          <circle cx="86" cy="36" r="17" fill="#1B1715" stroke="#0B1D17" strokeWidth="3" />
          <path d="M74 25 L78 13 L86 23 Z" fill="#1B1715" stroke="#0B1D17" strokeWidth="2.5" />
          <path d="M94 23 L103 14 L104 28 Z" fill="#1B1715" stroke="#0B1D17" strokeWidth="2.5" />
          <path d="M79 37 Q82 34 85 37" fill="none" stroke="#E9D8BC" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M89 37 Q92 34 95 37" fill="none" stroke="#E9D8BC" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M84 43 Q88 45 92 43" fill="none" stroke="#E9D8BC" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M78 47 Q86 51 96 47" fill="none" stroke="#C8A12A" strokeWidth="2.4" />
          <circle cx="87" cy="49" r="2.2" fill="#C8A12A" stroke="#0B1D17" strokeWidth="1.2" />
          <path d="M55 36 Q60 31 65 36" fill="none" stroke="#3B302A" strokeWidth="1.6" opacity="0.7" />
        </svg>
      </div>

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
