import { NextRequest, NextResponse } from 'next/server';
import { runBacktest } from '@/lib/backtester';
import { BacktestParams } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params: BacktestParams = {
      periodMonths: Number(body.periodMonths) || 6,
      initialBalance: Number(body.initialBalance) || 10000,
      riskPerTradePct: Number(body.riskPerTradePct) || 2.0,
      maxHoldingDays: Number(body.maxHoldingDays) || 14,
      tickers: body.tickers || [],
      strategies: body.strategies || []
    };

    const result = await runBacktest(params);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Backtest API error:', error);
    return NextResponse.json({ success: false, error: 'Backtest simülasyonu çalıştırılamadı.' }, { status: 500 });
  }
}
