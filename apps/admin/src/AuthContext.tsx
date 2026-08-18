import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import { TOKEN_KEY } from './apollo';
import { ME } from './graphql';

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  role: 'candidato' | 'empresa' | 'admin';
}

interface AuthValue {
  user: AdminUser | null;
  loading: boolean;
  entrar: (token: string) => void;
  sair: () => void;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: true,
  entrar: () => {},
  sair: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const [temToken, setTemToken] = useState(() => !!localStorage.getItem(TOKEN_KEY));
  const { data, loading } = useQuery<{ me: AdminUser | null }>(ME, { skip: !temToken });

  const entrar = useCallback(
    (token: string) => {
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

  const value = useMemo<AuthValue>(
    () => ({
      // Só perfil admin opera este ambiente.
      user: temToken && data?.me?.role === 'admin' ? data.me : null,
      loading: temToken && loading,
      entrar,
      sair,
    }),
    [temToken, data, loading, entrar, sair],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthValue => useContext(AuthContext);
