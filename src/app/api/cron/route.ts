import { NextResponse } from 'next/server';
import { scanUniverse } from '@/lib/marketData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const scanResults = await scanUniverse();
    const activeSignals = scanResults
      .map(r => r.signal)
      .filter((s): s is NonNullable<typeof s> => s !== null);

    return NextResponse.json({
      success: true,
      job: 'daily-market-scan',
      timestamp: new Date().toISOString(),
      scannedCount: scanResults.length,
      signalsGenerated: activeSignals.length,
      signals: activeSignals
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ success: false, error: 'Cron işlemi başarısız oldu.' }, { status: 500 });
  }
}
