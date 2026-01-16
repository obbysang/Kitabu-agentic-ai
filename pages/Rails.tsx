import React, { useState } from 'react';
import { Layers, Key, Users, Check, ArrowRight, Wallet } from 'lucide-react';

const Rails: React.FC = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [rows, setRows] = useState([
    { address: '0x71C...9A2', amount: '500' },
    { address: '0x3B2...1C4', amount: '500' },
    { address: '0x9A1...2D3', amount: '750' },
  ]);

  const addRow = () => setRows([...rows, { address: '', amount: '' }]);

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        
        <header className="mb-12">
             <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Layers size={24} /></div>
                 <h1 className="text-3xl font-bold text-slate-900">x402 Payment Rails</h1>
             </div>
            <p className="text-gray-500 max-w-2xl">
                The Execution Layer. Replacing MetaMask popups with Smart Sessions and bundled intents.
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Smart Session Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-fit">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Key size={18} className="text-purple-600" /> Smart Session
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    Sign once to authorize the Agent for a specific budget and time window.
                </p>
                
                <div className={`p-4 rounded-xl border ${sessionActive ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'} mb-6 transition-colors`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold uppercase text-gray-500">Status</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sessionActive ? 'bg-green-200 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                            {sessionActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                    </div>
                    {sessionActive && (
                        <div className="space-y-1 text-xs text-slate-600 font-mono">
                            <div>Limit: 5,000 USDC</div>
                            <div>Expires: 59:42</div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => setSessionActive(!sessionActive)}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${sessionActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                >
                    {sessionActive ? 'Revoke Session' : 'Sign Session (Wallet)'}
                </button>
            </div>

            {/* Right: Batch Payroll Tool */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Users size={20} className="text-blue-500" /> Batch Payroll
                    </h3>
                    <div className="text-sm text-gray-400">
                        x402 Facilitator Bundle
                    </div>
                </div>

                <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 mb-6">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-500 font-semibold">
                            <tr>
                                <th className="p-3 pl-4">Wallet Address</th>
                                <th className="p-3">Amount (USDC)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i} className="border-t border-slate-200">
                                    <td className="p-3 pl-4 font-mono text-slate-700">
                                        {row.address || <span className="text-gray-400">0x...</span>}
                                    </td>
                                    <td className="p-3 font-mono text-slate-700">
                                        {row.amount || '0'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={addRow} className="w-full py-2 text-xs text-blue-600 font-medium hover:bg-blue-50 border-t border-slate-200 transition-colors">
                        + Add Recipient
                    </button>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Total Output</div>
                        <div className="text-2xl font-bold text-slate-900">1,750 <span className="text-sm font-normal text-gray-400">USDC</span></div>
                    </div>
                    <button className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 text-white transition-all ${sessionActive ? 'bg-slate-900 hover:bg-slate-800' : 'bg-gray-300 cursor-not-allowed'}`}>
                        {sessionActive ? <><Check size={18} /> Execute Batch</> : 'Session Required'}
                    </button>
                </div>
            </div>

        </div>

        {/* Diagram section */}
        <div className="mt-12 p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="max-w-md">
                     <h3 className="text-2xl font-bold mb-4">Gas Abstraction</h3>
                     <p className="text-gray-400">
                         The x402 facilitator manages gas execution. You don't need to hold CRO in every payroll wallet, and intent bundling saves ~40% on fees.
                     </p>
                 </div>
                 <div className="flex items-center gap-4 text-sm font-mono">
                     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                         <div className="text-gray-500 mb-1">Standard</div>
                         <div className="text-red-400">5 Txns</div>
                         <div className="text-red-400">~0.15 CRO</div>
                     </div>
                     <ArrowRight size={24} className="text-gray-600" />
                     <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/50 text-center">
                         <div className="text-blue-300 mb-1">x402 Bundle</div>
                         <div className="text-green-400">1 Intent</div>
                         <div className="text-green-400">~0.04 CRO</div>
                     </div>
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Rails;