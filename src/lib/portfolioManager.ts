import { BotSettings, PortfolioState, Signal, TradePosition } from './types';

export const DEFAULT_SETTINGS: BotSettings = {
  startingCapital: 10000,
  riskPerTradePct: 2.0,
  maxOpenPositions: 5,
  maxHoldingDays: 14,
  autoTrade: false,
  minRVOL: 0.8,
  allowedStrategies: ['EMA_PULLBACK', 'BREAKOUT', 'OVERSOLD_BOUNCE']
};

export const INITIAL_PORTFOLIO_STATE: PortfolioState = {
  initialBalance: 10000,
  cash: 10000,
  totalEquity: 10000,
  realizedPnL: 0,
  unrealizedPnL: 0,
  winRate: 0,
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
  profitFactor: 0,
  positions: [],
  history: [],
  equityCurve: [
    {
      date: new Date().toISOString().split('T')[0],
      equity: 10000
    }
  ],
  lastScanTime: null,
  settings: DEFAULT_SETTINGS
};

export function openPaperPosition(
  signal: Signal,
  currentState: PortfolioState
): { state: PortfolioState; success: boolean; message: string } {
  const state = JSON.parse(JSON.stringify(currentState)) as PortfolioState;

  // 1. Check if position already open for this ticker
  const existing = state.positions.find(p => p.ticker === signal.ticker && p.status === 'OPEN');
  if (existing) {
    return { state: currentState, success: false, message: `${signal.ticker} için zaten açık bir pozisyon mevcut.` };
  }

  // 2. Check max open positions
  const openCount = state.positions.filter(p => p.status === 'OPEN').length;
  if (openCount >= state.settings.maxOpenPositions) {
    return { state: currentState, success: false, message: `Maksimum açık pozisyon limitine (${state.settings.maxOpenPositions}) ulaşıldı.` };
  }

  // 3. Position Sizing: Risk per trade = 2% of total equity
  const riskAmount = state.totalEquity * (state.settings.riskPerTradePct / 100);
  const riskPerShare = Math.max(0.1, signal.suggestedEntry - signal.stopLoss);
  let shares = Math.floor(riskAmount / riskPerShare);

  if (shares <= 0) shares = 1;

  let totalCost = shares * signal.suggestedEntry;

  // If cash is insufficient, scale down shares
  if (totalCost > state.cash) {
    shares = Math.floor(state.cash / signal.suggestedEntry);
    totalCost = shares * signal.suggestedEntry;
  }

  if (shares <= 0 || totalCost <= 0) {
    return { state: currentState, success: false, message: 'Pozisyon açmak için yeterli nakit bakiye yok.' };
  }

  // Deduct cash
  state.cash = Number((state.cash - totalCost).toFixed(2));

  const newPosition: TradePosition = {
    id: `pos_${signal.ticker}_${Date.now()}`,
    ticker: signal.ticker,
    strategy: signal.strategy,
    strategyName: signal.strategyName,
    entryDate: new Date().toISOString().split('T')[0],
    entryPrice: signal.suggestedEntry,
    shares,
    totalCost: Number(totalCost.toFixed(2)),
    stopLoss: signal.stopLoss,
    target1: signal.target1,
    target2: signal.target2,
    currentPrice: signal.suggestedEntry,
    highestPriceSinceEntry: signal.suggestedEntry,
    lowestPriceSinceEntry: signal.suggestedEntry,
    unrealizedPnL: 0,
    unrealizedPnLPct: 0,
    realizedPnL: 0,
    realizedPnLPct: 0,
    status: 'OPEN',
    daysHeld: 0,
    maxHoldingDays: state.settings.maxHoldingDays
  };

  state.positions.unshift(newPosition);

  // Recalculate equity
  recalculatePortfolio(state);

  return {
    state,
    success: true,
    message: `${shares} adet ${signal.ticker} $${signal.suggestedEntry.toFixed(2)} fiyattan sanal portföye eklendi (Stop: $${signal.stopLoss}, Hedef: $${signal.target2}).`
  };
}

