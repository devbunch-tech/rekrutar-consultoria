import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { color, radius } from '@rekrutar/tokens';
import {
  ADMIN_JOBS,
  ALTERNAR_VAGA,
  ATUALIZAR_VAGA,
  REMOVER_VAGA,
  SALVAR_VAGA,
} from '../graphql';
import { PageTitle, TableWrap, Vazio, botao, card, input, label, td, th } from '../ui';

interface JobRow {
  id: string;
  titulo: string;
  setor: string;
  cidade: string;
  uf: string;
  modelo: string;
  tipo: string;
  salarioMin?: number | null;
  salarioMax?: number | null;
  faixaSalarial: string;
  descricao: string;
  requisitos: string[];
  ativa: boolean;
  publicadaLabel: string;
  totalCandidaturas: number;
  company?: { id: string; razaoSocial: string; nomeFantasia?: string | null } | null;
}

interface Data {
  jobs: JobRow[];
  companies: Array<{ id: string; razaoSocial: string; nomeFantasia?: string | null }>;
}

/** Campo de salário vazio vira `undefined` — a vaga é publicada como "A combinar". */
const numeroOuIndefinido = (v: FormDataEntryValue | null): number | undefined => {
  const texto = String(v ?? '').trim();
  return texto === '' ? undefined : Number(texto);
};

const MODELOS = ['Híbrido', 'Remoto', '100% Presencial'];
const TIPOS = ['CLT', 'PJ', 'Temporário', 'Freelance'];
const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ',
  'RN','RS','RO','RR','SC','SP','SE','TO',
];

