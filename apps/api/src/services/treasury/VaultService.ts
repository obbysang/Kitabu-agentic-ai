import { publicClient, walletClient, treasuryVaultAddress } from '../../config/chain.js';
import TreasuryVaultABI from '../../abis/TreasuryVault.json' assert { type: 'json' };
import { getContract, formatEther, parseEther } from 'viem';

export class VaultService {
  private contract: any;

  constructor() {
    if (!treasuryVaultAddress) {
      console.warn('TREASURY_VAULT_ADDRESS not set');
    }
    
    // We initialize the contract with publicClient for read operations
    this.contract = getContract({
      address: treasuryVaultAddress,
      abi: TreasuryVaultABI,
      client: { public: publicClient, wallet: walletClient || undefined },
    });
  }

  async getBalance() {
    if (!this.contract) return '0';
    try {
      const balance = await publicClient.getBalance({ address: treasuryVaultAddress });
      return formatEther(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  async getOwner() {
    if (!this.contract) return null;
    try {
      return await this.contract.read.owner();
    } catch (error) {
      console.error('Error fetching owner:', error);
      throw error;
    }
  }

  async isAgentAuthorized(agentAddress: `0x${string}`) {
    if (!this.contract) return false;
    try {
      return await this.contract.read.authorizedAgents([agentAddress]);
    } catch (error) {
      console.error('Error checking agent authorization:', error);
      throw error;
    }
  }

  async setAgent(agentAddress: `0x${string}`, status: boolean) {
    if (!walletClient) throw new Error('Wallet client not initialized (missing private key)');
    try {
      const hash = await this.contract.write.setAgent([agentAddress, status]);
      return hash;
    } catch (error) {
      console.error('Error setting agent:', error);
      throw error;
    }
  }

  async withdrawCRO(recipient: `0x${string}`, amount: string) {
    if (!walletClient) throw new Error('Wallet client not initialized (missing private key)');
    try {
      const hash = await this.contract.write.withdrawCRO([recipient, parseEther(amount)]);
      return hash;
    } catch (error) {
      console.error('Error withdrawing CRO:', error);
      throw error;
    }
  }
}
