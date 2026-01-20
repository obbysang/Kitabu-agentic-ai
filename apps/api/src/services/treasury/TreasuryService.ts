
import { MarketDataService } from '../market/MarketDataService.js';
import { X402Orchestrator } from '../x402/orchestrator.js';
import { TreasuryOverview, TreasuryBalance } from './types.js';
import { X402IntentStatus } from '../x402/types.js';
import { VaultService } from './VaultService.js';
import { ConfigService } from '../config/ConfigService.js';
import { KNOWN_TOKENS, VVS_ADDRESSES } from '../defi/constants.js';

export class TreasuryService {
  private marketDataService: MarketDataService;
  private orchestrator: X402Orchestrator;
  private vaultService: VaultService;
  private configService: ConfigService;

  constructor(
    marketDataService: MarketDataService, 
    orchestrator: X402Orchestrator,
    vaultService: VaultService,
    configService: ConfigService
  ) {
    this.marketDataService = marketDataService;
    this.orchestrator = orchestrator;
    this.vaultService = vaultService;
    this.configService = configService;
  }

  public async getBalances(orgId?: string): Promise<TreasuryBalance[]> {
    const balances: TreasuryBalance[] = [];

    // 1. Check Native CRO
    try {
        const croBalance = await this.vaultService.getBalance();
        const price = await this.marketDataService.getTokenPrice('CRO');
        balances.push({
            tokenSymbol: 'CRO',
            tokenAddress: '0x0000000000000000000000000000000000000000',
            amount: croBalance,
            decimals: 18,
            usdValue: parseFloat(croBalance) * price.price
        });
    } catch (e) {
        console.error('Error fetching CRO balance', e);
    }

    // 2. Check Known Tokens
    const tokensToCheck = { ...KNOWN_TOKENS, VVS: VVS_ADDRESSES.cronosTestnet.vvsToken };

    for (const [symbol, address] of Object.entries(tokensToCheck)) {
         try {
            const balance = await this.vaultService.getERC20Balance(address as `0x${string}`);
            const price = await this.marketDataService.getTokenPrice(symbol);
            
            // Note: Decimals are handled inside getERC20Balance for formatting, 
            // but we hardcode/guess here for the return object if we don't fetch it again.
            // Ideally VaultService returns struct.
            const decimals = symbol === 'USDC' ? 6 : 18; 

            balances.push({
                tokenSymbol: symbol,
                tokenAddress: address,
                amount: balance,
                decimals: decimals, 
                usdValue: parseFloat(balance) * price.price
            });
         } catch (e) {
             // console.error(`Error fetching ${symbol} balance`, e);
             // Fail silently for tokens not present or error
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
