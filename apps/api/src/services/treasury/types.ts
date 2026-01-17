
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
