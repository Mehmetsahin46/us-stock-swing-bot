import { Candle, CurrencyType, MarketType, SectorType, Signal, SignalGrade, StockNewsItem, StrategyType, TechnicalIndicators } from './types';
import { calculateSignalGrade, calculateExpectedValue } from './quantEngine';
import { validateMarketDataIntegrity } from './dataIntegrityEngine';
import { generateSignalSnapshotAndHash } from './configSecurity';

function calculateEstimatedTimeframe(targetPrice: number, currentPrice: number, atr14: number, rvol: number): { estimatedDays: number; estimatedTimeframe: string } {
  const distance = Math.max(0.1, targetPrice - currentPrice);
  const dailyPace = Math.max(currentPrice * 0.007, atr14 * (rvol > 1.2 ? 0.75 : 0.45));
  const estimatedDays = Math.max(3, Math.min(60, Math.ceil(distance / dailyPace)));

  let estimatedTimeframe = `~${estimatedDays} İş Günü`;
  if (estimatedDays <= 5) {
    estimatedTimeframe = `~3 - 5 Gün (Hızlı İvme)`;
  } else if (estimatedDays <= 12) {
    estimatedTimeframe = `~1 - 2 Hafta`;
  } else if (estimatedDays <= 25) {
    estimatedTimeframe = `~3 - 4 Hafta (Orta Vade)`;
  } else {
    estimatedTimeframe = `~1 - 2 Ay (Güçlü Trend)`;
  }

  return { estimatedDays, estimatedTimeframe };
}

