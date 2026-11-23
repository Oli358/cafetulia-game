import React from 'react';

export type BaristaAction = 'polish' | 'shake' | 'coffee';
export type BaristaHairStyle = 'forward' | 'waves' | 'curls' | 'bun';

export type BaristaVariant = {
  id: string;
  label: string;
  action: BaristaAction;
  skin: string;
  skinShade: string;
  hair: string;
  hairLight: string;
  shirt: string;
  shirtShade: string;
  apron: string;
  apronShade: string;
  accent: string;
  hairStyle: BaristaHairStyle;
  mole?: { x: number; y: number; r: number };
  glasses?: boolean;
  earring?: boolean;
};

export const BARISTA_VARIANTS: BaristaVariant[] = [
  {
    id: 'maitre',
    label: 'El de la casa',
    action: 'polish',
    skin: '#C48662',
    skinShade: '#A96D50',
    hair: '#151210',
    hairLight: '#5D5048',
    shirt: '#E8D6B9',
    shirtShade: '#D8C5A7',
    apron: '#345D49',
    apronShade: '#1E3B2E',
    accent: '#7A3F32',
    hairStyle: 'forward',
    mole: { x: 163, y: 99, r: 1.4 },
  },
  {
    id: 'companera',
    label: 'La compañera de barra',
    action: 'shake',
    skin: '#9B654E',
    skinShade: '#7C4D3C',
    hair: '#14100E',
    hairLight: '#54443D',
    shirt: '#E6CFB2',
    shirtShade: '#CEB492',
    apron: '#5A3540',
    apronShade: '#38212B',
    accent: '#B46A3F',
    hairStyle: 'waves',
    earring: true,
  },
  {
    id: 'manana',
    label: 'La ayuda de la mañana',
    action: 'coffee',
    skin: '#D2A17F',
    skinShade: '#B77F5E',
    hair: '#3A241B',
    hairLight: '#76513B',
    shirt: '#F0E0C4',
    shirtShade: '#D6BE99',
    apron: '#405A68',
    apronShade: '#263A45',
    accent: '#A65F3F',
    hairStyle: 'curls',
    glasses: true,
  },
  {
    id: 'noche',
    label: 'El turno de noche',
    action: 'coffee',
    skin: '#7E513B',
    skinShade: '#5E3A2C',
    hair: '#0D0C0B',
    hairLight: '#443832',
    shirt: '#DCC8AD',
    shirtShade: '#BFA886',
    apron: '#2F4A3E',
    apronShade: '#1A2C25',
    accent: '#A86A4A',
    hairStyle: 'bun',
    earring: true,
  },
];

export function pickRandomBarista(): BaristaVariant {
  const fallback = BARISTA_VARIANTS[0];
  if (!fallback) throw new Error('No hay baristas disponibles');

  let lastId: string | null = null;
  try {
    lastId = window.sessionStorage.getItem('cafetulia-ultimo-barista');
  } catch {
    lastId = null;
  }

  const candidates = BARISTA_VARIANTS.filter((variant) => variant.id !== lastId);
  return candidates[Math.floor(Math.random() * candidates.length)] ?? fallback;
}

export function nextBarista(current: BaristaVariant): BaristaVariant {
  const fallback = BARISTA_VARIANTS[0];
  if (!fallback) throw new Error('No hay baristas disponibles');
  const index = BARISTA_VARIANTS.findIndex((variant) => variant.id === current.id);
  return BARISTA_VARIANTS[(index + 1) % BARISTA_VARIANTS.length] ?? fallback;
}

type TitleBarBaristaProps = {
  variant: BaristaVariant;
  reducedMotion: boolean;
  menuHovered: boolean;
};

