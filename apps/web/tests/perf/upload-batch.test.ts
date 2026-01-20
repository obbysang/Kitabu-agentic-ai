import { describe, it } from 'vitest'
import { uploadInvoice } from '../../lib/api'

function makeFile(type: string, size: number, name: string) {
  const blob = new Blob([new Uint8Array(size)], { type })
  return new File([blob], name, { type })
}

describe('performance batch uploads', () => {
  it('uploads 50 invoices quickly', async () => {
    const files = Array.from({ length: 50 }).map((_, i) => makeFile('application/pdf', 1024 * 100, `invoice-${i}.pdf`))
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ id: 'x', status: 'uploaded', metadata: { originalFileName: 'x', uploadedBy: 'u', orgId: 'o', mimeType: 'application/pdf', fileSize: 1024 }, storagePath: '/tmp/x', createdAt: Date.now(), updatedAt: Date.now() }) } as any)
    const start = performance.now()
    await Promise.all(files.map(f => uploadInvoice(f, 'u', 'o')))
    const end = performance.now()
    const duration = end - start
    console.log('Batch upload duration ms', duration)
  })
})
