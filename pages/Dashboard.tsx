import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Wallet, Activity, Clock, CheckCircle, 
  AlertTriangle, FileText, TrendingUp, ShieldCheck, 
  ChevronRight, ArrowRight, Loader2, X, UploadCloud,
  Code, Users, Sparkles, Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  type?: 'text' | 'intent_preview' | 'alert';
  payload?: any;
}

const Dashboard: React.FC = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Mock Data
  const [dailySpend, setDailySpend] = useState(3240);
  const dailyLimit = 5000;
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'ai', 
      text: 'Good morning, CFO. Treasury status is healthy.', 
      type: 'text' 
    },
    {
      id: '2',
      role: 'ai',
      text: 'I detected 10,000 USDC sitting idle for >24 hours.',
      type: 'alert',
      payload: {
        title: 'Idle Cash Detected',
        action: 'Move to VVS Finance',
        detail: 'Est. 12% APY (~$100/mo)'
      }
    }
  ]);

  const treasuryData = [
    { name: 'USDC', value: 45000, color: '#3B82F6', icon: '$' },
    { name: 'CRO', value: 15000, color: '#10B981', icon: 'C' },
    { name: 'VVS', value: 5000, color: '#F59E0B', icon: 'V' },
  ];

  const activities = [
    { id: 1, type: 'settled', text: 'Batch Payroll (Marketing)', amount: '-2,500 USDC', time: '2 mins ago', hash: '0x7a...9f' },
    { id: 2, type: 'processing', text: 'Yield Optimization (VVS)', amount: '10,000 USDC', time: 'Processing', hash: '0x3b...2c' },
    { id: 3, type: 'settled', text: 'Invoice #1024 Settlement', amount: '-500 USDC', time: '1 hr ago', hash: '0x1d...4a' },
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    // Simulate AI Processing & Text-to-Transaction Parsing
    setTimeout(() => {
      setIsProcessing(false);
      
      const intentPayload = {
        intent: "TRANSFER",
        chain: "CRONOS_MAINNET",
        params: {
          recipient: "0xMarketing...Team",
          amount: "500",
          token: "USDC"
        },
        gasStrategy: "x402_BUNDLE"
      };

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'I have parsed your intent. Please review the structured payload before I execute via x402.',
        type: 'intent_preview',
        payload: intentPayload
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-12 font-sans">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header Area */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    CFO Command Center <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-mono">v2.4.0</span>
                </h1>
                <p className="text-gray-500 mt-1">Agentic Treasury Management & x402 Execution Rails</p>
            </div>
            
            {/* Safety Guardrails Widget */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6 min-w-[300px]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase">Daily Spend Limit</div>
                        <div className="text-sm font-bold text-slate-900">${dailySpend.toLocaleString()} <span className="text-gray-400 font-normal">/ ${dailyLimit.toLocaleString()}</span></div>
                    </div>
                </div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${dailySpend > dailyLimit * 0.8 ? 'bg-red-500' : 'bg-blue-500'}`} 
                        style={{width: `${(dailySpend / dailyLimit) * 100}%`}}
                    ></div>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)] min-h-[800px]">
            
            {/* LEFT COLUMN: AI Chat Interface (The Brain) */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
                
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                            <Bot size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">Kitabu Agent</div>
                            <div className="text-xs text-blue-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span> 
                                x402 Session Active
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                             <Activity size={20} />
                         </button>
                    </div>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30" ref={scrollRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'ai' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white' : 'bg-slate-800 text-white'}`}>
                                {msg.role === 'ai' ? <Bot size={20} /> : <span className="text-xs font-bold">CFO</span>}
                            </div>
                            
                            {/* Bubble */}
                            <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-2xl rounded-tr-none p-4' : ''}`}>
                                
                                {msg.type === 'text' && msg.role === 'ai' && (
                                    <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none text-slate-700 shadow-sm leading-relaxed">
                                        {msg.text}
                                    </div>
                                )}
                                
                                {msg.type === 'text' && msg.role === 'user' && (
                                    <div className="text-sm leading-relaxed">{msg.text}</div>
                                )}

                                {/* ALERTS (Idle Cash, etc) */}
                                {msg.type === 'alert' && (
                                    <div className="bg-white border border-yellow-200 p-0 rounded-2xl rounded-tl-none overflow-hidden shadow-sm max-w-md">
                                        <div className="bg-yellow-50 p-3 border-b border-yellow-100 flex items-center gap-2">
                                            <AlertTriangle size={16} className="text-yellow-600" />
                                            <span className="font-semibold text-yellow-800 text-sm">{msg.payload.title}</span>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-slate-600 text-sm mb-3">{msg.text}</p>
                                            <div className="bg-slate-50 rounded-lg p-3 mb-4 text-xs font-mono text-slate-500 border border-slate-100">
                                                {msg.payload.detail}
                                            </div>
                                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                                {msg.payload.action} <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* INTENT PREVIEW (JSON Parsing) */}
                                {msg.type === 'intent_preview' && (
                                    <div className="bg-white border border-slate-200 p-0 rounded-2xl rounded-tl-none overflow-hidden shadow-sm w-full min-w-[300px]">
                                        <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Code size={16} className="text-slate-500" />
                                                <span className="font-semibold text-slate-700 text-sm">Parsed Intent (x402)</span>
                                            </div>
                                            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">JSON</span>
                                        </div>
                                        <div className="p-4 bg-[#1E1E1E]">
                                            <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                                                {JSON.stringify(msg.payload, null, 2)}
                                            </pre>
                                        </div>
                                        <div className="p-3 bg-slate-50 flex gap-2 border-t border-slate-200">
                                            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-medium transition-colors">
                                                Confirm & Execute
                                            </button>
                                            <button className="px-4 py-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {isProcessing && (
                        <div className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Loader2 size={20} className="text-blue-600 animate-spin" />
                            </div>
                            <div className="bg-slate-100 rounded-2xl rounded-tl-none p-4 text-sm text-slate-500">
                                Parsing natural language...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 relative z-20">
                    
                    {/* Enhanced Quick Actions */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                         <button 
                            onClick={() => handleQuickAction('Pay Marketing Team 500 USDC')}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-full text-xs font-medium text-slate-600 hover:text-blue-600 transition-all whitespace-nowrap group"
                        >
                            <Users size={14} className="group-hover:text-blue-600 transition-colors" /> Pay Marketing Team
                        </button>
                         <button 
                            onClick={() => handleQuickAction('Optimize Yield on VVS')}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-200 rounded-full text-xs font-medium text-slate-600 hover:text-green-600 transition-all whitespace-nowrap group"
                        >
                            <TrendingUp size={14} className="group-hover:text-green-600 transition-colors" /> Optimize Yield
                        </button>
                         <button 
                            onClick={() => handleQuickAction('Upload Invoice #1024')}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-full text-xs font-medium text-slate-600 hover:text-purple-600 transition-all whitespace-nowrap group"
                        >
                            <UploadCloud size={14} className="group-hover:text-purple-600 transition-colors" /> Upload Invoice
                        </button>
                    </div>

                    <div className="relative group">
                        {/* Glow effect on active */}
                        <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-0 transition duration-500 group-hover:opacity-20 ${input.trim() ? 'opacity-30' : ''}`}></div>
                        
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a command (e.g. 'Move 50% idle cash to VVS')..." 
                            className="relative w-full bg-white border border-slate-200 rounded-xl py-4 pl-5 pr-14 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 shadow-sm"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 transform ${
                                input.trim() 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-100 hover:scale-105 active:scale-95' 
                                : 'bg-slate-100 text-slate-300 scale-95 cursor-not-allowed'
                            }`}
                        >
                            <Send size={18} className={input.trim() ? 'ml-0.5' : ''} />
                        </button>
                    </div>
                    <div className="text-[10px] text-center text-gray-400 mt-2 flex justify-center items-center gap-1">
                        <Sparkles size={10} /> AI Agent uses x402 rails for execution
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Treasury & Utils */}
            <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1 h-full">
                
                {/* 1. Treasury Overview Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Wallet size={18} className="text-gray-400" /> Treasury
                        </h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono">USD Val</span>
                    </div>
                    
                    <div className="h-40 relative mb-6">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={treasuryData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                    {treasuryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Total</div>
                            <div className="text-xl font-bold text-slate-900">$65k</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {treasuryData.map((asset) => (
                            <div key={asset.name} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{backgroundColor: asset.color}}>
                                        {asset.icon}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">{asset.name}</div>
                                        <div className="text-[10px] text-gray-400">Cronos Chain</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-slate-900">${asset.value.toLocaleString()}</div>
                                    <div className="text-[10px] text-green-500">+2.4%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. VVS Yield Ticker (DeFi Integration) */}
                <div className="bg-gradient-to-br from-[#0B0F19] to-[#1a1f2e] p-6 rounded-3xl shadow-sm border border-slate-800 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-20 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-blue-400">
                                <TrendingUp size={18} />
                                <span className="text-xs font-bold tracking-wider">VVS FINANCE</span>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        
                        <div className="mb-6">
                            <div className="text-3xl font-bold">12.42% <span className="text-sm font-normal text-gray-400">APY</span></div>
                            <div className="text-xs text-gray-500 mt-1">USDC-CRO Liquidity Pool</div>
                        </div>

                        <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-2 rounded-xl text-xs font-semibold transition-colors">
                            Auto-Invest Idle Cash
                        </button>
                    </div>
                </div>

                {/* 3. Invoice Dropzone (RWA) */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                        <UploadCloud size={24} className="text-blue-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">Upload Invoice</h4>
                    <p className="text-xs text-gray-500 mb-4">Drag PDF here to parse & pay</p>
                    <button className="text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-full">
                        Browse Files
                    </button>
                </div>

                {/* 4. Activity Feed */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex-1">
                     <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-gray-400" /> Live Feed
                    </h3>
                    <div className="space-y-4">
                        {activities.map((act) => (
                            <div key={act.id} className="relative pl-4 border-l-2 border-slate-100 last:border-0 pb-1">
                                <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${act.type === 'settled' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                                <div className="text-xs font-medium text-slate-900">{act.text}</div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[10px] text-gray-400">{act.time}</span>
                                    <span className="text-[10px] font-mono text-slate-600 bg-slate-50 px-1 rounded">{act.hash}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;