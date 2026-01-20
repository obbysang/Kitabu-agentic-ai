import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTokenPrice, getGasPrice, getYieldOpportunities, getTreasuryOverview, getOrgMe, getOrgConfig } from '../lib/api'

function mockResponse(data: any, ok = true, status = 200) {
  return { ok, status, json: async () => data }
}

describe('Market & Treasury API', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('fetches token price', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({ symbol: 'CRO', price: 0.0845, currency: 'USD', timestamp: Date.now(), source: 'mcp' })))
    const price = await getTokenPrice('CRO')
    expect(price.symbol).toBe('CRO')
    expect(price.price).toBeGreaterThan(0)
  })

  it('fetches gas price', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({ network: 'cronos', standard: 100000000000n, fast: 120000000000n, instant: 150000000000n, timestamp: Date.now() })))
    const gas = await getGasPrice('cronos')
    expect(gas.network).toBe('cronos')
  })

  it('fetches yield opportunities', async () => {
    const yields = [{ protocol: 'vvs_finance', poolId: 'usdc-cro', tokenPair: 'USDC-CRO', apy: 12.4, tvl: 1000000, riskLevel: 'medium', timestamp: Date.now() }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(yields)))
    const res = await getYieldOpportunities('vvs_finance')
    expect(res.length).toBeGreaterThan(0)
    expect(res[0].protocol).toBe('vvs_finance')
  })

  it('injects Authorization header when token present', async () => {
    localStorage.setItem('AUTH_TOKEN', 'abc123')
    const spy = vi.fn().mockResolvedValue(mockResponse({ totalUsdValue: 0, balances: [], pendingPaymentsCount: 0, pendingPaymentsTotalUsd: 0, yieldPositionsTotalUsd: 0, lastUpdated: Date.now() }))
    vi.stubGlobal('fetch', spy)
    await getTreasuryOverview()
    const call = spy.mock.calls[0]
    const options = call[1]
    expect(options.headers.Authorization).toContain('Bearer')
  })

  it('fetches org and config with auth', async () => {
    localStorage.setItem('AUTH_TOKEN', 'abc123')
    const org = { id: 'org-1', name: 'Kitabu', vaultAddress: '0x1', config: { maxDailySpend: '1000000000000000000', allowedTokens: [], whitelistedRecipients: [], yieldRiskTolerance: 'medium', targetUtilization: 80, requireApprovalAbove: '0' }, createdAt: Date.now(), updatedAt: Date.now() }
    const config = org.config
    const spy = vi.fn()
      .mockResolvedValueOnce(mockResponse(org))
      .mockResolvedValueOnce(mockResponse(config))
    vi.stubGlobal('fetch', spy)
    const me = await getOrgMe()
    expect(me.id).toBe('org-1')
    const cfg = await getOrgConfig(me.id)
    expect(cfg.maxDailySpend).toBeDefined()
  })
})
