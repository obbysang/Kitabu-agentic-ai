export interface OrgConfig {
  maxDailySpend: string; // In wei or base unit
  allowedTokens: string[]; // Contract addresses
  whitelistedRecipients: string[]; // Addresses
  yieldRiskTolerance: 'low' | 'medium' | 'high';
  targetUtilization: number; // 0-100 percentage
  requireApprovalAbove: string; // Amount above which approval is needed
}

export interface Organization {
  id: string;
  name: string;
  vaultAddress: string;
  x402SessionId?: string;
  config: OrgConfig;
  createdAt: number;
  updatedAt: number;
}
