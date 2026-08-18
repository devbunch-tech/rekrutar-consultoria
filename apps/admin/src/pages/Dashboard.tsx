import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { color, radius } from '@rekrutar/tokens';
import { DASHBOARD } from '../graphql';
import { PageTitle, StatCard, StatusChip, PartnerChip, card, dataHora } from '../ui';

interface Data {
  adminDashboard: {
    vagasAtivas: number;
    candidatosNaBase: number;
    empresasParceiras: number;
    candidaturasNaSemana: number;
    mensagensNaoLidas: number;
    leadsNovos: number;
    ultimasCandidaturas: Array<{
      id: string;
      status: string;
      createdAt: string;
      job: { id: string; titulo: string };
      candidate: { id: string; nome: string };
    }>;
    empresas: Array<{
      totalVagas: number;
      company: { id: string; razaoSocial: string; nomeFantasia?: string | null; status: string };
    }>;
  };
}

export function Dashboard() {
  const { data, loading } = useQuery<Data>(DASHBOARD);
  const d = data?.adminDashboard;

  return (
    <>
      <PageTitle titulo="Visão geral" />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatCard valor={d?.vagasAtivas ?? 0} rotulo="vagas ativas" />
        <StatCard valor={d?.candidatosNaBase ?? 0} rotulo="candidatos na base" cor={color.navy} />
        <StatCard valor={d?.empresasParceiras ?? 0} rotulo="empresas com assinatura" cor={color.green} />
        <StatCard
          valor={d?.candidaturasNaSemana ?? 0}
          rotulo="candidaturas na semana"
          cor={color.amberStat}
        />
      </div>

      {(d?.leadsNovos || d?.mensagensNaoLidas) ? (
        <div
          style={{
            background: color.blueLight,
            borderRadius: radius.cardLg,
            padding: '16px 20px',
            marginBottom: 20,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: 13.5,
            color: color.navy,
            fontWeight: 600,
          }}
        >
          {!!d?.leadsNovos && (
            <span>
              {d.leadsNovos} lead(s) de parceria aguardando —{' '}
              <Link to="/empresas">revisar empresas</Link>
            </span>
          )}
          {!!d?.mensagensNaoLidas && (
            <span>
              {d.mensagensNaoLidas} mensagem(ns) não lida(s) — <Link to="/mensagens">abrir</Link>
            </span>
          )}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        <div style={card}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: color.navy }}>
            Últimas candidaturas
          </h2>
          {loading && !d ? (
            <p style={{ color: color.textMuted, fontSize: 13.5 }}>Carregando…</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {d?.ultimasCandidaturas.map((a) => (
                <div
                  key={a.id}
                  style={{
                    border: `1px solid ${color.borderSoft}`,
                    borderRadius: 10,
                    padding: '11px 13px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 10,
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 13.5, color: color.textBody, minWidth: 0 }}>
                    <strong style={{ color: color.navy }}>{a.candidate.nome}</strong> → {a.job.titulo}
                    <div style={{ fontSize: 11.5, color: color.textFaint, marginTop: 2 }}>
                      {dataHora(a.createdAt)}
                    </div>
                  </div>
                  <StatusChip status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: color.navy }}>
            Empresas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {d?.empresas.map((e) => (
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
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: color.textMuted, fontSize: 12 }}>{e.totalVagas} vagas</span>
                  <PartnerChip status={e.company.status} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
