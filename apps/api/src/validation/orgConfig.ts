import { z } from 'zod';

export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address');

export const orgConfigUpdateSchema = z.object({
  maxDailySpend: z.string().regex(/^\d+$/, 'Must be numeric').optional(),
  allowedTokens: z.array(addressSchema).min(1).optional(),
  whitelistedRecipients: z.array(addressSchema).optional(),
  yieldRiskTolerance: z.enum(['low', 'medium', 'high']).optional(),
  targetUtilization: z.number().min(0).max(100).optional(),
  requireApprovalAbove: z.string().regex(/^\d+$/, 'Must be numeric').optional(),
  whitelistStrict: z.boolean().optional(),
  dualApprovalRequired: z.boolean().optional(),
});

export const validate =
  (schema: z.ZodSchema<any>) =>
  (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        code: 'validation_error',
        message: 'Invalid request body',
        context: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };
