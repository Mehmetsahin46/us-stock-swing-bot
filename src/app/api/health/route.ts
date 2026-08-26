import { NextResponse } from 'next/server';
import { runSystemHealthCheck } from '@/lib/healthMonitor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const report = await runSystemHealthCheck();
    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Health check failed' }, { status: 500 });
  }
}