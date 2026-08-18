import { useMutation } from '@apollo/client';
import { color, layout, radius } from '@rekrutar/tokens';
import { ENVIAR_CONTATO } from '../graphql';
import { useToast } from '../state/ToastContext';
import { container, fieldRow, input, label } from '../components/primitives';
import { ImageSlot } from './Sobre';

const MAPA_SRC =
  'https://maps.google.com/maps?q=R.%20J%C3%BAlio%20Gaidzinski%2C%20Centro%2C%20Crici%C3%BAma%20-%20SC&z=16&output=embed';

export function Contato() {
  const showToast = useToast();
  const [enviarContato, { loading }] = useMutation(ENVIAR_CONTATO);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const dados = new FormData(form);
    await enviarContato({
      variables: {
        input: {
          nome: String(dados.get('nome')),
          email: String(dados.get('email')),
          telefone: String(dados.get('tel') ?? '') || undefined,
          mensagem: String(dados.get('msg')),
        },
      },
    });
    form.reset();
    showToast('Mensagem enviada! Retornaremos em breve.');
  }

  return (
    <>
      <section style={{ background: color.navy, color: '#fff' }}>
        <div style={{ ...container, padding: `clamp(32px, 5vw, 48px) ${layout.containerPad}` }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(24px, 4.2vw, 36px)', fontWeight: 800 }}>
            Contato
          </h1>
          <p style={{ margin: 0, color: color.onNavy, fontSize: 14.5 }}>
            Fale com a Rekrutar — respondemos rápido.
          </p>
        </div>
      </section>

      <section
        style={{
          ...container,
          padding: `clamp(24px, 4vw, 40px) ${layout.containerPad} clamp(48px, 7vw, 72px)`,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(20px, 3vw, 32px)',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: `1px solid ${color.border}`,
            borderRadius: radius.cardLg,
            padding: 'clamp(20px, 3vw, 28px)',
          }}
        >
          <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: color.navy }}>
            Envie uma mensagem
          </h2>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={label}>Nome *</label>
              <input required name="nome" placeholder="Seu nome" style={input} />
            </div>
            <div style={fieldRow()}>
              <div>
                <label style={label}>E-mail *</label>
                <input required type="email" name="email" placeholder="voce@email.com" style={input} />
              </div>
              <div>
                <label style={label}>Telefone</label>
                <input name="tel" placeholder="(48) 99999-9999" style={input} />
              </div>
            </div>
            <div>
              <label style={label}>Mensagem *</label>
              <textarea
                required
                name="msg"
                rows={5}
                placeholder="Como podemos ajudar?"
                style={{ ...input, resize: 'vertical' }}
              />
            </div>
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
                fontSize: 15,
                cursor: loading ? 'progress' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Enviando…' : 'Enviar mensagem'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: '#fff',
              border: `1px solid ${color.border}`,
              borderRadius: radius.cardLg,
              overflow: 'hidden',
            }}
          >
            <iframe
              src={MAPA_SRC}
              title="Mapa — Rekrutar Consultoria"
              loading="lazy"
              style={{ width: '100%', height: 240, border: 0, display: 'block' }}
            />
            <div
              style={{
                padding: '16px 20px',
                fontSize: 13.5,
                color: color.textBody,
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: color.navy }}>Rekrutar Consultoria</strong>
              <br />
              R. Júlio Gaidzinski, SN — Centro
              <br />
              Criciúma - SC · 88811-000
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              border: `1px solid ${color.border}`,
              borderRadius: radius.cardLg,
              padding: 22,
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: color.navy }}>
              Responsáveis
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 16,
              }}
            >
              {[
                { nome: 'Alexandre Coelho', cargo: 'Recrutamento & Seleção' },
                { nome: 'Nome do responsável', cargo: 'Cargo' },
              ].map((r) => (
                <div key={r.nome} style={{ textAlign: 'center' }}>
                  <ImageSlot altura={96} largura={96} circulo legenda="Foto" />
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: color.navy,
                      marginTop: 10,
                    }}
                  >
                    {r.nome}
                  </div>
                  <div style={{ fontSize: 12, color: color.textMuted }}>{r.cargo}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              border: `1px solid ${color.border}`,
              borderRadius: radius.cardLg,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 13.5,
            }}
          >
            <a
              href="https://www.instagram.com/rekrutar_selecao/"
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: 700 }}
            >
              Instagram — @rekrutar_selecao
            </a>
            <a
              href="https://br.linkedin.com/company/rekrutar-consultoria"
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: 700 }}
            >
              LinkedIn — Rekrutar Consultoria
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
