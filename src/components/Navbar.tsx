'use client';

import React from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useAppConfig } from '@/context/Web3Provider';
import { ShieldCheck, Wallet, ExternalLink, Activity, Sparkles, LogOut } from 'lucide-react';
import { bohrTestnet } from '@/lib/chain';

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect();
  const { data: balanceData } = useBalance({ address, chainId: bohrTestnet.id });
  const { contractAddress, explorerUrl } = useAppConfig();

  const handleConnect = () => {
    // If AppKit custom element exists, trigger it or fallback to first connector
    const appKitBtn = document.querySelector('appkit-button') as HTMLElement;
    if (appKitBtn) {
      appKitBtn.click();
      return;
    }
    const metaMaskOrInjected = connectors.find((c) => c.name.toLowerCase().includes('metamask')) || connectors[0];
    if (metaMaskOrInjected) {
      connect({ connector: metaMaskOrInjected });
    }
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(7, 9, 14, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '16px 0',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo and Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/logo.png"
            alt="HolderLens Logo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              objectFit: 'cover',
              boxShadow: 'var(--glow-cyan)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Holder<span style={{ color: 'var(--accent-cyan)' }}>Lens</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}>
                v1.0
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Bohr Chain Token Distribution Analytics
            </p>
          </div>
        </div>

        {/* Network & Wallet Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Bohr Chain Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '0.8rem',
            color: 'var(--accent-emerald)',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-emerald)',
              boxShadow: '0 0 8px var(--accent-emerald)',
              display: 'inline-block',
            }} />
            <span style={{ fontWeight: 600 }}>Bohr Testnet</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span className="font-mono" style={{ fontSize: '0.75rem' }}>ID: 968</span>
          </div>

          {/* Contract Status Link */}
          {contractAddress ? (
            <a
              href={`${explorerUrl}/address/${contractAddress}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                fontSize: '0.8rem',
                color: 'var(--accent-cyan)',
                textDecoration: 'none',
              }}
              title="View Deployed HolderLens Contract"
            >
              <ShieldCheck size={14} />
              <span>HolderLens Contract</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <div style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              fontSize: '0.75rem',
              color: 'var(--accent-amber)',
            }}>
              Ready for deploy
            </div>
          )}

          {/* Wallet Connect / AppKit */}
          {isConnected && address ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Wallet size={14} color="var(--accent-cyan)" />
                <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                {balanceData && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                    ({Number(balanceData.formatted).toFixed(3)} BOT)
                  </span>
                )}
              </div>
              <button
                onClick={() => disconnect()}
                className="btn btn-secondary"
                style={{ padding: '8px 10px' }}
                title="Disconnect Wallet"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="btn btn-primary"
              id="wallet-connect-btn"
            >
              <Wallet size={16} />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
