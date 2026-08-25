import { MarketPortfolio, Signal, TradePosition } from './types';

export function openPositionForMarket(
  signal: Signal,
  currentPortfolio: MarketPortfolio
): { portfolio: MarketPortfolio; success: boolean; message: string } {
  const portfolio = JSON.parse(JSON.stringify(currentPortfolio)) as MarketPortfolio;

  // 1. Check if position already open for this ticker
  const existing = portfolio.positions.find(p => p.ticker === signal.ticker && p.status === 'OPEN');
  if (existing) {
    return { portfolio: currentPortfolio, success: false, message: `${signal.displayTicker} için zaten açık bir pozisyon mevcut.` };
  }

  // 2. Check max open positions
  const openCount = portfolio.positions.filter(p => p.status === 'OPEN').length;
  if (openCount >= portfolio.maxOpenPositions) {
    return { portfolio: currentPortfolio, success: false, message: `Maksimum açık pozisyon limitine (${portfolio.maxOpenPositions}) ulaşıldı.` };
  }

  // 3. Sector Diversification Check (Max 2 positions per sector)
  const sameSectorCount = portfolio.positions.filter(p => p.status === 'OPEN' && p.sector === signal.sector).length;
  if (sameSectorCount >= 2 && signal.sector !== 'Index') {
    return { portfolio: currentPortfolio, success: false, message: `${signal.sector} sektöründen zaten 2 açık pozisyon var. Risk çeşitlendirmesi için engellendi.` };
  }

  // 4. Position Sizing: Risk per trade = 2% of total equity
  const riskAmount = portfolio.totalEquity * (portfolio.riskPerTradePct / 100);
  const riskPerShare = Math.max(0.1, signal.suggestedEntry - signal.stopLoss);
  let shares = Math.floor(riskAmount / riskPerShare);

  if (shares <= 0) shares = 1;

  let totalCost = shares * signal.suggestedEntry;

  // Scale down if exceeds available cash
  if (totalCost > portfolio.cash) {
    shares = Math.floor(portfolio.cash / signal.suggestedEntry);
    totalCost = shares * signal.suggestedEntry;
  }

  if (shares <= 0 || totalCost <= 0) {
    return { portfolio: currentPortfolio, success: false, message: 'Pozisyon açmak için yeterli nakit bakiye yok.' };
  }

  portfolio.cash = Number((portfolio.cash - totalCost).toFixed(2));
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
    message: `${shares} adet ${signal.displayTicker} (${signal.market}) ${currSign}${signal.suggestedEntry.toFixed(2)} fiyattan alındı (Stop: ${currSign}${signal.stopLoss}, TP1: ${currSign}${signal.target1}, TP2: ${currSign}${signal.target2}).`
  };
}

