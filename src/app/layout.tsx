import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Web3Provider } from '@/context/Web3Provider';

export const metadata: Metadata = {
  title: 'HolderLens — Token Holder Analytics on Bohr Chain',
  description: 'Understand how any token is distributed among its holders on Bohr Chain. Analyze whale concentration, top 10 wallets control, and snapshot deltas.',
  keywords: ['Bohr Chain', 'BOT', 'Token Holders', 'Whale Tracking', 'Solidity', 'Crypto Analytics'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
