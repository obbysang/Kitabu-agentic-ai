import React, { useState } from 'react';
import { TrendingUp, RefreshCcw, AlertCircle, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CalculatorSection: React.FC = () => {
  const [idleCash, setIdleCash] = useState(50000);
  const [apy, setApy] = useState(12); // VVS Finance APY

  const monthlyEarnings = Math.round((idleCash * (apy / 100)) / 12);
  const yearlyEarnings = Math.round(idleCash * (apy / 100));

  const chartData = [
    { name: 'Holding (0%)', value: idleCash },
    { name: 'VVS Yield (12%)', value: idleCash + yearlyEarnings },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 mb-4">
            <TrendingUp size={16} />
            <span>Idle Cash Detection</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-medium text-slate-900 mb-6 relative inline-block">
            Don't let your treasury sleep
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500">
            Kitabu's AI monitors your wallet for idle funds and suggests safe, high-yield opportunities on <strong>VVS Finance</strong> automatically.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Calculator Controls */}
            <div className="lg:col-span-7 bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700 uppercase">Idle USDC Balance</label>
                        <span className="text-2xl font-bold text-slate-900">${idleCash.toLocaleString()}</span>
                    </div>
                    <input 
                        type="range" 
                        min="1000" 
                        max="500000" 
                        step="1000"
                        value={idleCash}
                        onChange={(e) => setIdleCash(Number(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>$1k</span>
                        <span>$500k</span>
                    </div>
                </div>

                <div className="mb-8">
                     <div className="flex justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700 uppercase flex items-center gap-2">
                            Projected APY <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">Live from VVS</span>
                        </label>
                        <span className="text-2xl font-bold text-green-600">{apy}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="2" 
                        max="50" 
                        value={apy}
                        onChange={(e) => setApy(Number(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-gray-500 text-xs mb-1">Monthly Extra Income</div>
                        <div className="text-3xl font-bold text-slate-900">+${monthlyEarnings.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-gray-500 text-xs mb-1">Yearly Extra Income</div>
                        <div className="text-3xl font-bold text-slate-900">+${yearlyEarnings.toLocaleString()}</div>
                    </div>
                </div>

                <div className="mt-8 bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-blue-800">
                        <strong>AI Insight:</strong> Moving these funds to the VVS/USDC pool is currently optimal. Gas fees are low (~0.05 CRO).
                    </p>
                </div>
            </div>

            {/* Right Column: Visual Outcome */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-slate-900 text-white rounded-3xl p-8 h-full flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/20 blur-[80px] rounded-full"></div>
                    
                    <div>
                        <h3 className="text-2xl font-medium mb-2">Optimize with one click</h3>
                        <p className="text-gray-400 text-sm">
                            The AI Agent handles the bridging, swapping, and staking. You just say "Yes".
                        </p>
                    </div>

                    <div className="h-48 mt-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.1)'}}
                                    contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}}
                                />
                                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 1 ? '#4ade80' : '#475569'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <button className="w-full bg-white text-black py-3 rounded-full font-semibold flex items-center justify-center gap-2 mt-6 hover:bg-gray-100 transition-colors">
                        Activate Auto-Invest <ArrowRight size={16} />
                    </button>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;