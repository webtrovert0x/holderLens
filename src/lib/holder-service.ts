import { createPublicClient, http, formatUnits, isAddress } from 'viem';
import { bohrTestnet } from './chain';
import { ERC20_ABI, HOLDERLENS_ABI } from '../contract/HolderLensABI';
import fs from 'fs';
import path from 'path';

export interface HolderItem {
  rank: number;
  address: string;
  isContract: boolean;
  balanceRaw: string;
  balanceFormatted: string;
  percentage: number;
  explorerUrl: string;
  isBurn?: boolean;
}

export interface SnapshotDelta {
  previousTimestamp?: number;
  holderCountDelta?: number;
  top10PercentageDelta?: number;
  hasPrevious: boolean;
}

export interface TokenHolderReport {
  tokenAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupplyRaw: string;
  totalSupplyFormatted: string;
  totalHolders: number;
  top10ConcentrationPercent: number;
  top20ConcentrationPercent: number;
  top50ConcentrationPercent: number;
  whalesCount: number;
  riskRating: 'Extreme' | 'High' | 'Moderate' | 'Low';
  riskDescription: string;
  topHolders: HolderItem[];
  tiers: {
    whalesPercent: number;      // > 5%
    largePercent: number;       // 1% - 5%
    mediumPercent: number;      // 0.1% - 1%
    retailPercent: number;      // < 0.1%
  };
  onChainStats?: {
    totalChecks: number;
    lastCheckTimestamp: number;
    anchoredSnapshotsCount: number;
  };
  snapshotDelta: SnapshotDelta;
  fetchedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const SNAPSHOTS_FILE = path.join(DATA_DIR, 'snapshots.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SNAPSHOTS_FILE)) {
    fs.writeFileSync(SNAPSHOTS_FILE, JSON.stringify({}), 'utf8');
  }
}

function getStoredSnapshots(): Record<string, any[]> {
  try {
    ensureDataDir();
    const content = fs.readFileSync(SNAPSHOTS_FILE, 'utf8');
    return JSON.parse(content || '{}');
  } catch (err) {
    console.error('Error reading snapshots file:', err);
    return {};
  }
}

