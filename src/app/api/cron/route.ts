import { NextResponse } from 'next/server';
import { scanUniverse, fetchMarketRegime } from '@/lib/marketData';
import { getDualPortfolioState, saveDualPortfolioState, saveTradeToHistory } from '@/lib/supabaseStore';
import { openPositionForMarket, updateMarketPositionsWithQuotes } from '@/lib/portfolioManager';
import { isBISTOpen, isUSOpen, getMarketStatus } from '@/lib/marketHours';
import { Signal, StockScanResult } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

export async function GET() {
  const startTime = new Date().toISOString();
  const logs: string[] = [];

  try {
    const bistOpen = isBISTOpen();
    const usOpen = isUSOpen();
    const marketStatus = getMarketStatus();

    const dualState = await getDualPortfolioState();
    logs.push(marketStatus.message);

    // 🔄 DİNAMİK KUANT EVRENİ REVİZYONU
    const { getDynamicQuantUniverse } = await import('@/lib/universeManager');
    await getDynamicQuantUniverse(false);

    // 🚀 PARALEL TARAMA: Kripto 7/24 taranır, hisseler sadece piyasaları açıkken taranır!
    const scanPromises: Promise<StockScanResult[]>[] = [scanUniverse('CRYPTO')];
    if (bistOpen) scanPromises.push(scanUniverse('BIST'));
    if (usOpen) scanPromises.push(scanUniverse('US'));

    const allScans = await Promise.all(scanPromises);
    const scanResults = allScans.flat();

    const quotesMap = new Map<string, number>();
    for (const item of scanResults) {
      quotesMap.set(item.ticker, item.technicals.price);
    }

    const { getAllUserIds } = await import('@/lib/auth');
    const userIds = getAllUserIds();

    const { sendRemotePhoneNotification } = await import('@/lib/remotePushService');
    const { recordNewSignals, resolveSignalsWithQuotes } = await import('@/lib/signalTracker');

    // 🎯 Sinyal Takip & Sonuçlandırma Motoru (Tek seferlik genel sinyal kaydı)
    const validSignals = scanResults.map(r => r.signal).filter((s): s is Signal => s !== null);
    await recordNewSignals(validSignals);
    const { events: signalEvents } = await resolveSignalsWithQuotes(quotesMap);
    logs.push(...signalEvents);

    // Her kullanıcı için izole portföy güncellemesi ve işlem yürütme
    for (const userId of userIds) {
      const dualState = await getDualPortfolioState(userId);
      dualState.lastScanTime = startTime;
      dualState.lastCronTime = startTime;

      if (!dualState.crypto) {
        const { INITIAL_CRYPTO_PORTFOLIO } = await import('@/lib/constants');
        dualState.crypto = JSON.parse(JSON.stringify(INITIAL_CRYPTO_PORTFOLIO));
      }

      // 1. Mevcut pozisyonları güncelle
      const { portfolio: updatedBist, events: bistCloseEvents, closedTrades: bistClosed } =
        updateMarketPositionsWithQuotes(dualState.bist, quotesMap);
      dualState.bist = updatedBist;

      const { portfolio: updatedUs, events: usCloseEvents, closedTrades: usClosed } =
        updateMarketPositionsWithQuotes(dualState.us, quotesMap);
      dualState.us = updatedUs;

      const { portfolio: updatedCrypto, events: cryptoCloseEvents, closedTrades: cryptoClosed } =
        updateMarketPositionsWithQuotes(dualState.crypto!, quotesMap);
      dualState.crypto = updatedCrypto;

      for (const trade of [...bistClosed, ...usClosed, ...cryptoClosed]) {
        await saveTradeToHistory(trade);
      }

      for (const event of [...bistCloseEvents, ...usCloseEvents, ...cryptoCloseEvents]) {
        logs.push(`[${userId}] ${event}`);
        await sendRemotePhoneNotification(`🎯 SwingBot [${userId}]`, event, 'high', ['bell', 'chart']);
      }

      // 2. BIST Otomatik Alım
      if (dualState.bist.autoTrade && bistOpen) {
        const bistSignals: Signal[] = scanResults
          .filter(r => r.market === 'BIST' && r.signal !== null && r.signal.score >= 70 && r.signal.riskReward >= 1.5)
          .map(r => r.signal as Signal)
          .sort((a, b) => b.score - a.score)
          .slice(0, 2);

        for (const sig of bistSignals) {
          const { portfolio: afterTrade, success, message } = openPositionForMarket(sig, dualState.bist);
          if (success) {
            dualState.bist = afterTrade;
            logs.push(`[${userId} - BIST AUTO] ${message}`);
            await sendRemotePhoneNotification(`🇹🇷 BIST Alım [${userId}]: ${sig.displayTicker}`, `${message} | TP1: ${sig.target1}`, 'high', ['chart_with_upwards_trend']);
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

      // 3. ABD Otomatik Alım
      if (dualState.us.autoTrade && usOpen) {
        const usSignals: Signal[] = scanResults
          .filter(r => r.market === 'US' && r.signal !== null && r.signal.score >= 70 && r.signal.riskReward >= 1.5)
          .map(r => r.signal as Signal)
          .sort((a, b) => b.score - a.score)
          .slice(0, 2);

        for (const sig of usSignals) {
          const { portfolio: afterTrade, success, message } = openPositionForMarket(sig, dualState.us);
          if (success) {
            dualState.us = afterTrade;
            logs.push(`[${userId} - US AUTO] ${message}`);
            await sendRemotePhoneNotification(`🇺🇸 ABD Alım [${userId}]: ${sig.displayTicker}`, `${message} | TP1: ${sig.target1}`, 'high', ['chart_with_upwards_trend']);
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

      // 4. Kripto Otomatik Alım (7/24 Kesintisiz)
      if (dualState.crypto.autoTrade) {
        const cryptoSignals: Signal[] = scanResults
          .filter(r => r.market === 'CRYPTO' && r.signal !== null && r.signal.score >= 70 && r.signal.riskReward >= 1.4)
          .map(r => r.signal as Signal)
          .sort((a, b) => b.score - a.score)
          .slice(0, 2);

        for (const sig of cryptoSignals) {
          const { portfolio: afterTrade, success, message } = openPositionForMarket(sig, dualState.crypto);
          if (success) {
            dualState.crypto = afterTrade;
            logs.push(`[${userId} - CRYPTO AUTO] ${message}`);
            await sendRemotePhoneNotification(`🪙 Kripto Alım [${userId}]: ${sig.displayTicker}`, `${message} | TP1: ${sig.target1}`, 'high', ['rocket', 'fire']);
            dualState.activityLogs.unshift({
              id: `log_${Date.now()}_${sig.ticker}`,
              timestamp: startTime,
              market: 'CRYPTO',
              message,
              type: 'BUY'
            });
          }
        }
      }

      dualState.activityLogs = dualState.activityLogs.slice(0, 50);
      await saveDualPortfolioState(dualState, userId);
    }

    return NextResponse.json({
      success: true,
      job: 'multi-user-cron-v8',
      processedUsers: userIds,
      timestamp: startTime,
      marketStatus: marketStatus.message,
      scannedCount: scanResults.length,
      eventsLogged: logs.length,
      logs
    });
  } catch (error) {
    console.error('Automated cron failed:', error);
    return NextResponse.json({ success: false, error: 'Sistem güvenli modda: İşlem tamamlanamadı.' }, { status: 500 });
  }
}