import { Candle, CurrencyType, MarketType, StockScanResult, TechnicalIndicators } from './types';
import { evaluateSignal } from './strategyEngine';

export interface UniverseItem {
  ticker: string;
  displayTicker: string;
  name: string;
  market: MarketType;
  currency: CurrencyType;
}

export const US_UNIVERSE: UniverseItem[] = [
  { ticker: 'NVDA', displayTicker: 'NVDA', name: 'NVIDIA Corporation', market: 'US', currency: 'USD' },
  { ticker: 'TSLA', displayTicker: 'TSLA', name: 'Tesla, Inc.', market: 'US', currency: 'USD' },
  { ticker: 'AAPL', displayTicker: 'AAPL', name: 'Apple Inc.', market: 'US', currency: 'USD' },
  { ticker: 'MSFT', displayTicker: 'MSFT', name: 'Microsoft Corporation', market: 'US', currency: 'USD' },
  { ticker: 'AMZN', displayTicker: 'AMZN', name: 'Amazon.com, Inc.', market: 'US', currency: 'USD' },
  { ticker: 'META', displayTicker: 'META', name: 'Meta Platforms, Inc.', market: 'US', currency: 'USD' },
  { ticker: 'GOOGL', displayTicker: 'GOOGL', name: 'Alphabet Inc.', market: 'US', currency: 'USD' },
  { ticker: 'AMD', displayTicker: 'AMD', name: 'Advanced Micro Devices', market: 'US', currency: 'USD' },
  { ticker: 'AVGO', displayTicker: 'AVGO', name: 'Broadcom Inc.', market: 'US', currency: 'USD' },
  { ticker: 'NFLX', displayTicker: 'NFLX', name: 'Netflix, Inc.', market: 'US', currency: 'USD' },
  { ticker: 'PLTR', displayTicker: 'PLTR', name: 'Palantir Technologies', market: 'US', currency: 'USD' },
  { ticker: 'COIN', displayTicker: 'COIN', name: 'Coinbase Global', market: 'US', currency: 'USD' },
  { ticker: 'ARM', displayTicker: 'ARM', name: 'Arm Holdings plc', market: 'US', currency: 'USD' },
  { ticker: 'SMCI', displayTicker: 'SMCI', name: 'Super Micro Computer', market: 'US', currency: 'USD' },
  { ticker: 'HOOD', displayTicker: 'HOOD', name: 'Robinhood Markets', market: 'US', currency: 'USD' },
  { ticker: 'UBER', displayTicker: 'UBER', name: 'Uber Technologies', market: 'US', currency: 'USD' },
  { ticker: 'MSTR', displayTicker: 'MSTR', name: 'MicroStrategy Inc.', market: 'US', currency: 'USD' },
  { ticker: 'SHOP', displayTicker: 'SHOP', name: 'Shopify Inc.', market: 'US', currency: 'USD' },
  { ticker: 'MU', displayTicker: 'MU', name: 'Micron Technology', market: 'US', currency: 'USD' },
  { ticker: 'SOFI', displayTicker: 'SOFI', name: 'SoFi Technologies', market: 'US', currency: 'USD' },
  { ticker: 'QQQ', displayTicker: 'QQQ', name: 'Invesco QQQ Trust', market: 'US', currency: 'USD' },
  { ticker: 'SPY', displayTicker: 'SPY', name: 'SPDR S&P 500 ETF', market: 'US', currency: 'USD' }
];