export function updateMarketPositionsWithQuotes(
  currentPortfolio: MarketPortfolio,
  quotesMap: Map<string, number>
): { portfolio: MarketPortfolio; events: string[] } {
  const portfolio = JSON.parse(JSON.stringify(currentPortfolio)) as MarketPortfolio;
  const events: string[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  const stillOpen: TradePosition[] = [];

  for (const pos of portfolio.positions) {
    if (pos.status !== 'OPEN') continue;

    const currentPrice = quotesMap.get(pos.ticker) || pos.currentPrice;
    pos.currentPrice = currentPrice;
    pos.highestPriceSinceEntry = Math.max(pos.highestPriceSinceEntry, currentPrice);
    pos.lowestPriceSinceEntry = Math.min(pos.lowestPriceSinceEntry, currentPrice);

    const currSign = portfolio.currencySymbol;

    // 1. Partial Take Profit (TP1 Hit -> Take 50% profit & Move Stop to Entry Price / Breakeven)
    if (portfolio.usePartialTakeProfit && !pos.tp1Hit && currentPrice >= pos.target1) {
      pos.tp1Hit = true;
      pos.isBreakeven = true;
      pos.stopLoss = pos.entryPrice; // Stop to Breakeven!

      const sharesToSell = Math.ceil(pos.shares / 2);
      if (sharesToSell > 0 && pos.shares > sharesToSell) {
        const partialProfit = Number(((pos.target1 - pos.entryPrice) * sharesToSell).toFixed(2));
        pos.shares -= sharesToSell;
        pos.realizedPnL = Number((pos.realizedPnL + partialProfit).toFixed(2));
        portfolio.cash = Number((portfolio.cash + sharesToSell * pos.target1).toFixed(2));
        events.push(`🎯 ${pos.displayTicker} TP1 seviyesine (${currSign}${pos.target1}) ulaştı! %50 kâr realize edildi (+${currSign}${partialProfit}), Stop Maliyete (${currSign}${pos.entryPrice}) çekilerek kilitlendi.`);
      }
    }

    // 2. Trailing Stop after TP1 (Keep moving stop higher as price climbs)
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

    // 3. Stop-Loss Trigger
    if (currentPrice <= pos.stopLoss) {
      shouldClose = true;
      exitPrice = pos.stopLoss;
      if (pos.isBreakeven) {
        exitStatus = 'CLOSED_BREAKEVEN';
        exitReason = `Kalan %50 pozisyon Başa-Baş Stop seviyesinde (${currSign}${pos.stopLoss}) sıfır riskle kapatıldı. (TP1 kârı korundu)`;
        events.push(`🛡️ ${pos.displayTicker} Başa-baş seviyesinde kapatıldı. Kâr korundu!`);
      } else {
        exitStatus = 'CLOSED_SL';
        exitReason = `Stop-Loss (${currSign}${pos.stopLoss}) tetiklendi.`;
        events.push(`🛑 ${pos.displayTicker} Stop-Loss seviyesine (${currSign}${pos.stopLoss}) ulaştı ve kapatıldı. Sonuç: %${pos.unrealizedPnLPct}`);
      }
    }
    // 4. Take-Profit 2 (Full Target Reached)
    else if (currentPrice >= pos.target2) {
      shouldClose = true;
      exitStatus = 'CLOSED_TP2';
      exitPrice = pos.target2;
      exitReason = `Ana Kâr Hedefi (${currSign}${pos.target2}) gerçekleşti!`;
      events.push(`🚀 ${pos.displayTicker} Ana Kâr Hedefine (${currSign}${pos.target2}) ulaştı! Kâr: +%${pos.unrealizedPnLPct}`);
    }
    // 5. Max Holding Period Expiration (14 Days)
    else if (pos.daysHeld >= pos.maxHoldingDays) {
      shouldClose = true;
      exitStatus = 'CLOSED_EXPIRED';
      exitPrice = currentPrice;
      exitReason = `${pos.maxHoldingDays} günlük maksimum vade süresi doldu.`;
      events.push(`⏳ ${pos.displayTicker} için ${pos.maxHoldingDays} günlük tutma süresi doldu ve piyasa fiyatından kapatıldı.`);
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

      portfolio.cash = Number((portfolio.cash + pos.shares * exitPrice).toFixed(2));
      portfolio.history.unshift(pos);
    } else {
      stillOpen.push(pos);
    }
  }

  portfolio.positions = stillOpen;
  recalculateMarketPortfolio(portfolio);

  return { portfolio, events };
}

export function manuallyClosePositionInMarket(
  currentPortfolio: MarketPortfolio,
  positionId: string
): { portfolio: MarketPortfolio; success: boolean; message: string } {
  const portfolio = JSON.parse(JSON.stringify(currentPortfolio)) as MarketPortfolio;
  const index = portfolio.positions.findIndex(p => p.id === positionId && p.status === 'OPEN');

  if (index === -1) {
    return { portfolio: currentPortfolio, success: false, message: 'Açık pozisyon bulunamadı.' };
  }

  const pos = portfolio.positions[index];
  const exitPrice = pos.currentPrice;
  const currSign = portfolio.currencySymbol;

  pos.status = 'CLOSED_MANUAL';
  pos.exitDate = new Date().toISOString().split('T')[0];
  pos.exitPrice = exitPrice;
  pos.exitReason = 'Kullanıcı tarafından manuel olarak kapatıldı.';
  const finalLegPnL = Number(((exitPrice - pos.entryPrice) * pos.shares).toFixed(2));
  pos.realizedPnL = Number((pos.realizedPnL + finalLegPnL).toFixed(2));
  pos.realizedPnLPct = Number((((pos.realizedPnL) / (pos.entryPrice * pos.initialShares)) * 100).toFixed(2));
  pos.unrealizedPnL = 0;
  pos.unrealizedPnLPct = 0;

  portfolio.cash = Number((portfolio.cash + pos.shares * exitPrice).toFixed(2));
  portfolio.positions.splice(index, 1);
  portfolio.history.unshift(pos);

  recalculateMarketPortfolio(portfolio);

  return {
    portfolio,
    success: true,
    message: `${pos.displayTicker} pozisyonu ${currSign}${exitPrice.toFixed(2)} fiyattan kapatıldı.`
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

  let totalRealized = 0;
  let wins = 0;
  let losses = 0;
  let totalWinAmount = 0;
  let totalLossAmount = 0;

  for (const trade of portfolio.history) {
    totalRealized += trade.realizedPnL;
    if (trade.realizedPnL > 0) {
      wins++;
      totalWinAmount += trade.realizedPnL;
    } else if (trade.realizedPnL < 0) {
      losses++;
      totalLossAmount += Math.abs(trade.realizedPnL);
    }
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
