import { X402Permission } from './types.js';

export interface OrgPolicy {
  dailySpendLimit: string; // in wei
  allowedTokens: string[]; // addresses
  whitelistedRecipients: string[]; // addresses
  whitelistStrict?: boolean;
}

export class X402RuleEngine {
  /**
   * Converts high-level organization policies into x402 permissions.
   */
  static generatePermissions(policy: OrgPolicy): X402Permission[] {
    const permissions: X402Permission[] = [];

    // 1. Spend Limit Rule
    if (policy.dailySpendLimit) {
      permissions.push({
        valueLimit: policy.dailySpendLimit,
        interval: 24 * 60 * 60, // 1 day in seconds
      });
    }

    // 2. Token Whitelist Rules
    // In a real scenario, this would generate specific contract call permissions
    // for ERC20 transfer methods on these token addresses.
    policy.allowedTokens.forEach(token => {
      permissions.push({
        tokenAddress: token,
        functionSelector: '0xa9059cbb', // standard transfer(address,uint256)
      });
    });

    // 3. Recipient Whitelist Rules
    // This implies that calls are only allowed if the target param matches one of these
    policy.whitelistedRecipients.forEach(recipient => {
      permissions.push({
        targetAddress: recipient,
      });
    });

    return permissions;
  }

  /**
   * Validates if a specific intent is allowed by the current permissions.
   * This is a "dry run" check before sending to the SDK.
   */
  static validateIntentAgainstPolicy(intentPayload: any, policy: OrgPolicy): { allowed: boolean; reason?: string } {
    // Basic mock validation logic
    if (intentPayload.value && BigInt(intentPayload.value) > BigInt(policy.dailySpendLimit)) {
      return { allowed: false, reason: 'Exceeds daily spend limit' };
    }

    if (intentPayload.to && !policy.whitelistedRecipients.includes(intentPayload.to)) {
      if (policy.whitelistStrict) {
        return { allowed: false, reason: 'Recipient not in whitelist' };
      } else if (policy.whitelistedRecipients.length > 0) {
        return { allowed: false, reason: 'Recipient not in whitelist' };
      }
    }

    return { allowed: true };
  }
}
