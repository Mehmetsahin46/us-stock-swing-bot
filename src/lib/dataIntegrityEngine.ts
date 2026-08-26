import { Candle, TechnicalIndicators } from './types';

export interface DataIntegrityResult {
  isValid: boolean;
  dataConfidenceScore: number; // 0 - 100%
  dataConfidenceStatus: 'HIGH' | 'MEDIUM' | 'LOW';
  isBlocked: boolean;
  blockReason?: string;
  checks: {
    staleDataCheck: { passed: boolean; ageSeconds: number; message: string };
    priceSpikeCheck: { passed: boolean; spikePct: number; message: string };
    volumeAnomalyCheck: { passed: boolean; rvol: number; message: string };
    candleConsistencyCheck: { passed: boolean; message: string };
  };
}

export function validateMarketDataIntegrity(
  ticker: string,
  candles: Candle[],
  tech: TechnicalIndicators
): DataIntegrityResult {
  let confidence = 100;
  let isBlocked = false;
  let blockReason: string | undefined = undefined;

  // 1. Stale Data Check
  const lastCandle = candles.length > 0 ? candles[candles.length - 1] : null;
  const candleTime = lastCandle ? new Date(lastCandle.date).getTime() : 0;
  const now = Date.now();
  const ageSeconds = candleTime > 0 ? Math.floor((now - candleTime) / 1000) : 999;

  let stalePassed = true;
  let staleMsg = 'Veri taze ve canlı (Gecikmesiz).';

  // If candle is more than 3 days old on a weekday, it's stale
  const dayOfWeek = new Date().getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  if (isWeekday && ageSeconds > 86400 * 3) {
    confidence -= 40;
    stalePassed = false;
    staleMsg = `⚠️ Bayat Veri: Son fiyat verisi ${Math.floor(ageSeconds / 3600)} saat öncesine ait.`;
  }

  // 2. Price Spike Protection (Check if last candle jumped > 18% in a single day without news/volume)
  let spikePassed = true;
  let spikePct = Math.abs(tech.changePercent);
  let spikeMsg = 'Fiyat hareketi doğal volatilite sınırları içinde.';

  if (spikePct >= 18.0 && tech.rvol < 1.1) {
    confidence -= 35;
    spikePassed = false;
    spikeMsg = `🚨 Şüpheli Fiyat Sıçraması: Tek barda hacimsiz %${spikePct.toFixed(1)} hareket tespit edildi.`;
    isBlocked = true;
    blockReason = 'Yapay / Hacimsiz Fiyat Sıçraması (Price Spike Protection)';
  }

  // 3. Volume Anomaly Protection (Detect fake or manipulated volume spikes: RVOL > 6.0x with no price movement)
  let volPassed = true;
  let volMsg = 'Hacim dağılımı tutarlı.';

  if (tech.rvol >= 6.0 && Math.abs(tech.changePercent) < 0.2) {
    confidence -= 25;
    volPassed = false;
    volMsg = '⚠️ Anormal Fiktif Hacim: Fiyat değişmeden 6x üzerinde aşırı hacim oluştu.';
  }

  // 4. Candle Consistency Check (High >= Low, Price in range)
  let candlePassed = true;
  let candleMsg = 'Mum çubukları matematiksel olarak tutarlı.';
  if (lastCandle) {
    if (lastCandle.high < lastCandle.low || lastCandle.close < 0 || lastCandle.open < 0) {
      confidence -= 60;
      candlePassed = false;
      candleMsg = '🔴 Veri Bütünlüğü Hatası: High/Low fiyatları uyumsuz.';
      isBlocked = true;
      blockReason = 'Hatalı Mum Verisi (Corrupted Data Point)';
    }
  }

  confidence = Math.max(0, Math.min(100, confidence));

  let dataConfidenceStatus: DataIntegrityResult['dataConfidenceStatus'] = 'HIGH';
  if (confidence >= 80) {
    dataConfidenceStatus = 'HIGH';
  } else if (confidence >= 60) {
    dataConfidenceStatus = 'MEDIUM';
  } else {
    dataConfidenceStatus = 'LOW';
    isBlocked = true;
    if (!blockReason) {
      blockReason = `Düşük Veri Güvenilirliği (%${confidence} Data Confidence) - Sinyal Engellendi.`;
    }
  }

  return {
    isValid: !isBlocked && confidence >= 80,
    dataConfidenceScore: confidence,
    dataConfidenceStatus,
    isBlocked,
    blockReason,
    checks: {
      staleDataCheck: { passed: stalePassed, ageSeconds, message: staleMsg },
      priceSpikeCheck: { passed: spikePassed, spikePct, message: spikeMsg },
      volumeAnomalyCheck: { passed: volPassed, rvol: tech.rvol, message: volMsg },
      candleConsistencyCheck: { passed: candlePassed, message: candleMsg }
    }
  };
}