import { X402ExecutionResult, X402SessionConfig, X402ClientLike } from './types.js';
import { Facilitator, CronosNetwork } from '@crypto.com/facilitator-client';
import { createWalletClient, http, publicActions, WalletClient, Account, Hash, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { cronos, cronosTestnet } from 'viem/chains';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../utils/logger.js';

dotenv.config();

/**
 * Real implementation of the Cronos x402 Facilitator Client.
 * Handles interaction with the x402 protocol for payment execution.
 */
export class X402Client implements X402ClientLike {
  private facilitator: Facilitator;
  private client: any; // Using any to avoid complex type issues with viem extensions in this context
  private logger: Logger;
  private account: Account;

  constructor() {
    this.logger = new Logger('X402Client');
    
    const rpcUrl = process.env.CRONOS_RPC_URL || 'https://evm-t3.cronos.org';
    let privateKey = process.env.TREASURY_PRIVATE_KEY;
    const networkEnv = process.env.CRONOS_NETWORK || 'testnet';

    if (!privateKey) {
      throw new Error('[X402Client] TREASURY_PRIVATE_KEY is required for real execution.');
    }

    if (!privateKey.startsWith('0x')) {
      privateKey = `0x${privateKey}`;
    }

    this.account = privateKeyToAccount(privateKey as Hex);
    const chain = networkEnv === 'mainnet' ? cronos : cronosTestnet;

    // Initialize Viem Client
    this.client = createWalletClient({
      account: this.account,
      chain,
      transport: http(rpcUrl)
    }).extend(publicActions);

    // Initialize Facilitator
    const network = networkEnv === 'mainnet' ? CronosNetwork.CronosMainnet : CronosNetwork.CronosTestnet;
    
    this.logger.info(`Initializing Facilitator on ${networkEnv} (${network})`);
    
    this.facilitator = new Facilitator({
      network: network,
    });
  }

  /**
   * Creates a new x402 session.
   * In the real SDK, this might involve on-chain registration.
   * For now, we generate a session ID and allow the SessionManager to track state.
   */
  async createSession(config: X402SessionConfig): Promise<string> {
    this.logger.info('Creating session with config', config);
    // Future integration: Call facilitator.createSession(config) if available
    return uuidv4();
  }

  /**
   * Executes a payment intent via the x402 Facilitator.
   * @param sessionId The active session ID
   * @param payload The payment details (recipient, amount, token, etc.)
   */
  async executeIntent(sessionId: string, payload: any): Promise<X402ExecutionResult> {
    this.logger.info(`Executing intent for session ${sessionId}`, payload);

    try {
      // 1. Generate Payment Header
      const header = await this.facilitator.generatePaymentHeader({
         sender: this.account.address,
         ...payload
      });
      
      // 2. Generate Payment Requirements
      const reqs = this.facilitator.generatePaymentRequirements({
        recipient: payload.to || payload.recipient,
        amount: payload.amount,
        token: payload.tokenAddress || payload.token,
        ...payload
      });
      
      // 3. Build & Verify Request
      const body = this.facilitator.buildVerifyRequest(header, reqs);
      const verify = await this.facilitator.verifyPayment(body);
      
      if (!verify.isValid) {
         const errorMsg = (verify as any).error || 'Unknown verification error';
         this.logger.warn(`Verification failed: ${errorMsg}`);
         return {
           success: false,
           error: `Payment verification failed: ${errorMsg}`
         };
      }
      
      // 4. Settle Payment
      const settlementResult = await this.facilitator.settlePayment(body);

      // Extract transaction hash
      let txHash: string | undefined;
      
      // Check if settlementResult is a transaction request that we need to send
      if (settlementResult && typeof settlementResult === 'object') {
          if ('txHash' in settlementResult) {
             txHash = (settlementResult as any).txHash;
          } else if ('hash' in settlementResult) {
             txHash = (settlementResult as any).hash;
          } else {
             // It might be a transaction request (to, data, value, etc.)
             this.logger.info('Signing and sending transaction...');
             
             try {
               const txRequest = settlementResult as any;
               // Map common fields. Note: viem uses 'gas', ethers uses 'gasLimit'
               const hash = await this.client.sendTransaction({
                 to: txRequest.to,
                 data: txRequest.data,
                 value: txRequest.value ? BigInt(txRequest.value) : undefined,
                 gas: txRequest.gasLimit ? BigInt(txRequest.gasLimit) : (txRequest.gas ? BigInt(txRequest.gas) : undefined),
                 chain: null // let client decide or use default
               });
               txHash = hash;
             } catch (txError: any) {
               this.logger.error('Transaction sending failed', txError);
               throw new Error(`Transaction sending failed: ${txError.message}`);
             }
          }
      } else if (typeof settlementResult === 'string') {
          txHash = settlementResult;
      }

      if (!txHash) {
          throw new Error('Transaction hash not found in settlement result');
      }

      this.logger.info(`Payment settled. Tx Hash: ${txHash}`);

      return {
        success: true,
        txHash: txHash,
      };

    } catch (error: any) {
      this.logger.error('Execution failed', error);
      return {
        success: false,
        error: error.message || 'Execution failed due to network or SDK error',
      };
    }
  }

  /**
   * Checks status of a session.
   * Retained for compatibility, though largely managed by SessionManager.
   */
  async getSessionStatus(sessionId: string): Promise<{ active: boolean } | null> {
    return { active: true };
  }
}
