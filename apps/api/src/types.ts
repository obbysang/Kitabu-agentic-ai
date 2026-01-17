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

export type Intent = PaymentIntent | YieldIntent | SwapIntent;

export interface AiResponse {
  message: string;
  intent?: Intent;
  data?: any;
}
