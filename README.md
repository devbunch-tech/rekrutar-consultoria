# Portal Rekrutar Consultoria

Portal institucional + portal de vagas da **Rekrutar Consultoria**, implementado fielmente a partir do
handoff em [design_handoff_portal_rekrutar/](design_handoff_portal_rekrutar/).

**Stack:** React 18 + TypeScript · GraphQL (Apollo Server 5) · MongoDB (Mongoose) · Vite.

## Estrutura

```
apps/
  api/      API GraphQL + Mongo + JWT + upload de currículo + webhook Shopify   (porta 4002)
  web/      Portal público — Home, Sobre, Vagas, Divulgar, Contato, Login, Painéis  (porta 5173)
  admin/    Ambiente administrativo — CRUD de vagas, funil, empresas, usuários    (porta 5174)
packages/
  tokens/   Design tokens do handoff (cores, radius, tipografia) + CSS base compartilhado
```

Web e admin são apps Vite independentes com a mesma configuração (React + TS + Apollo + tokens),
consumindo a mesma API. Sessões separadas (`rk_token` × `rk_admin_token`).

> As portas 4000 e 27017 já estavam ocupadas por outros projetos nesta máquina — por isso a API roda
> em **4002** e o Mongo em **27022**. Para mudar, edite `apps/*/.env` e o `docker-compose.yml`.

## Rodando em localhost

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env

npm run mongo:up      # sobe o MongoDB em Docker (porta 27022)
npm run seed          # popula vagas, empresas, candidatos, depoimentos
npm run dev           # sobe api + web + admin juntos
```

- Portal: http://localhost:5173
- Admin: http://localhost:5174
- GraphQL: http://localhost:4002/graphql

**Sem Docker:** deixe `MONGODB_URI` vazio no `.env` da API — ela sobe um MongoDB em memória e semeia
os dados automaticamente a cada boot.

### Contas de demonstração (senha `rekrutar123`)

| Perfil | E-mail |
|---|---|
| Admin master | `admin@rekrutar.com.br` |
| Empresa | `rh@engeplus.com.br` |
| Candidato | `camila@email.com` |

Contas de candidato também são criadas automaticamente na primeira candidatura, como no protótipo.

## Modelo de dados

`User` (candidato/empresa/admin + perfil do candidato) · `Company` (parceira + status da assinatura
Shopify) · `Job` · `Application` (candidato × vaga + snapshot dos dados no envio) · `Testimonial` ·
`ContactMessage`.

Regras de acesso no resolver: candidato vê só o que é dele, empresa só as próprias vagas e
candidatos, admin vê tudo.

## Integração Shopify (assinatura de parceria)

Fluxo implementado:

1. A empresa preenche **Quero Divulgar** → `enviarIntencaoParceria` cria a `Company` com status
   `novo` e devolve um **permalink de checkout** com o id da empresa embutido:
   `https://{loja}/cart/{variantId}:1?selling_plan={id}&attributes[empresa_id]=...`
2. A empresa assina no checkout Shopify.
3. A Shopify chama `POST /api/shopify/webhook` (evento **Order payment**), o HMAC é validado, a
   `Company` passa a `ativo` com `shopifySubscriptionActive: true` e um usuário de acesso ao painel
   da empresa é criado (a senha provisória sai no log da API).

Configure no `apps/api/.env`:

```
SHOPIFY_STORE_DOMAIN=sua-loja.myshopify.com
SHOPIFY_SUBSCRIPTION_VARIANT_ID=  # variante do plano de assinatura
SHOPIFY_SELLING_PLAN_ID=          # opcional, para assinatura recorrente
SHOPIFY_WEBHOOK_SECRET=           # segredo do webhook (sem ele, o HMAC não é validado — só dev)
```

Sem essas variáveis o portal segue funcionando: a intenção de parceria é registrada normalmente e o
admin ativa a assinatura manualmente em **Empresas & assinaturas**.

No Shopify Admin → *Settings → Notifications → Webhooks*, aponte **Order payment** para
`{PUBLIC_API_URL}/api/shopify/webhook`. Em desenvolvimento, exponha a API com um túnel
(`cloudflared`, `ngrok`) para a Shopify alcançar o localhost.

## Banner principal (hero)

[apps/web/src/components/Hero.tsx](apps/web/src/components/Hero.tsx) troca a arte pelo breakpoint —
só a imagem do breakpoint atual é baixada:

| Arquivo | Uso | Formato |
|---|---|---|
| `apps/web/public/hero-desktop.jpg` | ≥ 768px — full-bleed com a copy sobreposta à esquerda | 2200×1228 (16:9) |
| `apps/web/public/hero-mobile.jpg` | < 768px — imagem no topo + bloco navy com a copy | 1200×1200 (1:1) |

Para trocar a arte, substitua os arquivos mantendo as proporções. No desktop, deixe o lado esquerdo
livre: é onde entram título, CTAs e indicadores, sobre um scrim claro.

## Upload de currículo

O binário sobe por multipart em `POST /api/upload/curriculo` (PDF/DOC/DOCX, até 8 MB) e o GraphQL
recebe apenas a URL. Em produção, troque o `diskStorage` de [apps/api/src/uploads.ts](apps/api/src/uploads.ts)
por S3/R2 — o resto do fluxo não muda.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | api + web + admin em paralelo |
| `npm run seed` | recria a base com os dados do handoff |
| `npm run build` | build de produção dos três apps |
| `npm run typecheck` | `tsc --noEmit` em todos os workspaces |
| `npm run mongo:up` / `mongo:down` | sobe/derruba o MongoDB do Docker |

## Fidelidade ao handoff

Tokens, tipografia (Sora), espaçamentos, chips, bottom sheets, drawer, bottom nav mobile (< 768px),
toasts e copy vieram do handoff sem alteração. Os pontos que dependem do cliente seguem como slots
marcados: foto da equipe (Sobre) e fotos dos responsáveis (Contato).

Diferenças propositais em relação ao protótipo:

- Navegação por rotas reais (`/vagas`, `/painel`…) em vez de estado único — necessário para SEO e
  para o deep-link `?vaga=<id>` usado pelos painéis.
- Status do funil vem do backend (editável no admin), não mais atribuído ciclicamente.
- Autenticação real com JWT + bcrypt no lugar do login simulado por `localStorage`.
