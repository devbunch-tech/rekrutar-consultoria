import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import { TOKEN_KEY } from '../apollo';
import { ME } from '../graphql';
import type { User } from '../types';

interface AuthValue {
  user: User | null;
  loading: boolean;
  entrar: (token: string, user: User) => void;
  sair: () => void;
  recarregar: () => void;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: true,
  entrar: () => {},
  sair: () => {},
  recarregar: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const [temToken, setTemToken] = useState(() => !!localStorage.getItem(TOKEN_KEY));
  const { data, loading, refetch } = useQuery<{ me: User | null }>(ME, { skip: !temToken });

  const entrar = useCallback(
    (token: string, _user: User) => {
      localStorage.setItem(TOKEN_KEY, token);
      setTemToken(true);
      void client.refetchQueries({ include: 'active' });
    },
    [client],
  );

  const sair = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setTemToken(false);
    void client.resetStore();
  }, [client]);

  // Token expirado/inválido: a API devolve me: null — limpa a sessão local.
  useEffect(() => {
    if (temToken && !loading && data && data.me === null) {
      localStorage.removeItem(TOKEN_KEY);
      setTemToken(false);
    }
  }, [temToken, loading, data]);

  const value = useMemo<AuthValue>(
    () => ({
      user: temToken ? (data?.me ?? null) : null,
      loading: temToken && loading,
      entrar,
      sair,
      recarregar: () => void refetch(),
    }),
    [temToken, data, loading, entrar, sair, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthValue => useContext(AuthContext);
