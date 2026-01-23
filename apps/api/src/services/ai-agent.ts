import { createClient } from '@crypto.com/ai-agent-client';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
  private geminiClient: GoogleGenerativeAI | null = null;
  private apiKey: string;

  constructor(apiKey: string, baseURL?: string, client?: any) {
    this.apiKey = apiKey;
    
    // Initialize Gemini if key exists in env
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        try {
            this.geminiClient = new GoogleGenerativeAI(geminiKey);
            console.log('AiAgentService: Gemini Client Initialized');
        } catch (e) {
            console.warn('Failed to initialize Gemini Client:', e);
        }
    }

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
    // 1. Try Gemini first if available
    if (this.geminiClient) {
        try {
            return await this.processWithGemini(message);
        } catch (error) {
            console.error('Gemini processing failed, falling back:', error);
            // Fallthrough to other methods
        }
    }

    // 2. Try Crypto.com Client
    if (this.client) {
        try {
            return await this.processWithCryptoCom(message, context);
        } catch (error) {
             console.error('Crypto.com Agent processing failed, falling back:', error);
        }
    }

    // 3. No working AI provider
    console.error('AiAgentService: No working AI provider found (Gemini or Crypto.com).');
    throw new Error('AI Service Unavailable: Please configure GEMINI_API_KEY or Crypto.com Agent.');
  }

  private async processWithGemini(message: string): Promise<AiResponse> {
      console.log('Sending message to Gemini...');
      const model = this.geminiClient!.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: SYSTEM_PROMPT
      });

      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();
      
      const intent = this.extractIntent(text);

      return {
          message: text,
          intent,
          data: response
      };
  }

  private async processWithCryptoCom(message: string, context?: any): Promise<AiResponse> {
      console.log('Sending message to Crypto.com AI Agent:', message);

      const fullMessage = `${SYSTEM_PROMPT}\n\nUser: ${message}`;
      
      const response = await this.client.sendMessage({ 
          message: fullMessage,
          context 
      });

      const responseText = response.content || response.message || (typeof response === 'string' ? response : JSON.stringify(response));
      
      const intent = this.extractIntent(responseText);

      return {
        message: responseText,
        intent,
        data: response
      };
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
}
