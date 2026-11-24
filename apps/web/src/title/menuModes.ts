export type MenuMode = 'join' | 'create' | 'solo';

export type IngredientKind =
  | 'bean'
  | 'cinnamon'
  | 'orange'
  | 'flower'
  | 'vanilla'
  | 'cardamom'
  | 'chocolate'
  | 'anise'
  | 'cocoa';

export type MenuTheme = {
  bgTop: string;
  bgBottom: string;
  accent: string;
  accentSoft: string;
  ink: string;
  paper: string;
  glow: string;
  canColor: string;
  canInk: string;
  canAccent: string;
};

export type IngredientSpec = {
  id: string;
  kind: IngredientKind;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

export type MenuModeConfig = {
  id: MenuMode;
  index: number;
  tab: string;
  title: string;
  eyebrow: string;
  description: string;
  blend: string;
  blendNote: string;
  theme: MenuTheme;
  ingredients: IngredientSpec[];
};

/**
 * Ingredients sit on a loose wave around the floating can: above, then down
 * the right side, with a couple of foreground accents. Keeping the same slots
 * for all modes lets the outgoing set slide away and the incoming set flow in
 * through the same rhythm.
 */
const waveSlots: Array<{
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}> = [
  { position: [-1.2, 2.3, 0.15], rotation: [0.3, 0.5, 0.8], scale: 0.82 },
  { position: [-0.35, 2.6, -0.35], rotation: [0.6, 0.2, -0.4], scale: 0.72 },
  { position: [0.5, 2.45, 0.25], rotation: [0.2, -0.5, 0.5], scale: 0.78 },
  { position: [1.25, 2.0, -0.15], rotation: [0.8, 0.3, 0.2], scale: 0.85 },
  { position: [1.8, 1.3, 0.35], rotation: [0.4, 0.2, 0.9], scale: 0.9 },
  { position: [2.1, 0.5, 0.85], rotation: [0.1, 0.7, -0.6], scale: 0.82 },
  { position: [2.0, -0.35, 0.15], rotation: [0.5, -0.3, 0.2], scale: 0.78 },
  { position: [1.55, -1.1, 0.75], rotation: [0.3, 0.4, -0.8], scale: 0.83 },
  { position: [0.7, -1.5, 1.15], rotation: [0.9, 0.1, 0.3], scale: 0.66 },
  { position: [-0.45, -1.25, 0.75], rotation: [0.2, 0.6, 0.7], scale: 0.7 },
];

function ingredients(kinds: IngredientKind[]): IngredientSpec[] {
  return kinds.map((kind, index) => {
    const slot = waveSlots[index % waveSlots.length];
    if (!slot) throw new Error('The ingredient wave needs at least one slot');
    return {
      id: `${kind}-${index}`,
      kind,
      position: slot.position,
      rotation: slot.rotation,
      scale: slot.scale,
    };
  });
}

export const MENU_MODES: MenuModeConfig[] = [
  {
    id: 'join',
    index: 0,
    tab: 'Unirse',
    title: 'Tengo una reserva',
    eyebrow: 'Mesa ajena · código de sala',
    description: 'Entra en la tertulia de alguien con su código de seis letras.',
    blend: 'Tertulia',
    blendNote: 'Caramelo, naranja y canela',
    theme: {
      bgTop: '#D08A5C',
      bgBottom: '#A9482E',
      accent: '#B8512F',
      accentSoft: '#E9B590',
      ink: '#2B1710',
      paper: '#FFF8EC',
      glow: '#FFD9A0',
      canColor: '#C05A35',
      canInk: '#FFF6E4',
      canAccent: '#F2C14E',
    },
    ingredients: ingredients([
      'bean',
      'cinnamon',
      'orange',
      'bean',
      'cinnamon',
      'orange',
      'bean',
      'cinnamon',
      'bean',
      'orange',
    ]),
  },
  {
    id: 'create',
    index: 1,
    tab: 'Reservar',
    title: 'Quiero reservar',
    eyebrow: 'Mesa propia · 2–4 comensales',
    description: 'Prepara una mesa privada y reparte el código entre tus invitados.',
    blend: 'Lluvia',
    blendNote: 'Cacao, avellana y vainilla',
    theme: {
      bgTop: '#8FA37B',
      bgBottom: '#3F5E4A',
      accent: '#3F5E4A',
      accentSoft: '#C6D2B4',
      ink: '#1F2B21',
      paper: '#FBF8EC',
      glow: '#EAF2C9',
      canColor: '#4F6B52',
      canInk: '#FFF6E4',
      canAccent: '#D9E4C5',
    },
    ingredients: ingredients([
      'flower',
      'vanilla',
      'bean',
      'cardamom',
      'flower',
      'vanilla',
      'cardamom',
      'flower',
      'vanilla',
      'bean',
    ]),
  },
  {
    id: 'solo',
    index: 2,
    tab: 'Café solo',
    title: 'Café para uno',
    eyebrow: 'Barra libre · partida inmediata',
    description: 'Un bot de la casa te espera en la barra. Sin códigos ni esperas.',
    blend: 'Noche',
    blendNote: 'Ciruela, cacao y anís',
    theme: {
      bgTop: '#3B4A63',
      bgBottom: '#151D2A',
      accent: '#C8A12A',
      accentSoft: '#8C7A3A',
      ink: '#F7EEDF',
      paper: '#F7EEDF',
      glow: '#F4C15D',
      canColor: '#26364D',
      canInk: '#F7EEDF',
      canAccent: '#C8A12A',
    },
    ingredients: ingredients([
      'chocolate',
      'anise',
      'cocoa',
      'chocolate',
      'cocoa',
      'bean',
      'anise',
      'chocolate',
      'cocoa',
      'anise',
    ]),
  },
];

export function getMenuMode(id: MenuMode): MenuModeConfig {
  const found = MENU_MODES.find((mode) => mode.id === id);
  if (found) return found;
  const fallback = MENU_MODES[0];
  if (fallback) return fallback;
  throw new Error('MENU_MODES must contain at least one mode');
}

/** Panel 0 faces the camera at rotation 0; each next mode is one third of a turn. */
export const MODE_ROTATIONS: Record<MenuMode, number> = {
  join: 0,
  create: (-2 * Math.PI) / 3,
  solo: (-4 * Math.PI) / 3,
};

export function nearestModeFromRotation(rotation: number): MenuMode {
  const normalized = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const targets: Array<{ mode: MenuMode; angle: number }> = [
    { mode: 'join', angle: ((MODE_ROTATIONS.join % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) },
    {
      mode: 'create',
      angle: ((MODE_ROTATIONS.create % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2),
    },
    {
      mode: 'solo',
      angle: ((MODE_ROTATIONS.solo % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2),
    },
  ];
  let bestMode: MenuMode = 'join';
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const target of targets) {
    const distance = Math.min(
      Math.abs(normalized - target.angle),
      Math.PI * 2 - Math.abs(normalized - target.angle),
    );
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMode = target.mode;
    }
  }
  return bestMode;
}
