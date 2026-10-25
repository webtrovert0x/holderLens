'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import TokenSearch from '@/components/TokenSearch';
import MetricsOverview from '@/components/MetricsOverview';
import ConcentrationBreakdown from '@/components/ConcentrationBreakdown';
import TopHoldersTable from '@/components/TopHoldersTable';
import SnapshotDeltaView from '@/components/SnapshotDeltaView';
import { TokenHolderReport } from '@/lib/holder-service';
import { ShieldCheck, BarChart3, Database, Layers, ArrowRight } from 'lucide-react';
import { useAppConfig } from '@/context/Web3Provider';

export default function HomePage() {
  const [holderReport, setHolderReport] = useState<TokenHolderReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { explorerUrl, contractAddress } = useAppConfig();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="ambient-glow" />
      <Navbar />

      <main className="container" style={{ flex: 1, padding: '36px 24px 64px' }}>
        {/* Token Search Bar & Tx Trigger */}
        <TokenSearch
          onDataFetched={(data) => setHolderReport(data)}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {/* If Holder Data Loaded */}
        {holderReport ? (
          <div>
            {/* 1. Key Metrics Cards */}
            <MetricsOverview data={holderReport} />

            {/* 2. Concentration & Tiers Analysis */}
            <ConcentrationBreakdown data={holderReport} />

            {/* 3. Snapshot Delta & On-chain Anchoring */}
            <SnapshotDeltaView data={holderReport} />

            {/* 4. Top Holders Table */}
            <TopHoldersTable
              holders={holderReport.topHolders}
              symbol={holderReport.symbol}
            />
          </div>
        ) : !isLoading && (
          /* Empty / Explanatory State */
          <div style={{ marginTop: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
                How HolderLens Works
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '640px', margin: '0 auto' }}>
                Designed for traders, analysts, and communities on Bohr Chain to detect token centralization and whale movements before trading.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
            }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)',
                  marginBottom: '16px',
                }}>
                  <BarChart3 size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                  Largest Token Holders
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Live indexed holder balances, sorting wallets by size, identifying smart contracts vs personal EOAs, and flagging burn addresses.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-rose)',
                  marginBottom: '16px',
                }}>
                  <Layers size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                  Top 10 Supply Control
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Instant risk tier evaluation calculating whether ownership is concentrated in a few wallets or healthily distributed across community holders.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(168, 85, 247, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-purple)',
                  marginBottom: '16px',
                }}>
                  <Database size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                  Snapshot Drift Diffs
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Compares distribution shifts between checks to notify you when top wallets are accumulating or dumping tokens.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-emerald)',
                  marginBottom: '16px',
                }}>
                  <ShieldCheck size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                  On-Chain Verifiability
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Sends an immutable audit check to the deployed Solidity contract on Bohr Chain. Zero protocol fees, user pays only standard network gas.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 9, 14, 0.9)',
        padding: '24px 0',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            HolderLens &copy; {new Date().getFullYear()} — Token holder distribution analytics engine.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href={explorerUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              BohrScan Explorer
            </a>
            <span>&bull;</span>
            <span>Chain ID: 968</span>
            <span>&bull;</span>
            <span>Native Currency: BOT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
