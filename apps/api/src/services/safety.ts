import { Intent } from '../types.js';

export interface SafetyPolicy {
  maxDailySpend: number;
  maxTransactionAmount: number;
  allowedTokens: string[];
  requireApprovalAbove: number;
}

export class SafetyService {
  private config: SafetyPolicy;

  constructor(config: SafetyPolicy) {
    this.config = config;
  }

  checkPolicy(intent: Intent): { safe: boolean; reason?: string; requiresApproval?: boolean } {
    // Token check
    if (intent.type === 'PAYMENT' || intent.type === 'YIELD_DEPLOY' || intent.type === 'SWAP') {
      const token = intent.type === 'SWAP' ? intent.tokenIn : intent.token; // checking input token
      if (!this.config.allowedTokens.includes(token)) {
        return { safe: false, reason: `Token ${token} is not allowed.` };
      }
    }

    // Amount checks
    let amount = 0;
    if (intent.type === 'PAYMENT' || intent.type === 'YIELD_DEPLOY') {
      amount = intent.amount;
    } else if (intent.type === 'SWAP') {
      amount = intent.amountIn;
    }

    if (amount > this.config.maxTransactionAmount) {
      return { safe: false, reason: `Transaction amount ${amount} exceeds maximum allowed per transaction (${this.config.maxTransactionAmount}).` };
    }

    if (amount > this.config.requireApprovalAbove) {
        return { safe: true, requiresApproval: true, reason: `Amount ${amount} requires manual approval.` };
    }

    // TODO: Implement daily spend check (requires state/DB)

    return { safe: true };
  }

  logSecurityEvent(eventType: string, details: any) {
      console.log(`[SECURITY] ${new Date().toISOString()} - ${eventType}:`, JSON.stringify(details));
  }
}
