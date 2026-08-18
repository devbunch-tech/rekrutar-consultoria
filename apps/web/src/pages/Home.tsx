import { useQuery } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { color, initials, layout, radius } from '@rekrutar/tokens';
import { HOME_DATA } from '../graphql';
import type { Job, PortalStats, Testimonial } from '../types';
import { JobCard } from '../components/JobCard';
import { Hero } from '../components/Hero';
import { useIsMobile } from '../hooks/useIsMobile';
import { container, sectionTitle } from '../components/primitives';

interface Data {
  portalStats: PortalStats;
  jobs: Job[];
  testimonials: Testimonial[];
}

const COMO_FUNCIONA = [
  {
    n: 1,
    titulo: 'Candidate-se em minutos',
    texto:
      'Encontre a vaga ideal com filtros por modelo, tipo, salário, localidade e setor. Cadastro único, currículo anexado, pronto.',
  },
  {
    n: 2,
    titulo: 'Seleção estratégica',
    texto:
      'Nossa equipe entrevista, avalia aderência e apresenta às empresas apenas os candidatos certos para cada posição.',
  },
  {
    n: 3,
    titulo: 'Feedback em todas as etapas',
    texto:
      'Aqui ninguém fica sem resposta. Você acompanha o status da candidatura e recebe retorno — inclusive no final do processo.',
  },
];

export function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data } = useQuery<Data>(HOME_DATA);
  const stats = data?.portalStats;
  const vagasRecentes = (data?.jobs ?? []).slice(0, 3);

  return (
    <>
      <Hero isMobile={isMobile} stats={stats} onVagas={() => navigate('/vagas')} onDivulgar={() => navigate('/divulgar')} />

      {/* COMO FUNCIONA */}
      <section style={{ ...container, padding: `${layout.sectionPad} ${layout.containerPad}` }}>
        <h2 style={sectionTitle}>Como funciona</h2>
        <p style={{ margin: '0 0 28px', color: color.textMuted, fontSize: 15, maxWidth: 520 }}>
          Simples para o candidato, estratégico para a empresa.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 16,
          }}
        >
          {COMO_FUNCIONA.map((c) => (
            <div
              key={c.n}
              style={{
                background: '#fff',
                border: `1px solid ${color.border}`,
                borderRadius: radius.card,
                padding: 24,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: color.blueLight,
                  color: color.blue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 17,
                  marginBottom: 14,
                }}
              >
                {c.n}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 16.5, fontWeight: 700, color: color.navy }}>
                {c.titulo}
              </h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: color.textMuted }}>
                {c.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* VAGAS RECENTES */}
      <section
        style={{
          background: '#fff',
          borderTop: `1px solid ${color.border}`,
          borderBottom: `1px solid ${color.border}`,
        }}
      >
        <div style={{ ...container, padding: `${layout.sectionPad} ${layout.containerPad}` }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <h2 style={{ ...sectionTitle, margin: 0 }}>Vagas recentes</h2>
            <Link to="/vagas" style={{ fontWeight: 700, fontSize: 14 }}>
              Ver todas as vagas →
            </Link>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {vagasRecentes.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                compacto
                onClick={() => navigate(`/vagas?vaga=${job.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section style={{ ...container, padding: `${layout.sectionPad} ${layout.containerPad}` }}>
        <h2 style={sectionTitle}>Quem passou pela Rekrutar recomenda</h2>
        <p style={{ margin: '0 0 28px', color: color.textMuted, fontSize: 15 }}>
          Depoimentos reais de candidatos e empresas atendidas.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {(data?.testimonials ?? []).map((d) => (
            <div
              key={d.id}
              style={{
                background: '#fff',
                border: `1px solid ${color.border}`,
                borderRadius: radius.card,
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ color: color.star, fontSize: 15, letterSpacing: 2 }}>★★★★★</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: color.textBody }}>
                “{d.texto}”
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 'auto',
                  borderTop: `1px solid ${color.borderSoft}`,
                  paddingTop: 14,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: color.navy,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                    flex: 'none',
                  }}
                >
                  {initials(d.nome)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: color.navy }}>{d.nome}</div>
                  <div style={{ fontSize: 12, color: color.textMuted }}>{d.cargo}</div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: color.green,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: color.green,
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                  }}
                >
                  ✓
                </span>
                Recomendação verificada · {d.fonte}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section
        style={{
          ...container,
          padding: `0 ${layout.containerPad} clamp(48px, 7vw, 72px)`,
        }}
      >
        <div
          style={{
            background: color.blue,
            borderRadius: radius.banner,
            padding: 'clamp(28px, 5vw, 48px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <div style={{ maxWidth: 520 }}>
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: 'clamp(20px, 3.2vw, 26px)',
                fontWeight: 800,
                color: '#fff',
              }}
            >
              Sua empresa precisa contratar?
            </h2>
            <p style={{ margin: 0, color: color.ctaBannerText, fontSize: 14.5, lineHeight: 1.6 }}>
              Torne-se parceira da Rekrutar e receba apenas candidatos entrevistados e alinhados à
              vaga.
            </p>
          </div>
          <button
            className="rk-hover-white"
            onClick={() => navigate('/divulgar')}
            style={{
              background: '#fff',
              color: color.blue,
              border: 'none',
              borderRadius: radius.control,
              padding: '15px 26px',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              flex: 'none',
            }}
          >
            Quero divulgar uma vaga
          </button>
        </div>
      </section>
    </>
  );
}
