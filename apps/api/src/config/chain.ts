import { createPublicClient, createWalletClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';

dotenv.config();

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

const rpcUrl = process.env.CRONOS_RPC_URL || 'https://evm-t3.cronos.org';
const privateKey = process.env.TREASURY_PRIVATE_KEY as `0x${string}`;

export const publicClient = createPublicClient({
  chain: cronosTestnet,
  transport: http(rpcUrl),
});

export const walletClient = privateKey ? createWalletClient({
  account: privateKeyToAccount(privateKey),
  chain: cronosTestnet,
  transport: http(rpcUrl),
}) : null;

export const treasuryVaultAddress = process.env.TREASURY_VAULT_ADDRESS as `0x${string}`;
