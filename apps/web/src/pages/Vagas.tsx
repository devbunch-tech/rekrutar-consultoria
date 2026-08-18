import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { color, layout, radius, statusChip } from '@rekrutar/tokens';
import { JOBS, JOB_FACETS, MINHAS_CANDIDATURAS } from '../graphql';
import type { Application, Job, JobFacets, JobFilter } from '../types';
import { JobCard } from '../components/JobCard';
import { JobModal } from '../components/JobModal';
import { ApplyModal } from '../components/ApplyModal';
import { container, uppercaseLabel } from '../components/primitives';
import { useAuth } from '../state/AuthContext';

const FILTRO_VAZIO: JobFilter = {};

const chipFiltro = (ativo: boolean): React.CSSProperties => ({
  border: '1px solid',
  borderRadius: radius.pill,
  padding: '8px 15px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  ...(ativo
    ? { background: color.blue, color: '#fff', borderColor: color.blue }
    : { background: '#fff', color: color.textBody, borderColor: color.borderInput }),
});

const tabPill = (ativo: boolean): React.CSSProperties => ({
  border: 'none',
  borderRadius: radius.pill,
  padding: '10px 18px',
  fontSize: 13.5,
  fontWeight: 700,
  cursor: 'pointer',
  background: ativo ? color.blue : 'rgba(255,255,255,0.12)',
  color: '#fff',
});

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  border: `1px solid ${color.borderInput}`,
  borderRadius: radius.control,
  fontSize: 14,
  background: '#fff',
  color: color.text,
};

