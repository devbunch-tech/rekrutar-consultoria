import crypto from 'node:crypto';
import { Router, raw } from 'express';
import { env } from './env.js';
import { Company, User } from './models/index.js';
import { hashPassword } from './auth.js';

/**
 * Webhook Shopify `orders/paid`.
 *
 * Fluxo da parceria:
 *   1. Empresa preenche a intenção de parceria no portal  → cria Company (status "novo")
 *      e devolve o permalink de checkout com attributes[empresa_id].
 *   2. Empresa assina no checkout Shopify.
 *   3. Shopify chama este endpoint → a Company vira "ativo" e ganha um usuário
 *      de acesso ao painel da empresa.
 *
 * Configure em Shopify Admin → Settings → Notifications → Webhooks:
 *   URL: {PUBLIC_API_URL}/api/shopify/webhook   Evento: Order payment
 */
export const shopifyRouter: Router = Router();

function validHmac(rawBody: Buffer, hmacHeader?: string): boolean {
  if (!env.shopify.webhookSecret) return true; // dev: sem segredo configurado, não valida
  if (!hmacHeader) return false;
  const digest = crypto
    .createHmac('sha256', env.shopify.webhookSecret)
    .update(rawBody)
    .digest('base64');
  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

interface ShopifyOrder {
  id?: number | string;
  email?: string;
  customer?: { id?: number | string; first_name?: string; last_name?: string };
  note_attributes?: Array<{ name: string; value: string }>;
}

shopifyRouter.post(
  '/api/shopify/webhook',
  raw({ type: 'application/json' }),
  async (req, res) => {
    const rawBody = req.body as Buffer;
    if (!validHmac(rawBody, req.get('X-Shopify-Hmac-Sha256') ?? undefined)) {
      res.status(401).send('HMAC inválido');
      return;
    }

    let order: ShopifyOrder;
    try {
      order = JSON.parse(rawBody.toString('utf8')) as ShopifyOrder;
    } catch {
      res.status(400).send('JSON inválido');
      return;
    }

    const attrs = Object.fromEntries(
      (order.note_attributes ?? []).map((a) => [a.name, a.value]),
    ) as Record<string, string>;

    const company =
      (attrs.empresa_id ? await Company.findById(attrs.empresa_id).catch(() => null) : null) ??
      (attrs.cnpj ? await Company.findOne({ cnpj: attrs.cnpj }) : null);

    if (!company) {
      // 200 evita reentregas infinitas da Shopify por um pedido que não é de parceria.
      res.status(200).json({ ok: false, motivo: 'empresa não localizada' });
      return;
    }

    company.status = 'ativo';
    company.shopifySubscriptionActive = true;
    company.assinaturaAtivaEm = new Date();
    if (order.id != null) company.shopifyOrderId = String(order.id);
    if (order.customer?.id != null) company.shopifyCustomerId = String(order.customer.id);
    if (order.email && !company.email) company.email = order.email.toLowerCase();
    await company.save();

    // Cria o acesso ao painel da empresa, se ainda não existir.
    const email = (company.email ?? order.email ?? '').toLowerCase();
    if (email && !(await User.findOne({ email }))) {
      const senhaProvisoria = crypto.randomBytes(6).toString('hex');
      await User.create({
        nome: company.responsavel,
        email,
        senhaHash: await hashPassword(senhaProvisoria),
        role: 'empresa',
        company: company._id,
      });
      console.log(
        `[shopify] acesso criado para ${email} — senha provisória: ${senhaProvisoria}`,
      );
    }

    res.status(200).json({ ok: true, empresa: String(company._id) });
  },
);
