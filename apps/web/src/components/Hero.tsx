import { color, layout, radius } from '@rekrutar/tokens';
import type { PortalStats } from '../types';
import { container, eyebrow } from './primitives';

interface Props {
  isMobile: boolean;
  stats?: PortalStats;
  onVagas: () => void;
  onDivulgar: () => void;
}

const EYEBROW = 'Consultoria de RH · Brasil inteiro';
const TITULO = 'A pessoa certa, na empresa certa.';
const SUBTITULO =
  'A Rekrutar conecta talentos a oportunidades reais — com processo seletivo humano, rápido e com feedback em todas as etapas.';

const statsDe = (s?: PortalStats) => [
  { v: s?.vagasAbertas ?? '—', l: 'vagas abertas agora' },
  { v: `+${s?.posicoesFechadas ?? 150}`, l: 'posições fechadas' },
  { v: `+${s?.empresasParceiras ?? 60}`, l: 'empresas parceiras' },
  { v: `${s?.percentualFeedback ?? 100}%`, l: 'com feedback ao candidato' },
];

/**
 * Banner principal.
 * Desktop: imagem 16:9 em full-bleed com a copy sobreposta à esquerda (a área
 * livre da foto), sobre um scrim claro que garante contraste do texto navy.
 * Mobile: imagem quadrada no topo + bloco navy com a copy logo abaixo.
 * Só a imagem do breakpoint atual é baixada.
 */
export function Hero({ isMobile, stats, onVagas, onDivulgar }: Props) {
  return isMobile ? (
    <HeroMobile stats={stats} onVagas={onVagas} onDivulgar={onDivulgar} />
  ) : (
    <HeroDesktop stats={stats} onVagas={onVagas} onDivulgar={onDivulgar} />
  );
}

function HeroDesktop({ stats, onVagas, onDivulgar }: Omit<Props, 'isMobile'>) {
  return (
    <section
      style={{
        position: 'relative',
        background: `${color.pageBg} url('/hero-desktop.jpg') center right / cover no-repeat`,
        minHeight: 'clamp(480px, 44vw, 660px)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Scrim: mantém o texto legível sem apagar a foto do lado direito. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(244,247,250,0.97) 0%, rgba(244,247,250,0.92) 30%, rgba(244,247,250,0.45) 46%, rgba(244,247,250,0) 58%)',
        }}
      />

      <div
        style={{
          ...container,
          position: 'relative',
          padding: `clamp(48px, 6vw, 72px) ${layout.containerPad}`,
          width: '100%',
        }}
      >
        <p style={{ ...eyebrow, margin: '0 0 14px', color: color.blue }}>{EYEBROW}</p>
        <h1
          style={{
            margin: '0 0 16px',
            fontSize: 'clamp(30px, 4.2vw, 52px)',
            lineHeight: 1.12,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            color: color.navy,
            // Encolhe junto com a viewport para o texto nunca alcançar o rosto.
            maxWidth: 'min(560px, 48vw)',
          }}
        >
          {TITULO}
        </h1>
        <p
          style={{
            margin: '0 0 28px',
            fontSize: 'clamp(15px, 1.5vw, 17.5px)',
            lineHeight: 1.6,
            color: color.textBody,
            maxWidth: 'min(460px, 45vw)',
          }}
        >
          {SUBTITULO}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button
            className="rk-hover-cta"
            onClick={onVagas}
            style={{
              background: color.blue,
              color: '#fff',
              border: 'none',
              borderRadius: radius.control,
              padding: '15px 26px',
              fontWeight: 700,
              fontSize: 15.5,
              cursor: 'pointer',
            }}
          >
            Ver vagas disponíveis
          </button>
          <button
            className="rk-hover-soft"
            onClick={onDivulgar}
            style={{
              background: 'rgba(255,255,255,0.75)',
              color: color.navy,
              border: `1.5px solid ${color.navy}`,
              borderRadius: radius.control,
              padding: '15px 26px',
              fontWeight: 700,
              fontSize: 15.5,
              cursor: 'pointer',
            }}
          >
            Quero divulgar uma vaga
          </button>
        </div>

        <div
          style={{
            // 2×2: a copy ocupa só a faixa livre da foto, então os stats não
            // cabem em linha única sem invadir a imagem.
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '18px clamp(16px, 2vw, 32px)',
            marginTop: 'clamp(28px, 3.4vw, 44px)',
            borderTop: '1px solid rgba(20,56,74,0.15)',
            paddingTop: 24,
            maxWidth: 'min(430px, 45vw)',
          }}
        >
          {statsDe(stats).map((s) => (
            <div key={s.l}>
              <div style={{ fontSize: 26, fontWeight: 800, color: color.navy }}>{s.v}</div>
              <div style={{ fontSize: 12.5, color: color.textMuted, whiteSpace: 'nowrap' }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroMobile({ stats, onVagas, onDivulgar }: Omit<Props, 'isMobile'>) {
  return (
    <section>
      <img
        src="/hero-mobile.jpg"
        alt="Consultor da Rekrutar apresentando o portal de vagas"
        style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
      />

      <div style={{ background: color.navy, color: '#fff' }}>
        <div style={{ ...container, padding: `32px ${layout.containerPad} 36px` }}>
          <p style={{ ...eyebrow, margin: '0 0 12px' }}>{EYEBROW}</p>
          <h1
            style={{
              margin: '0 0 14px',
              fontSize: 'clamp(30px, 8vw, 40px)',
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: '-0.01em',
            }}
          >
            {TITULO}
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: 15.5, lineHeight: 1.6, color: color.onNavy }}>
            {SUBTITULO}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="rk-hover-cta-bright"
              onClick={onVagas}
              style={{
                background: color.blue,
                color: '#fff',
                border: 'none',
                borderRadius: radius.control,
                padding: '15px 26px',
                fontWeight: 700,
                fontSize: 15.5,
                cursor: 'pointer',
              }}
            >
              Ver vagas disponíveis
            </button>
            <button
              className="rk-hover-outline"
              onClick={onDivulgar}
              style={{
                background: 'none',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.45)',
                borderRadius: radius.control,
                padding: '15px 26px',
                fontWeight: 700,
                fontSize: 15.5,
                cursor: 'pointer',
              }}
            >
              Quero divulgar uma vaga
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px 24px',
              marginTop: 32,
              borderTop: '1px solid rgba(255,255,255,0.15)',
              paddingTop: 24,
            }}
          >
            {statsDe(stats).map((s) => (
              <div key={s.l}>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{s.v}</div>
                <div style={{ fontSize: 13, color: color.onNavyMuted }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