export function TitleBarBarista({
  variant,
  reducedMotion,
  menuHovered,
}: TitleBarBaristaProps): React.ReactElement {
  const hairStyle = variant.hairStyle;
  const isForward = hairStyle === 'forward';
  const isWaves = hairStyle === 'waves';
  const isCurls = hairStyle === 'curls';

  return (
    <svg viewBox="0 0 300 420" className="block w-full" aria-hidden="true">
      <defs>
        <linearGradient id="tbApron" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={variant.apron} />
          <stop offset="100%" stopColor={variant.apronShade} />
        </linearGradient>
        <linearGradient id="tbShirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={variant.shirt} />
          <stop offset="100%" stopColor={variant.shirtShade} />
        </linearGradient>
        <linearGradient id="tbSkin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={variant.skin} />
          <stop offset="100%" stopColor={variant.skinShade} />
        </linearGradient>
      </defs>

      <ellipse cx="150" cy="405" rx="112" ry="13" fill="#07110D" opacity="0.48" />

      <g className={reducedMotion ? '' : 'cafe-breathe'} style={{ transformOrigin: '150px 405px' }}>
        {/* Camisa */}
        <path
          d="M58 164 Q76 126 150 123 Q224 126 242 164 L258 393 Q150 420 42 393 Z"
          fill="url(#tbShirt)"
          stroke="#0B1D17"
          strokeWidth="5"
        />
        <path
          d="M58 164 Q76 126 150 123 Q224 126 242 164 L240 183 Q196 160 150 160 Q104 160 60 183 Z"
          fill={variant.shirtShade}
          stroke="#0B1D17"
          strokeWidth="3"
          opacity="0.8"
        />
        <path d="M122 112 Q150 130 178 112 L188 150 Q150 168 112 150 Z" fill={variant.skin} stroke="#0B1D17" strokeWidth="3.5" />
        {/* Cuello de camisa abierto, sin pañuelo que parezca barba */}
        <path d="M112 148 Q128 138 150 158 Q172 138 188 148 L184 164 Q150 178 116 164 Z" fill={variant.shirt} stroke="#0B1D17" strokeWidth="2.8" />
        <path d="M132 145 L150 160 L168 145" fill="none" stroke={variant.shirtShade} strokeWidth="2.2" />
        <path d="M119 151 L150 169 L181 151" fill="none" stroke="#0B1D17" strokeWidth="1.4" opacity="0.45" />

        {/* Delantal y herramientas */}
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
        <path d="M148 250 H214 Q220 290 206 318 H154 Q140 286 148 250 Z" fill={variant.apronShade} stroke="#0B1D17" strokeWidth="3" />
        <path d="M160 258 H202" stroke="#B7D0BE" strokeWidth="2" opacity="0.45" />
        <rect x="166" y="271" width="33" height="25" rx="2" fill={variant.shirtShade} stroke="#0B1D17" strokeWidth="2.4" />
        <path d="M170 279 H195 M170 285 H189" stroke="#7A5A43" strokeWidth="1.8" />
        <path d="M208 263 L218 220" stroke="#C8A12A" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="218" cy="218" r="4" fill="#C8A12A" stroke="#0B1D17" strokeWidth="1.6" />
        <path d="M108 350 Q150 366 196 344" fill="none" stroke="#0B1D17" strokeWidth="2.4" opacity="0.28" />
        <path d="M112 210 Q128 225 122 250" fill="none" stroke="#0B1D17" strokeWidth="2" opacity="0.22" />
        <path d="M188 210 Q174 230 180 252" fill="none" stroke="#0B1D17" strokeWidth="2" opacity="0.22" />
      </g>

      {/* Cabeza */}
      <g className={menuHovered ? 'cafe-head-gaze' : ''}>
        <g className={reducedMotion ? '' : 'cafe-head-sway'} style={{ transformOrigin: '150px 130px' }}>
          <circle cx="103" cy="89" r="10" fill={variant.skin} stroke="#0B1D17" strokeWidth="3" />
          <circle cx="197" cy="89" r="10" fill={variant.skin} stroke="#0B1D17" strokeWidth="3" />

          {isForward && <ForwardHair variant={variant} />}
          {isWaves && <WavesHair variant={variant} />}
          {isCurls && <CurlsHair variant={variant} />}
          {hairStyle === 'bun' && <BunHair variant={variant} />}

          <path
            d="M106 78 C106 47 124 31 150 31 C176 31 194 47 194 78 L191 97 Q182 121 150 127 Q118 121 109 97 Z"
            fill="url(#tbSkin)"
            stroke="#0B1D17"
            strokeWidth="4"
          />

          {/* La capa frontal se dibuja después de la cara para que no queden claros de piel en el pelo. */}
          {isForward && <ForwardFront variant={variant} />}
          {isWaves && <WavesFront variant={variant} />}
          {isCurls && <CurlsFront variant={variant} />}
          {hairStyle === 'bun' && <BunFront variant={variant} />}

          {isForward && <ForwardFringe variant={variant} />}
          {isWaves && <WavesFringe variant={variant} />}
          {isCurls && <CurlsFringe variant={variant} />}

          <path d="M108 95 Q113 121 139 129" fill="none" stroke={variant.skinShade} strokeWidth="2.6" opacity="0.36" />
          <path d="M178 100 Q181 115 171 126" fill="none" stroke={variant.skinShade} strokeWidth="2" opacity="0.3" />
          <path d="M128 127 Q150 138 174 125" fill="none" stroke={variant.skinShade} strokeWidth="1.6" opacity="0.28" />
          <path d="M112 86 Q116 106 128 119" fill="none" stroke="#F1C79C" strokeWidth="2.4" opacity="0.45" />

          <path d="M115 69 Q128 64 141 68" fill="none" stroke={variant.hair} strokeWidth="4.2" strokeLinecap="round" />
          <path d="M159 68 Q172 63 185 68" fill="none" stroke={variant.hair} strokeWidth="4.2" strokeLinecap="round" />
          <ellipse cx="130" cy="81" rx="6.5" ry="5" fill="#F4E4CC" stroke={variant.skinShade} strokeWidth="1" />
          <ellipse cx="170" cy="81" rx="6.5" ry="5" fill="#F4E4CC" stroke={variant.skinShade} strokeWidth="1" />
          <ellipse cx="135" cy="83" rx="3.2" ry="3.8" fill="#201916" />
          <ellipse cx="175" cy="83" rx="3.2" ry="3.8" fill="#201916" />
          <circle cx="136" cy="81" r="1.1" fill="#FFF4DD" />
          <circle cx="176" cy="81" r="1.1" fill="#FFF4DD" />
          <path d="M124 78 Q130 74 136 78" fill="none" stroke={variant.skinShade} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M164 78 Q170 74 176 78" fill="none" stroke={variant.skinShade} strokeWidth="1.5" strokeLinecap="round" />

          <g className={reducedMotion ? '' : 'cafe-blink'}>
            <ellipse cx="130" cy="81" rx="8" ry="6" fill={variant.skin} />
            <ellipse cx="170" cy="81" rx="8" ry="6" fill={variant.skin} />
            <path d="M122 80 Q130 84 138 80" fill="none" stroke={variant.hair} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M162 80 Q170 84 178 80" fill="none" stroke={variant.hair} strokeWidth="2.2" strokeLinecap="round" />
          </g>

          {variant.glasses && (
            <g fill="none" stroke="#2A211D" strokeWidth="2">
              <circle cx="131" cy="82" r="11" />
              <circle cx="169" cy="82" r="11" />
              <path d="M142 81 Q150 77 158 81" />
            </g>
          )}

          <path
            d="M151 70 C154 78 155 86 153 92 C151 96 145 95 143 91"
            fill="none"
            stroke={variant.skinShade}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path d="M143 91 Q149 97 155 92" fill="none" stroke="#E1B08C" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M153 76 Q156 83 154 90" fill="none" stroke={variant.skinShade} strokeWidth="1.2" opacity="0.42" />
          <circle cx="144" cy="93" r="1.1" fill={variant.skinShade} opacity="0.75" />
          <circle cx="154" cy="94" r="1.1" fill={variant.skinShade} opacity="0.75" />

          {variant.mole && (
            <circle cx={variant.mole.x} cy={variant.mole.y} r={variant.mole.r} fill="#3A241C" />
          )}

          {variant.earring && (
            <circle cx="199" cy="99" r="4.2" fill="none" stroke="#C8A12A" strokeWidth="2" />
          )}

          <path d="M135 112 Q148 121 165 109" fill="none" stroke="#7D3F35" strokeWidth="3" strokeLinecap="round" />
          <path d="M143 120 Q151 124 159 117" fill="none" stroke={variant.skinShade} strokeWidth="1.7" opacity="0.6" />
          <path d="M136 112 Q141 117 147 118" fill="none" stroke="#7D3F35" strokeWidth="1.2" opacity="0.45" />
          <path d="M137 130 Q150 135 163 129" fill="none" stroke={variant.skinShade} strokeWidth="1.5" opacity="0.25" />

          {variant.id === 'noche' && (
            <g fill={variant.hair} stroke="#0B1D17" strokeWidth="1.6">
              <path d="M137 117 Q150 131 163 117 Q160 129 150 134 Q140 129 137 117 Z" opacity="0.9" />
              <path d="M141 108 Q150 113 159 108 Q154 115 150 115 Q146 115 141 108 Z" opacity="0.75" strokeWidth="1.2" />
            </g>
          )}
        </g>
      </g>

      <BaristaAction action={variant.action} variant={variant} reducedMotion={reducedMotion} />
    </svg>
  );
}

