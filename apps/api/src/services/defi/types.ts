import { type Address } from 'viem';

export interface YieldStrategyConfig {
  name: string;
  protocol: 'VVS' | 'MMF' | 'SingleFinance'; // extensible
  poolId?: number; // MasterChef PID
  tokenA: Address;
  tokenB: Address; // For LP
  routerAddress: Address;
  masterChefAddress: Address;
  minAPYThreshold: number; // e.g., 5.0 for 5%
  riskLevel: 'low' | 'medium' | 'high';
}

export interface YieldOpportunity {
  strategy: string;
  apy: number;
  tvl: number;
  estimatedGasCost: bigint;
}

export interface DeploymentIntent {
  action: 'yield-deploy' | 'yield-exit';
  protocol: string;
  calldata: string;
  targetContract: Address;
  value: string; // Changed from bigint to string for JSON serialization
  description: string;
}
