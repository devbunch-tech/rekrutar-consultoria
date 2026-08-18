import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { color, radius } from '@rekrutar/tokens';
import { LOGIN } from '../graphql';
import { PORTAL_URL } from '../apollo';
import { useAuth } from '../AuthContext';
import { botao, input, label } from '../ui';

/** Os três perfis do sistema e o que cada um alcança. */
const PERFIS = [
  {
    nome: 'Admin',
    onde: 'aqui',
    escopo: 'Opera este ambiente: vagas, funil, empresas, usuários e mensagens.',
    destaque: true,
  },
  {
    nome: 'Candidato',
    onde: 'no portal',
    escopo: 'Vê as vagas, se candidata e acompanha o status das próprias candidaturas.',
    destaque: false,
  },
  {
    nome: 'Empresa',
    onde: 'no portal',
    escopo: 'Vê o perfil completo dos candidatos das vagas da própria empresa.',
    destaque: false,
  },
] as const;

export function Login() {
  const { entrar } = useAuth();
  const [erro, setErro] = useState('');
  const [login, { loading }] = useMutation<{ login: { token: string } }>(LOGIN);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    const form = new FormData(e.currentTarget);
    try {
      const { data } = await login({
        variables: { email: String(form.get('email')), senha: String(form.get('senha')) },
      });
      if (data?.login) entrar(data.login.token);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(180deg, #F4F7FA 0%, #E8EFF5 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#fff',
          border: `1px solid ${color.border}`,
          borderRadius: radius.panel,
          padding: 32,
        }}
      >
        <img
          src="/logo.png"
          alt="Rekrutar"
          style={{ height: 34, display: 'block', marginBottom: 20 }}
        />
        <h1 style={{ margin: '0 0 4px', fontSize: 21, fontWeight: 800, color: color.navy }}>
          Painel administrativo
        </h1>
        <p style={{ margin: '0 0 18px', fontSize: 13.5, color: color.textMuted, lineHeight: 1.6 }}>
          Acesso restrito à equipe Rekrutar. Só contas de perfil <strong>Admin</strong> entram aqui.
        </p>

        <div
          style={{
            background: color.surfaceSoft,
            border: `1px solid ${color.border}`,
            borderRadius: radius.control,
            padding: 14,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: color.label,
              marginBottom: 10,
            }}
          >
            Três perfis no sistema
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PERFIS.map((p) => (
              <div key={p.nome} style={{ display: 'flex', gap: 9 }}>
                <span
                  style={{
                    marginTop: 5,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: p.destaque ? color.blue : color.borderInput,
                  }}
                />
                <div style={{ fontSize: 12.5, lineHeight: 1.55, color: color.textMuted }}>
                  <strong style={{ color: color.navy }}>{p.nome}</strong>{' '}
                  <span style={{ color: color.textFaint }}>· entra {p.onde}</span>
                  <br />
                  {p.escopo}
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 12, color: color.textFaint, lineHeight: 1.55 }}>
            Candidato e empresa não têm acesso a este ambiente — eles entram pelo{' '}
            <a href={`${PORTAL_URL}/login`} target="_blank" rel="noreferrer">
              login do portal
            </a>
            .
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={label}>E-mail</label>
            <input required type="email" name="email" placeholder="admin@rekrutar.com.br" style={input} />
          </div>
          <div>
            <label style={label}>Senha</label>
            <input required type="password" name="senha" placeholder="••••••••" style={input} />
          </div>
          {erro && <p style={{ margin: 0, fontSize: 13, color: '#B42318', fontWeight: 600 }}>{erro}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ ...botao('primario'), padding: 14, fontSize: 15 }}
          >
            {loading ? 'Entrando…' : 'Entrar no admin'}
          </button>
        </form>

        <p
          style={{
            margin: '18px 0 0',
            fontSize: 11.5,
            color: color.textFaint,
            textAlign: 'center',
            background: color.surfaceSoft,
            borderRadius: radius.control,
            padding: 10,
          }}
        >
          Ambiente local — admin@rekrutar.com.br / rekrutar123
        </p>
      </div>
    </div>
  );
}
