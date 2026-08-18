import { GraphQLError } from 'graphql';
import { DateTimeResolver } from 'graphql-scalars';
import mongoose, { type FilterQuery } from 'mongoose';
import type { GraphQLContext } from '../context.js';
import {
  hashPassword,
  requireAdmin,
  requireAuth,
  requireRole,
  signToken,
  verifyPassword,
} from '../auth.js';
import {
  APPLICATION_STATUS,
  Application,
  Company,
  ContactMessage,
  Job,
  Testimonial,
  User,
  type ApplicationDoc,
  type CompanyDoc,
  type JobDoc,
  type Role,
  type UserDoc,
} from '../models/index.js';
import {
  SETORES_EXTRA,
  UFS,
  faixaSalarial,
  publicadaLabel,
  shopifyCheckoutUrl,
} from '../utils.js';

/** Cache por requisição das vagas às quais o usuário logado já se candidatou. */
const appliedCache = new WeakMap<GraphQLContext, Promise<Set<string>>>();

function appliedJobIds(ctx: GraphQLContext): Promise<Set<string>> {
  if (!ctx.user) return Promise.resolve(new Set<string>());
  let cached = appliedCache.get(ctx);
  if (!cached) {
    cached = Application.find({ candidate: ctx.user._id })
      .select('job')
      .lean()
      .then((rows) => new Set(rows.map((r) => String(r.job))));
    appliedCache.set(ctx, cached);
  }
  return cached;
}

const oid = (id: string): mongoose.Types.ObjectId => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new GraphQLError('Identificador inválido.', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  return new mongoose.Types.ObjectId(id);
};

/** Empresa só enxerga as próprias vagas/candidaturas; admin enxerga tudo. */
async function companyScopedJobIds(user: UserDoc): Promise<mongoose.Types.ObjectId[]> {
  const jobs = await Job.find({ company: user.company }).select('_id').lean();
  return jobs.map((j) => j._id);
}

