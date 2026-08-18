import { useQuery } from '@apollo/client';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { color, initials, layout, radius } from '@rekrutar/tokens';
import { ADMIN_DASHBOARD, CANDIDATE_DASHBOARD, COMPANY_DASHBOARD } from '../graphql';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { container } from '../components/primitives';
import { StatusChip } from './Vagas';
import type { Application } from '../types';

const ROTULO = {
  candidato: 'Painel do candidato',
  empresa: 'Painel da empresa',
  admin: 'Painel admin master',
} as const;

const secao: React.CSSProperties = {
  ...container,
  padding: `clamp(24px, 4vw, 36px) ${layout.containerPad} clamp(48px, 7vw, 72px)`,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const painelCard: React.CSSProperties = {
  background: '#fff',
  border: `1px solid ${color.border}`,
  borderRadius: radius.cardLg,
  padding: 'clamp(18px, 3vw, 24px)',
};

function StatCard({ valor, rotulo, cor }: { valor: number | string; rotulo: string; cor: string }) {
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

const statGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 12,
};

export function Painel() {
  const { user, loading, sair } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  if (loading) return <div style={{ ...secao, minHeight: 240 }}>Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <section style={{ background: color.navy, color: '#fff' }}>
        <div
          style={{
            ...container,
            padding: `clamp(28px, 5vw, 44px) ${layout.containerPad}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: color.blue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 19,
              }}
            >
              {initials(user.nome)}
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: color.onNavyEyebrow,
                }}
              >
                {ROTULO[user.role]}
              </div>
              <h1
                style={{
                  margin: '2px 0 0',
                  fontSize: 'clamp(19px, 3vw, 24px)',
                  fontWeight: 800,
                }}
              >
                {user.nome}
              </h1>
            </div>
          </div>
          <button
            className="rk-hover-outline"
            onClick={() => {
              sair();
              showToast('Você saiu da conta.');
              navigate('/');
            }}
            style={{
              background: 'none',
              color: color.onNavy,
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: radius.control,
              padding: '10px 18px',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Sair da conta
          </button>
        </div>
      </section>

      {user.role === 'candidato' && <PainelCandidato />}
      {user.role === 'empresa' && <PainelEmpresa />}
      {user.role === 'admin' && <PainelAdmin />}
    </>
  );
}

/* ---------------------------------------------------------------- Candidato */

interface CandidateData {
  candidateDashboard: {
    totalCandidaturas: number;
    emAnalise: number;
    entrevistas: number;
    candidaturas: Application[];
  };
}

function PainelCandidato() {
  const { data } = useQuery<CandidateData>(CANDIDATE_DASHBOARD);
  const d = data?.candidateDashboard;

  return (
    <section style={secao}>
      <div style={statGrid}>
        <StatCard valor={d?.totalCandidaturas ?? 0} rotulo="candidaturas" cor={color.blue} />
        <StatCard valor={d?.emAnalise ?? 0} rotulo="em análise" cor={color.amberStat} />
        <StatCard valor={d?.entrevistas ?? 0} rotulo="entrevistas" cor={color.green} />
      </div>

      <div style={painelCard}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: color.navy }}>
            Minhas candidaturas
          </h2>
          <Link to="/vagas" style={{ fontSize: 13, fontWeight: 700 }}>
            Buscar mais vagas →
          </Link>
        </div>

        {d && d.candidaturas.length === 0 ? (
          <div
            style={{
              border: `1px dashed ${color.borderInput}`,
              borderRadius: 10,
              padding: '32px 20px',
              textAlign: 'center',
              color: color.textMuted,
              fontSize: 14,
            }}
          >
            Nenhuma candidatura ainda. <Link to="/vagas">Explore as vagas disponíveis</Link>.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(d?.candidaturas ?? []).map((a) => (
              <Link
                key={a.id}
                to={`/vagas?vaga=${a.job.id}`}
                className="rk-hover-card"
                style={{
                  border: `1px solid ${color.borderSoft}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 10,
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: color.navy }}>
                    {a.job.titulo}
                  </div>
                  <div style={{ fontSize: 12, color: color.textMuted }}>
                    {a.job.localidade} · {a.job.tipo}
                  </div>
                </div>
                <StatusChip status={a.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Empresa */

interface CompanyData {
  companyDashboard: {
    vagasAtivas: number;
    totalCandidatos: number;
    entrevistasAgendadas: number;
    propostasEmAndamento: number;
    porVaga: Array<{
      total: number;
      job: { id: string; titulo: string };
      candidaturas: Array<{
        id: string;
        status: string;
        aderencia?: number | null;
        snapshot?: { nome?: string | null; endereco?: string | null };
      }>;
    }>;
  };
}

function PainelEmpresa() {
  const { data } = useQuery<CompanyData>(COMPANY_DASHBOARD);
  const navigate = useNavigate();
  const d = data?.companyDashboard;

  return (
    <section style={secao}>
      <div style={statGrid}>
        <StatCard valor={d?.vagasAtivas ?? 0} rotulo="vagas ativas" cor={color.blue} />
        <StatCard valor={d?.totalCandidatos ?? 0} rotulo="candidatos" cor={color.navy} />
        <StatCard
          valor={d?.entrevistasAgendadas ?? 0}
          rotulo="entrevistas agendadas"
          cor={color.green}
        />
        <StatCard
          valor={d?.propostasEmAndamento ?? 0}
          rotulo="propostas em andamento"
          cor={color.amberStat}
        />
      </div>

      <div style={painelCard}>
        <h2 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 800, color: color.navy }}>
          Candidatos por vaga
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {(d?.porVaga ?? []).map((g) => (
            <div key={g.job.id}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'baseline',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: color.blue }}>
                  {g.job.titulo}
                </h3>
                <span style={{ fontSize: 12, color: color.textFaint }}>{g.total} candidatos</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {g.candidaturas.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      border: `1px solid ${color.borderSoft}`,
                      borderRadius: 10,
                      padding: '12px 14px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 10,
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: color.blueLight,
                          color: color.blue,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 12.5,
                          flex: 'none',
                        }}
                      >
                        {initials(c.snapshot?.nome ?? '?')}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: color.navy }}>
                          {c.snapshot?.nome ?? 'Candidato'}
                        </div>
                        <div style={{ fontSize: 11.5, color: color.textMuted }}>
                          {c.snapshot?.endereco ?? '—'}
                          {c.aderencia != null && ` · aderência ${c.aderencia}%`}
                        </div>
                      </div>
                    </div>
                    <StatusChip status={c.status} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: color.blueLight,
          borderRadius: radius.cardLg,
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <div style={{ fontSize: 14, color: color.navy, fontWeight: 600 }}>
          Precisa abrir uma nova vaga?
        </div>
        <button
          className="rk-hover-cta"
          onClick={() => navigate('/contato')}
          style={{
            background: color.blue,
            color: '#fff',
            border: 'none',
            borderRadius: radius.control,
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Falar com a Rekrutar
        </button>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- Admin */

interface AdminData {
  adminDashboard: {
    vagasAtivas: number;
    candidatosNaBase: number;
    empresasParceiras: number;
    candidaturasNaSemana: number;
    ultimasCandidaturas: Array<{
      id: string;
      status: string;
      createdAt: string;
      job: { id: string; titulo: string };
      snapshot?: { nome?: string | null };
    }>;
    empresas: Array<{
      totalVagas: number;
      company: { id: string; nomeFantasia?: string | null; razaoSocial: string };
    }>;
    vagas: Array<{ id: string; titulo: string; localidade: string }>;
  };
}

const quando = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

function PainelAdmin() {
  const { data } = useQuery<AdminData>(ADMIN_DASHBOARD);
  const d = data?.adminDashboard;

  return (
    <section style={secao}>
      <div style={statGrid}>
        <StatCard valor={d?.vagasAtivas ?? 0} rotulo="vagas ativas" cor={color.blue} />
        <StatCard valor={d?.candidatosNaBase ?? 0} rotulo="candidatos na base" cor={color.navy} />
        <StatCard valor={d?.empresasParceiras ?? 0} rotulo="empresas parceiras" cor={color.green} />
        <StatCard
          valor={d?.candidaturasNaSemana ?? 0}
          rotulo="candidaturas na semana"
          cor={color.amberStat}
        />
      </div>

      <div style={painelCard}>
        <h2 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: color.navy }}>
          Últimas candidaturas
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(d?.ultimasCandidaturas ?? []).map((a) => (
            <div
              key={a.id}
              style={{
                border: `1px solid ${color.borderSoft}`,
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 10,
                justifyContent: 'space-between',
              }}
            >
              <div style={{ minWidth: 0, fontSize: 13.5, color: color.textBody }}>
                <strong style={{ color: color.navy }}>{a.snapshot?.nome ?? 'Candidato'}</strong> →{' '}
                {a.job.titulo}
                <div style={{ fontSize: 11.5, color: color.textFaint, marginTop: 2 }}>
                  {quando(a.createdAt)}
                </div>
              </div>
              <StatusChip status={a.status} />
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <div style={painelCard}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: color.navy }}>
            Empresas parceiras
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(d?.empresas ?? []).map((e) => (
              <div
                key={e.company.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  borderBottom: `1px solid ${color.borderSoft}`,
                  padding: '9px 2px',
                  fontSize: 13.5,
                }}
              >
                <span style={{ fontWeight: 600, color: color.navy }}>
                  {e.company.nomeFantasia ?? e.company.razaoSocial}
                </span>
                <span style={{ color: color.textMuted, fontSize: 12 }}>{e.totalVagas} vagas</span>
              </div>
            ))}
          </div>
        </div>

        <div style={painelCard}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: color.navy }}>
            Vagas ativas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(d?.vagas ?? []).map((v) => (
              <Link
                key={v.id}
                to={`/vagas?vaga=${v.id}`}
                className="rk-hover-row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  borderBottom: `1px solid ${color.borderSoft}`,
                  padding: '9px 2px',
                  fontSize: 13.5,
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontWeight: 600, color: color.navy }}>{v.titulo}</span>
                <span style={{ color: color.textMuted, fontSize: 12 }}>{v.localidade}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background: color.blueLight,
          borderRadius: radius.cardLg,
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <div style={{ fontSize: 14, color: color.navy, fontWeight: 600 }}>
          Gestão completa de vagas, empresas e candidatos fica no painel administrativo.
        </div>
        <a
          href="http://localhost:5174"
          target="_blank"
          rel="noreferrer"
          className="rk-hover-cta"
          style={{
            background: color.blue,
            color: '#fff',
            borderRadius: radius.control,
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Abrir o admin →
        </a>
      </div>
    </section>
  );
}
