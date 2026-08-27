import { Candle, TechnicalIndicators, UniverseFilterConfig, DynamicUniverseStatus, UniverseRevisionLog, MarketType } from './types';
import { BIST_UNIVERSE, US_UNIVERSE, UniverseItem, fetchStockCandles, calculateTechnicals } from './marketData';

export const DEFAULT_UNIVERSE_CONFIG: UniverseFilterConfig = {
  bistMinDailyTurnoverTRY: 40_000_000, // 40 Milyon TL ortalama günlük hacim (Rolling ADV20 * Fiyat)
  usMinADVLot: 1_500_000, // 1.5 Milyon lot ortalama günlük hacim (Rolling ADV20)
  usMinPriceUSD: 5.00, // 5 USD altı penny stock'lar elenir
  minTradingDaysIPO: 60, // IPO sonrası en az 60 işlem görmüş mum (Bar Count Doğrulaması)
  maxSectorWeightPct: 25, // Tek bir sektör evrenin max %25'ini geçemez (GICS & KAP standardı)
  gracefulExitActivePositions: true // Kriterden düşen hissede açık pozisyon korunur, sadece yeni alım engellenir
};

interface DynamicCache {
  status: DynamicUniverseStatus;
  filteredBistUniverse: UniverseItem[];
  filteredUsUniverse: UniverseItem[];
  timestamp: number;
}

let universeCache: DynamicCache | null = null;
const CACHE_TTL_HOURS = 24;
const revisionLogs: UniverseRevisionLog[] = [];

/**
 * 🔬 DİNAMİK KUANT EVRENİ DERLEYİCİSİ (ADV20 Rolling + IPO Bar Count + %25 Sector Cap)
 */