export function updatePositionsWithQuotes(
  currentState: PortfolioState,
  quotesMap: Map<string, number>
): { state: PortfolioState; events: string[] } {
  const state = JSON.parse(JSON.stringify(currentState)) as PortfolioState;
  const events: string[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  const stillOpen: TradePosition[] = [];

  for (const pos of state.positions) {
    if (pos.status !== 'OPEN') {
      continue;
    }

    const currentPrice = quotesMap.get(pos.ticker) || pos.currentPrice;
    pos.currentPrice = currentPrice;
    pos.highestPriceSinceEntry = Math.max(pos.highestPriceSinceEntry, currentPrice);
    pos.lowestPriceSinceEntry = Math.min(pos.lowestPriceSinceEntry, currentPrice);

    // Unrealized PnL
    pos.unrealizedPnL = Number(((currentPrice - pos.entryPrice) * pos.shares).toFixed(2));
    pos.unrealizedPnLPct = Number((((currentPrice - pos.entryPrice) / pos.entryPrice) * 100).toFixed(2));

    let shouldClose = false;
    let exitReason = '';
    let exitStatus: TradePosition['status'] = 'OPEN';
    let exitPrice = currentPrice;

    // 1. Stop-Loss check
    if (currentPrice <= pos.stopLoss) {
      shouldClose = true;
      exitStatus = 'CLOSED_SL';
      exitPrice = pos.stopLoss;
      exitReason = `Stop-Loss ($${pos.stopLoss}) tetiklendi.`;
      events.push(`🛑 ${pos.ticker} Stop-Loss seviyesine ($${pos.stopLoss}) ulaştı ve kapatıldı. Zarar: ${pos.unrealizedPnLPct}%`);
    }
    // 2. Take-Profit 2 (Full Target) check
    else if (currentPrice >= pos.target2) {
      shouldClose = true;
      exitStatus = 'CLOSED_TP2';
      exitPrice = pos.target2;
      exitReason = `Ana Kâr Hedefi ($${pos.target2}) gerçekleşti!`;
      events.push(`🎯 ${pos.ticker} Ana Kâr Hedefine ($${pos.target2}) ulaştı! Kâr: +${pos.unrealizedPnLPct}%`);
    }
    // 3. Max holding days expiration (14 days)
    else if (pos.daysHeld >= pos.maxHoldingDays) {
      shouldClose = true;
      exitStatus = 'CLOSED_EXPIRED';
      exitPrice = currentPrice;
      exitReason = `${pos.maxHoldingDays} günlük maksimum vade süresi doldu.`;
      events.push(`⏳ ${pos.ticker} için ${pos.maxHoldingDays} günlük tutma süresi doldu ve piyasa fiyatından kapatıldı.`);
    }

    if (shouldClose) {
      pos.status = exitStatus;
      pos.exitDate = todayStr;
      pos.exitPrice = exitPrice;
      pos.exitReason = exitReason;
      pos.realizedPnL = Number(((exitPrice - pos.entryPrice) * pos.shares).toFixed(2));
      pos.realizedPnLPct = Number((((exitPrice - pos.entryPrice) / pos.entryPrice) * 100).toFixed(2));
      pos.unrealizedPnL = 0;
      pos.unrealizedPnLPct = 0;

      // Return cash back to balance
      state.cash = Number((state.cash + pos.shares * exitPrice).toFixed(2));
      state.history.unshift(pos);
    } else {
      stillOpen.push(pos);
    }
  }

  state.positions = stillOpen;
  recalculatePortfolio(state);

  return { state, events };
}

export function manuallyClosePosition(
  currentState: PortfolioState,
  positionId: string
): { state: PortfolioState; success: boolean; message: string } {
  const state = JSON.parse(JSON.stringify(currentState)) as PortfolioState;
  const index = state.positions.findIndex(p => p.id === positionId && p.status === 'OPEN');

  if (index === -1) {
    return { state: currentState, success: false, message: 'Açık pozisyon bulunamadı.' };
  }

  const pos = state.positions[index];
  const exitPrice = pos.currentPrice;
  pos.status = 'CLOSED_MANUAL';
  pos.exitDate = new Date().toISOString().split('T')[0];
  pos.exitPrice = exitPrice;
  pos.exitReason = 'Kullanıcı tarafından manuel olarak kapatıldı.';
  pos.realizedPnL = Number(((exitPrice - pos.entryPrice) * pos.shares).toFixed(2));
  pos.realizedPnLPct = Number((((exitPrice - pos.entryPrice) / pos.entryPrice) * 100).toFixed(2));
  pos.unrealizedPnL = 0;
  pos.unrealizedPnLPct = 0;

  state.cash = Number((state.cash + pos.shares * exitPrice).toFixed(2));
  state.positions.splice(index, 1);
  state.history.unshift(pos);

  recalculatePortfolio(state);

  return {
    state,
    success: true,
    message: `${pos.ticker} pozisyonu $${exitPrice.toFixed(2)} fiyattan manuel olarak kapatıldı.`
  };
}

export function recalculatePortfolio(state: PortfolioState) {
  let openPositionsValue = 0;
  let totalUnrealized = 0;

  for (const pos of state.positions) {
    if (pos.status === 'OPEN') {
      openPositionsValue += pos.shares * pos.currentPrice;
      totalUnrealized += pos.unrealizedPnL;
    }
  }

  state.unrealizedPnL = Number(totalUnrealized.toFixed(2));
  state.totalEquity = Number((state.cash + openPositionsValue).toFixed(2));

  // Closed trades stats
  let totalRealized = 0;
  let wins = 0;
  let losses = 0;
  let totalWinAmount = 0;
  let totalLossAmount = 0;

  for (const trade of state.history) {
    totalRealized += trade.realizedPnL;
    if (trade.realizedPnL > 0) {
      wins++;
      totalWinAmount += trade.realizedPnL;
    } else if (trade.realizedPnL < 0) {
      losses++;
      totalLossAmount += Math.abs(trade.realizedPnL);
    }
  }

  state.realizedPnL = Number(totalRealized.toFixed(2));
  state.totalTrades = state.history.length;
  state.winningTrades = wins;
  state.losingTrades = losses;
  state.winRate = state.totalTrades > 0 ? Number(((wins / state.totalTrades) * 100).toFixed(1)) : 0;
  state.profitFactor = totalLossAmount > 0 ? Number((totalWinAmount / totalLossAmount).toFixed(2)) : wins > 0 ? 99 : 0;

  // Append to equity curve if new day or update latest
  const todayStr = new Date().toISOString().split('T')[0];
  const lastCurveEntry = state.equityCurve[state.equityCurve.length - 1];

  if (!lastCurveEntry || lastCurveEntry.date !== todayStr) {
    state.equityCurve.push({ date: todayStr, equity: state.totalEquity });
  } else {
    lastCurveEntry.equity = state.totalEquity;
  }
}
