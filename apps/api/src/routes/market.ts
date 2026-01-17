import express from 'express';
import { MarketDataService } from '../services/market/MarketDataService.js';
import { RiskEvaluationService } from '../services/risk/RiskEvaluationService.js';
import { RiskCheckRequest } from '../types/market.js';

const router = express.Router();
const marketService = new MarketDataService();
const riskService = new RiskEvaluationService();

/**
 * GET /market/price/:symbol
 * Get spot price for a token.
 */
router.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await marketService.getTokenPrice(symbol);
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /market/gas
 * Get current gas prices for Cronos.
 */
router.get('/gas', async (req, res) => {
  try {
    const { network } = req.query;
    const gas = await marketService.getGasPrice(network as string);
    res.json(gas);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /market/yields
 * Get yield opportunities.
 */
router.get('/yields', async (req, res) => {
  try {
    const { protocol } = req.query;
    const yields = await marketService.getYieldOpportunities(protocol as string);
    res.json(yields);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /market/risk/evaluate
 * Evaluate transaction risk.
 */
router.post('/risk/evaluate', async (req, res) => {
  try {
    const request: RiskCheckRequest = req.body;
    const assessment = await riskService.evaluateTransaction(request);
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
