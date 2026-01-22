import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RWAInvoices from '../pages/RWAInvoices'

function makeFile(type: string, size: number) {
  const blob = new Blob([new Uint8Array(size)], { type })
  return new File([blob], 'invoice.pdf', { type })
}

function setup() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  }
}

describe('RWAInvoices component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders and handles upload flow', async () => {
    const inv = { id: 'id1', status: 'uploaded', metadata: { originalFileName: 'invoice.pdf', uploadedBy: 'u', orgId: 'o', mimeType: 'application/pdf', fileSize: 1024 }, storagePath: '/tmp/x', createdAt: Date.now(), updatedAt: Date.now() }
    const parsed = { ...inv, status: 'parsed', extractedData: { destinationAddress: '0xabc', tokenSymbol: 'USDC', amount: '10.00', vendorName: 'Acme', confidenceScore: 0.9 } }
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ sessionId: 's1' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => inv })
      .mockResolvedValueOnce({ ok: true, json: async () => parsed })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ invoice: parsed, intent: { id: 'intent1', sessionId: 's1', type: 'payment', payload: {}, status: 'created', createdAt: Date.now(), updatedAt: Date.now() } }) })
    )
    
    const { wrapper } = setup()
    render(<RWAInvoices />, { wrapper })
    
    const button = screen.getByText(/Browse Files/i)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = makeFile('application/pdf', 1024)
    Object.defineProperty(fileInput, 'files', { value: [file] })
    fireEvent.click(button)
    fireEvent.change(fileInput)
    await waitFor(() => expect(screen.getByText(/Extraction successful/i)).toBeInTheDocument())
  })
})
