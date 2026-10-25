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
  },
  radii: {
    control: '12px',
    card: '16px',
    panel: '24px',
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
  hatStyleM: 'fez' | 'beret' | 'ushanka' | 'turban' | 'tophat' | 'straw' | 'cap' | 'bandana' | 'none';
  hatStyleF: 'ribbon' | 'flower' | 'crown' | 'beret' | 'headscarf' | 'bun' | 'sunhat' | 'none';
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
    name: 'URS (Rusia)',
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
    quote: 'Buen tueste, mejor compañía.',
  },
  'ru:F': {
    id: 'ru:F',
    nation: 'ru',
    gender: 'F',
    name: 'Nadia',
    countryName: 'URS (Rusia)',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    quote: '¿Hace calor o soy solo yo?',
  },
  'ru:M': {
    id: 'ru:M',
    nation: 'ru',
    gender: 'M',
    name: 'Borís',
    countryName: 'URS (Rusia)',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    quote: 'En mi tierra el samovar no se apaga.',
  },
  'in:F': {
    id: 'in:F',
    nation: 'in',
    gender: 'F',
    name: 'Priya',
    countryName: 'India',
    genderSymbol: '♀',
    genderLabel: 'Dama',
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
    quote: 'Un chai especiado y buena charla.',
  },
  'am:F': {
    id: 'am:F',
    nation: 'am',
    gender: 'F',
    name: 'Clara',
    countryName: 'América',
    genderSymbol: '♀',
    genderLabel: 'Dama',
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
    quote: 'La espuma mide dos dedos exactos.',
  },
  'tu:F': {
    id: 'tu:F',
    nation: 'tu',
    gender: 'F',
    name: 'Leyla',
    countryName: 'Turquía',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    quote: 'En el poso leo tu próxima jugada.',
  },
  'tu:M': {
    id: 'tu:M',
    nation: 'tu',
    gender: 'M',
    name: 'Kemal',
    countryName: 'Turquía',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    quote: 'Dulce como una delicia de Estambul.',
  },
  'en:F': {
    id: 'en:F',
    nation: 'en',
    gender: 'F',
    name: 'Agatha',
    countryName: 'Inglaterra',
    genderSymbol: '♀',
    genderLabel: 'Dama',
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
    quote: 'Puntualidad británica en cada taza.',
  },
  'joker:F': {
    id: 'joker:F',
    nation: 'joker',
    gender: 'F',
    name: 'Colombina',
    countryName: 'Comodín',
    genderSymbol: '♀',
    genderLabel: 'Dama',
    quote: 'Brillo en cualquier mesa del café.',
  },
  'joker:M': {
    id: 'joker:M',
    nation: 'joker',
    gender: 'M',
    name: 'Arlequín',
    countryName: 'Comodín',
    genderSymbol: '♂',
    genderLabel: 'Caballero',
    quote: 'Donde falte pareja, allí estoy.',
  },
};

export function getCharacterProfile(
  nation: string,
  gender: 'M' | 'F',
  jokerNation?: string,
): CharacterProfile {
  const key = `${nation}:${gender}`;
  const base: CharacterProfile = CHARACTER_ROSTER[key] ?? {
    id: 'fr:F',
    nation: 'fr',
    gender: 'F',
    name: 'Colette',
    countryName: 'Francia',
    genderSymbol: '♀',
    genderLabel: 'Dama',
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

export type CoinBreakdown = {
  tens: number;
  fives: number;
  ones: number;
  isNegative: boolean;
  chips: Array<10 | 5 | 1>;
};

export function decomposeCoins(score: number): CoinBreakdown {
  const abs = Math.max(0, Math.abs(Math.round(score)));
  const tens = Math.floor(abs / 10);
  const remAfterTen = abs % 10;
  const fives = Math.floor(remAfterTen / 5);
  const ones = remAfterTen % 5;

  const chips: Array<10 | 5 | 1> = [];
  for (let i = 0; i < Math.min(tens, 6); i++) chips.push(10);
  for (let i = 0; i < fives; i++) chips.push(5);
  for (let i = 0; i < ones; i++) chips.push(1);
  if (chips.length === 0 && abs > 0) chips.push(1);

  return {
    tens,
    fives,
    ones,
    isNegative: score < 0,
    chips,
  };
}

