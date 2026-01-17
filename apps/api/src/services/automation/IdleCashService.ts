import { AutomationRuleService } from './AutomationRuleService.js';
import { TreasuryService } from '../treasury/TreasuryService.js';
import { X402Orchestrator } from '../x402/orchestrator.js';
import { AutomationType } from './types.js';

export class IdleCashService {
  private systemSessionId: string | undefined;

  constructor(
    private ruleService: AutomationRuleService,
    private treasuryService: TreasuryService,
    private orchestrator: X402Orchestrator
  ) {}

  setSystemSessionId(sessionId: string) {
    this.systemSessionId = sessionId;
  }

  async checkAndExecute() {
    console.log('[IdleCashService] Checking for idle cash...');
    const rules = await this.ruleService.getAllEnabledRules();
    
    for (const rule of rules) {
      if (rule.type === AutomationType.IDLE_CASH_YIELD) {
        await this.processIdleCashRule(rule);
      }
    }
  }

  private async processIdleCashRule(rule: any) {
    const balances = await this.treasuryService.getBalances(rule.orgId);
    const targetToken = balances.find(b => b.tokenAddress === rule.config.targetToken || b.tokenSymbol === rule.config.targetToken);

    if (!targetToken) return;

    const balance = BigInt(targetToken.amount);
    const threshold = BigInt(rule.config.thresholdAmount);
    const minKeep = BigInt(rule.config.minKeepAmount || '0');

    if (balance > threshold) {
      const amountToInvest = balance - minKeep;
      if (amountToInvest <= 0) return;

      console.log(`[IdleCashService] Found idle cash for rule ${rule.id}: ${amountToInvest.toString()} ${targetToken.tokenSymbol}`);

      // Create intent
      // Using a dedicated system session for automation
      const sessionId = this.systemSessionId;
      if (!sessionId) {
        console.error('[IdleCashService] System session ID not set');
        return;
      }
      
      try {
        await this.orchestrator.createIntent(sessionId, 'yield', {
          protocol: 'VVS',
          pool: rule.config.targetPool,
          token: targetToken.tokenAddress,
          amount: amountToInvest.toString()
        });
        console.log(`[IdleCashService] Created yield intent for rule ${rule.id}`);
      } catch (error) {
        console.error(`[IdleCashService] Failed to create intent:`, error);
      }
    }
  }

  start(intervalMs: number = 60000) {
    console.log('[IdleCashService] Starting automation engine...');
    // Run immediately then schedule
    this.checkAndExecute();
    setInterval(() => this.checkAndExecute(), intervalMs);
  }
}
