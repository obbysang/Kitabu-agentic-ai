import { Intent } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

export interface HistoryRecord {
  id: string;
  userId: string;
  command: string;
  parsedIntent?: Intent;
  status: 'pending' | 'executed' | 'failed' | 'rejected';
  result?: any;
  timestamp: Date;
}

export class HistoryService {
  private history: HistoryRecord[] = [];

  async addRecord(userId: string, command: string, intent?: Intent): Promise<HistoryRecord> {
    const record: HistoryRecord = {
      id: uuidv4(),
      userId,
      command,
      parsedIntent: intent,
      status: 'pending',
      timestamp: new Date(),
    };
    this.history.push(record);
    return record;
  }

  async updateStatus(id: string, status: HistoryRecord['status'], result?: any) {
    const record = this.history.find(r => r.id === id);
    if (record) {
      record.status = status;
      record.result = result;
    }
  }

  async getHistory(userId: string): Promise<HistoryRecord[]> {
    return this.history.filter(r => r.userId === userId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}
