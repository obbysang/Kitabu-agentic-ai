import { MarketDataService } from '../market/MarketDataService.js';
import { RiskCheckRequest, RiskAssessment } from '../../types/market.js';

export class RiskEvaluationService {
  private marketDataService: MarketDataService;
  
  // Configurable thresholds
  private readonly MAX_GAS_PERCENTAGE = 0.05; // Gas shouldn't be > 5% of tx value
  private readonly MIN_LIQUIDITY_USD = 10000; // Pools must have at least $10k TVL

  constructor() {
    this.marketDataService = new MarketDataService();
  }

  public async evaluateTransaction(request: RiskCheckRequest): Promise<RiskAssessment> {
    const warnings: string[] = [];
    let riskScore = 0;
    let allowed = true;
    let reason = undefined;

    // 1. Gas Cost Evaluation
    const gasPrice = await this.marketDataService.getGasPrice();
    const estimatedGasLimit = request.estimatedGas || 21000; // Default to simple transfer
    const gasCostWei = BigInt(gasPrice.standard) * BigInt(estimatedGasLimit);
    
    // Convert gas cost to USD
    const croPrice = await this.marketDataService.getTokenPrice('CRO');
    const gasCostEth = Number(gasCostWei) / 1e18; // assuming 18 decimals for CRO
    const gasCostUSD = gasCostEth * croPrice.price;

    // Calculate Value in USD
    const tokenPrice = await this.marketDataService.getTokenPrice(request.token);
    const valueUSD = request.amount * tokenPrice.price;

    if (valueUSD > 0) {
      const gasPercentage = gasCostUSD / valueUSD;
      if (gasPercentage > this.MAX_GAS_PERCENTAGE) {
        warnings.push(`High gas cost: ${(gasPercentage * 100).toFixed(2)}% of transaction value.`);
        riskScore += 20;
      }
    }

    // 2. Action Specific Checks
    if (request.action === 'yield_deposit') {
       // Check pool risk if applicable (simplified logic here)
       // In reality, we'd check the specific pool address or ID against the whitelist or risk service
       // For now, assume generic risk check
    }

    // 3. Volatility Check (Mock)
    // If token price changed significantly recently (requires history, skipping for MVP)

    // 4. Final Decision
    if (riskScore > 50) {
      allowed = false;
      reason = 'Risk score too high due to accumulated warnings.';
    }

    // Hard block if gas > value (absurd transaction)
    if (gasCostUSD > valueUSD && valueUSD > 0) {
        allowed = false;
        reason = 'Gas cost exceeds transaction value.';
        riskScore = 100;
    }

    return {
      allowed,
      reason,
      warnings,
      riskScore,
      timestamp: Date.now()
    };
  }
}
