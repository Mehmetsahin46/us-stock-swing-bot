import { NextResponse } from 'next/server';
import { scanUniverse } from '@/lib/marketData';
import { getDualPortfolioState, saveDualPortfolioState } from '@/lib/serverStore';
import { openPositionForMarket, updateMarketPositionsWithQuotes } from '@/lib/portfolioManager';
import { Signal, StockScanResult } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const startTime = new Date().toISOString();
  const logs: string[] = [];

  try {
    const dualState = getDualPortfolioState();

    // 1. Scan both BIST and US universes
    const scanResults = await scanUniverse('ALL');
    dualState.lastScanTime = startTime;
    dualState.lastCronTime = startTime;

    const quotesMap = new Map<string, number>();
    for (const item of scanResults) {
      quotesMap.set(item.ticker, item.technicals.price);
    }

    // 2. Update existing BIST positions with live quotes
    const { portfolio: updatedBist, events: bistCloseEvents } = updateMarketPositionsWithQuotes(dualState.bist, quotesMap);
    dualState.bist = updatedBist;
    logs.push(...bistCloseEvents);

    // 3. Update existing US positions with live quotes
    const { portfolio: updatedUs, events: usCloseEvents } = updateMarketPositionsWithQuotes(dualState.us, quotesMap);
    dualState.us = updatedUs;
    logs.push(...usCloseEvents);

    // 4. Auto-Trade for BIST if enabled (Limit: 10,000 TL, %2 risk)
    if (dualState.bist.autoTrade) {
      const bistSignals: Signal[] = scanResults
        .filter(r => r.market === 'BIST' && r.signal !== null)
        .map(r => r.signal as Signal)
        .sort((a, b) => b.score - a.score);

      for (const sig of bistSignals) {
        if (sig.score >= 70) {
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

    // 5. Auto-Trade for US if enabled (Limit: $500 USD, %2 risk)
    if (dualState.us.autoTrade) {
      const usSignals: Signal[] = scanResults
        .filter(r => r.market === 'US' && r.signal !== null)
        .map(r => r.signal as Signal)
        .sort((a, b) => b.score - a.score);

      for (const sig of usSignals) {
        if (sig.score >= 70) {
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

    // Keep only last 50 activity logs
    dualState.activityLogs = dualState.activityLogs.slice(0, 50);

    // Save updated dual state
    saveDualPortfolioState(dualState);

    return NextResponse.json({
      success: true,
      job: 'automated-dual-market-cron',
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
