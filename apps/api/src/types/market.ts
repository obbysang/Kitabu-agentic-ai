export interface TokenPrice {
  symbol: string;
  price: number;
  currency: string; // 'USD'
  timestamp: number;
  source: string; // 'mcp' | 'mock'
}

export interface GasPrice {
  network: string; // 'cronos' | 'cronos_testnet'
  standard: number; // wei
  fast: number; // wei
  instant: number; // wei
  timestamp: number;
}

export interface YieldOpportunity {
  protocol: string; // 'vvs_finance'
  poolId: string;
  tokenPair: string; // 'CRO-USDC'
  apy: number; // percentage, e.g. 5.5 for 5.5%
  tvl: number; // USD
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: number;
}

export interface MarketDataRequest {
  symbols?: string[];
  networks?: string[];
  protocols?: string[];
}

export interface RiskCheckRequest {
  action: 'swap' | 'transfer' | 'yield_deposit';
  token: string;
  amount: number; // in token units
  recipient?: string;
  estimatedGas?: number;
}

export interface RiskAssessment {
  allowed: boolean;
  reason?: string;
  warnings: string[];
  riskScore: number; // 0-100, higher is riskier
  timestamp: number;
}
