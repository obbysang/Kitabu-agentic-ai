import { 
  createPublicClient, 
  http, 
  encodeFunctionData, 
  type Address, 
  type PublicClient 
} from 'viem';
import { cronos } from 'viem/chains';
import { VVS_ADDRESSES } from './constants.js';
import { VVS_ROUTER_ABI, VVS_CRAFTSMAN_ABI, ERC20_ABI } from './abis.js';

export class VVSConnector {
  private publicClient: PublicClient;

  constructor(rpcUrl?: string) {
    this.publicClient = createPublicClient({
      chain: cronos,
      transport: http(rpcUrl)
    });
  }

  /**
   * Get the current VVS price in USDC (via Router)
   */
  async getVVSPriceInUSDC(amountIn: bigint = 10n ** 18n): Promise<bigint> {
    const path = [VVS_ADDRESSES.cronos.vvsToken as Address, '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59' as Address]; // VVS -> USDC
    try {
      const amounts = await this.publicClient.readContract({
        address: VVS_ADDRESSES.cronos.router as Address,
        abi: VVS_ROUTER_ABI,
        functionName: 'getAmountsOut',
        args: [amountIn, path]
      });
      return amounts[1];
    } catch (error) {
      console.error('Error fetching VVS price:', error);
      return 0n;
    }
  }

  /**
   * Get pending VVS rewards for a user in a specific pool
   */
  async getPendingRewards(pid: bigint, userAddress: Address): Promise<bigint> {
    try {
      const pending = await this.publicClient.readContract({
        address: VVS_ADDRESSES.cronos.craftsman as Address,
        abi: VVS_CRAFTSMAN_ABI,
        functionName: 'pendingVVS',
        args: [pid, userAddress]
      });
      return pending;
    } catch (error) {
      console.error('Error fetching pending rewards:', error);
      return 0n;
    }
  }

  /**
   * Generate calldata for swapping tokens
   */
  encodeSwap(
    amountIn: bigint, 
    amountOutMin: bigint, 
    path: Address[], 
    to: Address, 
    deadline: bigint
  ): string {
    return encodeFunctionData({
      abi: VVS_ROUTER_ABI,
      functionName: 'swapExactTokensForTokens',
      args: [amountIn, amountOutMin, path, to, deadline]
    });
  }

  /**
   * Generate calldata for adding liquidity
   */
  encodeAddLiquidity(
    tokenA: Address,
    tokenB: Address,
    amountADesired: bigint,
    amountBDesired: bigint,
    amountAMin: bigint,
    amountBMin: bigint,
    to: Address,
    deadline: bigint
  ): string {
    return encodeFunctionData({
      abi: VVS_ROUTER_ABI,
      functionName: 'addLiquidity',
      args: [
        tokenA, 
        tokenB, 
        amountADesired, 
        amountBDesired, 
        amountAMin, 
        amountBMin, 
        to, 
        deadline
      ]
    });
  }

  /**
   * Generate calldata for depositing LP tokens into MasterChef (Craftsman)
   */
  encodeDeposit(pid: bigint, amount: bigint): string {
    return encodeFunctionData({
      abi: VVS_CRAFTSMAN_ABI,
      functionName: 'deposit',
      args: [pid, amount]
    });
  }

  /**
   * Generate calldata for withdrawing LP tokens from MasterChef
   */
  encodeWithdraw(pid: bigint, amount: bigint): string {
    return encodeFunctionData({
      abi: VVS_CRAFTSMAN_ABI,
      functionName: 'withdraw',
      args: [pid, amount]
    });
  }

  /**
   * Generate calldata for approving a spender
   */
  encodeApprove(spender: Address, amount: bigint): string {
    return encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, amount]
    });
  }
}
