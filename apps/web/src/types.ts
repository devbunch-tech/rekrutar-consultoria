export type Role = 'candidato' | 'empresa' | 'admin';

export interface CandidateProfile {
  telefone?: string | null;
  endereco?: string | null;
  idade?: number | null;
  linkedin?: string | null;
  curriculoUrl?: string | null;
  curriculoNome?: string | null;
  setoresInteresse: string[];
  preferenciaTipo?: string | null;
  modeloPreferido?: string | null;
  pretensaoSalarial?: number | null;
  localidadePreferencia?: string | null;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  role: Role;
  perfil?: CandidateProfile | null;
}

export interface Job {
  id: string;
  titulo: string;
  setor: string;
  cidade: string;
  uf: string;
  localidade: string;
  modelo: string;
  tipo: string;
  /** Nulos quando a remuneração é "A combinar" — use `faixaSalarial` para exibir. */
  salarioMin?: number | null;
  salarioMax?: number | null;
  faixaSalarial: string;
  descricao: string;
  requisitos: string[];
  publicadaLabel: string;
  jaCandidatado: boolean;
}

export interface Application {
  id: string;
  status: string;
  aderencia?: number | null;
  createdAt: string;
  job: Job;
  candidate?: { id: string; nome: string; email: string; perfil?: CandidateProfile | null };
  snapshot?: { nome?: string | null; endereco?: string | null };
}

export interface JobFacets {
  ufsComVagas: string[];
  ufsRestantes: string[];
  setoresComVagas: string[];
  setoresRestantes: string[];
  modelos: string[];
  tipos: string[];
}

export interface Testimonial {
  id: string;
  nome: string;
  cargo: string;
  fonte: string;
  texto: string;
}

export interface PortalStats {
  vagasAbertas: number;
  posicoesFechadas: number;
  empresasParceiras: number;
  percentualFeedback: number;
}

export interface JobFilter {
  modelo?: string;
  tipo?: string;
  uf?: string;
  setor?: string;
  salarioMin?: number;
  salarioMax?: number;
}
