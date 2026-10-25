import { NextRequest, NextResponse } from 'next/server';
import { fetchTokenHolderData } from '@/lib/holder-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token address query parameter is required (e.g. ?token=0x...)' },
      { status: 400 }
    );
  }

  try {
    const data = await fetchTokenHolderData(token.trim());
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching holder analytics:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze token holders on Bohr Chain' },
      { status: 500 }
    );
  }
}
