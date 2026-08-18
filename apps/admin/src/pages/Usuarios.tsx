import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { color, radius } from '@rekrutar/tokens';
import { ADMIN_USERS, ALTERNAR_USUARIO, CRIAR_USUARIO, REMOVER_USUARIO } from '../graphql';
import { useAuth } from '../AuthContext';
import { PageTitle, TableWrap, Vazio, botao, card, dataCurta, input, label, td, th } from '../ui';

interface UserRow {
  id: string;
  nome: string;
  email: string;
  role: 'candidato' | 'empresa' | 'admin';
  ativo: boolean;
  createdAt: string;
  totalCandidaturas: number;
  company?: { id: string; razaoSocial: string } | null;
}

interface Data {
  users: UserRow[];
  companies: Array<{ id: string; razaoSocial: string; nomeFantasia?: string | null }>;
}

const ROLE_LABEL = { candidato: 'Candidato', empresa: 'Empresa', admin: 'Admin' } as const;

/** O que cada perfil acessa — a mesma divisão explicada nas telas de login. */
const ROLE_ESCOPO = {
  admin: 'Opera este ambiente administrativo',
  candidato: 'Vê suas candidaturas no portal',
  empresa: 'Vê os candidatos das vagas da empresa',
} as const;

export function Usuarios() {
  const { user: eu } = useAuth();
  const { data, loading } = useQuery<Data>(ADMIN_USERS);
  const [criar] = useMutation(CRIAR_USUARIO, { refetchQueries: ['AdminUsers'] });
  const [alternar] = useMutation(ALTERNAR_USUARIO, { refetchQueries: ['AdminUsers'] });
  const [remover] = useMutation(REMOVER_USUARIO, {
    refetchQueries: ['AdminUsers', 'AdminDashboard'],
  });
  const [criando, setCriando] = useState(false);
  const [filtro, setFiltro] = useState<'todos' | 'candidato' | 'empresa' | 'admin'>('todos');
  const [erro, setErro] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  async function onExcluir(u: UserRow) {
    setErroAcao('');
    if (
      !confirm(
        `Excluir ${u.nome} (${u.email}) definitivamente?\n\n` +
          'A conta perde o acesso e não pode ser recuperada. Para apenas revogar o ' +
          'acesso mantendo o histórico, use Bloquear.',
      )
    ) {
      return;
    }
    try {
      await remover({ variables: { id: u.id } });
    } catch (err) {
      setErroAcao(err instanceof Error ? err.message : 'Não foi possível excluir o usuário.');
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    const f = new FormData(e.currentTarget);
    try {
      await criar({
        variables: {
          input: {
            nome: String(f.get('nome')),
            email: String(f.get('email')),
            senha: String(f.get('senha')),
            role: String(f.get('role')),
            companyId: String(f.get('companyId')) || undefined,
          },
        },
      });
      setCriando(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível criar o usuário.');
    }
  }

  const usuarios = (data?.users ?? []).filter((u) => filtro === 'todos' || u.role === filtro);

  return (
    <>
      <PageTitle
        titulo="Usuários"
        acao={
          !criando && (
            <button onClick={() => setCriando(true)} style={botao('primario')}>
              + Novo usuário
            </button>
          )
        }
      />

      {criando && (
        <div style={{ ...card, marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: color.navy }}>
            Novo usuário
          </h2>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 14,
              }}
            >
              <div>
                <label style={label}>Nome *</label>
                <input required name="nome" style={input} />
              </div>
              <div>
                <label style={label}>E-mail *</label>
                <input required type="email" name="email" style={input} />
              </div>
              <div>
                <label style={label}>Senha provisória *</label>
                <input required name="senha" minLength={6} style={input} />
              </div>
              <div>
                <label style={label}>Perfil *</label>
                <select required name="role" defaultValue="empresa" style={input}>
                  <option value="candidato">Candidato</option>
                  <option value="empresa">Empresa</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={label}>Empresa vinculada</label>
                <select name="companyId" defaultValue="" style={input}>
                  <option value="">Nenhuma</option>
                  {(data?.companies ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nomeFantasia ?? c.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {erro && <p style={{ margin: 0, fontSize: 13, color: '#B42318', fontWeight: 600 }}>{erro}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={botao('primario')}>
                Criar usuário
              </button>
              <button type="button" onClick={() => setCriando(false)} style={botao('neutro')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['todos', 'candidato', 'empresa', 'admin'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              border: '1px solid',
              borderRadius: radius.pill,
              padding: '7px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              ...(filtro === f
                ? { background: color.blue, color: '#fff', borderColor: color.blue }
                : { background: '#fff', color: color.textBody, borderColor: color.borderInput }),
            }}
          >
            {f === 'todos' ? 'Todos' : ROLE_LABEL[f]}
          </button>
        ))}
      </div>

      {erroAcao && (
        <div
          style={{
            ...card,
            padding: '12px 14px',
            marginBottom: 14,
            background: '#FBEAE8',
            borderColor: '#F0C4BE',
            fontSize: 13,
            fontWeight: 600,
            color: '#B42318',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span>{erroAcao}</span>
          <button
            onClick={() => setErroAcao('')}
            aria-label="Fechar aviso"
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#B42318',
              fontWeight: 800,
              fontSize: 15,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      {loading && !data ? (
        <Vazio>Carregando usuários…</Vazio>
      ) : usuarios.length === 0 ? (
        <Vazio>Nenhum usuário neste filtro.</Vazio>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <th style={th}>Nome</th>
              <th style={th}>E-mail</th>
              <th style={th}>Perfil</th>
              <th style={th}>Empresa</th>
              <th style={th}>Desde</th>
              <th style={th}>Status</th>
              <th style={th} />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const ehVoce = eu?.id === u.id;
              const temHistorico = u.totalCandidaturas > 0;
              const impedimento = ehVoce
                ? 'Você não pode excluir a própria conta.'
                : temHistorico
                  ? `Tem ${u.totalCandidaturas} candidatura(s). Bloqueie a conta para preservar o histórico.`
                  : '';
              return (
                <tr key={u.id}>
                  <td style={{ ...td, fontWeight: 600, color: color.navy }}>
                    {u.nome}
                    {ehVoce && (
                      <span
                        style={{ marginLeft: 7, fontSize: 11, fontWeight: 700, color: color.blue }}
                      >
                        você
                      </span>
                    )}
                  </td>
                  <td style={td}>{u.email}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 600, color: color.navy }}>{ROLE_LABEL[u.role]}</div>
                    <div style={{ fontSize: 11.5, color: color.textMuted, marginTop: 2 }}>
                      {ROLE_ESCOPO[u.role]}
                    </div>
                  </td>
                  <td style={td}>{u.company?.razaoSocial ?? '—'}</td>
                  <td style={td}>{dataCurta(u.createdAt)}</td>
                  <td style={td}>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: '5px 11px',
                        borderRadius: radius.pill,
                        background: u.ativo ? color.greenBg : color.chipGray,
                        color: u.ativo ? color.green : color.textFaintAlt,
                      }}
                    >
                      {u.ativo ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => alternar({ variables: { id: u.id, ativo: !u.ativo } })}
                        style={{ ...botao('neutro'), padding: '7px 12px', fontSize: 12.5 }}
                      >
                        {u.ativo ? 'Bloquear' : 'Reativar'}
                      </button>
                      <button
                        onClick={() => void onExcluir(u)}
                        disabled={!!impedimento}
                        title={impedimento || undefined}
                        style={{
                          ...botao('perigo'),
                          padding: '7px 12px',
                          fontSize: 12.5,
                          ...(impedimento ? { opacity: 0.45, cursor: 'not-allowed' } : {}),
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
