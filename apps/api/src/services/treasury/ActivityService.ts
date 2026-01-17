
import { X402Orchestrator } from '../x402/orchestrator.js';
import { ActivityItem } from './types.js';
import { X402Intent } from '../x402/types.js';

export class ActivityService {
  private orchestrator: X402Orchestrator;

  constructor(orchestrator: X402Orchestrator) {
    this.orchestrator = orchestrator;
  }

  public async getActivityFeed(limit: number = 20, offset: number = 0): Promise<ActivityItem[]> {
    const intents = await this.orchestrator.getAllIntents();
    
    // Convert intents to activity items
    const activities: ActivityItem[] = intents.map((intent: X402Intent) => this.mapIntentToActivity(intent));

    // Add some mock system events to flesh out the feed for demo purposes
    // In production, these would come from an event store
    const mockEvents: ActivityItem[] = [
        {
            id: 'mock-evt-1',
            type: 'system',
            status: 'completed',
            description: 'Treasury Vault connected',
            timestamp: Date.now() - 10000000,
        },
        {
            id: 'mock-evt-2',
            type: 'invoice',
            status: 'pending',
            description: 'Invoice #INV-2024-001 received',
            amount: '500',
            token: 'USDC',
            timestamp: Date.now() - 5000000,
        }
    ];

    const allActivities = [...activities, ...mockEvents];

    // Sort by timestamp desc
    allActivities.sort((a, b) => b.timestamp - a.timestamp);

    return allActivities.slice(offset, offset + limit);
  }

  private mapIntentToActivity(intent: X402Intent): ActivityItem {
    let description = `Executed ${intent.type} intent`;
    let amount = undefined;
    let token = undefined;

    // Extract details from payload if available
    // Assuming a convention for payload structure
    if (intent.payload) {
        if (intent.payload.description) description = intent.payload.description;
        if (intent.payload.amount) amount = intent.payload.amount;
        if (intent.payload.token) token = intent.payload.token;
    }

    // Map status
    let status: ActivityItem['status'] = 'pending';
    if (intent.status === 'settled') status = 'completed';
    else if (intent.status === 'failed') status = 'failed';

    return {
      id: intent.id,
      type: this.mapIntentTypeToActivityType(intent.type),
      status,
      description,
      amount,
      token,
      timestamp: intent.createdAt,
      txHash: intent.txHash,
      metadata: {
        sessionId: intent.sessionId,
        error: intent.error
      }
    };
  }

  private mapIntentTypeToActivityType(intentType: string): ActivityItem['type'] {
    switch (intentType) {
        case 'payment': return 'payment';
        case 'yield': return 'yield';
        default: return 'system';
    }
  }
}
