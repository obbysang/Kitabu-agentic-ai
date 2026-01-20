const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000'

export interface X402Permission {
  targetAddress?: string
  functionSelector?: string
  valueLimit?: string
  tokenAddress?: string
  interval?: number
}

export interface X402SessionConfig {
  orgId: string
  userId: string
  expiresAt: number
  permissions: X402Permission[]
}

export enum X402SessionStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export interface X402Session {
  sessionId: string
  status: X402SessionStatus
  config: X402SessionConfig
  createdAt: number
  updatedAt: number
}
import type { TreasuryOverview, ActivityItem, HistoricalMetric, ChatResponse } from '../types/api'
import type { TokenPrice, GasPrice, YieldOpportunity, RiskCheckRequest, RiskAssessment, Organization, OrgConfig } from '../types/api'

export interface InvoiceMetadata {
  originalFileName: string
  uploadedBy: string
  orgId: string
  mimeType: string
  fileSize: number
}

export type InvoiceStatus =
  | 'uploaded'
  | 'parsed'
  | 'pending_approval'
  | 'scheduled'
  | 'paid'
  | 'failed'

export interface ExtractedInvoiceData {
  destinationAddress: string
  tokenSymbol: string
  amount: string
  dueDate?: string
  invoiceId?: string
  vendorName?: string
  vendorMetadata?: Record<string, unknown>
  confidenceScore: number
  paymentTerms?: string
}

export interface Invoice {
  id: string
  status: InvoiceStatus
  metadata: InvoiceMetadata
  extractedData?: ExtractedInvoiceData
  storagePath: string
  paymentIntentId?: string
  createdAt: number
  updatedAt: number
  approvedBy?: string
  approvalDate?: number
}

export interface X402Intent {
  id: string
  sessionId: string
  type: 'payment'
  payload: Record<string, unknown>
  status: string
  createdAt: number
  updatedAt: number
}

export async function createSession(orgId: string, userId: string, permissions: X402Permission[] = []): Promise<X402Session> {
  const res = await fetch(`${BASE_URL}/x402/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, userId, permissions })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Session creation failed (${res.status})`)
  }
  return (await res.json()) as X402Session
}

export async function createIntent(sessionId: string, type: 'payment', payload: Record<string, unknown>): Promise<X402Intent> {
  const res = await fetch(`${BASE_URL}/x402/intents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, type, payload })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Intent creation failed (${res.status})`)
  }
  return (await res.json()) as X402Intent
}
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('AUTH_TOKEN') : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed (${res.status})`)
  }
  if (res.status === 204) return {} as T
  return await res.json()
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function uploadInvoice(file: File, userId: string, orgId: string, onProgress?: (p: number) => void): Promise<Invoice> {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowed.includes(file.type)) {
    throw new Error('Unsupported file type')
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large')
  }
  if (onProgress) onProgress(10)
  const fileBase64 = await toBase64(file)
  if (onProgress) onProgress(40)
  const res = await fetch(`${BASE_URL}/invoices/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileBase64,
      fileName: file.name,
      userId,
      orgId,
      mimeType: file.type,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Upload failed (${res.status})`)
  }
  if (onProgress) onProgress(80)
  const data = (await res.json()) as Invoice
  if (onProgress) onProgress(100)
  return data
}

export async function parseInvoice(id: string): Promise<Invoice> {
  const res = await fetch(`${BASE_URL}/invoices/${id}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Parsing failed (${res.status})`)
  }
  return (await res.json()) as Invoice
}

export async function approveInvoice(id: string, approverId: string, sessionId: string): Promise<{ invoice: Invoice; intent: X402Intent }> {
  const res = await fetch(`${BASE_URL}/invoices/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approverId, sessionId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Approval failed (${res.status})`)
  }
  return (await res.json()) as { invoice: Invoice; intent: X402Intent }
}

export async function getIntent(id: string): Promise<X402Intent> {
  const res = await fetch(`${BASE_URL}/x402/intents/${id}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Intent retrieval failed')
  }
  return (await res.json()) as X402Intent
}

export async function getTreasuryOverview(): Promise<TreasuryOverview> {
  return await request<TreasuryOverview>('/treasury/overview', { method: 'GET' })
}

export async function getActivityFeed(limit = 20, offset = 0): Promise<ActivityItem[]> {
  return await request<ActivityItem[]>(`/treasury/activity?limit=${limit}&offset=${offset}`, { method: 'GET' })
}

export async function getHistoricalBalances(days = 7): Promise<HistoricalMetric[]> {
  return await request<HistoricalMetric[]>(`/treasury/history?days=${days}`, { method: 'GET' })
}

export async function getTokenPrice(symbol: string): Promise<TokenPrice> {
  return await request<TokenPrice>(`/market/price/${encodeURIComponent(symbol)}`, { method: 'GET' })
}

export async function getGasPrice(network = 'cronos'): Promise<GasPrice> {
  return await request<GasPrice>(`/market/gas?network=${encodeURIComponent(network)}`, { method: 'GET' })
}

export async function getYieldOpportunities(protocol = 'vvs_finance'): Promise<YieldOpportunity[]> {
  return await request<YieldOpportunity[]>(`/market/yields?protocol=${encodeURIComponent(protocol)}`, { method: 'GET' })
}

export async function evaluateRisk(req: RiskCheckRequest): Promise<RiskAssessment> {
  return await request<RiskAssessment>('/market/risk/evaluate', { method: 'POST', body: JSON.stringify(req) })
}

export async function getOrgMe(): Promise<Organization> {
  return await request<Organization>('/orgs/me', { method: 'GET' })
}

export async function getOrgConfig(orgId: string): Promise<OrgConfig> {
  return await request<OrgConfig>(`/orgs/${encodeURIComponent(orgId)}/config`, { method: 'GET' })
}