function ForwardHair({ variant }: { variant: BaristaVariant }): React.ReactElement {
  return (
    <g fill={variant.hair} stroke="#0B1D17" strokeWidth="3">
      {/* Corte corto: nuca y laterales rebajados */}
      <path d="M101 80 C100 50 116 31 150 31 C184 31 200 50 199 80 C192 64 180 56 166 53 C152 50 138 54 126 62 C116 69 106 76 101 80 Z" />
      <path d="M101 80 Q97 86 101 92 Q105 86 106 78 Z" strokeWidth="2.2" />
      <path d="M199 80 Q203 86 199 92 Q195 86 194 78 Z" strokeWidth="2.2" />
      <path d="M106 83 Q110 87 111 92" fill="none" stroke={variant.hairLight} strokeWidth="1.4" opacity="0.5" />
      <path d="M194 83 Q190 87 189 92" fill="none" stroke={variant.hairLight} strokeWidth="1.4" opacity="0.5" />
      <path d="M119 43 Q126 54 124 66" fill="none" stroke={variant.hairLight} strokeWidth="1.7" strokeLinecap="round" opacity="0.5" />
      <path d="M168 36 Q174 49 169 62" fill="none" stroke={variant.hairLight} strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
    </g>
  );
}

function ForwardFront({ variant }: { variant: BaristaVariant }): React.ReactElement {
  return (
    <path
      d="M102 80 C101 48 117 28 150 28 C183 28 199 48 198 80 C191 65 179 57 165 54 C151 51 137 55 125 62 C114 69 106 76 102 80 Z"
      fill={variant.hair}
      stroke="#0B1D17"
      strokeWidth="3"
    />
  );
}

