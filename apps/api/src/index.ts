import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  MockX402Client, 
  X402SessionManager, 
  X402Orchestrator, 
  X402RuleEngine, 
  X402IntentStatus 
} from './services/x402/index.js';
import { 
  InvoiceIngestionService, 
  InvoiceParsingService, 
  InvoiceWorkflowService 
} from './services/invoice/index.js';
import { MarketDataService } from './services/market/MarketDataService.js';
import marketRouter from './routes/market.js';
import { YieldService } from './services/defi/YieldService.js';
import { 
  TreasuryService, 
  ActivityService, 
  ReportingService 
} from './services/treasury/index.js';
import { AutomationRuleService } from './services/automation/AutomationRuleService.js';
import { IdleCashService } from './services/automation/IdleCashService.js';
import { CryptoComMCPClient } from './services/mcp/CryptoComMCPClient.js';
import { AiAgentService } from './services/ai-agent.js';
import { IntentService } from './services/intent.js';
import { SafetyService } from './services/safety.js';
import { HistoryService } from './services/history.js';
import { OrgService } from './services/org/OrgService.js';
import { AuthService } from './services/auth/AuthService.js';
import { ConfigService } from './services/config/ConfigService.js';
import { createAuthRouter } from './routes/auth.js';
import { createOrgRouter } from './routes/org.js';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Initialize Core Platform Services
const orgService = new OrgService();
const authService = new AuthService(orgService);
const configService = new ConfigService(orgService);

// Initialize x402 Services
const x402Client = new MockX402Client();
const sessionManager = new X402SessionManager(x402Client);
const orchestrator = new X402Orchestrator(x402Client, sessionManager);

// Initialize Market & DeFi Services
const marketDataService = new MarketDataService();
const yieldService = new YieldService(process.env.RPC_URL);

// Initialize Treasury Services
const treasuryService = new TreasuryService(marketDataService, orchestrator);
const activityService = new ActivityService(orchestrator);
const reportingService = new ReportingService();

// Initialize Automation Services
const automationRuleService = new AutomationRuleService();
const idleCashService = new IdleCashService(automationRuleService, treasuryService, orchestrator);

// Start Automation Engine
sessionManager.initializeSession({
  orgId: 'system',
  userId: 'system-automation',
  expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
  permissions: []
}).then((session) => {
  idleCashService.setSystemSessionId(session.sessionId);
  idleCashService.start();
});

// Initialize Invoice Services
const invoiceStorageDir = path.join(__dirname, '../uploads');
const invoiceIngestion = new InvoiceIngestionService(invoiceStorageDir);
const invoiceParsing = new InvoiceParsingService();
const invoiceWorkflow = new InvoiceWorkflowService();

// Initialize AI & Intent Services
const aiAgentService = new AiAgentService(process.env.AI_AGENT_API_KEY || 'mock-key');
const intentService = new IntentService();
const safetyService = new SafetyService({
  maxDailySpend: 10000,
  maxTransactionAmount: 5000,
  allowedTokens: ['USDC', 'ETH', 'CRO'],
  requireApprovalAbove: 1000,
});
const historyService = new HistoryService();

app.use(express.json({ limit: '50mb' })); // Increase limit for file uploads
app.use(cors());

// --- Core Platform Routes ---
app.use('/auth', createAuthRouter(authService));
app.use('/orgs', createOrgRouter(orgService, configService, authService));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'kitabu-api' });
});

// --- Invoice Routes ---

