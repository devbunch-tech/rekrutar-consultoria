import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { color, initials, radius } from '@rekrutar/tokens';
import { PORTAL_URL } from './apollo';
import { useAuth } from './AuthContext';

const LINKS = [
  { to: '/', label: 'Visão geral', end: true },
  { to: '/vagas', label: 'Vagas' },
  { to: '/candidaturas', label: 'Candidaturas' },
  { to: '/empresas', label: 'Empresas & assinaturas' },
  { to: '/usuarios', label: 'Usuários' },
  { to: '/mensagens', label: 'Mensagens' },
];

const linkStyle = (ativo: boolean): React.CSSProperties => ({
  display: 'block',
  color: ativo ? '#fff' : color.onNavyMuted,
  background: ativo ? 'rgba(255,255,255,0.10)' : 'transparent',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: ativo ? 700 : 600,
  padding: '11px 14px',
  borderRadius: radius.control,
});

export function Shell() {
  const { user, sair } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'clamp(200px, 22vw, 260px) minmax(0, 1fr)',
          minHeight: '100vh',
        }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            background: color.navy,
            color: '#fff',
            padding: '22px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            position: 'sticky',
            top: 0,
            height: '100vh',
          }}
        >
          <img
            src="/logo.png"
            alt="Rekrutar"
            style={{ height: 30, filter: 'brightness(0) invert(1)', alignSelf: 'flex-start' }}
          />
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: color.onNavyEyebrow,
            }}
          >
            Admin master
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} style={({ isActive }) => linkStyle(isActive)}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div
            style={{
              marginTop: 'auto',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              paddingTop: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <a
              href={PORTAL_URL}
              target="_blank"
              rel="noreferrer"
              style={{ color: color.onNavyMuted, fontSize: 13, fontWeight: 600 }}
            >
              Ver o portal ↗
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: color.blue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 12.5,
                  flex: 'none',
                }}
              >
                {initials(user?.nome ?? 'A')}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.nome}
                </div>
                <button
                  onClick={() => {
                    sair();
                    navigate('/');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: color.onNavyMuted,
                    fontSize: 12,
                    padding: 0,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main
          style={{
            background: color.pageBg,
            padding: 'clamp(20px, 3vw, 32px)',
            minWidth: 0,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
