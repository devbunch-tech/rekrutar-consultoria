import { useMutation, useQuery } from '@apollo/client';
import { color, radius } from '@rekrutar/tokens';
import { ADMIN_COMPANIES, ATIVAR_ASSINATURA, ATUALIZAR_EMPRESA } from '../graphql';
import { PageTitle, PartnerChip, TableWrap, Vazio, botao, card, dataCurta, input, td, th } from '../ui';

const STATUS = ['novo', 'em_contato', 'checkout_enviado', 'ativo', 'recusado'];
const STATUS_LABEL: Record<string, string> = {
  novo: 'Novo lead',
  em_contato: 'Em contato',
  checkout_enviado: 'Checkout enviado',
  ativo: 'Assinatura ativa',
  recusado: 'Recusado',
};

interface CompanyRow {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string | null;
  cnpj: string;
  responsavel: string;
  telefone: string;
  email?: string | null;
  endereco: string;
  localidade: string;
  status: string;
  shopifySubscriptionActive: boolean;
  shopifyOrderId?: string | null;
  assinaturaAtivaEm?: string | null;
  totalVagas: number;
  createdAt: string;
}

interface Data {
  companies: CompanyRow[];
  shopifyCheckout: { url: string; configurado: boolean };
}

export function Empresas() {
  const { data, loading } = useQuery<Data>(ADMIN_COMPANIES);
  const [atualizar] = useMutation(ATUALIZAR_EMPRESA, {
    refetchQueries: ['AdminCompanies', 'AdminDashboard'],
  });
  const [ativar] = useMutation(ATIVAR_ASSINATURA, {
    refetchQueries: ['AdminCompanies', 'AdminDashboard'],
  });

  const checkout = data?.shopifyCheckout;

  return (
    <>
      <PageTitle titulo="Empresas & assinaturas" />

      <div
        style={{
          ...card,
          marginBottom: 16,
          background: checkout?.configurado ? color.blueLight : color.amberBg,
          border: 'none',
          fontSize: 13.5,
          lineHeight: 1.6,
          color: checkout?.configurado ? color.navy : color.amber,
        }}
      >
        {checkout?.configurado ? (
          <>
            <strong>Checkout Shopify configurado.</strong> Cada intenção de parceria recebe um link
            de assinatura com o id da empresa embutido; o webhook <code>orders/paid</code> ativa a
            parceria automaticamente.
            <div style={{ marginTop: 6, fontSize: 12, wordBreak: 'break-all', color: color.textMuted }}>
              {checkout.url}
            </div>
          </>
        ) : (
          <>
            <strong>Checkout Shopify ainda não configurado.</strong> Defina{' '}
            <code>SHOPIFY_STORE_DOMAIN</code> e <code>SHOPIFY_SUBSCRIPTION_VARIANT_ID</code> no{' '}
            <code>.env</code> da API para gerar o link de assinatura. Enquanto isso, ative as
            parcerias manualmente aqui.
          </>
        )}
      </div>

      {loading && !data ? (
        <Vazio>Carregando empresas…</Vazio>
      ) : (data?.companies.length ?? 0) === 0 ? (
        <Vazio>Nenhuma empresa cadastrada — os leads do formulário “Quero Divulgar” aparecem aqui.</Vazio>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <th style={th}>Empresa</th>
              <th style={th}>Responsável</th>
              <th style={th}>Local</th>
              <th style={th}>Vagas</th>
              <th style={th}>Assinatura</th>
              <th style={th}>Status</th>
              <th style={th} />
            </tr>
          </thead>
          <tbody>
            {data?.companies.map((c) => (
              <tr key={c.id}>
                <td style={td}>
                  <div style={{ fontWeight: 700, color: color.navy }}>
                    {c.nomeFantasia ?? c.razaoSocial}
                  </div>
                  <div style={{ fontSize: 11.5, color: color.textFaint }}>
                    {c.cnpj} · lead de {dataCurta(c.createdAt)}
                  </div>
                </td>
                <td style={td}>
                  <div>{c.responsavel}</div>
                  <div style={{ fontSize: 11.5, color: color.textFaint }}>
                    {c.telefone}
                    {c.email ? ` · ${c.email}` : ''}
                  </div>
                </td>
                <td style={td}>{c.localidade}</td>
                <td style={td}>{c.totalVagas}</td>
                <td style={td}>
                  {c.shopifySubscriptionActive ? (
                    <span style={{ color: color.green, fontWeight: 700, fontSize: 12.5 }}>
                      Ativa
                      {c.assinaturaAtivaEm ? ` · ${dataCurta(c.assinaturaAtivaEm)}` : ''}
                      {c.shopifyOrderId ? (
                        <div style={{ fontSize: 11, color: color.textFaint, fontWeight: 400 }}>
                          pedido {c.shopifyOrderId}
                        </div>
                      ) : null}
                    </span>
                  ) : (
                    <span style={{ color: color.textFaintAlt, fontSize: 12.5 }}>—</span>
                  )}
                </td>
                <td style={td}>
                  <select
                    value={c.status}
                    onChange={(e) =>
                      atualizar({ variables: { id: c.id, input: { status: e.target.value } } })
                    }
                    style={{
                      ...input,
                      width: 'auto',
                      minWidth: 150,
                      padding: '7px 10px',
                      fontSize: 12.5,
                      borderRadius: radius.control,
                    }}
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <div style={{ marginTop: 6 }}>
                    <PartnerChip status={c.status} />
                  </div>
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {!c.shopifySubscriptionActive && (
                    <button
                      onClick={() => {
                        if (confirm(`Ativar a assinatura de ${c.nomeFantasia ?? c.razaoSocial} manualmente?`)) {
                          void ativar({ variables: { id: c.id } });
                        }
                      }}
                      style={{ ...botao('neutro'), padding: '7px 12px', fontSize: 12.5 }}
                    >
                      Ativar manualmente
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