export const BIST_UNIVERSE: UniverseItem[] = [
  { ticker: 'THYAO.IS', displayTicker: 'THYAO', name: 'Türk Hava Yolları', market: 'BIST', currency: 'TRY' },
  { ticker: 'ASELS.IS', displayTicker: 'ASELS', name: 'Aselsan Elektronik', market: 'BIST', currency: 'TRY' },
  { ticker: 'GARAN.IS', displayTicker: 'GARAN', name: 'Garanti BBVA', market: 'BIST', currency: 'TRY' },
  { ticker: 'EREGL.IS', displayTicker: 'EREGL', name: 'Ereğli Demir Çelik', market: 'BIST', currency: 'TRY' },
  { ticker: 'TUPRS.IS', displayTicker: 'TUPRS', name: 'Tüpraş Rafinerileri', market: 'BIST', currency: 'TRY' },
  { ticker: 'BIMAS.IS', displayTicker: 'BIMAS', name: 'BİM Birleşik Mağazalar', market: 'BIST', currency: 'TRY' },
  { ticker: 'KCHOL.IS', displayTicker: 'KCHOL', name: 'Koç Holding', market: 'BIST', currency: 'TRY' },
  { ticker: 'AKBNK.IS', displayTicker: 'AKBNK', name: 'Akbank T.A.Ş.', market: 'BIST', currency: 'TRY' },
  { ticker: 'YKBNK.IS', displayTicker: 'YKBNK', name: 'Yapı ve Kredi Bankası', market: 'BIST', currency: 'TRY' },
  { ticker: 'SISE.IS', displayTicker: 'SISE', name: 'Şişecam', market: 'BIST', currency: 'TRY' },
  { ticker: 'PGSUS.IS', displayTicker: 'PGSUS', name: 'Pegasus Hava Taşımacılığı', market: 'BIST', currency: 'TRY' },
  { ticker: 'ENKAI.IS', displayTicker: 'ENKAI', name: 'Enka İnşaat', market: 'BIST', currency: 'TRY' },
  { ticker: 'FROTO.IS', displayTicker: 'FROTO', name: 'Ford Otosan', market: 'BIST', currency: 'TRY' },
  { ticker: 'TOASO.IS', displayTicker: 'TOASO', name: 'Tofaş Türk Otomobil', market: 'BIST', currency: 'TRY' },
  { ticker: 'PETKM.IS', displayTicker: 'PETKM', name: 'Petkim Petrokimya', market: 'BIST', currency: 'TRY' },
  { ticker: 'SAHOL.IS', displayTicker: 'SAHOL', name: 'Sabancı Holding', market: 'BIST', currency: 'TRY' },
  { ticker: 'EKGYO.IS', displayTicker: 'EKGYO', name: 'Emlak Konut GYO', market: 'BIST', currency: 'TRY' },
  { ticker: 'KOZAL.IS', displayTicker: 'KOZAL', name: 'Koza Altın İşletmeleri', market: 'BIST', currency: 'TRY' },
  { ticker: 'TTKOM.IS', displayTicker: 'TTKOM', name: 'Türk Telekom', market: 'BIST', currency: 'TRY' },
  { ticker: 'TCELL.IS', displayTicker: 'TCELL', name: 'Turkcell İletişim', market: 'BIST', currency: 'TRY' },
  { ticker: 'ISCTR.IS', displayTicker: 'ISCTR', name: 'İş Bankası (C)', market: 'BIST', currency: 'TRY' },
  { ticker: 'ASTOR.IS', displayTicker: 'ASTOR', name: 'Astor Enerji', market: 'BIST', currency: 'TRY' },
  { ticker: 'MGROS.IS', displayTicker: 'MGROS', name: 'Migros Ticaret', market: 'BIST', currency: 'TRY' },
  { ticker: 'TAVHL.IS', displayTicker: 'TAVHL', name: 'TAV Havalimanları', market: 'BIST', currency: 'TRY' }
];

export const COMBINED_UNIVERSE = [...US_UNIVERSE, ...BIST_UNIVERSE];

export async function fetchStockCandles(ticker: string, range: string = '6mo'): Promise<Candle[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=${range}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 300 }
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
          open: Number(Number(opens[i]).toFixed(2)),
          high: Number(Number(highs[i]).toFixed(2)),
          low: Number(Number(lows[i]).toFixed(2)),
          close: Number(Number(closes[i]).toFixed(2)),
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
  if (candles.length < 40) return null;

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

  const recentVols = volumes.slice(-21, -1);
  const avgVolume20 = Math.round(
    recentVols.reduce((sum, v) => sum + v, 0) / Math.max(recentVols.length, 1)
  );
  const rvol = avgVolume20 > 0 ? Number((latestCandle.volume / avgVolume20).toFixed(2)) : 1.0;

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

export async function scanUniverse(marketFilter: 'ALL' | 'US' | 'BIST' = 'ALL'): Promise<StockScanResult[]> {
  const targetUniverse = marketFilter === 'US' 
    ? US_UNIVERSE 
    : marketFilter === 'BIST' 
    ? BIST_UNIVERSE 
    : COMBINED_UNIVERSE;

  const results: StockScanResult[] = [];
  const chunkSize = 8;

  for (let i = 0; i < targetUniverse.length; i += chunkSize) {
    const chunk = targetUniverse.slice(i, i + chunkSize);
    const promises = chunk.map(async (item) => {
      const candles = await fetchStockCandles(item.ticker, '6mo');
      const technicals = calculateTechnicals(candles);
      if (!technicals) return null;

      const signal = evaluateSignal(item.ticker, item.displayTicker, item.market, item.currency, technicals, candles);
      return {
        ticker: item.ticker,
        displayTicker: item.displayTicker,
        name: item.name,
        market: item.market,
        currency: item.currency,
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