export const resolvers = {
  DateTime: DateTimeResolver,

  Job: {
    id: (j: JobDoc) => String(j._id),
    localidade: (j: JobDoc) => `${j.cidade} - ${j.uf}`,
    faixaSalarial: (j: JobDoc) => faixaSalarial(j.salarioMin, j.salarioMax),
    publicadaLabel: (j: JobDoc) => publicadaLabel(new Date(j.publicadaEm)),
    company: (j: JobDoc) => (j.company ? Company.findById(j.company).exec() : null),
    totalCandidaturas: (j: JobDoc) => Application.countDocuments({ job: j._id }).exec(),
    jaCandidatado: async (j: JobDoc, _a: unknown, ctx: GraphQLContext) =>
      (await appliedJobIds(ctx)).has(String(j._id)),
  },

  Company: {
    id: (c: CompanyDoc) => String(c._id),
    totalVagas: (c: CompanyDoc) => Job.countDocuments({ company: c._id, ativa: true }).exec(),
  },

  User: {
    id: (u: UserDoc) => String(u._id),
    company: (u: UserDoc) => (u.company ? Company.findById(u.company).exec() : null),
    perfil: (u: UserDoc) =>
      u.perfil ? { ...u.perfil, setoresInteresse: u.perfil.setoresInteresse ?? [] } : null,
    totalCandidaturas: (u: UserDoc) => Application.countDocuments({ candidate: u._id }).exec(),
  },

  Application: {
    id: (a: ApplicationDoc) => String(a._id),
    job: (a: ApplicationDoc) => Job.findById(a.job).exec(),
    candidate: (a: ApplicationDoc) => User.findById(a.candidate).exec(),
    snapshot: (a: ApplicationDoc) => ({
      ...a.snapshot,
      setoresInteresse: a.snapshot?.setoresInteresse ?? [],
    }),
  },

  Testimonial: { id: (t: { _id: mongoose.Types.ObjectId }) => String(t._id) },
  ContactMessage: { id: (m: { _id: mongoose.Types.ObjectId }) => String(m._id) },

  /* ------------------------------------------------------------------ Query */

  Query: {
    me: (_p: unknown, _a: unknown, ctx: GraphQLContext) => ctx.user,

    jobs: async (_p: unknown, { filter }: { filter?: JobFilterArgs }) => {
      const f = filter ?? {};
      const query: FilterQuery<JobDoc> = {};
      if (f.apenasAtivas !== false) query.ativa = true;
      if (f.modelo) query.modelo = f.modelo;
      if (f.tipo) query.tipo = f.tipo;
      if (f.uf) query.uf = f.uf;
      if (f.setor) query.setor = f.setor;
      if (f.companyId) query.company = oid(f.companyId);

      // Cada condição é um $or independente, então elas se combinam sem se
      // sobrescrever (um único query.$or seria substituído pela busca abaixo).
      const and: FilterQuery<JobDoc>[] = [];
      // Interseção de faixas: vaga.max >= filtro.min && vaga.min <= filtro.max.
      // Vagas "A combinar" (sem valor) permanecem no resultado — não dá para
      // afirmar que estão fora da faixa pedida.
      if (f.salarioMin != null) {
        and.push({ $or: [{ salarioMax: { $gte: f.salarioMin } }, { salarioMax: null }] });
      }
      if (f.salarioMax != null) {
        and.push({ $or: [{ salarioMin: { $lte: f.salarioMax } }, { salarioMin: null }] });
      }
      if (f.busca) {
        const rx = new RegExp(f.busca.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        and.push({ $or: [{ titulo: rx }, { setor: rx }, { cidade: rx }, { descricao: rx }] });
      }
      if (and.length) query.$and = and;

      return Job.find(query).sort({ publicadaEm: -1 }).exec();
    },

    job: (_p: unknown, { id }: { id: string }) => Job.findById(oid(id)).exec(),

    jobFacets: async () => {
      const ufsComVagas = (await Job.distinct('uf', { ativa: true })).sort();
      const setoresComVagas = (await Job.distinct('setor', { ativa: true })).sort();
      return {
        ufsComVagas,
        ufsRestantes: UFS.filter((u) => !ufsComVagas.includes(u)),
        setoresComVagas,
        setoresRestantes: SETORES_EXTRA.filter((s) => !setoresComVagas.includes(s)).sort(),
        modelos: ['Híbrido', 'Remoto', '100% Presencial'],
        tipos: ['CLT', 'PJ', 'Temporário', 'Freelance'],
      };
    },

    portalStats: async () => ({
      vagasAbertas: await Job.countDocuments({ ativa: true }),
      posicoesFechadas: 150,
      empresasParceiras: 60,
      percentualFeedback: 100,
    }),

    testimonials: () =>
      Testimonial.find({ publicado: true }).sort({ ordem: 1, createdAt: 1 }).exec(),

    setoresDisponiveis: async () => {
      const setores = await Job.distinct('setor', { ativa: true });
      return [...setores.sort(), ...SETORES_EXTRA.filter((s) => !setores.includes(s)).sort()];
    },

    minhasCandidaturas: (_p: unknown, _a: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx.user);
      return Application.find({ candidate: user._id }).sort({ createdAt: -1 }).exec();
    },

    candidateDashboard: async (_p: unknown, _a: unknown, ctx: GraphQLContext) => {
      const user = requireRole(ctx.user, 'candidato');
      const candidaturas = await Application.find({ candidate: user._id }).sort({ createdAt: -1 });
      return {
        totalCandidaturas: candidaturas.length,
        emAnalise: candidaturas.filter((a) => a.status === 'Em análise').length,
        entrevistas: candidaturas.filter((a) => a.status === 'Entrevista agendada').length,
        candidaturas,
      };
    },

    companyDashboard: async (_p: unknown, _a: unknown, ctx: GraphQLContext) => {
      const user = requireRole(ctx.user, 'empresa');
      const jobFilter = user.role === 'admin' ? {} : { company: user.company };
      const jobs = await Job.find({ ...jobFilter }).sort({ publicadaEm: -1 });
      const jobIds = jobs.map((j) => j._id);
      const apps = await Application.find({ job: { $in: jobIds } }).sort({ createdAt: -1 });

      const porVaga = jobs
        .map((job) => {
          const candidaturas = apps.filter((a) => String(a.job) === String(job._id));
          return { job, total: candidaturas.length, candidaturas };
        })
        .filter((g) => g.total > 0);

      return {
        vagasAtivas: jobs.filter((j) => j.ativa).length,
        totalCandidatos: apps.length,
        entrevistasAgendadas: apps.filter((a) => a.status === 'Entrevista agendada').length,
        propostasEmAndamento: apps.filter((a) => a.status === 'Finalista').length,
        porVaga,
      };
    },

    adminDashboard: async (_p: unknown, _a: unknown, ctx: GraphQLContext) => {
      requireAdmin(ctx.user);
      const seteDias = new Date(Date.now() - 7 * 86_400_000);
      const companies = await Company.find().sort({ createdAt: -1 });
      const empresas = await Promise.all(
        companies.map(async (company) => ({
          company,
          totalVagas: await Job.countDocuments({ company: company._id, ativa: true }),
        })),
      );
      return {
        vagasAtivas: await Job.countDocuments({ ativa: true }),
        candidatosNaBase: await User.countDocuments({ role: 'candidato' }),
        empresasParceiras: await Company.countDocuments({ status: 'ativo' }),
        candidaturasNaSemana: await Application.countDocuments({ createdAt: { $gte: seteDias } }),
        ultimasCandidaturas: await Application.find().sort({ createdAt: -1 }).limit(10),
        empresas,
        vagas: await Job.find({ ativa: true }).sort({ publicadaEm: -1 }),
        mensagensNaoLidas: await ContactMessage.countDocuments({ lida: false }),
        leadsNovos: await Company.countDocuments({ status: 'novo' }),
      };
    },

    companies: (_p: unknown, { status }: { status?: string }, ctx: GraphQLContext) => {
      requireAdmin(ctx.user);
      return Company.find(status ? { status } : {}).sort({ createdAt: -1 }).exec();
    },

    company: (_p: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAdmin(ctx.user);
      return Company.findById(oid(id)).exec();
    },

    applications: async (
      _p: unknown,
      { jobId, status }: { jobId?: string; status?: string },
      ctx: GraphQLContext,
    ) => {
      const user = requireRole(ctx.user, 'empresa');
      const query: FilterQuery<ApplicationDoc> = {};
      if (jobId) query.job = oid(jobId);
      if (status) query.status = status;
      if (user.role !== 'admin') {
        const ids = await companyScopedJobIds(user);
        query.job = jobId ? oid(jobId) : { $in: ids };
      }
      return Application.find(query).sort({ createdAt: -1 }).exec();
    },

    users: (_p: unknown, { role }: { role?: Role }, ctx: GraphQLContext) => {
      requireAdmin(ctx.user);
      return User.find(role ? { role } : {}).sort({ createdAt: -1 }).exec();
    },

    contactMessages: (
      _p: unknown,
      { apenasNaoLidas }: { apenasNaoLidas?: boolean },
      ctx: GraphQLContext,
    ) => {
      requireAdmin(ctx.user);
      return ContactMessage.find(apenasNaoLidas ? { lida: false } : {}).sort({ createdAt: -1 }).exec();
    },

    shopifyCheckout: () => shopifyCheckoutUrl(),
  },

  /* --------------------------------------------------------------- Mutation */

  Mutation: {
    login: async (
      _p: unknown,
      { email, senha, role }: { email: string; senha: string; role: Role },
    ) => {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user || !user.ativo || !(await verifyPassword(senha, user.senhaHash))) {
        throw new GraphQLError('E-mail ou senha inválidos.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      if (user.role !== role) {
        throw new GraphQLError(`Esta conta não é do perfil "${role}".`, {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      return { token: signToken(user), user };
    },

    registrarCandidato: async (
      _p: unknown,
      { nome, email, senha }: { nome: string; email: string; senha: string },
    ) => {
      const normalized = email.toLowerCase().trim();
      if (await User.findOne({ email: normalized })) {
        throw new GraphQLError('Já existe uma conta com este e-mail.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const user = await User.create({
        nome,
        email: normalized,
        senhaHash: await hashPassword(senha),
        role: 'candidato',
      });
      return { token: signToken(user), user };
    },

    candidatar: async (
      _p: unknown,
      { jobId, perfil, senha }: { jobId: string; perfil: PerfilInput; senha?: string },
      ctx: GraphQLContext,
    ) => {
      const job = await Job.findById(oid(jobId));
      if (!job || !job.ativa) {
        throw new GraphQLError('Vaga não encontrada ou encerrada.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const email = perfil.email.toLowerCase().trim();
      let user = ctx.user;

      // Sem sessão: reaproveita a conta do e-mail ou cria uma nova (conta do candidato
      // é criada automaticamente na primeira candidatura, como no protótipo).
      if (!user) {
        user = await User.findOne({ email });
        if (user && user.role !== 'candidato') {
          throw new GraphQLError('Este e-mail já pertence a uma conta de empresa ou admin.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        if (!user) {
          user = await User.create({
            nome: perfil.nome,
            email,
            senhaHash: await hashPassword(senha?.trim() || Math.random().toString(36).slice(2, 12)),
            role: 'candidato',
          });
        }
      } else if (user.role !== 'candidato') {
        throw new GraphQLError('Apenas candidatos podem se candidatar a vagas.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const profileFields = {
        telefone: perfil.telefone,
        endereco: perfil.endereco,
        idade: perfil.idade,
        linkedin: perfil.linkedin,
        curriculoUrl: perfil.curriculoUrl,
        curriculoNome: perfil.curriculoNome,
        setoresInteresse: perfil.setoresInteresse,
        preferenciaTipo: perfil.preferenciaTipo,
        modeloPreferido: perfil.modeloPreferido,
        pretensaoSalarial: perfil.pretensaoSalarial,
        localidadePreferencia: perfil.localidadePreferencia,
      };

      user.nome = perfil.nome;
      user.perfil = { ...(user.perfil ?? {}), ...profileFields };
      await user.save();

      const existing = await Application.findOne({ job: job._id, candidate: user._id });
      if (!existing) {
        await Application.create({
          job: job._id,
          candidate: user._id,
          status: 'Em análise',
          snapshot: { nome: perfil.nome, email, ...profileFields },
        });
      }

      return { token: signToken(user), user };
    },

    atualizarPerfil: async (
      _p: unknown,
      { perfil }: { perfil: PerfilInput },
      ctx: GraphQLContext,
    ) => {
      const user = requireRole(ctx.user, 'candidato');
      user.nome = perfil.nome;
      user.perfil = {
        ...(user.perfil ?? {}),
        telefone: perfil.telefone,
        endereco: perfil.endereco,
        idade: perfil.idade,
        linkedin: perfil.linkedin,
        curriculoUrl: perfil.curriculoUrl,
        curriculoNome: perfil.curriculoNome,
        setoresInteresse: perfil.setoresInteresse,
        preferenciaTipo: perfil.preferenciaTipo,
        modeloPreferido: perfil.modeloPreferido,
        pretensaoSalarial: perfil.pretensaoSalarial,
        localidadePreferencia: perfil.localidadePreferencia,
      };
      await user.save();
      return user;
    },

    enviarIntencaoParceria: async (_p: unknown, { input }: { input: PartnerLeadInput }) => {
      const company = await Company.create({
        razaoSocial: input.razaoSocial,
        cnpj: input.cnpj,
        responsavel: input.responsavel,
        telefone: input.telefone,
        email: input.email,
        endereco: input.endereco,
        localidade: input.localidade,
        status: 'novo',
      });
      // O checkout Shopify carrega o id da empresa para o webhook orders/paid
      // conseguir ativar a assinatura da parceria correta.
      const checkout = shopifyCheckoutUrl({
        empresa_id: String(company._id),
        cnpj: input.cnpj,
        razao_social: input.razaoSocial,
      });
      return { company, checkout };
    },

    enviarContato: async (_p: unknown, { input }: { input: ContactInput }) => {
      await ContactMessage.create(input);
      return true;
    },

    criarVaga: async (_p: unknown, { input }: { input: JobInputArgs }, ctx: GraphQLContext) => {
      requireAdmin(ctx.user);
      const { companyId, ...rest } = input;
      return Job.create({ ...rest, company: companyId ? oid(companyId) : undefined });
    },

    atualizarVaga: async (
      _p: unknown,
      { id, input }: { id: string; input: JobInputArgs },
      ctx: GraphQLContext,
    ) => {
      requireAdmin(ctx.user);
      const { companyId, ...rest } = input;
      const job = await Job.findByIdAndUpdate(
        oid(id),
        { ...rest, company: companyId ? oid(companyId) : null },
        { new: true },
      );
      if (!job) throw new GraphQLError('Vaga não encontrada.');
      return job;
    },

    alternarVaga: async (
      _p: unknown,
      { id, ativa }: { id: string; ativa: boolean },
      ctx: GraphQLContext,
    ) => {
      requireAdmin(ctx.user);
      const job = await Job.findByIdAndUpdate(oid(id), { ativa }, { new: true });
      if (!job) throw new GraphQLError('Vaga não encontrada.');
      return job;
    },

    removerVaga: async (_p: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAdmin(ctx.user);
      await Application.deleteMany({ job: oid(id) });
      await Job.findByIdAndDelete(oid(id));
      return true;
    },

    atualizarStatusCandidatura: async (
      _p: unknown,
      { id, status, aderencia }: { id: string; status: string; aderencia?: number },
      ctx: GraphQLContext,
    ) => {
      const user = requireRole(ctx.user, 'empresa');
      const app = await Application.findById(oid(id));
      if (!app) throw new GraphQLError('Candidatura não encontrada.');
      if (user.role !== 'admin') {
        const ids = await companyScopedJobIds(user);
        if (!ids.some((jid) => String(jid) === String(app.job))) {
          throw new GraphQLError('Esta candidatura não pertence à sua empresa.', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }
      if (!(APPLICATION_STATUS as readonly string[]).includes(status)) {
        throw new GraphQLError(`Status inválido: ${status}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      app.status = status as (typeof APPLICATION_STATUS)[number];
      if (aderencia != null) app.aderencia = aderencia;
      await app.save();
      return app;
    },

    atualizarEmpresa: async (
      _p: unknown,
      { id, input }: { id: string; input: Record<string, unknown> },
      ctx: GraphQLContext,
    ) => {
      requireAdmin(ctx.user);
      const company = await Company.findByIdAndUpdate(oid(id), input, { new: true });
      if (!company) throw new GraphQLError('Empresa não encontrada.');
      return company;
    },

    ativarAssinaturaEmpresa: async (
      _p: unknown,
      { id, shopifyOrderId }: { id: string; shopifyOrderId?: string },
      ctx: GraphQLContext,
    ) => {
      requireAdmin(ctx.user);
      const company = await Company.findByIdAndUpdate(
        oid(id),
        {
          status: 'ativo',
          shopifySubscriptionActive: true,
          assinaturaAtivaEm: new Date(),
          ...(shopifyOrderId ? { shopifyOrderId } : {}),
        },
        { new: true },
      );
      if (!company) throw new GraphQLError('Empresa não encontrada.');
      return company;
    },

    removerEmpresa: async (_p: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAdmin(ctx.user);
      await Company.findByIdAndDelete(oid(id));
      return true;
    },

    criarUsuario: async (_p: unknown, { input }: { input: UserInputArgs }, ctx: GraphQLContext) => {
      requireAdmin(ctx.user);
      const email = input.email.toLowerCase().trim();
      if (await User.findOne({ email })) {
        throw new GraphQLError('Já existe uma conta com este e-mail.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      return User.create({
        nome: input.nome,
        email,
        senhaHash: await hashPassword(input.senha),
        role: input.role,
        company: input.companyId ? oid(input.companyId) : undefined,
      });
    },

    alternarUsuario: async (
      _p: unknown,
      { id, ativo }: { id: string; ativo: boolean },
      ctx: GraphQLContext,
    ) => {
      requireAdmin(ctx.user);
      const user = await User.findByIdAndUpdate(oid(id), { ativo }, { new: true });
      if (!user) throw new GraphQLError('Usuário não encontrado.');
      return user;
    },

    removerUsuario: async (_p: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const admin = requireAdmin(ctx.user);
      const alvo = oid(id);

      // Sem auto-exclusão: o admin logado perderia o próprio acesso ao ambiente.
      if (String(admin._id) === String(alvo)) {
        throw new GraphQLError('Você não pode excluir a própria conta.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const user = await User.findById(alvo);
      if (!user) throw new GraphQLError('Usuário não encontrado.');

      // Candidaturas guardam o histórico de contratação das empresas — em vez de
      // apagá-lo em cascata, exigimos que a conta seja bloqueada.
      const candidaturas = await Application.countDocuments({ candidate: alvo });
      if (candidaturas > 0) {
        throw new GraphQLError(
          `${user.nome} tem ${candidaturas} candidatura(s) e não pode ser excluído(a). ` +
            'Bloqueie a conta para revogar o acesso preservando o histórico.',
          { extensions: { code: 'BAD_USER_INPUT' } },
        );
      }

      await User.findByIdAndDelete(alvo);
      return true;
    },

    marcarMensagemLida: async (
      _p: unknown,
      { id, lida }: { id: string; lida: boolean },
      ctx: GraphQLContext,
    ) => {
      requireAdmin(ctx.user);
      const msg = await ContactMessage.findByIdAndUpdate(oid(id), { lida }, { new: true });
      if (!msg) throw new GraphQLError('Mensagem não encontrada.');
      return msg;
    },

    salvarDepoimento: async (
      _p: unknown,
      args: {
        id?: string;
        nome: string;
        cargo: string;
        fonte: string;
        texto: string;
        ordem?: number;
        publicado?: boolean;
      },
      ctx: GraphQLContext,
    ) => {
      requireAdmin(ctx.user);
      const { id, ...data } = args;
      if (id) {
        const t = await Testimonial.findByIdAndUpdate(oid(id), data, { new: true });
        if (!t) throw new GraphQLError('Depoimento não encontrado.');
        return t;
      }
      return Testimonial.create(data);
    },

    removerDepoimento: async (_p: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAdmin(ctx.user);
      await Testimonial.findByIdAndDelete(oid(id));
      return true;
    },
  },
};

/* --------------------------------------------------------------------- Tipos */

interface JobFilterArgs {
  modelo?: string;
  tipo?: string;
  uf?: string;
  setor?: string;
  salarioMin?: number;
  salarioMax?: number;
  busca?: string;
  apenasAtivas?: boolean;
  companyId?: string;
}

interface JobInputArgs {
  titulo: string;
  setor: string;
  cidade: string;
  uf: string;
  modelo: string;
  tipo: string;
  salarioMin: number;
  salarioMax: number;
  descricao: string;
  requisitos: string[];
  ativa?: boolean;
  companyId?: string;
  publicadaEm?: Date;
}

interface PerfilInput {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  idade: number;
  linkedin?: string;
  curriculoUrl?: string;
  curriculoNome?: string;
  setoresInteresse: string[];
  preferenciaTipo: string;
  modeloPreferido: string;
  pretensaoSalarial: number;
  localidadePreferencia: string;
}

interface PartnerLeadInput {
  responsavel: string;
  cnpj: string;
  telefone: string;
  razaoSocial: string;
  endereco: string;
  localidade: string;
  email?: string;
}

interface ContactInput {
  nome: string;
  email: string;
  telefone?: string;
  mensagem: string;
}

interface UserInputArgs {
  nome: string;
  email: string;
  senha: string;
  role: Role;
  companyId?: string;
}
