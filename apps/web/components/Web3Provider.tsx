import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { cronos, cronosTestnet, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';

// TODO: Replace with your WalletConnect Project ID from https://cloud.walletconnect.com
const walletConnectProjectId = (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [cronos, cronosTestnet, mainnet],
    transports: {
      [cronos.id]: http(),
      [cronosTestnet.id]: http(),
      [mainnet.id]: http(),
    },

    // Required API Keys
    walletConnectProjectId,

    // Required App Info
    appName: "Kitabu",
    appDescription: "AI-native Treasury Management",
    appUrl: "https://kitabu.ai",
    appIcon: "/logos/logo.svg", 
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="auto">
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
