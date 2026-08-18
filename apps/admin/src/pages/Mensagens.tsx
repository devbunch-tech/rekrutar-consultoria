import { useMutation, useQuery } from '@apollo/client';
import { color, radius } from '@rekrutar/tokens';
import { ADMIN_MENSAGENS, MARCAR_LIDA } from '../graphql';
import { PageTitle, Vazio, botao, card, dataHora } from '../ui';

interface Row {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}

export function Mensagens() {
  const { data, loading } = useQuery<{ contactMessages: Row[] }>(ADMIN_MENSAGENS);
  const [marcar] = useMutation(MARCAR_LIDA, {
    refetchQueries: ['AdminMensagens', 'AdminDashboard'],
  });

  const rows = data?.contactMessages ?? [];

  return (
    <>
      <PageTitle titulo="Mensagens de contato" />

      {loading && !data ? (
        <Vazio>Carregando mensagens…</Vazio>
      ) : rows.length === 0 ? (
        <Vazio>Nenhuma mensagem recebida ainda.</Vazio>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((m) => (
            <div
              key={m.id}
              style={{
                ...card,
                borderLeft: `3px solid ${m.lida ? color.border : color.blue}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: color.navy }}>{m.nome}</div>
                  <div style={{ fontSize: 12, color: color.textMuted }}>
                    <a href={`mailto:${m.email}`}>{m.email}</a>
                    {m.telefone ? ` · ${m.telefone}` : ''} · {dataHora(m.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {!m.lida && (
                    <span
                      style={{
                        background: color.blueLight,
                        color: color.blue,
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: '5px 11px',
                        borderRadius: radius.pill,
                      }}
                    >
                      Nova
                    </span>
                  )}
                  <button
                    onClick={() => marcar({ variables: { id: m.id, lida: !m.lida } })}
                    style={{ ...botao('neutro'), padding: '7px 12px', fontSize: 12.5 }}
                  >
                    {m.lida ? 'Marcar como não lida' : 'Marcar como lida'}
                  </button>
                </div>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: color.textBody,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.mensagem}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
