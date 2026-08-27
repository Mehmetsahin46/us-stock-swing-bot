import { NextRequest, NextResponse } from 'next/server';
import { scanUniverse } from '@/lib/marketData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketParam = (searchParams.get('market') || 'ALL').toUpperCase() as 'ALL' | 'US' | 'BIST';
    const marketFilter = ['US', 'BIST'].includes(marketParam) ? marketParam : 'ALL';

    const results = await scanUniverse(marketFilter);
    const rawSignals = results.map(r => r.signal).filter((s): s is NonNullable<typeof s> => s !== null);

    // 🚨 32 & 34. SIGNAL SECURITY, ANOMALY & QUARANTINE FILTER
    const { filterAndQuarantineSignals } = await import('@/lib/signalSecurityEngine');
    const { approvedSignals, quarantinedSignals, anomalyDetected, alertMessage } = filterAndQuarantineSignals(rawSignals);

    // If anomaly or quarantine, strip unapproved signals from public results
    const approvedTickerSet = new Set(approvedSignals.map(s => s.ticker));
    const quarantinedMap = new Map(quarantinedSignals.map(s => [s.ticker, s]));

    const sanitizedResults = results.map(r => {
      if (r.signal && !approvedTickerSet.has(r.signal.ticker)) {
        const qSig = quarantinedMap.get(r.signal.ticker);
        return {
          ...r,
          signal: {
            ...r.signal,
            isQuarantined: true,
            quarantineReason: qSig?.quarantineReason || '2. Veri Kaynağı & KAP Teyidi Bekleniyor',
            quarantineExpiresInSeconds: qSig?.quarantineExpiresInSeconds || 45,
            title: `🟡 SIGNAL UNDER VALIDATION: ${r.signal.displayTicker} (Karantinada)`
          }
        };
      }
      return r;
    });

    const { getCachedUniverseStatus } = await import('@/lib/universeManager');
    const dynamicUniverseStatus = getCachedUniverseStatus();

    return NextResponse.json({
      success: true,
      market: marketFilter,
      timestamp: new Date().toISOString(),
      totalScanned: sanitizedResults.length,
      signalsFound: approvedSignals.length,
      quarantinedCount: quarantinedSignals.length,
      anomalyDetected,
      alertMessage,
      dynamicUniverseStatus,
      results: sanitizedResults
    });
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { success: false, error: 'Piyasa taraması sırasında hata oluştu.' },
      { status: 500 }
    );
  }
}
