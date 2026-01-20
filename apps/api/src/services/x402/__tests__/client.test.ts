import { test, mock, describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

describe('X402Client', async () => {
  // Setup mocks
  const mockFacilitatorInstance = {
    generatePaymentHeader: mock.fn(async () => ({ header: 'mock-header' })),
    generatePaymentRequirements: mock.fn(() => ({ reqs: 'mock-reqs' })),
    buildVerifyRequest: mock.fn(() => ({ body: 'mock-body' })),
    verifyPayment: mock.fn(async () => ({ isValid: true })),
    settlePayment: mock.fn(async () => ({ txHash: '0x1234567890abcdef' })),
  };

  const MockFacilitator = class {
    constructor() {
      return mockFacilitatorInstance;
    }
  };

  mock.module('@crypto.com/facilitator-client', {
    namedExports: {
      Facilitator: MockFacilitator,
      CronosNetwork: { CronosTestnet: 'testnet', CronosMainnet: 'mainnet' }
    }
  });

  const mockClient = {
    extend: mock.fn(() => mockClient),
    sendTransaction: mock.fn(async () => '0xmocktxhash'),
  };

  mock.module('viem', {
    namedExports: {
      createWalletClient: mock.fn(() => mockClient),
      http: mock.fn(),
      publicActions: {},
      privateKeyToAccount: mock.fn(() => ({ address: '0xsender' })),
    }
  });
  
  mock.module('viem/accounts', {
    namedExports: {
      privateKeyToAccount: mock.fn(() => ({ address: '0xsender' })),
    }
  });
  
  mock.module('viem/chains', {
    namedExports: {
      cronos: {},
      cronosTestnet: {},
    }
  });

  // Import the module under test dynamically to apply mocks
  const { X402Client } = await import('../client.js');

  it('should initialize correctly', () => {
    process.env.TREASURY_PRIVATE_KEY = '0x1234567890123456789012345678901234567890123456789012345678901234';
    const client = new X402Client();
    assert.ok(client);
  });

  it('should execute intent successfully', async () => {
    process.env.TREASURY_PRIVATE_KEY = '0x1234567890123456789012345678901234567890123456789012345678901234';
    const client = new X402Client();
    
    const payload = {
      recipient: '0xrecipient',
      amount: '100',
      token: 'USDC'
    };
    
    const result = await client.executeIntent('session-1', payload);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.txHash, '0x1234567890abcdef');
    
    assert.strictEqual(mockFacilitatorInstance.generatePaymentHeader.mock.callCount() > 0, true);
    assert.strictEqual(mockFacilitatorInstance.settlePayment.mock.callCount() > 0, true);
  });

  it('should handle verification failure', async () => {
    process.env.TREASURY_PRIVATE_KEY = '0x1234567890123456789012345678901234567890123456789012345678901234';
    const client = new X402Client();
    
    mockFacilitatorInstance.verifyPayment.mock.mockImplementationOnce(async () => ({ isValid: false, error: 'Invalid sig' }));
    
    const result = await client.executeIntent('session-2', {});
    
    assert.strictEqual(result.success, false);
    assert.match(result.error || '', /verification failed/i);
  });
  
  it('should handle manual transaction signing if needed', async () => {
    process.env.TREASURY_PRIVATE_KEY = '0x1234567890123456789012345678901234567890123456789012345678901234';
    const client = new X402Client();
    
    // Simulate settlePayment returning a tx request
    mockFacilitatorInstance.settlePayment.mock.mockImplementationOnce(async () => ({ 
        to: '0xcontract', 
        data: '0xdata', 
        value: '0', 
        gasLimit: '100000' 
    }));
    
    const result = await client.executeIntent('session-3', {});
    
    assert.strictEqual(result.success, true);
    // Based on our mockClient, sendTransaction returns '0xmocktxhash'
    assert.strictEqual(result.txHash, '0xmocktxhash');
    
    assert.strictEqual(mockClient.sendTransaction.mock.callCount() > 0, true);
  });
});
