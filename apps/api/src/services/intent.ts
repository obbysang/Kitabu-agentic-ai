import { Intent, PaymentIntent, YieldIntent, SwapIntent } from '../types.js';
import { z } from 'zod';

// Zod Schemas
export const PaymentIntentSchema = z.object({
  type: z.literal('PAYMENT'),
  token: z.string(),
  amount: z.number().positive(),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  schedule: z.string().optional(),
});

export const YieldIntentSchema = z.object({
  type: z.enum(['YIELD_DEPLOY', 'YIELD_EXIT']),
  token: z.string(),
  amount: z.number().positive(),
  strategy: z.string(),
});

export const SwapIntentSchema = z.object({
  type: z.literal('SWAP'),
  tokenIn: z.string(),
  tokenOut: z.string(),
  amountIn: z.number().positive(),
  amountOutMin: z.number().positive().optional(),
});

export const IntentSchema = z.discriminatedUnion('type', [
  PaymentIntentSchema,
  YieldIntentSchema,
  SwapIntentSchema,
]);

export class IntentService {
  validateIntent(intent: any): { success: boolean; data?: Intent; error?: any } {
    const result = IntentSchema.safeParse(intent);
    if (result.success) {
      return { success: true, data: result.data as Intent };
    } else {
      return { success: false, error: result.error };
    }
  }

  // Business logic validation (e.g. checking whitelists)
  // This would typically interact with a database or config
  async validateBusinessRules(intent: Intent, config: any): Promise<{ allowed: boolean; reason?: string }> {
    if (intent.type === 'PAYMENT') {
      // Check recipient whitelist
      if (config.whitelistedRecipients && !config.whitelistedRecipients.includes(intent.recipient)) {
        return { allowed: false, reason: `Recipient ${intent.recipient} is not whitelisted.` };
      }
      
      // Check spend limits
      if (config.dailyLimit && intent.amount > config.dailyLimit) {
        return { allowed: false, reason: `Amount ${intent.amount} exceeds daily limit of ${config.dailyLimit}.` };
      }
    }

    return { allowed: true };
  }
}
