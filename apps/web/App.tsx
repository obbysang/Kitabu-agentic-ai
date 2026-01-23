import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import CookieConsent from './components/CookieConsent';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Intelligence from './pages/Intelligence';
import Rails from './pages/Rails';
import RWAInvoices from './pages/RWAInvoices';
import Docs from './pages/docs';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'intelligence':
        return <Intelligence />;
      case 'rails':
        return <Rails />;
      case 'rwa':
        return <RWAInvoices />;
      case 'docs':
        return <Docs />;
      default:
        return <Landing onNavigate={(page) => setCurrentPage(page)} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-white min-h-screen text-slate-900 overflow-x-hidden font-sans">
        {currentPage !== 'docs' && (
          <Navbar 
            onNavigate={(page) => setCurrentPage(page as string)} 
            currentPage={currentPage as any} 
          />
        )}
        {renderPage()}
        <CookieConsent />
      </div>
    </QueryClientProvider>
  );
};

export default App;
