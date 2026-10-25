export const DESIGN_TOKENS = {
  colors: {
    background: '#F7EEDF',
    surface: '#FFF9F0',
    textPrimary: '#3E2F2A',
    textSecondary: '#6F5A4E',
    terracotta: '#C96F4A',
    caramel: '#B9855A',
    wood: '#8B5E3C',
    sage: '#8A9A7B',
    bottleGreen: '#3F5E4A',
    brass: '#C9A227',
    inkBlue: '#2F4A6D',
    brickRed: '#A94438',
    butter: '#F2C14E',
    turquoise: '#4F9D9D',
    softPink: '#E8B4B8',
    coin1: '#1F1F1F',
    coin5: '#B3261E',
    coin10: '#1E4E8C',
  },
  radii: {
    control: '12px',
    card: '16px',
    panel: '24px',
  },
} as const;

export const COIN_DENOMINATION_STYLES = {
  1: {
    fill: '#1F1F1F',
    ring: '#D6C7B2',
    text: '#FFF9F0',
    label: 'Moneda de 1 (Negra)',
  },
  5: {
    fill: '#B3261E',
    ring: '#F9DEDC',
    text: '#FFF9F0',
    label: 'Moneda de 5 (Roja)',
  },
  10: {
    fill: '#1E4E8C',
    ring: '#D3E4FF',
    text: '#FFF9F0',
    label: 'Moneda de 10 (Azul)',
  },
} as const;

export type NationKey =
  | 'af'
  | 'it'
  | 'ch'
  | 'es'
  | 'ru'
  | 'in'
  | 'am'
  | 'al'
  | 'tu'
  | 'cu'
  | 'en'
  | 'fr';

export type NationVisualMeta = {
  code: NationKey;
  shortCode: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  pattern: 'stripes' | 'checks' | 'dots' | 'diamonds' | 'waves' | 'tartans';
  skinToneM: string;
  skinToneF: string;
  hairColorM: string;
  hairColorF: string;
  hatStyleM:
    | 'fez'
    | 'beret'
    | 'ushanka'
    | 'turban'
    | 'tophat'
    | 'straw'
    | 'cap'
    | 'bandana'
    | 'none';
  hatStyleF:
    | 'ribbon'
    | 'flower'
    | 'crown'
    | 'beret'
    | 'headscarf'
    | 'bun'
    | 'sunhat'
    | 'none';
};

