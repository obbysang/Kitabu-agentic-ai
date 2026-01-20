import { v4 as uuidv4 } from 'uuid'
import { Logger } from '../../utils/logger.js'
import { X402ExecutionResult, X402SessionConfig, X402ClientLike } from './types.js'

export class MockX402Client implements X402ClientLike {
  private logger: Logger
  constructor() {
    this.logger = new Logger('MockX402Client')
    this.logger.warn('Using mock x402 client. No real execution will occur.')
  }

  async createSession(config: X402SessionConfig): Promise<string> {
    this.logger.info('Mock create session', config)
    return uuidv4()
  }

  async executeIntent(sessionId: string, payload: any): Promise<X402ExecutionResult> {
    this.logger.info('Mock execute intent', { sessionId, payload })
    return { success: true, txHash: '0xmock_tx_hash' }
  }

  async getSessionStatus(sessionId: string): Promise<{ active: boolean } | null> {
    return { active: true }
  }
}
