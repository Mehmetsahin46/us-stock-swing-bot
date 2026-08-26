import { NextRequest, NextResponse } from 'next/server';
import { getDualPortfolioState, saveDualPortfolioState } from '@/lib/supabaseStore';
import { INITIAL_BIST_PORTFOLIO, INITIAL_US_PORTFOLIO } from '@/lib/constants';
import { mergeDualStates } from '@/lib/stateSync';
import { DualPortfolioState } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const state = await getDualPortfolioState();
  return NextResponse.json({ success: true, state });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentState = await getDualPortfolioState();

    if (body.action === 'RESET_MARKET' && (body.market === 'BIST' || body.market === 'US')) {
      if (body.market === 'BIST') {
        currentState.bist = JSON.parse(JSON.stringify(INITIAL_BIST_PORTFOLIO));
      } else {
        currentState.us = JSON.parse(JSON.stringify(INITIAL_US_PORTFOLIO));
      }
      await saveDualPortfolioState(currentState);
      return NextResponse.json({ success: true, state: currentState });
    }

    if (body.state) {
      await saveDualPortfolioState(body.state as DualPortfolioState);
      return NextResponse.json({ success: true, state: body.state });
    }

    return NextResponse.json({ success: false, error: 'Gecersiz istek.' }, { status: 400 });
  } catch (err) {
    console.error('Portfolio API error:', err);
    return NextResponse.json({ success: false, error: 'Portfolyo guncellenemedi.' }, { status: 500 });
  }
}