export const NATION_VISUALS: Record<NationKey, NationVisualMeta> = {
  af: {
    code: 'af',
    shortCode: 'AF',
    name: 'África',
    primaryColor: '#D98E3A',
    secondaryColor: '#3F5E4A',
    accentColor: '#F2C14E',
    pattern: 'diamonds',
    skinToneM: '#7B4B2A',
    skinToneF: '#6E4124',
    hairColorM: '#231712',
    hairColorF: '#1E1410',
    hatStyleM: 'cap',
    hatStyleF: 'headscarf',
  },
  it: {
    code: 'it',
    shortCode: 'IT',
    name: 'Italia',
    primaryColor: '#C84B31',
    secondaryColor: '#3F8F6B',
    accentColor: '#FFF9F0',
    pattern: 'checks',
    skinToneM: '#E3B48E',
    skinToneF: '#E8BE9A',
    hairColorM: '#3B281E',
    hairColorF: '#2E1E16',
    hatStyleM: 'cap',
    hatStyleF: 'ribbon',
  },
  ch: {
    code: 'ch',
    shortCode: 'CH',
    name: 'China',
    primaryColor: '#3F8F6B',
    secondaryColor: '#C9A227',
    accentColor: '#A94438',
    pattern: 'waves',
    skinToneM: '#EBC69F',
    skinToneF: '#F0CFB0',
    hairColorM: '#1F1A18',
    hairColorF: '#1C1715',
    hatStyleM: 'cap',
    hatStyleF: 'bun',
  },
  es: {
    code: 'es',
    shortCode: 'ES',
    name: 'España',
    primaryColor: '#E0A526',
    secondaryColor: '#A94438',
    accentColor: '#FFF9F0',
    pattern: 'dots',
    skinToneM: '#DFB089',
    skinToneF: '#E6BA95',
    hairColorM: '#332219',
    hairColorF: '#291B14',
    hatStyleM: 'bandana',
    hatStyleF: 'flower',
  },
  ru: {
    code: 'ru',
    shortCode: 'RU',
    name: 'Rusia',
    primaryColor: '#4F7C8A',
    secondaryColor: '#A94438',
    accentColor: '#F2C14E',
    pattern: 'stripes',
    skinToneM: '#F2CFB4',
    skinToneF: '#F5D6BE',
    hairColorM: '#6E4C36',
    hairColorF: '#C88E4B',
    hatStyleM: 'ushanka',
    hatStyleF: 'crown',
  },
  in: {
    code: 'in',
    shortCode: 'IN',
    name: 'India',
    primaryColor: '#D9822B',
    secondaryColor: '#4F9D9D',
    accentColor: '#F2C14E',
    pattern: 'diamonds',
    skinToneM: '#B87B52',
    skinToneF: '#C2855C',
    hairColorM: '#241914',
    hairColorF: '#1F1612',
    hatStyleM: 'turban',
    hatStyleF: 'flower',
  },
  am: {
    code: 'am',
    shortCode: 'AM',
    name: 'América',
    primaryColor: '#2F4A6D',
    secondaryColor: '#B23A48',
    accentColor: '#FFF9F0',
    pattern: 'stripes',
    skinToneM: '#E6B996',
    skinToneF: '#C68C63',
    hairColorM: '#7B4F2E',
    hairColorF: '#362319',
    hatStyleM: 'straw',
    hatStyleF: 'ribbon',
  },
  al: {
    code: 'al',
    shortCode: 'AL',
    name: 'Alemania',
    primaryColor: '#7A3B3B',
    secondaryColor: '#E0A526',
    accentColor: '#3E2F2A',
    pattern: 'checks',
    skinToneM: '#F0CAB0',
    skinToneF: '#F3D2BA',
    hairColorM: '#B88444',
    hairColorF: '#D29E54',
    hatStyleM: 'cap',
    hatStyleF: 'ribbon',
  },
  tu: {
    code: 'tu',
    shortCode: 'TU',
    name: 'Turquía',
    primaryColor: '#2F8F8A',
    secondaryColor: '#C84B31',
    accentColor: '#F2C14E',
    pattern: 'waves',
    skinToneM: '#DDA982',
    skinToneF: '#E4B490',
    hairColorM: '#2D2018',
    hairColorF: '#35241B',
    hatStyleM: 'fez',
    hatStyleF: 'headscarf',
  },
  cu: {
    code: 'cu',
    shortCode: 'CU',
    name: 'Cuba',
    primaryColor: '#D96C5F',
    secondaryColor: '#2F4A6D',
    accentColor: '#FFF9F0',
    pattern: 'dots',
    skinToneM: '#A86E47',
    skinToneF: '#B77B52',
    hairColorM: '#241813',
    hairColorF: '#2A1C16',
    hatStyleM: 'straw',
    hatStyleF: 'flower',
  },
  en: {
    code: 'en',
    shortCode: 'EN',
    name: 'Inglaterra',
    primaryColor: '#334E68',
    secondaryColor: '#B23A48',
    accentColor: '#FFF9F0',
    pattern: 'tartans',
    skinToneM: '#F2CEB6',
    skinToneF: '#F5D5BF',
    hairColorM: '#9C5233',
    hairColorF: '#8B492D',
    hatStyleM: 'tophat',
    hatStyleF: 'sunhat',
  },
  fr: {
    code: 'fr',
    shortCode: 'FR',
    name: 'Francia',
    primaryColor: '#3B5BA5',
    secondaryColor: '#C94C4C',
    accentColor: '#FFF9F0',
    pattern: 'checks',
    skinToneM: '#ECC4A8',
    skinToneF: '#F0CCB2',
    hairColorM: '#463022',
    hairColorF: '#5B3E2B',
    hatStyleM: 'beret',
    hatStyleF: 'beret',
  },
};

export type CharacterProfile = {
  id: string;
  nation: NationKey | 'joker';
  gender: 'M' | 'F';
  name: string;
  countryName: string;
  genderSymbol: '♀' | '♂';
  genderLabel: 'Dama' | 'Caballero';
  genderBadge: 'MUJER' | 'HOMBRE';
  quote: string;
};

