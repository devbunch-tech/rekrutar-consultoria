import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { env } from './env.js';
import { connectDB } from './db.js';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';
import { userFromHeader } from './auth.js';
import type { GraphQLContext } from './context.js';
import { UPLOAD_DIR, uploadRouter } from './uploads.js';
import { shopifyRouter } from './shopify.js';
import { seed } from './seed.js';

async function main(): Promise<void> {
  const { uri, inMemory } = await connectDB();
  console.log(`✔ MongoDB conectado${inMemory ? ' (em memória)' : ''}: ${uri}`);

  if (inMemory) {
    await seed({ silent: true });
    console.log('✔ Banco em memória semeado com os dados do handoff');
  }

  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors({ origin: env.corsOrigins, credentials: true }));

  // Webhook antes do express.json() — o HMAC precisa do corpo bruto.
  app.use(shopifyRouter);
  app.use(express.json({ limit: '1mb' }));
  app.use(uploadRouter);
  app.use('/uploads', express.static(UPLOAD_DIR));
  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'rekrutar-api' });
  });

  const apollo = new ApolloServer<GraphQLContext>({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await apollo.start();

  app.use(
    '/graphql',
    expressMiddleware(apollo, {
      context: async ({ req }): Promise<GraphQLContext> => ({
        user: await userFromHeader(req.headers.authorization),
      }),
    }),
  );

  await new Promise<void>((resolve) => httpServer.listen(env.port, resolve));
  console.log(`🚀 API Rekrutar em http://localhost:${env.port}/graphql`);
}

main().catch((err) => {
  console.error('Falha ao iniciar a API:', err);
  process.exit(1);
});
