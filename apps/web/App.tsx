import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Intelligence from './pages/Intelligence';
import Rails from './pages/Rails';
import RWAInvoices from './pages/RWAInvoices';

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
      default:
        return <Landing />;
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 overflow-x-hidden font-sans">
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
      {renderPage()}
    </div>
  );
};

export default App;