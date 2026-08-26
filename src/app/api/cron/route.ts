import { NextResponse } from 'next/server';
import { scanUniverse, fetchMarketRegime } from '@/lib/marketData';
import { getDualPortfolioState, saveDualPortfolioState, saveTradeToHistory } from '@/lib/supabaseStore';
import { openPositionForMarket, updateMarketPositionsWithQuotes } from '@/lib/portfolioManager';
import { isBISTOpen, isUSOpen, getMarketStatus } from '@/lib/marketHours';
import { Signal } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

export async function GET() {
  const startTime = new Date().toISOString();
  const logs: string[] = [];

  try {
    const dualState = await getDualPortfolioState();
    const marketStatus = getMarketStatus();
    logs.push(marketStatus.message);

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

    // Update existing positions (always, even when market is closed - to sync prices)
    const { portfolio: updatedBist, events: bistCloseEvents, closedTrades: bistClosed } =
      updateMarketPositionsWithQuotes(dualState.bist, quotesMap);
    dualState.bist = updatedBist;
    logs.push(...bistCloseEvents);

    const { portfolio: updatedUs, events: usCloseEvents, closedTrades: usClosed } =
      updateMarketPositionsWithQuotes(dualState.us, quotesMap);
    dualState.us = updatedUs;
    logs.push(...usCloseEvents);

    // Save closed trades to Supabase trade_history table
    for (const trade of [...bistClosed, ...usClosed]) {
      await saveTradeToHistory(trade);
    }

    // Auto-Trade for BIST (Only when BIST market is actually open: 10:00 - 18:00 Istanbul time)
    const bistOpen = isBISTOpen();
    if (dualState.bist.autoTrade && bistOpen) {
      const bistSignals: Signal[] = scanResults
        .filter(r => r.market === 'BIST' && r.signal !== null && r.signal.score >= 70 && r.signal.riskReward >= 1.5)
        .map(r => r.signal as Signal)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // Max 3 best signals per cycle

      for (const sig of bistSignals) {
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
    } else if (!bistOpen) {
      logs.push('[BIST] Piyasa kapali (10:00-18:00 arasi acik) - yeni alim yapilmadi.');
    }

    // Auto-Trade for US (Only when US market is actually open: 09:30 - 16:00 NY time / 16:30 - 23:00 TSI)
    const usOpen = isUSOpen();
    if (dualState.us.autoTrade && usOpen) {
      const usSignals: Signal[] = scanResults
        .filter(r => r.market === 'US' && r.signal !== null && r.signal.score >= 70 && r.signal.riskReward >= 1.5)
        .map(r => r.signal as Signal)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // Max 3 best signals per cycle

      for (const sig of usSignals) {
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
    } else if (!usOpen) {
      logs.push('[US] Piyasa kapali (16:30-23:00 TSI arasi acik) - yeni alim yapilmadi.');
    }

    dualState.activityLogs = dualState.activityLogs.slice(0, 50);
    await saveDualPortfolioState(dualState);

    return NextResponse.json({
      success: true,
      job: 'automated-dual-market-cron-v6',
      timestamp: startTime,
      marketStatus: marketStatus.message,
      scannedCount: scanResults.length,
      bistOpenCount: dualState.bist.positions.length,
      usOpenCount: dualState.us.positions.length,
      eventsLogged: logs.length,
      logs
    });
  } catch (error) {
    console.error('Automated cron failed:', error);
    return NextResponse.json({ success: false, error: 'Sistem güvenli modda: İşlem tamamlanamadı.' }, { status: 500 });
  }
}