import { Candle, CurrencyType, MarketType, SectorType, Signal, StrategyType, TechnicalIndicators } from './types';

export function evaluateSignal(
  ticker: string,
  displayTicker: string,
  sector: SectorType,
  market: MarketType,
  currency: CurrencyType,
  tech: TechnicalIndicators,
  candles: Candle[]
): Signal | null {
  const { price, ema9, ema20, ema50, rsi14, atr14, rvol, high20, changePercent } = tech;
  const currSign = currency === 'TRY' ? '₺' : '$';

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

      return {
        id: `sig_${ticker}_${Date.now()}`,
        ticker,
        displayTicker,
        sector,
        market,
        currency,
        strategy: 'EMA_PULLBACK',
        strategyName: 'EMA 20 Trend Desteği (Pullback)',
        title: `${displayTicker} - 20 Günlük Ortalama Desteğinden Tepki`,
        score: Math.min(96, Math.round(70 + (rvol > 1 ? 12 : 6) + (rsi14 > 45 ? 10 : 5))),
        reason: `Hisse yükselen trendde 20 EMA (${currSign}${ema20}) desteğini test etti ve RSI (${rsi14}) dengeli bölgede. 1-14 gün için yukarı yönlü trend devamı bekleniyor.`,
        suggestedEntry: price,
        stopLoss,
        target1,
        target2,
        riskReward,
        potentialGainPct,
        maxRiskPct,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 2. STRATEGY: High-Volume Breakout (Zirve / Direnç Kırılımı)
  const isBreakout = price >= high20 * 0.985 && rvol >= 0.95 && price >= ema20;
  const isMomentumRSI = rsi14 >= 50 && rsi14 <= 82;

  if (isBreakout && isMomentumRSI) {
    const stopLoss = Number((price - 1.6 * atr14).toFixed(2));
    const risk = price - stopLoss;
    if (risk > 0) {
      const target1 = Number((price + risk * 1.6).toFixed(2));
      const target2 = Number((price + risk * 2.8).toFixed(2));
      const potentialGainPct = Number((((target2 - price) / price) * 100).toFixed(2));
      const maxRiskPct = Number((((price - stopLoss) / price) * 100).toFixed(2));
      const riskReward = Number((potentialGainPct / maxRiskPct).toFixed(2));

      return {
        id: `sig_${ticker}_${Date.now()}`,
        ticker,
        displayTicker,
        sector,
        market,
        currency,
        strategy: 'BREAKOUT',
        strategyName: 'Yüksek Hacimli Kırılım (Breakout)',
        title: `${displayTicker} - 20 Günlük Zirve Kırılımı (RVOL: ${rvol}x)`,
        score: Math.min(98, Math.round(75 + (rvol > 1.2 ? 14 : 8) + (changePercent > 0.5 ? 6 : 2))),
        reason: `Hisse son 20 günün zirvesini (${currSign}${high20}) zorluyor/kırıyor (RVOL ${rvol}x). Momentum güçlü.`,
        suggestedEntry: price,
        stopLoss,
        target1,
        target2,
        riskReward,
        potentialGainPct,
        maxRiskPct,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 3. STRATEGY: Momentum Trend (Güçlü Yükseliş Kanalı)
  const isStrongTrend = price > ema9 && ema9 > ema20 && rsi14 >= 52 && changePercent >= 0.3;
  if (isStrongTrend) {
    const stopLoss = Number((Math.min(ema20, price - 1.3 * atr14)).toFixed(2));
    const risk = price - stopLoss;
    if (risk > 0) {
      const target1 = Number((price + risk * 1.4).toFixed(2));
      const target2 = Number((price + risk * 2.4).toFixed(2));
      const potentialGainPct = Number((((target2 - price) / price) * 100).toFixed(2));
      const maxRiskPct = Number((((price - stopLoss) / price) * 100).toFixed(2));
      const riskReward = Number((potentialGainPct / maxRiskPct).toFixed(2));

      return {
        id: `sig_${ticker}_${Date.now()}`,
        ticker,
        displayTicker,
        sector,
        market,
        currency,
        strategy: 'MOMENTUM_TREND',
        strategyName: 'Güçlü Momentum & Trend Takibi',
        title: `${displayTicker} - 9/20 EMA Hızlı Trend Takibi`,
        score: Math.min(92, Math.round(68 + (changePercent > 1.5 ? 12 : 6) + (rsi14 > 58 ? 8 : 4))),
        reason: `Hisse 9 ve 20 günlük ortalamaların üzerinde güçlü yukarı ivmeye sahip (RSI ${rsi14}).`,
        suggestedEntry: price,
        stopLoss,
        target1,
        target2,
        riskReward,
        potentialGainPct,
        maxRiskPct,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 4. STRATEGY: Oversold Mean Reversion (Dip Tepkisi)
  const isOversold = rsi14 <= 38 && (changePercent >= -0.5 || (candles.length > 2 && price >= candles[candles.length - 2].low * 0.99));

  if (isOversold) {
    const stopLoss = Number((price - 1.3 * atr14).toFixed(2));
    const risk = price - stopLoss;
    if (risk > 0) {
      const target1 = Number((price + risk * 1.5).toFixed(2));
      const target2 = Number((price + risk * 2.2).toFixed(2));
      const potentialGainPct = Number((((target2 - price) / price) * 100).toFixed(2));
      const maxRiskPct = Number((((price - stopLoss) / price) * 100).toFixed(2));
      const riskReward = Number((potentialGainPct / maxRiskPct).toFixed(2));

      return {
        id: `sig_${ticker}_${Date.now()}`,
        ticker,
        displayTicker,
        sector,
        market,
        currency,
        strategy: 'OVERSOLD_BOUNCE',
        strategyName: 'Aşırı Satım Tepki Alımı (Mean Reversion)',
        title: `${displayTicker} - RSI ${rsi14} Aşırı Satım Bölgesinden Tepki`,
        score: Math.min(90, Math.round(65 + (40 - rsi14) * 1.5)),
        reason: `RSI göstergesi ${rsi14} seviyesinde aşırı satım bölgesinde ve dip seviyelerden toparlanma emareleri gösteriyor.`,
        suggestedEntry: price,
        stopLoss,
        target1,
        target2,
        riskReward,
        potentialGainPct,
        maxRiskPct,
        timestamp: new Date().toISOString()
      };
    }
  }

  return null;
}
