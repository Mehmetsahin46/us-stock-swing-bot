import { DualPortfolioState, MarketPortfolio, TradePosition } from './types';
import { recalculateMarketPortfolio } from './portfolioManager';

export function mergeMarketPortfolios(local: MarketPortfolio, remote: MarketPortfolio): MarketPortfolio {
  const result: MarketPortfolio = {
    ...local,
    ...remote,
    // Keep user customized settings if local has them
    riskPerTradePct: local.riskPerTradePct || remote.riskPerTradePct,
    maxOpenPositions: local.maxOpenPositions || remote.maxOpenPositions,
    autoTrade: local.autoTrade !== undefined ? local.autoTrade : remote.autoTrade,
    useMarketRegimeFilter: local.useMarketRegimeFilter !== undefined ? local.useMarketRegimeFilter : remote.useMarketRegimeFilter,
    useBreakevenTrailing: local.useBreakevenTrailing !== undefined ? local.useBreakevenTrailing : remote.useBreakevenTrailing,
    usePartialTakeProfit: local.usePartialTakeProfit !== undefined ? local.usePartialTakeProfit : remote.usePartialTakeProfit
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

  // 2. Merge Open Positions
  const positionsMap = new Map<string, TradePosition>();
  for (const pos of local.positions || []) {
    if (pos.status === 'OPEN') {
      positionsMap.set(pos.ticker, pos);
    }
  }
  for (const pos of remote.positions || []) {
    if (pos.status === 'OPEN') {
      // Remote has newer quote / price
      positionsMap.set(pos.ticker, pos);
    } else {
      // If remote closed it, remove from open positions and add to history
      positionsMap.delete(pos.ticker);
      if (!historyMap.has(pos.id)) {
        result.history.unshift(pos);
      }
    }
  }
  result.positions = Array.from(positionsMap.values());

  // 3. Recalculate balances, win rate, and profit factor
  recalculateMarketPortfolio(result);
  return result;
}

export function mergeDualStates(local: DualPortfolioState, remote: DualPortfolioState): DualPortfolioState {
  const mergedBist = mergeMarketPortfolios(local.bist, remote.bist);
  const mergedUs = mergeMarketPortfolios(local.us, remote.us);

  // Merge activity logs
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
    bistRegime: remote.bistRegime || local.bistRegime,
    usRegime: remote.usRegime || local.usRegime,
    lastScanTime: remote.lastScanTime || local.lastScanTime,
    lastCronTime: remote.lastCronTime || local.lastCronTime,
    activityLogs: mergedLogs
  };
}
