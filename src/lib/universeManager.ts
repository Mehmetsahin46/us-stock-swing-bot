import { Candle, TechnicalIndicators, UniverseFilterConfig, DynamicUniverseStatus } from './types';
import { BIST_UNIVERSE, US_UNIVERSE, UniverseItem, fetchStockCandles, calculateTechnicals } from './marketData';

export const DEFAULT_UNIVERSE_CONFIG: UniverseFilterConfig = {
  bistMinDailyTurnoverTRY: 40_000_000, // 40 Milyon TL ortalama günlük hacim (ADV20 * Fiyat)
  usMinADVLot: 1_500_000, // 1.5 Milyon lot ortalama günlük hacim
  usMinPriceUSD: 5.00, // 5 USD altı penny stock'lar elenir
  minTradingDaysIPO: 60, // IPO sonrası en az 60 işlem günü geçmiş olmalı
  maxSectorWeightPct: 35 // Bir sektörün evrendeki max ağırlığı %35
};

interface DynamicCache {
  status: DynamicUniverseStatus;
  filteredBistUniverse: UniverseItem[];
  filteredUsUniverse: UniverseItem[];
  timestamp: number;
}

let universeCache: DynamicCache | null = null;
const CACHE_TTL_HOURS = 24; // Günlük tazeleme, çeyreklik kalıcı revizyon

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

  // 🔬 DİNAMİK YENİDEN HESAPLAMA (REBALANCE PROCESS)
  let rejectedByADV = 0;
  let rejectedByPrice = 0;
  let rejectedByIPOAge = 0;

  const validBist: UniverseItem[] = [];
  const validUs: UniverseItem[] = [];

  // 1. 🇹🇷 BIST Filtreleme
  for (const item of BIST_UNIVERSE) {
    const candles = await fetchStockCandles(item.ticker, '6mo');
    
    // IPO Soğuma Kuralı: En az 60 işlem günü (mum sayısı)
    if (candles.length < DEFAULT_UNIVERSE_CONFIG.minTradingDaysIPO) {
      rejectedByIPOAge++;
      continue;
    }

    const tech = calculateTechnicals(candles);
    if (!tech) {
      rejectedByADV++;
      continue;
    }

    // 20 Günlük Ortalama İşlem Hacmi (ADV20 * Fiyat >= 40-50M TL)
    const dailyTurnoverTRY = tech.avgVolume20 * tech.price;
    if (dailyTurnoverTRY < DEFAULT_UNIVERSE_CONFIG.bistMinDailyTurnoverTRY) {
      rejectedByADV++;
      continue;
    }

    validBist.push(item);
  }

  // 2. 🇺🇸 ABD Filtreleme
  for (const item of US_UNIVERSE) {
    const candles = await fetchStockCandles(item.ticker, '6mo');

    // IPO Soğuma Kuralı: En az 60 işlem günü
    if (candles.length < DEFAULT_UNIVERSE_CONFIG.minTradingDaysIPO) {
      rejectedByIPOAge++;
      continue;
    }

    const tech = calculateTechnicals(candles);
    if (!tech) {
      rejectedByADV++;
      continue;
    }

    // Fiyat Tabanı: $5.00 altı Penny Stock'lar elenir
    if (tech.price < DEFAULT_UNIVERSE_CONFIG.usMinPriceUSD) {
      rejectedByPrice++;
      continue;
    }

    // 20 Günlük Ortalama Lot Hacmi (ADV20 >= 1.5M Lot)
    if (tech.avgVolume20 < DEFAULT_UNIVERSE_CONFIG.usMinADVLot) {
      rejectedByADV++;
      continue;
    }

    validUs.push(item);
  }

  const status: DynamicUniverseStatus = {
    lastRebalancedAt: new Date().toISOString(),
    totalCandidates: BIST_UNIVERSE.length + US_UNIVERSE.length,
    approvedBistCount: validBist.length,
    approvedUsCount: validUs.length,
    rejectedByADV,
    rejectedByPrice,
    rejectedByIPOAge
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
    rejectedByIPOAge: 0
  };
}
