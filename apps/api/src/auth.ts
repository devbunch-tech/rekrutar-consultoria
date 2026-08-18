import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { env } from './env.js';
import { User, type Role, type UserDoc } from './models/index.js';

export interface AuthPayload {
  sub: string;
  role: Role;
}

export const hashPassword = (senha: string) => bcrypt.hash(senha, 10);
export const verifyPassword = (senha: string, hash: string) => bcrypt.compare(senha, hash);

export function signToken(user: UserDoc): string {
  const payload: AuthPayload = { sub: String(user._id), role: user.role as Role };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export async function userFromHeader(header?: string): Promise<UserDoc | null> {
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as AuthPayload;
    const user = await User.findById(payload.sub);
    return user?.ativo ? user : null;
  } catch {
    return null;
  }
}

export function requireAuth(user: UserDoc | null): UserDoc {
  if (!user) {
    throw new GraphQLError('Não autenticado.', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return user;
}

/** Admin passa em qualquer verificação de papel (admin vê tudo). */
export function requireRole(user: UserDoc | null, ...roles: Role[]): UserDoc {
  const u = requireAuth(user);
  if (u.role === 'admin') return u;
  if (!roles.includes(u.role as Role)) {
    throw new GraphQLError('Acesso negado para este perfil.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return u;
}

export const requireAdmin = (user: UserDoc | null): UserDoc => {
  const u = requireAuth(user);
  if (u.role !== 'admin') {
    throw new GraphQLError('Acesso restrito ao admin master.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return u;
};
