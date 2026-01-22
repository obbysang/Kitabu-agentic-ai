import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, Menu, X, ChevronRight, ChevronDown, 
  Book, Code, Terminal, Shield, FileText, 
  Home, ExternalLink, AlertCircle, CheckCircle, HelpCircle
} from 'lucide-react'

// --- Types ---
interface DocSection {
  id: string
  title: string
  icon?: React.ReactNode
  pages: DocPage[]
}

interface DocPage {
  id: string
  title: string
  content: React.ReactNode
}

// --- Components ---

const Bot = ({ size = 24 }: { size?: number }) => (
    <div className={`bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md`} style={{ width: size * 1.5, height: size * 1.5 }}>
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
            <rect width="18" height="12" x="3" y="8" rx="2" />
            <path d="M9 14h6" />
            <path d="M10 17v.01" />
            <path d="M14 17v.01" />
        </svg>
    </div>
)

// --- Mock Data ---
const DOCS_DATA: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Book size={18} />,
    pages: [
      {
        id: 'introduction',
        title: 'Introduction',
        content: (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Introduction to Kitabu</h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Kitabu is an AI-native, autonomous treasury management platform built on the Cronos ecosystem. 
              It enables DAOs, startups, and Web3 organizations to manage payroll, vendor payments, yield optimization, 
              and compliance workflows using natural language, executed safely and autonomously via x402 agentic payment rails.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-md">
              <div className="flex items-start gap-3">
                <Shield className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-blue-900">Enterprise Grade Security</h3>
                  <p className="text-blue-800 text-sm mt-1">
                    Kitabu is infrastructure, not a demo toy. All outputs reflect production-grade quality, safety, and correctness.
                  </p>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mt-8" id="core-mission">Core Mission</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Build secure, auditable, and deterministic systems</li>
              <li>Enable agentic payments using x402</li>
              <li>Integrate deeply with the Crypto.com and Cronos ecosystem</li>
              <li>Protect treasury funds at all times</li>
            </ul>
          </div>
        )
      },
      {
        id: 'quick-start',
        title: 'Quick Start',
        content: (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Quick Start Guide</h1>
            <p className="text-slate-600">Get up and running with Kitabu in minutes.</p>
            
            <h2 className="text-2xl font-semibold text-slate-800 mt-6" id="prerequisites">Prerequisites</h2>
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
              <code className="text-sm font-mono text-slate-700">
                - Node.js v18+<br/>
                - Cronos Wallet (MetaMask, etc.)<br/>
                - x402 API Key
              </code>
            </div>

            <h2 className="text-2xl font-semibold text-slate-800 mt-6" id="installation">Installation</h2>
            <p className="text-slate-600">Clone the repository and install dependencies:</p>
            <div className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm font-mono">
{`git clone https://github.com/kitabu/kitabu-agentic-ai.git
cd kitabu-agentic-ai
npm install
npm run dev`}
              </pre>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'core-concepts',
    title: 'Core Concepts',
    icon: <Terminal size={18} />,
    pages: [
      {
        id: 'architecture',
        title: 'Architecture',
        content: (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">System Architecture</h1>
            <p className="text-slate-600">
              Kitabu follows a strict separation of concerns to ensure security and maintainability.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                  <Code size={20} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Smart Contracts</h3>
                <p className="text-sm text-slate-500">Custody, authorization, and minimal logic. No AI logic on-chain.</p>
              </div>
              
              <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                  <Bot size={20} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Backend AI</h3>
                <p className="text-sm text-slate-500">Reasoning, orchestration, and x402 execution. Node.js + TypeScript.</p>
              </div>
              
              <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  <FileText size={20} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Frontend</h3>
                <p className="text-sm text-slate-500">Visualization and user interaction only. Next.js 14.</p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'x402-integration',
        title: 'x402 Integration',
        content: (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">x402 Agentic Rails</h1>
            <p className="text-slate-600">
              x402 is the primary execution rail for Kitabu. All payments must be intent-based and support scoped permissions.
            </p>
            <h2 className="text-2xl font-semibold text-slate-800 mt-6" id="lifecycle">Execution Lifecycle</h2>
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 py-4">
              <div className="ml-6 relative">
                <span className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></span>
                <h4 className="font-bold text-slate-900">Created</h4>
                <p className="text-sm text-slate-500">Intent parsed and structure created.</p>
              </div>
              <div className="ml-6 relative">
                <span className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-yellow-400 border-2 border-white"></span>
                <h4 className="font-bold text-slate-900">Pending</h4>
                <p className="text-sm text-slate-500">Awaiting validation and execution.</p>
              </div>
              <div className="ml-6 relative">
                <span className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></span>
                <h4 className="font-bold text-slate-900">Settled</h4>
                <p className="text-sm text-slate-500">Transaction confirmed on Cronos.</p>
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: <Code size={18} />,
    pages: [
      {
        id: 'endpoints',
        title: 'Endpoints',
        content: (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">API Endpoints</h1>
            <p className="text-slate-600">
              All API routes return JSON and always include explicit status fields.
            </p>

            <div className="space-y-4 mt-6">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold font-mono">POST</span>
                  <code className="text-sm font-mono text-slate-700">/api/v1/intent/parse</code>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-sm text-slate-600 mb-3">Parses natural language into structured financial intent.</p>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Request Body</h4>
                  <pre className="bg-slate-900 text-slate-50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "prompt": "Pay Alice 500 USDC for design work",
  "context": { "chainId": 25 }
}`}
                  </pre>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold font-mono">GET</span>
                  <code className="text-sm font-mono text-slate-700">/api/v1/treasury/balance</code>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-sm text-slate-600">Retrieves current treasury holdings across configured wallets.</p>
                </div>
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'support',
    title: 'Support',
    icon: <HelpCircle size={18} />,
    pages: [
      {
        id: 'faq',
        title: 'FAQ',
        content: (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h1>
            
            <div className="space-y-4 mt-6">
              <details className="group border border-slate-200 rounded-lg open:bg-slate-50">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-slate-900 group-open:text-blue-600">
                  Is Kitabu safe for real funds?
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="p-4 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-200 group-open:border-t-0">
                  Yes. Kitabu is designed as infrastructure, not a toy. It never assumes balances, validates all intents via x402, and uses scoped permissions for smart contracts.
                </div>
              </details>

              <details className="group border border-slate-200 rounded-lg open:bg-slate-50">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-slate-900 group-open:text-blue-600">
                  Which chains are supported?
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="p-4 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-200 group-open:border-t-0">
                  Kitabu is native to the Cronos ecosystem (EVM). It supports Cronos Mainnet and Testnet.
                </div>
              </details>
            </div>
          </div>
        )
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        content: (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Troubleshooting</h1>
            
            <div className="flex items-start gap-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold">Transaction Failures</h3>
                <p className="text-sm mt-1">
                  If transactions are failing, ensure your x402 agent has sufficient gas tokens (CRO) and that the spender allowance is set correctly in the smart contract.
                </p>
              </div>
            </div>
          </div>
        )
      }
    ]
  }
]

// --- Components ---



const Docs = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('getting-started')
  const [activePageId, setActivePageId] = useState<string>('introduction')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tocHeadings, setTocHeadings] = useState<{ id: string; text: string; level: number }[]>([])

  // Flatten pages for easier searching
  const allPages = useMemo(() => {
    return DOCS_DATA.flatMap(section => 
      section.pages.map(page => ({
        ...page,
        sectionId: section.id,
        sectionTitle: section.title
      }))
    )
  }, [])

  const filteredDocs = useMemo(() => {
    if (!searchQuery) return DOCS_DATA
    
    return DOCS_DATA.map(section => ({
      ...section,
      pages: section.pages.filter(page => 
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.pages.length > 0)
  }, [searchQuery])

  const activePage = useMemo(() => {
    return allPages.find(p => p.id === activePageId)
  }, [activePageId, allPages])

  // Extract headings for TOC
  useEffect(() => {
    if (!activePage) return
    // Simple heuristic to extract headings from the content if it were a string or simple object
    // Since we are rendering React nodes, we can't easily scrape them without DOM access
    // We will use a timeout to wait for render, then query the DOM
    const timer = setTimeout(() => {
      const headings = Array.from(document.querySelectorAll('main h1, main h2, main h3'))
      const headingData = headings.map((h, i) => {
        if (!h.id) h.id = `heading-${i}`
        return {
          id: h.id,
          text: h.textContent || '',
          level: parseInt(h.tagName.substring(1))
        }
      })
      setTocHeadings(headingData)
    }, 100)
    return () => clearTimeout(timer)
  }, [activePageId, activePage])

  const handlePageChange = (sectionId: string, pageId: string) => {
    setActiveSectionId(sectionId)
    setActivePageId(pageId)
    setMobileMenuOpen(false)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* --- Top Navigation Bar --- */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.href = '/'}>
            <Bot size={20} />
            <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">Kitabu Docs</span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 ml-4 px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-500 border border-slate-200">
            <span>v0.1.0</span>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-4 lg:mx-8">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
            <input 
              type="text" 
              placeholder="Search documentation..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a href="/" className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            <Home size={18} />
            <span>Home</span>
          </a>
          <a href="https://github.com/kitabu/kitabu-agentic-ai" target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
          </a>
        </div>
      </header>

      {/* --- Sidebar Navigation --- */}
      <div className={`fixed inset-0 z-40 lg:z-0 lg:inset-auto lg:top-16 lg:left-0 lg:bottom-0 lg:w-72 lg:border-r lg:border-slate-200 bg-white transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full overflow-y-auto p-4 lg:p-6 pb-20">
          <div className="lg:hidden flex items-center justify-between mb-6">
            <span className="font-bold text-lg">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)}><X size={20} /></button>
          </div>
          
          <nav className="space-y-8">
            {filteredDocs.map((section) => (
              <div key={section.id}>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 px-2">
                  {section.icon && <span className="text-slate-400">{section.icon}</span>}
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.pages.map((page) => (
                    <li key={page.id}>
                      <button
                        onClick={() => handlePageChange(section.id, page.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between group ${
                          activePageId === page.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {page.title}
                        {activePageId === page.id && <ChevronRight size={14} className="text-blue-600" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {filteredDocs.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="lg:pl-72 pt-16 min-h-screen">
        <div className="flex">
          {/* Content Area */}
          <div className="flex-1 min-w-0 px-4 py-10 lg:px-12 lg:py-12 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <span>Docs</span>
              <ChevronRight size={14} />
              <span>{activePage?.sectionTitle}</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-slate-900">{activePage?.title}</span>
            </div>

            <article className="prose prose-slate max-w-none">
              {activePage ? activePage.content : <div className="text-center py-20">Select a page</div>}
            </article>

            {/* Page Navigation Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between">
               {/* Logic to find prev/next pages could go here */}
               <div className="text-sm text-slate-400 italic">
                  Last updated: {new Date().toLocaleDateString()}
               </div>
            </div>
          </div>

          {/* Right Sidebar (Table of Contents) */}
          <div className="hidden xl:block w-64 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-8 border-l border-slate-200">
            <h5 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">On This Page</h5>
            <ul className="space-y-2 text-sm">
              {tocHeadings.map((heading) => (
                <li key={heading.id} className={heading.level === 3 ? 'pl-4' : ''}>
                  <a 
                    href={`#${heading.id}`} 
                    className="text-slate-500 hover:text-blue-600 transition-colors block py-1 border-l-2 border-transparent hover:border-blue-600 pl-3 -ml-3"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Docs
