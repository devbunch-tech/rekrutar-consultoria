import { gql } from '@apollo/client';

export const JOB_FIELDS = gql`
  fragment JobFields on Job {
    id
    titulo
    setor
    cidade
    uf
    localidade
    modelo
    tipo
    salarioMin
    salarioMax
    faixaSalarial
    descricao
    requisitos
    publicadaLabel
    jaCandidatado
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      nome
      email
      role
      perfil {
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
  }
`;

export const HOME_DATA = gql`
  ${JOB_FIELDS}
  query HomeData {
    portalStats {
      vagasAbertas
      posicoesFechadas
      empresasParceiras
      percentualFeedback
    }
    jobs(filter: { apenasAtivas: true }) {
      ...JobFields
    }
    testimonials {
      id
      nome
      cargo
      fonte
      texto
    }
  }
`;

export const JOBS = gql`
  ${JOB_FIELDS}
  query Jobs($filter: JobFilterInput) {
    jobs(filter: $filter) {
      ...JobFields
    }
  }
`;

export const JOB_FACETS = gql`
  query JobFacets {
    jobFacets {
      ufsComVagas
      ufsRestantes
      setoresComVagas
      setoresRestantes
      modelos
      tipos
    }
    setoresDisponiveis
  }
`;

export const MINHAS_CANDIDATURAS = gql`
  ${JOB_FIELDS}
  query MinhasCandidaturas {
    minhasCandidaturas {
      id
      status
      createdAt
      job {
        ...JobFields
      }
    }
  }
`;

export const CANDIDATE_DASHBOARD = gql`
  ${JOB_FIELDS}
  query CandidateDashboard {
    candidateDashboard {
      totalCandidaturas
      emAnalise
      entrevistas
      candidaturas {
        id
        status
        createdAt
        job {
          ...JobFields
        }
      }
    }
  }
`;

export const COMPANY_DASHBOARD = gql`
  query CompanyDashboard {
    companyDashboard {
      vagasAtivas
      totalCandidatos
      entrevistasAgendadas
      propostasEmAndamento
      porVaga {
        total
        job {
          id
          titulo
        }
        candidaturas {
          id
          status
          aderencia
          snapshot {
            nome
            endereco
          }
        }
      }
    }
  }
`;

export const ADMIN_DASHBOARD = gql`
  query AdminDashboard {
    adminDashboard {
      vagasAtivas
      candidatosNaBase
      empresasParceiras
      candidaturasNaSemana
      ultimasCandidaturas {
        id
        status
        createdAt
        job {
          id
          titulo
        }
        snapshot {
          nome
        }
      }
      empresas {
        totalVagas
        company {
          id
          nomeFantasia
          razaoSocial
        }
      }
      vagas {
        id
        titulo
        localidade
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $senha: String!, $role: Role!) {
    login(email: $email, senha: $senha, role: $role) {
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

export const CANDIDATAR = gql`
  mutation Candidatar($jobId: ID!, $perfil: CandidateProfileInput!) {
    candidatar(jobId: $jobId, perfil: $perfil) {
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

export const ENVIAR_PARCERIA = gql`
  mutation EnviarParceria($input: PartnerLeadInput!) {
    enviarIntencaoParceria(input: $input) {
      company {
        id
        razaoSocial
      }
    }
  }
`;

export const ENVIAR_CONTATO = gql`
  mutation EnviarContato($input: ContactInput!) {
    enviarContato(input: $input)
  }
`;
