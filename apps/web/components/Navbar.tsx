import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { ArrowRight, Menu, X, Bot, Bell, ChevronDown, ExternalLink } from 'lucide-react'
import { ConnectKitButton } from 'connectkit'

interface NavbarProps {
  onNavigate?: (page: 'home' | 'dashboard' | 'intelligence' | 'rails' | 'rwa' | 'docs') => void
  currentPage?: 'home' | 'dashboard' | 'intelligence' | 'rails' | 'rwa' | 'docs'
  loading?: boolean
  error?: string | null
  docsHref?: string
}

const Navbar: React.FC<NavbarProps> = React.memo(({ onNavigate, currentPage = 'home', loading = false, error = null, docsHref = '#' }) => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const firstMobileItemRef = useRef<HTMLButtonElement | null>(null)

  const isLanding = currentPage === 'home'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    if (mobileMenuOpen) {
      window.addEventListener('keydown', onKey)
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileMenuOpen])

  useEffect(() => {
    if (mobileMenuOpen && firstMobileItemRef.current) firstMobileItemRef.current.focus()
  }, [mobileMenuOpen])

  const handleNav = useCallback(
    (page: 'home' | 'dashboard' | 'intelligence' | 'rails' | 'rwa' | 'docs') => {
      if (onNavigate) {
        onNavigate(page)
        setMobileMenuOpen(false)
        window.scrollTo(0, 0)
      }
    },
    [onNavigate]
  )

  const navItems = useMemo(
    () => [
      { id: 'dashboard' as const, label: 'Dashboard' },
      { id: 'intelligence' as const, label: 'Intelligence' },
      { id: 'rails' as const, label: 'x402 Rails' },
      { id: 'rwa' as const, label: 'RWA Invoices' },
    ],
    []
  )

  const navContainerClass = isLanding
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'}`
    : `fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 py-4 supports-[backdrop-filter]:bg-white/60`

  const logoTextClass = isLanding ? 'text-white' : 'text-slate-900'

  const centerMenuContainerClass = isLanding ? 'bg-white/10 border border-white/5 text-gray-300' : 'bg-slate-100/80 border border-slate-200 text-slate-500'

  const getItemClass = useCallback((id: 'home' | 'dashboard' | 'intelligence' | 'rails' | 'rwa') => {
    const isActive = currentPage === id
    if (isLanding) {
      return isActive ? 'bg-white/20 text-white shadow-sm' : 'hover:text-white hover:bg-white/10'
    }
    return isActive ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5 font-semibold' : 'hover:text-slate-900 hover:bg-slate-200/50 font-medium'
  }, [currentPage, isLanding])

  return (
    <nav className={navContainerClass} role="navigation" aria-label="Primary">
      <a href="#main" className="sr-only focus:outline-none focus:ring-2 focus:ring-blue-600 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded">Skip to content</a>
      {error && (
        <div role="alert" className={`${isLanding ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700'} px-6 py-2 text-sm`}>
          {error}
        </div>
      )}
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => handleNav('home')} aria-label="Go to home">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <Bot size={22} />
          </div>
          <span className={`font-bold text-xl tracking-tight transition-colors ${logoTextClass}`}>Kitabu</span>
        </div>

        {loading ? (
          <div className="hidden md:flex items-center gap-2 p-1.5 rounded-full backdrop-blur-md animate-pulse">
            <div className="h-8 w-20 rounded-full bg-white/20" />
            <div className="h-8 w-24 rounded-full bg-white/20" />
            <div className="h-8 w-28 rounded-full bg-white/20" />
            <div className="h-8 w-24 rounded-full bg-white/20" />
          </div>
        ) : (
          <div className={`hidden md:flex items-center gap-1.5 p-1.5 rounded-full backdrop-blur-md transition-all ${centerMenuContainerClass}`} role="menubar" aria-label="Main sections">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-5 py-2 text-sm rounded-full transition-all duration-200 ${getItemClass(item.id)}`}
                role="menuitem"
                aria-current={currentPage === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className="hidden md:flex items-center gap-5">
            {loading ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="h-6 w-24 rounded bg-white/20" />
                <div className="h-9 w-36 rounded-full bg-white/20" />
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleNav('docs')}
                  className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${isLanding ? 'text-gray-300 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  aria-label="Open documentation"
                >
                  Docs <ExternalLink size={14} opacity={0.7} />
                </button>

              {!isLanding && (
                <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative group" aria-label="Notifications">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>
                  <ConnectKitButton.Custom>
                    {({ isConnected, show, truncatedAddress, ensName }) => (
                      <button
                        onClick={show}
                        className={`flex items-center gap-2.5 ${isConnected ? 'bg-slate-900 text-white pl-3 pr-4 py-2' : 'bg-blue-600 text-white px-5 py-2.5'} rounded-full text-sm font-medium hover:opacity-90 transition-all hover:shadow-lg cursor-pointer`}
                        aria-label={isConnected ? 'Open wallet menu' : 'Connect wallet'}
                      >
                        {isConnected ? (
                          <>
                            <div className="relative">
                              <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                            </div>
                            <span className="font-mono tracking-tight">{ensName ?? truncatedAddress}</span>
                            <ChevronDown size={14} className="text-gray-400" />
                          </>
                        ) : (
                          <>
                            Connect Wallet
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    )}
                  </ConnectKitButton.Custom>
                </div>
              )}
              {isLanding && (
                <ConnectKitButton.Custom>
                  {({ isConnected, show, truncatedAddress, ensName }) => (
                    <button
                      onClick={show}
                      className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg shadow-white/10"
                      aria-label={isConnected ? 'Open wallet menu' : 'Connect wallet'}
                    >
                      {isConnected ? (ensName ?? truncatedAddress) : 'Connect Wallet'}
                      {!isConnected && <ArrowRight size={16} />}
                    </button>
                  )}
                </ConnectKitButton.Custom>
              )}
            </>
          )}
        </div>

        <button
          className={`md:hidden ${isLanding ? 'text-white' : 'text-slate-900'}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="absolute top-full left-0 right-0 bg-[#0B0F15] p-6 flex flex-col gap-2 md:hidden border-t border-white/10 h-[calc(100vh-80px)] overflow-y-auto z-40 shadow-2xl" aria-label="Mobile menu">
          {navItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`p-4 rounded-xl text-lg font-medium text-left transition-colors flex justify-between items-center ${currentPage === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
              aria-current={currentPage === item.id ? 'page' : undefined}
              ref={idx === 0 ? firstMobileItemRef : undefined}
            >
              {item.label}
              {currentPage === item.id && <ArrowRight size={16} />}
            </button>
          ))}
          <div className="h-px bg-white/10 my-4"></div>
          <button
            onClick={() => handleNav('docs')}
            className="text-gray-400 text-left p-4 hover:text-white w-full flex justify-between items-center group"
            aria-label="Open documentation"
          >
            Documentation
            <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <ConnectKitButton.Custom>
            {({ isConnected, show, truncatedAddress, ensName }) => (
              <button
                onClick={show}
                className="bg-white text-black py-4 rounded-xl font-bold mt-2 hover:bg-gray-200"
                aria-label={isConnected ? 'Open wallet menu' : 'Connect wallet'}
              >
                {isConnected ? (ensName ?? truncatedAddress) : 'Connect Wallet'}
              </button>
            )}
          </ConnectKitButton.Custom>
        </div>
      )}
    </nav>
  )
})

export default Navbar