function WavesFront({ variant }: { variant: BaristaVariant }): React.ReactElement {
  return (
    <path
      d="M104 82 C100 48 117 29 150 29 C183 29 200 48 196 82 C190 68 179 60 166 57 C157 54 153 52 150 47 C147 52 143 54 134 57 C121 60 110 68 104 82 Z"
      fill={variant.hair}
      stroke="#0B1D17"
      strokeWidth="3"
    />
  );
}

function CurlsFront({ variant }: { variant: BaristaVariant }): React.ReactElement {
  return (
    <path
      d="M105 82 C100 47 116 28 150 28 C184 28 200 47 195 82 C188 69 177 62 165 58 C154 55 146 56 136 59 C123 63 111 71 105 82 Z"
      fill={variant.hair}
      stroke="#0B1D17"
      strokeWidth="3"
    />
  );
}

function BunFront({ variant }: { variant: BaristaVariant }): React.ReactElement {
  return (
    <path
      d="M105 76 C102 47 119 30 150 30 C181 30 198 47 195 76 C188 64 177 57 164 54 C151 51 139 55 128 60 C118 65 109 70 105 76 Z"
      fill={variant.hair}
      stroke="#0B1D17"
      strokeWidth="3"
    />
  );
}

function ForwardFringe({ variant }: { variant: BaristaVariant }): React.ReactElement {
  return (
    <g>
      {/* Flequillo barrido hacia delante, con raya lateral y mechones */}
      <path
        d="M105 61 C111 44 127 35 144 39 C157 42 167 50 180 48 C186 47 190 45 192 44 C193 53 189 61 184 68 C173 77 159 77 147 71 C136 66 126 68 116 74 C109 79 105 72 104 66 Z"
        fill={variant.hair}
        stroke="#0B1D17"
        strokeWidth="2.8"
      />
      <path d="M111 55 C124 65 140 70 155 64 C167 59 178 51 188 42" fill="none" stroke={variant.hairLight} strokeWidth="1.8" opacity="0.5" />
      <path d="M126 45 Q135 58 130 71" fill="none" stroke={variant.hairLight} strokeWidth="1.7" strokeLinecap="round" opacity="0.45" />
      <path d="M169 35 Q176 49 168 64" fill="none" stroke={variant.hairLight} strokeWidth="1.6" strokeLinecap="round" opacity="0.4" />
      <path d="M184 34 Q190 42 188 52" fill="none" stroke={variant.hairLight} strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
    </g>
  );
}

