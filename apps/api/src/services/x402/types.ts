import { PaymentRequirements, VerifyRequest } from '@crypto.com/facilitator-client';

export enum X402SessionStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum X402IntentStatus {
  CREATED = 'created',
  PROCESSING = 'processing',
  PENDING = 'pending',
  SETTLED = 'settled',
  FAILED = 'failed',
}

export interface X402SessionConfig {
  orgId: string;
  userId: string;
  expiresAt: number;
  permissions: X402Permission[];
}

export interface X402Permission {
  targetAddress?: string; // If restricted to specific contract/address
  functionSelector?: string; // If restricted to specific function
  valueLimit?: string; // Max value per tx in wei
  tokenAddress?: string; // If restricted to specific token
  interval?: number; // Time window for limits
}

export interface X402Session {
  sessionId: string;
  status: X402SessionStatus;
  config: X402SessionConfig;
  createdAt: number;
  updatedAt: number;
}

export interface X402Intent {
  id: string;
  sessionId: string;
  type: 'payment' | 'yield' | 'swap' | 'custom' | 'batch';
  payload: any; // The raw execution payload
  status: X402IntentStatus;
  txHash?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
  
  // Real SDK fields (optional for now)
  paymentRequirements?: PaymentRequirements;
  verifyRequest?: VerifyRequest;
}

export interface X402ExecutionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface X402ClientLike {
  createSession(config: X402SessionConfig): Promise<string>;
  executeIntent(sessionId: string, payload: any): Promise<X402ExecutionResult>;
  getSessionStatus(sessionId: string): Promise<{ active: boolean } | null>;
}