export async function getDynamicQuantUniverse(forceRebalance: boolean = false): Promise<{
  bistUniverse: UniverseItem[];
  usUniverse: UniverseItem[];
  combinedUniverse: UniverseItem[];
  status: DynamicUniverseStatus;
}> {
  const now = Date.now();
  if (!forceRebalance && universeCache && (now - universeCache.timestamp < CACHE_TTL_HOURS * 3600 * 1000)) {
    return {
      bistUniverse: universeCache.filteredBistUniverse,
      usUniverse: universeCache.filteredUsUniverse,
      combinedUniverse: [...universeCache.filteredBistUniverse, ...universeCache.filteredUsUniverse],
      status: universeCache.status
    };
  }

  let rejectedByADV = 0;
  let rejectedByPrice = 0;
  let rejectedByIPOAge = 0;
  let rejectedBySectorCap = 0;

  const validBist: UniverseItem[] = [];
  const validUs: UniverseItem[] = [];

  // Sektör sayaçları (Max %25 Cap Koruması)
  const bistSectorCounts: Record<string, number> = {};
  const usSectorCounts: Record<string, number> = {};

  const maxBistPerSector = Math.ceil(BIST_UNIVERSE.length * (DEFAULT_UNIVERSE_CONFIG.maxSectorWeightPct / 100)); // ~35 hisse
  const maxUsPerSector = Math.ceil(US_UNIVERSE.length * (DEFAULT_UNIVERSE_CONFIG.maxSectorWeightPct / 100)); // ~90 hisse

  // 1. 🇹🇷 BIST Filtreleme
  for (const item of BIST_UNIVERSE) {
    const candles = await fetchStockCandles(item.ticker, '6mo');
    
    // 🛡️ IPO Kuralı: Gerçek işlem görmüş geçerli bar sayısı >= 60 olmalı
    if (candles.length < DEFAULT_UNIVERSE_CONFIG.minTradingDaysIPO) {
      rejectedByIPOAge++;
      continue;
    }

    const tech = calculateTechnicals(candles);
    if (!tech) {
      rejectedByADV++;
      continue;
    }

    // 🛡️ Rolling 20-Günlük Ortalama İşlem Hacmi (ADV20 * Fiyat >= 40M TL)
    const dailyTurnoverTRY = tech.avgVolume20 * tech.price;
    if (dailyTurnoverTRY < DEFAULT_UNIVERSE_CONFIG.bistMinDailyTurnoverTRY) {
      rejectedByADV++;
      continue;
    }

    // 🛡️ Sektör Tavanı (%25 Cap)
    const currentSectorCount = bistSectorCounts[item.sector] || 0;
    if (currentSectorCount >= maxBistPerSector) {
      rejectedBySectorCap++;
      continue;
    }

    bistSectorCounts[item.sector] = currentSectorCount + 1;
    validBist.push(item);
  }

  // 2. 🇺🇸 ABD Filtreleme
  for (const item of US_UNIVERSE) {
    const candles = await fetchStockCandles(item.ticker, '6mo');

    // 🛡️ IPO Kuralı: Gerçek işlem görmüş geçerli bar sayısı >= 60 olmalı
    if (candles.length < DEFAULT_UNIVERSE_CONFIG.minTradingDaysIPO) {
      rejectedByIPOAge++;
      continue;
    }

    const tech = calculateTechnicals(candles);
    if (!tech) {
      rejectedByADV++;
      continue;
    }

    // 🛡️ Fiyat Tabanı: $5.00 altı Penny Stock'lar elenir
    if (tech.price < DEFAULT_UNIVERSE_CONFIG.usMinPriceUSD) {
      rejectedByPrice++;
      continue;
    }

    // 🛡️ Rolling 20-Günlük Ortalama Lot Hacmi (ADV20 >= 1.5M Lot)
    if (tech.avgVolume20 < DEFAULT_UNIVERSE_CONFIG.usMinADVLot) {
      rejectedByADV++;
      continue;
    }

    // 🛡️ Sektör Tavanı (%25 Cap)
    const currentSectorCount = usSectorCounts[item.sector] || 0;
    if (currentSectorCount >= maxUsPerSector) {
      rejectedBySectorCap++;
      continue;
    }

    usSectorCounts[item.sector] = currentSectorCount + 1;
    validUs.push(item);
  }

  // 📜 Revizyon Günlüğü Oluştur
  const newLog: UniverseRevisionLog = {
    id: `rev_${Date.now()}`,
    revisionDate: new Date().toISOString(),
    market: 'ALL',
    addedTickers: [],
    removedTickers: [],
    reason: 'Çeyreklik/Periyodik Rolling ADV20, IPO Bar Count & %25 Sektör Tavanı Revizyonu',
    totalActiveCount: validBist.length + validUs.length
  };
  revisionLogs.unshift(newLog);
  if (revisionLogs.length > 20) revisionLogs.pop();

  const status: DynamicUniverseStatus = {
    lastRebalancedAt: new Date().toISOString(),
    totalCandidates: BIST_UNIVERSE.length + US_UNIVERSE.length,
    approvedBistCount: validBist.length,
    approvedUsCount: validUs.length,
    rejectedByADV,
    rejectedByPrice,
    rejectedByIPOAge,
    rejectedBySectorCap,
    revisionLogs
  };

  universeCache = {
    status,
    filteredBistUniverse: validBist,
    filteredUsUniverse: validUs,
    timestamp: now
  };

  return {
    bistUniverse: validBist,
    usUniverse: validUs,
    combinedUniverse: [...validBist, ...validUs],
    status
  };
}

/**
 * 🛡️ GRANDFATHERING / GRACEFUL EXIT KURALI:
 * Eğer kullanıcıda açık bir pozisyon varsa (örn. GARAN), ama çeyreklik revizyonda hacmi düşüp evrenden çıktıysa:
 * - Pozisyon zorla kapatılmaz (take-profit / stop-loss beklenir).
 * - Ancak sisteme YENİ bir pozisyon açılmasına izin verilmez!
 */
export function canOpenNewTradeForTicker(ticker: string, activeUniverse: UniverseItem[]): boolean {
  return activeUniverse.some(u => u.ticker === ticker);
}

export function getCachedUniverseStatus(): DynamicUniverseStatus {
  if (universeCache) {
    return universeCache.status;
  }
  return {
    lastRebalancedAt: new Date().toISOString(),
    totalCandidates: BIST_UNIVERSE.length + US_UNIVERSE.length,
    approvedBistCount: BIST_UNIVERSE.length,
    approvedUsCount: US_UNIVERSE.length,
    rejectedByADV: 0,
    rejectedByPrice: 0,
    rejectedByIPOAge: 0,
    rejectedBySectorCap: 0,
    revisionLogs
  };
}
