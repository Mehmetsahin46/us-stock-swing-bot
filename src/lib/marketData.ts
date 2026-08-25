import { Candle, StockScanResult, TechnicalIndicators } from './types';
import { evaluateSignal } from './strategyEngine';

export const STOCK_UNIVERSE = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.' },
  { ticker: 'META', name: 'Meta Platforms, Inc.' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'AMD', name: 'Advanced Micro Devices' },
  { ticker: 'AVGO', name: 'Broadcom Inc.' },
  { ticker: 'NFLX', name: 'Netflix, Inc.' },
  { ticker: 'PLTR', name: 'Palantir Technologies' },
  { ticker: 'COIN', name: 'Coinbase Global, Inc.' },
  { ticker: 'ARM', name: 'Arm Holdings plc' },
  { ticker: 'SMCI', name: 'Super Micro Computer' },
  { ticker: 'HOOD', name: 'Robinhood Markets' },
  { ticker: 'UBER', name: 'Uber Technologies' },
  { ticker: 'CRWD', name: 'CrowdStrike Holdings' },
  { ticker: 'PANW', name: 'Palo Alto Networks' },
  { ticker: 'MSTR', name: 'MicroStrategy Inc.' },
  { ticker: 'SHOP', name: 'Shopify Inc.' },
  { ticker: 'MU', name: 'Micron Technology' },
  { ticker: 'INTC', name: 'Intel Corporation' },
  { ticker: 'SOFI', name: 'SoFi Technologies' },
  { ticker: 'MARA', name: 'MARA Holdings, Inc.' },
  { ticker: 'DKNG', name: 'DraftKings Inc.' },
  { ticker: 'APP', name: 'AppLovin Corporation' },
  { ticker: 'AFRM', name: 'Affirm Holdings' },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust' },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF' },
  { ticker: 'IWM', name: 'iShares Russell 2000' }
];

export async function fetchStockCandles(ticker: string, range: string = '6mo'): Promise<Candle[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=${range}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 300 } // cache for 5 minutes
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${ticker}: status ${res.status}`);
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      return [];
    }

    const timestamps: number[] = result.timestamp;
    const quote = result.indicators.quote[0];
    const opens = quote.open || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const closes = quote.close || [];
    const volumes = quote.volume || [];

    const candles: Candle[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (
        closes[i] !== null &&
        opens[i] !== null &&
        highs[i] !== null &&
        lows[i] !== null &&
        !isNaN(closes[i])
      ) {
        const dateStr = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
        candles.push({
          date: dateStr,
          open: Number(opens[i].toFixed(2)),
          high: Number(highs[i].toFixed(2)),
          low: Number(lows[i].toFixed(2)),
          close: Number(closes[i].toFixed(2)),
          volume: Number(volumes[i] || 0)
        });
      }
    }

    return candles;
  } catch (error) {
    console.error(`Error fetching candles for ${ticker}:`, error);
    return [];
  }
}

export function calculateEMA(data: number[], period: number): number[] {
  if (data.length === 0) return [];
  const k = 2 / (period + 1);
  const emaArray: number[] = new Array(data.length);
  
  // Seed with SMA
  let initialSum = 0;
  const seedPeriod = Math.min(period, data.length);
  for (let i = 0; i < seedPeriod; i++) {
    initialSum += data[i];
  }
  let prevEMA = initialSum / seedPeriod;
  emaArray[seedPeriod - 1] = prevEMA;

  for (let i = seedPeriod; i < data.length; i++) {
    prevEMA = data[i] * k + prevEMA * (1 - k);
    emaArray[i] = prevEMA;
  }

  return emaArray;
}

export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      gains += diff;
    } else {
      losses -= diff;
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - (100 / (1 + rs))).toFixed(1));
}

export function calculateATR(candles: Candle[], period: number = 14): number {
  if (candles.length < 2) return 0;
  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  const recentTRs = trueRanges.slice(-period);
  const sum = recentTRs.reduce((acc, val) => acc + val, 0);
  return Number((sum / recentTRs.length).toFixed(2));
}

export function calculateTechnicals(candles: Candle[]): TechnicalIndicators | null {
  if (candles.length < 50) return null;

  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume);
  const len = candles.length;
  const latestCandle = candles[len - 1];
  const prevCandle = candles[len - 2];

  const price = latestCandle.close;
  const change = Number((price - prevCandle.close).toFixed(2));
  const changePercent = Number(((change / prevCandle.close) * 100).toFixed(2));

  const ema9Series = calculateEMA(closes, 9);
  const ema20Series = calculateEMA(closes, 20);
  const ema50Series = calculateEMA(closes, 50);
  const ema200Series = calculateEMA(closes, 200);

  const ema9 = Number(ema9Series[len - 1]?.toFixed(2) || price);
  const ema20 = Number(ema20Series[len - 1]?.toFixed(2) || price);
  const ema50 = Number(ema50Series[len - 1]?.toFixed(2) || price);
  const ema200 = Number((ema200Series[len - 1] || ema50Series[len - 1])?.toFixed(2) || price);

  const rsi14 = calculateRSI(closes, 14);
  const atr14 = calculateATR(candles, 14);
  const atrPercent = Number(((atr14 / price) * 100).toFixed(2));

  // 20-day Volume Average
  const recentVols = volumes.slice(-21, -1);
  const avgVolume20 = Math.round(
    recentVols.reduce((sum, v) => sum + v, 0) / Math.max(recentVols.length, 1)
  );
  const rvol = avgVolume20 > 0 ? Number((latestCandle.volume / avgVolume20).toFixed(2)) : 1.0;

  // 20-day High/Low
  const recentHighs = candles.slice(-21, -1).map(c => c.high);
  const recentLows = candles.slice(-21, -1).map(c => c.low);
  const high20 = Number(Math.max(...recentHighs).toFixed(2));
  const low20 = Number(Math.min(...recentLows).toFixed(2));

  return {
    price,
    change,
    changePercent,
    volume: latestCandle.volume,
    avgVolume20,
    rvol,
    ema9,
    ema20,
    ema50,
    ema200,
    rsi14,
    atr14,
    atrPercent,
    high20,
    low20
  };
}

export async function scanUniverse(): Promise<StockScanResult[]> {
  const results: StockScanResult[] = [];

  // Batch process universe with parallel chunks to avoid throttling
  const chunkSize = 6;
  for (let i = 0; i < STOCK_UNIVERSE.length; i += chunkSize) {
    const chunk = STOCK_UNIVERSE.slice(i, i + chunkSize);
    const promises = chunk.map(async (item) => {
      const candles = await fetchStockCandles(item.ticker, '6mo');
      const technicals = calculateTechnicals(candles);
      if (!technicals) return null;

      const signal = evaluateSignal(item.ticker, technicals, candles);
      return {
        ticker: item.ticker,
        name: item.name,
        technicals,
        signal
      };
    });

    const chunkResults = await Promise.all(promises);
    for (const res of chunkResults) {
      if (res) results.push(res);
    }
  }

  return results;
}
