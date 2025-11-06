import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Mint } from './pages/Mint';
import { Marketplace } from './pages/Marketplace';
import { Partners } from './pages/Partners';
import { TransactionHistory } from './pages/TransactionHistory';
import { useSorobanEvents } from './hooks/useSorobanEvents';
import { useRWAContract } from './hooks/useRWAContract';
import { useStore } from './store/useStore';

function App() {
  // Initialize event listening for real-time marketplace updates
  useSorobanEvents();

  // Load all tokens when wallet connects
  const { loadAllTokens } = useRWAContract();
  const { isConnected } = useStore();

  useEffect(() => {
    if (isConnected) {
      console.log('🔗 Wallet connected, loading all tokens...');
      loadAllTokens();
    }
  }, [isConnected, loadAllTokens]);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="mint" element={<Mint />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="partners" element={<Partners />} />
          <Route path="transactions" element={<TransactionHistory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
