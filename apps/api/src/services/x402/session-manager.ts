import { MockX402Client } from './client.js';
import { X402Session, X402SessionConfig, X402SessionStatus } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class X402SessionManager {
  private client: MockX402Client;
  // In a real app, this would be a database repository
  private sessionStore: Map<string, X402Session> = new Map();

  constructor(client: MockX402Client) {
    this.client = client;
  }

  async initializeSession(config: X402SessionConfig): Promise<X402Session> {
    // 1. Validate config (basic checks)
    if (config.expiresAt < Date.now()) {
      throw new Error('Session expiration must be in the future');
    }

    // 2. Call SDK to create session
    const sessionId = await this.client.createSession(config);

    // 3. Store local session state
    const session: X402Session = {
      sessionId,
      status: X402SessionStatus.CREATED,
      config,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.sessionStore.set(sessionId, session);
    return session;
  }

  async getSession(sessionId: string): Promise<X402Session | undefined> {
    return this.sessionStore.get(sessionId);
  }

  async revokeSession(sessionId: string): Promise<void> {
    const session = this.sessionStore.get(sessionId);
    if (session) {
      session.status = X402SessionStatus.REVOKED;
      session.updatedAt = Date.now();
      // In real SDK, we'd also call client.revokeSession(sessionId)
    }
  }

  async validateSessionActive(sessionId: string): Promise<boolean> {
    const session = this.sessionStore.get(sessionId);
    if (!session) return false;

    if (session.status !== X402SessionStatus.ACTIVE && session.status !== X402SessionStatus.CREATED) {
      return false;
    }

    if (session.config.expiresAt < Date.now()) {
      session.status = X402SessionStatus.EXPIRED;
      return false;
    }

    return true;
  }
}