function saveSnapshotRecord(token: string, record: any) {
  try {
    ensureDataDir();
    const all = getStoredSnapshots();
    const lower = token.toLowerCase();
    if (!all[lower]) {
      all[lower] = [];
    }
    all[lower].unshift(record);
    // Keep last 20 snapshots
    if (all[lower].length > 20) {
      all[lower] = all[lower].slice(0, 20);
    }
    fs.writeFileSync(SNAPSHOTS_FILE, JSON.stringify(all, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving snapshot:', err);
  }
}

export async function fetchTokenHolderData(tokenAddress: string): Promise<TokenHolderReport> {
  if (!isAddress(tokenAddress)) {
    throw new Error('Invalid Ethereum / Bohr token address format.');
  }

  const rpcUrl = process.env.RPC_URL || 'https://rpc.bohr.life';
  const explorerBase = process.env.EXPLORER_URL || 'https://scan.bohr.life';
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const publicClient = createPublicClient({
    chain: bohrTestnet,
    transport: http(rpcUrl),
  });

  // 1. Fetch ERC20 Details via RPC
  let name = 'Unknown Token';
  let symbol = 'TOKEN';
  let decimals = 18;
  let totalSupply = BigInt(0);

  try {
    const results = await Promise.allSettled([
      (publicClient.readContract as any)({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'name',
      }),
      (publicClient.readContract as any)({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
      (publicClient.readContract as any)({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
      (publicClient.readContract as any)({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      }),
    ]);

    if (results[0].status === 'fulfilled') name = results[0].value as string;
    if (results[1].status === 'fulfilled') symbol = results[1].value as string;
    if (results[2].status === 'fulfilled') decimals = Number(results[2].value);
    if (results[3].status === 'fulfilled') totalSupply = results[3].value as bigint;
  } catch (err) {
    console.warn('Could not read standard ERC20 metadata via RPC:', err);
  }

  // 2. Query Bohr Scan Blockscout v2 API for real token holders
  let rawHoldersList: { address: string; isContract: boolean; balance: bigint }[] = [];
  let apiTotalHolders = 0;

  try {
    const apiUrl = `${explorerBase}/api/v2/tokens/${tokenAddress}/holders`;
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        rawHoldersList = data.items.map((item: any) => ({
          address: item.address?.hash || '',
          isContract: !!item.address?.is_contract,
          balance: BigInt(item.value || '0'),
        }));
      }
    }

    // Also get token stats from explorer if available
    const tokenInfoRes = await fetch(`${explorerBase}/api/v2/tokens/${tokenAddress}`, { cache: 'no-store' });
    if (tokenInfoRes.ok) {
      const tokenInfo = await tokenInfoRes.json();
      if (tokenInfo.holders) apiTotalHolders = Number(tokenInfo.holders);
      if (!name || name === 'Unknown Token') name = tokenInfo.name || name;
      if (!symbol || symbol === 'TOKEN') symbol = tokenInfo.symbol || symbol;
      if (tokenInfo.decimals) decimals = Number(tokenInfo.decimals);
      if (tokenInfo.total_supply && totalSupply === BigInt(0)) {
        totalSupply = BigInt(tokenInfo.total_supply);
      }
    }
  } catch (apiErr) {
    console.warn('BohrScan API fetch failed or was empty, falling back to on-chain logs:', apiErr);
  }

  // Fallback: If Blockscout returned no holders, inspect Transfer events from RPC
  if (rawHoldersList.length === 0) {
    try {
      const latestBlock = await publicClient.getBlockNumber();
      // Scan up to last 15,000 blocks for Transfer events
      const fromBlock = latestBlock > BigInt(15000) ? latestBlock - BigInt(15000) : BigInt(0);

      const logs = await publicClient.getLogs({
        address: tokenAddress as `0x${string}`,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', indexed: true, name: 'from' },
            { type: 'address', indexed: true, name: 'to' },
            { type: 'uint256', indexed: false, name: 'value' },
          ],
        },
        fromBlock,
        toBlock: latestBlock,
      });

      const uniqueAddrs = new Set<string>();
      for (const log of logs) {
        if (log.args.from && log.args.from !== '0x0000000000000000000000000000000000000000') {
          uniqueAddrs.add(log.args.from);
        }
        if (log.args.to && log.args.to !== '0x0000000000000000000000000000000000000000') {
          uniqueAddrs.add(log.args.to);
        }
      }

      const addresses = Array.from(uniqueAddrs).slice(0, 50);
      const balancePromises = addresses.map(async (addr) => {
        try {
          const bal = (await (publicClient.readContract as any)({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [addr as `0x${string}`],
          })) as bigint;
          const code = await publicClient.getBytecode({ address: addr as `0x${string}` });
          return {
            address: addr,
            isContract: !!code && code !== '0x',
            balance: bal,
          };
        } catch {
          return null;
        }
      });

      const balances = await Promise.all(balancePromises);
      rawHoldersList = balances
        .filter((b): b is { address: string; isContract: boolean; balance: bigint } => b !== null && b.balance > BigInt(0))
        .sort((a, b) => (b.balance > a.balance ? 1 : -1));
    } catch (logErr) {
      console.warn('Fallback on-chain logs scan failed:', logErr);
    }
  }

  // Sort descending by balance
  rawHoldersList.sort((a, b) => (b.balance > a.balance ? 1 : b.balance < a.balance ? -1 : 0));

  const totalHoldersCount = Math.max(apiTotalHolders, rawHoldersList.length);

  // If total supply is 0, estimate it from sum of holders
  let effectiveSupply = totalSupply;
  if (effectiveSupply === BigInt(0)) {
    effectiveSupply = rawHoldersList.reduce((acc, h) => acc + h.balance, BigInt(0));
  }

  const supplyFloat = effectiveSupply > BigInt(0) ? Number(formatUnits(effectiveSupply, decimals)) : 0;

  // Compute holder percentages
  const topHolders: HolderItem[] = rawHoldersList.map((h, idx) => {
    const balFloat = Number(formatUnits(h.balance, decimals));
    const pct = supplyFloat > 0 ? (balFloat / supplyFloat) * 100 : 0;
    const isBurn =
      h.address.toLowerCase() === '0x0000000000000000000000000000000000000000' ||
      h.address.toLowerCase() === '0x000000000000000000000000000000000000dead';

    return {
      rank: idx + 1,
      address: h.address,
      isContract: h.isContract,
      balanceRaw: h.balance.toString(),
      balanceFormatted: balFloat.toLocaleString('en-US', { maximumFractionDigits: 4 }),
      percentage: Number(pct.toFixed(2)),
      explorerUrl: `${explorerBase}/address/${h.address}`,
      isBurn,
    };
  });

  // Calculate concentration metrics
  const top10 = topHolders.slice(0, 10);
  const top20 = topHolders.slice(0, 20);
  const top50 = topHolders.slice(0, 50);

  const top10Percent = Number(top10.reduce((sum, h) => sum + h.percentage, 0).toFixed(2));
  const top20Percent = Number(top20.reduce((sum, h) => sum + h.percentage, 0).toFixed(2));
  const top50Percent = Number(top50.reduce((sum, h) => sum + h.percentage, 0).toFixed(2));

  // Whales (>2% of supply)
  const whales = topHolders.filter((h) => h.percentage >= 2.0);

  // Tiers calculation
  let whalesPct = 0;
  let largePct = 0;
  let mediumPct = 0;
  let retailPct = 0;

  topHolders.forEach((h) => {
    if (h.percentage >= 5.0) whalesPct += h.percentage;
    else if (h.percentage >= 1.0) largePct += h.percentage;
    else if (h.percentage >= 0.1) mediumPct += h.percentage;
    else retailPct += h.percentage;
  });

  // Risk Rating Assessment
  let riskRating: 'Extreme' | 'High' | 'Moderate' | 'Low' = 'Low';
  let riskDescription = 'Ownership is evenly distributed among the community.';

  if (top10Percent >= 80) {
    riskRating = 'Extreme';
    riskDescription = 'Dangerous concentration: Top 10 wallets control over 80% of circulating supply.';
  } else if (top10Percent >= 55) {
    riskRating = 'High';
    riskDescription = 'High centralization: A few wallets have significant market-moving power.';
  } else if (top10Percent >= 30) {
    riskRating = 'Moderate';
    riskDescription = 'Moderate distribution: Top 10 hold a noticeable share, but decentralization is fair.';
  } else {
    riskRating = 'Low';
    riskDescription = 'Healthy decentralization: Low whale dominance across top accounts.';
  }

  // 3. Snapshot History & Delta Comparison
  const stored = getStoredSnapshots();
  const history = stored[tokenAddress.toLowerCase()] || [];
  const previousSnapshot = history.length > 0 ? history[0] : null;

  let snapshotDelta: SnapshotDelta = {
    hasPrevious: false,
  };

  if (previousSnapshot) {
    const prevCount = previousSnapshot.totalHolders || 0;
    const prevTop10 = previousSnapshot.top10ConcentrationPercent || 0;
    snapshotDelta = {
      hasPrevious: true,
      previousTimestamp: previousSnapshot.timestamp,
      holderCountDelta: totalHoldersCount - prevCount,
      top10PercentageDelta: Number((top10Percent - prevTop10).toFixed(2)),
    };
  }

  // Save current check as a new snapshot point
  saveSnapshotRecord(tokenAddress, {
    timestamp: Date.now(),
    totalHolders: totalHoldersCount,
    top10ConcentrationPercent: top10Percent,
    top20ConcentrationPercent: top20Percent,
  });

  // 4. On-chain statistics from HolderLens contract (if deployed)
  let onChainStats: TokenHolderReport['onChainStats'] = undefined;
  if (contractAddress && isAddress(contractAddress)) {
    try {
      const stats = (await (publicClient.readContract as any)({
        address: contractAddress as `0x${string}`,
        abi: HOLDERLENS_ABI,
        functionName: 'getTokenStats',
        args: [tokenAddress as `0x${string}`],
      })) as [bigint, bigint, bigint];

      onChainStats = {
        totalChecks: Number(stats[0]),
        anchoredSnapshotsCount: Number(stats[1]),
        lastCheckTimestamp: Number(stats[2]),
      };
    } catch (cErr) {
      console.warn('Could not read contract on-chain stats:', cErr);
    }
  }

  return {
    tokenAddress,
    name,
    symbol,
    decimals,
    totalSupplyRaw: effectiveSupply.toString(),
    totalSupplyFormatted: supplyFloat.toLocaleString('en-US', { maximumFractionDigits: 2 }),
    totalHolders: totalHoldersCount,
    top10ConcentrationPercent: Math.min(100, top10Percent),
    top20ConcentrationPercent: Math.min(100, top20Percent),
    top50ConcentrationPercent: Math.min(100, top50Percent),
    whalesCount: whales.length,
    riskRating,
    riskDescription,
    topHolders,
    tiers: {
      whalesPercent: Number(whalesPct.toFixed(2)),
      largePercent: Number(largePct.toFixed(2)),
      mediumPercent: Number(mediumPct.toFixed(2)),
      retailPercent: Number(retailPct.toFixed(2)),
    },
    onChainStats,
    snapshotDelta,
    fetchedAt: new Date().toISOString(),
  };
}
