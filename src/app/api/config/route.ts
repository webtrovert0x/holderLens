import { NextResponse } from 'next/server';

export async function GET() {
  const projectId = process.env.REOWN_PROJECT_ID || '';
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
  const rpcUrl = process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.botchain.ai';
  const explorerUrl = process.env.EXPLORER_URL || process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://scan.botchain.ai';
  const chainId = Number(process.env.CHAIN_ID || process.env.NEXT_PUBLIC_CHAIN_ID || 677);

  return NextResponse.json({
    projectId,
    contractAddress,
    rpcUrl,
    explorerUrl,
    chainId,
  });
}
