import { Candle, TechnicalIndicators, UniverseFilterConfig, DynamicUniverseStatus, UniverseRevisionLog, MarketType, Signal } from './types';
import { BIST_UNIVERSE, US_UNIVERSE, UniverseItem, fetchStockCandles, calculateTechnicals } from './marketData';

export const DEFAULT_UNIVERSE_CONFIG: UniverseFilterConfig = {
  bistMinDailyTurnoverTRY: 40_000_000, // 40 Milyon TL ortalama günlük hacim (Rolling ADV20 * Fiyat)
  usMinADVLot: 1_500_000, // 1.5 Milyon lot ortalama günlük hacim (Rolling ADV20)
  usMinPriceUSD: 5.00, // 5 USD altı penny stock'lar elenir
  minTradingDaysIPO: 60, // IPO sonrası en az 60 işlem görmüş mum (Bar Count Doğrulaması)
  maxSectorWeightPct: 25, // Tek bir sektör evrenin max %25'ini geçemez (GICS & KAP standardı)
  gracefulExitActivePositions: true // Kriterden düşen hissede açık pozisyon korunur, sadece yeni alım engellenir
};

// 💾 ÇİFT KATMANLI ÖNBELLEK (TWO-TIER CACHE):
// 1. Katman (ADV20 & Evren Kriterleri): Günde 1 Kez (24 Saat TTL)
// 2. Katman (Anlık Fiyat & Sinyal): 10 Dakika TTL
interface DynamicCache {
  status: DynamicUniverseStatus;
  filteredBistUniverse: UniverseItem[];
  filteredUsUniverse: UniverseItem[];
  timestamp: number;
}

let universeCache: DynamicCache | null = null;
const CACHE_TTL_HOURS = 24; // ADV20 günde 1 kez hesaplanır
const revisionLogs: UniverseRevisionLog[] = [];

/**
 * 🔬 DİNAMİK KUANT EVRENİ DERLEYİCİSİ (Günde 1 kez Rolling ADV20 + Bar Count IPO + %25 Sector Cap)
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

  const bistSectorCounts: Record<string, number> = {};
  const usSectorCounts: Record<string, number> = {};

  const maxBistPerSector = Math.ceil(BIST_UNIVERSE.length * (DEFAULT_UNIVERSE_CONFIG.maxSectorWeightPct / 100)); // ~35 hisse
  const maxUsPerSector = Math.ceil(US_UNIVERSE.length * (DEFAULT_UNIVERSE_CONFIG.maxSectorWeightPct / 100)); // ~90 hisse

  // 1. 🇹🇷 BIST Filtreleme
  for (const item of BIST_UNIVERSE) {
    const candles = await fetchStockCandles(item.ticker, '6mo');
    
    // 🛡️ Bar Count IPO Guard: Geçerli günlük mum sayısı >= 60 olmalı
    if (candles.length < DEFAULT_UNIVERSE_CONFIG.minTradingDaysIPO) {
      rejectedByIPOAge++;
      continue;
    }

    const tech = calculateTechnicals(candles);
    if (!tech) {
      rejectedByADV++;
      continue;
    }

    // 🛡️ Rolling 20-Günlük Hacim Eşiği (ADV20 * Fiyat >= 40M TL)
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

    // 🛡️ Bar Count IPO Guard: Geçerli günlük mum sayısı >= 60 olmalı
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

    // 🛡️ Rolling 20-Günlük Lot Hacmi (ADV20 >= 1.5M Lot)
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

  // 📜 Revizyon Günlüğü
  const newLog: UniverseRevisionLog = {
    id: `rev_${Date.now()}`,
    revisionDate: new Date().toISOString(),
    market: 'ALL',
    addedTickers: [],
    removedTickers: [],
    reason: 'Günlük ADV20 & Çeyreklik Kuant Evreni Revizyonu (%25 Sektör Tavanı & IPO Guard)',
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

  // 🔄 Supabase Senkronizasyonu (Arka planda çalıştır)
  syncUniverseToSupabase(validBist, validUs, newLog).catch(() => {});

  return {
    bistUniverse: validBist,
    usUniverse: validUs,
    combinedUniverse: [...validBist, ...validUs],
    status
  };
}

/**
 * 🛡️ KARANTİNA & EVREN REVİZYONU EDGE-CASE ÇÖZÜCÜSÜ (Race Condition Guard):
 * Eğer bir sinyal karantinada doğrulama beklerken o hisse evren revizyonundan düşerse:
 * - Doğrulama süreci usulünce tamamlanır.
 * - Ancak alım kilitlenir (allowNewBuys = false).
 */
export function resolveQuarantineSignalOnEviction(signal: Signal, activeUniverse: UniverseItem[]): Signal {
  const isInUniverse = activeUniverse.some(u => u.ticker === signal.ticker);
  if (!isInUniverse) {
    return {
      ...signal,
      isQuarantined: false,
      quarantineReason: '⚠️ Evren Revizyonu Kriteri Karşılanamadı (Yeni Alım Kilitli)',
      quarantineExpiresInSeconds: 0
    };
  }
  return signal;
}

/**
 * 🛡️ GRANDFATHERING / GRACEFUL EXIT:
 * Açık pozisyondaki hisse kriterden düşse bile kapatılmaz; sadece YENİ pozisyon açılması engellenir.
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

/**
 * 🗄️ SUPABASE UNIVERSE STATE & AUDIT LOGGER
 */
async function syncUniverseToSupabase(
  bistList: UniverseItem[],
  usList: UniverseItem[],
  log: UniverseRevisionLog
): Promise<void> {
  try {
    const { isSupabaseConfigured, supabase } = await import('./supabaseClient');
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Save revision log
    await supabase.from('universe_revision_log').insert({
      id: log.id,
      revision_date: log.revisionDate,
      market: log.market,
      added_symbols: log.addedTickers,
      removed_symbols: log.removedTickers,
      reason: log.reason,
      active_count: log.totalActiveCount
    });

    // 2. Save active universe snapshot
    await supabase.from('portfolio_state').upsert({
      id: 'active_quant_universe',
      state: {
        bist: bistList,
        us: usList,
        lastUpdated: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  } catch (err) {
    console.warn('[SupabaseUniverseSync] Error saving universe snapshot:', err);
  }
}
