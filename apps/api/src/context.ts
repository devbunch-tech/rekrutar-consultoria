import type { UserDoc } from './models/index.js';

export interface GraphQLContext {
  user: UserDoc | null;
}
