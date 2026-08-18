import type { CSSProperties, ReactNode } from 'react';
import { color, radius, statusChip } from '@rekrutar/tokens';

export const card: CSSProperties = {
  background: '#fff',
  border: `1px solid ${color.border}`,
  borderRadius: radius.cardLg,
  padding: 'clamp(18px, 3vw, 24px)',
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
  padding: '11px 13px',
  border: `1px solid ${color.borderInput}`,
  borderRadius: radius.control,
  fontSize: 14,
  background: '#fff',
  color: color.text,
};

export const botao = (variante: 'primario' | 'neutro' | 'perigo' = 'primario'): CSSProperties => ({
  border: variante === 'neutro' ? `1px solid ${color.borderInput}` : 'none',
  borderRadius: radius.control,
  padding: '10px 16px',
  fontWeight: 700,
  fontSize: 13.5,
  cursor: 'pointer',
  background:
    variante === 'primario' ? color.blue : variante === 'perigo' ? '#FBEAE8' : '#fff',
  color:
    variante === 'primario' ? '#fff' : variante === 'perigo' ? '#B42318' : color.textBody,
});

export const th: CSSProperties = {
  textAlign: 'left',
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: color.label,
  padding: '10px 12px',
  borderBottom: `1px solid ${color.border}`,
  whiteSpace: 'nowrap',
};

export const td: CSSProperties = {
  padding: '12px',
  borderBottom: `1px solid ${color.borderSoft}`,
  fontSize: 13.5,
  color: color.textBody,
  verticalAlign: 'middle',
};

export function PageTitle({ titulo, acao }: { titulo: string; acao?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 18,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: color.navy }}>{titulo}</h1>
      {acao}
    </div>
  );
}

export function StatCard({
  valor,
  rotulo,
  cor = color.blue,
}: {
  valor: number | string;
  rotulo: string;
  cor?: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${color.border}`,
        borderRadius: radius.card,
        padding: 18,
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, color: cor }}>{valor}</div>
      <div style={{ fontSize: 12.5, color: color.textMuted }}>{rotulo}</div>
    </div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const cores = statusChip[status] ?? { background: color.chipGray, color: color.textFaintAlt };
  return (
    <span
      style={{
        ...cores,
        fontSize: 11.5,
        fontWeight: 700,
        padding: '5px 11px',
        borderRadius: radius.pill,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {status}
    </span>
  );
}

const PARCERIA_CORES: Record<string, { background: string; color: string }> = {
  novo: { background: color.amberBg, color: color.amber },
  em_contato: { background: '#E7F0FB', color: color.blue },
  checkout_enviado: { background: color.purpleBg, color: color.purple },
  ativo: { background: color.greenBg, color: color.green },
  recusado: { background: color.chipGray, color: color.textFaintAlt },
};

const PARCERIA_LABEL: Record<string, string> = {
  novo: 'Novo lead',
  em_contato: 'Em contato',
  checkout_enviado: 'Checkout enviado',
  ativo: 'Assinatura ativa',
  recusado: 'Recusado',
};

export function PartnerChip({ status }: { status: string }) {
  const cores = PARCERIA_CORES[status] ?? PARCERIA_CORES.novo;
  return (
    <span
      style={{
        ...cores,
        fontSize: 11.5,
        fontWeight: 700,
        padding: '5px 11px',
        borderRadius: radius.pill,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {PARCERIA_LABEL[status] ?? status}
    </span>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>{children}</table>
    </div>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: `1px dashed ${color.borderInput}`,
        borderRadius: radius.card,
        padding: '36px 20px',
        textAlign: 'center',
        color: color.textMuted,
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
}

export const dataHora = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export const dataCurta = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
