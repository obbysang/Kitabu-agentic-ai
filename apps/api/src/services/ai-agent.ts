import { createClient } from '@crypto.com/ai-agent-client';
import { Intent, AiResponse } from '../types.js';
import { IntentSchema } from './intent.js';

const SYSTEM_PROMPT = `
You are Kitabu, an autonomous AI CFO. Your goal is to help users manage treasury funds.
You can parse natural language commands into structured intents.

Supported Intents:
1. PAYMENT: Pay a specific amount of tokens to a recipient.
2. YIELD_DEPLOY: Deploy idle funds into a yield strategy.
3. YIELD_EXIT: Exit a yield position.
4. SWAP: Swap tokens.

If the user's request implies an action, you MUST return a JSON object in your response text representing the intent.
The JSON must follow these schemas:

Payment:
{
  "type": "PAYMENT",
  "token": "USDC" | "CRO" | ...,
  "amount": number,
  "recipient": "0x...",
  "schedule": "optional ISO date"
}

Yield:
{
  "type": "YIELD_DEPLOY" | "YIELD_EXIT",
  "token": "USDC" | ...,
  "amount": number,
  "strategy": "VVS_USDC_CRO" | ...
}

Swap:
{
  "type": "SWAP",
  "tokenIn": "...",
  "tokenOut": "...",
  "amountIn": number,
  "amountOutMin": optional number
}

If no action is required, just reply normally.
Always prioritize safety. If a request is ambiguous, ask for clarification.
`;

export class AiAgentService {
  private client: any;
  private apiKey: string;

  constructor(apiKey: string, baseURL?: string, client?: any) {
    this.apiKey = apiKey;
    
    if (client) {
        this.client = client;
    } else {
        const options: any = {
            apiKey,
            baseURL: baseURL || 'https://api.crypto.com/ai-agent/v1',
        };
        
        // Only initialize client if we have a real-looking key (not 'mock-key')
        if (this.apiKey && this.apiKey !== 'mock-key') {
            try {
                this.client = createClient(options);
            } catch (e) {
                console.warn('Failed to initialize AI Agent Client:', e);
            }
        }
    }
  }

  async processMessage(message: string, context?: any): Promise<AiResponse> {
    // 1. Fallback to regex mock if no client or key is 'mock-key'
    if (!this.client) {
        console.log('AiAgentService: Using regex mock (No API Key or Client init failed).');
        return this.mockProcessMessage(message);
    }

    try {
      console.log('Sending message to AI Agent:', message);

      // 2. Call SDK
      const fullMessage = `${SYSTEM_PROMPT}\n\nUser: ${message}`;
      
      const response = await this.client.sendMessage({ 
          message: fullMessage,
          context // Pass context if the SDK supports it
      });

      // 3. Parse Response
      const responseText = response.content || response.message || (typeof response === 'string' ? response : JSON.stringify(response));
      
      const intent = this.extractIntent(responseText);

      return {
        message: responseText,
        intent,
        data: response
      };

    } catch (error) {
      console.error('Error processing message with AI Agent:', error);
      console.warn('Falling back to regex mock due to AI Agent error.');
      return this.mockProcessMessage(message);
    }
  }

  private extractIntent(text: string): Intent | undefined {
    // Try to find Markdown JSON block
    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
        return this.tryParse(jsonBlockMatch[1]);
    }

    // Try to find raw JSON object
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
        return this.tryParse(jsonMatch[0]);
    }

    return undefined;
  }

  private tryParse(jsonStr: string): Intent | undefined {
      try {
        const parsed = JSON.parse(jsonStr);
        // Validate with Zod
        const validation = IntentSchema.safeParse(parsed);
        if (validation.success) {
            return validation.data as Intent;
        } else {
            console.warn('AI returned invalid intent JSON:', validation.error);
            return undefined;
        }
      } catch (e) {
        console.warn('Failed to parse JSON from AI response:', e);
        return undefined;
      }
  }

  private mockProcessMessage(message: string): AiResponse {
      if (message.toLowerCase().includes('pay') && message.toLowerCase().includes('usdc')) {
         // simple regex to extract amount
         const amountMatch = message.match(/(\d+)/);
         const amount = amountMatch ? parseInt(amountMatch[0]) : 0;
         
         return {
            message: `[MOCK] I have prepared a payment of ${amount} USDC.`,
            intent: {
              type: 'PAYMENT',
              token: 'USDC',
              amount: amount,
              recipient: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Mock recipient
            }
         };
      }
      
      return {
        message: '[MOCK] I received your message. Ask me to "pay 100 USDC" to test payment intents. (AI Agent not configured)',
      };
  }
}
