import { NextResponse } from 'next/server';

export async function GET() {
  const projectId = process.env.REOWN_PROJECT_ID || '';
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
  const rpcUrl = process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.bohr.life';
  const explorerUrl = process.env.EXPLORER_URL || process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://scan.bohr.life';

  return NextResponse.json({
    projectId,
    contractAddress,
    rpcUrl,
    explorerUrl,
    chainId: 968,
  });
}
