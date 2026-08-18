import { Link } from 'react-router-dom';
import { color, radius } from '@rekrutar/tokens';
import { useAuth } from '../state/AuthContext';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/sobre', label: 'Sobre Nós' },
  { to: '/vagas', label: 'Vagas Disponíveis' },
  { to: '/divulgar', label: 'Quero Divulgar' },
  { to: '/contato', label: 'Contato' },
];

export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(14,42,56,0.55)',
      }}
    >
      <nav
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(320px, 86vw)',
          background: color.navy,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          animation: 'rkDrawer .28s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <img
            src="/logo.png"
            alt="Rekrutar"
            style={{ height: 30, filter: 'brightness(0) invert(1)' }}
          />
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              width: 40,
              height: 40,
              background: 'none',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: radius.control,
              color: '#fff',
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={onClose}
              className="rk-hover-drawer"
              style={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: 17,
                fontWeight: 600,
                padding: '13px 12px',
                borderRadius: radius.control,
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div
          style={{
            marginTop: 'auto',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: 18,
          }}
        >
          <Link
            to={user ? '/painel' : '/login'}
            onClick={onClose}
            className="rk-hover-cta-bright"
            style={{
              display: 'block',
              width: '100%',
              background: color.blue,
              color: '#fff',
              border: 'none',
              borderRadius: radius.control,
              padding: 14,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            {user ? `Meu painel — ${user.nome.split(' ')[0]}` : 'Entrar na minha conta'}
          </Link>
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 12,
              margin: '14px 0 0',
              textAlign: 'center',
            }}
          >
            seleção estratégica de pessoas
          </p>
        </div>
      </nav>
    </div>
  );
}