export function Vagas() {
  const { data, loading } = useQuery<Data>(ADMIN_JOBS);
  const [criar] = useMutation(SALVAR_VAGA, { refetchQueries: ['AdminJobs', 'AdminDashboard'] });
  const [atualizar] = useMutation(ATUALIZAR_VAGA, { refetchQueries: ['AdminJobs'] });
  const [alternar] = useMutation(ALTERNAR_VAGA, { refetchQueries: ['AdminJobs', 'AdminDashboard'] });
  const [remover] = useMutation(REMOVER_VAGA, { refetchQueries: ['AdminJobs', 'AdminDashboard'] });

  const [editando, setEditando] = useState<JobRow | null>(null);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState('');

  const fechar = () => {
    setEditando(null);
    setCriando(false);
    setErro('');
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    const f = new FormData(e.currentTarget);
    const inputVaga = {
      titulo: String(f.get('titulo')),
      setor: String(f.get('setor')),
      cidade: String(f.get('cidade')),
      uf: String(f.get('uf')),
      modelo: String(f.get('modelo')),
      tipo: String(f.get('tipo')),
      // Vazio publica a vaga como "A combinar".
      salarioMin: numeroOuIndefinido(f.get('salarioMin')),
      salarioMax: numeroOuIndefinido(f.get('salarioMax')),
      descricao: String(f.get('descricao')),
      requisitos: String(f.get('requisitos'))
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
      ativa: f.get('ativa') === 'on',
      companyId: String(f.get('companyId')) || undefined,
    };

    const { salarioMin, salarioMax } = inputVaga;
    if (salarioMin != null && salarioMax != null && salarioMax < salarioMin) {
      setErro('O salário máximo precisa ser maior ou igual ao mínimo.');
      return;
    }

    try {
      if (editando) await atualizar({ variables: { id: editando.id, input: inputVaga } });
      else await criar({ variables: { input: inputVaga } });
      fechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar a vaga.');
    }
  }

  const formAberto = criando || !!editando;

  return (
    <>
      <PageTitle
        titulo="Vagas"
        acao={
          !formAberto && (
            <button onClick={() => setCriando(true)} style={botao('primario')}>
              + Nova vaga
            </button>
          )
        }
      />

      {formAberto && (
        <div style={{ ...card, marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: color.navy }}>
            {editando ? `Editar: ${editando.titulo}` : 'Nova vaga'}
          </h2>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={grid(220)}>
              <div>
                <label style={label}>Título *</label>
                <input required name="titulo" defaultValue={editando?.titulo} style={input} />
              </div>
              <div>
                <label style={label}>Setor *</label>
                <input required name="setor" defaultValue={editando?.setor} style={input} />
              </div>
            </div>

            <div style={grid(160)}>
              <div>
                <label style={label}>Cidade *</label>
                <input required name="cidade" defaultValue={editando?.cidade} style={input} />
              </div>
              <div>
                <label style={label}>UF *</label>
                <select required name="uf" defaultValue={editando?.uf ?? 'SC'} style={input}>
                  {UFS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>Modelo *</label>
                <select required name="modelo" defaultValue={editando?.modelo ?? MODELOS[0]} style={input}>
                  {MODELOS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>Tipo *</label>
                <select required name="tipo" defaultValue={editando?.tipo ?? TIPOS[0]} style={input}>
                  {TIPOS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={grid(160)}>
              <div>
                <label style={label}>Salário mínimo (R$)</label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  name="salarioMin"
                  defaultValue={editando?.salarioMin ?? ''}
                  placeholder="A combinar"
                  style={input}
                />
              </div>
              <div>
                <label style={label}>Salário máximo (R$)</label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  name="salarioMax"
                  defaultValue={editando?.salarioMax ?? ''}
                  placeholder="A combinar"
                  style={input}
                />
              </div>
              <div>
                <label style={label}>Empresa</label>
                <select name="companyId" defaultValue={editando?.company?.id ?? ''} style={input}>
                  <option value="">Sem empresa vinculada</option>
                  {(data?.companies ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nomeFantasia ?? c.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={label}>Descrição *</label>
              <textarea
                required
                name="descricao"
                rows={4}
                defaultValue={editando?.descricao}
                style={{ ...input, resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={label}>Requisitos (um por linha)</label>
              <textarea
                name="requisitos"
                rows={4}
                defaultValue={editando?.requisitos.join('\n')}
                placeholder={'Experiência com…\nConhecimento em…'}
                style={{ ...input, resize: 'vertical' }}
              />
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13.5,
                color: color.textBody,
              }}
            >
              <input
                type="checkbox"
                name="ativa"
                defaultChecked={editando ? editando.ativa : true}
                style={{ accentColor: color.blue, width: 16, height: 16 }}
              />
              Vaga ativa (visível no portal)
            </label>

            {erro && <p style={{ margin: 0, fontSize: 13, color: '#B42318', fontWeight: 600 }}>{erro}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={botao('primario')}>
                {editando ? 'Salvar alterações' : 'Criar vaga'}
              </button>
              <button type="button" onClick={fechar} style={botao('neutro')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !data ? (
        <Vazio>Carregando vagas…</Vazio>
      ) : (data?.jobs.length ?? 0) === 0 ? (
        <Vazio>Nenhuma vaga cadastrada ainda.</Vazio>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <th style={th}>Vaga</th>
              <th style={th}>Empresa</th>
              <th style={th}>Local</th>
              <th style={th}>Faixa</th>
              <th style={th}>Candidatos</th>
              <th style={th}>Status</th>
              <th style={th} />
            </tr>
          </thead>
          <tbody>
            {data?.jobs.map((v) => (
              <tr key={v.id}>
                <td style={td}>
                  <div style={{ fontWeight: 700, color: color.navy }}>{v.titulo}</div>
                  <div style={{ fontSize: 11.5, color: color.textFaint }}>
                    {v.setor} · {v.modelo} · {v.tipo} · {v.publicadaLabel}
                  </div>
                </td>
                <td style={td}>{v.company?.nomeFantasia ?? v.company?.razaoSocial ?? '—'}</td>
                <td style={td}>
                  {v.cidade} - {v.uf}
                </td>
                <td style={td}>
                  {v.faixaSalarial}
                </td>
                <td style={td}>{v.totalCandidaturas}</td>
                <td style={td}>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: '5px 11px',
                      borderRadius: radius.pill,
                      background: v.ativa ? color.greenBg : color.chipGray,
                      color: v.ativa ? color.green : color.textFaintAlt,
                    }}
                  >
                    {v.ativa ? 'Ativa' : 'Encerrada'}
                  </span>
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setCriando(false);
                        setEditando(v);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{ ...botao('neutro'), padding: '7px 12px', fontSize: 12.5 }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => alternar({ variables: { id: v.id, ativa: !v.ativa } })}
                      style={{ ...botao('neutro'), padding: '7px 12px', fontSize: 12.5 }}
                    >
                      {v.ativa ? 'Encerrar' : 'Reabrir'}
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Excluir "${v.titulo}"? As ${v.totalCandidaturas} candidatura(s) desta vaga também serão removidas.`,
                          )
                        ) {
                          void remover({ variables: { id: v.id } });
                        }
                      }}
                      style={{ ...botao('perigo'), padding: '7px 12px', fontSize: 12.5 }}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}

const grid = (min: number): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
  gap: 14,
});
