/**
 * Design tokens do Portal Rekrutar.
 * Fonte: design_handoff_portal_rekrutar/README.md — seção "Design Tokens".
 * Valores finais (hifi): não alterar sem novo handoff.
 */

export const color = {
  navy: '#14384A',
  navyDark: '#0E2A38',
  blue: '#0A66C2',
  blueHover: '#084D92',
  blueLight: '#EAF1F8',
  blueLightHover: '#DCE9F6',
  pageBg: '#F4F7FA',
  chipGray: '#F1F4F7',
  border: '#E3EAF1',
  borderSoft: '#EEF2F6',
  borderInput: '#C9D6E2',
  text: '#1B2B36',
  textBody: '#33475B',
  textMuted: '#5A7184',
  label: '#4A6274',
  textFaint: '#8CA2B3',
  textFaintAlt: '#77899A',
  green: '#1D8A5F',
  greenBg: '#E4F5EC',
  amber: '#9A6700',
  amberBg: '#FFF4E0',
  amberStat: '#B57E10',
  purple: '#6B4EAE',
  purpleBg: '#F0E9FB',
  star: '#F5A623',
  onNavy: '#C6D6E2',
  onNavyMuted: '#9DB8CB',
  onNavyEyebrow: '#7FB3DC',
  ctaBannerText: '#CFE3F6',
  surfaceSoft: '#F7FAFC',
} as const;

export const radius = {
  card: '12px',
  cardLg: '14px',
  control: '8px',
  pill: '999px',
  sheet: '18px 18px 0 0',
  banner: '16px',
  panel: '18px',
} as const;

export const layout = {
  containerWidth: '1080px',
  containerPad: 'clamp(16px, 4vw, 32px)',
  sectionPad: 'clamp(40px, 7vw, 72px)',
  headerHeight: '64px',
  mobileBreakpoint: 768,
} as const;

export const font = {
  family: "'Sora', system-ui, sans-serif",
  h1Hero: 'clamp(30px, 5.4vw, 52px)',
  h1Page: 'clamp(24px, 4.2vw, 36px)',
  h2Section: 'clamp(22px, 3.6vw, 30px)',
} as const;

/** Chips de status do funil de candidatura. */
export const statusChip: Record<string, { background: string; color: string }> = {
  'Em análise': { background: color.amberBg, color: color.amber },
  'Entrevista agendada': { background: '#E7F0FB', color: color.blue },
  'Teste técnico': { background: color.purpleBg, color: color.purple },
  Finalista: { background: color.greenBg, color: color.green },
  'Não avançou': { background: color.chipGray, color: color.textFaintAlt },
  Contratado: { background: color.greenBg, color: color.green },
};

export const brl = (n: number): string => 'R$ ' + n.toLocaleString('pt-BR');

export const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
