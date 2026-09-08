import { NextRequest, NextResponse } from 'next/server';
import { getDualPortfolioState, saveDualPortfolioState } from '@/lib/supabaseStore';
import { INITIAL_BIST_PORTFOLIO, INITIAL_US_PORTFOLIO } from '@/lib/constants';
import { mergeDualStates } from '@/lib/stateSync';
import { DualPortfolioState } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = request.headers.get('x-user-id') || searchParams.get('userId') || 'mehmet.sahin';
  const state = await getDualPortfolioState(userId);
  return NextResponse.json({ success: true, state, userId });
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id') || searchParams.get('userId') || 'mehmet.sahin';
    const body = await request.json();
    const effectiveUser = body.userId || userId || 'mehmet.sahin';
    const currentState = await getDualPortfolioState(effectiveUser);

    if (body.action === 'RESET_MARKET' && (body.market === 'BIST' || body.market === 'US' || body.market === 'CRYPTO')) {
      const { INITIAL_CRYPTO_PORTFOLIO } = await import('@/lib/constants');
      if (body.market === 'BIST') {
        currentState.bist = JSON.parse(JSON.stringify(INITIAL_BIST_PORTFOLIO));
      } else if (body.market === 'CRYPTO') {
        currentState.crypto = JSON.parse(JSON.stringify(INITIAL_CRYPTO_PORTFOLIO));
      } else {
        currentState.us = JSON.parse(JSON.stringify(INITIAL_US_PORTFOLIO));
      }
      await saveDualPortfolioState(currentState, effectiveUser);
      return NextResponse.json({ success: true, state: currentState, userId: effectiveUser });
    }

    if (body.state) {
      await saveDualPortfolioState(body.state as DualPortfolioState, effectiveUser);
      return NextResponse.json({ success: true, state: body.state, userId: effectiveUser });
    }

    return NextResponse.json({ success: false, error: 'Gecersiz istek.' }, { status: 400 });
  } catch (err) {
    console.error('Portfolio API error:', err);
    return NextResponse.json({ success: false, error: 'Portfolyo guncellenemedi.' }, { status: 500 });
  }
}