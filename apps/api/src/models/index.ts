import mongoose, {
  Schema,
  type HydratedDocument,
  type InferSchemaType,
  type Model,
} from 'mongoose';

export const ROLES = ['candidato', 'empresa', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const MODELOS = ['Híbrido', 'Remoto', '100% Presencial'] as const;
export const TIPOS = ['CLT', 'PJ', 'Temporário', 'Freelance'] as const;
export const APPLICATION_STATUS = [
  'Em análise',
  'Entrevista agendada',
  'Teste técnico',
  'Finalista',
  'Contratado',
  'Não avançou',
] as const;
export const PARTNER_STATUS = ['novo', 'em_contato', 'checkout_enviado', 'ativo', 'recusado'] as const;

/* ------------------------------------------------------------------ Company */

const companySchema = new Schema(
  {
    razaoSocial: { type: String, required: true, trim: true },
    nomeFantasia: { type: String, trim: true },
    cnpj: { type: String, required: true, trim: true, index: true },
    responsavel: { type: String, required: true, trim: true },
    telefone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    endereco: { type: String, required: true, trim: true },
    localidade: { type: String, required: true, trim: true },
    status: { type: String, enum: PARTNER_STATUS, default: 'novo', index: true },
    // Assinatura Shopify
    shopifyCustomerId: { type: String },
    shopifyOrderId: { type: String },
    shopifySubscriptionActive: { type: Boolean, default: false },
    assinaturaAtivaEm: { type: Date },
    // Cobrança negociada (draft order + invoice)
    shopifyDraftOrderId: { type: String },
    invoiceUrl: { type: String },
    valorNegociado: { type: Number },
    cobrancaEnviadaEm: { type: Date },
    observacoes: { type: String },
  },
  { timestamps: true },
);

export type CompanyRaw = InferSchemaType<typeof companySchema>;
export type CompanyDoc = HydratedDocument<CompanyRaw>;
export const Company: Model<CompanyRaw> =
  (mongoose.models.Company as Model<CompanyRaw>) ?? mongoose.model<CompanyRaw>('Company', companySchema);

/* --------------------------------------------------------------------- User */

const userSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senhaHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    ativo: { type: Boolean, default: true },
    // Perfil do candidato (pré-preenche as próximas candidaturas)
    perfil: {
      telefone: String,
      endereco: String,
      idade: Number,
      linkedin: String,
      curriculoUrl: String,
      curriculoNome: String,
      setoresInteresse: [String],
      preferenciaTipo: String,
      modeloPreferido: String,
      pretensaoSalarial: Number,
      localidadePreferencia: String,
    },
  },
  { timestamps: true },
);

export type UserRaw = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<UserRaw>;
export const User: Model<UserRaw> =
  (mongoose.models.User as Model<UserRaw>) ?? mongoose.model<UserRaw>('User', userSchema);

/* ---------------------------------------------------------------------- Job */

const jobSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true },
    setor: { type: String, required: true, trim: true, index: true },
    cidade: { type: String, required: true, trim: true },
    uf: { type: String, required: true, trim: true, uppercase: true, index: true },
    modelo: { type: String, enum: MODELOS, required: true, index: true },
    tipo: { type: String, enum: TIPOS, required: true, index: true },
    // Opcionais: vaga sem valor definido é exibida como "A combinar".
    salarioMin: { type: Number },
    salarioMax: { type: Number },
    descricao: { type: String, required: true },
    requisitos: { type: [String], default: [] },
    ativa: { type: Boolean, default: true, index: true },
    publicadaEm: { type: Date, default: () => new Date(), index: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
  },
  { timestamps: true },
);

export type JobRaw = InferSchemaType<typeof jobSchema>;
export type JobDoc = HydratedDocument<JobRaw>;
export const Job: Model<JobRaw> =
  (mongoose.models.Job as Model<JobRaw>) ?? mongoose.model<JobRaw>('Job', jobSchema);

/* -------------------------------------------------------------- Application */

const applicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: APPLICATION_STATUS, default: 'Em análise', index: true },
    aderencia: { type: Number, min: 0, max: 100 },
    // Snapshot dos dados no momento da candidatura
    snapshot: {
      nome: String,
      email: String,
      telefone: String,
      endereco: String,
      idade: Number,
      linkedin: String,
      curriculoUrl: String,
      curriculoNome: String,
      setoresInteresse: [String],
      preferenciaTipo: String,
      modeloPreferido: String,
      pretensaoSalarial: Number,
      localidadePreferencia: String,
    },
  },
  { timestamps: true },
);
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export type ApplicationRaw = InferSchemaType<typeof applicationSchema>;
export type ApplicationDoc = HydratedDocument<ApplicationRaw>;
export const Application: Model<ApplicationRaw> =
  (mongoose.models.Application as Model<ApplicationRaw>) ?? mongoose.model<ApplicationRaw>('Application', applicationSchema);

/* -------------------------------------------------------------- Testimonial */

const testimonialSchema = new Schema(
  {
    nome: { type: String, required: true },
    cargo: { type: String, required: true },
    fonte: { type: String, required: true },
    texto: { type: String, required: true },
    ordem: { type: Number, default: 0 },
    publicado: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type TestimonialRaw = InferSchemaType<typeof testimonialSchema>;
export type TestimonialDoc = HydratedDocument<TestimonialRaw>;
export const Testimonial: Model<TestimonialRaw> =
  (mongoose.models.Testimonial as Model<TestimonialRaw>) ?? mongoose.model<TestimonialRaw>('Testimonial', testimonialSchema);

/* ----------------------------------------------------------- ContactMessage */

const contactSchema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    telefone: String,
    mensagem: { type: String, required: true },
    lida: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export type ContactMessageRaw = InferSchemaType<typeof contactSchema>;
export type ContactMessageDoc = HydratedDocument<ContactMessageRaw>;
export const ContactMessage: Model<ContactMessageRaw> =
  (mongoose.models.ContactMessage as Model<ContactMessageRaw>) ?? mongoose.model<ContactMessageRaw>('ContactMessage', contactSchema);
