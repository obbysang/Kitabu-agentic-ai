import React, { useEffect, useRef } from 'react';
import { ArrowRight, MessageSquare, Bot, Wallet, FileText, Zap, Brain } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import gsap from 'gsap';

const data = [
  { name: 'USDC', value: 45000, color: '#3B82F6' },
  { name: 'CRO', value: 15000, color: '#10B981' },
  { name: 'VVS', value: 5000, color: '#F59E0B' },
];

const AppShowcase: React.FC = () => {
  const phoneRef = useRef(null);
  const nodesRef = useRef<HTMLDivElement[]>([]);

  const addToNodesRef = (el: HTMLDivElement | null) => {
    if (el && !nodesRef.current.includes(el)) {
      nodesRef.current.push(el);
    }
  };

  useEffect(() => {
    // Phone Entrance
    gsap.fromTo(phoneRef.current,
      { y: 100, opacity: 0, rotateX: 10 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1.2, ease: "power3.out", delay: 0.2 }
    );

    // Nodes Entrance & Float
    nodesRef.current.forEach((node, i) => {
        // Entrance
        gsap.fromTo(node,
           { scale: 0, opacity: 0 },
           { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)", delay: 0.5 + (i * 0.2) }
        );

        // Float loop
        gsap.to(node, {
            y: -15,
            duration: 3 + i,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 1.5
        });
    });

  }, []);

  return (
    <section className="relative py-32 bg-slate-50 overflow-hidden">
      {/* Background Circuit Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="circuit" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M10 10 L40 10 M25 10 L25 40" fill="none" stroke="black" strokeWidth="1" />
            <circle cx="25" cy="25" r="2" fill="black" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mb-16">
          <h2 className="text-4xl md:text-6xl font-semibold text-slate-900 leading-tight mb-6">
            The <span className="text-blue-600">"CFO"</span> Command Dashboard
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
            Manage your treasury with a ChatGPT-like interface. Issue commands, settle RWA invoices, and automate yield farming in one place.
          </p>
        </div>

        {/* Central visual container */}
        <div className="relative w-full max-w-5xl h-[700px] flex justify-center items-center perspective-1000">
          
          {/* Floating Feature Icons */}
          <FloatingNode ref={addToNodesRef} icon={<Brain size={24} />} label="AI Agent" top="10%" left="10%" />
          <FloatingNode ref={addToNodesRef} icon={<FileText size={24} />} label="Invoice Parsing" top="25%" left="0%" />
          <FloatingNode ref={addToNodesRef} icon={<Zap size={24} />} label="x402 Rails" top="15%" right="10%" />
          
          {/* Phone Mockup - Changed to a wider "Dashboard" tablet/mobile view */}
          <div ref={phoneRef} className="relative w-[360px] md:w-[400px] h-[700px] bg-black rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden z-20 opacity-0 transform-gpu">
             {/* Notch */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-30"></div>
             
             {/* Screen Content */}
             <div className="w-full h-full bg-slate-900 text-white relative flex flex-col">
                
                {/* App Header */}
                <div className="pt-12 px-6 pb-4 flex justify-between items-center border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                             <Bot size={18} />
                         </div>
                         <div>
                             <div className="font-semibold text-sm">Kitabu Agent</div>
                             <div className="text-[10px] text-green-400 flex items-center gap-1">
                                 <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                             </div>
                         </div>
                    </div>
                    <Wallet size={20} className="text-gray-400" />
                </div>

                {/* Chat Interface */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    
                    {/* Bot Message - Treasury Snapshot */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-[10px]">AI</div>
                        <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-sm">
                            <p className="mb-3 text-gray-300">Here is your live treasury overview. You have significant idle USDC.</p>
                            {/* Mini Chart */}
                            <div className="h-32 w-full bg-black/20 rounded-xl mb-2 flex items-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pr-4 text-xs space-y-1">
                                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 45k USDC</div>
                                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> 15k CRO</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Command */}
                    <div className="flex gap-3 flex-row-reverse">
                         <div className="w-8 h-8 bg-slate-600 rounded-full flex-shrink-0 flex items-center justify-center text-[10px]">CFO</div>
                         <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-3 max-w-[85%] text-sm">
                             Pay the marketing team 500 USDC each for January.
                         </div>
                    </div>

                    {/* Bot Processing */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-[10px]">AI</div>
                        <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-sm space-y-2">
                            <p className="text-gray-300">Understood. I've prepared a batch transaction via <strong>x402 rails</strong>.</p>
                            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                                    <span>Recipients</span>
                                    <span>5 Wallets</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                                    <span>Total Amount</span>
                                    <span className="text-white font-bold">2,500 USDC</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-green-400">
                                    <span>Gas Saved</span>
                                    <span>~15 CRO (Bundled)</span>
                                </div>
                            </div>
                            <button className="w-full bg-blue-500/20 text-blue-400 py-2 rounded-lg text-xs font-semibold hover:bg-blue-500/30 transition">
                                Confirm & Sign Session
                            </button>
                        </div>
                    </div>

                    {/* User Idle Cash Prompt */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-[10px]">AI</div>
                        <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-sm">
                            <p className="text-gray-300">
                                <span className="text-yellow-400 font-bold">⚠️ Opportunity:</span> You have 10k USDC doing nothing. Shall I move it to VVS Finance for <span className="text-green-400">12% APY</span>?
                            </p>
                        </div>
                    </div>

                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900 border-t border-white/5">
                    <div className="bg-slate-800 rounded-full px-4 py-3 flex items-center gap-3">
                        <input 
                            type="text" 
                            placeholder="Type a command or upload invoice..." 
                            className="bg-transparent flex-1 text-sm text-white outline-none placeholder-gray-500"
                        />
                        <button className="text-blue-400 hover:text-white"><Zap size={18} /></button>
                    </div>
                </div>

             </div>
          </div>

        </div>

      </div>
    </section>
  );
};

// Forward Ref for nodes
const FloatingNode = React.forwardRef<HTMLDivElement, { icon: React.ReactNode, label: string, top: string, left?: string, right?: string }>(
  ({ icon, label, top, left, right }, ref) => (
    <div 
        ref={ref}
        className="absolute bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 hidden md:flex opacity-0"
        style={{ top, left, right }}
    >
        <div className="text-blue-600">{icon}</div>
        <span className="text-xs font-semibold text-slate-700">{label}</span>
    </div>
  )
);

export default AppShowcase;