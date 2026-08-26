import { DualPortfolioState, MarketPortfolio, TradePosition } from './types';
import { recalculateMarketPortfolio } from './portfolioManager';
import { INITIAL_DUAL_STATE } from './constants';

function isEmptyState(state: DualPortfolioState): boolean {
  return (
    state.bist.positions.length === 0 &&
    state.bist.history.length === 0 &&
    state.us.positions.length === 0 &&
    state.us.history.length === 0 &&
    state.bist.cash === state.bist.initialBalance &&
    state.us.cash === state.us.initialBalance
  );
}

export function mergeMarketPortfolios(local: MarketPortfolio, remote: MarketPortfolio): MarketPortfolio {
  // If remote is empty/initial, keep local
  if (remote.positions.length === 0 && remote.history.length === 0 && remote.cash === remote.initialBalance) {
    if (local.positions.length > 0 || local.history.length > 0) {
      return local;
    }
  }

  const result: MarketPortfolio = {
    ...remote,
    // Use nullish coalescing (??) instead of || to preserve 0 values
    riskPerTradePct: local.riskPerTradePct ?? remote.riskPerTradePct,
    maxOpenPositions: local.maxOpenPositions ?? remote.maxOpenPositions,
    maxHoldingDays: local.maxHoldingDays ?? remote.maxHoldingDays,
    autoTrade: local.autoTrade ?? remote.autoTrade,
    useMarketRegimeFilter: local.useMarketRegimeFilter ?? remote.useMarketRegimeFilter,
    useBreakevenTrailing: local.useBreakevenTrailing ?? remote.useBreakevenTrailing,
    usePartialTakeProfit: local.usePartialTakeProfit ?? remote.usePartialTakeProfit
  };

  // 1. Merge History by unique ID (Never lose any closed trade!)
  const historyMap = new Map<string, TradePosition>();
  for (const item of remote.history || []) {
    historyMap.set(item.id, item);
  }
  for (const item of local.history || []) {
    if (!historyMap.has(item.id)) {
      historyMap.set(item.id, item);
    }
  }
  result.history = Array.from(historyMap.values()).sort((a, b) => {
    return (b.exitDate || b.entryDate).localeCompare(a.exitDate || a.entryDate);
  });

  // 2. Merge Open Positions by ID (not ticker - same ticker can have multiple positions)
  const positionsMap = new Map<string, TradePosition>();
  for (const pos of local.positions || []) {
    if (pos.status === 'OPEN') {
      positionsMap.set(pos.id, pos);
    }
  }
  for (const pos of remote.positions || []) {
    if (pos.status === 'OPEN') {
      positionsMap.set(pos.id, pos);
    } else {
      positionsMap.delete(pos.id);
      if (!historyMap.has(pos.id)) {
        result.history.unshift(pos);
      }
    }
  }
  result.positions = Array.from(positionsMap.values());

  // 3. Merge equity curves
  const curveMap = new Map<string, number>();
  for (const entry of local.equityCurve || []) {
    curveMap.set(entry.date, entry.equity);
  }
  for (const entry of remote.equityCurve || []) {
    curveMap.set(entry.date, entry.equity);
  }
  result.equityCurve = Array.from(curveMap.entries())
    .map(([date, equity]) => ({ date, equity }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 4. Recalculate
  recalculateMarketPortfolio(result);
  return result;
}

export function mergeDualStates(local: DualPortfolioState, remote: DualPortfolioState): DualPortfolioState {
  // If remote is completely empty (cold start), keep local
  if (isEmptyState(remote) && !isEmptyState(local)) {
    return local;
  }
  // If local is completely empty, take remote
  if (isEmptyState(local) && !isEmptyState(remote)) {
    return remote;
  }

  const mergedBist = mergeMarketPortfolios(local.bist, remote.bist);
  const mergedUs = mergeMarketPortfolios(local.us, remote.us);

  const logsMap = new Map<string, DualPortfolioState['activityLogs'][0]>();
  for (const l of remote.activityLogs || []) {
    logsMap.set(l.id, l);
  }
  for (const l of local.activityLogs || []) {
    if (!logsMap.has(l.id)) {
      logsMap.set(l.id, l);
    }
  }

  const mergedLogs = Array.from(logsMap.values())
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 50);

  return {
    bist: mergedBist,
    us: mergedUs,
    bistRegime: remote.bistRegime ?? local.bistRegime,
    usRegime: remote.usRegime ?? local.usRegime,
    lastScanTime: remote.lastScanTime ?? local.lastScanTime,
    lastCronTime: remote.lastCronTime ?? local.lastCronTime,
    activityLogs: mergedLogs
  };
}