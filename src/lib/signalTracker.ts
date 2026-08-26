import { Signal, SignalPerformanceMetrics, SignalTrackItem, StrategyPerformanceStat, StrategyType } from './types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

let memoryTrackedSignals: SignalTrackItem[] = [];

export async function getTrackedSignals(): Promise<SignalTrackItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('portfolio_state')
        .select('state')
        .eq('id', 'signal_history')
        .single();
      if (data && data.state && Array.isArray(data.state)) {
        memoryTrackedSignals = data.state as SignalTrackItem[];
        return memoryTrackedSignals;
      }
    } catch (e) {}
  }
  return memoryTrackedSignals;
}

export async function saveTrackedSignals(signals: SignalTrackItem[]): Promise<void> {
  memoryTrackedSignals = signals;
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('portfolio_state')
        .upsert({
          id: 'signal_history',
          state: signals,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (e) {}
  }
}

export async function recordNewSignals(signals: Signal[]): Promise<void> {
  const current = await getTrackedSignals();
  let updated = false;

  for (const sig of signals) {
    const exists = current.some(item => item.ticker === sig.ticker && item.status === 'ACTIVE');
    if (!exists) {
      const newItem: SignalTrackItem = {
        id: `sig_track_${sig.ticker}_${Date.now()}`,
        ticker: sig.ticker,
        displayTicker: sig.displayTicker,
        market: sig.market,
        currency: sig.currency,
        strategy: sig.strategy,
        strategyName: sig.strategyName,
        grade: sig.grade || 'B',
        initialScore: sig.score,
        currentScore: sig.score,
        entryPrice: sig.suggestedEntry,
        stopLoss: sig.stopLoss,
        target1: sig.target1,
        target2: sig.target2,
        currentPrice: sig.suggestedEntry,
        highestPrice: sig.suggestedEntry,
        lowestPrice: sig.suggestedEntry,
        status: 'ACTIVE',
        resultPnLPct: 0,
        createdAt: new Date().toISOString(),
        reasons: [sig.reason],
        catalystSummary: sig.catalystSummary,
        expectedValuePct: sig.expectedValuePct || 4.5
      };
      current.unshift(newItem);
      updated = true;
    }
  }

  if (updated) {
    await saveTrackedSignals(current.slice(0, 200));
  }
}

export async function resolveSignalsWithQuotes(quotesMap: Map<string, number>): Promise<{
  resolvedCount: number;
  invalidatedCount: number;
  events: string[];
}> {
  const list = await getTrackedSignals();
  const events: string[] = [];
  let resolvedCount = 0;
  let invalidatedCount = 0;
  const now = new Date().toISOString();

  for (const item of list) {
    if (item.status !== 'ACTIVE') continue;

    const price = quotesMap.get(item.ticker);
    if (!price) continue;

    item.currentPrice = price;
    item.highestPrice = Math.max(item.highestPrice, price);
    item.lowestPrice = Math.min(item.lowestPrice, price);

    const gainPct = +(((price - item.entryPrice) / item.entryPrice) * 100).toFixed(2);

    // 1. Target 2 Hit (Full Success)
    if (price >= item.target2) {
      item.status = 'SUCCESS_TP2';
      item.resultPnLPct = +(((item.target2 - item.entryPrice) / item.entryPrice) * 100).toFixed(2);
      item.closedAt = now;
      resolvedCount++;
      events.push(`🎯 Sinyal Başarısı: ${item.displayTicker} TP2 Hedefine (${item.target2}) ulaştı! +%${item.resultPnLPct}`);
    }
    // 2. Target 1 Hit (Partial Success)
    else if (price >= item.target1 && item.highestPrice < item.target2) {
      item.status = 'SUCCESS_TP1';
      item.resultPnLPct = +(((item.target1 - item.entryPrice) / item.entryPrice) * 100).toFixed(2);
      item.closedAt = now;
      resolvedCount++;
      events.push(`🎯 Sinyal Başarısı: ${item.displayTicker} TP1 Hedefine (${item.target1}) ulaştı! +%${item.resultPnLPct}`);
    }
    // 3. Stop Loss Hit (Stopped)
    else if (price <= item.stopLoss) {
      item.status = 'STOPPED_SL';
      item.resultPnLPct = +(((item.stopLoss - item.entryPrice) / item.entryPrice) * 100).toFixed(2);
      item.closedAt = now;
      resolvedCount++;
      events.push(`🛑 Sinyal Stoplandı: ${item.displayTicker} Stop-Loss seviyesine (${item.stopLoss}) geriledi. %${item.resultPnLPct}`);
    }
    // 4. Invalidation Check: Price dropped more than 6% below entry without hitting formal stop
    else if (gainPct <= -6.0) {
      item.status = 'INVALIDATED';
      item.resultPnLPct = gainPct;
      item.closedAt = now;
      item.invalidationReason = 'Teknik trend desteği ve momentum kırıldı.';
      invalidatedCount++;
      events.push(`⚠️ SIGNAL INVALIDATED: ${item.displayTicker} sinyali teknik bozulma nedeniyle iptal edildi.`);
    }
  }

  if (resolvedCount > 0 || invalidatedCount > 0) {
    await saveTrackedSignals(list);
  }

  return { resolvedCount, invalidatedCount, events };
}

export function calculateSignalPerformanceMetrics(signals: SignalTrackItem[]): SignalPerformanceMetrics {
  const closedSignals = signals.filter(s => s.status !== 'ACTIVE');
  const now = new Date().getTime();

  const filterByDays = (days: number) => {
    const ms = days * 24 * 60 * 60 * 1000;
    return closedSignals.filter(s => {
      const time = new Date(s.closedAt || s.createdAt).getTime();
      return now - time <= ms;
    });
  };

  const calcWinRate = (list: SignalTrackItem[]) => {
    if (list.length === 0) return 0;
    const wins = list.filter(s => s.status === 'SUCCESS_TP1' || s.status === 'SUCCESS_TP2' || s.resultPnLPct > 0).length;
    return Number(((wins / list.length) * 100).toFixed(1));
  };

  const allWins = closedSignals.filter(s => s.resultPnLPct > 0);
  const allLosses = closedSignals.filter(s => s.resultPnLPct < 0);

  const totalGains = allWins.reduce((acc, s) => acc + s.resultPnLPct, 0);
  const totalLosses = Math.abs(allLosses.reduce((acc, s) => acc + s.resultPnLPct, 0));

  const profitFactor = totalLosses > 0 ? Number((totalGains / totalLosses).toFixed(2)) : totalGains > 0 ? 3.5 : 0;
  const avgWinningTradePct = allWins.length > 0 ? Number((totalGains / allWins.length).toFixed(2)) : 0;
  const avgLosingTradePct = allLosses.length > 0 ? Number((totalLosses / allLosses.length).toFixed(2)) : 0;

  // Max Drawdown calculation over closed signal cumulative returns
  let peak = 0;
  let maxDD = 0;
  let cum = 0;
  for (const s of [...closedSignals].reverse()) {
    cum += s.resultPnLPct;
    if (cum > peak) peak = cum;
    const dd = peak - cum;
    if (dd > maxDD) maxDD = dd;
  }

  // Strategy breakdown
  const strategies: Array<{ type: StrategyType; name: string }> = [
    { type: 'EMA_PULLBACK', name: 'EMA 20 Pullback (Trend Desteği)' },
    { type: 'BREAKOUT', name: 'Yüksek Hacimli Kırılım (Breakout)' },
    { type: 'MOMENTUM_TREND', name: 'Güçlü Momentum & Trend Takibi' },
    { type: 'OVERSOLD_BOUNCE', name: 'Aşırı Satım Tepki Alımı (Dip)' }
  ];

  const strategyBreakdown: StrategyPerformanceStat[] = strategies.map(st => {
    const stratClosed = closedSignals.filter(s => s.strategy === st.type);
    const wins = stratClosed.filter(s => s.resultPnLPct > 0).length;
    const losses = stratClosed.filter(s => s.resultPnLPct < 0).length;
    const g = stratClosed.filter(s => s.resultPnLPct > 0).reduce((acc, s) => acc + s.resultPnLPct, 0);
    const l = Math.abs(stratClosed.filter(s => s.resultPnLPct < 0).reduce((acc, s) => acc + s.resultPnLPct, 0));
    const pf = l > 0 ? Number((g / l).toFixed(2)) : g > 0 ? 4.0 : 0;
    const avg = stratClosed.length > 0 ? Number((stratClosed.reduce((acc, s) => acc + s.resultPnLPct, 0) / stratClosed.length).toFixed(2)) : 0;

    return {
      strategy: st.type,
      strategyName: st.name,
      totalSignals: stratClosed.length,
      winningSignals: wins,
      losingSignals: losses,
      winRate: calcWinRate(stratClosed),
      profitFactor: pf,
      avgReturnPct: avg
    };
  });

  return {
    totalSignals: signals.length,
    activeSignals: signals.filter(s => s.status === 'ACTIVE').length,
    winRateAllTime: calcWinRate(closedSignals),
    winRate7d: calcWinRate(filterByDays(7)),
    winRate30d: calcWinRate(filterByDays(30)),
    winRate90d: calcWinRate(filterByDays(90)),
    profitFactor,
    maxDrawdownPct: Number(maxDD.toFixed(2)),
    totalRealizedProfitPct: Number((totalGains - totalLosses).toFixed(2)),
    avgWinningTradePct,
    avgLosingTradePct,
    strategyBreakdown
  };
}