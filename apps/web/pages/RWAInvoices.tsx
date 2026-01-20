import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, CheckCircle, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import { useMutation } from '@tanstack/react-query';
import { uploadInvoice, parseInvoice, approveInvoice, ExtractedInvoiceData, Invoice } from '../lib/api';

const RWAInvoices: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<ExtractedInvoiceData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const createSession = async () => {
    const res = await fetch(((import.meta.env.VITE_API_URL as string) || 'http://localhost:3000') + '/x402/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: 'org-1', userId: 'user-1', permissions: [] })
    })
    if (!res.ok) throw new Error('Session creation failed')
    const data = await res.json()
    return data.sessionId as string
  }

  const onFileSelected = async (file: File) => {
    setError(null)
    setStatus('uploading')
    setProgress(0)
    try {
      const inv = await uploadInvoice(file, 'user-1', 'org-1', p => setProgress(p))
      setInvoice(inv)
      setStatus('parsing')
      const parsed = await parseInvoice(inv.id)
      setInvoice(parsed)
      setForm(parsed.extractedData || null)
      setStatus('complete')
    } catch (e: any) {
      setError(e.message || 'Unexpected error')
      setStatus('error')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0]
      onFileSelected(f)
    }
  };

  const validateForm = (data: ExtractedInvoiceData | null) => {
    if (!data) return false
    if (!data.destinationAddress || !data.destinationAddress.startsWith('0x')) return false
    if (!data.amount || isNaN(parseFloat(data.amount))) return false
    if (!data.tokenSymbol) return false
    if (!data.vendorName) return false
    return true
  }

  const mutationApprove = useMutation({
    mutationFn: async () => {
      if (!invoice || !form) throw new Error('No invoice')
      if (!validateForm(form)) throw new Error('Incomplete or invalid data')
      const sid = sessionId || await createSession()
      setSessionId(sid)
      const updated: Invoice = { ...invoice, extractedData: form }
      setInvoice(updated)
      const res = await approveInvoice(updated.id, 'user-1', sid)
      return res
    },
    onError: (e: any) => {
      setError(e.message || 'Approval failed')
    }
  })

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <header className="text-center mb-12 anim-card opacity-0">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">RWA Invoice Settlement</h1>
            <p className="text-gray-500">Upload an invoice. AI extracts payment details for x402 settlement.</p>
        </header>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden anim-card opacity-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
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
                        ) : status === 'error' ? (
                            <AlertTriangle size={32} className="text-red-600" />
                        ) : (
                            <Upload size={32} />
                        )}
                    </div>
                    
                    {status === 'idle' && (
                        <div className="flex flex-col items-center">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Drag & Drop Invoice</h3>
                            <p className="text-sm text-gray-500 mb-6">or click to browse PDF, JPG, PNG</p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) onFileSelected(f)
                              }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
                            >Browse Files</button>
                        </div>
                    )}

                    {status === 'uploading' && (
                      <div className="w-full">
                        <p className="text-slate-900 font-medium mb-3">Uploading document</p>
                        <div className="w-full h-2 bg-slate-100 rounded-full">
                          <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{Math.round(progress)}%</p>
                      </div>
                    )}
                    {status === 'parsing' && <p className="text-blue-600 font-medium">AI extracting data</p>}
                    {status === 'complete' && <p className="text-green-600 font-medium">Extraction successful</p>}
                    {status === 'error' && <p className="text-red-600 font-medium">{error}</p>}
                </div>

                <div className="p-10 bg-slate-50 flex flex-col justify-center">
                    {status === 'complete' && form ? (
                        <div className="space-y-6 animate-fade-in-up">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Extracted Details</h3>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4 space-y-3">
                                    <label className="block">
                                      <span className="text-xs text-gray-500">Payee Address</span>
                                      <input
                                        value={form.destinationAddress}
                                        onChange={(e) => setForm({ ...form, destinationAddress: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-xs text-gray-500">Token</span>
                                      <input
                                        value={form.tokenSymbol}
                                        onChange={(e) => setForm({ ...form, tokenSymbol: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-xs text-gray-500">Amount</span>
                                      <input
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                      />
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                      <label className="block">
                                        <span className="text-xs text-gray-500">Invoice Number</span>
                                        <input
                                          value={form.invoiceId || ''}
                                          onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
                                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        />
                                      </label>
                                      <label className="block">
                                        <span className="text-xs text-gray-500">Due Date</span>
                                        <input
                                          type="date"
                                          value={form.dueDate ? form.dueDate.substring(0, 10) : ''}
                                          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        />
                                      </label>
                                    </div>
                                    <label className="block">
                                      <span className="text-xs text-gray-500">Vendor</span>
                                      <input
                                        value={form.vendorName || ''}
                                        onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="text-xs text-gray-500">Payment Terms</span>
                                      <input
                                        value={form.paymentTerms || ''}
                                        onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                      />
                                    </label>
                                </div>
                            <button
                              onClick={() => mutationApprove.mutate()}
                              disabled={!validateForm(form)}
                              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                            >
                                Submit for x402 Settlement <ArrowRight size={16} />
                            </button>
                            {mutationApprove.isPending && <p className="text-blue-600 text-sm">Submitting</p>}
                            {mutationApprove.isSuccess && (
                              <div className="text-sm text-green-700">
                                <div>Intent created</div>
                                <div className="font-mono">{mutationApprove.data.intent.id}</div>
                              </div>
                            )}
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            </div>
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
