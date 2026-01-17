import { AutomationRule, AutomationType } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class AutomationRuleService {
  private rules: Map<string, AutomationRule> = new Map();

  constructor() {
    // Seed some demo rules
    this.createRule('demo-org', AutomationType.IDLE_CASH_YIELD, {
      thresholdAmount: '1000000000', // 1000 USDC
      targetToken: 'USDC',
      targetPool: 'VVS-USDC-CRO',
      minKeepAmount: '100000000' // 100 USDC buffer
    });
  }

  async createRule(orgId: string, type: AutomationType, config: any): Promise<AutomationRule> {
    const rule: AutomationRule = {
      id: uuidv4(),
      orgId,
      type,
      enabled: true,
      config,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.rules.set(rule.id, rule);
    return rule;
  }

  async getRulesByOrg(orgId: string): Promise<AutomationRule[]> {
    return Array.from(this.rules.values()).filter(r => r.orgId === orgId);
  }
    
  async getAllEnabledRules(): Promise<AutomationRule[]> {
    return Array.from(this.rules.values()).filter(r => r.enabled);
  }

  async toggleRule(ruleId: string, enabled: boolean): Promise<AutomationRule | undefined> {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      rule.updatedAt = Date.now();
      this.rules.set(ruleId, rule);
    }
    return rule;
  }
}
