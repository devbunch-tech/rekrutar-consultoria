import { color, layout, radius } from '@rekrutar/tokens';
import { container, eyebrow } from '../components/primitives';

const VALORES = [
  {
    titulo: 'Respeito ao candidato',
    texto:
      'Processo transparente, ágil e com retorno garantido. Candidato valorizado hoje é colaborador engajado amanhã.',
  },
  {
    titulo: 'Aderência, não volume',
    texto:
      'Entregamos poucos currículos — os certos. A empresa entrevista menos e contrata melhor.',
  },
  {
    titulo: 'Parceria de longo prazo',
    texto:
      'Acompanhamos a adaptação do contratado após a admissão. Nosso trabalho termina quando a contratação dá certo.',
  },
];

const paragrafo = {
  margin: '0 0 14px',
  fontSize: 15,
  lineHeight: 1.75,
  color: color.textBody,
};

export function Sobre() {
  return (
    <>
      <section style={{ background: color.navy, color: '#fff' }}>
        <div
          style={{
            ...container,
            padding: `clamp(40px, 7vw, 64px) ${layout.containerPad}`,
          }}
        >
          <p style={eyebrow}>Sobre Nós</p>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(26px, 4.6vw, 40px)',
              fontWeight: 800,
              maxWidth: 640,
              lineHeight: 1.15,
            }}
          >
            Seleção estratégica de pessoas, feita por pessoas.
          </h1>
        </div>
      </section>

      <section
        style={{
          ...container,
          padding: `clamp(36px, 6vw, 64px) ${layout.containerPad}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(24px, 4vw, 48px)',
          alignItems: 'start',
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 800, color: color.navy }}>
            Nossa história
          </h2>
          <p style={paragrafo}>
            A Rekrutar Consultoria nasceu em Criciúma (SC) de uma inquietação simples: processos
            seletivos não precisam ser lentos, frios e sem retorno. Fundada por profissionais com
            anos de experiência em recursos humanos e gestão, a Rekrutar se especializou em
            recrutamento e seleção estratégica para empresas de todo o território nacional.
          </p>
          <p style={paragrafo}>
            Do analista ao cargo de liderança, cada processo é conduzido de ponta a ponta:
            entendimento profundo da vaga, triagem criteriosa, entrevistas humanizadas e apresentação
            apenas dos candidatos com real aderência. E o nosso diferencial mais comentado — todo
            candidato recebe feedback, em todas as etapas, inclusive no final.
          </p>
          <p style={{ ...paragrafo, margin: 0 }}>
            Hoje somos parceiros de empresas de tecnologia, indústria, comércio exterior e serviços,
            ajudando times a crescer com a pessoa certa no lugar certo.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ImageSlot altura={280} radius={14} legenda="Foto da equipe Rekrutar" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { v: '+150', l: 'posições fechadas' },
              { v: '+60', l: 'empresas parceiras' },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  background: '#fff',
                  border: `1px solid ${color.border}`,
                  borderRadius: radius.card,
                  padding: 18,
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: color.blue }}>{s.v}</div>
                <div style={{ fontSize: 12.5, color: color.textMuted }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#fff', borderTop: `1px solid ${color.border}` }}>
        <div
          style={{
            ...container,
            padding: `clamp(36px, 6vw, 64px) ${layout.containerPad}`,
          }}
        >
          <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800, color: color.navy }}>
            O que nos guia
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            {VALORES.map((v) => (
              <div
                key={v.titulo}
                style={{
                  border: `1px solid ${color.border}`,
                  borderRadius: radius.card,
                  padding: 22,
                }}
              >
                <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: color.blue }}>
                  {v.titulo}
                </h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: color.textMuted }}>
                  {v.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/** Placeholder das fotos ainda não fornecidas pelo cliente (slots do handoff). */
export function ImageSlot({
  altura,
  radius: r = 14,
  legenda,
  circulo = false,
  largura,
}: {
  altura: number;
  radius?: number;
  legenda: string;
  circulo?: boolean;
  largura?: number;
}) {
  return (
    <div
      style={{
        width: largura ?? '100%',
        height: altura,
        borderRadius: circulo ? '50%' : r,
        background: color.blueLight,
        border: `1px dashed ${color.borderInput}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: color.textFaint,
        fontSize: 12.5,
        padding: 12,
        margin: circulo ? '0 auto' : undefined,
      }}
    >
      {legenda}
    </div>
  );
}
