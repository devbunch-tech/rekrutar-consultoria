import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { hashPassword } from './auth.js';
import {
  Application,
  Company,
  ContactMessage,
  Job,
  MODELOS,
  TIPOS,
  Testimonial,
  User,
} from './models/index.js';

const dias = (n: number) => new Date(Date.now() - n * 86_400_000);

const EMPRESAS = [
  {
    key: 'engeplus',
    razaoSocial: 'Engeplus Tecnologia LTDA',
    nomeFantasia: 'Engeplus Tecnologia',
    cnpj: '12.345.678/0001-90',
    responsavel: 'Ricardo Alves',
    telefone: '(48) 3433-1100',
    email: 'rh@engeplus.com.br',
    endereco: 'Av. Centenário, 1200 — Centro',
    localidade: 'Criciúma - SC',
    status: 'ativo' as const,
    shopifySubscriptionActive: true,
    assinaturaAtivaEm: dias(60),
  },
  {
    key: 'cedro',
    razaoSocial: 'Grupo Cedro Industrial S.A.',
    nomeFantasia: 'Grupo Cedro Industrial',
    cnpj: '23.456.789/0001-01',
    responsavel: 'Helena Prado',
    telefone: '(48) 3462-2200',
    email: 'pessoas@grupocedro.com.br',
    endereco: 'Rod. Gov. Jorge Lacerda, km 12',
    localidade: 'Içara - SC',
    status: 'ativo' as const,
    shopifySubscriptionActive: true,
    assinaturaAtivaEm: dias(120),
  },
  {
    key: 'sultrade',
    razaoSocial: 'Sul Trade Comércio Exterior LTDA',
    nomeFantasia: 'Sul Trade Comex',
    cnpj: '34.567.890/0001-12',
    responsavel: 'Mateus Borges',
    telefone: '(47) 3348-4400',
    email: 'rh@sultrade.com.br',
    endereco: 'R. Blumenau, 340 — Centro',
    localidade: 'Itajaí - SC',
    status: 'ativo' as const,
    shopifySubscriptionActive: true,
    assinaturaAtivaEm: dias(45),
  },
  {
    key: 'nexa',
    razaoSocial: 'Nexa Produto Digital LTDA',
    nomeFantasia: 'Nexa Produto Digital',
    cnpj: '45.678.901/0001-23',
    responsavel: 'Aline Tavares',
    telefone: '(11) 4002-8922',
    email: 'talentos@nexa.digital',
    endereco: 'Av. Paulista, 1000 — Bela Vista',
    localidade: 'São Paulo - SP',
    status: 'ativo' as const,
    shopifySubscriptionActive: true,
    assinaturaAtivaEm: dias(30),
  },
  {
    key: 'redevale',
    razaoSocial: 'Rede Vale Sul Comércio LTDA',
    nomeFantasia: 'Rede Vale Sul',
    cnpj: '56.789.012/0001-34',
    responsavel: 'Paulo Kremer',
    telefone: '(48) 3622-5500',
    email: 'rh@redevalesul.com.br',
    endereco: 'R. Lauro Müller, 780 — Centro',
    localidade: 'Tubarão - SC',
    status: 'ativo' as const,
    shopifySubscriptionActive: true,
    assinaturaAtivaEm: dias(15),
  },
  {
    key: 'lead',
    razaoSocial: 'Metalúrgica Santa Luzia LTDA',
    nomeFantasia: 'Metalúrgica Santa Luzia',
    cnpj: '67.890.123/0001-45',
    responsavel: 'Sandra Vieira',
    telefone: '(48) 99911-2233',
    email: 'sandra@santaluzia.ind.br',
    endereco: 'R. dos Imigrantes, 55 — Distrito Industrial',
    localidade: 'Criciúma - SC',
    status: 'novo' as const,
    shopifySubscriptionActive: false,
  },
];

/** Usada em toda vaga que ainda não teve o texto próprio redigido. */
const DESCRICAO_PADRAO = 'Detalhes da vaga informados durante o processo seletivo.';

/**
 * `salario` ausente publica a vaga como "A combinar"; quando presente, vira um
 * valor único (salarioMin === salarioMax). Sem empresa vinculada.
 */
