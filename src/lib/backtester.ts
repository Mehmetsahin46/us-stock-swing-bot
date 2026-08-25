import { Candle, BacktestParams, BacktestResult, TradePosition } from './types';
import { fetchStockCandles, calculateTechnicals, STOCK_UNIVERSE } from './marketData';
import { evaluateSignal } from './strategyEngine';

export async function runBacktest(params: BacktestParams): Promise<BacktestResult> {
  const { periodMonths = 6, initialBalance = 10000, riskPerTradePct = 2.0, maxHoldingDays = 14 } = params;

  let cash = initialBalance;
  let totalEquity = initialBalance;
  const closedTrades: TradePosition[] = [];
  const openPositions: (TradePosition & { entryIndex: number })[] = [];
  const equityCurve: { date: string; equity: number }[] = [];

  // Fetch candle data for tickers
  const tickerList = params.tickers && params.tickers.length > 0
    ? params.tickers
    : STOCK_UNIVERSE.slice(0, 15).map(s => s.ticker);

  const rangeStr = periodMonths <= 3 ? '3mo' : periodMonths <= 6 ? '6mo' : '1y';
  const tickerCandlesMap = new Map<string, Candle[]>();

  for (const ticker of tickerList) {
    const candles = await fetchStockCandles(ticker, rangeStr);
    if (candles.length > 60) {
      tickerCandlesMap.set(ticker, candles);
    }
  }

  // Find timeline dates from largest candle set
  let allDates: string[] = [];
  for (const candles of tickerCandlesMap.values()) {
    const dates = candles.map(c => c.date);
    if (dates.length > allDates.length) {
      allDates = dates;
    }
  }

  // Simulation starts after index 50 to have enough data for EMA50/RSI14
  const startIndex = 50;

  for (let d = startIndex; d < allDates.length; d++) {
    const currentDate = allDates[d];

    // 1. Update existing open positions
    const activePositions: typeof openPositions = [];
    for (const pos of openPositions) {
      const candles = tickerCandlesMap.get(pos.ticker);
      if (!candles) continue;

      const candle = candles.find(c => c.date === currentDate);
      if (!candle) {
        activePositions.push(pos);
        continue;
      }

      pos.daysHeld += 1;
      pos.currentPrice = candle.close;
      pos.highestPriceSinceEntry = Math.max(pos.highestPriceSinceEntry, candle.high);
      pos.lowestPriceSinceEntry = Math.min(pos.lowestPriceSinceEntry, candle.low);

      let closed = false;
      let exitPrice = candle.close;
      let exitReason = '';
      let status: TradePosition['status'] = 'OPEN';

      // Check Stop-Loss
      if (candle.low <= pos.stopLoss) {
        closed = true;
        exitPrice = pos.stopLoss;
        status = 'CLOSED_SL';
        exitReason = 'Stop-Loss tetiklendi';
      }
      // Check Target 2
      else if (candle.high >= pos.target2) {
        closed = true;
        exitPrice = pos.target2;
        status = 'CLOSED_TP2';
        exitReason = 'Hedef 2 (TP2) alındı';
      }
      // Check Max holding period (14 days)
      else if (pos.daysHeld >= maxHoldingDays) {
        closed = true;
        exitPrice = candle.close;
        status = 'CLOSED_EXPIRED';
        exitReason = '14 Günlük Vade Doldu';
      }

      if (closed) {
        pos.status = status;
        pos.exitDate = currentDate;
        pos.exitPrice = exitPrice;
        pos.exitReason = exitReason;
        pos.realizedPnL = Number(((exitPrice - pos.entryPrice) * pos.shares).toFixed(2));
        pos.realizedPnLPct = Number((((exitPrice - pos.entryPrice) / pos.entryPrice) * 100).toFixed(2));
        cash += pos.shares * exitPrice;
        closedTrades.unshift(pos);
      } else {
        activePositions.push(pos);
      }
    }

    openPositions.length = 0;
    openPositions.push(...activePositions);

    // 2. Scan for new entries on current day (max 4 open positions in backtest)
    if (openPositions.length < 4) {
      for (const [ticker, candles] of tickerCandlesMap.entries()) {
        if (openPositions.some(p => p.ticker === ticker)) continue;

        const candleIndex = candles.findIndex(c => c.date === currentDate);
        if (candleIndex < startIndex) continue;

        const historicalSlice = candles.slice(0, candleIndex + 1);
        const technicals = calculateTechnicals(historicalSlice);
        if (!technicals) continue;

        const signal = evaluateSignal(ticker, technicals, historicalSlice);
        if (signal && (params.strategies.length === 0 || params.strategies.includes(signal.strategy))) {
          const riskAmount = totalEquity * (riskPerTradePct / 100);
          const riskPerShare = Math.max(0.1, signal.suggestedEntry - signal.stopLoss);
          let shares = Math.floor(riskAmount / riskPerShare);
          if (shares * signal.suggestedEntry > cash) {
            shares = Math.floor(cash / signal.suggestedEntry);
          }

          if (shares > 0 && cash >= shares * signal.suggestedEntry) {
            const cost = shares * signal.suggestedEntry;
            cash -= cost;

            openPositions.push({
              id: `bt_${ticker}_${currentDate}`,
              ticker,
              strategy: signal.strategy,
              strategyName: signal.strategyName,
              entryDate: currentDate,
              entryPrice: signal.suggestedEntry,
              shares,
              totalCost: cost,
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
              maxHoldingDays,
              entryIndex: candleIndex
            });

            if (openPositions.length >= 4) break;
          }
        }
      }
    }

    // Calculate daily total equity
    let openValue = 0;
    for (const p of openPositions) {
      openValue += p.shares * p.currentPrice;
    }
    totalEquity = Number((cash + openValue).toFixed(2));
    equityCurve.push({ date: currentDate, equity: totalEquity });
  }

  // Summary statistics
  const totalTrades = closedTrades.length;
  const winningTrades = closedTrades.filter(t => t.realizedPnL > 0);
  const losingTrades = closedTrades.filter(t => t.realizedPnL <= 0);
  const winRate = totalTrades > 0 ? Number(((winningTrades.length / totalTrades) * 100).toFixed(1)) : 0;

  const totalWinAmount = winningTrades.reduce((sum, t) => sum + t.realizedPnL, 0);
  const totalLossAmount = losingTrades.reduce((sum, t) => sum + Math.abs(t.realizedPnL), 0);
  const profitFactor = totalLossAmount > 0 ? Number((totalWinAmount / totalLossAmount).toFixed(2)) : totalWinAmount > 0 ? 99 : 0;

  const totalReturnPct = Number((((totalEquity - initialBalance) / initialBalance) * 100).toFixed(2));

  // Max Drawdown calculation
  let peak = initialBalance;
  let maxDD = 0;
  for (const point of equityCurve) {
    if (point.equity > peak) peak = point.equity;
    const dd = ((peak - point.equity) / peak) * 100;
    if (dd > maxDD) maxDD = dd;
  }

  const avgTradeDays = totalTrades > 0
    ? Number((closedTrades.reduce((sum, t) => sum + t.daysHeld, 0) / totalTrades).toFixed(1))
    : 0;

  const avgGainPct = winningTrades.length > 0
    ? Number((winningTrades.reduce((sum, t) => sum + t.realizedPnLPct, 0) / winningTrades.length).toFixed(2))
    : 0;

  const avgLossPct = losingTrades.length > 0
    ? Number((losingTrades.reduce((sum, t) => sum + t.realizedPnLPct, 0) / losingTrades.length).toFixed(2))
    : 0;

  return {
    summary: {
      period: `Son ${periodMonths} Ay`,
      initialCapital: initialBalance,
      finalCapital: totalEquity,
      totalReturnPct,
      totalTrades,
      winRate,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      profitFactor,
      maxDrawdownPct: Number(maxDD.toFixed(2)),
      avgTradeDays,
      avgGainPct,
      avgLossPct
    },
    equityCurve,
    trades: closedTrades
  };
}
