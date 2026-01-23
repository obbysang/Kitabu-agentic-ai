import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Wallet, Activity, Clock, CheckCircle, 
  AlertTriangle, FileText, TrendingUp, ShieldCheck, 
  ChevronRight, ArrowRight, Loader2, X, UploadCloud,
  Code, Users, Sparkles, Zap, Settings, Lock
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import gsap from 'gsap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TreasuryOverview, ActivityItem, HistoricalMetric, ChatResponse, Organization, OrgConfig } from '../types/api';

// --- API Client (Inlined due to environment constraints) ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('AUTH_TOKEN') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const config = { ...options, headers };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || 'API Error', errorData);
    }
    if (response.status === 204) return {} as T;
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(error instanceof Error ? error.message : 'Network Error');
  }
}

const api = {
  get: <T,>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T,>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T,>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
};

// --- Interfaces ---
interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  type?: 'text' | 'intent_preview' | 'alert';
  payload?: any;
}

const Dashboard: React.FC = () => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [adminOpen, setAdminOpen] = useState(false);
  
  const { data: org } = useQuery({
    queryKey: ['org', 'me'],
    queryFn: () => api.get<Organization>('/orgs/me'),
  });

  const { data: orgConfig, refetch: refetchConfig } = useQuery({
    queryKey: ['org', 'config', org?.id],
    queryFn: () => api.get<OrgConfig>(`/orgs/${org!.id}/config`),
    enabled: !!org?.id,
  });

  const [spendLimitInput, setSpendLimitInput] = useState<string>('');
  const [newRecipient, setNewRecipient] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [dualApprovalRequired, setDualApprovalRequired] = useState<boolean>(false);
  const [whitelistStrict, setWhitelistStrict] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  
  // --- Data Fetching ---
  const { data: overview, isLoading: isLoadingOverview, error: overviewError } = useQuery({
    queryKey: ['treasury', 'overview'],
    queryFn: () => api.get<TreasuryOverview>('/treasury/overview'),
    refetchInterval: 10000, // Poll every 10s
  });

  const { data: activities, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['treasury', 'activity'],
    queryFn: () => api.get<ActivityItem[]>('/treasury/activity'),
    refetchInterval: 5000,
  });

  const { data: historyData } = useQuery({
    queryKey: ['treasury', 'history'],
    queryFn: () => api.get<HistoricalMetric[]>('/treasury/history?days=7'),
  });

  // --- Chat Mutation ---
  const chatMutation = useMutation({
    mutationFn: (message: string) => api.post<ChatResponse>('/agent/chat', { message, userId: 'user-1' }),
    onSuccess: (data) => {
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'ai',
        text: data.message,
        type: data.intent ? 'intent_preview' : 'text',
        payload: data.intent
      };
      
      if (data.safetyViolation) {
         aiMsg.type = 'alert';
         aiMsg.payload = {
             title: 'Safety Violation',
             action: 'Review Policy',
             detail: data.safetyCheck?.reason || 'Action blocked by safety guardrails.'
         };
      }

      setMessages(prev => [...prev, aiMsg]);
    },
    onError: (error) => {
        const errorMsg: Message = {
            id: Date.now().toString(),
            role: 'ai',
            text: `Error: ${error.message}`,
            type: 'alert',
            payload: { title: 'System Error', detail: error.message, action: 'Retry' }
        };
        setMessages(prev => [...prev, errorMsg]);
    }
  });

  // --- State & Derived Data ---
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'ai', 
      text: 'Good morning, CFO. Treasury status is healthy.', 
      type: 'text' 
    }
  ]);

  const dailySpend = 3240; // TODO: Fetch from config/safety endpoint
  const dailyLimit = orgConfig ? parseInt(orgConfig.maxDailySpend) : 5000;

  const treasuryData = overview?.balances.map(b => ({
    name: b.tokenSymbol,
    value: b.usdValue,
    color: b.tokenSymbol === 'USDC' ? '#3B82F6' : b.tokenSymbol === 'CRO' ? '#10B981' : '#F59E0B',
    icon: b.tokenSymbol[0]
  })) || [];

  const projectionData = historyData?.map(h => ({
      day: new Date(h.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
      balance: h.totalValueUsd
  })) || [];

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  // Animations
  useEffect(() => {
    gsap.fromTo('.dashboard-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    if (adminOpen && orgConfig) {
      setSpendLimitInput(orgConfig.maxDailySpend);
      setDualApprovalRequired(Boolean(orgConfig.dualApprovalRequired));
      setWhitelistStrict(Boolean(orgConfig.whitelistStrict));
    }
  }, [adminOpen, orgConfig]);

  const addressValid = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const saveSpendLimit = async () => {
    if (!org) return;
    setSaving(true);
    setAdminError(null);
    try {
      await api.patch<Organization>(`/orgs/${org.id}/config`, { maxDailySpend: spendLimitInput, dualApprovalRequired, whitelistStrict, });
      await refetchConfig();
    } catch (e: any) {
      setAdminError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const addRecipient = async () => {
    if (!org || !orgConfig) return;
    if (!addressValid(newRecipient)) {
      setAdminError('Invalid address');
      return;
    }
    setSaving(true);
    setAdminError(null);
    try {
      const updatedList = [...orgConfig.whitelistedRecipients, newRecipient];
      await api.patch<Organization>(`/orgs/${org.id}/config`, { whitelistedRecipients: updatedList });
      await refetchConfig();
      setNewRecipient('');
    } catch (e: any) {
      setAdminError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const removeRecipient = async (addr: string) => {
    if (!org || !orgConfig) return;
    setSaving(true);
    setAdminError(null);
    try {
      const updatedList = orgConfig.whitelistedRecipients.filter(a => a !== addr);
      await api.patch<Organization>(`/orgs/${org.id}/config`, { whitelistedRecipients: updatedList });
      await refetchConfig();
    } catch (e: any) {
      setAdminError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    chatMutation.mutate(input);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-12 font-sans">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header Area */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 dashboard-card opacity-0">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    CFO Command Center <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-mono">v2.4.0</span>
                </h1>
                <p className="text-gray-500 mt-1">Agentic Treasury Management & x402 Execution Rails</p>
            </div>
            
            <div className="flex items-center gap-4">
                 <button onClick={() => setAdminOpen(true)} className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors">
                     <Settings size={16} /> Admin Panel
                 </button>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6 min-w-[280px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase">Daily Spend</div>
                            <div className="text-sm font-bold text-slate-900">${dailySpend.toLocaleString()} <span className="text-gray-400 font-normal">/ {dailyLimit/1000}k</span></div>
                        </div>
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${dailySpend > dailyLimit * 0.8 ? 'bg-red-500' : 'bg-blue-500'}`} 
                            style={{width: `${(dailySpend / dailyLimit) * 100}%`}}
                        ></div>
                    </div>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)] min-h-[800px]">
            
            {/* LEFT COLUMN: AI Chat Interface */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative dashboard-card opacity-0">
                
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                            <Bot size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">Kitabu Agent</div>
                            <div className="text-xs text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 w-fit">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span> 
                                x402 Session Active
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Lock Session">
                             <Lock size={18} />
                         </button>
                         <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Activity Log">
                             <Activity size={18} />
                         </button>
                    </div>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30" ref={scrollRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'ai' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white' : 'bg-slate-800 text-white'}`}>
                                {msg.role === 'ai' ? <Bot size={20} /> : <span className="text-xs font-bold">CFO</span>}
                            </div>
                            
                            <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-2xl rounded-tr-none p-4' : ''}`}>
                                
                                {msg.type === 'text' && msg.role === 'ai' && (
                                    <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none text-slate-700 shadow-sm leading-relaxed">
                                        {msg.text}
                                    </div>
                                )}
                                
                                {msg.type === 'text' && msg.role === 'user' && (
                                    <div className="text-sm leading-relaxed">{msg.text}</div>
                                )}

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
                    
                    {chatMutation.isPending && (
                        <div className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Loader2 size={20} className="text-blue-600 animate-spin" />
                            </div>
                            <div className="bg-slate-100 rounded-2xl rounded-tl-none p-4 text-sm text-slate-500">
                                Analyzing intent...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 relative z-20">
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
                        <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-0 transition duration-500 group-hover:opacity-20 ${input.trim() ? 'opacity-30' : ''}`}></div>
                        
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a command (e.g. 'Move 50% idle cash to VVS')..." 
                            className="relative w-full bg-white border border-slate-200 rounded-xl py-4 pl-5 pr-14 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 shadow-sm"
                            disabled={chatMutation.isPending}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || chatMutation.isPending}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 transform ${
                                input.trim() && !chatMutation.isPending
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
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 dashboard-card opacity-0">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Wallet size={18} className="text-gray-400" /> Treasury
                        </h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono">USD Val</span>
                    </div>
                    
                    {isLoadingOverview ? (
                        <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Loading treasury data...</div>
                    ) : overviewError ? (
                        <div className="h-40 flex items-center justify-center text-red-400 text-sm">Failed to load data</div>
                    ) : (
                        <>
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
                                    <div className="text-xl font-bold text-slate-900">${overview?.totalUsdValue.toLocaleString()}</div>
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Projection Chart */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">7-Day Projection</h4>
                            <span className="text-xs font-bold text-green-500 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                                <TrendingUp size={12} /> +3.8%
                            </span>
                        </div>
                        <div className="h-24 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={projectionData}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', padding: '8px'}}
                                        itemStyle={{color: '#fff'}}
                                        cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}}
                                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Balance']}
                                    />
                                    <Area type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 2. VVS Yield Ticker */}
                <div className="bg-gradient-to-br from-[#0B0F19] to-[#1a1f2e] p-6 rounded-3xl shadow-sm border border-slate-800 text-white relative overflow-hidden group dashboard-card opacity-0">
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

                {/* 3. Invoice Dropzone */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group dashboard-card opacity-0">
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
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex-1 dashboard-card opacity-0">
                     <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-gray-400" /> Live Feed
                    </h3>
                    <div className="space-y-4">
                        {isLoadingActivity ? (
                             <div className="text-xs text-slate-400">Loading activity...</div>
                        ) : (
                            activities?.map((act) => (
                                <div key={act.id} className="relative pl-4 border-l-2 border-slate-100 last:border-0 pb-1">
                                    <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${act.status === 'completed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                                    <div className="text-xs font-medium text-slate-900">{act.description}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-gray-400">{new Date(act.timestamp).toLocaleTimeString()}</span>
                                        {act.txHash && <span className="text-[10px] font-mono text-slate-600 bg-slate-50 px-1 rounded">{act.txHash.substring(0,6)}...</span>}
                                    </div>
                                </div>
                            ))
                        )}
                        {!isLoadingActivity && (!activities || activities.length === 0) && (
                            <div className="text-xs text-slate-400 italic">No recent activity</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
      </div>
      {adminOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-xl shadow-xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-slate-500" />
                <span className="font-semibold text-slate-800 text-sm">Admin Panel</span>
              </div>
              <button onClick={() => setAdminOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase">Permissions</div>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Require dual approval</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={dualApprovalRequired} onChange={(e) => setDualApprovalRequired(e.target.checked)} />
                      <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-all relative">
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:left-5 transition-all"></div>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Whitelist recipients only</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={whitelistStrict} onChange={(e) => setWhitelistStrict(e.target.checked)} />
                      <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-all relative">
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:left-5 transition-all"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase">Daily Spend Limit</div>
                <div className="flex items-center gap-3 mt-2">
                  <input type="number" value={spendLimitInput} onChange={(e) => setSpendLimitInput(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                  <span className="text-xs text-slate-500">USD</span>
                  <button onClick={saveSpendLimit} disabled={saving || !org} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50">Save</button>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase">Whitelisted Recipients</div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="text" placeholder="0x... or email" value={newRecipient} onChange={(e) => setNewRecipient(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                  <button onClick={addRecipient} disabled={saving || !org} className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50">Add</button>
                </div>
                <div className="mt-3 space-y-2">
                  {orgConfig?.whitelistedRecipients?.length ? orgConfig.whitelistedRecipients.map((addr) => (
                    <div key={addr} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg p-2">
                      <span className="text-sm text-slate-700 font-mono">{addr}</span>
                      <button onClick={() => removeRecipient(addr)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
                    </div>
                  )) : (
                    <div className="text-xs text-slate-400">No recipients</div>
                  )}
                </div>
              </div>
              {adminError && (
                <div className="text-xs text-red-600">{adminError}</div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setAdminOpen(false)} className="px-4 py-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">Close</button>
              <button onClick={() => setAdminOpen(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
