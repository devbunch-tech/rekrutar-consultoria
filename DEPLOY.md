# Deploy — Rekrutar Consultoria

Objetivo: colocar o projeto no ar **sem nenhum custo além da Shopify**.

## Arquitetura

| Peça | Onde | Custo |
|---|---|---|
| Portal (`apps/web`) | Cloudflare Pages | R$ 0 |
| Admin (`apps/admin`) | Cloudflare Pages | R$ 0 |
| API (`apps/api`) | Render — plano free | R$ 0 |
| MongoDB | Atlas M0 (512 MB) | R$ 0 |
| Currículos | GridFS, dentro do próprio Mongo | R$ 0 |
| Checkout | Shopify (loja já existente) | plano Shopify |

Nenhum serviço novo é cobrado. O único custo é o plano Shopify que o cliente
já vai assinar quando a loja `rekrutar-consultoria-a7rjikag` for transferida.

## Por que a API não vai para o Oxygen/Hydrogen

O Oxygen roda em runtime de workers: sem socket TCP (o Mongoose não conecta) e
sem filesystem. A API é Express + Mongoose, então precisa de um host Node real.
O Hydrogen continua disponível caso um dia se queira SSR do site público.

## Passo a passo

### 1. MongoDB Atlas (M0)
1. Criar conta em atlas.mongodb.com → cluster **M0** (free forever).
2. Database Access: criar usuário e senha.
3. Network Access: liberar `0.0.0.0/0` (o Render não tem IP fixo no free).
4. Copiar a connection string → será o `MONGODB_URI`.
5. Popular os dados: `MONGODB_URI="<string>" npm run seed`

### 2. API no Render
1. New → Web Service → conectar este repositório.
2. O [`render.yaml`](render.yaml) já define build, start e health check.
3. Preencher no painel as variáveis marcadas `sync: false`.
4. Anotar a URL final (ex.: `https://rekrutar-api.onrender.com`).

> **Atenção:** no free tier o serviço hiberna após 15 min sem tráfego e a
> primeira visita depois disso espera ~1 min. Para uma vitrine de vagas isso é
> ruim. Duas saídas: um ping externo a cada 10 min (as 750 h/mês do free cobrem
> um serviço ligado o mês inteiro), ou o plano Starter a US$ 7/mês.

### 3. Front-ends no Cloudflare Pages
Dois projetos apontando para o mesmo repositório:

| | Portal | Admin |
|---|---|---|
| Build command | `npm ci && npm run build --workspace @rekrutar/web` | `npm ci && npm run build --workspace @rekrutar/admin` |
| Output directory | `apps/web/dist` | `apps/admin/dist` |

Variáveis de build (as duas usam `VITE_`, embutidas no bundle):
```
VITE_GRAPHQL_URL=https://<api>.onrender.com/graphql
VITE_API_URL=https://<api>.onrender.com
```
Mais `VITE_ADMIN_URL` no portal e `VITE_PORTAL_URL` no admin.

O `public/_redirects` já está no repo — sem ele, dar refresh em `/vagas` dá 404.

Depois de publicar, voltar ao Render e ajustar `CORS_ORIGINS` com os dois
domínios finais, separados por vírgula.

### 4. Shopify
1. Webhook: Settings → Notifications → Webhooks → evento **Order payment**,
   URL `https://<api>.onrender.com/api/shopify/webhook`.
2. Copiar o signing secret para `SHOPIFY_WEBHOOK_SECRET` no Render.
   Sem ele o HMAC não é validado — ver [`shopify.ts`](apps/api/src/shopify.ts).
3. `SHOPIFY_STORE_DOMAIN=rekrutar-consultoria-a7rjikag.myshopify.com`

## Checkout negociado (implementado)

O valor é combinado caso a caso, então não há preço fixo. O fluxo é:

1. Empresa envia a intenção no portal → `Company` com status **novo**.
   O portal **não** mostra mais link de pagamento — só avisa que a equipe
   entrará em contato.
2. Proprietário negocia → status **em_contato**.
3. No admin, em *Empresas*, botão **Gerar cobrança**: digita o valor combinado.
   A API cria uma *draft order* na Shopify com item personalizado e dispara o
   invoice por e-mail → status **checkout_enviado**.
4. Empresa paga → webhook `orders/paid` → status **ativo** e acesso criado.

### O que configurar na Shopify

Criar um **app customizado** na loja (Settings → Apps → Develop apps) com o
escopo **`write_draft_orders`** e copiar o Admin API access token (`shpat_…`)
para `SHOPIFY_ADMIN_TOKEN`.

Sem esse token o botão não aparece no admin e a ativação manual continua
disponível como saída.

### Uma ressalva honesta

A Shopify não documenta que os `customAttributes` da draft order chegam como
`note_attributes` do pedido final — e é por ali que o webhook liga o pagamento
à empresa. Por isso o matching em [`shopify.ts`](apps/api/src/shopify.ts) tem
três estratégias em cascata: `empresa_id`, CNPJ e, por último, e-mail — este
restrito a empresas com cobrança pendente e ainda sem assinatura ativa, para
que uma compra avulsa na loja não ative uma parceria por engano.

**Vale confirmar no primeiro pagamento real** qual estratégia casou: se o log
mostrar `casada por e-mail`, os atributos não propagaram e o fallback está
carregando o fluxo.

## Resto do permalink antigo

`shopifyCheckout` e `PartnerLeadResult.checkout` continuam no schema da API
(preço fixo via `SHOPIFY_SUBSCRIPTION_VARIANT_ID`), mas nenhum front-end os
consome mais. Ficaram para não quebrar integrações; podem ser removidos.
