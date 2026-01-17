
import { HistoricalMetric } from './types.js';

export class ReportingService {
  public async getHistoricalBalances(days: number = 30): Promise<HistoricalMetric[]> {
    const data: HistoricalMetric[] = [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Generate a slightly random trend for demo purposes
    // In production, this would query a time-series database or aggregated daily snapshots
    let currentValue = 150000; // Start value mock

    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * oneDay);
      // Random fluctuation between -2% and +2.5% to simulate market movement + operations
      const change = (Math.random() * 0.045 - 0.02);
      currentValue = currentValue * (1 + change);
      
      data.push({
        timestamp,
        totalValueUsd: Math.round(currentValue * 100) / 100
      });
    }

    return data;
  }
}
