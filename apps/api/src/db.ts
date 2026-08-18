import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Conecta ao Mongo. Sem MONGODB_URI, sobe um Mongo em memória — permite rodar
 * o projeto inteiro em localhost sem Docker nem instalação do MongoDB.
 */
export async function connectDB(): Promise<{ uri: string; inMemory: boolean }> {
  if (env.mongoUri) {
    await mongoose.connect(env.mongoUri);
    return { uri: env.mongoUri, inMemory: false };
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mem = await MongoMemoryServer.create();
  const uri = mem.getUri('rekrutar');
  await mongoose.connect(uri);
  return { uri, inMemory: true };
}
