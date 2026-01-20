import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Intelligence from '../pages/Intelligence'

function mockResponse(data: any, ok = true, status = 200) {
  return { ok, status, json: async () => data }
}

function setup() {
  const client = new QueryClient()
  return {
    ui: (
      <QueryClientProvider client={client}>
        <Intelligence />
      </QueryClientProvider>
    )
  }
}

describe('Intelligence Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders live market feed with real data', async () => {
    const now = Date.now()
    const spy = vi.fn((url: string) => {
      if (url.includes('/market/price/')) return Promise.resolve(mockResponse({ symbol: 'CRO', price: 0.0845, currency: 'USD', timestamp: now, source: 'mcp' }))
      if (url.includes('/market/gas')) return Promise.resolve(mockResponse({ network: 'cronos', standard: 120000000000n, fast: 140000000000n, instant: 160000000000n, timestamp: now }))
      if (url.includes('/market/yields')) return Promise.resolve(mockResponse([{ protocol: 'vvs_finance', poolId: 'usdc-cro', tokenPair: 'USDC-CRO', apy: 12.4, tvl: 1000000, riskLevel: 'medium', timestamp: now }]))
      if (url.includes('/treasury/overview')) return Promise.resolve(mockResponse({ totalUsdValue: 100000, balances: [{ tokenSymbol: 'USDC', tokenAddress: '0x', amount: '10000000000', decimals: 6, usdValue: 10000 }], pendingPaymentsCount: 0, pendingPaymentsTotalUsd: 0, yieldPositionsTotalUsd: 0, lastUpdated: now }))
      if (url.includes('/orgs/me')) return Promise.resolve({ ok: false, status: 401, json: async () => ({ error: 'Unauthorized' }) })
      return Promise.resolve(mockResponse({}))
    })
    vi.stubGlobal('fetch', spy as any)
    const { ui } = setup()
    render(ui)
    await waitFor(() => expect(screen.getByText('Market Data MCP')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/Gas \(Gwei\)/)).toBeInTheDocument())
  })
})
