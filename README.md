<p align="center">
  <img src="public/botchain-logo.png" width="120" height="120" alt="BOT Chain Logo" style="border-radius: 20px; background: #000; padding: 10px;" />
</p>

# HolderLens — Token Holder Analytics on BOT Chain Mainnet

**HolderLens** helps users understand how an ERC-20 token is distributed among its holders on **BOT Chain Mainnet (Chain ID: 677, BOT)**.

🔗 **[Official Website](https://botchain.ai)** | 🔍 **[BOT Chain Explorer](https://scan.botchain.ai)** | 📜 **[Verified Contract on BOTScan](https://scan.botchain.ai/address/0x8A1fA6aC2442231B0D7C9250683C335713F21f7f#code)**

---

## ⚡ What it Does
- **Largest Token Holders**: Real-time indexed wallet balances on BOT Chain, sorted descending, with contract/EOA/burn classifications.
- **Top 10 Supply Control**: Calculates exact percentage of total supply controlled by the top 10 wallets.
- **Ownership Concentration Rating**: Flags extreme whale dominance vs healthy decentralization.
- **Snapshot Drift Tracking**: Compares distribution shifts between checks (e.g. `+X holders`, `+Y% top 10 drift`).
- **On-Chain Verifiability**: Users send a transaction to the deployed `HolderLens.sol` Solidity contract to record the audit check on BOT Chain with zero protocol fees (paying only network gas).

---

## 🌐 BOT Chain Mainnet Details

- **Chain ID**: `677`
- **RPC URL**: `https://rpc.botchain.ai`
- **Native Currency**: `BOT` (18 Decimals)
- **Block Explorer**: `https://scan.botchain.ai`
- **Official Website**: `https://botchain.ai`
- **Deployed & Verified Contract Address**: `0x8A1fA6aC2442231B0D7C9250683C335713F21f7f`

---

## 🛠️ Project Architecture

```text
holderLens/
├── contracts/
│   └── HolderLens.sol             # Solidity smart contract on BOT Chain
├── scripts/
│   └── deploy.js                  # Deployment script with auto-updating .env.local & verification
├── test/
│   └── HolderLens.test.js         # Test suite for the smart contract
├── hardhat.config.js              # BOT Chain Mainnet (RPC: https://rpc.botchain.ai, Chain ID: 677)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── config/route.ts    # Secure server-side config
│   │   │   ├── holders/route.ts   # Real holder indexing & concentration engine
│   │   │   └── snapshots/route.ts # Historical snapshot persistence
│   │   ├── page.tsx               # Primary dashboard interface
│   │   └── layout.tsx             # Root layout with Web3 provider
│   ├── components/
│   │   ├── Navbar.tsx             # BOT Chain indicator, links & wallet connect
│   │   ├── TokenSearch.tsx        # Search bar + on-chain "Check Holders" transaction trigger
│   │   ├── MetricsOverview.tsx    # Key metrics, deltas, and risk cards
│   │   ├── ConcentrationBreakdown.tsx # Tier breakdown (Whales, Large, Medium, Retail)
│   │   ├── TopHoldersTable.tsx    # Table of largest token holders with BOTScan links
│   │   └── SnapshotDeltaView.tsx  # Historical comparison & on-chain snapshot anchoring
│   ├── context/
│   │   └── Web3Provider.tsx       # Reown AppKit & Wagmi Web3 client
│   └── lib/
│       ├── chain.ts               # BOT Chain viem chain definition
│       └── holder-service.ts      # Real indexing service via BOTScan API & RPC
├── .env.local                     # Environment variables
└── package.json
```

---

## 🚀 Getting Started

### 1. Configuration in `.env.local`

```env
# WalletConnect / Reown Project ID
REOWN_PROJECT_ID=591d75cdaaf5e1cb8acb305c35c9de92

# BOT Chain Mainnet Configuration
CHAIN_ID=677
RPC_URL=https://rpc.botchain.ai
EXPLORER_URL=https://scan.botchain.ai
NEXT_PUBLIC_CHAIN_ID=677
NEXT_PUBLIC_RPC_URL=https://rpc.botchain.ai
NEXT_PUBLIC_EXPLORER_URL=https://scan.botchain.ai

# Deployed HolderLens Contract Address
NEXT_PUBLIC_CONTRACT_ADDRESS=0x8A1fA6aC2442231B0D7C9250683C335713F21f7f

# Deployer Private Key for Hardhat (PRIVATE)
PRIVATE_KEY=your_private_key_here
```

### 2. Deploy & Verify Smart Contract

```bash
npm run deploy
```

This will:
1. Deploy `HolderLens.sol` to BOT Chain Mainnet.
2. Automatically write the deployed address into `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`.
3. Submit and verify source code on `https://scan.botchain.ai`.

### 3. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3005](http://localhost:3005) in your browser.
Test with live BOT Chain tokens such as Wrapped BOT (`0xD5452816194a3784dBa983426cCe7c122F4abd30`) or Tether USD (`0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C`).
