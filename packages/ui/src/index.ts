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
