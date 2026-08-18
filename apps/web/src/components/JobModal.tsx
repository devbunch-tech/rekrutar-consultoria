import { color, radius } from '@rekrutar/tokens';
import type { Job } from '../types';
import { BottomSheet, CloseButton } from './BottomSheet';
import { ChipModelo, ChipTipo } from './JobCard';

interface Props {
  job: Job;
  onClose: () => void;
  onCandidatar: () => void;
}

export function JobModal({ job, onClose, onCandidatar }: Props) {
  return (
    <BottomSheet onClose={onClose}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <ChipModelo>{job.modelo}</ChipModelo>
          <ChipTipo>{job.tipo}</ChipTipo>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: color.navy }}>
        {job.titulo}
      </h2>
      <div style={{ fontSize: 13.5, color: color.textMuted, marginBottom: 4 }}>
        {job.setor} · {job.localidade} · Publicada {job.publicadaLabel}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color.green, marginBottom: 16 }}>
        {job.faixaSalarial}
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 14.5, lineHeight: 1.7, color: color.textBody }}>
        {job.descricao}
      </p>

      <div
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: color.label,
          marginBottom: 8,
        }}
      >
        Requisitos
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 22 }}>
        {job.requisitos.map((r) => (
          <div
            key={r}
            style={{ display: 'flex', gap: 9, fontSize: 14, color: color.textBody, lineHeight: 1.5 }}
          >
            <span style={{ color: color.blue, fontWeight: 800 }}>✓</span>
            {r}
          </div>
        ))}
      </div>

      {job.jaCandidatado ? (
        <div
          style={{
            background: color.greenBg,
            color: color.green,
            borderRadius: 10,
            padding: '14px 18px',
            fontWeight: 700,
            fontSize: 14.5,
            textAlign: 'center',
          }}
        >
          ✓ Você já se candidatou a esta vaga
        </div>
      ) : (
        <button
          onClick={onCandidatar}
          className="rk-hover-cta"
          style={{
            width: '100%',
            background: color.blue,
            color: '#fff',
            border: 'none',
            borderRadius: radius.control,
            padding: 16,
            fontWeight: 700,
            fontSize: 15.5,
            cursor: 'pointer',
          }}
        >
          Candidatar-se a esta vaga
        </button>
      )}
    </BottomSheet>
  );
}
