import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { color, layout, radius } from '@rekrutar/tokens';
import { ENVIAR_PARCERIA } from '../graphql';
import { useToast } from '../state/ToastContext';
import { container, fieldRow, input, label } from '../components/primitives';

const BENEFICIOS = [
  'Candidatos pré-entrevistados, com relatório de aderência',
  'Divulgação da vaga no portal, LinkedIn e redes da Rekrutar',
  'Acompanhamento pós-contratação',
  'Atendimento em todo o território nacional',
];

interface Resultado {
  enviarIntencaoParceria: {
    company: { id: string; razaoSocial: string };
  };
}

export function Divulgar() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [enviarParceria, { loading }] = useMutation<Resultado>(ENVIAR_PARCERIA);
  const [enviado, setEnviado] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await enviarParceria({
      variables: {
        input: {
          responsavel: String(form.get('nome')),
          cnpj: String(form.get('cnpj')),
          telefone: String(form.get('tel')),
          razaoSocial: String(form.get('razao')),
          endereco: String(form.get('end')),
          localidade: String(form.get('loc')),
          email: String(form.get('email') ?? '') || undefined,
        },
      },
    });
    setEnviado(true);
    showToast('Intenção de parceria enviada!');
  }

  return (
    <>
      <section style={{ background: color.navy, color: '#fff' }}>
        <div style={{ ...container, padding: `clamp(32px, 5vw, 48px) ${layout.containerPad}` }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(24px, 4.2vw, 36px)', fontWeight: 800 }}>
            Quero Divulgar
          </h1>
          <p style={{ margin: 0, color: color.onNavy, fontSize: 14.5, maxWidth: 560 }}>
            Divulgue suas vagas com a Rekrutar e receba apenas candidatos entrevistados e alinhados
            ao perfil da posição.
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: '#fff',
              border: `1px solid ${color.border}`,
              borderRadius: radius.cardLg,
              padding: 24,
            }}
          >
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: color.navy }}>
              Já é parceira da Rekrutar?
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: color.textMuted, lineHeight: 1.6 }}>
              Acesse sua conta para acompanhar suas vagas e visualizar os candidatos que se
              candidataram a cada oportunidade.
            </p>
            <button
              onClick={() => navigate('/login?perfil=empresa')}
              className="rk-hover-cta"
              style={{
                width: '100%',
                background: color.blue,
                color: '#fff',
                border: 'none',
                borderRadius: radius.control,
                padding: 14,
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              Entrar como empresa
            </button>
          </div>

          <div style={{ background: color.blueLight, borderRadius: radius.cardLg, padding: 24 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: color.navy }}>
              Por que ser parceira?
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontSize: 13.5,
                color: color.textBody,
                lineHeight: 1.5,
              }}
            >
              {BENEFICIOS.map((b) => (
                <div key={b} style={{ display: 'flex', gap: 10 }}>
                  <span style={{ color: color.blue, fontWeight: 800 }}>✓</span>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            border: `1px solid ${color.border}`,
            borderRadius: radius.cardLg,
            padding: 'clamp(20px, 3vw, 28px)',
          }}
        >
          {enviado ? (
            <div style={{ textAlign: 'center', padding: '32px 12px' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: color.greenBg,
                  color: color.green,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  margin: '0 auto 16px',
                }}
              >
                ✓
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 800, color: color.navy }}>
                Intenção enviada!
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: color.textMuted, lineHeight: 1.6 }}>
                Recebemos os dados da sua empresa. Nossa equipe entrará em contato em até 1 dia útil
                para apresentar a parceria e, ao fechar, enviaremos o link de pagamento por e-mail.
              </p>

            </div>
          ) : (
            <>
              <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: color.navy }}>
                Quero ser parceiro
              </h2>
              <p style={{ margin: '0 0 20px', fontSize: 13.5, color: color.textMuted }}>
                Preencha a intenção de parceria e retornaremos rapidamente.
              </p>

              <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={label}>Nome do responsável *</label>
                  <input required name="nome" placeholder="Seu nome completo" style={input} />
                </div>
                <div style={fieldRow()}>
                  <div>
                    <label style={label}>CNPJ *</label>
                    <input required name="cnpj" placeholder="00.000.000/0001-00" style={input} />
                  </div>
                  <div>
                    <label style={label}>Telefone para contato *</label>
                    <input required name="tel" placeholder="(48) 99999-9999" style={input} />
                  </div>
                </div>
                <div>
                  <label style={label}>Razão Social *</label>
                  <input required name="razao" placeholder="Razão social da empresa" style={input} />
                </div>
                <div>
                  <label style={label}>E-mail da empresa</label>
                  <input type="email" name="email" placeholder="rh@suaempresa.com.br" style={input} />
                </div>
                <div>
                  <label style={label}>Endereço *</label>
                  <input required name="end" placeholder="Rua, número, bairro" style={input} />
                </div>
                <div>
                  <label style={label}>Localidade *</label>
                  <input required name="loc" placeholder="Cidade - UF" style={input} />
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
                    marginTop: 4,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Enviando…' : 'Enviar intenção de parceria'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
}
