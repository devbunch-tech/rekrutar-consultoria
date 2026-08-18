import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { color, radius } from '@rekrutar/tokens';
import { LOGIN } from '../graphql';
import { ADMIN_URL } from '../apollo';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { label } from '../components/primitives';
import type { Role, User } from '../types';

/**
 * Os três perfis do sistema. `escopo` é o que a conta enxerga depois de entrar —
 * a mesma divisão explicada no login do ambiente administrativo.
 */
const COPY: Record<Role, { t: string; s: string; cta: string; ph: string; escopo: string }> = {
  candidato: {
    t: 'Acompanhe suas candidaturas.',
    s: 'Entre para ver o status de cada vaga que você se candidatou, receber atualizações e se candidatar mais rápido.',
    cta: 'Entrar como candidato',
    ph: 'voce@email.com',
    escopo: 'Vê as vagas e o andamento das próprias candidaturas, aqui no portal.',
  },
  empresa: {
    t: 'Seus candidatos, em um só lugar.',
    s: 'Acesse o painel da sua empresa para acompanhar vagas ativas e visualizar os candidatos entrevistados pela Rekrutar.',
    cta: 'Entrar como empresa',
    ph: 'rh@suaempresa.com.br',
    escopo: 'Vê o perfil completo dos candidatos das vagas da própria empresa.',
  },
  admin: {
    t: 'Visão completa da operação.',
    s: 'Acesso restrito à equipe Rekrutar: candidatos, empresas, vagas e toda a atividade do portal.',
    cta: 'Entrar como admin',
    ph: 'admin@rekrutar.com.br',
    escopo: 'Opera o ambiente administrativo: vagas, funil, empresas, usuários e mensagens.',
  },
};

const PERFIL_LABEL: Record<Role, string> = {
  candidato: 'Candidato',
  empresa: 'Empresa',
  admin: 'Admin',
};

const segTab = (ativo: boolean): React.CSSProperties => ({
  flex: 1,
  border: 'none',
  borderRadius: radius.control,
  padding: '11px 6px',
  fontSize: 13.5,
  fontWeight: 700,
  cursor: 'pointer',
  background: ativo ? color.navy : 'none',
  color: ativo ? '#fff' : color.textMuted,
});

const campo: React.CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  border: `1px solid ${color.borderInput}`,
  borderRadius: radius.control,
  fontSize: 15,
};

