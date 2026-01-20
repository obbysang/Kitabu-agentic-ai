import { createPublicClient, createWalletClient, http, defineChain, type Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { cronos } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// Define Cronos Testnet explicitly if needed, or import from viem/chains if available (usually cronosTestnet)
// We keep the manual definition to ensure control over RPCs
export const cronosTestnet = defineChain({
  id: 338,
  name: 'Cronos Testnet',
  network: 'cronos-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Cronos',
    symbol: 'TCRO',
  },
  rpcUrls: {
    default: { http: ['https://evm-t3.cronos.org'] },
    public: { http: ['https://evm-t3.cronos.org'] },
  },
  blockExplorers: {
    default: { name: 'Cronos Explorer', url: 'https://cronos.org/explorer/testnet3' },
  },
  testnet: true,
});

// Determine network from env
const networkEnv = process.env.CRONOS_NETWORK || 'testnet';
export const activeChain: Chain = networkEnv === 'mainnet' ? cronos : cronosTestnet;

const rpcUrl = process.env.CRONOS_RPC_URL || (networkEnv === 'mainnet' ? 'https://evm.cronos.org' : 'https://evm-t3.cronos.org');
const privateKey = process.env.TREASURY_PRIVATE_KEY as `0x${string}`;

console.log(`[ChainConfig] Connecting to ${activeChain.name} (${networkEnv}) via ${rpcUrl}`);

export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(rpcUrl, {
    retryCount: 3,
    retryDelay: 1000,
    timeout: 10000,
  }),
});

export const walletClient = privateKey ? createWalletClient({
  account: privateKeyToAccount(privateKey),
  chain: activeChain,
  transport: http(rpcUrl, {
    retryCount: 3,
    retryDelay: 1000,
    timeout: 10000,
  }),
}) : null;

export const treasuryVaultAddress = process.env.TREASURY_VAULT_ADDRESS as `0x${string}`;

if (!treasuryVaultAddress) {
  console.warn('[ChainConfig] TREASURY_VAULT_ADDRESS is not set! Treasury operations will fail.');
}

if (!privateKey) {
  console.warn('[ChainConfig] TREASURY_PRIVATE_KEY is not set! Write operations will fail.');
}

// Health check function
export async function checkConnection(): Promise<boolean> {
  try {
    const blockNumber = await publicClient.getBlockNumber();
    console.log(`[ChainConfig] Connected to ${activeChain.name}. Current block: ${blockNumber}`);
    return true;
  } catch (error) {
    console.error(`[ChainConfig] Failed to connect to ${activeChain.name}:`, error);
    return false;
  }
}
