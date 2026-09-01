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

  // 1. Circuit Breaker Guard: If daily drawdown > 2.5%, freeze new buys
  if (portfolio.unrealizedPnL < 0 && Math.abs(portfolio.unrealizedPnL) > portfolio.totalEquity * 0.025) {
    return { portfolio, success: false, message: `⚠️ Devre Kesici Aktif: Günlük portföy riski %2.5 limitini aştığı için yeni alımlar donduruldu.` };
  }

  // 2. Sector Concentration Guard: Max 3 stocks per sector
  const sectorCount = portfolio.positions.filter(p => p.sector === signal.sector).length;
  if (sectorCount >= 3) {
    return { portfolio, success: false, message: `Sektörel risk limiti: "${signal.sector}" sektöründen en fazla 3 hisseye izin verilir.` };
  }

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

  // 🛡️ 1. MİNİMUM %25 NAKİT REZERVİ KALKANI (Cash Buffer Protection)
  // Portföyün en az %25'i nakitte tutulur, tüm bakiye hisseye/coine bağlanamaz!
  const minReserve = portfolio.totalEquity * 0.25;
  const availableCash = portfolio.cash - minReserve;

  if (availableCash <= 0) {
    return { 
      portfolio: currentPortfolio, 
      success: false, 
      message: `⚠️ Nakit Rezervi Kalkanı Devrede: Portföyün %25'i (en az ${portfolio.currencySymbol}${minReserve.toFixed(2)}) nakit olarak korunuyor. Yeni işlem açılamaz.` 
    };
  }

  // 🎯 2. DENGELİ POZİSYON BOYUTLANDIRMASI & KALDIRAÇ (Leverage Multiplier)
  // Kriptoda kaldıraç oranları:
  // - Skor >= 90: 5x Kaldıraç (A+ Elit Sinyal)
  // - Skor >= 80: 3x Kaldıraç (A Güçlü Sinyal)
  // - Standart:    2x Kaldıraç
  const isCrypto = signal.market === 'CRYPTO';
  const leverage = isCrypto 
    ? (signal.leverage || (signal.score >= 90 ? 5 : signal.score >= 80 ? 3 : 2))
    : 1;

  let capitalRatio = 0.06;
  if (isCrypto) {
    // 100 USDT bütçede tek işleme %15 teminat (15 USDT margin)
    capitalRatio = 0.15;
  } else if (signal.score >= 90) {
    capitalRatio = 0.10; // A+ hisse için max %10
  } else if (signal.score >= 80) {
    capitalRatio = 0.08; // A hisse için max %8
  }

  const targetMargin = Math.min(availableCash, portfolio.totalEquity * capitalRatio);
  const targetNotional = targetMargin * leverage;
  
  let shares = 0;
  let totalCost = 0;
  let marginUsed = targetMargin;
  let liquidationPrice: number | undefined = undefined;

  if (isCrypto) {
    // Kripto için kesirli coin alımı (örn: 0.005 BTC, 0.45 SOL)
    shares = Number((targetNotional / signal.suggestedEntry).toFixed(4));
    totalCost = Number((shares * signal.suggestedEntry).toFixed(2));
    marginUsed = Number((totalCost / leverage).toFixed(2));

    if (marginUsed > availableCash) {
      marginUsed = availableCash;
      const adjustedNotional = marginUsed * leverage;
      shares = Number((adjustedNotional / signal.suggestedEntry).toFixed(4));
      totalCost = Number((shares * signal.suggestedEntry).toFixed(2));
    }

    // Likidasyon Fiyatı (%90 teminat kaybında likidasyon)
    liquidationPrice = Number((signal.suggestedEntry * (1 - (0.9 / leverage))).toFixed(4));
  } else {
    // BIST ve ABD Hisseleri için tam adet
    const sharesFromCap = Math.floor(targetMargin / signal.suggestedEntry);
    shares = sharesFromCap > 0 ? sharesFromCap : 1;
    totalCost = Number((shares * signal.suggestedEntry).toFixed(2));
    marginUsed = totalCost;

    if (totalCost > availableCash) {
      shares = Math.floor(availableCash / signal.suggestedEntry);
      totalCost = Number((shares * signal.suggestedEntry).toFixed(2));
      marginUsed = totalCost;
    }
  }

  if (shares <= 0 || marginUsed <= 0) {
    return { portfolio: currentPortfolio, success: false, message: 'Pozisyon açmak için yeterli nakit rezervi yok (En az %25 nakit korunuyor).' };
  }

  // Kasadan sadece kullanılan teminat (margin) düşülür
  portfolio.cash = Math.max(0, Number((portfolio.cash - marginUsed).toFixed(2)));
  const currSign = portfolio.currencySymbol;

  const newPosition: TradePosition = {
    id: `pos_${signal.ticker}_${Date.now()}`,
    ticker: signal.ticker,
    displayTicker: signal.displayTicker,
    sector: signal.sector,
    market: signal.market,
    currency: signal.currency,
    strategy: signal.strategy,
    strategyName: isCrypto ? `${signal.strategyName} (${leverage}x Kaldıraç)` : signal.strategyName,
    entryDate: new Date().toISOString().split('T')[0],
    entryPrice: signal.suggestedEntry,
    initialShares: shares,
    shares,
    totalCost: Number(totalCost.toFixed(2)),
    marginUsed: Number(marginUsed.toFixed(2)),
    leverage: isCrypto ? leverage : undefined,
    liquidationPrice: isCrypto ? liquidationPrice : undefined,
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
    maxHoldingDays: portfolio.maxHoldingDays,
    estimatedDays: signal.estimatedDays,
    estimatedTimeframe: signal.estimatedTimeframe
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

    // 🛡️ DİNAMİK KÂR TAKİP EDEN STOP (Dynamic Trailing Stop)
    if (portfolio.useBreakevenTrailing) {
      if (pos.highestPriceSinceEntry >= pos.entryPrice * 1.03) {
        pos.isBreakeven = true;
        pos.stopLoss = Math.max(pos.stopLoss, pos.entryPrice);
      }
      if (pos.highestPriceSinceEntry >= pos.entryPrice * 1.05) {
        const dynamicTrailingStop = Number((pos.highestPriceSinceEntry * 0.975).toFixed(2));
        if (dynamicTrailingStop > pos.stopLoss) {
          pos.stopLoss = dynamicTrailingStop;
        }
      }
    }

    const lev = pos.leverage || 1;
    pos.unrealizedPnL = Number(((currentPrice - pos.entryPrice) * pos.shares).toFixed(2));
    // Kaldıraçlı ROE Getirisi (%)
    pos.unrealizedPnLPct = Number((((currentPrice - pos.entryPrice) / pos.entryPrice) * 100 * lev).toFixed(2));

    let shouldClose = false;
    let exitReason = '';
    let exitStatus: TradePosition['status'] = 'OPEN';
    let exitPrice = currentPrice;

    // 🚨 KRİPTO LİKİDASYON KONTROLÜ (Liquidation Guard)
    if (pos.market === 'CRYPTO' && pos.liquidationPrice && currentPrice <= pos.liquidationPrice) {
      shouldClose = true;
      exitPrice = pos.liquidationPrice;
      exitStatus = 'CLOSED_LIQUIDATED';
      exitReason = `⚠️ LİKİDASYON: Fiyat likidasyon seviyesine (${currSign}${pos.liquidationPrice}) indi, teminat sıfırlandı.`;
      events.push(`💥 LİKİDASYON: ${pos.displayTicker} (${lev}x Kaldıraç) likide oldu.`);
    }

    // 🚀 PUMP YAKALAMA & KÂR KİLİTLEME KALKANI:
    if (!shouldClose && pos.unrealizedPnLPct >= (6.5 * lev) && !pos.tp1Hit) {
      pos.tp1Hit = true;
      pos.isBreakeven = true;
      pos.stopLoss = Number((pos.entryPrice * 1.025).toFixed(2)); // Stop'u %2.5 kâr bölgesine çek
      events.push(`🚀 PUMP KALKANI: ${pos.displayTicker} (${lev}x) ani sıçrama yaptı! Kâr kilitlendi, Stop %2.5 kâra çekildi.`);
    }

    if (!shouldClose && currentPrice <= pos.stopLoss) {
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
    } else if (!shouldClose && currentPrice >= pos.target2) {
      shouldClose = true;
      exitStatus = 'CLOSED_TP2';
      exitPrice = pos.target2;
      exitReason = `Ana Kar Hedefi (${currSign}${pos.target2}) gerceklesti!`;
      events.push(`TP2: ${pos.displayTicker} Ana Kar Hedefine ulasti! +%${pos.unrealizedPnLPct}`);
    } else if (!shouldClose && pos.daysHeld >= pos.maxHoldingDays) {
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

      const finalLegPnL = exitStatus === 'CLOSED_LIQUIDATED' 
        ? -(pos.marginUsed || pos.totalCost)
        : Number(((exitPrice - pos.entryPrice) * pos.shares).toFixed(2));

      pos.realizedPnL = Number((pos.realizedPnL + finalLegPnL).toFixed(2));
      const baseCost = pos.marginUsed || (pos.entryPrice * pos.initialShares);
      pos.realizedPnLPct = Number(((pos.realizedPnL / Math.max(baseCost, 1)) * 100).toFixed(2));
      pos.unrealizedPnL = 0;
      pos.unrealizedPnLPct = 0;

      // Teminat + Kâr/Zarar kasaya geri döner
      const releasedMargin = pos.marginUsed ? pos.marginUsed : (pos.shares * pos.entryPrice);
      portfolio.cash = Math.max(0, Number((portfolio.cash + releasedMargin + finalLegPnL).toFixed(2)));
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
  const baseCost = pos.marginUsed || (pos.entryPrice * pos.initialShares);
  pos.realizedPnLPct = Number(((pos.realizedPnL / Math.max(baseCost, 1)) * 100).toFixed(2));
  pos.unrealizedPnL = 0;
  pos.unrealizedPnLPct = 0;

  const releasedMargin = pos.marginUsed ? pos.marginUsed : (pos.shares * pos.entryPrice);
  portfolio.cash = Math.max(0, Number((portfolio.cash + releasedMargin + finalLegPnL).toFixed(2)));
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
  let openPositionsCapital = 0;
  let totalUnrealized = 0;
  for (const pos of portfolio.positions) {
    if (pos.status === 'OPEN') {
      const positionCapital = pos.marginUsed !== undefined ? pos.marginUsed : (pos.shares * pos.entryPrice);
      openPositionsCapital += positionCapital;
      totalUnrealized += pos.unrealizedPnL;
    }
  }
  portfolio.unrealizedPnL = Number(totalUnrealized.toFixed(2));
  portfolio.totalEquity = Number((portfolio.cash + openPositionsCapital + totalUnrealized).toFixed(2));

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