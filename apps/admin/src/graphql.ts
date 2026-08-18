import { gql } from '@apollo/client';

export const ME = gql`
  query Me {
    me {
      id
      nome
      email
      role
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $senha: String!) {
    login(email: $email, senha: $senha, role: admin) {
      token
      user {
        id
        nome
        email
        role
      }
    }
  }
`;

export const DASHBOARD = gql`
  query AdminDashboard {
    adminDashboard {
      vagasAtivas
      candidatosNaBase
      empresasParceiras
      candidaturasNaSemana
      mensagensNaoLidas
      leadsNovos
      ultimasCandidaturas {
        id
        status
        createdAt
        job {
          id
          titulo
        }
        candidate {
          id
          nome
        }
      }
      empresas {
        totalVagas
        company {
          id
          razaoSocial
          nomeFantasia
          status
        }
      }
    }
  }
`;

export const ADMIN_JOBS = gql`
  query AdminJobs {
    jobs(filter: { apenasAtivas: false }) {
      id
      titulo
      setor
      cidade
      uf
      modelo
      tipo
      salarioMin
      salarioMax
      faixaSalarial
      descricao
      requisitos
      ativa
      publicadaLabel
      totalCandidaturas
      company {
        id
        razaoSocial
        nomeFantasia
      }
    }
    companies {
      id
      razaoSocial
      nomeFantasia
      status
    }
  }
`;

export const SALVAR_VAGA = gql`
  mutation CriarVaga($input: JobInput!) {
    criarVaga(input: $input) {
      id
    }
  }
`;

export const ATUALIZAR_VAGA = gql`
  mutation AtualizarVaga($id: ID!, $input: JobInput!) {
    atualizarVaga(id: $id, input: $input) {
      id
    }
  }
`;

export const ALTERNAR_VAGA = gql`
  mutation AlternarVaga($id: ID!, $ativa: Boolean!) {
    alternarVaga(id: $id, ativa: $ativa) {
      id
      ativa
    }
  }
`;

export const REMOVER_VAGA = gql`
  mutation RemoverVaga($id: ID!) {
    removerVaga(id: $id)
  }
`;

export const ADMIN_APPLICATIONS = gql`
  query AdminApplications($jobId: ID, $status: String) {
    applications(jobId: $jobId, status: $status) {
      id
      status
      aderencia
      createdAt
      job {
        id
        titulo
        localidade
      }
      candidate {
        id
        nome
        email
      }
      snapshot {
        nome
        email
        telefone
        endereco
        idade
        linkedin
        curriculoUrl
        curriculoNome
        setoresInteresse
        preferenciaTipo
        modeloPreferido
        pretensaoSalarial
        localidadePreferencia
      }
    }
    jobs(filter: { apenasAtivas: false }) {
      id
      titulo
    }
  }
`;

export const ATUALIZAR_STATUS = gql`
  mutation AtualizarStatus($id: ID!, $status: String!, $aderencia: Int) {
    atualizarStatusCandidatura(id: $id, status: $status, aderencia: $aderencia) {
      id
      status
      aderencia
    }
  }
`;

export const ADMIN_COMPANIES = gql`
  query AdminCompanies {
    companies {
      id
      razaoSocial
      nomeFantasia
      cnpj
      responsavel
      telefone
      email
      endereco
      localidade
      status
      shopifySubscriptionActive
      shopifyOrderId
      assinaturaAtivaEm
      totalVagas
      createdAt
    }
    shopifyCheckout {
      url
      configurado
    }
  }
`;

export const ATUALIZAR_EMPRESA = gql`
  mutation AtualizarEmpresa($id: ID!, $input: CompanyUpdateInput!) {
    atualizarEmpresa(id: $id, input: $input) {
      id
      status
    }
  }
`;

export const ATIVAR_ASSINATURA = gql`
  mutation AtivarAssinatura($id: ID!) {
    ativarAssinaturaEmpresa(id: $id) {
      id
      status
      shopifySubscriptionActive
    }
  }
`;

export const ADMIN_USERS = gql`
  query AdminUsers {
    users {
      id
      nome
      email
      role
      ativo
      createdAt
      totalCandidaturas
      company {
        id
        razaoSocial
      }
    }
    companies {
      id
      razaoSocial
      nomeFantasia
    }
  }
`;

export const CRIAR_USUARIO = gql`
  mutation CriarUsuario($input: UserInput!) {
    criarUsuario(input: $input) {
      id
    }
  }
`;

export const ALTERNAR_USUARIO = gql`
  mutation AlternarUsuario($id: ID!, $ativo: Boolean!) {
    alternarUsuario(id: $id, ativo: $ativo) {
      id
      ativo
    }
  }
`;

export const REMOVER_USUARIO = gql`
  mutation RemoverUsuario($id: ID!) {
    removerUsuario(id: $id)
  }
`;

export const ADMIN_MENSAGENS = gql`
  query AdminMensagens {
    contactMessages {
      id
      nome
      email
      telefone
      mensagem
      lida
      createdAt
    }
  }
`;

export const MARCAR_LIDA = gql`
  mutation MarcarLida($id: ID!, $lida: Boolean!) {
    marcarMensagemLida(id: $id, lida: $lida) {
      id
      lida
    }
  }
`;
