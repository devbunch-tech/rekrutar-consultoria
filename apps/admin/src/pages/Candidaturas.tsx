import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { brl, color, initials, radius } from '@rekrutar/tokens';
import { ADMIN_APPLICATIONS, ATUALIZAR_STATUS } from '../graphql';
import { PageTitle, StatusChip, Vazio, botao, card, dataHora, input, label } from '../ui';

const STATUS = [
  'Em análise',
  'Entrevista agendada',
  'Teste técnico',
  'Finalista',
  'Contratado',
  'Não avançou',
];

interface Row {
  id: string;
  status: string;
  aderencia?: number | null;
  createdAt: string;
  job: { id: string; titulo: string; localidade: string };
  candidate: { id: string; nome: string; email: string };
  snapshot: {
    nome?: string | null;
    email?: string | null;
    telefone?: string | null;
    endereco?: string | null;
    idade?: number | null;
    linkedin?: string | null;
    curriculoUrl?: string | null;
    curriculoNome?: string | null;
    setoresInteresse: string[];
    preferenciaTipo?: string | null;
    modeloPreferido?: string | null;
    pretensaoSalarial?: number | null;
    localidadePreferencia?: string | null;
  };
}

interface Data {
  applications: Row[];
  jobs: Array<{ id: string; titulo: string }>;
}

export function Candidaturas() {
  const [filtroVaga, setFiltroVaga] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [aberta, setAberta] = useState<string | null>(null);

  const { data, loading } = useQuery<Data>(ADMIN_APPLICATIONS, {
    variables: { jobId: filtroVaga || undefined, status: filtroStatus || undefined },
  });
  const [atualizarStatus] = useMutation(ATUALIZAR_STATUS, {
    refetchQueries: ['AdminApplications', 'AdminDashboard'],
  });

  const rows = data?.applications ?? [];

  return (
    <>
      <PageTitle titulo="Candidaturas" />

      <div
        style={{
          ...card,
          marginBottom: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
        }}
      >
        <div>
          <label style={label}>Vaga</label>
          <select value={filtroVaga} onChange={(e) => setFiltroVaga(e.target.value)} style={input}>
            <option value="">Todas as vagas</option>
            {(data?.jobs ?? []).map((j) => (
              <option key={j.id} value={j.id}>
                {j.titulo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={label}>Status</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={input}
          >
            <option value="">Todos os status</option>
            {STATUS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && !data ? (
        <Vazio>Carregando candidaturas…</Vazio>
      ) : rows.length === 0 ? (
        <Vazio>Nenhuma candidatura com esses filtros.</Vazio>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((a) => {
            const expandida = aberta === a.id;
            return (
              <div key={a.id} style={{ ...card, padding: 0 }}>
                <div
                  onClick={() => setAberta(expandida ? null : a.id)}
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 12,
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: color.blueLight,
                        color: color.blue,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        flex: 'none',
                      }}
                    >
                      {initials(a.candidate.nome)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: color.navy }}>
                        {a.candidate.nome}
                      </div>
                      <div style={{ fontSize: 12, color: color.textMuted }}>
                        {a.job.titulo} · {dataHora(a.createdAt)}
                        {a.aderencia != null && ` · aderência ${a.aderencia}%`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <StatusChip status={a.status} />
                    <span style={{ color: color.textFaint, fontSize: 12 }}>
                      {expandida ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {expandida && (
                  <div
                    style={{
                      borderTop: `1px solid ${color.borderSoft}`,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 12,
                        fontSize: 13,
                      }}
                    >
                      <Campo rotulo="E-mail" valor={a.snapshot.email ?? a.candidate.email} />
                      <Campo rotulo="Telefone" valor={a.snapshot.telefone} />
                      <Campo rotulo="Endereço" valor={a.snapshot.endereco} />
                      <Campo rotulo="Idade" valor={a.snapshot.idade?.toString()} />
                      <Campo rotulo="LinkedIn" valor={a.snapshot.linkedin} link />
                      <Campo
                        rotulo="Pretensão"
                        valor={
                          a.snapshot.pretensaoSalarial != null
                            ? brl(a.snapshot.pretensaoSalarial)
                            : undefined
                        }
                      />
                      <Campo rotulo="Tipo preferido" valor={a.snapshot.preferenciaTipo} />
                      <Campo rotulo="Modelo preferido" valor={a.snapshot.modeloPreferido} />
                      <Campo rotulo="Localidade" valor={a.snapshot.localidadePreferencia} />
                      <Campo
                        rotulo="Setores de interesse"
                        valor={a.snapshot.setoresInteresse.join(', ')}
                      />
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                      {a.snapshot.curriculoUrl ? (
                        <a
                          href={a.snapshot.curriculoUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            ...botao('neutro'),
                            display: 'inline-block',
                            textDecoration: 'none',
                          }}
                        >
                          Abrir currículo{' '}
                          {a.snapshot.curriculoNome ? `(${a.snapshot.curriculoNome})` : ''}
                        </a>
                      ) : (
                        <span style={{ fontSize: 12.5, color: color.textFaint }}>
                          Sem currículo anexado
                        </span>
                      )}

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
                        <span style={{ fontSize: 12.5, color: color.label, fontWeight: 700 }}>
                          Mover para
                        </span>
                        <select
                          value={a.status}
                          onChange={(e) =>
                            atualizarStatus({
                              variables: { id: a.id, status: e.target.value },
                            })
                          }
                          style={{ ...input, width: 'auto', minWidth: 190, borderRadius: radius.control }}
                        >
                          {STATUS.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function Campo({
  rotulo,
  valor,
  link = false,
}: {
  rotulo: string;
  valor?: string | null;
  link?: boolean;
}) {
  const conteudo = valor && valor.trim() ? valor : '—';
  const href = link && valor ? (valor.startsWith('http') ? valor : `https://${valor}`) : null;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: color.label, marginBottom: 2 }}>
        {rotulo}
      </div>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer">
          {conteudo}
        </a>
      ) : (
        <div style={{ color: color.textBody }}>{conteudo}</div>
      )}
    </div>
  );
}
