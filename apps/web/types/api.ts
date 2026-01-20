export interface TreasuryBalance {
  tokenSymbol: string;
  tokenAddress: string;
  amount: string; // BigInt string
  decimals: number;
  usdValue: number;
}

export interface TreasuryOverview {
  totalUsdValue: number;
  balances: TreasuryBalance[];
  pendingPaymentsCount: number;
  pendingPaymentsTotalUsd: number;
  yieldPositionsTotalUsd: number;
  lastUpdated: number;
}

export interface ActivityItem {
  id: string;
  type: 'payment' | 'yield' | 'invoice' | 'system';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  amount?: string;
  token?: string;
  timestamp: number;
  txHash?: string;
  metadata?: Record<string, any>;
}

export interface HistoricalMetric {
  timestamp: number;
  totalValueUsd: number;
}

export interface ChatRequest {
  message: string;
  userId?: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  message: string;
  intent?: any;
  safetyCheck?: {
    safe: boolean;
    reason?: string;
  };
  safetyViolation?: boolean;
}

export type InvoiceStatus =
  | 'uploaded'
  | 'parsed'
  | 'pending_approval'
  | 'scheduled'
  | 'paid'
  | 'failed'

export interface InvoiceMetadata {
  originalFileName: string
  uploadedBy: string
  orgId: string
  mimeType: string
  fileSize: number
}

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

export interface TokenPrice {
  symbol: string
  price: number
  currency: string
  timestamp: number
  source: string
}

export interface GasPrice {
  network: string
  standard: number
  fast: number
  instant: number
  timestamp: number
}

export interface YieldOpportunity {
  protocol: string
  poolId: string
  tokenPair: string
  apy: number
  tvl: number
  riskLevel: 'low' | 'medium' | 'high'
  timestamp: number
}

export interface RiskCheckRequest {
  action: 'swap' | 'transfer' | 'yield_deposit'
  token: string
  amount: number
  recipient?: string
  estimatedGas?: number
}

export interface RiskAssessment {
  allowed: boolean
  reason?: string
  warnings: string[]
  riskScore: number
  timestamp: number
}

export interface OrgConfig {
  maxDailySpend: string
  allowedTokens: string[]
  whitelistedRecipients: string[]
  yieldRiskTolerance: 'low' | 'medium' | 'high'
  targetUtilization: number
  requireApprovalAbove: string
  whitelistStrict?: boolean
  dualApprovalRequired?: boolean
}

export interface Organization {
  id: string
  name: string
  vaultAddress: string
  x402SessionId?: string
  config: OrgConfig
  createdAt: number
  updatedAt: number
}
