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
    dualState.lastScanTime = startTime;
    dualState.lastCronTime = startTime;
    logs.push(marketStatus.message);

    // 🔄 Dinamik kuant evreni
    const { getDynamicQuantUniverse } = await import('@/lib/universeManager');
    await getDynamicQuantUniverse(false);

    // 🚀 Paralel tarama: Kripto 7/24 taranır, hisseler sadece piyasaları açıkken taranır
    const scanPromises: Promise<StockScanResult[]>[] = [scanUniverse('CRYPTO')];
    if (bistOpen) scanPromises.push(scanUniverse('BIST'));
    if (usOpen) scanPromises.push(scanUniverse('US'));

    const allScans = await Promise.all(scanPromises);
    const scanResults = allScans.flat();

    const quotesMap = new Map<string, number>();
    for (const item of scanResults) {
      quotesMap.set(item.ticker, item.technicals.price);
    }

    if (!dualState.crypto) {
      const { INITIAL_CRYPTO_PORTFOLIO } = await import('@/lib/constants');
      dualState.crypto = JSON.parse(JSON.stringify(INITIAL_CRYPTO_PORTFOLIO));
    }

    const { sendRemotePhoneNotification } = await import('@/lib/remotePushService');
    const { recordNewSignals, resolveSignalsWithQuotes } = await import('@/lib/signalTracker');

    // 🎯 Sinyal Takip & Sonuçlandırma Motoru
    const validSignals = scanResults.map(r => r.signal).filter((s): s is Signal => s !== null);
    await recordNewSignals(validSignals);
    const { events: signalEvents } = await resolveSignalsWithQuotes(quotesMap);
    logs.push(...signalEvents);

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
      logs.push(event);
      await sendRemotePhoneNotification('🎯 SwingBot İşlem Kapanışı', event, 'high', ['bell', 'chart']);
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
          logs.push(`[BIST AUTO] ${message}`);
          await sendRemotePhoneNotification(`🇹🇷 BIST Alım: ${sig.displayTicker}`, `${message} | TP1: ${sig.target1}`, 'high', ['chart_with_upwards_trend']);
          dualState.activityLogs.unshift({
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toLocaleTimeString('tr-TR'),
            market: 'BIST',
            message: `[BIST OTO-ALIM] ${sig.displayTicker} ${sig.strategy} sinyaliyle ${sig.suggestedEntry} fiyattan alındı.`,
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
          logs.push(`[US AUTO] ${message}`);
          await sendRemotePhoneNotification(`🇺🇸 ABD Alım: ${sig.displayTicker}`, `${message} | TP1: ${sig.target1}`, 'high', ['chart_with_upwards_trend']);
          dualState.activityLogs.unshift({
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toLocaleTimeString('tr-TR'),
            market: 'US',
            message: `[ABD OTO-ALIM] ${sig.displayTicker} ${sig.strategy} sinyaliyle ${sig.suggestedEntry} fiyattan alındı.`,
            type: 'BUY'
          });
        }
      }
    }

    // 4. Kripto Otomatik Alım (7/24)
    if (dualState.crypto && dualState.crypto.autoTrade) {
      const cryptoSignals: Signal[] = scanResults
        .filter(r => r.market === 'CRYPTO' && r.signal !== null && r.signal.score >= 70 && r.signal.riskReward >= 1.5)
        .map(r => r.signal as Signal)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      for (const sig of cryptoSignals) {
        const { portfolio: afterTrade, success, message } = openPositionForMarket(sig, dualState.crypto);
        if (success) {
          dualState.crypto = afterTrade;
          logs.push(`[CRYPTO AUTO] ${message}`);
          await sendRemotePhoneNotification(`🪙 Kripto Alım: ${sig.displayTicker}`, `${message} | TP1: ${sig.target1}`, 'high', ['zap']);
          dualState.activityLogs.unshift({
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toLocaleTimeString('tr-TR'),
            market: 'CRYPTO',
            message: `[KRİPTO OTO-ALIM] ${sig.displayTicker} ${sig.strategy} sinyaliyle ${sig.suggestedEntry} fiyattan alındı.`,
            type: 'BUY'
          });
        }
      }
    }

    // 5. Piyasa rejimleri
    try {
      const [bistRegime, usRegime] = await Promise.all([
        fetchMarketRegime('BIST'),
        fetchMarketRegime('US')
      ]);
      dualState.bistRegime = bistRegime;
      dualState.usRegime = usRegime;
    } catch (e) {}

    // Güncel portföyü kaydet
    await saveDualPortfolioState(dualState);

    return NextResponse.json({
      success: true,
      timestamp: startTime,
      bistPositions: dualState.bist.positions.length,
      usPositions: dualState.us.positions.length,
      cryptoPositions: dualState.crypto?.positions.length || 0,
      logs
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}