export const CHARACTER_ROSTER: Record<string, CharacterProfile> = {
  'fr:F': {
    id: 'fr:F',
    nation: 'fr',
    gender: 'F',
    name: 'Colette',
    countryName: 'Francia',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: 'El croissant se mira, no se toca.',
  },
  'fr:M': {
    id: 'fr:M',
    nation: 'fr',
    gender: 'M',
    name: 'Gaspard',
    countryName: 'Francia',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: '¿Llamas a esto mantequilla?',
  },
  'it:M': {
    id: 'it:M',
    nation: 'it',
    gender: 'M',
    name: 'Giuseppe',
    countryName: 'Italia',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'Un espresso, y que se note.',
  },
  'it:F': {
    id: 'it:F',
    nation: 'it',
    gender: 'F',
    name: 'Sofia',
    countryName: 'Italia',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: 'El capuchino, solo por la mañana.',
  },
  'ch:F': {
    id: 'ch:F',
    nation: 'ch',
    gender: 'F',
    name: 'Mei',
    countryName: 'China',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: 'Yo solo venía a observar.',
  },
  'ch:M': {
    id: 'ch:M',
    nation: 'ch',
    gender: 'M',
    name: 'Liang',
    countryName: 'China',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'El té habla si sabes escuchar.',
  },
  'cu:F': {
    id: 'cu:F',
    nation: 'cu',
    gender: 'F',
    name: 'Rosa',
    countryName: 'Cuba',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: 'Un cortadito y a bailar.',
  },
  'cu:M': {
    id: 'cu:M',
    nation: 'cu',
    gender: 'M',
    name: 'Camilo',
    countryName: 'Cuba',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'Sin son cubano no hay tertulia.',
  },
  'es:F': {
    id: 'es:F',
    nation: 'es',
    gender: 'F',
    name: 'Carmen',
    countryName: 'España',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: 'Trae churros, que hoy invito yo.',
  },
  'es:M': {
    id: 'es:M',
    nation: 'es',
    gender: 'M',
    name: 'Mateo',
    countryName: 'España',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'La sobremesa acaba de empezar.',
  },
  'af:F': {
    id: 'af:F',
    nation: 'af',
    gender: 'F',
    name: 'Amina',
    countryName: 'África',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: 'Aquí falta canela y alegría.',
  },
  'af:M': {
    id: 'af:M',
    nation: 'af',
    gender: 'M',
    name: 'Kofi',
    countryName: 'África',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'Buen tueste, mejor compañía.',
  },
  'ru:F': {
    id: 'ru:F',
    nation: 'ru',
    gender: 'F',
    name: 'Nadia',
    countryName: 'Rusia',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: '¿Hace calor o soy solo yo?',
  },
  'ru:M': {
    id: 'ru:M',
    nation: 'ru',
    gender: 'M',
    name: 'Borís',
    countryName: 'Rusia',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'El samovar nunca se apaga.',
  },
  'in:F': {
    id: 'in:F',
    nation: 'in',
    gender: 'F',
    name: 'Priya',
    countryName: 'India',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: 'Con cardamomo todo sabe mejor.',
  },
  'in:M': {
    id: 'in:M',
    nation: 'in',
    gender: 'M',
    name: 'Raj',
    countryName: 'India',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'Chai especiado y buena charla.',
  },
  'am:F': {
    id: 'am:F',
    nation: 'am',
    gender: 'F',
    name: 'Clara',
    countryName: 'América',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: '¿Me pones otro café largo?',
  },
  'am:M': {
    id: 'am:M',
    nation: 'am',
    gender: 'M',
    name: 'Johnny',
    countryName: 'América',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'Doble con hielo y sin prisa.',
  },
  'al:F': {
    id: 'al:F',
    nation: 'al',
    gender: 'F',
    name: 'Greta',
    countryName: 'Alemania',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: 'A las cinco en punto, pastel.',
  },
  'al:M': {
    id: 'al:M',
    nation: 'al',
    gender: 'M',
    name: 'Otto',
    countryName: 'Alemania',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'Espuma de dos dedos exactos.',
  },
  'tu:F': {
    id: 'tu:F',
    nation: 'tu',
    gender: 'F',
    name: 'Leyla',
    countryName: 'Turquía',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: 'En el poso leo tu jugada.',
  },
  'tu:M': {
    id: 'tu:M',
    nation: 'tu',
    gender: 'M',
    name: 'Kemal',
    countryName: 'Turquía',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'Dulce como delicia de Estambul.',
  },
  'en:F': {
    id: 'en:F',
    nation: 'en',
    gender: 'F',
    name: 'Agatha',
    countryName: 'Inglaterra',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: '¿Una nube de leche, querido?',
  },
  'en:M': {
    id: 'en:M',
    nation: 'en',
    gender: 'M',
    name: 'Arthur',
    countryName: 'Inglaterra',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'Puntualidad en cada taza.',
  },
  'joker:F': {
    id: 'joker:F',
    nation: 'joker',
    gender: 'F',
    name: 'Colombina',
    countryName: 'Comodín',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: 'Brillo en cualquier mesa.',
  },
  'joker:F:2': {
    id: 'joker:F:2',
    nation: 'joker',
    gender: 'F',
    name: 'Arlequina',
    countryName: 'Comodín',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    genderBadge: 'MUJER',
    quote: 'Un antifaz y mil tertulias.',
  },
  'joker:M': {
    id: 'joker:M',
    nation: 'joker',
    gender: 'M',
    name: 'Arlequín',
    countryName: 'Comodín',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'Donde falte pareja, allí estoy.',
  },
  'joker:M:2': {
    id: 'joker:M:2',
    nation: 'joker',
    gender: 'M',
    name: 'Pierrot',
    countryName: 'Comodín',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    genderBadge: 'HOMBRE',
    quote: 'Siempre guardo un as bajo la taza.',
  },
};

