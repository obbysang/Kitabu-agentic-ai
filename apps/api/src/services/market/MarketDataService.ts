import { CryptoComMCPClient } from '../mcp/CryptoComMCPClient.js';
import { TokenPrice, GasPrice, YieldOpportunity } from '../../types/market.js';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class MarketDataService {
  private mcpClient: CryptoComMCPClient;
  private priceCache: Map<string, CacheEntry<TokenPrice>> = new Map();
  private gasCache: Map<string, CacheEntry<GasPrice>> = new Map();
  private yieldCache: Map<string, CacheEntry<YieldOpportunity[]>> = new Map();

  private readonly PRICE_TTL = 60 * 1000; // 1 minute
  private readonly GAS_TTL = 15 * 1000; // 15 seconds
  private readonly YIELD_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.mcpClient = CryptoComMCPClient.getInstance();
  }

  public async getTokenPrice(symbol: string): Promise<TokenPrice> {
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.PRICE_TTL) {
      return cached.data;
    }

    try {
      const price = await this.mcpClient.getTokenPrice(symbol);
      this.priceCache.set(symbol, { data: price, timestamp: Date.now() });
      return price;
    } catch (error) {
      // Return cached data if available (even if expired) in case of error, with a flag? 
      // For now, just throw or return mock zero if critical.
      // Better to fail safely.
      if (cached) return cached.data;
      throw new Error(`Failed to fetch price for ${symbol}: ${(error as Error).message}`);
    }
  }

  public async getGasPrice(network: string = 'cronos'): Promise<GasPrice> {
    const cached = this.gasCache.get(network);
    if (cached && Date.now() - cached.timestamp < this.GAS_TTL) {
      return cached.data;
    }

    try {
      const gas = await this.mcpClient.getGasPrice(network);
      this.gasCache.set(network, { data: gas, timestamp: Date.now() });
      return gas;
    } catch (error) {
      if (cached) return cached.data;
      throw new Error(`Failed to fetch gas price for ${network}`);
    }
  }

  public async getYieldOpportunities(protocol: string = 'vvs_finance'): Promise<YieldOpportunity[]> {
    const cached = this.yieldCache.get(protocol);
    if (cached && Date.now() - cached.timestamp < this.YIELD_TTL) {
      return cached.data;
    }

    try {
      const yields = await this.mcpClient.getYieldOpportunities(protocol);
      this.yieldCache.set(protocol, { data: yields, timestamp: Date.now() });
      return yields;
    } catch (error) {
      if (cached) return cached.data;
      return []; // Return empty if failing to fetch yields
    }
  }

  /**
   * Find the best yield pool for a given token pair or single token.
   * Simple logic: highest APY within risk tolerance.
   */
  public async getOptimalPool(token: string, minApy: number = 0, maxRisk: 'low' | 'medium' | 'high' = 'medium'): Promise<YieldOpportunity | null> {
    const opportunities = await this.getYieldOpportunities();
    
    // Filter by token (naive check if token is in pair name)
    const relevant = opportunities.filter(o => o.tokenPair.includes(token.toUpperCase()));

    // Filter by risk
    const riskLevels = ['low', 'medium', 'high'];
    const maxRiskIndex = riskLevels.indexOf(maxRisk);

    const candidates = relevant.filter(o => {
      const currentRiskIndex = riskLevels.indexOf(o.riskLevel);
      return currentRiskIndex <= maxRiskIndex && o.apy >= minApy;
    });

    // Sort by APY desc
    candidates.sort((a, b) => b.apy - a.apy);

    return candidates.length > 0 ? candidates[0] : null;
  }
}
