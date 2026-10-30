'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { isAddress } from 'viem';
import { Search, Loader2, Sparkles, CheckCircle2, AlertCircle, ExternalLink, Zap, Fuel, ShieldAlert } from 'lucide-react';
import { useAppConfig } from '@/context/Web3Provider';
import { HOLDERLENS_ABI } from '@/contract/HolderLensABI';
import { botchain } from '@/lib/chain';

interface TokenSearchProps {
  onDataFetched: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export default function TokenSearch({ onDataFetched, isLoading, setIsLoading }: TokenSearchProps) {
  const [tokenAddress, setTokenAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const { isConnected } = useAccount();
  const { contractAddress, explorerUrl } = useAppConfig();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Known active tokens on BOT Chain for 1-click testing
  const sampleTokens = [
    { name: 'Wrapped BOT', symbol: 'WBOT', address: '0xD5452816194a3784dBa983426cCe7c122F4abd30' },
    { name: 'Tether USD', symbol: 'USDT', address: '0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C' },
    { name: 'BotChain Test Token', symbol: 'BTT', address: '0x8b559c7049eD44f2e3e5Db54E2B72C33f23F6D43' },
  ];

  const fetchHoldersData = async (targetToken: string) => {
    setStatusMessage('Transaction verified! Indexing live token holder distribution...');
    try {
      const res = await fetch(`/api/holders?token=${targetToken}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze holders.');
      }
      onDataFetched(data);
      setStatusMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading holder data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckHolders = async (tokenToInspect?: string) => {
    setErrorMsg('');
    const cleanAddress = (tokenToInspect || tokenAddress).trim();

    if (!cleanAddress) {
      setErrorMsg('Please enter a valid ERC-20 token address.');
      return;
    }

    if (!isAddress(cleanAddress)) {
      setErrorMsg('Invalid address format. Must be a valid 42-character 0x address.');
      return;
    }

    // MANDATORY 1: Wallet Connection Required for Gas Fee
    if (!isConnected) {
      setErrorMsg('Wallet connection required! You must connect your wallet to pay the BOT Chain gas fee for the on-chain check.');
      const connectBtn = document.getElementById('wallet-connect-btn');
      if (connectBtn) connectBtn.click();
      return;
    }

    // MANDATORY 2: Contract Must Be Deployed
    if (!contractAddress) {
      setErrorMsg('HolderLens contract is not yet deployed on BOT Chain! Run "npm run deploy" to deploy the contract and enable on-chain checks.');
      return;
    }

    setIsLoading(true);
    setTxHash(null);

    // MANDATORY 3: Must Send On-Chain Transaction & Pay Gas Fee
    try {
      setStatusMessage('Please confirm the "recordHolderCheck" transaction in your wallet (BOT Gas Fee required)...');
      
      const hash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: HOLDERLENS_ABI,
        functionName: 'recordHolderCheck',
        args: [cleanAddress as `0x${string}`],
        chainId: botchain.id,
      } as any);

      setTxHash(hash);
      setStatusMessage('Transaction submitted to BOT Chain. Awaiting block confirmation (gas fee paid)...');

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      } else {
        await new Promise((r) => setTimeout(r, 3500));
      }

      // ONLY after the on-chain gas transaction is confirmed do we fetch & show holder data
      await fetchHoldersData(cleanAddress);
    } catch (txErr: any) {
      console.error('Contract transaction canceled or failed:', txErr);
      setIsLoading(false);
      setStatusMessage('');
      const reason = txErr?.shortMessage || txErr?.message || 'Transaction rejected';
      setErrorMsg(`Gas transaction failed or rejected: ${reason}. Paying the on-chain gas fee is required to check holders.`);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          marginBottom: '12px',
          letterSpacing: '-0.8px',
          background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Deep Token Holder Intelligence
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}>
          Analyze whale concentration, top 10 supply control, and historical distribution shifts on BOT Chain.
          Submits an audit record on-chain via smart contract (gas fee required, 0 service fee).
        </p>

        {/* Input & Action Bar */}
        <div style={{
          display: 'flex',
          gap: '10px',
          position: 'relative',
          background: 'rgba(7, 9, 14, 0.6)',
          padding: '8px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '14px', color: 'var(--text-muted)' }}>
            <Search size={20} />
          </div>
          <input
            type="text"
            id="token-address-input"
            placeholder="Enter BOT Chain ERC-20 token address (0x...)"
            value={tokenAddress}
            onChange={(e) => {
              setTokenAddress(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleCheckHolders();
              }
            }}
            className="font-mono"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              padding: '10px 0',
            }}
          />

          {/* Primary Action Button */}
          <button
            onClick={() => handleCheckHolders()}
            disabled={isLoading || !tokenAddress.trim()}
            className="btn btn-primary"
            id="check-holders-btn"
            style={{ minWidth: '170px' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span>Check Holders</span>
              </>
            )}
          </button>
        </div>

        {/* Gas Fee Notice Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '12px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}>
          <Fuel size={14} color="var(--accent-amber)" />
          <span>Requires <strong style={{ color: 'var(--accent-amber)' }}>BOT Chain Gas Fee</strong> for on-chain verification transaction (0 HolderLens service fee)</span>
        </div>

        {/* Quick sample chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '16px',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Try verified sample:</span>
          {sampleTokens.map((sample) => (
            <button
              key={sample.address}
              onClick={() => {
                setTokenAddress(sample.address);
                handleCheckHolders(sample.address);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                color: 'var(--accent-cyan)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={12} />
              <span>{sample.name} ({sample.symbol})</span>
            </button>
          ))}
        </div>

        {/* Status Message / Transaction Progress */}
        {statusMessage && (
          <div style={{
            marginTop: '20px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: 'var(--accent-cyan)',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}>
            <Loader2 size={16} className="spinner" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tx Hash Confirmation Alert */}
        {txHash && (
          <div style={{
            marginTop: '14px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--accent-emerald)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={16} />
            <span>Check recorded on BOT Chain (Gas Paid):</span>
            <a
              href={`${explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono"
              style={{
                color: 'var(--accent-emerald)',
                textDecoration: 'underline',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
