import { Candle, CurrencyType, MarketType, Signal, StrategyType, TechnicalIndicators } from './types';

export function evaluateSignal(
  ticker: string,
  displayTicker: string,
  market: MarketType,
  currency: CurrencyType,
  tech: TechnicalIndicators,
  candles: Candle[]
): Signal | null {
  const { price, ema20, ema50, rsi14, atr14, rvol, high20, changePercent } = tech;
  const currSign = currency === 'TRY' ? '₺' : '$';

  // 1. STRATEGY: EMA 20 Pullback
  const isUptrend = price > ema50 && ema20 > ema50;
  const isNearEMA20 = Math.abs(price - ema20) / ema20 <= 0.025 || (candles.length > 2 && candles[candles.length - 2].low <= ema20 && price >= ema20);
  const isHealthyRSI = rsi14 >= 35 && rsi14 <= 62;

  if (isUptrend && isNearEMA20 && isHealthyRSI) {
    const stopLoss = Number((Math.min(ema50, price - 1.5 * atr14)).toFixed(2));
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
        market,
        currency,
        strategy: 'EMA_PULLBACK',
        strategyName: 'EMA 20 Trend Desteği (Pullback)',
        title: `${displayTicker} - 20 Günlük Ortalama Desteğinden Tepki`,
        score: Math.min(95, Math.round(75 + (rvol > 1 ? 10 : 0) + (rsi14 > 45 ? 10 : 5))),
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

  // 2. STRATEGY: High-Volume Breakout
  const isBreakout = price >= high20 * 0.992 && rvol >= 1.2 && price > ema20;
  const isMomentumRSI = rsi14 >= 55 && rsi14 <= 78;

  if (isBreakout && isMomentumRSI) {
    const stopLoss = Number((price - 1.8 * atr14).toFixed(2));
    const risk = price - stopLoss;
    if (risk > 0) {
      const target1 = Number((price + risk * 1.8).toFixed(2));
      const target2 = Number((price + risk * 3.0).toFixed(2));
      const potentialGainPct = Number((((target2 - price) / price) * 100).toFixed(2));
      const maxRiskPct = Number((((price - stopLoss) / price) * 100).toFixed(2));
      const riskReward = Number((potentialGainPct / maxRiskPct).toFixed(2));

      return {
        id: `sig_${ticker}_${Date.now()}`,
        ticker,
        displayTicker,
        market,
        currency,
        strategy: 'BREAKOUT',
        strategyName: 'Yüksek Hacimli Kırılım (Breakout)',
        title: `${displayTicker} - 20 Günlük Zirve Kırılımı (RVOL: ${rvol}x)`,
        score: Math.min(98, Math.round(80 + (rvol > 1.5 ? 12 : 6) + (changePercent > 1 ? 6 : 2))),
        reason: `Hisse son 20 günün zirvesini (${currSign}${high20}) hacimli şekilde (RVOL ${rvol}x) zorluyor/kırıyor. Momentum güçlü.`,
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

  // 3. STRATEGY: Oversold Mean Reversion
  const isOversold = rsi14 <= 32 && (changePercent >= 0.2 || (candles.length > 2 && price > candles[candles.length - 2].low));

  if (isOversold) {
    const stopLoss = Number((price - 1.4 * atr14).toFixed(2));
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
        market,
        currency,
        strategy: 'OVERSOLD_BOUNCE',
        strategyName: 'Aşırı Satım Tepki Alımı (Mean Reversion)',
        title: `${displayTicker} - RSI ${rsi14} Aşırı Satım Bölgesinden Tepki`,
        score: Math.min(90, Math.round(70 + (35 - rsi14) * 1.5)),
        reason: `RSI göstergesi ${rsi14} ile aşırı satım bölgesinde ve dip seviyelerden toparlanma emareleri gösteriyor.`,
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
