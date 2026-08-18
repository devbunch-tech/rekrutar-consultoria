export const typeDefs = /* GraphQL */ `
  scalar DateTime

  enum Role {
    candidato
    empresa
    admin
  }

  enum PartnerStatus {
    novo
    em_contato
    checkout_enviado
    ativo
    recusado
  }

  type CandidateProfile {
    telefone: String
    endereco: String
    idade: Int
    linkedin: String
    curriculoUrl: String
    curriculoNome: String
    setoresInteresse: [String!]!
    preferenciaTipo: String
    modeloPreferido: String
    pretensaoSalarial: Float
    localidadePreferencia: String
  }

  type User {
    id: ID!
    nome: String!
    email: String!
    role: Role!
    ativo: Boolean!
    company: Company
    perfil: CandidateProfile
    createdAt: DateTime!
    """
    Quantas candidaturas esta conta possui. Contas com histórico não podem ser
    excluídas — o admin deve bloqueá-las.
    """
    totalCandidaturas: Int!
  }

  type Company {
    id: ID!
    razaoSocial: String!
    nomeFantasia: String
    cnpj: String!
    responsavel: String!
    telefone: String!
    email: String
    endereco: String!
    localidade: String!
    status: PartnerStatus!
    shopifySubscriptionActive: Boolean!
    shopifyOrderId: String
    assinaturaAtivaEm: DateTime
    """Cobrança negociada: link do invoice da draft order."""
    invoiceUrl: String
    valorNegociado: Float
    cobrancaEnviadaEm: DateTime
    observacoes: String
    totalVagas: Int!
    createdAt: DateTime!
  }

  type Job {
    id: ID!
    titulo: String!
    setor: String!
    cidade: String!
    uf: String!
    localidade: String!
    modelo: String!
    tipo: String!
    """
    Nulos quando a remuneração é "A combinar".
    """
    salarioMin: Float
    salarioMax: Float
    """
    Rótulo pronto: "A combinar", "R$ 3.500" ou "R$ 3.500 – R$ 4.800".
    """
    faixaSalarial: String!
    descricao: String!
    requisitos: [String!]!
    ativa: Boolean!
    publicadaEm: DateTime!
    publicadaLabel: String!
    company: Company
    totalCandidaturas: Int!
    """
    True quando o candidato autenticado já se candidatou a esta vaga.
    """
    jaCandidatado: Boolean!
  }

  type ApplicationSnapshot {
    nome: String
    email: String
    telefone: String
    endereco: String
    idade: Int
    linkedin: String
    curriculoUrl: String
    curriculoNome: String
    setoresInteresse: [String!]!
    preferenciaTipo: String
    modeloPreferido: String
    pretensaoSalarial: Float
    localidadePreferencia: String
  }

  type Application {
    id: ID!
    job: Job!
    candidate: User!
    status: String!
    aderencia: Int
    snapshot: ApplicationSnapshot!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Testimonial {
    id: ID!
    nome: String!
    cargo: String!
    fonte: String!
    texto: String!
    ordem: Int!
    publicado: Boolean!
  }

  type ContactMessage {
    id: ID!
    nome: String!
    email: String!
    telefone: String
    mensagem: String!
    lida: Boolean!
    createdAt: DateTime!
  }

  type AuthResult {
    token: String!
    user: User!
  }

  type JobFacets {
    ufsComVagas: [String!]!
    ufsRestantes: [String!]!
    setoresComVagas: [String!]!
    setoresRestantes: [String!]!
    modelos: [String!]!
    tipos: [String!]!
  }

  type PortalStats {
    vagasAbertas: Int!
    posicoesFechadas: Int!
    empresasParceiras: Int!
    percentualFeedback: Int!
  }

  type CandidateDashboard {
    totalCandidaturas: Int!
    emAnalise: Int!
    entrevistas: Int!
    candidaturas: [Application!]!
  }

  type CompanyJobGroup {
    job: Job!
    total: Int!
    candidaturas: [Application!]!
  }

  type CompanyDashboard {
    vagasAtivas: Int!
    totalCandidatos: Int!
    entrevistasAgendadas: Int!
    propostasEmAndamento: Int!
    porVaga: [CompanyJobGroup!]!
  }

  type CompanyVagas {
    company: Company!
    totalVagas: Int!
  }

  type AdminDashboard {
    vagasAtivas: Int!
    candidatosNaBase: Int!
    empresasParceiras: Int!
    candidaturasNaSemana: Int!
    ultimasCandidaturas: [Application!]!
    empresas: [CompanyVagas!]!
    vagas: [Job!]!
    mensagensNaoLidas: Int!
    leadsNovos: Int!
  }

  type ShopifyCheckout {
    """
    URL de checkout da assinatura na Shopify (permalink /cart/{variantId}:1).
    """
    url: String!
    configurado: Boolean!
  }

  type CobrancaParceria {
    """Link do invoice da Shopify para a empresa pagar."""
    invoiceUrl: String!
    """O invoice foi disparado por e-mail para a empresa?"""
    enviadoPorEmail: Boolean!
    empresa: Company!
  }

  type PartnerLeadResult {
    company: Company!
    checkout: ShopifyCheckout!
  }

  input JobFilterInput {
    modelo: String
    tipo: String
    uf: String
    setor: String
    salarioMin: Float
    salarioMax: Float
    busca: String
    apenasAtivas: Boolean
    companyId: ID
  }

  input JobInput {
    titulo: String!
    setor: String!
    cidade: String!
    uf: String!
    modelo: String!
    tipo: String!
    """
    Omitidos para publicar a vaga como "A combinar".
    """
    salarioMin: Float
    salarioMax: Float
    descricao: String!
    requisitos: [String!]!
    ativa: Boolean
    companyId: ID
    publicadaEm: DateTime
  }

  input CandidateProfileInput {
    nome: String!
    email: String!
    telefone: String!
    endereco: String!
    idade: Int!
    linkedin: String
    curriculoUrl: String
    curriculoNome: String
    setoresInteresse: [String!]!
    preferenciaTipo: String!
    modeloPreferido: String!
    pretensaoSalarial: Float!
    localidadePreferencia: String!
  }

  input PartnerLeadInput {
    responsavel: String!
    cnpj: String!
    telefone: String!
    razaoSocial: String!
    endereco: String!
    localidade: String!
    email: String
  }

  input ContactInput {
    nome: String!
    email: String!
    telefone: String
    mensagem: String!
  }

  input CompanyUpdateInput {
    razaoSocial: String
    nomeFantasia: String
    cnpj: String
    responsavel: String
    telefone: String
    email: String
    endereco: String
    localidade: String
    status: PartnerStatus
    observacoes: String
  }

  input UserInput {
    nome: String!
    email: String!
    senha: String!
    role: Role!
    companyId: ID
  }

  type Query {
    me: User

    # Portal público
    jobs(filter: JobFilterInput): [Job!]!
    job(id: ID!): Job
    jobFacets: JobFacets!
    portalStats: PortalStats!
    testimonials: [Testimonial!]!
    setoresDisponiveis: [String!]!

    # Painéis
    minhasCandidaturas: [Application!]!
    candidateDashboard: CandidateDashboard!
    companyDashboard: CompanyDashboard!
    adminDashboard: AdminDashboard!

    # Admin
    companies(status: PartnerStatus): [Company!]!
    company(id: ID!): Company
    applications(jobId: ID, status: String): [Application!]!
    users(role: Role): [User!]!
    contactMessages(apenasNaoLidas: Boolean): [ContactMessage!]!
    shopifyCheckout: ShopifyCheckout!
    """A Admin API está configurada para emitir cobranças negociadas?"""
    cobrancaParceriaConfigurada: Boolean!
  }

  type Mutation {
    login(email: String!, senha: String!, role: Role!): AuthResult!
    registrarCandidato(nome: String!, email: String!, senha: String!): AuthResult!

    # Candidatura — cria a conta do candidato se ainda não existir
    candidatar(jobId: ID!, perfil: CandidateProfileInput!, senha: String): AuthResult!
    atualizarPerfil(perfil: CandidateProfileInput!): User!

    # Formulários públicos
    enviarIntencaoParceria(input: PartnerLeadInput!): PartnerLeadResult!
    enviarContato(input: ContactInput!): Boolean!

    # Admin — vagas
    criarVaga(input: JobInput!): Job!
    atualizarVaga(id: ID!, input: JobInput!): Job!
    alternarVaga(id: ID!, ativa: Boolean!): Job!
    removerVaga(id: ID!): Boolean!

    # Admin/empresa — candidaturas
    atualizarStatusCandidatura(id: ID!, status: String!, aderencia: Int): Application!

    # Admin — empresas
    atualizarEmpresa(id: ID!, input: CompanyUpdateInput!): Company!
    ativarAssinaturaEmpresa(id: ID!, shopifyOrderId: String): Company!
    """
    Emite a cobrança negociada da parceria: cria uma draft order na Shopify
    com o valor combinado e, se enviarEmail, dispara o invoice para a empresa.
    """
    gerarCobrancaParceria(
      id: ID!
      valor: Float!
      descricao: String
      enviarEmail: Boolean
    ): CobrancaParceria!
    removerEmpresa(id: ID!): Boolean!

    # Admin — usuários e conteúdo
    criarUsuario(input: UserInput!): User!
    alternarUsuario(id: ID!, ativo: Boolean!): User!
    """
    Exclui a conta definitivamente. Recusa a própria conta do admin logado e
    qualquer conta que já tenha candidaturas — nesses casos use alternarUsuario.
    """
    removerUsuario(id: ID!): Boolean!
    marcarMensagemLida(id: ID!, lida: Boolean!): ContactMessage!
    salvarDepoimento(
      id: ID
      nome: String!
      cargo: String!
      fonte: String!
      texto: String!
      ordem: Int
      publicado: Boolean
    ): Testimonial!
    removerDepoimento(id: ID!): Boolean!
  }
`;