export function getCharacterProfile(
  nation: string,
  gender: 'M' | 'F',
  jokerNation?: string,
  tileId?: string,
): CharacterProfile {
  const isSecondJoker =
    nation === 'joker' && tileId && (tileId.endsWith('-2') || tileId.endsWith('_2') || tileId.endsWith('4'));
  const key = isSecondJoker ? `joker:${gender}:2` : `${nation}:${gender}`;
  const base: CharacterProfile = CHARACTER_ROSTER[key] ??
    CHARACTER_ROSTER[`${nation}:${gender}`] ?? {
      id: 'fr:F',
      nation: 'fr',
      gender: 'F',
      name: 'Colette',
      countryName: 'Francia',
      genderSymbol: '♀',
      genderLabel: 'Dama',
      genderBadge: 'MUJER',
      quote: 'El croissant se mira, no se toca.',
    };
  if (nation === 'joker' && jokerNation && NATION_VISUALS[jokerNation as NationKey]) {
    const repCountry = NATION_VISUALS[jokerNation as NationKey].name;
    return {
      ...base,
      countryName: `Comodín (${repCountry})`,
    };
  }
  return base;
}

export type SubtitleMode = 'off' | 'key' | 'all';
export type SubtitleStyle = 'comic' | 'cafe' | 'arcade';

export const SUBTITLE_MODES: Array<{ id: SubtitleMode; label: string; desc: string }> = [
  { id: 'off', label: 'Desactivados', desc: 'Sin avisos flotantes en pantalla' },
  { id: 'key', label: 'Solo momentos clave', desc: 'Joker, mesa completa, penalización y victoria' },
  { id: 'all', label: 'Todos', desc: 'Incluye cada pareja sentada y servicio en barra' },
];

export const SUBTITLE_STYLES: Array<{ id: SubtitleStyle; label: string; desc: string }> = [
  { id: 'comic', label: 'Cómic', desc: 'Bocadillo artesanal de tinta y papel' },
  { id: 'cafe', label: 'Café', desc: 'Etiqueta clásica de pizarra y latón' },
  { id: 'arcade', label: 'Arcade', desc: 'Cartel vibrante de celebración' },
];

export type CoinStack = {
  denomination: 10 | 5 | 1;
  count: number;
};

export type CoinBreakdown = {
  tens: number;
  fives: number;
  ones: number;
  isNegative: boolean;
  chips: Array<10 | 5 | 1>;
  stacks: CoinStack[];
};

export function decomposeCoins(score: number): CoinBreakdown {
  const rounded = Math.round(score);
  const abs = Math.abs(rounded);
  if (abs === 0) {
    return {
      tens: 0,
      fives: 0,
      ones: 0,
      isNegative: false,
      chips: [],
      stacks: [],
    };
  }

  const tens = Math.floor(abs / 10);
  const remAfterTen = abs % 10;
  const fives = Math.floor(remAfterTen / 5);
  const ones = remAfterTen % 5;

  const chips: Array<10 | 5 | 1> = [];
  for (let i = 0; i < tens; i++) chips.push(10);
  for (let i = 0; i < fives; i++) chips.push(5);
  for (let i = 0; i < ones; i++) chips.push(1);

  const stacks: CoinStack[] = [];
  if (tens > 0) stacks.push({ denomination: 10, count: tens });
  if (fives > 0) stacks.push({ denomination: 5, count: fives });
  if (ones > 0) stacks.push({ denomination: 1, count: ones });

  return {
    tens,
    fives,
    ones,
    isNegative: rounded < 0,
    chips,
    stacks,
  };
}

/**
 * Formats integer scores in standard Spanish notation with dot thousands separator (e.g. 1.234, -9.999)
 */
export function formatScoreEs(score: number): string {
  const rounded = Math.round(score);
  const sign = rounded < 0 ? '-' : '';
  const absStr = Math.abs(rounded).toString();
  return sign + absStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}


