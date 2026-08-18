import { Route, Routes } from 'react-router-dom';
import { color } from '@rekrutar/tokens';
import { useAuth } from './AuthContext';
import { Shell } from './Shell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Vagas } from './pages/Vagas';
import { Candidaturas } from './pages/Candidaturas';
import { Empresas } from './pages/Empresas';
import { Usuarios } from './pages/Usuarios';
import { Mensagens } from './pages/Mensagens';

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color.textMuted,
        }}
      >
        Carregando…
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vagas" element={<Vagas />} />
        <Route path="/candidaturas" element={<Candidaturas />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/mensagens" element={<Mensagens />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
