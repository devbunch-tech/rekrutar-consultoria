import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 4002),
  mongoUri: process.env.MONGODB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-rekrutar',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  publicApiUrl: process.env.PUBLIC_API_URL ?? 'http://localhost:4002',
  shopify: {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN ?? '',
    variantId: process.env.SHOPIFY_SUBSCRIPTION_VARIANT_ID ?? '',
    sellingPlanId: process.env.SHOPIFY_SELLING_PLAN_ID ?? '',
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET ?? '',
  },
};
