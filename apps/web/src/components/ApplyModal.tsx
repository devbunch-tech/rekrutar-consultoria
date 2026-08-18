import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { color, radius } from '@rekrutar/tokens';
import { uploadCurriculo } from '../apollo';
import { CANDIDATAR, JOB_FACETS } from '../graphql';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import type { Job, JobFacets, User } from '../types';
import { BottomSheet, CloseButton } from './BottomSheet';
import { fieldRow, input, label } from './primitives';

interface Props {
  job: Job;
  onClose: () => void;
  onSucesso: () => void;
}

interface FacetsData {
  jobFacets: JobFacets;
  setoresDisponiveis: string[];
}

export function ApplyModal({ job, onClose, onSucesso }: Props) {
  const { user, entrar } = useAuth();
  const showToast = useToast();
  const { data } = useQuery<FacetsData>(JOB_FACETS);
  const [candidatar] = useMutation<{ candidatar: { token: string; user: User } }>(CANDIDATAR);

  const perfil = user?.perfil;
  const [setores, setSetores] = useState<string[]>(perfil?.setoresInteresse ?? []);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const ufs = [...(data?.jobFacets.ufsComVagas ?? []), ...(data?.jobFacets.ufsRestantes ?? [])].sort();
  const setoresAll = data?.setoresDisponiveis ?? [];

  const toggleSetor = (s: string) =>
    setSetores((atual) => (atual.includes(s) ? atual.filter((x) => x !== s) : [...atual, s]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    if (setores.length === 0) {
      setErro('Selecione ao menos um setor de interesse.');
      return;
    }

    const form = new FormData(e.currentTarget);
    setEnviando(true);
    try {
      let curriculoUrl = perfil?.curriculoUrl ?? undefined;
      let curriculoNome = perfil?.curriculoNome ?? undefined;

      const arquivo = form.get('cv') as File | null;
      if (arquivo && arquivo.size > 0) {
        const enviado = await uploadCurriculo(arquivo);
        curriculoUrl = enviado.url;
        curriculoNome = enviado.nome;
      }
      if (!curriculoUrl) {
        setErro('Anexe seu currículo em PDF, DOC ou DOCX.');
        setEnviando(false);
        return;
      }

      const { data: res } = await candidatar({
        variables: {
          jobId: job.id,
          perfil: {
            nome: String(form.get('nome')),
            email: String(form.get('email')),
            telefone: String(form.get('tel')),
            endereco: String(form.get('end')),
            idade: Number(form.get('idade')),
            linkedin: String(form.get('linkedin') ?? ''),
            curriculoUrl,
            curriculoNome,
            setoresInteresse: setores,
            preferenciaTipo: String(form.get('ptipo')),
            modeloPreferido: String(form.get('pmodelo')),
            pretensaoSalarial: Number(form.get('pretensao')),
            localidadePreferencia: String(form.get('ploc')),
          },
        },
        refetchQueries: ['Jobs', 'HomeData', 'MinhasCandidaturas', 'CandidateDashboard'],
      });

      if (res?.candidatar) entrar(res.candidatar.token, res.candidatar.user);
      showToast('Candidatura enviada! Acompanhe o status no seu painel.');
      onSucesso();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível enviar a candidatura.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <BottomSheet onClose={onClose} zIndex={110} overlay="rgba(14,42,56,0.65)" maxHeight="92vh">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 4,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: color.navy }}>
          Candidatar-se
        </h2>
        <CloseButton onClick={onClose} />
      </div>
      <p style={{ margin: '0 0 20px', fontSize: 13.5, color: color.textMuted }}>
        Vaga: <strong style={{ color: color.blue }}>{job.titulo}</strong>
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={label}>Seu nome *</label>
          <input required name="nome" defaultValue={user?.nome ?? ''} placeholder="Nome completo" style={input} />
        </div>

        <div style={fieldRow(170)}>
          <div>
            <label style={label}>Seu e-mail *</label>
            <input
              required
              type="email"
              name="email"
              defaultValue={user?.email ?? ''}
              placeholder="voce@email.com"
              style={input}
            />
          </div>
          <div>
            <label style={label}>Seu telefone *</label>
            <input
              required
              name="tel"
              defaultValue={perfil?.telefone ?? ''}
              placeholder="(48) 99999-9999"
              style={input}
            />
          </div>
        </div>

        <div>
          <label style={label}>Seu endereço *</label>
          <input
            required
            name="end"
            defaultValue={perfil?.endereco ?? ''}
            placeholder="Rua, número, bairro, cidade - UF"
            style={input}
          />
        </div>

        <div style={fieldRow(170)}>
          <div>
            <label style={label}>Sua idade *</label>
            <input
              required
              type="number"
              min={14}
              max={99}
              name="idade"
              defaultValue={perfil?.idade ?? ''}
              placeholder="ex. 28"
              style={input}
            />
          </div>
          <div>
            <label style={label}>Seu LinkedIn</label>
            <input
              name="linkedin"
              defaultValue={perfil?.linkedin ?? ''}
              placeholder="linkedin.com/in/voce"
              style={input}
            />
          </div>
        </div>

        <div>
          <label style={label}>
            Seu currículo (PDF) {perfil?.curriculoNome ? '' : '*'}
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            name="cv"
            style={{
              ...input,
              padding: '11px 12px',
              border: `1px dashed ${color.borderInput}`,
              fontSize: 13.5,
              background: color.surfaceSoft,
              color: color.textMuted,
            }}
          />
          {perfil?.curriculoNome && (
            <p style={{ margin: '6px 0 0', fontSize: 11.5, color: color.textFaint }}>
              Currículo salvo: {perfil.curriculoNome} — envie outro arquivo para substituir.
            </p>
          )}
        </div>

        <div>
          <label style={{ ...label, marginBottom: 8 }}>Setores de interesse *</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 8,
            }}
          >
            {setoresAll.map((s) => (
              <label
                key={s}
                className="rk-hover-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: color.textBody,
                  border: `1px solid ${color.border}`,
                  borderRadius: radius.control,
                  padding: '9px 11px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={setores.includes(s)}
                  onChange={() => toggleSetor(s)}
                  style={{ accentColor: color.blue, width: 15, height: 15, flex: 'none' }}
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div style={fieldRow(170)}>
          <div>
            <label style={label}>Preferência de tipo *</label>
            <select
              required
              name="ptipo"
              defaultValue={perfil?.preferenciaTipo ?? ''}
              style={{ ...input, padding: 12, background: '#fff' }}
            >
              <option value="">Selecione</option>
              {['CLT', 'PJ', 'Temporário', 'Freelance', 'Indiferente'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>Modelo preferido *</label>
            <select
              required
              name="pmodelo"
              defaultValue={perfil?.modeloPreferido ?? ''}
              style={{ ...input, padding: 12, background: '#fff' }}
            >
              <option value="">Selecione</option>
              {['Remoto', 'Híbrido', '100% Presencial', 'Indiferente'].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={fieldRow(170)}>
          <div>
            <label style={label}>Pretensão salarial (R$) *</label>
            <input
              required
              type="number"
              min={0}
              step={100}
              name="pretensao"
              defaultValue={perfil?.pretensaoSalarial ?? ''}
              placeholder="ex. 4500"
              style={input}
            />
          </div>
          <div>
            <label style={label}>Localidade de preferência *</label>
            <select
              required
              name="ploc"
              defaultValue={perfil?.localidadePreferencia ?? ''}
              style={{ ...input, padding: 12, background: '#fff' }}
            >
              <option value="">Selecione o estado</option>
              {ufs.map((u) => (
                <option key={u}>{u}</option>
              ))}
              <option>Qualquer / Remoto</option>
            </select>
          </div>
        </div>

        {erro && (
          <p style={{ margin: 0, fontSize: 13, color: '#B42318', fontWeight: 600 }}>{erro}</p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="rk-hover-cta"
          style={{
            background: color.blue,
            color: '#fff',
            border: 'none',
            borderRadius: radius.control,
            padding: 16,
            fontWeight: 700,
            fontSize: 15.5,
            cursor: enviando ? 'progress' : 'pointer',
            marginTop: 6,
            opacity: enviando ? 0.7 : 1,
          }}
        >
          {enviando ? 'Enviando…' : 'Enviar candidatura'}
        </button>
        <p style={{ margin: 0, fontSize: 11.5, color: color.textFaint, textAlign: 'center' }}>
          Seus dados ficam salvos para as próximas candidaturas.
        </p>
      </form>
    </BottomSheet>
  );
}
