export interface PaymentIntent {
  type: 'PAYMENT';
  token: string;
  amount: number;
  recipient: string;
  schedule?: string;
}

export interface YieldIntent {
  type: 'YIELD_DEPLOY' | 'YIELD_EXIT';
  token: string;
  amount: number;
  strategy: string;
}

export interface SwapIntent {
  type: 'SWAP';
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOutMin?: number;
}

export interface BatchIntent {
  type: 'BATCH';
  intents: Intent[]; // Can contain Payment, Yield, Swap, or even nested Batch
  ordered?: boolean; // If true, execute sequentially (Multi-step). If false, can be parallel.
}

export type Intent = PaymentIntent | YieldIntent | SwapIntent | BatchIntent;

export interface AiResponse {
  message: string;
  intent?: Intent;
  data?: any;
}