export function Vagas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [filtro, setFiltro] = useState<JobFilter>(FILTRO_VAZIO);
  const [salario, setSalario] = useState({ min: '', max: '' });
  const [aplicarPara, setAplicarPara] = useState<Job | null>(null);

  const isCandidato = user?.role === 'candidato';
  const aba = params.get('aba') === 'minhas' && isCandidato ? 'minhas' : 'todas';
  const vagaAberta = params.get('vaga');

  const { data: facetsData } = useQuery<{ jobFacets: JobFacets }>(JOB_FACETS);
  const { data, loading } = useQuery<{ jobs: Job[] }>(JOBS, {
    variables: { filter: { ...filtro, apenasAtivas: true } },
  });
  const { data: minhasData } = useQuery<{ minhasCandidaturas: Application[] }>(
    MINHAS_CANDIDATURAS,
    { skip: !isCandidato },
  );

  const vagas = data?.jobs ?? [];
  const facets = facetsData?.jobFacets;
  const minhas = minhasData?.minhasCandidaturas ?? [];

  const temFiltro = useMemo(
    () => Object.values(filtro).some((v) => v != null && v !== '') || !!salario.min || !!salario.max,
    [filtro, salario],
  );

  const selecionada = vagas.find((v) => v.id === vagaAberta) ?? minhas.find((m) => m.job.id === vagaAberta)?.job ?? null;

  const abrirVaga = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('vaga', id);
    setParams(next, { replace: false });
  };

  const fecharVaga = () => {
    const next = new URLSearchParams(params);
    next.delete('vaga');
    setParams(next, { replace: true });
  };

  const setAba = (valor: 'todas' | 'minhas') => {
    const next = new URLSearchParams(params);
    if (valor === 'todas') next.delete('aba');
    else next.set('aba', 'minhas');
    next.delete('vaga');
    setParams(next, { replace: true });
  };

  const toggle = (campo: 'modelo' | 'tipo', valor: string) =>
    setFiltro((f) => ({ ...f, [campo]: f[campo] === valor ? undefined : valor }));

  const limpar = () => {
    setFiltro(FILTRO_VAZIO);
    setSalario({ min: '', max: '' });
  };

  const aplicarSalario = (min: string, max: string) => {
    setSalario({ min, max });
    setFiltro((f) => ({
      ...f,
      salarioMin: min ? Number(min) : undefined,
      salarioMax: max ? Number(max) : undefined,
    }));
  };

  return (
    <>
      <section style={{ background: color.navy, color: '#fff' }}>
        <div style={{ ...container, padding: `clamp(32px, 5vw, 48px) ${layout.containerPad}` }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(24px, 4.2vw, 36px)', fontWeight: 800 }}>
            Vagas Disponíveis
          </h1>
          <p style={{ margin: 0, color: color.onNavy, fontSize: 14.5 }}>
            Oportunidades selecionadas pela Rekrutar em todo o Brasil.
          </p>
          {isCandidato && (
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setAba('todas')} style={tabPill(aba === 'todas')}>
                Todas as vagas
              </button>
              <button onClick={() => setAba('minhas')} style={tabPill(aba === 'minhas')}>
                Minhas candidaturas ({minhas.length})
              </button>
            </div>
          )}
        </div>
      </section>

      {aba === 'todas' ? (
        <section
          style={{
            ...container,
            padding: `clamp(20px, 4vw, 32px) ${layout.containerPad} clamp(48px, 7vw, 72px)`,
          }}
        >
          {/* PAINEL DE FILTROS */}
          <div
            style={{
              background: '#fff',
              border: `1px solid ${color.border}`,
              borderRadius: radius.cardLg,
              padding: 'clamp(16px, 3vw, 24px)',
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={uppercaseLabel}>Modelo</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(facets?.modelos ?? []).map((m) => (
                  <button
                    key={m}
                    onClick={() => toggle('modelo', m)}
                    style={chipFiltro(filtro.modelo === m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={uppercaseLabel}>Tipo de contratação</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(facets?.tipos ?? []).map((t) => (
                  <button
                    key={t}
                    onClick={() => toggle('tipo', t)}
                    style={chipFiltro(filtro.tipo === t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
              }}
            >
              <div>
                <label style={uppercaseLabel}>Localidade</label>
                <select
                  value={filtro.uf ?? ''}
                  onChange={(e) => setFiltro((f) => ({ ...f, uf: e.target.value || undefined }))}
                  style={selectStyle}
                >
                  <option value="">Todos os estados</option>
                  <optgroup label="Com vagas abertas">
                    {(facets?.ufsComVagas ?? []).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Demais estados">
                    {(facets?.ufsRestantes ?? []).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label style={uppercaseLabel}>Setor</label>
                <select
                  value={filtro.setor ?? ''}
                  onChange={(e) => setFiltro((f) => ({ ...f, setor: e.target.value || undefined }))}
                  style={selectStyle}
                >
                  <option value="">Todos os setores</option>
                  <optgroup label="Setores com vagas">
                    {(facets?.setoresComVagas ?? []).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Outros setores">
                    {(facets?.setoresRestantes ?? []).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label style={uppercaseLabel}>Faixa salarial (R$)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    placeholder="mín."
                    min={0}
                    step={500}
                    value={salario.min}
                    onChange={(e) => aplicarSalario(e.target.value, salario.max)}
                    style={{ ...selectStyle, padding: '11px 12px' }}
                  />
                  <span style={{ color: color.textFaint }}>–</span>
                  <input
                    type="number"
                    placeholder="máx."
                    min={0}
                    step={500}
                    value={salario.max}
                    onChange={(e) => aplicarSalario(salario.min, e.target.value)}
                    style={{ ...selectStyle, padding: '11px 12px' }}
                  />
                </div>
              </div>
            </div>

            {temFiltro && (
              <button
                onClick={limpar}
                style={{
                  alignSelf: 'flex-start',
                  background: 'none',
                  border: 'none',
                  color: color.blue,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div style={{ fontSize: 14, color: color.textMuted, marginBottom: 14 }}>
            <strong style={{ color: color.navy }}>{vagas.length}</strong>{' '}
            {vagas.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
          </div>

          {!loading && vagas.length === 0 && (
            <div
              style={{
                background: '#fff',
                border: `1px dashed ${color.borderInput}`,
                borderRadius: radius.card,
                padding: '40px 24px',
                textAlign: 'center',
                color: color.textMuted,
                fontSize: 14.5,
              }}
            >
              Nenhuma vaga encontrada com esses filtros.
              <br />
              Tente ampliar a busca ou{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  limpar();
                }}
              >
                limpar os filtros
              </a>
              .
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: 16,
            }}
          >
            {vagas.map((job) => (
              <JobCard key={job.id} job={job} onClick={() => abrirVaga(job.id)} />
            ))}
          </div>
        </section>
      ) : (
        <section
          style={{
            maxWidth: 760,
            margin: '0 auto',
            padding: `clamp(24px, 4vw, 32px) ${layout.containerPad} clamp(48px, 7vw, 72px)`,
          }}
        >
          {minhas.length === 0 ? (
            <div
              style={{
                background: '#fff',
                border: `1px dashed ${color.borderInput}`,
                borderRadius: radius.card,
                padding: '40px 24px',
                textAlign: 'center',
                color: color.textMuted,
                fontSize: 14.5,
              }}
            >
              Você ainda não se candidatou a nenhuma vaga.
              <br />
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setAba('todas');
                }}
              >
                Explorar vagas disponíveis
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {minhas.map((a) => (
                <div
                  key={a.id}
                  onClick={() => abrirVaga(a.job.id)}
                  className="rk-hover-card"
                  style={{
                    background: '#fff',
                    border: `1px solid ${color.border}`,
                    borderRadius: radius.card,
                    padding: '18px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 12,
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        margin: '0 0 4px',
                        fontSize: 15.5,
                        fontWeight: 700,
                        color: color.navy,
                      }}
                    >
                      {a.job.titulo}
                    </h3>
                    <div style={{ fontSize: 12.5, color: color.textMuted }}>
                      {a.job.setor} · {a.job.localidade} · {a.job.tipo}
                    </div>
                  </div>
                  <StatusChip status={a.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {selecionada && !aplicarPara && (
        <JobModal
          job={selecionada}
          onClose={fecharVaga}
          onCandidatar={() => {
            if (user && user.role !== 'candidato') {
              navigate('/painel');
              return;
            }
            setAplicarPara(selecionada);
          }}
        />
      )}

      {aplicarPara && (
        <ApplyModal
          job={aplicarPara}
          onClose={() => setAplicarPara(null)}
          onSucesso={() => {
            setAplicarPara(null);
            fecharVaga();
          }}
        />
      )}
    </>
  );
}

export function StatusChip({ status }: { status: string }) {
  const cores = statusChip[status] ?? statusChip['Em análise'];
  return (
    <span
      style={{
        ...cores,
        fontSize: 11.5,
        fontWeight: 700,
        padding: '5px 11px',
        borderRadius: radius.pill,
        whiteSpace: 'nowrap',
        flex: 'none',
      }}
    >
      {status}
    </span>
  );
}
