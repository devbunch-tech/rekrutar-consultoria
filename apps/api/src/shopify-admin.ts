import { env } from './env.js';
import type { CompanyDoc } from './models/index.js';

/**
 * Cobrança negociada da parceria.
 *
 * O fechamento é manual: o proprietário combina o valor com a empresa e só
 * então emite a cobrança. Isso é uma *draft order* com item personalizado —
 * não um permalink de variante de preço fixo.
 *
 * Fluxo:
 *   1. Empresa manda a intenção pelo portal        → Company status "novo"
 *   2. Proprietário negocia                        → status "em_contato"
 *   3. Proprietário emite a cobrança (aqui)        → status "checkout_enviado"
 *   4. Empresa paga o invoice → webhook orders/paid → status "ativo"
 *
 * Exige um app customizado na loja com escopo `write_draft_orders`.
 * O token vai em SHOPIFY_ADMIN_TOKEN.
 */

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface UserError {
  field?: string[] | null;
  message: string;
}

async function adminGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const { storeDomain, adminToken, apiVersion } = env.shopify;
  if (!storeDomain || !adminToken) {
    throw new Error(
      'Shopify Admin API não configurada: defina SHOPIFY_STORE_DOMAIN e SHOPIFY_ADMIN_TOKEN.',
    );
  }

  const res = await fetch(`https://${storeDomain}/admin/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify Admin API respondeu ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Shopify Admin API: ${json.errors.map((e) => e.message).join('; ')}`);
  }
  if (!json.data) throw new Error('Shopify Admin API não retornou dados.');
  return json.data;
}

const DRAFT_ORDER_CREATE = `
  mutation criarCobranca($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder { id invoiceUrl totalPriceSet { shopMoney { amount currencyCode } } }
      userErrors { field message }
    }
  }
`;

const DRAFT_ORDER_INVOICE_SEND = `
  mutation enviarInvoice($id: ID!) {
    draftOrderInvoiceSend(id: $id) {
      draftOrder { id invoiceUrl }
      userErrors { field message }
    }
  }
`;

export interface CobrancaCriada {
  draftOrderId: string;
  invoiceUrl: string;
  enviadoPorEmail: boolean;
}

/**
 * Cria a draft order da parceria e, opcionalmente, dispara o e-mail de invoice.
 *
 * `empresa_id` vai em customAttributes para o webhook conseguir ligar o
 * pagamento à empresa certa. A propagação de customAttributes para
 * note_attributes do pedido final não é garantida pela documentação da
 * Shopify — por isso o webhook também casa por e-mail e por draft order id.
 */
export async function criarCobrancaParceria(opts: {
  company: CompanyDoc;
  valor: number;
  descricao?: string;
  enviarEmail: boolean;
}): Promise<CobrancaCriada> {
  const { company, valor, descricao, enviarEmail } = opts;

  if (!(valor > 0)) throw new Error('O valor da cobrança deve ser maior que zero.');
  if (!company.email) {
    throw new Error('A empresa não tem e-mail cadastrado — necessário para enviar o invoice.');
  }

  const data = await adminGraphQL<{
    draftOrderCreate: {
      draftOrder: { id: string; invoiceUrl: string | null } | null;
      userErrors: UserError[];
    };
  }>(DRAFT_ORDER_CREATE, {
    input: {
      email: company.email,
      note: `Parceria Rekrutar — ${company.razaoSocial} (CNPJ ${company.cnpj})`,
      tags: ['rekrutar-parceria'],
      customAttributes: [
        { key: 'empresa_id', value: String(company._id) },
        { key: 'cnpj', value: company.cnpj },
        { key: 'razao_social', value: company.razaoSocial },
      ],
      lineItems: [
        {
          title: descricao?.trim() || 'Parceria Rekrutar Consultoria',
          originalUnitPrice: valor.toFixed(2),
          quantity: 1,
          requiresShipping: false,
        },
      ],
    },
  });

  const erros = data.draftOrderCreate.userErrors;
  if (erros.length) {
    throw new Error(`Shopify recusou a cobrança: ${erros.map((e) => e.message).join('; ')}`);
  }

  const draft = data.draftOrderCreate.draftOrder;
  if (!draft) throw new Error('Shopify não retornou a draft order criada.');

  let invoiceUrl = draft.invoiceUrl ?? '';
  let enviadoPorEmail = false;

  if (enviarEmail) {
    const envio = await adminGraphQL<{
      draftOrderInvoiceSend: {
        draftOrder: { id: string; invoiceUrl: string | null } | null;
        userErrors: UserError[];
      };
    }>(DRAFT_ORDER_INVOICE_SEND, { id: draft.id });

    const errosEnvio = envio.draftOrderInvoiceSend.userErrors;
    if (errosEnvio.length) {
      // A cobrança existe; só o e-mail falhou. O link ainda serve.
      console.error(
        `[shopify] invoice criado mas não enviado: ${errosEnvio.map((e) => e.message).join('; ')}`,
      );
    } else {
      enviadoPorEmail = true;
      invoiceUrl = envio.draftOrderInvoiceSend.draftOrder?.invoiceUrl ?? invoiceUrl;
    }
  }

  return { draftOrderId: draft.id, invoiceUrl, enviadoPorEmail };
}

/** A Admin API está configurada? Usado para esconder a ação no admin. */
export function cobrancaConfigurada(): boolean {
  return Boolean(env.shopify.storeDomain && env.shopify.adminToken);
}
