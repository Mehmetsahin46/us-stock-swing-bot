import { NextRequest, NextResponse } from 'next/server';
import { getDualPortfolioState, saveDualPortfolioState } from '@/lib/serverStore';
import { INITIAL_BIST_PORTFOLIO, INITIAL_US_PORTFOLIO } from '@/lib/constants';
import { mergeDualStates } from '@/lib/stateSync';
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
      if (body.market === 'BIST') {
        currentState.bist = JSON.parse(JSON.stringify(INITIAL_BIST_PORTFOLIO));
      } else {
        currentState.us = JSON.parse(JSON.stringify(INITIAL_US_PORTFOLIO));
      }
      saveDualPortfolioState(currentState);
      return NextResponse.json({ success: true, state: currentState });
    }

    if (body.state) {
      // Intelligently merge client state with server state
      const merged = mergeDualStates(currentState, body.state as DualPortfolioState);
      saveDualPortfolioState(merged);
      return NextResponse.json({ success: true, state: merged });
    }

    return NextResponse.json({ success: false, error: 'Geçersiz istek.' }, { status: 400 });
  } catch (err) {
    console.error('Portfolio API error:', err);
    return NextResponse.json({ success: false, error: 'Portföy güncellenemedi.' }, { status: 500 });
  }
}
