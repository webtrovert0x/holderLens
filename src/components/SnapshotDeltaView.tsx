'use client';

import React, { useState } from 'react';
import { TokenHolderReport } from '@/lib/holder-service';
import { useAccount, useWriteContract } from 'wagmi';
import { useAppConfig } from '@/context/Web3Provider';
import { HOLDERLENS_ABI } from '@/contract/HolderLensABI';
import { bohrTestnet } from '@/lib/chain';
import { keccak256, toHex } from 'viem';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  Clock, 
  Anchor, 
  CheckCircle2, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';

interface SnapshotDeltaViewProps {
  data: TokenHolderReport;
}

export default function SnapshotDeltaView({ data }: SnapshotDeltaViewProps) {
  const [anchoring, setAnchoring] = useState(false);
  const [anchorTxHash, setAnchorTxHash] = useState<string | null>(null);
  const [anchorError, setAnchorError] = useState<string | null>(null);

  const { isConnected } = useAccount();
  const { contractAddress, explorerUrl } = useAppConfig();
  const { writeContractAsync } = useWriteContract();

  const delta = data.snapshotDelta;
  const prevDate = delta?.previousTimestamp ? new Date(delta.previousTimestamp).toLocaleString() : null;

  const handleAnchorOnChain = async () => {
    if (!contractAddress || !isConnected) return;

    setAnchoring(true);
    setAnchorError(null);
    setAnchorTxHash(null);

    try {
      // Basis points: 100% = 10000. 45.20% = 4520
      const bps = Math.round(data.top10ConcentrationPercent * 100);
      const snapshotPayload = JSON.stringify({
        token: data.tokenAddress,
        totalHolders: data.totalHolders,
        top10: data.top10ConcentrationPercent,
        topHolders: data.topHolders.slice(0, 10).map((h) => ({ addr: h.address, bal: h.balanceRaw })),
        time: Date.now(),
      });
      const snapshotHash = keccak256(toHex(snapshotPayload));

      const hash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: HOLDERLENS_ABI,
        functionName: 'recordSnapshot',
        args: [
          data.tokenAddress as `0x${string}`,
          BigInt(data.totalHolders),
          BigInt(bps),
          snapshotHash,
        ],
        chainId: bohrTestnet.id,
      } as any);

      setAnchorTxHash(hash);
    } catch (err: any) {
      console.error('Failed to anchor snapshot on-chain:', err);
      setAnchorError(err.shortMessage || err.message || 'Failed to anchor snapshot.');
    } finally {
      setAnchoring(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)',
          }}>
            <History size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Snapshot Deltas & Audit Trail</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tracking distribution drift and anchoring cryptographic summaries on Bohr Chain
            </p>
          </div>
        </div>

        {/* Anchor Snapshot On-Chain Button */}
        {contractAddress && (
          <div>
            <button
              onClick={handleAnchorOnChain}
              disabled={anchoring || !isConnected}
              className="btn btn-secondary"
              style={{
                borderColor: 'var(--border-accent)',
                color: 'var(--accent-cyan)',
                fontSize: '0.82rem',
                padding: '8px 14px',
              }}
              title={!isConnected ? 'Connect wallet to anchor snapshot on-chain' : 'Anchor summary on-chain'}
            >
              {anchoring ? (
                <>
                  <Loader2 size={14} className="spinner" />
                  <span>Anchoring on-chain...</span>
                </>
              ) : (
                <>
                  <Anchor size={14} />
                  <span>Anchor Snapshot On-Chain</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Delta Metrics Row */}
      {delta.hasPrevious ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          background: 'rgba(7, 9, 14, 0.5)',
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Previous Snapshot Timestamp
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
              <Clock size={14} color="var(--accent-cyan)" />
              <span>{prevDate}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Holder Count Drift
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 700 }} className="font-mono">
              {(delta.holderCountDelta || 0) > 0 ? (
                <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center' }}>
                  <ArrowUpRight size={16} /> +{delta.holderCountDelta} Wallets
                </span>
              ) : (delta.holderCountDelta || 0) < 0 ? (
                <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center' }}>
                  <ArrowDownRight size={16} /> {delta.holderCountDelta} Wallets
                </span>
              ) : (
                <span style={{ color: 'var(--text-secondary)' }}>0 Wallets changed</span>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Top 10 Supply Shift
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 700 }} className="font-mono">
              {(delta.top10PercentageDelta || 0) > 0 ? (
                <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center' }}>
                  <ArrowUpRight size={16} /> +{delta.top10PercentageDelta}% (Centralizing)
                </span>
              ) : (delta.top10PercentageDelta || 0) < 0 ? (
                <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center' }}>
                  <ArrowDownRight size={16} /> {delta.top10PercentageDelta}% (Dispersing)
                </span>
              ) : (
                <span style={{ color: 'var(--text-secondary)' }}>0.00% shift</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <Clock size={16} color="var(--accent-cyan)" />
          <span>This is the first snapshot recorded for this token. Subsequent checks will calculate exact wallet count and concentration deltas.</span>
        </div>
      )}

      {/* Anchor Confirmation Alert */}
      {anchorTxHash && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--accent-emerald)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CheckCircle2 size={16} />
          <span>Snapshot successfully anchored on Bohr Chain:</span>
          <a
            href={`${explorerUrl}/tx/${anchorTxHash}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono"
            style={{ color: 'var(--accent-emerald)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {anchorTxHash.slice(0, 10)}...{anchorTxHash.slice(-8)}
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {anchorError && (
        <div style={{
          marginTop: '14px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(244, 63, 94, 0.1)',
          color: 'var(--accent-rose)',
          fontSize: '0.82rem',
        }}>
          {anchorError}
        </div>
      )}
    </div>
  );
}
