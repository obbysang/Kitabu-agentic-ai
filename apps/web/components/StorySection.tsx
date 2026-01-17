import React from 'react';
import { ArrowRight, Sparkles, Cpu, Layers, FileCheck } from 'lucide-react';

const StorySection: React.FC = () => {
  return (
    <section className="py-24 bg-white relative">
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent -z-10"></div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-600 mb-6 shadow-sm">
                <Sparkles size={12} className="text-blue-500" />
                Under the Hood
            </div>
            <h2 className="text-4xl md:text-6xl font-medium text-slate-900 leading-tight max-w-4xl mx-auto">
                Powered by <span className="text-blue-600">Agentic Intelligence</span> and <span className="text-purple-600">x402 Rails</span>.
            </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Dark Card - The Brain */}
            <div className="bg-[#0B0F19] rounded-[2.5rem] p-10 relative overflow-hidden text-white min-h-[500px] flex flex-col">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 border border-blue-500/30">
                        <Cpu className="text-blue-400" size={24} />
                    </div>
                    <h3 className="text-3xl font-medium mb-4">
                        The AI Brain
                    </h3>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Uses <strong>Text-to-Transaction Parsing</strong> to convert natural language into JSON payloads. It queries Crypto.com Market Data MCP to check prices before executing, ensuring you never overpay for gas.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                             <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><FileCheck size={16} /></div>
                             <div className="text-sm">Parses PDF Invoices (RWA)</div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                             <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400"><Sparkles size={16} /></div>
                             <div className="text-sm">Safety Guardrails ($5k/day limit)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Light Card - The Engine */}
            <div className="bg-slate-100 rounded-[2.5rem] p-10 relative overflow-hidden min-h-[500px] flex flex-col border border-slate-200">
                <div className="absolute top-0 right-0 p-40 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="relative z-10">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 border border-purple-500/30">
                        <Layers className="text-purple-600" size={24} />
                    </div>
                    <h3 className="text-3xl font-medium mb-4 text-slate-900">
                        The x402 Engine
                    </h3>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Forget signing 50 MetaMask popups. The <strong>x402 Facilitator SDK</strong> enables session-based execution. Sign once, and the Agent executes batch payroll and swaps automatically.
                    </p>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Transaction Intent</span>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Settled</span>
                        </div>
                        <div className="font-mono text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                            {`{
  "intent": "BATCH_TRANSFER",
  "recipients": ["0x123...", "0x456..."],
  "amount": "500 USDC",
  "facilitator": "x402"
}`}
                        </div>
                    </div>
                    
                    <button className="text-slate-900 font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
                        Explore x402 Docs <ArrowRight size={16} />
                    </button>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default StorySection;