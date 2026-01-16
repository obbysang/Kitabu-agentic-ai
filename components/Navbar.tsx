import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, Bot, Bell, ChevronDown, ExternalLink, Search } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage = 'home' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isLanding = currentPage === 'home';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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

  // Context-Aware Styling
  const navContainerClass = isLanding
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'}`
    : `fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 py-4 supports-[backdrop-filter]:bg-white/60`;

  const logoTextClass = isLanding ? 'text-white' : 'text-slate-900';
  
  // Segmented Control Style for App Mode
  const centerMenuContainerClass = isLanding
    ? 'bg-white/10 border border-white/5 text-gray-300'
    : 'bg-slate-100/80 border border-slate-200 text-slate-500';

  const getItemClass = (id: string) => {
    const isActive = currentPage === id;
    
    if (isLanding) {
      return isActive 
        ? 'bg-white/20 text-white shadow-sm' 
        : 'hover:text-white hover:bg-white/10';
    }
    
    // App Mode Styles
    return isActive 
      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5 font-semibold' 
      : 'hover:text-slate-900 hover:bg-slate-200/50 font-medium';
  };

  return (
    <nav className={navContainerClass}>
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
        
        {/* LEFT: Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group" 
          onClick={() => handleNav('home')}
        >
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <Bot size={22} />
          </div>
          <span className={`font-bold text-xl tracking-tight transition-colors ${logoTextClass}`}>Kitabu</span>
        </div>

        {/* CENTER: Navigation Pills */}
        <div className={`hidden md:flex items-center gap-1.5 p-1.5 rounded-full backdrop-blur-md transition-all ${centerMenuContainerClass}`}>
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleNav(item.id)}
              className={`px-5 py-2 text-sm rounded-full transition-all duration-200 ${getItemClass(item.id)}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* RIGHT: Actions */}
        <div className="hidden md:flex items-center gap-5">
          
          {/* Documentation Link */}
          <button className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${isLanding ? 'text-gray-300 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            Docs <ExternalLink size={14} opacity={0.7} />
          </button>

          {/* APP MODE: Dashboard Tools */}
          {!isLanding && (
             <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative group">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                {/* Connected Wallet Badge */}
                <button className="flex items-center gap-2.5 bg-slate-900 text-white pl-3 pr-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-200 cursor-pointer">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <span className="font-mono tracking-tight">0x14...9A2</span>
                    <ChevronDown size={14} className="text-gray-400" />
                </button>
             </div>
          )}

          {/* LANDING MODE: CTA */}
          {isLanding && (
            <button className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg shadow-white/10">
                Connect Wallet
                <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className={`md:hidden ${isLanding ? 'text-white' : 'text-slate-900'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0B0F15] p-6 flex flex-col gap-2 md:hidden border-t border-white/10 h-[calc(100vh-80px)] overflow-y-auto z-40 shadow-2xl">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleNav(item.id)} 
              className={`p-4 rounded-xl text-lg font-medium text-left transition-colors flex justify-between items-center ${currentPage === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              {item.label}
              {currentPage === item.id && <ArrowRight size={16} />}
            </button>
          ))}
          <div className="h-px bg-white/10 my-4"></div>
          <button onClick={() => handleNav('home')} className="text-gray-400 text-left p-4 hover:text-white">Documentation</button>
          <button className="bg-white text-black py-4 rounded-xl font-bold mt-2 hover:bg-gray-200">Connect Wallet</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;