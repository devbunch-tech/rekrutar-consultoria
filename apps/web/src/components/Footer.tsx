import { Link } from 'react-router-dom';
import { color, layout } from '@rekrutar/tokens';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/sobre', label: 'Sobre Nós' },
  { to: '/vagas', label: 'Vagas Disponíveis' },
  { to: '/divulgar', label: 'Quero Divulgar' },
  { to: '/contato', label: 'Contato' },
];

const colTitle = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '.1em',
  textTransform: 'uppercase' as const,
  color: '#fff',
  marginBottom: 14,
};

export function Footer() {
  return (
    <footer style={{ background: color.navyDark, color: color.onNavyMuted, marginTop: 'auto' }}>
      <div
        style={{
          maxWidth: layout.containerWidth,
          margin: '0 auto',
          padding: `clamp(32px, 5vw, 48px) ${layout.containerPad}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'clamp(24px, 4vw, 40px)',
        }}
      >
        <div>
          <img
            src="/logo.png"
            alt="Rekrutar"
            style={{
              height: 32,
              filter: 'brightness(0) invert(1)',
              opacity: 0.95,
              marginBottom: 14,
            }}
          />
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>
            Consultoria de RH especializada em recrutamento e seleção estratégica de pessoas,
            atendendo empresas em todo o território nacional.
          </p>
        </div>

        <div>
          <div style={colTitle}>Navegação</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13.5 }}>
            {NAV.map((l) => (
              <Link key={l.to} to={l.to} className="rk-hover-footer" style={{ color: color.onNavyMuted }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div style={colTitle}>Contato</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13.5 }}>
            <span>
              R. Júlio Gaidzinski, SN — Centro
              <br />
              Criciúma - SC · 88811-000
            </span>
            <a
              href="https://www.instagram.com/rekrutar_selecao/"
              target="_blank"
              rel="noreferrer"
              className="rk-hover-footer"
              style={{ color: color.onNavyMuted }}
            >
              Instagram
            </a>
            <a
              href="https://br.linkedin.com/company/rekrutar-consultoria"
              target="_blank"
              rel="noreferrer"
              className="rk-hover-footer"
              style={{ color: color.onNavyMuted }}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div
          style={{
            maxWidth: layout.containerWidth,
            margin: '0 auto',
            padding: `18px ${layout.containerPad}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: 12,
          }}
        >
          <span>© 2026 Rekrutar Consultoria. Todos os direitos reservados.</span>
          <a
            href="https://agbunch.com"
            target="_blank"
            rel="noreferrer"
            className="rk-hover-footer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: color.onNavyMuted,
              textDecoration: 'none',
            }}
          >
            Desenvolvido por
            <img
              src="https://agbunch.com/assets/img/logo/logoBunchAG.png"
              alt="Bunch"
              style={{ height: 20, display: 'block' }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
