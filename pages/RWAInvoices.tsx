import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

const RWAInvoices: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'complete'>('idle');
  const [result, setResult] = useState<{address: string, amount: string} | null>(null);

  useEffect(() => {
    gsap.fromTo('.anim-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = () => {
      setStatus('uploading');
      setTimeout(() => {
          setStatus('parsing');
          setTimeout(() => {
              setStatus('complete');
              setResult({
                  address: '0x8920...2Ba1',
                  amount: '1,250.00'
              });
          }, 1500);
      }, 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile();
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <header className="text-center mb-12 anim-card opacity-0">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">RWA Invoice Settlement</h1>
            <p className="text-gray-500">Upload a PDF invoice. The AI will extract the payment details for x402 settlement.</p>
        </header>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden anim-card opacity-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
                
                {/* Upload Area */}
                <div 
                    className={`p-10 flex flex-col items-center justify-center text-center transition-colors border-b md:border-b-0 md:border-r border-slate-100 ${dragActive ? 'bg-blue-50' : 'bg-white'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                        {status === 'uploading' || status === 'parsing' ? (
                            <Loader2 size={32} className="animate-spin" />
                        ) : status === 'complete' ? (
                            <CheckCircle size={32} className="text-green-600" />
                        ) : (
                            <Upload size={32} />
                        )}
                    </div>
                    
                    {status === 'idle' && (
                        <>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Drag & Drop Invoice</h3>
                            <p className="text-sm text-gray-500 mb-6">or click to browse PDF files</p>
                            <button 
                                onClick={processFile} // Simulate click upload
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
                            >
                                Browse Files
                            </button>
                        </>
                    )}

                    {status === 'uploading' && <p className="text-slate-900 font-medium">Uploading document...</p>}
                    {status === 'parsing' && <p className="text-blue-600 font-medium">AI Extracting data...</p>}
                    {status === 'complete' && <p className="text-green-600 font-medium">Extraction Successful!</p>}
                </div>

                {/* Result Area */}
                <div className="p-10 bg-slate-50 flex flex-col justify-center">
                    {status === 'complete' && result ? (
                        <div className="space-y-6 animate-fade-in-up">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Extracted Details</h3>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
                                    <div className="text-xs text-gray-500 mb-1">Payee Address</div>
                                    <div className="text-slate-900 font-mono font-medium">{result.address}</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                                    <div className="text-2xl text-slate-900 font-bold">{result.amount} USDC</div>
                                </div>
                            </div>
                            
                            <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                                Add to x402 Queue <ArrowRight size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center opacity-50">
                            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-400 text-sm">Upload an invoice to see extracted payment details here.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default RWAInvoices;