import { NextResponse } from 'next/server';
import { scanUniverse, fetchMarketRegime } from '@/lib/marketData';
import { getDualPortfolioState, saveDualPortfolioState } from '@/lib/serverStore';
import { openPositionForMarket, updateMarketPositionsWithQuotes } from '@/lib/portfolioManager';
import { Signal } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const startTime = new Date().toISOString();
  const logs: string[] = [];

  try {
    const dualState = getDualPortfolioState();

    const bistRegime = await fetchMarketRegime('BIST');
    const usRegime = await fetchMarketRegime('US');
    dualState.bistRegime = bistRegime;
    dualState.usRegime = usRegime;

    const scanResults = await scanUniverse('ALL');
    dualState.lastScanTime = startTime;
    dualState.lastCronTime = startTime;

    const quotesMap = new Map<string, number>();
    for (const item of scanResults) {
      quotesMap.set(item.ticker, item.technicals.price);
    }

    const { portfolio: updatedBist, events: bistCloseEvents } = updateMarketPositionsWithQuotes(dualState.bist, quotesMap);
    dualState.bist = updatedBist;
    logs.push(...bistCloseEvents);

    const { portfolio: updatedUs, events: usCloseEvents } = updateMarketPositionsWithQuotes(dualState.us, quotesMap);
    dualState.us = updatedUs;
    logs.push(...usCloseEvents);

    // Auto-Trade for BIST (Score >= 60)
    if (dualState.bist.autoTrade) {
      const bistSignals: Signal[] = scanResults
        .filter(r => r.market === 'BIST' && r.signal !== null)
        .map(r => r.signal as Signal)
        .sort((a, b) => b.score - a.score);

      for (const sig of bistSignals) {
        if (sig.score >= 60) {
          const { portfolio: afterTrade, success, message } = openPositionForMarket(sig, dualState.bist);
          if (success) {
            dualState.bist = afterTrade;
            logs.push(`[BIST AUTO] ${message}`);
            dualState.activityLogs.unshift({
              id: `log_${Date.now()}_${sig.ticker}`,
              timestamp: startTime,
              market: 'BIST',
              message,
              type: 'BUY'
            });
          }
        }
      }
    }

    // Auto-Trade for US (Score >= 60)
    if (dualState.us.autoTrade) {
      const usSignals: Signal[] = scanResults
        .filter(r => r.market === 'US' && r.signal !== null)
        .map(r => r.signal as Signal)
        .sort((a, b) => b.score - a.score);

      for (const sig of usSignals) {
        if (sig.score >= 60) {
          const { portfolio: afterTrade, success, message } = openPositionForMarket(sig, dualState.us);
          if (success) {
            dualState.us = afterTrade;
            logs.push(`[US AUTO] ${message}`);
            dualState.activityLogs.unshift({
              id: `log_${Date.now()}_${sig.ticker}`,
              timestamp: startTime,
              market: 'US',
              message,
              type: 'BUY'
            });
          }
        }
      }
    }

    dualState.activityLogs = dualState.activityLogs.slice(0, 50);
    saveDualPortfolioState(dualState);

    return NextResponse.json({
      success: true,
      job: 'automated-dual-market-cron-v5',
      timestamp: startTime,
      scannedCount: scanResults.length,
      bistOpenCount: dualState.bist.positions.length,
      usOpenCount: dualState.us.positions.length,
      eventsLogged: logs.length,
      logs
    });
  } catch (error) {
    console.error('Automated cron failed:', error);
    return NextResponse.json({ success: false, error: 'Cron işlemi sırasında hata oluştu.' }, { status: 500 });
  }
}
