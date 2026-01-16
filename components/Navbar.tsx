import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Bot } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage = 'home' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      setMobileMenuOpen(false);
      window.scrollTo(0, 0);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'intelligence', label: 'Intelligence' },
    { id: 'rails', label: 'x402 Rails' },
    { id: 'rwa', label: 'RWA Invoices' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => handleNav('home')}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Bot size={20} />
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">Kitabu</span>
        </div>

        {/* Center Menu */}
        <div className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 border border-white/5">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleNav(item.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${currentPage === item.id ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => handleNav('home')} className="text-white text-sm font-medium hover:text-gray-300 transition-colors">Documentation</button>
          <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors">
            Connect Wallet
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg p-6 flex flex-col gap-4 md:hidden border-t border-white/10 h-screen">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => handleNav(item.id)} className="text-gray-300 text-lg py-2 border-b border-white/5 text-left">{item.label}</button>
          ))}
          <div className="flex flex-col gap-4 mt-4">
            <button onClick={() => handleNav('home')} className="text-white text-center py-2">Documentation</button>
            <button className="bg-white text-black py-3 rounded-full font-semibold">Connect Wallet</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;