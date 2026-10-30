'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import TokenSearch from '@/components/TokenSearch';
import MetricsOverview from '@/components/MetricsOverview';
import ConcentrationBreakdown from '@/components/ConcentrationBreakdown';
import TopHoldersTable from '@/components/TopHoldersTable';
import SnapshotDeltaView from '@/components/SnapshotDeltaView';
import { TokenHolderReport } from '@/lib/holder-service';
import { ShieldCheck, BarChart3, Database, Layers } from 'lucide-react';
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
                How HolderLens Works on BOT Chain
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '640px', margin: '0 auto' }}>
                Designed for traders, analysts, and communities on BOT Chain to detect token centralization and whale movements before trading.
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
                  Live indexed holder balances on BOT Chain, sorting wallets by size, identifying smart contracts vs personal EOAs, and flagging burn addresses.
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
                  background: 'rgba(168, 85, 247, 0.12)',
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
                  Sends an immutable audit check to the deployed Solidity contract on BOT Chain. Zero protocol fees, user pays only standard network gas.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer: BOT Chain name visible, clickable links with original botchain logo in front */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 9, 14, 0.95)',
        padding: '28px 0',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          {/* Brand & BOT Chain Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/botchain-logo.png"
              alt="BOT Chain Logo"
              style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'contain' }}
            />
            <span>
              HolderLens &copy; {new Date().getFullYear()} — Token holder distribution analytics on <strong style={{ color: 'var(--text-primary)' }}>BOT Chain</strong>
            </span>
          </div>

          {/* Clickable links with original botchain logo in the front */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Clickable link 1: https://botchain.ai with original botchain logo in the front */}
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--accent-cyan)',
                textDecoration: 'none',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              <img
                src="/botchain-logo.png"
                alt="BOT Chain Logo"
                style={{ width: '18px', height: '18px', borderRadius: '3px', objectFit: 'contain' }}
              />
              <span>https://botchain.ai</span>
            </a>

            {/* Clickable link 2: https://scan.botchain.ai with original botchain logo in the front */}
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--accent-cyan)',
                textDecoration: 'none',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              <img
                src="/botchain-logo.png"
                alt="BOT Chain Logo"
                style={{ width: '18px', height: '18px', borderRadius: '3px', objectFit: 'contain' }}
              />
              <span>https://scan.botchain.ai</span>
            </a>

            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Chain ID: <strong style={{ color: 'var(--text-primary)' }}>677</strong>
            </span>
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Native Token: <strong style={{ color: 'var(--text-primary)' }}>BOT</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