// Upload Invoice (Simulated with JSON body for simplicity)
app.post('/invoices/upload', async (req, res) => {
  try {
    const { fileBase64, fileName, userId, orgId, mimeType } = req.body;
    
    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: 'Missing file content or name' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    const invoice = await invoiceIngestion.ingestInvoice(
      buffer,
      fileName,
      userId || 'user-1',
      orgId || 'org-1',
      mimeType || 'application/pdf'
    );

    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger Parsing (AI Extraction)
app.post('/invoices/:id/parse', async (req, res) => {
  try {
    const invoice = await invoiceIngestion.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const parsedInvoice = await invoiceParsing.parseInvoice(invoice);
    
    res.json(parsedInvoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Invoice & Create Payment Intent
app.post('/invoices/:id/approve', async (req, res) => {
  try {
    const { approverId, sessionId } = req.body;
    const invoice = await invoiceIngestion.getInvoice(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const result = await invoiceWorkflow.approveInvoice(invoice, approverId, sessionId);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Invoice
app.get('/invoices/:id', async (req, res) => {
  const invoice = await invoiceIngestion.getInvoice(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Not found' });
  res.json(invoice);
});

// List Invoices for Org
app.get('/invoices/org/:orgId', async (req, res) => {
  const invoices = await invoiceIngestion.listInvoices(req.params.orgId);
  res.json(invoices);
});

// --- Market & Risk Routes ---
app.use('/market', marketRouter);

// --- x402 Routes ---

// Create Session
app.post('/x402/sessions', async (req, res) => {
  try {
    const { orgId, userId, permissions } = req.body;
    
    // Default policy mapping for demo
    const policy = {
      dailySpendLimit: '1000000000000000000', // 1 ETH/CRO
      allowedTokens: ['0x55d398326f99059ff775485246999027b3197955'], // USDT
      whitelistedRecipients: []
    };
    
    // Combine manual permissions with policy-generated ones
    const policyPermissions = X402RuleEngine.generatePermissions(policy);
    const finalPermissions = [...(permissions || []), ...policyPermissions];

    const session = await sessionManager.initializeSession({
      orgId,
      userId,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
      permissions: finalPermissions,
    });
    
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create and Execute Intent
app.post('/x402/intents', async (req, res) => {
  try {
    const { sessionId, type, payload } = req.body;
    
    // 1. Create Intent
    const intent = await orchestrator.createIntent(sessionId, type, payload);
    
    // 2. Execute Intent (in background or await based on need)
    // For this demo, we await the result
    const result = await orchestrator.executeIntent(intent.id);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Intent Status
app.get('/x402/intents/:id', async (req, res) => {
  try {
    const intent = await orchestrator.getIntent(req.params.id);
    if (!intent) {
      return res.status(404).json({ error: 'Intent not found' });
    }
    res.json(intent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Yield / DeFi Routes ---

// Deploy Idle Funds
app.post('/yield/deploy', async (req, res) => {
  try {
    const { amountUSDC, userAddress, strategyId } = req.body;
    if (!amountUSDC || !userAddress) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const intents = await yieldService.deployIdleFundsToYield(
      BigInt(amountUSDC), 
      userAddress, 
      strategyId
    );
    
    res.json({ plan: intents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Exit Yield
app.post('/yield/exit', async (req, res) => {
  try {
    const { amountNeededUSDC, userAddress, strategyId } = req.body;
    if (!amountNeededUSDC || !userAddress) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const intents = await yieldService.exitYieldForUpcomingPayroll(
      BigInt(amountNeededUSDC), 
      userAddress, 
      strategyId
    );
    
    res.json({ plan: intents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI Agent Routes ---

app.post('/agent/chat', async (req, res) => {
  try {
    const { message, userId, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Process message with AI Agent
    const aiResponse = await aiAgentService.processMessage(message, context);
    
    // 2. If intent is present, validate and check safety
    let validationResult = null;
    let safetyResult = null;

    if (aiResponse.intent) {
      // Validate Intent Structure
      const validation = intentService.validateIntent(aiResponse.intent);
      if (!validation.success) {
        return res.json({
          message: 'I understood your intent but it seems invalid.',
          error: validation.error,
        });
      }

      // Check Safety Policies
      safetyResult = safetyService.checkPolicy(aiResponse.intent);
      if (!safetyResult.safe) {
        return res.json({
          message: `I cannot execute this request: ${safetyResult.reason}`,
          intent: aiResponse.intent,
          safetyViolation: true,
        });
      }
      
      validationResult = validation.data;
    }

    // 3. Log to History
    await historyService.addRecord(
      userId || 'anonymous',
      message,
      aiResponse.intent
    );

    res.json({
      ...aiResponse,
      safetyCheck: safetyResult,
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/agent/history/:userId', async (req, res) => {
  try {
    const history = await historyService.getHistory(req.params.userId);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Treasury Dashboard Routes ---

app.get('/treasury/overview', async (req, res) => {
  try {
    const overview = await treasuryService.getOverview();
    res.json(overview);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/treasury/vault', async (req, res) => {
  try {
    // Access the vault service via treasury service or directly if exposed
    // Since we didn't expose vaultService publicly in TreasuryService, we can instantiate one or expose it.
    // Ideally, TreasuryService should expose it or we add a method to TreasuryService.
    // For now, let's just use TreasuryService's overview which uses the vault.
    const overview = await treasuryService.getOverview();
    res.json({
      address: process.env.TREASURY_VAULT_ADDRESS,
      croBalance: overview.balances.find(b => b.tokenSymbol === 'CRO')?.amount || '0',
      overview
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/treasury/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const activity = await activityService.getActivityFeed(limit, offset);
    res.json(activity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/treasury/history', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const history = await reportingService.getHistoricalBalances(days);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
