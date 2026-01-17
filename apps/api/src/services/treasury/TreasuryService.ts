
import { MarketDataService } from '../market/MarketDataService.js';
import { X402Orchestrator } from '../x402/orchestrator.js';
import { TreasuryOverview, TreasuryBalance } from './types.js';
import { X402IntentStatus } from '../x402/types.js';

export class TreasuryService {
  private marketDataService: MarketDataService;
  private orchestrator: X402Orchestrator;

  constructor(marketDataService: MarketDataService, orchestrator: X402Orchestrator) {
    this.marketDataService = marketDataService;
    this.orchestrator = orchestrator;
  }

  // Mock vault address
  private readonly VAULT_ADDRESS = '0xVaultAddressMock';

  public async getBalances(orgId?: string): Promise<TreasuryBalance[]> {
    // Mock data - In production this would query the TreasuryVault contract
    const mockHoldings = [
      { symbol: 'CRO', amount: '10000', decimals: 18 },
      { symbol: 'USDC', amount: '50000', decimals: 6 },
      { symbol: 'WBTC', amount: '1.5', decimals: 8 },
    ];

    const balances: TreasuryBalance[] = [];

    for (const holding of mockHoldings) {
      try {
        const price = await this.marketDataService.getTokenPrice(holding.symbol);
        const amountNum = parseFloat(holding.amount);
        balances.push({
            tokenSymbol: holding.symbol,
            tokenAddress: '0xMockAddress', 
            amount: holding.amount,
            decimals: holding.decimals,
            usdValue: amountNum * price.price
        });
      } catch (e) {
        // If price fetch fails, default to 0 value but include token
        balances.push({
            tokenSymbol: holding.symbol,
            tokenAddress: '0xMockAddress',
            amount: holding.amount,
            decimals: holding.decimals,
            usdValue: 0
        });
      }
    }

    return balances;
  }

  public async getOverview(): Promise<TreasuryOverview> {
    // 1. Fetch Balances (Mocked for now, but using real prices)
    const balances = await this.getBalances();
    
    // 2. Calculate Total Value
    const totalUsdValue = balances.reduce((sum, b) => sum + b.usdValue, 0);

    // 3. Get Pending Payments from Orchestrator
    const intents = await this.orchestrator.getAllIntents();
    const pendingIntents = intents.filter((i: any) => 
      i.status === X402IntentStatus.CREATED || 
      i.status === X402IntentStatus.PROCESSING || 
      i.status === X402IntentStatus.PENDING
    );

    // Estimate pending value (naive implementation assuming payload has amount/token)
    let pendingPaymentsTotalUsd = 0;
    for (const intent of pendingIntents) {
        // This assumes a specific payload structure. In a real app, we'd have strict types for payload.
        if (intent.payload && intent.payload.amount && intent.payload.token) {
             try {
                const price = await this.marketDataService.getTokenPrice(intent.payload.token);
                // Simple conversion, ignoring decimals for this estimation or assuming standard 18
                const amount = parseFloat(intent.payload.amount); 
                pendingPaymentsTotalUsd += amount * price.price;
             } catch (e) {
                 // Ignore if price not found
             }
        }
    }

    return {
      totalUsdValue,
      balances,
      pendingPaymentsCount: pendingIntents.length,
      pendingPaymentsTotalUsd,
      yieldPositionsTotalUsd: 50000, // Mocked yield position
      lastUpdated: Date.now(),
    };
  }
}
