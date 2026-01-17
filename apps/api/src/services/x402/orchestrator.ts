import { MockX402Client } from './client.js';
import { X402SessionManager } from './session-manager.js';
import { X402Intent, X402IntentStatus } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class X402Orchestrator {
  private client: MockX402Client;
  private sessionManager: X402SessionManager;
  // In a real app, this would be a database repository
  private intentStore: Map<string, X402Intent> = new Map();

  constructor(client: MockX402Client, sessionManager: X402SessionManager) {
    this.client = client;
    this.sessionManager = sessionManager;
  }

  async createIntent(sessionId: string, type: X402Intent['type'], payload: any): Promise<X402Intent> {
    const isActive = await this.sessionManager.validateSessionActive(sessionId);
    if (!isActive) {
      throw new Error(`Session ${sessionId} is not active or expired`);
    }

    const intent: X402Intent = {
      id: uuidv4(),
      sessionId,
      type,
      payload,
      status: X402IntentStatus.CREATED,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.intentStore.set(intent.id, intent);
    return intent;
  }

  async executeIntent(intentId: string): Promise<X402Intent> {
    const intent = this.intentStore.get(intentId);
    if (!intent) {
      throw new Error('Intent not found');
    }

    if (intent.status === X402IntentStatus.SETTLED) {
      // Idempotency check
      return intent;
    }

    // Update state to PROCESSING
    this.updateIntentStatus(intent, X402IntentStatus.PROCESSING);

    try {
      // Execute via SDK
      const result = await this.client.executeIntent(intent.sessionId, intent.payload);

      if (result.success) {
        intent.txHash = result.txHash;
        this.updateIntentStatus(intent, X402IntentStatus.SETTLED);
      } else {
        intent.error = result.error;
        this.updateIntentStatus(intent, X402IntentStatus.FAILED);
      }
    } catch (error: any) {
      intent.error = error.message || 'Unknown execution error';
      this.updateIntentStatus(intent, X402IntentStatus.FAILED);
    }

    return intent;
  }

  async getIntent(intentId: string): Promise<X402Intent | undefined> {
    return this.intentStore.get(intentId);
  }

  async getAllIntents(): Promise<X402Intent[]> {
    return Array.from(this.intentStore.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  private updateIntentStatus(intent: X402Intent, status: X402IntentStatus) {
    intent.status = status;
    intent.updatedAt = Date.now();
    this.intentStore.set(intent.id, intent);
    console.log(`[X402Orchestrator] Intent ${intent.id} transitioned to ${status}`);
  }
}
