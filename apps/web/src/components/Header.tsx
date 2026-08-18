import { Link, useNavigate } from 'react-router-dom';
import { color, initials, layout, radius } from '@rekrutar/tokens';
import { useAuth } from '../state/AuthContext';
import { container } from './primitives';

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const primeiroNome = user?.nome.split(' ')[0] ?? '';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#fff',
        borderBottom: `1px solid ${color.border}`,
      }}
    >
      <div
        style={{
          ...container,
          height: layout.headerHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="Rekrutar — seleção estratégica de pessoas"
            style={{ height: 36, display: 'block' }}
          />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="rk-hover-soft"
            onClick={() => navigate('/vagas')}
            style={{
              background: color.blueLight,
              color: color.blue,
              border: 'none',
              borderRadius: radius.control,
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: 13.5,
              cursor: 'pointer',
            }}
          >
            Ver vagas
          </button>

          {user ? (
            <button
              className="rk-hover-navy"
              onClick={() => navigate('/painel')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: color.navy,
                color: '#fff',
                border: 'none',
                borderRadius: radius.pill,
                padding: '6px 14px 6px 6px',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: color.blue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {initials(user.nome)}
              </span>
              {primeiroNome}
            </button>
          ) : (
            <button
              className="rk-hover-cta"
              onClick={() => navigate('/login')}
              style={{
                background: color.blue,
                color: '#fff',
                border: 'none',
                borderRadius: radius.control,
                padding: '10px 16px',
                fontWeight: 600,
                fontSize: 13.5,
                cursor: 'pointer',
              }}
            >
              Entrar
            </button>
          )}

          <button
            className="rk-hover-header-btn"
            onClick={onOpenMenu}
            aria-label="Menu"
            style={{
              width: 44,
              height: 44,
              background: 'none',
              border: `1px solid ${color.border}`,
              borderRadius: radius.control,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 18,
                  height: 2,
                  background: color.navy,
                  borderRadius: 2,
                  display: 'block',
                }}
              />
            ))}
          </button>
        </div>
      </div>
    </header>
  );
}
