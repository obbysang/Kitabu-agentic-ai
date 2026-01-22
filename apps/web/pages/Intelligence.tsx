import React, { useEffect } from 'react';
import { Brain, ShieldAlert, Server, Zap } from 'lucide-react';
import gsap from 'gsap';
import { useQuery } from '@tanstack/react-query';
import { getTokenPrice, getGasPrice, getYieldOpportunities, getTreasuryOverview, getOrgMe, getOrgConfig } from '../lib/api';
import type { YieldOpportunity, TreasuryOverview, Organization, OrgConfig } from '../types/api';

const Intelligence: React.FC = () => {
  
  useEffect(() => {
    gsap.fromTo('.anim-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  const { data: croPrice, isLoading: loadingPrice, error: priceError } = useQuery({
    queryKey: ['market', 'price', 'CRO'],
    queryFn: () => getTokenPrice('CRO'),
    refetchInterval: 60000
  });

  const { data: gasPrice, isLoading: loadingGas, error: gasError } = useQuery({
    queryKey: ['market', 'gas'],
    queryFn: () => getGasPrice('cronos'),
    refetchInterval: 15000
  });

  const { data: yields, isLoading: loadingYields } = useQuery({
    queryKey: ['market', 'yields', 'vvs_finance'],
    queryFn: () => getYieldOpportunities('vvs_finance'),
    refetchInterval: 300000
  });

  const topYield: YieldOpportunity | undefined = yields && yields.length > 0 ? [...yields].sort((a, b) => b.apy - a.apy)[0] : undefined;

  const { data: overview } = useQuery({
    queryKey: ['treasury', 'overview'],
    queryFn: () => getTreasuryOverview(),
    refetchInterval: 10000
  });

  const { data: org, error: orgError } = useQuery<Organization>({
    queryKey: ['org', 'me'],
    queryFn: () => getOrgMe(),
    retry: false
  });

  const { data: orgConfig, error: configError } = useQuery<OrgConfig>({
    queryKey: ['org', 'config', org?.id],
    queryFn: () => getOrgConfig(org!.id),
    enabled: !!org?.id,
    retry: false
  });

  const croUsd = croPrice?.price ?? null;
  const apy = topYield?.apy ?? null;
  const gasGwei = gasPrice ? Math.round(Number(gasPrice.standard) / 1e9) : null;

  const usdcBalanceUsd = overview?.balances.find(b => b.tokenSymbol === 'USDC')?.usdValue ?? 0;
  const monthlyEstimate = apy ? Math.round((usdcBalanceUsd * apy) / 100 / 12) : 0;

  const dailyLimitWei = orgConfig?.maxDailySpend ? BigInt(orgConfig.maxDailySpend) : null;
  const dailyLimitUsd = dailyLimitWei ? Math.round(Number(dailyLimitWei) / 1e18) : null;
  const dailySpendUsd = 0;
  const dailyPercent = dailyLimitUsd ? Math.min(100, Math.round((dailySpendUsd / dailyLimitUsd) * 100)) : 0;
  const guardrailStatus = orgError || configError ? 'Unauthorized' : 'Connected';

  return (
    <div className="pt-24 min-h-screen bg-white pb-12">
      <div className="max-w-5xl mx-auto px-6">
        <header className="mb-12 text-center anim-card opacity-0">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 text-blue-600">
                <Brain size={32} />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">The AI Brain</h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Kitabu's agentic intelligence layer connects natural language processing with real-time market data to make informed financial decisions.
            </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            
            {/* Market Data Integration */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 relative overflow-hidden group anim-card opacity-0 hover:border-blue-200 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <Server className="text-slate-300" size={100} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Market Data MCP</h3>
                <p className="text-gray-500 mb-6 text-sm relative z-10">
                    Queries Crypto.com Market Data to check prices and gas fees before execution.
                </p>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative z-10">
                    <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase">Live Feed</span>
                        <span className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> {priceError || gasError ? 'Error' : (loadingPrice || loadingGas ? 'Loading' : 'Connected')}</span>
                    </div>
                    <div className="space-y-2 font-mono text-xs text-slate-700">
                        <div className="flex justify-between">
                            <span>CRO/USD</span>
                            <span className="font-bold">{loadingPrice ? '...' : (croUsd ? `$${croUsd.toFixed(4)}` : '—')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Top APY</span>
                            <span className="font-bold text-green-600">{loadingYields ? '...' : (apy !== null ? `${apy.toFixed(2)}%` : '—')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Gas (Gwei)</span>
                            <span className="font-bold text-blue-600">{loadingGas ? '...' : (gasGwei !== null ? `${gasGwei}` : '—')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Safety Guardrails */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 relative overflow-hidden anim-card opacity-0 hover:border-orange-200 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <ShieldAlert className="text-slate-300" size={100} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Safety Guardrails</h3>
                <p className="text-gray-500 mb-6 text-sm relative z-10">
                    Prevents the AI from exceeding predefined spending limits without manual override.
                </p>
                
                <div className="mt-8 relative z-10">
                    <div className="flex justify-between text-sm font-medium mb-2">
                        <span className="text-slate-700">Daily Spend Limit</span>
                        <span className="text-slate-900">{orgError || configError ? 'Sign in required' : (dailyLimitUsd !== null ? `$${dailySpendUsd.toLocaleString()} / $${dailyLimitUsd.toLocaleString()}` : 'Loading...')}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{width: `${dailyPercent}%`}}></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">{guardrailStatus}</div>
                </div>
            </div>

        </div>

        {/* Idle Cash Section */}
        <div className="bg-[#0B0F15] rounded-[2.5rem] p-10 text-white relative overflow-hidden anim-card opacity-0">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                 <div className="flex-1">
                     <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                         <Zap size={14} /> Auto-Optimizer
                     </div>
                     <h2 className="text-3xl font-bold mb-4">Idle Cash Detection</h2>
                     <p className="text-gray-400 mb-6 leading-relaxed">
                        The AI monitors your treasury and estimates yield based on current market data.
                    </p>
                     <div className="flex gap-4">
                         <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                            <div className="text-2xl font-bold text-white mb-1">{loadingYields ? '...' : (apy !== null ? `${apy.toFixed(2)}%` : '—')}</div>
                            <div className="text-xs text-gray-400">Top APY</div>
                         </div>
                         <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                            <div className="text-2xl font-bold text-white mb-1">{monthlyEstimate ? `$${monthlyEstimate.toLocaleString()}` : '—'}</div>
                            <div className="text-xs text-gray-400">Est. Monthly</div>
                         </div>
                     </div>
                 </div>
                 <div className="flex-1 bg-white/5 p-6 rounded-2xl border border-white/10 w-full max-w-sm">
                     <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-xs">AI</div>
                         <div>
                             <p className="text-sm text-gray-200 mb-3">
                                Detected USDC balance of <strong>${usdcBalanceUsd.toLocaleString()}</strong>. At current APY, estimated monthly yield is <strong>{monthlyEstimate ? `$${monthlyEstimate.toLocaleString()}` : '—'}</strong>.
                             </p>
                             <div className="flex gap-2">
                                 <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                                     Approve Move
                                 </button>
                                 <button className="bg-transparent hover:bg-white/5 text-gray-400 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                                     Dismiss
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Intelligence;
