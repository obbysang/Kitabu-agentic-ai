import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadInvoice, parseInvoice, approveInvoice } from '../lib/api'

function makeFile(type: string, size: number) {
  const blob = new Blob([new Uint8Array(size)], { type })
  return new File([blob], 'test.' + (type.includes('pdf') ? 'pdf' : type.includes('jpeg') ? 'jpg' : 'png'), { type })
}

describe('API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unsupported file type', async () => {
    const file = makeFile('text/plain', 100)
    await expect(uploadInvoice(file, 'u', 'o')).rejects.toThrow()
  })

  it('rejects oversized file', async () => {
    const file = makeFile('application/pdf', 11 * 1024 * 1024)
    await expect(uploadInvoice(file, 'u', 'o')).rejects.toThrow()
  })

  it('uploads and parses invoice', async () => {
    const file = makeFile('application/pdf', 1024)
    const inv = { id: 'id1', status: 'uploaded', metadata: { originalFileName: 'x', uploadedBy: 'u', orgId: 'o', mimeType: 'application/pdf', fileSize: 1024 }, storagePath: '/tmp/x', createdAt: Date.now(), updatedAt: Date.now() }
    const parsed = { ...inv, status: 'parsed', extractedData: { destinationAddress: '0xabc', tokenSymbol: 'USDC', amount: '10.00', confidenceScore: 0.9 } }
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => inv })
      .mockResolvedValueOnce({ ok: true, json: async () => parsed })
    )
    const uploaded = await uploadInvoice(file, 'u', 'o')
    expect(uploaded.id).toBe('id1')
    const res = await parseInvoice(uploaded.id)
    expect(res.status).toBe('parsed')
  })

  it('approves invoice', async () => {
    const resp = { invoice: { id: 'id1', status: 'pending_approval', metadata: { originalFileName: 'x', uploadedBy: 'u', orgId: 'o', mimeType: 'application/pdf', fileSize: 1024 }, storagePath: '/tmp/x', createdAt: Date.now(), updatedAt: Date.now() }, intent: { id: 'intent1', sessionId: 's1', type: 'payment', payload: {}, status: 'created', createdAt: Date.now(), updatedAt: Date.now() } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => resp }))
    const result = await approveInvoice('id1', 'u', 's1')
    expect(result.intent.id).toBe('intent1')
  })
})
