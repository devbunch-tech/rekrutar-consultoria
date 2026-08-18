import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4002';
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? 'http://localhost:5174';
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL ?? `${API_URL}/graphql`;

export const TOKEN_KEY = 'rk_token';

const authLink = setContext((_op, { headers }) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return { headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) } };
});

export const client = new ApolloClient({
  link: from([authLink, new HttpLink({ uri: GRAPHQL_URL })]),
  cache: new InMemoryCache(),
  defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
});

/** Upload de currículo (multipart REST — o GraphQL só recebe a URL). */
export async function uploadCurriculo(file: File): Promise<{ url: string; nome: string }> {
  const form = new FormData();
  form.append('arquivo', file);
  const res = await fetch(`${API_URL}/api/upload/curriculo`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Não foi possível enviar o currículo.');
  return res.json() as Promise<{ url: string; nome: string }>;
}
