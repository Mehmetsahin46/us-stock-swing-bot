import { NextRequest, NextResponse } from 'next/server';
import { fetchStockCandles, UniverseItem } from '@/lib/marketData';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let memoryCustomStocks: UniverseItem[] = [];

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('portfolio_state')
        .select('state')
        .eq('id', 'custom_stocks')
        .single();
      if (data && data.state && Array.isArray(data.state)) {
        return NextResponse.json({ success: true, data: data.state });
      }
    } catch (e) {}
  }
  return NextResponse.json({ success: true, data: memoryCustomStocks });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let symbol = (body.symbol || '').trim().toUpperCase();
    const market = (body.market || 'BIST').toUpperCase() as 'BIST' | 'US';

    if (!symbol || symbol.length < 1 || symbol.length > 12) {
      return NextResponse.json({
        success: false,
        error: 'Lütfen geçerli bir hisse sembolü giriniz (örn: THYAO, PETKM, PLTR, NVDA).'
      }, { status: 400 });
    }

    // Standardize symbol ticker format
    let ticker = symbol;
    let displayTicker = symbol;

    if (market === 'BIST') {
      if (!ticker.endsWith('.IS')) {
        ticker = `${ticker}.IS`;
      }
      displayTicker = ticker.replace('.IS', '');
    } else {
      ticker = ticker.replace('.IS', '');
      displayTicker = ticker;
    }

    // 1. Validate with real Yahoo Finance Market Data
    console.log(`[CustomStock] Validating ticker: ${ticker} (${market})...`);
    const candles = await fetchStockCandles(ticker);

    if (!candles || candles.length < 20) {
      return NextResponse.json({
        success: false,
        error: `"${displayTicker}" için piyasada geçerli veri bulunamadı. Lütfen sembolün doğruluğunu kontrol edin (BIST hisseleri için örn: THYAO, ASELS / ABD için örn: NVDA, TSLA).`
      }, { status: 400 });
    }

    const latest = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    const price = latest.close;
    const changePct = prev ? +(((latest.close - prev.close) / prev.close) * 100).toFixed(2) : 0;

    const newItem: UniverseItem = {
      ticker,
      displayTicker,
      name: `${displayTicker} (${market === 'BIST' ? 'BIST Özel' : 'US Custom'})`,
      sector: market === 'BIST' ? 'Industrial' : 'Technology',
      market,
      currency: market === 'BIST' ? 'TRY' : 'USD'
    };

    // 2. Fetch existing custom stocks
    let customList: UniverseItem[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('portfolio_state')
          .select('state')
          .eq('id', 'custom_stocks')
          .single();
        if (data && data.state && Array.isArray(data.state)) {
          customList = data.state;
        }
      } catch (e) {}
    } else {
      customList = memoryCustomStocks;
    }

    // Check if already exists
    if (!customList.some(item => item.ticker === ticker)) {
      customList.push(newItem);
    }

    // 3. Save
    memoryCustomStocks = customList;
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('portfolio_state')
          .upsert({
            id: 'custom_stocks',
            state: customList,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
      } catch (e) {
        console.error('Failed to save custom stocks to supabase:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `✅ "${displayTicker}" başarıyla doğrulandı ve takip listesine eklendi!`,
      data: {
        item: newItem,
        price,
        changePct,
        candlesCount: candles.length
      }
    });

  } catch (err: any) {
    console.error('Custom stock validation error:', err);
    return NextResponse.json({
      success: false,
      error: 'Doğrulama servisi geçici olarak yanıt veremedi. Lütfen tekrar deneyin.'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    if (!ticker) {
      return NextResponse.json({ success: false, error: 'Ticker parametresi gerekli' }, { status: 400 });
    }

    let customList: UniverseItem[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('portfolio_state')
          .select('state')
          .eq('id', 'custom_stocks')
          .single();
        if (data && data.state && Array.isArray(data.state)) {
          customList = data.state;
        }
      } catch (e) {}
    } else {
      customList = memoryCustomStocks;
    }

    customList = customList.filter(item => item.ticker !== ticker);
    memoryCustomStocks = customList;

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('portfolio_state')
        .upsert({
          id: 'custom_stocks',
          state: customList,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    }

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Silme işlemi gerçekleştirilemedi.' }, { status: 500 });
  }
}