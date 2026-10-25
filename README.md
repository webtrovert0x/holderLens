<p align="center">
  <img src="public/logo.png" width="160" height="160" alt="HolderLens Logo" />
</p>

# HolderLens — Token Holder Analytics on Bohr Chain

**HolderLens** helps users understand how an ERC-20 token is distributed among its holders on **Bohr Testnet (Chain ID 968, BOT)**.

📖 **[Read the Official Whitepaper](WHITEPAPER.md)** | 🔍 **[View Deployed Contract on BohrScan](https://scan.bohr.life/address/0x4f94b30803f2b34630D427E452c85547Df5A6274)**

---

## ⚡ What it Does
- **Largest Token Holders**: Real-time indexed wallet balances, sorted descending, with contract/EOA/burn classifications.
- **Top 10 Supply Control**: Calculates exact percentage of total supply controlled by the top 10 wallets.
- **Ownership Concentration Rating**: Flags extreme whale dominance vs healthy decentralization.
- **Snapshot Drift Tracking**: Compares distribution shifts between checks (e.g. `+X holders`, `+Y% top 10 drift`).
- **On-Chain Verifiability**: Users send a transaction to the deployed `HolderLens.sol` Solidity contract to record the audit check on Bohr Chain with zero protocol fees (paying only network gas).

---

## 🛠️ Project Architecture

```text
holderLens/
├── contracts/
│   └── HolderLens.sol             # Solidity smart contract on Bohr Chain
├── scripts/
│   └── deploy.js                  # Deployment script with auto-updating .env.local
├── test/
│   └── HolderLens.test.js         # 100% test suite for the smart contract
├── hardhat.config.js              # Bohr testnet (RPC: https://rpc.bohr.life, Chain ID: 968)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── config/route.ts    # Secure server-side config (REOWN_PROJECT_ID kept private)
│   │   │   ├── holders/route.ts   # Real holder indexing & concentration engine (NO MOCK DATA)
│   │   │   └── snapshots/route.ts # Historical snapshot persistence
│   │   ├── page.tsx               # Primary dashboard interface
│   │   └── layout.tsx             # Root layout with Web3 provider
│   ├── components/
│   │   ├── Navbar.tsx             # Bohr testnet indicator & wallet connect
│   │   ├── TokenSearch.tsx        # Search bar + on-chain "Check Holders" transaction trigger
│   │   ├── MetricsOverview.tsx    # Key metrics, deltas, and risk cards
│   │   ├── ConcentrationBreakdown.tsx # Tier breakdown (Whales, Large, Medium, Retail)
│   │   ├── TopHoldersTable.tsx    # Table of largest token holders with BohrScan links
│   │   └── SnapshotDeltaView.tsx  # Historical comparison & on-chain snapshot anchoring
│   ├── context/
│   │   └── Web3Provider.tsx       # Reown AppKit & Wagmi Web3 client
│   └── lib/
│       ├── chain.ts               # Bohr testnet chain definition
│       └── holder-service.ts      # Real indexing service via BohrScan API & RPC
├── .env.local                     # Environment variables (Private key & Reown ID)
└── package.json
```

---

## 🚀 Getting Started

### 1. Fill your Private Key & Reown Project ID in `.env.local`
Edit [.env.local](file:///Users/mac/Desktop/holderLens/.env.local):

```env
# Reown / WalletConnect Project ID (PRIVATE - Server-side only, NOT public)
REOWN_PROJECT_ID=your_reown_project_id_here

# Deployer Private Key for Hardhat (Funded with Bohr Testnet BOT)
PRIVATE_KEY=your_private_key_here

# Bohr Testnet Configuration
RPC_URL=https://rpc.bohr.life
CHAIN_ID=968
EXPLORER_URL=https://scan.bohr.life/

# Automatically populated after deployment:
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

### 2. Deploy the Smart Contract to Bohr Testnet
Once your `PRIVATE_KEY` has BOT tokens on Bohr testnet:

```bash
npm run deploy
```

This will:
1. Deploy `HolderLens.sol` to Bohr Chain.
2. Automatically write the deployed address into `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`.

### 3. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3005](http://localhost:3005) in your browser.
Try testing with the verified Bohr testnet token: `0x742c9857EeD423aF04858A375DAa0Dad31539fae` (Test Doge).