export function evaluateSignal(
  ticker: string,
  displayTicker: string,
  sector: SectorType,
  market: MarketType,
  currency: CurrencyType,
  tech: TechnicalIndicators,
  candles: Candle[],
  catalystInfo?: { catalystScore: number; catalystSummary: string; news: StockNewsItem[] },
  isBacktest: boolean = false
): Signal | null {
  const { price, ema9, ema20, ema50, rsi14, atr14, rvol, high20, changePercent } = tech;
  const currSign = currency === 'TRY' ? '₺' : '$';

  // 🛡️ 31. MARKET DATA INTEGRITY, PUMP & DUMP & CORPOPRATE ACTION FILTER (FAIL-SAFE)
  const catNews = catalystInfo ? catalystInfo.news : undefined;
  const integrity = validateMarketDataIntegrity(ticker, candles, tech, catNews, isBacktest);
  if (!integrity.isValid || integrity.isBlocked) {
    // Şüpheli/manipüle veri -> SİNYAL YOK (FAIL SAFE)
    return null;
  }

  // ⏱️ SEANS AÇILIŞ/KAPANIŞ KORUMASI (SESSION VOLATILITY MUTE - skip in backtests)
  if (!isBacktest) {
    const { isSessionMuteActive } = require('./marketHours');
    const muteCheck = isSessionMuteActive(market);
    if (muteCheck.isMuted) {
      return null; // Açılış/Kapanış seans volatilitesinde sahte kırılımları filtrele
    }
  }

  let catScore = catalystInfo ? catalystInfo.catalystScore : 0;
  let catSummary = catalystInfo ? catalystInfo.catalystSummary : undefined;
  if (integrity.isPumpRisk) {
    catScore = -20;
    catSummary = '⚠️ Şüpheli Hacim (Pump & Dump Riski): Habersiz agresif hacim yükselişi.';
  }

  // 🛡️ AKILLI PARA / HABER TUZAĞI (FOMO & BULL TRAP) KORUMASI
  const isOverboughtTrap = rsi14 >= 72 || (ema20 > 0 && (price - ema20) / ema20 > 0.08);
  if (isOverboughtTrap && catScore > 0) {
    catScore = -15;
    catSummary = '⚠️ Tepe Mal Kilitleme Riski: Hisse aşırı şişkin bölgede, iyi habere rağmen düzeltme bekleniyor.';
  }

  // 🛡️ Düşen Bıçak / Kötü Bilanço Koruması
  if (price < ema50 && catScore < 0) {
    return null;
  }

  let baseSignal: Signal | null = null;

  // 1. STRATEGY: EMA 20 Pullback (Trend Desteği)
  const isUptrend = price >= ema50 * 0.98 || ema20 > ema50 * 0.98;
  const isNearEMA20 = Math.abs(price - ema20) / ema20 <= 0.035 || (candles.length > 2 && candles[candles.length - 2].low <= ema20 * 1.01 && price >= ema20 * 0.99);
  const isHealthyRSI = rsi14 >= 32 && rsi14 <= 68;

  if (isUptrend && isNearEMA20 && isHealthyRSI) {
    const stopLoss = Number((Math.min(ema50, price - 1.4 * atr14)).toFixed(2));
    const risk = price - stopLoss;
    if (risk > 0) {
      const target1 = Number((price + risk * 1.5).toFixed(2));
      const target2 = Number((price + risk * 2.5).toFixed(2));
      const potentialGainPct = Number((((target2 - price) / price) * 100).toFixed(2));
      const maxRiskPct = Number((((price - stopLoss) / price) * 100).toFixed(2));
      const riskReward = Number((potentialGainPct / maxRiskPct).toFixed(2));
      const technicalScore = Math.min(94, Math.round(70 + (rvol > 1 ? 12 : 6) + (rsi14 > 45 ? 10 : 5)));
      const finalScore = Math.min(99, Math.max(30, technicalScore + catScore));
      const grade = calculateSignalGrade(finalScore, catScore, rvol);
      const expectedValuePct = calculateExpectedValue(75, potentialGainPct, maxRiskPct);
      const { estimatedDays, estimatedTimeframe } = calculateEstimatedTimeframe(target2, price, atr14, rvol);

      baseSignal = {
        id: `sig_${ticker}_${Date.now()}`,
        ticker,
        displayTicker,
        sector,
        market,
        currency,
        strategy: 'EMA_PULLBACK',
        strategyName: 'EMA 20 Trend Desteği (Pullback)',
        title: `${displayTicker} - 20 Günlük Ortalama Desteğinden Tepki`,
        score: finalScore,
        grade,
        technicalScore,
        catalystScore: catScore,
        catalystSummary: catSummary,
        activeCatalysts: catNews,
        reason: `Hisse yükselen trendde 20 EMA (${currSign}${ema20}) desteğini test etti ve RSI (${rsi14}) dengeli bölgede.${catSummary ? ` [Katalizör: ${catSummary}]` : ''}`,
        suggestedEntry: price,
        stopLoss,
        target1,
        target2,
        riskReward,
        potentialGainPct,
        maxRiskPct,
        expectedValuePct,
        dataConfidenceScore: integrity.dataConfidenceScore,
        dataConfidenceStatus: integrity.dataConfidenceStatus,
        estimatedDays,
        estimatedTimeframe,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 2. STRATEGY: High-Volume Breakout (Zirve / Direnç Kırılımı)
  else if (price >= high20 * 0.985 && rvol >= 1.05 && price >= ema20 && rsi14 >= 50 && rsi14 <= 74) {
    const stopLoss = Number((price - 1.6 * atr14).toFixed(2));
    const risk = price - stopLoss;
    if (risk > 0) {
      const target1 = Number((price + risk * 1.6).toFixed(2));
      const target2 = Number((price + risk * 2.8).toFixed(2));
      const potentialGainPct = Number((((target2 - price) / price) * 100).toFixed(2));
      const maxRiskPct = Number((((price - stopLoss) / price) * 100).toFixed(2));
      const riskReward = Number((potentialGainPct / maxRiskPct).toFixed(2));
      const technicalScore = Math.min(96, Math.round(75 + (rvol > 1.2 ? 14 : 8) + (changePercent > 0.5 ? 6 : 2)));
      const finalScore = Math.min(99, Math.max(30, technicalScore + catScore));
      const grade = calculateSignalGrade(finalScore, catScore, rvol);
      const expectedValuePct = calculateExpectedValue(72, potentialGainPct, maxRiskPct);
      const { estimatedDays, estimatedTimeframe } = calculateEstimatedTimeframe(target2, price, atr14, rvol);

      baseSignal = {
        id: `sig_${ticker}_${Date.now()}`,
        ticker,
        displayTicker,
        sector,
        market,
        currency,
        strategy: 'BREAKOUT',
        strategyName: 'Yüksek Hacimli Kırılım (Breakout)',
        title: `${displayTicker} - 20 Günlük Zirve Kırılımı (RVOL: ${rvol}x)`,
        score: finalScore,
        grade,
        technicalScore,
        catalystScore: catScore,
        catalystSummary: catSummary,
        activeCatalysts: catNews,
        reason: `Hisse 20 günlük direnci kurumsal hacimle (${rvol}x RVOL) kırıyor.${catSummary ? ` [Katalizör: ${catSummary}]` : ''}`,
        suggestedEntry: price,
        stopLoss,
        target1,
        target2,
        riskReward,
        potentialGainPct,
        maxRiskPct,
        expectedValuePct,
        dataConfidenceScore: integrity.dataConfidenceScore,
        dataConfidenceStatus: integrity.dataConfidenceStatus,
        estimatedDays,
        estimatedTimeframe,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 3. STRATEGY: Momentum Trend
  else if (price > ema9 && ema9 > ema20 && rsi14 >= 52 && rsi14 <= 72 && changePercent >= 0.3) {
    const stopLoss = Number((Math.min(ema20, price - 1.3 * atr14)).toFixed(2));
    const risk = price - stopLoss;
    if (risk > 0) {
      const target1 = Number((price + risk * 1.4).toFixed(2));
      const target2 = Number((price + risk * 2.4).toFixed(2));
      const potentialGainPct = Number((((target2 - price) / price) * 100).toFixed(2));
      const maxRiskPct = Number((((price - stopLoss) / price) * 100).toFixed(2));
      const riskReward = Number((potentialGainPct / maxRiskPct).toFixed(2));
      const technicalScore = Math.min(92, Math.round(68 + (changePercent > 1.5 ? 12 : 6) + (rsi14 > 58 ? 8 : 4)));
      const finalScore = Math.min(99, Math.max(30, technicalScore + catScore));
      const grade = calculateSignalGrade(finalScore, catScore, rvol);
      const expectedValuePct = calculateExpectedValue(70, potentialGainPct, maxRiskPct);
      const { estimatedDays, estimatedTimeframe } = calculateEstimatedTimeframe(target2, price, atr14, rvol);

      baseSignal = {
        id: `sig_${ticker}_${Date.now()}`,
        ticker,
        displayTicker,
        sector,
        market,
        currency,
        strategy: 'MOMENTUM_TREND',
        strategyName: 'Güçlü Momentum & Trend Takibi',
        title: `${displayTicker} - 9/20 EMA Hızlı Trend Takibi`,
        score: finalScore,
        grade,
        technicalScore,
        catalystScore: catScore,
        catalystSummary: catSummary,
        activeCatalysts: catNews,
        reason: `Hisse 9 ve 20 günlük ortalamaların üzerinde dengeli yukarı ivmeye sahip (RSI ${rsi14}).${catSummary ? ` [Katalizör: ${catSummary}]` : ''}`,
        suggestedEntry: price,
        stopLoss,
        target1,
        target2,
        riskReward,
        potentialGainPct,
        maxRiskPct,
        expectedValuePct,
        dataConfidenceScore: integrity.dataConfidenceScore,
        dataConfidenceStatus: integrity.dataConfidenceStatus,
        estimatedDays,
        estimatedTimeframe,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 4. STRATEGY: Oversold Bounce
  else if (rsi14 <= 38 && (changePercent >= -0.5 || (candles.length > 2 && price >= candles[candles.length - 2].low * 0.99))) {
    const stopLoss = Number((price - 1.3 * atr14).toFixed(2));
    const risk = price - stopLoss;
    if (risk > 0) {
      const target1 = Number((price + risk * 1.5).toFixed(2));
      const target2 = Number((price + risk * 2.2).toFixed(2));
      const potentialGainPct = Number((((target2 - price) / price) * 100).toFixed(2));
      const maxRiskPct = Number((((price - stopLoss) / price) * 100).toFixed(2));
      const riskReward = Number((potentialGainPct / maxRiskPct).toFixed(2));
      const technicalScore = Math.min(90, Math.round(65 + (40 - rsi14) * 1.5));
      const finalScore = Math.min(99, Math.max(30, technicalScore + catScore));
      const grade = calculateSignalGrade(finalScore, catScore, rvol);
      const expectedValuePct = calculateExpectedValue(68, potentialGainPct, maxRiskPct);
      const { estimatedDays, estimatedTimeframe } = calculateEstimatedTimeframe(target2, price, atr14, rvol);

      baseSignal = {
        id: `sig_${ticker}_${Date.now()}`,
        ticker,
        displayTicker,
        sector,
        market,
        currency,
        strategy: 'OVERSOLD_BOUNCE',
        strategyName: 'Aşırı Satım Tepki Alımı (Mean Reversion)',
        title: `${displayTicker} - RSI ${rsi14} Aşırı Satım Bölgesinden Tepki`,
        score: finalScore,
        grade,
        technicalScore,
        catalystScore: catScore,
        catalystSummary: catSummary,
        activeCatalysts: catNews,
        reason: `RSI (${rsi14}) aşırı satım bölgesinde ve dip seviyelerden toparlanma emareleri gösteriyor.${catSummary ? ` [Katalizör: ${catSummary}]` : ''}`,
        suggestedEntry: price,
        stopLoss,
        target1,
        target2,
        riskReward,
        potentialGainPct,
        maxRiskPct,
        expectedValuePct,
        dataConfidenceScore: integrity.dataConfidenceScore,
        dataConfidenceStatus: integrity.dataConfidenceStatus,
        estimatedDays,
        estimatedTimeframe,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 🧱 33. IMMUTABLE SNAPSHOT & SHA-256 INTEGRITY HASH
  if (baseSignal) {
    const { integrityHash } = generateSignalSnapshotAndHash(baseSignal, tech, catNews, integrity.dataConfidenceScore);
    baseSignal.integrityHash = integrityHash;
  }

  return baseSignal;
}