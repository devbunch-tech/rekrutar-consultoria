import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4002';
export const PORTAL_URL = import.meta.env.VITE_PORTAL_URL ?? 'http://localhost:5173';
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL ?? `${API_URL}/graphql`;

/** Chave distinta da do portal — admin e portal não compartilham sessão. */
export const TOKEN_KEY = 'rk_admin_token';

const authLink = setContext((_op, { headers }) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return { headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) } };
});

export const client = new ApolloClient({
  link: from([authLink, new HttpLink({ uri: GRAPHQL_URL })]),
  cache: new InMemoryCache(),
  defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
});
