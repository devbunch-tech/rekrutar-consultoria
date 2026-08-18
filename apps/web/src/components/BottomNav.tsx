import { useLocation, useNavigate } from 'react-router-dom';
import { color } from '@rekrutar/tokens';
import { useAuth } from '../state/AuthContext';

const svgProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ICONS = {
  home: (
    <svg {...svgProps}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
    </svg>
  ),
  vagas: (
    <svg {...svgProps}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  ),
  divulgar: (
    <svg {...svgProps}>
      <path d="M3 11v2l11 4V7L3 11z" />
      <path d="M14 6.5 20 4v16l-6-2.5" />
      <path d="M6.5 13.5V18a1.5 1.5 0 0 0 3 0v-3.4" />
    </svg>
  ),
  contato: (
    <svg {...svgProps}>
      <path d="M21 12a8 8 0 1 0-3.1 6.3L21 19l-.8-2.9A8 8 0 0 0 21 12z" />
      <path d="M8.5 10.5h7" />
      <path d="M8.5 13.5h4.5" />
    </svg>
  ),
  conta: (
    <svg {...svgProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  ),
};

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const itens = [
    { to: '/', label: 'Home', icon: ICONS.home, ativo: pathname === '/' },
    { to: '/vagas', label: 'Vagas', icon: ICONS.vagas, ativo: pathname.startsWith('/vagas') },
    {
      to: '/divulgar',
      label: 'Divulgar',
      icon: ICONS.divulgar,
      ativo: pathname.startsWith('/divulgar'),
    },
    {
      to: '/contato',
      label: 'Contato',
      icon: ICONS.contato,
      ativo: pathname.startsWith('/contato'),
    },
    {
      to: user ? '/painel' : '/login',
      label: user ? 'Painel' : 'Entrar',
      icon: ICONS.conta,
      ativo: pathname.startsWith('/painel') || pathname.startsWith('/login'),
    },
  ];

  return (
    <>
      <div style={{ height: 66 }} />
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 80,
          background: '#fff',
          borderTop: `1px solid ${color.border}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          padding: '6px 4px calc(6px + env(safe-area-inset-bottom))',
        }}
      >
        {itens.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.to)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px 2px',
              color: item.ativo ? color.blue : color.textFaintAlt,
            }}
          >
            {item.icon}
            <span style={{ fontSize: 10.5, fontWeight: 700 }}>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
