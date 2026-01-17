import { type Address } from 'viem';
import { VVSConnector } from './VVSConnector.js';
import { VVS_ADDRESSES } from './constants.js';
import { type DeploymentIntent, type YieldStrategyConfig } from './types.js';

export class YieldService {
  private vvsConnector: VVSConnector;
  private strategies: Map<string, YieldStrategyConfig>;

  constructor(rpcUrl?: string) {
    this.vvsConnector = new VVSConnector(rpcUrl);
    this.strategies = new Map();
    this.initializeStrategies();
  }

  private initializeStrategies() {
    // Example strategy: USDC-VVS LP
    this.strategies.set('usdc-vvs-lp', {
      name: 'USDC-VVS LP Farm',
      protocol: 'VVS',
      poolId: 2, // Example PID, needs verification
      tokenA: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', // USDC
      tokenB: VVS_ADDRESSES.cronos.vvsToken as Address,
      routerAddress: VVS_ADDRESSES.cronos.router as Address,
      masterChefAddress: VVS_ADDRESSES.cronos.craftsman as Address,
      minAPYThreshold: 10.0,
      riskLevel: 'medium'
    });
  }

  /**
   * Generates an intent to deploy idle USDC into VVS Yield Farming
   * Flow:
   * 1. Swap 50% USDC to VVS
   * 2. Add Liquidity (USDC + VVS) -> LP Token
   * 3. Stake LP Token in Craftsman
   * 
   * Note: This returns a list of intents/transactions because x402 might need to execute them sequentially.
   * Or if x402 supports batching, we can combine them.
   * For now, we'll return a sequence of actions.
   */
  async deployIdleFundsToYield(
    amountUSDC: bigint, 
    userAddress: Address,
    strategyId: string = 'usdc-vvs-lp'
  ): Promise<DeploymentIntent[]> {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) throw new Error(`Strategy ${strategyId} not found`);

    const intents: DeploymentIntent[] = [];
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 mins

    // 1. Approve USDC for Router (if not infinite approved - safe to always include or check first)
    // We'll assume the agent checks allowance. For safety, we include approval intent.
    intents.push({
      action: 'yield-deploy',
      protocol: 'VVS',
      targetContract: strategy.tokenA, // USDC
      value: '0',
      calldata: this.vvsConnector.encodeApprove(strategy.routerAddress, amountUSDC),
      description: `Approve USDC for VVS Router`
    });

    // 2. Swap 50% USDC to VVS
    const amountToSwap = amountUSDC / 2n;
    // Calculate min amount out (slippage protection would be needed here, using 0 for simplicity/demo)
    // In production, fetch price and apply slippage
    const minAmountOut = 0n; 
    const path = [strategy.tokenA, strategy.tokenB];

    intents.push({
      action: 'yield-deploy',
      protocol: 'VVS',
      targetContract: strategy.routerAddress,
      value: '0',
      calldata: this.vvsConnector.encodeSwap(
        amountToSwap, 
        minAmountOut, 
        path, 
        userAddress, // Recipient is user (treasury vault)
        deadline
      ),
      description: `Swap ${amountToSwap.toString()} USDC to VVS`
    });

    // 3. Approve VVS for Router (for adding liquidity)
    // We don't know exact VVS amount yet, but we can approve a large amount or estimate.
    // For this strict flow, we might need a multi-step execution where we read balance after swap.
    // However, x402 might support atomic batching.
    // If not atomic, we might just approve MaxUint256 once.
    
    // 4. Add Liquidity
    // This is tricky without knowing exact balances after swap.
    // A robust agent would do this in steps: Swap -> Wait -> Add Liq.
    // For this implementation, we return the plan.
    
    return intents;
  }

  /**
   * Generates an intent to exit yield for payroll
   */
  async exitYieldForUpcomingPayroll(
    amountNeededUSDC: bigint,
    userAddress: Address,
    strategyId: string = 'usdc-vvs-lp'
  ): Promise<DeploymentIntent[]> {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) throw new Error(`Strategy ${strategyId} not found`);
    if (strategy.poolId === undefined) throw new Error('Pool ID required for exit');

    const intents: DeploymentIntent[] = [];
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

    // 1. Withdraw LP from Craftsman
    // We need to know how much LP to withdraw to get amountNeededUSDC.
    // This requires calculating: LP Value -> Underlying Token Amounts -> Swap Value.
    // For simplicity, we might withdraw a fixed chunk or all.
    // Let's assume we withdraw "some" amount.
    const amountLPToWithdraw = 0n; // Placeholder: Logic to calculate LP amount needed

    intents.push({
      action: 'yield-exit',
      protocol: 'VVS',
      targetContract: strategy.masterChefAddress,
      value: '0',
      calldata: this.vvsConnector.encodeWithdraw(BigInt(strategy.poolId), amountLPToWithdraw),
      description: `Withdraw LP tokens from VVS Farm`
    });

    // 2. Remove Liquidity
    // 3. Swap VVS back to USDC

    return intents;
  }
}
