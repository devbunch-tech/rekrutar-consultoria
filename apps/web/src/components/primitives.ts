import type { CSSProperties } from 'react';
import { color, layout, radius } from '@rekrutar/tokens';

/** Container central de 1080px com o padding lateral do handoff. */
export const container: CSSProperties = {
  maxWidth: layout.containerWidth,
  margin: '0 auto',
  padding: `0 ${layout.containerPad}`,
};

export const section = (paddingBlock = layout.sectionPad): CSSProperties => ({
  ...container,
  padding: `${paddingBlock} ${layout.containerPad}`,
});

export const card: CSSProperties = {
  background: '#fff',
  border: `1px solid ${color.border}`,
  borderRadius: radius.card,
  padding: 20,
};

export const cardLg: CSSProperties = {
  background: '#fff',
  border: `1px solid ${color.border}`,
  borderRadius: radius.cardLg,
  padding: 'clamp(20px, 3vw, 28px)',
};

export const ctaPrimary: CSSProperties = {
  background: color.blue,
  color: '#fff',
  border: 'none',
  borderRadius: radius.control,
  padding: '15px',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
};

export const label: CSSProperties = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 700,
  color: color.label,
  marginBottom: 6,
};

export const input: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: `1px solid ${color.borderInput}`,
  borderRadius: radius.control,
  fontSize: 14.5,
};

export const fieldRow = (min = 180): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
  gap: 14,
});

export const eyebrow: CSSProperties = {
  margin: '0 0 10px',
  fontSize: 12.5,
  fontWeight: 700,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: color.onNavyEyebrow,
};

export const sectionTitle: CSSProperties = {
  margin: '0 0 8px',
  fontSize: 'clamp(22px, 3.6vw, 30px)',
  fontWeight: 800,
  color: color.navy,
};

export const uppercaseLabel: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: color.label,
  marginBottom: 8,
};

/** Faixa navy de topo das páginas internas. */
export const navyBand: CSSProperties = { background: color.navy, color: '#fff' };