function WavesHair({ variant }: { variant: BaristaVariant }): React.ReactElement {
  return (
    <g fill={variant.hair} stroke="#0B1D17" strokeWidth="3">
      <path d="M96 94 C82 112 83 154 96 174 C91 142 100 121 111 104 Z" />
      <path d="M204 94 C218 112 217 154 204 174 C209 142 200 121 189 104 Z" />
      <path d="M101 80 C98 40 118 18 150 18 C182 18 202 40 199 80 C190 55 176 44 159 42 C146 56 129 63 114 60 C108 58 104 55 101 80 Z" />
      <path d="M88 164 Q78 201 96 231 Q103 207 97 184" fill="none" strokeWidth="10" strokeLinecap="round" />
      <path d="M212 164 Q222 201 204 231 Q197 207 203 184" fill="none" strokeWidth="10" strokeLinecap="round" />
      <path d="M110 51 Q128 63 145 60 Q163 56 181 66" fill="none" stroke={variant.hairLight} strokeWidth="2.2" opacity="0.6" />
      <path d="M105 92 Q94 118 99 143" fill="none" stroke={variant.hairLight} strokeWidth="2" opacity="0.5" />
      <path d="M195 92 Q206 118 201 143" fill="none" stroke={variant.hairLight} strokeWidth="2" opacity="0.5" />
    </g>
  );
}

function WavesFringe({ variant }: { variant: BaristaVariant }): React.ReactElement {
  return (
    <g fill={variant.hair} stroke="#0B1D17" strokeWidth="2.4">
      {/* Raya al centro: solo un mechón, sin tapar la frente */}
      <path d="M150 47 Q155 54 153 66 Q150 59 147 66 Q145 54 150 47 Z" />
      <path d="M110 61 Q116 68 121 78 Q113 75 108 68 Z" opacity="0.9" />
      <path d="M190 61 Q184 68 179 78 Q187 75 192 68 Z" opacity="0.9" />
    </g>
  );
}

function CurlsHair({ variant }: { variant: BaristaVariant }): React.ReactElement {
  const curls = [
    [104, 38, 15],
    [120, 25, 15],
    [141, 20, 17],
    [163, 21, 16],
    [183, 30, 15],
    [195, 48, 14],
    [194, 70, 13],
    [102, 58, 13],
    [96, 80, 11],
    [204, 84, 11],
  ];
  return (
    <g fill={variant.hair} stroke="#0B1D17" strokeWidth="2.5">
      {curls.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
      ))}
      <path d="M104 56 Q128 35 150 34 Q176 33 197 56 Q175 47 150 47 Q124 47 104 56 Z" fill={variant.hairLight} opacity="0.5" />
    </g>
  );
}

function CurlsFringe({ variant }: { variant: BaristaVariant }): React.ReactElement {
  return (
    <path
      d="M108 58 Q115 47 128 46 Q143 44 153 52 Q164 43 181 50 Q190 55 193 66 Q175 60 159 63 Q147 66 136 68 Q121 72 111 66 Q107 62 108 58 Z"
      fill={variant.hair}
      stroke="#0B1D17"
      strokeWidth="2.8"
    />
  );
}

function BunHair({ variant }: { variant: BaristaVariant }): React.ReactElement {
  return (
    <g fill={variant.hair} stroke="#0B1D17" strokeWidth="3">
      <path d="M99 82 C96 38 117 18 150 18 C184 18 205 37 202 82 C195 58 181 46 163 42 C148 39 126 48 108 66 C104 72 101 77 99 82 Z" />
      <circle cx="150" cy="15" r="21" fill={variant.hair} />
      <path d="M132 12 Q150 -2 168 12" fill="none" stroke={variant.hairLight} strokeWidth="2" opacity="0.55" />
      <path d="M101 78 Q98 85 101 92 Q105 85 106 77 Z" strokeWidth="2.2" />
      <path d="M199 78 Q202 85 199 92 Q195 85 194 77 Z" strokeWidth="2.2" />
    </g>
  );
}

function BaristaAction({
  action,
  variant,
  reducedMotion,
}: {
  action: BaristaAction;
  variant: BaristaVariant;
  reducedMotion: boolean;
}): React.ReactElement {
  if (action === 'shake') return <ShakeAction variant={variant} reducedMotion={reducedMotion} />;
  if (action === 'coffee') return <CoffeeAction variant={variant} reducedMotion={reducedMotion} />;
  return <PolishAction variant={variant} reducedMotion={reducedMotion} />;
}