export type PresetAvatarId =
  | 'espresso'
  | 'croissant'
  | 'gato'
  | 'moka'
  | 'tetera'
  | 'churros'
  | 'macaron'
  | 'copa'
  | 'colette'
  | 'giuseppe'
  | 'mei'
  | 'rosa'
  | 'kofi'
  | 'nadia'
  | 'raj'
  | 'arlequin';

export type PresetAvatarMeta = {
  id: PresetAvatarId;
  label: string;
  bg: string;
  kind: 'icon' | 'character';
  nation?: NationKey | 'joker';
  gender?: 'M' | 'F';
};

export const PRESET_AVATARS: PresetAvatarMeta[] = [
  { id: 'espresso', label: 'Taza Espresso', bg: '#C96F4A', kind: 'icon' },
  { id: 'croissant', label: 'Croissant Dorado', bg: '#E0A526', kind: 'icon' },
  { id: 'gato', label: 'Gato del Café', bg: '#D98E3A', kind: 'icon' },
  { id: 'moka', label: 'Cafetera Moka', bg: '#4F7C8A', kind: 'icon' },
  { id: 'tetera', label: 'Tetera de Porcelana', bg: '#3F8F6B', kind: 'icon' },
  { id: 'churros', label: 'Churros con Chocolate', bg: '#8B5E3C', kind: 'icon' },
  { id: 'macaron', label: 'Macaron Parisino', bg: '#D96C5F', kind: 'icon' },
  { id: 'copa', label: 'Copa de Sobremesa', bg: '#2F4A6D', kind: 'icon' },
  { id: 'colette', label: 'Colette (Francia)', bg: '#3B5BA5', kind: 'character', nation: 'fr', gender: 'F' },
  { id: 'giuseppe', label: 'Giuseppe (Italia)', bg: '#C84B31', kind: 'character', nation: 'it', gender: 'M' },
  { id: 'mei', label: 'Mei (China)', bg: '#3F8F6B', kind: 'character', nation: 'ch', gender: 'F' },
  { id: 'rosa', label: 'Rosa (Cuba)', bg: '#D96C5F', kind: 'character', nation: 'cu', gender: 'F' },
  { id: 'kofi', label: 'Kofi (África)', bg: '#D98E3A', kind: 'character', nation: 'af', gender: 'M' },
  { id: 'nadia', label: 'Nadia (Rusia)', bg: '#4F7C8A', kind: 'character', nation: 'ru', gender: 'F' },
  { id: 'raj', label: 'Raj (India)', bg: '#D9822B', kind: 'character', nation: 'in', gender: 'M' },
  { id: 'arlequin', label: 'Arlequín (Comodín)', bg: '#C9A227', kind: 'character', nation: 'joker', gender: 'M' },
];

export const DEFAULT_AVATAR_ID: PresetAvatarId = 'espresso';

export function getPresetAvatar(avatarId?: string): PresetAvatarMeta {
  const found = PRESET_AVATARS.find((a) => a.id === avatarId);
  if (found) return found;
  return {
    id: 'espresso',
    label: 'Taza Espresso',
    bg: '#C96F4A',
    kind: 'icon',
  };
}

export type MusicMoodId = 'tertulia' | 'lluvia' | 'noche';

export const MUSIC_MOODS: Array<{ id: MusicMoodId; label: string; desc: string }> = [
  { id: 'tertulia', label: 'Tertulia', desc: 'Rhodes cálido, contrabajo y murmullo de tarde' },
  { id: 'lluvia', label: 'Lluvia', desc: 'Acordes suaves tras el cristal con lluvia fina' },
  { id: 'noche', label: 'Noche', desc: 'Jazz lento de cierre a la luz de las velas' },
];

export const CAFE_DAILY_PHRASES: readonly string[] = [
  'Hoy el café está fuerte',
  'La casa invita',
  'Mesa para dos',
  'Recién molido para la tertulia',
] as const;

/**
 * Returns a localized Spanish greeting according to the hour of day (0-23) and optional nickname.
 * Never uses real names—only the player's game nickname or a generic welcome if empty.
 */
export function getCafeGreeting(nickname?: string, hour: number = new Date().getHours()): string {
  const clean = (nickname ?? '').trim();
  const normalizedHour = ((Math.floor(hour) % 24) + 24) % 24;
  const salutation =
    normalizedHour >= 6 && normalizedHour < 13
      ? 'Buenos días'
      : normalizedHour >= 13 && normalizedHour < 21
        ? 'Buenas tardes'
        : 'Buenas noches';

  if (!clean) {
    return `${salutation}, pasa a tomar asiento`;
  }
  return `${salutation}, ${clean}`;
}

