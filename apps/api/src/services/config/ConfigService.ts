import { OrgService } from '../org/OrgService.js';
import { OrgConfig } from '../../types/org.js';

export class ConfigService {
  constructor(private orgService: OrgService) {}

  async updateConfig(orgId: string, updates: Partial<OrgConfig>) {
    // Add validation logic here
    if (updates.targetUtilization && (updates.targetUtilization < 0 || updates.targetUtilization > 100)) {
      throw new Error('Target utilization must be between 0 and 100');
    }

    if (updates.yieldRiskTolerance && !['low', 'medium', 'high'].includes(updates.yieldRiskTolerance)) {
      throw new Error('Invalid risk tolerance level');
    }

    return this.orgService.updateConfig(orgId, updates);
  }

  async getConfig(orgId: string) {
    const org = await this.orgService.getById(orgId);
    if (!org) throw new Error('Organization not found');
    return org.config;
  }
}