function ArmBase({
  variant,
  side,
}: {
  variant: BaristaVariant;
  side: 'left' | 'right';
}): React.ReactElement {
  if (side === 'left') {
    return (
      <g>
        <path d="M72 164 Q72 213 107 246" fill="none" stroke={variant.shirt} strokeWidth="30" strokeLinecap="round" />
        <path d="M102 238 Q105 248 112 253" fill="none" stroke={variant.shirtShade} strokeWidth="10" strokeLinecap="round" />
        <path d="M112 252 Q137 275 175 289" fill="none" stroke={variant.skin} strokeWidth="21" strokeLinecap="round" />
        <path d="M114 257 Q120 265 128 269" fill="none" stroke={variant.skinShade} strokeWidth="1.7" opacity="0.5" />
      </g>
    );
  }
  return (
    <g>
      <path d="M228 164 Q252 188 242 216" fill="none" stroke={variant.shirt} strokeWidth="30" strokeLinecap="round" />
      <path d="M239 210 Q244 220 237 228" fill="none" stroke={variant.shirtShade} strokeWidth="9" strokeLinecap="round" />
      <path d="M242 216 Q236 226 224 232" fill="none" stroke={variant.skin} strokeWidth="20" strokeLinecap="round" />
      <path d="M240 220 Q236 228 229 232" fill="none" stroke={variant.skinShade} strokeWidth="1.6" opacity="0.5" />
    </g>
  );
}

function PolishAction({
  variant,
  reducedMotion,
}: {
  variant: BaristaVariant;
  reducedMotion: boolean;
}): React.ReactElement {
  return (
    <>
      <g className={reducedMotion ? '' : 'cafe-hold'} style={{ transformOrigin: '196px 280px' }}>
        <ArmBase variant={variant} side="left" />
        <path
          d="M172 281 Q190 270 206 281 Q214 291 201 299 Q182 305 168 295 Q163 287 172 281 Z"
          fill={variant.skin}
          stroke="#0B1D17"
          strokeWidth="2.8"
        />
        <path d="M178 285 Q189 293 200 286" fill="none" stroke={variant.skinShade} strokeWidth="1.8" />
        <path d="M181 294 Q191 301 202 293" fill="none" stroke={variant.skinShade} strokeWidth="1.6" opacity="0.8" />
        <path d="M174 198 H218 L210 235 Q198 249 184 235 Z" fill="#D9EEE3" fillOpacity="0.38" stroke="#BFDCCB" strokeWidth="3.4" />
        <path d="M196 240 V282" stroke="#BFDCCB" strokeWidth="3.4" />
        <path d="M179 285 H213" stroke="#BFDCCB" strokeWidth="3.6" strokeLinecap="round" />
        <path d="M178 208 Q190 220 192 235" fill="none" stroke="#FFFDF8" strokeWidth="2" opacity="0.8" />
        <circle cx="207" cy="212" r="1.4" fill="#FFFDF8" opacity="0.9" className={reducedMotion ? '' : 'cafe-glint'} />
      </g>

      <g className={reducedMotion ? '' : 'cafe-wipe'} style={{ transformOrigin: '228px 170px' }}>
        <ArmBase variant={variant} side="right" />
        <path d="M218 208 Q238 198 248 214 Q242 231 224 234 Q211 224 218 208 Z" fill="#9FB5A4" stroke="#0B1D17" strokeWidth="2.8" />
        <path d="M224 212 Q235 219 242 213" fill="none" stroke="#D7E4D9" strokeWidth="2" />
        <path d="M219 223 Q230 228 240 221" fill="none" stroke="#D7E4D9" strokeWidth="1.8" opacity="0.8" />
        <circle cx="213" cy="230" r="9" fill={variant.skin} stroke="#0B1D17" strokeWidth="2.4" />
        <path d="M208 226 Q213 224 217 228" fill="none" stroke={variant.skinShade} strokeWidth="1.6" />
        <path d="M218 226 Q223 223 226 228" fill="none" stroke={variant.skinShade} strokeWidth="1.4" />
      </g>
    </>
  );
}

