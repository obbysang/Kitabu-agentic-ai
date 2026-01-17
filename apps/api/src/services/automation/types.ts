export enum AutomationType {
  IDLE_CASH_YIELD = 'idle_cash_yield',
  LOW_BALANCE_REBALANCE = 'low_balance_rebalance',
}

export interface AutomationRule {
  id: string;
  orgId: string;
  type: AutomationType;
  enabled: boolean;
  config: {
    thresholdAmount: string; // e.g. "10000" (USDC)
    targetToken: string; // e.g. USDC address
    targetPool?: string; // e.g. VVS pool address
    minKeepAmount?: string; // Buffer to keep
  };
  createdAt: number;
  updatedAt: number;
}
