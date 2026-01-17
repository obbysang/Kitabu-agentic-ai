import { Organization, OrgConfig } from '../../types/org.js';
import { v4 as uuidv4 } from 'uuid';

export class OrgService {
  private orgs: Map<string, Organization> = new Map();

  constructor() {
    // Seed a default org
    this.create({
      name: 'Kitabu Demo Corp',
      vaultAddress: process.env.TREASURY_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000',
      config: {
        maxDailySpend: '1000000000000000000', // 1 ETH
        allowedTokens: ['0x55d398326f99059ff775485246999027b3197955'], // USDT
        whitelistedRecipients: [],
        yieldRiskTolerance: 'low',
        targetUtilization: 20,
        requireApprovalAbove: '500000000000000000' // 0.5 ETH
      }
    });
  }

  async create(data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const id = uuidv4();
    const now = Date.now();
    const org: Organization = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.orgs.set(id, org);
    return org;
  }

  async getById(id: string): Promise<Organization | null> {
    return this.orgs.get(id) || null;
  }

  async updateConfig(id: string, config: Partial<OrgConfig>): Promise<Organization | null> {
    const org = this.orgs.get(id);
    if (!org) return null;

    org.config = { ...org.config, ...config };
    org.updatedAt = Date.now();
    this.orgs.set(id, org);
    return org;
  }
  
  // For demo purposes, get the first org
  async getDefaultOrg(): Promise<Organization | null> {
    const iterator = this.orgs.values();
    const first = iterator.next().value;
    return first || null;
  }
}
