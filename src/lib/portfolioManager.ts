import { MarketPortfolio, Signal, TradePosition } from './types';

function calculateBusinessDays(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  let count = 0;
  const current = new Date(start);
  current.setDate(current.getDate() + 1);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export function openPositionForMarket(
  signal: Signal,
  currentPortfolio: MarketPortfolio
): { portfolio: MarketPortfolio; success: boolean; message: string } {
  const portfolio = JSON.parse(JSON.stringify(currentPortfolio)) as MarketPortfolio;

  const existing = portfolio.positions.find(p => p.ticker === signal.ticker && p.status === 'OPEN');
  if (existing) {
    return { portfolio: currentPortfolio, success: false, message: `${signal.displayTicker} i\u00e7in zaten a\u00e7\u0131k bir pozisyon mevcut.` };
  }

  const openCount = portfolio.positions.filter(p => p.status === 'OPEN').length;
  if (openCount >= portfolio.maxOpenPositions) {
    return { portfolio: currentPortfolio, success: false, message: `Maksimum a\u00e7\u0131k pozisyon limitine (${portfolio.maxOpenPositions}) ula\u015f\u0131ld\u0131.` };
  }

  const sameSectorCount = portfolio.positions.filter(p => p.status === 'OPEN' && p.sector === signal.sector).length;
  if (sameSectorCount >= 4 && signal.sector !== 'Index') {
    return { portfolio: currentPortfolio, success: false, message: `${signal.sector} sekt\u00f6r\u00fcnden zaten ${sameSectorCount} a\u00e7\u0131k pozisyon var.` };
  }

  const minReserve = portfolio.totalEquity * 0.01;
  if (portfolio.cash <= minReserve) {
    return { portfolio: currentPortfolio, success: false, message: 'Yeterli nakit rezervi yok.' };
  }

  const riskAmount = portfolio.totalEquity * (portfolio.riskPerTradePct / 100);
  const riskPerShare = Math.max(0.1, signal.suggestedEntry - signal.stopLoss);
  const sharesFromRisk = Math.floor(riskAmount / riskPerShare);

  const maxCapitalPerPosition = Math.max(signal.suggestedEntry, portfolio.totalEquity * 0.22);
  const sharesFromCapitalCap = Math.floor(maxCapitalPerPosition / signal.suggestedEntry);

  let shares = Math.min(sharesFromRisk, sharesFromCapitalCap);
  if (shares <= 0) shares = 1;

  let totalCost = shares * signal.suggestedEntry;

  const availableCash = portfolio.cash - minReserve;
  if (totalCost > availableCash) {
    shares = Math.floor(availableCash / signal.suggestedEntry);
    totalCost = shares * signal.suggestedEntry;
  }

  if (shares <= 0 || totalCost <= 0) {
    return { portfolio: currentPortfolio, success: false, message: 'Pozisyon a\u00e7mak i\u00e7in yeterli nakit bakiye yok.' };
  }

  portfolio.cash = Math.max(0, Number((portfolio.cash - totalCost).toFixed(2)));
  const currSign = portfolio.currencySymbol;

  const newPosition: TradePosition = {
    id: `pos_${signal.ticker}_${Date.now()}`,
    ticker: signal.ticker,
    displayTicker: signal.displayTicker,
    sector: signal.sector,
    market: signal.market,
    currency: signal.currency,
    strategy: signal.strategy,
    strategyName: signal.strategyName,
    entryDate: new Date().toISOString().split('T')[0],
    entryPrice: signal.suggestedEntry,
    initialShares: shares,
    shares,
    totalCost: Number(totalCost.toFixed(2)),
    originalStopLoss: signal.stopLoss,
    stopLoss: signal.stopLoss,
    target1: signal.target1,
    target2: signal.target2,
    tp1Hit: false,
    isBreakeven: false,
    currentPrice: signal.suggestedEntry,
    highestPriceSinceEntry: signal.suggestedEntry,
    lowestPriceSinceEntry: signal.suggestedEntry,
    unrealizedPnL: 0,
    unrealizedPnLPct: 0,
    realizedPnL: 0,
    realizedPnLPct: 0,
    status: 'OPEN',
    daysHeld: 0,
    maxHoldingDays: portfolio.maxHoldingDays
  };

  portfolio.positions.unshift(newPosition);
  recalculateMarketPortfolio(portfolio);

  return {
    portfolio,
    success: true,
    message: `${shares} adet ${signal.displayTicker} (${signal.market}) ${currSign}${signal.suggestedEntry.toFixed(2)} fiyattan al\u0131nd\u0131 (Tutar: ${currSign}${totalCost.toFixed(2)}).`
  };
}

export function updateMarketPositionsWithQuotes(
  currentPortfolio: MarketPortfolio,
  quotesMap: Map<string, number>
): { portfolio: MarketPortfolio; events: string[]; closedTrades: TradePosition[] } {
  const portfolio = JSON.parse(JSON.stringify(currentPortfolio)) as MarketPortfolio;
  const events: string[] = [];
  const closedTrades: TradePosition[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  const stillOpen: TradePosition[] = [];

  for (const pos of portfolio.positions) {
    if (pos.status !== 'OPEN') continue;

    const currentPrice = quotesMap.get(pos.ticker) || pos.currentPrice;
    pos.currentPrice = currentPrice;
    pos.highestPriceSinceEntry = Math.max(pos.highestPriceSinceEntry, currentPrice);
    pos.lowestPriceSinceEntry = Math.min(pos.lowestPriceSinceEntry, currentPrice);

    // FIX: Calculate daysHeld from entryDate to today (business days)
    pos.daysHeld = calculateBusinessDays(pos.entryDate, todayStr);

    const currSign = portfolio.currencySymbol;

    if (portfolio.usePartialTakeProfit && !pos.tp1Hit && currentPrice >= pos.target1) {
      pos.tp1Hit = true;
      pos.isBreakeven = true;
      pos.stopLoss = pos.entryPrice;
      const sharesToSell = Math.ceil(pos.shares / 2);
      if (sharesToSell > 0 && pos.shares > sharesToSell) {
        const partialProfit = Number(((pos.target1 - pos.entryPrice) * sharesToSell).toFixed(2));
        pos.shares -= sharesToSell;
        pos.realizedPnL = Number((pos.realizedPnL + partialProfit).toFixed(2));
        portfolio.cash = Number((portfolio.cash + sharesToSell * pos.target1).toFixed(2));
        events.push(`TP1: ${pos.displayTicker} TP1 seviyesine (${currSign}${pos.target1}) ula\u015ft\u0131! %50 kar realize edildi (+${currSign}${partialProfit}), Stop Maliyete cekildi.`);
      }
    }

    if (portfolio.useBreakevenTrailing && pos.tp1Hit && currentPrice > pos.target1) {
      const trailingBuffer = (pos.target1 - pos.entryPrice) * 0.4;
      const potentialNewStop = Number((currentPrice - trailingBuffer).toFixed(2));
      if (potentialNewStop > pos.stopLoss) {
        pos.stopLoss = potentialNewStop;
      }
    }

    pos.unrealizedPnL = Number(((currentPrice - pos.entryPrice) * pos.shares).toFixed(2));
    pos.unrealizedPnLPct = Number((((currentPrice - pos.entryPrice) / pos.entryPrice) * 100).toFixed(2));

    let shouldClose = false;
    let exitReason = '';
    let exitStatus: TradePosition['status'] = 'OPEN';
    let exitPrice = currentPrice;

    if (currentPrice <= pos.stopLoss) {
      shouldClose = true;
      exitPrice = pos.stopLoss;
      if (pos.isBreakeven) {
        exitStatus = 'CLOSED_BREAKEVEN';
        exitReason = `Basa-Bas Stop (${currSign}${pos.stopLoss}) kapatildi.`;
        events.push(`SL-BE: ${pos.displayTicker} basa-bas seviyesinde kapatildi.`);
      } else {
        exitStatus = 'CLOSED_SL';
        exitReason = `Stop-Loss (${currSign}${pos.stopLoss}) tetiklendi.`;
        events.push(`SL: ${pos.displayTicker} Stop-Loss (${currSign}${pos.stopLoss}) tetiklendi. %${pos.unrealizedPnLPct}`);
      }
    } else if (currentPrice >= pos.target2) {
      shouldClose = true;
      exitStatus = 'CLOSED_TP2';
      exitPrice = pos.target2;
      exitReason = `Ana Kar Hedefi (${currSign}${pos.target2}) gerceklesti!`;
      events.push(`TP2: ${pos.displayTicker} Ana Kar Hedefine ulasti! +%${pos.unrealizedPnLPct}`);
    } else if (pos.daysHeld >= pos.maxHoldingDays) {
      shouldClose = true;
      exitStatus = 'CLOSED_EXPIRED';
      exitPrice = currentPrice;
      exitReason = `${pos.maxHoldingDays} gunluk vade suresi doldu.`;
      events.push(`VADE: ${pos.displayTicker} ${pos.maxHoldingDays} gun vade doldu, kapatildi.`);
    }

    if (shouldClose) {
      pos.status = exitStatus;
      pos.exitDate = todayStr;
      pos.exitPrice = exitPrice;
      pos.exitReason = exitReason;
      const finalLegPnL = Number(((exitPrice - pos.entryPrice) * pos.shares).toFixed(2));
      pos.realizedPnL = Number((pos.realizedPnL + finalLegPnL).toFixed(2));
      pos.realizedPnLPct = Number((((pos.realizedPnL) / (pos.entryPrice * pos.initialShares)) * 100).toFixed(2));
      pos.unrealizedPnL = 0;
      pos.unrealizedPnLPct = 0;
      portfolio.cash = Math.max(0, Number((portfolio.cash + pos.shares * exitPrice).toFixed(2)));
      portfolio.history.unshift(pos);
      closedTrades.push(pos);
    } else {
      stillOpen.push(pos);
    }
  }

  portfolio.positions = stillOpen;
  recalculateMarketPortfolio(portfolio);
  return { portfolio, events, closedTrades };
}

export function manuallyClosePositionInMarket(
  currentPortfolio: MarketPortfolio,
  positionId: string
): { portfolio: MarketPortfolio; success: boolean; message: string; closedTrade?: TradePosition } {
  const portfolio = JSON.parse(JSON.stringify(currentPortfolio)) as MarketPortfolio;
  const index = portfolio.positions.findIndex(p => p.id === positionId && p.status === 'OPEN');
  if (index === -1) {
    return { portfolio: currentPortfolio, success: false, message: 'Acik pozisyon bulunamadi.' };
  }

  const pos = portfolio.positions[index];
  const exitPrice = pos.currentPrice;
  const currSign = portfolio.currencySymbol;
  pos.status = 'CLOSED_MANUAL';
  pos.exitDate = new Date().toISOString().split('T')[0];
  pos.exitPrice = exitPrice;
  pos.exitReason = 'Manuel olarak kapatildi.';
  const finalLegPnL = Number(((exitPrice - pos.entryPrice) * pos.shares).toFixed(2));
  pos.realizedPnL = Number((pos.realizedPnL + finalLegPnL).toFixed(2));
  pos.realizedPnLPct = Number((((pos.realizedPnL) / (pos.entryPrice * pos.initialShares)) * 100).toFixed(2));
  pos.unrealizedPnL = 0;
  pos.unrealizedPnLPct = 0;
  portfolio.cash = Math.max(0, Number((portfolio.cash + pos.shares * exitPrice).toFixed(2)));
  portfolio.positions.splice(index, 1);
  portfolio.history.unshift(pos);
  recalculateMarketPortfolio(portfolio);

  return {
    portfolio, success: true,
    message: `${pos.displayTicker} pozisyonu ${currSign}${exitPrice.toFixed(2)} fiyattan kapatildi.`,
    closedTrade: pos
  };
}

export function recalculateMarketPortfolio(portfolio: MarketPortfolio) {
  let openPositionsValue = 0;
  let totalUnrealized = 0;
  for (const pos of portfolio.positions) {
    if (pos.status === 'OPEN') {
      openPositionsValue += pos.shares * pos.currentPrice;
      totalUnrealized += pos.unrealizedPnL;
    }
  }
  portfolio.unrealizedPnL = Number(totalUnrealized.toFixed(2));
  portfolio.totalEquity = Number((portfolio.cash + openPositionsValue).toFixed(2));

  let totalRealized = 0; let wins = 0; let losses = 0;
  let totalWinAmount = 0; let totalLossAmount = 0;
  for (const trade of portfolio.history) {
    totalRealized += trade.realizedPnL;
    if (trade.realizedPnL > 0) { wins++; totalWinAmount += trade.realizedPnL; }
    else if (trade.realizedPnL < 0) { losses++; totalLossAmount += Math.abs(trade.realizedPnL); }
  }
  portfolio.realizedPnL = Number(totalRealized.toFixed(2));
  portfolio.totalTrades = portfolio.history.length;
  portfolio.winningTrades = wins;
  portfolio.losingTrades = losses;
  portfolio.winRate = portfolio.totalTrades > 0 ? Number(((wins / portfolio.totalTrades) * 100).toFixed(1)) : 0;
  portfolio.profitFactor = totalLossAmount > 0 ? Number((totalWinAmount / totalLossAmount).toFixed(2)) : wins > 0 ? 99 : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const lastCurveEntry = portfolio.equityCurve[portfolio.equityCurve.length - 1];
  if (!lastCurveEntry || lastCurveEntry.date !== todayStr) {
    portfolio.equityCurve.push({ date: todayStr, equity: portfolio.totalEquity });
  } else {
    lastCurveEntry.equity = portfolio.totalEquity;
  }
}