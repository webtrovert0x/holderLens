'use client';

import React from 'react';
import { TokenHolderReport } from '@/lib/holder-service';
import { ShieldAlert, BarChart3, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ConcentrationBreakdownProps {
  data: TokenHolderReport;
}

export default function ConcentrationBreakdown({ data }: ConcentrationBreakdownProps) {
  const { tiers, top10ConcentrationPercent, top20ConcentrationPercent, top50ConcentrationPercent, riskRating, riskDescription } = data;

  const isConcentrated = top10ConcentrationPercent >= 50;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '32px' }}>
      {/* Panel 1: Concentration Risk & Ownership verdict */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: isConcentrated ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isConcentrated ? 'var(--accent-rose)' : 'var(--accent-emerald)',
          }}>
            {isConcentrated ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Ownership Concentration Analysis</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Is supply monopolized or decentralized?</p>
          </div>
        </div>

        {/* Verdict Box */}
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          background: isConcentrated ? 'rgba(244, 63, 94, 0.08)' : 'rgba(16, 185, 129, 0.08)',
          border: `1px solid ${isConcentrated ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isConcentrated ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
              {isConcentrated ? '⚠️ Heavy Concentration Detected' : '🛡️ Well-Dispersed Ownership'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {riskDescription}
          </p>
        </div>

        {/* Top Tiers Comparison */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Top 10 Wallets</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>{top10ConcentrationPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${top10ConcentrationPercent}%`, height: '100%', background: 'linear-gradient(90deg, #f43f5e, #fb7185)', borderRadius: '4px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Top 20 Wallets</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>{top20ConcentrationPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${top20ConcentrationPercent}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fcd34d)', borderRadius: '4px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Top 50 Wallets</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{top50ConcentrationPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${top50ConcentrationPercent}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', borderRadius: '4px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Panel 2: Holder Tiers Distribution */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-indigo)',
          }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Holder Tiers Breakdown</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Percentage of supply held across wallet sizes</p>
          </div>
        </div>

        {/* Stacked Visual Bar */}
        <div style={{
          width: '100%',
          height: '24px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)',
        }}>
          {tiers.whalesPercent > 0 && (
            <div
              style={{ width: `${tiers.whalesPercent}%`, background: '#f43f5e', height: '100%' }}
              title={`Whales (>5%): ${tiers.whalesPercent}%`}
            />
          )}
          {tiers.largePercent > 0 && (
            <div
              style={{ width: `${tiers.largePercent}%`, background: '#f59e0b', height: '100%' }}
              title={`Large (1-5%): ${tiers.largePercent}%`}
            />
          )}
          {tiers.mediumPercent > 0 && (
            <div
              style={{ width: `${tiers.mediumPercent}%`, background: '#6366f1', height: '100%' }}
              title={`Medium (0.1-1%): ${tiers.mediumPercent}%`}
            />
          )}
          <div
            style={{ flex: 1, background: '#10b981', height: '100%' }}
            title={`Retail (<0.1%): ${tiers.retailPercent}%`}
          />
        </div>

        {/* Legend / Tier Items */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Whales (&gt;5%)</span>
            </div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f43f5e' }}>
              {tiers.whalesPercent}%
            </div>
          </div>

          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Large (1% - 5%)</span>
            </div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>
              {tiers.largePercent}%
            </div>
          </div>

          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Medium (0.1% - 1%)</span>
            </div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6366f1' }}>
              {tiers.mediumPercent}%
            </div>
          </div>

          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Retail (&lt;0.1%)</span>
            </div>
            <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
              {tiers.retailPercent}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
