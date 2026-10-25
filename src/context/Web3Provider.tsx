'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WagmiProvider, createConfig, http, injected } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bohrTestnet } from '@/lib/chain';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const queryClient = new QueryClient();

interface AppConfigContextType {
  projectId: string;
  contractAddress: string;
  explorerUrl: string;
  rpcUrl: string;
  isReady: boolean;
}

export const AppConfigContext = createContext<AppConfigContextType>({
  projectId: '',
  contractAddress: '',
  explorerUrl: 'https://scan.bohr.life',
  rpcUrl: 'https://rpc.bohr.life',
  isReady: false,
});

export const useAppConfig = () => useContext(AppConfigContext);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfigContextType>({
    projectId: '',
    contractAddress: '',
    explorerUrl: 'https://scan.bohr.life',
    rpcUrl: 'https://rpc.bohr.life',
    isReady: false,
  });

  const [wagmiConfig, setWagmiConfig] = useState<any>(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        
        setConfig({
          projectId: data.projectId || '',
          contractAddress: data.contractAddress || '',
          explorerUrl: data.explorerUrl || 'https://scan.bohr.life',
          rpcUrl: data.rpcUrl || 'https://rpc.bohr.life',
          isReady: true,
        });

        // Setup Wagmi Adapter & AppKit if projectId exists
        if (data.projectId) {
          try {
            const wagmiAdapter = new WagmiAdapter({
              ssr: true,
              projectId: data.projectId,
              networks: [bohrTestnet],
            });

            createAppKit({
              adapters: [wagmiAdapter],
              networks: [bohrTestnet],
              projectId: data.projectId,
              metadata: {
                name: 'HolderLens',
                description: 'Token holder analytics on Bohr Chain',
                url: typeof window !== 'undefined' ? window.location.origin : 'https://holderlens.app',
                icons: ['https://scan.bohr.life/assets/configs/network_icon.png'],
              },
              features: {
                analytics: false,
              },
              themeMode: 'dark',
            });

            setWagmiConfig(wagmiAdapter.wagmiConfig);
            return;
          } catch (appKitErr) {
            console.warn('AppKit initialization note:', appKitErr);
          }
        }

        // Fallback standard Wagmi config with injected connectors
        const fallbackConfig = createConfig({
          chains: [bohrTestnet],
          transports: {
            [bohrTestnet.id]: http(data.rpcUrl || 'https://rpc.bohr.life'),
          },
          connectors: [
            injected({ target: 'metaMask' }),
            injected(),
          ],
        });
        setWagmiConfig(fallbackConfig);
      } catch (err) {
        console.error('Failed to load server config:', err);
        // Default standalone wagmi config
        const defaultWagmi = createConfig({
          chains: [bohrTestnet],
          transports: {
            [bohrTestnet.id]: http('https://rpc.bohr.life'),
          },
          connectors: [injected()],
        });
        setWagmiConfig(defaultWagmi);
      }
    }

    init();
  }, []);

  if (!wagmiConfig) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0d14', color: '#94a3b8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="spinner" />
          <span>Initializing HolderLens Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <AppConfigContext.Provider value={config}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </AppConfigContext.Provider>
  );
}
