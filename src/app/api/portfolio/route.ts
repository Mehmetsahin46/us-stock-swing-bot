import { NextRequest, NextResponse } from 'next/server';
import { getDualPortfolioState, saveDualPortfolioState } from '@/lib/serverStore';
import { DualPortfolioState } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const state = getDualPortfolioState();
  return NextResponse.json({ success: true, state });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentState = getDualPortfolioState();

    if (body.action === 'RESET_MARKET' && (body.market === 'BIST' || body.market === 'US')) {
      const today = new Date().toISOString().split('T')[0];
      if (body.market === 'BIST') {
        currentState.bist = {
          market: 'BIST',
          currency: 'TRY',
          currencySymbol: '₺',
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
          riskPerTradePct: 2.0,
          maxOpenPositions: 5,
          maxHoldingDays: 14,
          autoTrade: true,
          positions: [],
          history: [],
          equityCurve: [{ date: today, equity: 10000 }]
        };
      } else {
        currentState.us = {
          market: 'US',
          currency: 'USD',
          currencySymbol: '$',
          initialBalance: 500,
          cash: 500,
          totalEquity: 500,
          realizedPnL: 0,
          unrealizedPnL: 0,
          winRate: 0,
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          profitFactor: 0,
          riskPerTradePct: 2.0,
          maxOpenPositions: 4,
          maxHoldingDays: 14,
          autoTrade: true,
          positions: [],
          history: [],
          equityCurve: [{ date: today, equity: 500 }]
        };
      }
      saveDualPortfolioState(currentState);
      return NextResponse.json({ success: true, state: currentState });
    }

    if (body.state) {
      saveDualPortfolioState(body.state as DualPortfolioState);
      return NextResponse.json({ success: true, state: body.state });
    }

    return NextResponse.json({ success: false, error: 'Geçersiz istek.' }, { status: 400 });
  } catch (err) {
    console.error('Portfolio API error:', err);
    return NextResponse.json({ success: false, error: 'Portföy güncellenemedi.' }, { status: 500 });
  }
}
