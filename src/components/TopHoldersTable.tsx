'use client';

import React, { useState } from 'react';
import { HolderItem } from '@/lib/holder-service';
import { Copy, Check, ExternalLink, Code2, User, Flame, Search } from 'lucide-react';
import { useAppConfig } from '@/context/Web3Provider';

interface TopHoldersTableProps {
  holders: HolderItem[];
  symbol: string;
}

export default function TopHoldersTable({ holders, symbol }: TopHoldersTableProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [displayCount, setDisplayCount] = useState<number>(10);
  const { explorerUrl } = useAppConfig();

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const filteredHolders = holders.filter((h) =>
    h.address.toLowerCase().includes(filterText.toLowerCase().trim())
  );

  const displayedList = filteredHolders.slice(0, displayCount);

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
      {/* Table Header Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Largest Token Holders</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Showing top wallets sorted by token balance descending
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Quick Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(7, 9, 14, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            gap: '8px',
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Filter address..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="font-mono"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                width: '130px',
              }}
            />
          </div>

          {/* Display Count Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px' }}>
            {[10, 25, 50].map((num) => (
              <button
                key={num}
                onClick={() => setDisplayCount(num)}
                style={{
                  background: displayCount === num ? 'var(--accent-indigo)' : 'transparent',
                  color: displayCount === num ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Top {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              <th style={{ padding: '12px 14px', width: '60px' }}>Rank</th>
              <th style={{ padding: '12px 14px' }}>Holder Wallet</th>
              <th style={{ padding: '12px 14px' }}>Type</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Balance ({symbol})</th>
              <th style={{ padding: '12px 14px', width: '220px', textAlign: 'right' }}>% of Supply</th>
            </tr>
          </thead>
          <tbody>
            {displayedList.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No holder accounts found matching criteria.
                </td>
              </tr>
            ) : (
              displayedList.map((holder) => {
                const isTop10 = holder.rank <= 10;
                return (
                  <tr
                    key={holder.address}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Rank */}
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: holder.rank <= 3
                          ? 'rgba(245, 158, 11, 0.15)'
                          : isTop10
                          ? 'rgba(99, 102, 241, 0.12)'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: holder.rank <= 3
                          ? 'var(--accent-amber)'
                          : isTop10
                          ? 'var(--accent-cyan)'
                          : 'var(--text-secondary)',
                      }}>
                        #{holder.rank}
                      </span>
                    </td>

                    {/* Holder Address */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                          {holder.address.slice(0, 8)}...{holder.address.slice(-6)}
                        </span>
                        <button
                          onClick={() => handleCopy(holder.address)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: copiedAddress === holder.address ? 'var(--accent-emerald)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px',
                          }}
                          title="Copy Address"
                        >
                          {copiedAddress === holder.address ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                        <a
                          href={holder.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                          title="View on BOTScan"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </td>

                    {/* Entity Type */}
                    <td style={{ padding: '14px' }}>
                      {holder.isBurn ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: 'rgba(244, 63, 94, 0.15)',
                          color: 'var(--accent-rose)',
                        }}>
                          <Flame size={12} />
                          Burn Address
                        </span>
                      ) : holder.isContract ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: 'rgba(168, 85, 247, 0.12)',
                          color: 'var(--accent-purple)',
                        }}>
                          <Code2 size={12} />
                          Smart Contract
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-secondary)',
                        }}>
                          <User size={12} />
                          Wallet (EOA)
                        </span>
                      )}
                    </td>

                    {/* Balance */}
                    <td style={{ padding: '14px', textAlign: 'right' }} className="font-mono">
                      <span style={{ fontWeight: 600 }}>{holder.balanceFormatted}</span>
                    </td>

                    {/* Percentage */}
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                        <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, holder.percentage)}%`,
                              height: '100%',
                              background: holder.percentage > 5 ? 'var(--accent-rose)' : 'var(--accent-cyan)',
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                        <span className="font-mono" style={{ fontWeight: 700, width: '50px', textAlign: 'right' }}>
                          {holder.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