export function Login() {
  const [params] = useSearchParams();
  const perfilInicial = (params.get('perfil') as Role) ?? 'candidato';
  const [perfil, setPerfil] = useState<Role>(
    ['candidato', 'empresa', 'admin'].includes(perfilInicial) ? perfilInicial : 'candidato',
  );
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const showToast = useToast();
  const [login, { loading }] = useMutation<{ login: { token: string; user: User } }>(LOGIN);

  const copy = COPY[perfil];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    const form = new FormData(e.currentTarget);
    try {
      const { data } = await login({
        variables: {
          email: String(form.get('email')),
          senha: String(form.get('senha')),
          role: perfil,
        },
      });
      if (data?.login) {
        entrar(data.login.token, data.login.user);
        showToast('Bem-vindo(a)! Login realizado.');
        navigate('/painel');
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
    }
  }

  return (
    <section
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 40px)',
        background: 'linear-gradient(180deg, #F4F7FA 0%, #E8EFF5 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 880,
          background: '#fff',
          border: `1px solid ${color.border}`,
          borderRadius: radius.panel,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        <div
          style={{
            background: color.navy,
            color: '#fff',
            padding: 'clamp(28px, 4vw, 44px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <img
            src="/logo.png"
            alt="Rekrutar"
            style={{ height: 34, filter: 'brightness(0) invert(1)', alignSelf: 'flex-start' }}
          />
          <h1
            style={{
              margin: '8px 0 0',
              fontSize: 'clamp(22px, 3vw, 28px)',
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {copy.t}
          </h1>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: color.onNavy }}>{copy.s}</p>
          <div style={{ marginTop: 'auto' }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: color.onNavyEyebrow,
                marginBottom: 12,
              }}
            >
              Três tipos de acesso
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(['candidato', 'empresa', 'admin'] as Role[]).map((r) => {
                const ativo = perfil === r;
                return (
                  <button
                    key={r}
                    onClick={() => setPerfil(r)}
                    style={{
                      display: 'flex',
                      gap: 10,
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      font: 'inherit',
                      opacity: ativo ? 1 : 0.62,
                    }}
                  >
                    <span
                      style={{
                        marginTop: 6,
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: ativo ? color.onNavyEyebrow : color.onNavyMuted,
                      }}
                    />
                    <span style={{ fontSize: 12.5, lineHeight: 1.5, color: color.onNavyMuted }}>
                      <strong style={{ color: '#fff' }}>{PERFIL_LABEL[r]}</strong>
                      <br />
                      {COPY[r].escopo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ padding: 'clamp(24px, 4vw, 44px)' }}>
          <div
            style={{
              display: 'flex',
              background: color.chipGray,
              borderRadius: 10,
              padding: 4,
              gap: 4,
              marginBottom: 24,
            }}
          >
            {(['candidato', 'empresa', 'admin'] as Role[]).map((r) => (
              <button key={r} onClick={() => setPerfil(r)} style={segTab(perfil === r)}>
                {PERFIL_LABEL[r]}
              </button>
            ))}
          </div>

          <p
            style={{
              margin: '-10px 0 20px',
              fontSize: 12.5,
              lineHeight: 1.55,
              color: color.textMuted,
            }}
          >
            {copy.escopo}
          </p>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={label}>E-mail</label>
              <input required type="email" name="email" placeholder={copy.ph} style={campo} />
            </div>
            <div>
              <label style={label}>Senha</label>
              <input required type="password" name="senha" placeholder="••••••••" style={campo} />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 13,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  color: color.textMuted,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  name="lembrar"
                  defaultChecked
                  style={{ accentColor: color.blue, width: 16, height: 16 }}
                />
                Lembrar de mim
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Em breve: recuperação de senha por e-mail.');
                }}
              >
                Esqueci a senha
              </a>
            </div>

            {erro && (
              <p style={{ margin: 0, fontSize: 13, color: '#B42318', fontWeight: 600 }}>{erro}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rk-hover-cta"
              style={{
                background: color.blue,
                color: '#fff',
                border: 'none',
                borderRadius: radius.control,
                padding: 15,
                fontWeight: 700,
                fontSize: 15.5,
                cursor: loading ? 'progress' : 'pointer',
                marginTop: 4,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Entrando…' : copy.cta}
            </button>
          </form>

          {perfil === 'candidato' && (
            <p
              style={{
                margin: '18px 0 0',
                fontSize: 13,
                color: color.textMuted,
                textAlign: 'center',
              }}
            >
              Ainda não tem conta? Ela é criada automaticamente na sua primeira candidatura —{' '}
              <Link to="/vagas">ver vagas</Link>.
            </p>
          )}
          {perfil === 'empresa' && (
            <p
              style={{
                margin: '18px 0 0',
                fontSize: 13,
                color: color.textMuted,
                textAlign: 'center',
              }}
            >
              Ainda não é parceira? <Link to="/divulgar">Preencha a intenção de parceria</Link>.
            </p>
          )}
          {perfil === 'admin' && (
            <p
              style={{
                margin: '18px 0 0',
                fontSize: 13,
                color: color.textMuted,
                textAlign: 'center',
              }}
            >
              A equipe Rekrutar opera pelo{' '}
              <a href={ADMIN_URL} target="_blank" rel="noreferrer">
                ambiente administrativo
              </a>
              , em endereço próprio.
            </p>
          )}

          <p
            style={{
              margin: '16px 0 0',
              fontSize: 11.5,
              color: color.textFaint,
              textAlign: 'center',
              background: color.surfaceSoft,
              borderRadius: radius.control,
              padding: 10,
            }}
          >
            Ambiente local — contas de demonstração com a senha <strong>rekrutar123</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
