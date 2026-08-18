import { color, radius } from '@rekrutar/tokens';
import type { Job } from '../types';

const chipBase = {
  fontSize: 11.5,
  fontWeight: 700,
  padding: '4px 10px',
  borderRadius: radius.pill,
};

export const ChipModelo = ({ children }: { children: React.ReactNode }) => (
  <span style={{ ...chipBase, background: color.blueLight, color: color.blue }}>{children}</span>
);

export const ChipTipo = ({ children }: { children: React.ReactNode }) => (
  <span style={{ ...chipBase, background: color.chipGray, color: color.label }}>{children}</span>
);

export const ChipCandidatado = () => (
  <span style={{ ...chipBase, background: color.greenBg, color: color.green }}>✓ Candidatado</span>
);

interface Props {
  job: Job;
  onClick: () => void;
  /** Variante da Home: sem rodapé "Detalhes →". */
  compacto?: boolean;
}

export function JobCard({ job, onClick, compacto = false }: Props) {
  return (
    <div
      onClick={onClick}
      className="rk-hover-card"
      style={{
        background: '#fff',
        border: `1px solid ${color.border}`,
        borderRadius: radius.card,
        padding: 20,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        animation: compacto ? undefined : 'rkFade .3s ease',
      }}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <ChipModelo>{job.modelo}</ChipModelo>
        <ChipTipo>{job.tipo}</ChipTipo>
        {job.jaCandidatado && <ChipCandidatado />}
      </div>

      <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: color.navy, lineHeight: 1.3 }}>
        {job.titulo}
      </h3>
      <div style={{ fontSize: 13, color: color.textMuted }}>
        {job.setor} · {job.localidade}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: color.green }}>{job.faixaSalarial}</div>

      {compacto ? (
        <div style={{ fontSize: 12, color: color.textFaint, marginTop: 'auto' }}>
          Publicada {job.publicadaLabel}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
            borderTop: `1px solid ${color.borderSoft}`,
            paddingTop: 12,
          }}
        >
          <span style={{ fontSize: 12, color: color.textFaint }}>
            Publicada {job.publicadaLabel}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: color.blue }}>Detalhes →</span>
        </div>
      )}
    </div>
  );
}
