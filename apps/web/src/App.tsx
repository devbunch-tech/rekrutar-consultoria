import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Drawer } from './components/Drawer';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { useIsMobile } from './hooks/useIsMobile';
import { Home } from './pages/Home';
import { Sobre } from './pages/Sobre';
import { Vagas } from './pages/Vagas';
import { Divulgar } from './pages/Divulgar';
import { Contato } from './pages/Contato';
import { Login } from './pages/Login';
import { Painel } from './pages/Painel';

export function App() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  // Toda navegação sobe a página e fecha o drawer (comportamento do handoff).
  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuAberto(false);
  }, [pathname]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onOpenMenu={() => setMenuAberto(true)} />
      <Drawer open={menuAberto} onClose={() => setMenuAberto(false)} />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/vagas" element={<Vagas />} />
          <Route path="/divulgar" element={<Divulgar />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/login" element={<Login />} />
          <Route path="/painel" element={<Painel />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <Footer />
      {isMobile && <BottomNav />}
    </div>
  );
}
