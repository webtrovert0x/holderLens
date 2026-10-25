'use client';

import React, { useState } from 'react';
import { TokenHolderReport } from '@/lib/holder-service';
import { 
  Users, 
  PieChart, 
  Coins, 
  ShieldAlert, 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  Copy, 
  Check, 
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';
import { useAppConfig } from '@/context/Web3Provider';

interface MetricsOverviewProps {
  data: TokenHolderReport;
}

export default function MetricsOverview({ data }: MetricsOverviewProps) {
  const [copied, setCopied] = useState(false);
  const { explorerUrl } = useAppConfig();

  const handleCopy = () => {
    navigator.clipboard.writeText(data.tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deltaHolders = data.snapshotDelta?.holderCountDelta || 0;
  const deltaTop10 = data.snapshotDelta?.top10PercentageDelta || 0;

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'Extreme': return 'badge-extreme';
      case 'High': return 'badge-high';
      case 'Moderate': return 'badge-moderate';
      default: return 'badge-low';
    }
  };

  const formatCompactSupply = (rawFormatted: string) => {
    const clean = rawFormatted.replace(/,/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) return rawFormatted;

    const tiers = [
      { value: 1e24, symbol: 'Sp' }, // Septillion
      { value: 1e21, symbol: 'Sx' }, // Sextillion
      { value: 1e18, symbol: 'Qi' }, // Quintillion
      { value: 1e15, symbol: 'Qa' }, // Quadrillion
      { value: 1e12, symbol: 'T' },  // Trillion
      { value: 1e9, symbol: 'B' },   // Billion
      { value: 1e6, symbol: 'M' },   // Million
      { value: 1e3, symbol: 'K' },   // Thousand
    ];

    const match = tiers.find((t) => num >= t.value);
    if (match) {
      const val = (num / match.value).toFixed(2);
      const cleanVal = parseFloat(val).toString();
      return `${cleanVal} ${match.symbol}`;
    }

    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Token Header Banner */}
      <div className="glass-panel" style={{
        padding: '24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderLeft: '4px solid var(--accent-indigo)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(56, 189, 248, 0.2))',
            border: '1px solid var(--border-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--accent-cyan)',
          }}>
            {data.symbol ? data.symbol.slice(0, 3) : 'TOK'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                {data.name}
              </h2>
              <span style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}>
                ${data.symbol}
              </span>
              <span className={`badge ${getRiskBadgeClass(data.riskRating)}`}>
                {data.riskRating} Risk
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {data.tokenAddress}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: copied ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
                title="Copy Address"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <a
                href={`${explorerUrl}/token/${data.tokenAddress}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                title="View on BohrScan"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Decimals</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }} className="font-mono">{data.decimals}</div>
        </div>
      </div>

      {/* Grid of Key Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
      }}>
        {/* Card 1: Top 10 Control */}
        <div className="glass-panel" style={{ padding: '20px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Top 10 Wallets Share
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-rose)',
              flexShrink: 0,
            }}>
              <PieChart size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '6px' }} className="font-mono">
            {data.top10ConcentrationPercent}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            {data.snapshotDelta.hasPrevious ? (
              deltaTop10 > 0 ? (
                <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  <ArrowUpRight size={14} /> +{deltaTop10}% vs prev
                </span>
              ) : deltaTop10 < 0 ? (
                <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  <ArrowDownRight size={14} /> {deltaTop10}% vs prev
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>0% change</span>
              )
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Baseline snapshot</span>
            )}
          </div>
        </div>

        {/* Card 2: Total Holders */}
        <div className="glass-panel" style={{ padding: '20px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Unique Holders
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
              flexShrink: 0,
            }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '6px' }} className="font-mono">
            {data.totalHolders.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            {data.snapshotDelta.hasPrevious ? (
              deltaHolders > 0 ? (
                <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  <ArrowUpRight size={14} /> +{deltaHolders} new holders
                </span>
              ) : deltaHolders < 0 ? (
                <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  <ArrowDownRight size={14} /> {deltaHolders} holders
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>No change</span>
              )
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Real-time discovered</span>
            )}
          </div>
        </div>

        {/* Card 3: Total Supply */}
        <div className="glass-panel" style={{ padding: '20px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Total Supply
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-indigo)',
              flexShrink: 0,
            }}>
              <Coins size={18} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              marginBottom: '6px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            className="font-mono"
            title={`${data.totalSupplyFormatted} ${data.symbol}`}
          >
            {formatCompactSupply(data.totalSupplyFormatted)}
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={`${data.totalSupplyFormatted} ${data.symbol}`}
          >
            {data.totalSupplyFormatted} {data.symbol}
          </div>
        </div>

        {/* Card 4: Whales Count */}
        <div className="glass-panel" style={{ padding: '20px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Whale Wallets (&gt;2%)
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)',
              flexShrink: 0,
            }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '6px' }} className="font-mono">
            {data.whalesCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Control top market share
          </div>
        </div>

        {/* Card 5: On-Chain Audit Records */}
        <div className="glass-panel" style={{ padding: '20px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              On-Chain Checks
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(168, 85, 247, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-purple)',
              flexShrink: 0,
            }}>
              <History size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '6px' }} className="font-mono">
            {data.onChainStats ? data.onChainStats.totalChecks : '1+'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Verified on HolderLens contract
          </div>
        </div>
      </div>
    </div>
  );
}
