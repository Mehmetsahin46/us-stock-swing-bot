import { Candle, TechnicalIndicators, StockNewsItem } from './types';

export interface DataIntegrityResult {
  isValid: boolean;
  dataConfidenceScore: number; // 0 - 100%
  dataConfidenceStatus: 'HIGH' | 'MEDIUM' | 'LOW';
  isBlocked: boolean;
  isPumpRisk?: boolean;
  isCorporateAction?: boolean;
  blockReason?: string;
  checks: {
    staleDataCheck: { passed: boolean; ageSeconds: number; message: string };
    priceSpikeCheck: { passed: boolean; spikePct: number; message: string };
    volumeAnomalyCheck: { passed: boolean; rvol: number; message: string };
    pumpAndDumpCheck: { passed: boolean; isPump: boolean; message: string };
    corporateActionCheck: { passed: boolean; isAction: boolean; message: string };
    candleConsistencyCheck: { passed: boolean; message: string };
  };
}

export function validateMarketDataIntegrity(
  ticker: string,
  candles: Candle[],
  tech: TechnicalIndicators,
  news?: StockNewsItem[],
  isBacktest: boolean = false
): DataIntegrityResult {
  // 🔬 DİNAMİK VERİ GÜVEN PUANI (Mum derinliği ve anlık volatilite varyansına göre dinamik taban)
  const candleDepthBonus = candles.length >= 60 ? 0 : candles.length >= 40 ? -3 : -6;
  const spreadNoisePenalty = Math.abs(tech.changePercent) > 6.5 ? -2 : 0;
  let confidence = Math.min(99, 98 + candleDepthBonus + spreadNoisePenalty);
  let isBlocked = false;
  let isPumpRisk = false;
  let isCorporateAction = false;
  let blockReason: string | undefined = undefined;

  // 0. VERİ ŞEMA DOĞRULAMA (SCHEMA VALIDATION)
  if (!tech || isNaN(tech.price) || isNaN(tech.rsi14) || tech.price <= 0 || !Array.isArray(candles) || candles.length === 0) {
    return {
      isValid: false,
      dataConfidenceScore: 0,
      dataConfidenceStatus: 'LOW',
      isBlocked: true,
      blockReason: 'Bozuk / Null Veri Şeması (Schema Corrupted)',
      checks: {
        staleDataCheck: { passed: false, ageSeconds: 999, message: 'Veri yok' },
        priceSpikeCheck: { passed: false, spikePct: 0, message: 'Geçersiz fiyat' },
        volumeAnomalyCheck: { passed: false, rvol: 0, message: 'Geçersiz hacim' },
        pumpAndDumpCheck: { passed: true, isPump: false, message: 'N/A' },
        corporateActionCheck: { passed: true, isAction: false, message: 'N/A' },
        candleConsistencyCheck: { passed: false, message: 'Şema doğrulanamadı' }
      }
    };
  }

  // 1. Stale Data Check (Skip in backtests)
  const lastCandle = candles[candles.length - 1];
  const candleTime = lastCandle ? new Date(lastCandle.date).getTime() : 0;
  const now = Date.now();
  const ageSeconds = candleTime > 0 ? Math.floor((now - candleTime) / 1000) : 999;

  let stalePassed = true;
  let staleMsg = 'Veri taze ve canlı (Gecikmesiz).';
  const dayOfWeek = new Date().getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  if (!isBacktest && isWeekday && ageSeconds > 86400 * 3) {
    confidence -= 40;
    stalePassed = false;
    staleMsg = `⚠️ Bayat Veri: Son fiyat verisi ${Math.floor(ageSeconds / 3600)} saat öncesine ait.`;
  }

  // 2. 🛡️ BÖLÜNME / TEMETTÜ KALKANI (CORPORATE ACTION SHIELD)
  // Hisse tek günde %25-%70 arası değer kaybettiyse bu bir çöküş değil, bedelsiz sermaye artırımı veya split'tir!
  let corpPassed = true;
  let corpMsg = 'Kurumsal bölünme anomalisi yok.';
  if (tech.changePercent <= -25.0) {
    confidence -= 50;
    corpPassed = false;
    isCorporateAction = true;
    isBlocked = true;
    corpMsg = `🛡️ Bölünme/Temettü Kalkanı: Tek günde %${Math.abs(tech.changePercent).toFixed(1)} düşüş tespit edildi. Sahte sinyali önlemek için alım engellendi.`;
    blockReason = 'Bedelsiz Bölünme / Temettü Anomalisi (Corporate Action Shield)';
  }

  // 3. 🚨 PUMP & DUMP FİLTRESİ
  // RVOL > 2.2x ve sert yükseliş var AMA hiçbir KAP/bilanço/resmi haber yoksa!
  let pumpPassed = true;
  let pumpMsg = 'Hacim ve haber dengesi normal.';
  const hasOfficialNews = news && news.length > 0 && news.some(n => n.impactScore >= 8);
  if (tech.rvol >= 2.2 && tech.changePercent >= 4.0 && !hasOfficialNews) {
    confidence -= 25;
    pumpPassed = false;
    isPumpRisk = true;
    pumpMsg = '⚠️ Pump & Dump Uyarısı: Resmi haber ve KAP açıklaması olmaksızın şüpheli agresif hacim girişi.';
  }

  // 4. Price Spike Protection (Hacimsiz %18+ sıçrama)
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

  // 5. Volume Anomaly Protection (RVOL > 6.0x fiyatsız)
  let volPassed = true;
  let volMsg = 'Hacim dağılımı tutarlı.';
  if (tech.rvol >= 6.0 && Math.abs(tech.changePercent) < 0.2) {
    confidence -= 25;
    volPassed = false;
    volMsg = '⚠️ Anormal Fiktif Hacim: Fiyat değişmeden 6x üzerinde aşırı hacim oluştu.';
  }

  // 6. Candle Consistency Check
  let candlePassed = true;
  let candleMsg = 'Mum çubukları matematiksel olarak tutarlı.';
  if (lastCandle.high < lastCandle.low || lastCandle.close < 0 || lastCandle.open < 0) {
    confidence -= 60;
    candlePassed = false;
    candleMsg = '🔴 Veri Bütünlüğü Hatası: High/Low fiyatları uyumsuz.';
    isBlocked = true;
    blockReason = 'Hatalı Mum Verisi (Corrupted Data Point)';
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
    isPumpRisk,
    isCorporateAction,
    blockReason,
    checks: {
      staleDataCheck: { passed: stalePassed, ageSeconds, message: staleMsg },
      priceSpikeCheck: { passed: spikePassed, spikePct, message: spikeMsg },
      volumeAnomalyCheck: { passed: volPassed, rvol: tech.rvol, message: volMsg },
      pumpAndDumpCheck: { passed: pumpPassed, isPump: isPumpRisk, message: pumpMsg },
      corporateActionCheck: { passed: corpPassed, isAction: isCorporateAction, message: corpMsg },
      candleConsistencyCheck: { passed: candlePassed, message: candleMsg }
    }
  };
}