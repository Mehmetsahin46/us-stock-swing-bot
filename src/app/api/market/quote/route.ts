import { NextRequest, NextResponse } from 'next/server';
import { fetchStockCandles, calculateTechnicals, COMBINED_UNIVERSE } from '@/lib/marketData';
import { evaluateSignal } from '@/lib/strategyEngine';
import { MarketType, CurrencyType, SectorType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = (searchParams.get('ticker') || '').toUpperCase().trim();
  const range = searchParams.get('range') || '6mo';

  if (!ticker) {
    return NextResponse.json({ success: false, error: 'Ticker belirtilmedi.' }, { status: 400 });
  }

  try {
    const isBist = ticker.endsWith('.IS');
    const displayTicker = isBist ? ticker.replace('.IS', '') : ticker;
    const market: MarketType = isBist ? 'BIST' : 'US';
    const currency: CurrencyType = isBist ? 'TRY' : 'USD';

    const match = COMBINED_UNIVERSE.find(u => u.ticker === ticker);
    const sector: SectorType = match ? match.sector : 'Technology';

    const candles = await fetchStockCandles(ticker, range);
    if (candles.length === 0) {
      return NextResponse.json({ success: false, error: `${ticker} için veri bulunamadı.` }, { status: 404 });
    }

    const technicals = calculateTechnicals(candles);
    const signal = technicals ? evaluateSignal(ticker, displayTicker, sector, market, currency, technicals, candles) : null;

    return NextResponse.json({
      success: true,
      ticker,
      displayTicker,
      sector,
      market,
      currency,
      candles,
      technicals,
      signal
    });
  } catch (error) {
    console.error(`Quote error for ${ticker}:`, error);
    return NextResponse.json({ success: false, error: 'Veri çekilirken hata oluştu.' }, { status: 500 });
  }
}
