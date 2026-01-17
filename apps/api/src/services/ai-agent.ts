import { createClient } from '@crypto.com/ai-agent-client';
import { Intent, AiResponse } from '../types.js';

export class AiAgentService {
  private client: any;

  constructor(apiKey: string, baseURL?: string) {
    const options: any = {
      apiKey,
      baseURL: baseURL || 'https://api.crypto.com/ai-agent/v1',
    };
    this.client = createClient(options);
  }

  async processMessage(message: string, context?: any): Promise<AiResponse> {
    try {
      console.log('Sending message to AI Agent:', message);

      // TODO: Replace with actual SDK call when docs/types are available
      // const response = await this.client.sendMessage({ message, context });
      
      // Mocking for now to satisfy the interface
      if (message.toLowerCase().includes('pay') && message.toLowerCase().includes('usdc')) {
         // simple regex to extract amount
         const amountMatch = message.match(/(\d+)/);
         const amount = amountMatch ? parseInt(amountMatch[0]) : 0;
         
         return {
            message: `I have prepared a payment of ${amount} USDC.`,
            intent: {
              type: 'PAYMENT',
              token: 'USDC',
              amount: amount,
              recipient: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Mock recipient
            }
         };
      }
      
      return {
        message: 'I received your message. Ask me to "pay 100 USDC" to test payment intents.',
      };

    } catch (error) {
      console.error('Error processing message with AI Agent:', error);
      throw error;
    }
  }
}
