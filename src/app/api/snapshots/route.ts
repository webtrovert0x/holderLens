import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SNAPSHOTS_FILE = path.join(process.cwd(), '.data', 'snapshots.json');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token address is required' }, { status: 400 });
  }

  try {
    if (!fs.existsSync(SNAPSHOTS_FILE)) {
      return NextResponse.json({ history: [] });
    }
    const content = fs.readFileSync(SNAPSHOTS_FILE, 'utf8');
    const all = JSON.parse(content || '{}');
    const history = all[token.toLowerCase()] || [];
    return NextResponse.json({ history });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