function ShakeAction({
  variant,
  reducedMotion,
}: {
  variant: BaristaVariant;
  reducedMotion: boolean;
}): React.ReactElement {
  return (
    <>
      <g className={reducedMotion ? '' : 'cafe-hold'} style={{ transformOrigin: '190px 250px' }}>
        <ArmBase variant={variant} side="left" />
        <path
          d="M172 281 Q190 270 206 281 Q214 291 201 299 Q182 305 168 295 Q163 287 172 281 Z"
          fill={variant.skin}
          stroke="#0B1D17"
          strokeWidth="2.8"
        />
      </g>
      <g className={reducedMotion ? '' : 'cafe-shake'} style={{ transformOrigin: '204px 214px' }}>
        <ArmBase variant={variant} side="right" />
        <path
          d="M174 208 L208 204 L216 276 Q196 289 174 276 Z"
          fill="#C8A12A"
          stroke="#0B1D17"
          strokeWidth="3"
        />
        <path d="M174 208 L208 204 L204 222 L178 226 Z" fill="#E3C65B" stroke="#0B1D17" strokeWidth="2.4" />
        <path d="M182 276 Q196 285 210 276" fill="none" stroke="#8B681C" strokeWidth="2.4" />
        <path d="M186 244 H204" stroke="#F0D278" strokeWidth="2" opacity="0.8" />
        <circle cx="192" cy="190" r="8" fill="#C8A12A" stroke="#0B1D17" strokeWidth="2.4" />
        <path d="M192 198 V208" stroke="#0B1D17" strokeWidth="2.4" />
        <circle cx="213" cy="230" r="9" fill={variant.skin} stroke="#0B1D17" strokeWidth="2.4" />
        <path d="M208 226 Q213 224 217 228" fill="none" stroke={variant.skinShade} strokeWidth="1.6" />
        <circle cx="179" cy="281" r="9" fill={variant.skin} stroke="#0B1D17" strokeWidth="2.4" />
        <path d="M175 277 Q180 275 183 279" fill="none" stroke={variant.skinShade} strokeWidth="1.6" />
      </g>
    </>
  );
}

function CoffeeAction({
  variant,
  reducedMotion,
}: {
  variant: BaristaVariant;
  reducedMotion: boolean;
}): React.ReactElement {
  return (
    <>
      <g className={reducedMotion ? '' : 'cafe-pour'} style={{ transformOrigin: '178px 250px' }}>
        <ArmBase variant={variant} side="left" />
        <path
          d="M172 281 Q190 270 206 281 Q214 291 201 299 Q182 305 168 295 Q163 287 172 281 Z"
          fill={variant.skin}
          stroke="#0B1D17"
          strokeWidth="2.8"
        />
        <path
          d="M154 214 H186 L180 267 Q168 275 158 267 Z"
          fill="#B97754"
          stroke="#0B1D17"
          strokeWidth="3"
        />
        <path d="M154 222 H186" stroke="#7A3F32" strokeWidth="3" />
        <path d="M186 225 Q199 226 196 239 Q193 249 180 246" fill="none" stroke="#0B1D17" strokeWidth="3" />
        <path d="M158 210 Q158 199 172 199 Q186 199 185 211" fill="none" stroke="#0B1D17" strokeWidth="3" />
        <circle cx="170" cy="198" r="5" fill="#D7C5A7" stroke="#0B1D17" strokeWidth="2" />
      </g>
      <g className={reducedMotion ? '' : 'cafe-hold'} style={{ transformOrigin: '226px 250px' }}>
        <ArmBase variant={variant} side="right" />
        <ellipse cx="218" cy="249" rx="22" ry="6" fill="#F1E3CC" stroke="#0B1D17" strokeWidth="2.5" />
        <path d="M202 230 H234 L230 248 Q218 254 206 248 Z" fill="#F1E3CC" stroke="#0B1D17" strokeWidth="2.5" />
        <path d="M234 234 Q244 234 242 242 Q240 248 230 246" fill="none" stroke="#0B1D17" strokeWidth="2.5" />
        <path d="M207 224 Q203 214 209 207" fill="none" stroke="#FFFDF8" strokeWidth="2" opacity="0.55" className={reducedMotion ? '' : 'animate-cafe-steam'} />
        <path d="M220 223 Q216 212 222 205" fill="none" stroke="#FFFDF8" strokeWidth="2" opacity="0.45" className={reducedMotion ? '' : 'animate-cafe-steam-delayed'} />
      </g>
    </>
  );
}