const VAGAS: Array<{
  titulo: string;
  setor: string;
  cidade: string;
  uf: string;
  modelo: (typeof MODELOS)[number];
  tipo: (typeof TIPOS)[number];
  salario?: number;
  descricao?: string;
  publicadaEm: Date;
}> = [
  { titulo: 'Executivo(a) de Vendas PR - Equipamentos Industriais', setor: 'Comercial', cidade: 'Cascavel', uf: 'PR', modelo: '100% Presencial', tipo: 'CLT', publicadaEm: dias(1) },
  { titulo: 'Analista de RH e DP Confecção', setor: 'RH', cidade: 'Criciúma', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', publicadaEm: dias(2) },
  { titulo: 'Expedidor(a) Confecção', setor: 'Logística', cidade: 'Criciúma', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', salario: 3500, publicadaEm: dias(2) },
  { titulo: 'Inspetor(a) de Qualidade Externo', setor: 'Qualidade', cidade: 'Criciúma', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', salario: 3500, publicadaEm: dias(3) },
  { titulo: 'Inspetor(a) de Qualidade - Confecção', setor: 'Qualidade', cidade: 'Criciúma', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', salario: 3500, publicadaEm: dias(3) },
  { titulo: 'Almoxarife', setor: 'Logística', cidade: 'Criciúma', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', salario: 3000, publicadaEm: dias(4) },
  { titulo: 'Representante Comercial Alimentos | Blumenau', setor: 'Comercial', cidade: 'Blumenau', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', publicadaEm: dias(5) },
  { titulo: 'Executivo Comercial Externo Alimentos | Chapecó', setor: 'Comercial', cidade: 'Chapecó', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', publicadaEm: dias(5) },
  { titulo: 'Representante Comercial Alimentos | Brusque', setor: 'Comercial', cidade: 'Brusque', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', publicadaEm: dias(6) },
  { titulo: 'Gerente Administrativo Financeiro – Unidade Fabril', setor: 'Financeiro', cidade: 'Criciúma', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', salario: 8000, publicadaEm: dias(7) },
  { titulo: 'Analista de RH Generalista', setor: 'RH', cidade: 'Criciúma', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', publicadaEm: dias(8) },
  { titulo: 'Gerente Geral Administrativo Financeiro', setor: 'Financeiro', cidade: 'Criciúma', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', salario: 12000, publicadaEm: dias(9) },
  { titulo: 'Vendedora – Loja de Cosméticos e Beleza', setor: 'Varejo', cidade: 'Criciúma', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', salario: 3000, publicadaEm: dias(10) },
  { titulo: 'Engenheiro(a) Civil – Projetos Hidrossanitários', setor: 'Engenharia', cidade: 'Chapecó', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', salario: 5000, publicadaEm: dias(11) },
  { titulo: 'Encarregado de Usinagem e Operações CNC', setor: 'Indústria', cidade: 'Criciúma', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', publicadaEm: dias(12) },
  { titulo: 'Expedidor / Expedidora', setor: 'Logística', cidade: 'Morro da Fumaça', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', salario: 3500, publicadaEm: dias(13) },
  { titulo: 'Gerente de Negócios | Gerente de Desenvolvimento de Negócios – BDM', setor: 'Comercial', cidade: 'Curitiba', uf: 'PR', modelo: 'Híbrido', tipo: 'CLT', salario: 10000, publicadaEm: dias(14) },
  { titulo: 'Representante Comercial PJ | Curitibanos SC', setor: 'Comercial', cidade: 'Curitibanos', uf: 'SC', modelo: '100% Presencial', tipo: 'PJ', publicadaEm: dias(15) },
  { titulo: 'Representante Comercial PJ – Soluções Industriais RS', setor: 'Comercial', cidade: 'Caxias do Sul', uf: 'RS', modelo: '100% Presencial', tipo: 'PJ', publicadaEm: dias(16) },
  { titulo: 'Representante Comercial PJ – Soluções Industriais SP', setor: 'Comercial', cidade: 'São Paulo', uf: 'SP', modelo: '100% Presencial', tipo: 'PJ', publicadaEm: dias(17) },
  { titulo: 'Consultor(a) Comercial Externo | Metalmecânico GO', setor: 'Comercial', cidade: 'Goiânia', uf: 'GO', modelo: '100% Presencial', tipo: 'CLT', salario: 5000, publicadaEm: dias(18) },
  { titulo: 'Consultor(a) Comercial Externo | Máquina Industrial', setor: 'Comercial', cidade: 'Caxias do Sul', uf: 'RS', modelo: '100% Presencial', tipo: 'CLT', publicadaEm: dias(19) },
  { titulo: 'Representante Comercial Alimentos | Chapecó', setor: 'Comercial', cidade: 'Chapecó', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', publicadaEm: dias(20) },
  { titulo: 'Representante Comercial Alimentos | Florianópolis', setor: 'Comercial', cidade: 'Florianópolis', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', publicadaEm: dias(21) },
  { titulo: 'Desenvolvedor Sênior PHP', setor: 'TI', cidade: 'Criciúma', uf: 'SC', modelo: '100% Presencial', tipo: 'CLT', publicadaEm: dias(22) },
  {
    titulo: 'Banco de Talentos',
    setor: 'RH',
    cidade: 'Criciúma',
    uf: 'SC',
    modelo: '100% Presencial',
    tipo: 'CLT',
    descricao: 'Oportunidade para cadastro permanente para futuras oportunidades na unidade.',
    publicadaEm: dias(23),
  },
];

const DEPOIMENTOS = [
  {
    nome: 'Renato Garcia Campos',
    cargo: 'Diretor Administrativo e Financeiro | Sócio',
    fonte: 'LinkedIn',
    ordem: 1,
    texto:
      'Participei de um processo seletivo gerenciado pela Rekrutar e me senti valorizado como profissional. Em todas as etapas tive um feedback, inclusive no final. Todo o processo foi rápido, prático e objetivo. Recomendo a contratação dessa empresa e do profissional Alexandre.',
  },
  {
    nome: 'Mateus Borges',
    cargo: 'Empresa cliente — contratação de Analista de Drawback',
    fonte: 'WhatsApp',
    ordem: 2,
    texto: 'Fernando é bem proativo. Está sendo uma ótima contratação. Está tudo certo!',
  },
  {
    nome: 'Angelica Maria',
    cargo: 'Gerente de negócios',
    fonte: 'LinkedIn',
    ordem: 3,
    texto:
      'Tive o prazer de trabalhar com o recrutador e diretor da Rekrutar Seleção Estratégica, é um excelente profissional. Excelente mentoria!',
  },
];

const CANDIDATOS = [
  { nome: 'Fernanda Souza', email: 'fernanda.souza@email.com', cidade: 'Criciúma - SC' },
  { nome: 'João Pedro Martins', email: 'joao.martins@email.com', cidade: 'Içara - SC' },
  { nome: 'Lucas Andrade', email: 'lucas.andrade@email.com', cidade: 'Tubarão - SC' },
  { nome: 'Marina Costa', email: 'marina.costa@email.com', cidade: 'Criciúma - SC' },
  { nome: 'Rafael Nunes', email: 'rafael.nunes@email.com', cidade: 'Florianópolis - SC' },
  { nome: 'Bianca Rocha', email: 'bianca.rocha@email.com', cidade: 'Curitiba - PR' },
  { nome: 'Diego Ferreira', email: 'diego.ferreira@email.com', cidade: 'Criciúma - SC' },
  { nome: 'Carlos Eduardo Lima', email: 'carlos.lima@email.com', cidade: 'Criciúma - SC' },
  { nome: 'Patrícia Mendes', email: 'patricia.mendes@email.com', cidade: 'Florianópolis - SC' },
  { nome: 'Camila Ferreira', email: 'camila@email.com', cidade: 'Criciúma - SC' },
];

export const SENHA_DEMO = 'rekrutar123';

export async function seed({ silent = false } = {}): Promise<void> {
  const log = (msg: string) => {
    if (!silent) console.log(msg);
  };

  await Promise.all([
    Application.deleteMany({}),
    Job.deleteMany({}),
    User.deleteMany({}),
    Company.deleteMany({}),
    Testimonial.deleteMany({}),
    ContactMessage.deleteMany({}),
  ]);

  const senhaHash = await hashPassword(SENHA_DEMO);

  const companyByKey = new Map<string, mongoose.Types.ObjectId>();
  for (const { key, ...data } of EMPRESAS) {
    const doc = await Company.create(data);
    companyByKey.set(key, doc._id);
  }
  log(`✔ ${EMPRESAS.length} empresas`);

  for (const { salario, descricao, ...data } of VAGAS) {
    await Job.create({
      ...data,
      ativa: true,
      // Valor único quando informado; ausente publica como "A combinar".
      salarioMin: salario,
      salarioMax: salario,
      descricao: descricao ?? DESCRICAO_PADRAO,
      requisitos: [],
    });
  }
  log(`✔ ${VAGAS.length} vagas`);

  await Testimonial.insertMany(DEPOIMENTOS.map((d) => ({ ...d, publicado: true })));
  log(`✔ ${DEPOIMENTOS.length} depoimentos`);

  // Admin master
  await User.create({
    nome: 'Alexandre Coelho',
    email: 'admin@rekrutar.com.br',
    senhaHash,
    role: 'admin',
  });

  // Um acesso de empresa por parceira ativa
  for (const e of EMPRESAS.filter((x) => x.status === 'ativo')) {
    await User.create({
      nome: e.responsavel,
      email: e.email,
      senhaHash,
      role: 'empresa',
      company: companyByKey.get(e.key),
    });
  }

  for (const c of CANDIDATOS) {
    await User.create({
      nome: c.nome,
      email: c.email,
      senhaHash,
      role: 'candidato',
      perfil: {
        telefone: '(48) 99999-0000',
        endereco: c.cidade,
        idade: 28,
        setoresInteresse: ['TI'],
        preferenciaTipo: 'CLT',
        modeloPreferido: 'Híbrido',
        pretensaoSalarial: 4500,
        localidadePreferencia: 'SC',
      },
    });
  }
  log(`✔ ${CANDIDATOS.length + EMPRESAS.filter((e) => e.status === 'ativo').length + 1} usuários`);

  await ContactMessage.create({
    nome: 'Joana Ribeiro',
    email: 'joana@empresa.com.br',
    telefone: '(48) 98888-1122',
    mensagem: 'Gostaria de entender melhor como funciona o processo de parceria da Rekrutar.',
  });
}

// Execução direta: npm run seed
const isDirectRun = process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js');
if (isDirectRun) {
  const { uri } = await connectDB();
  console.log(`Semeando ${uri}…`);
  await seed();
  console.log('\nContas de demonstração (senha: %s)', SENHA_DEMO);
  console.log('  admin     → admin@rekrutar.com.br');
  console.log('  empresa   → rh@engeplus.com.br');
  console.log('  candidato → camila@email.com');
  await mongoose.disconnect();
  process.exit(0);
}
