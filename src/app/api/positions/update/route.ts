import { NextRequest, NextResponse } from 'next/server';
import { getDualPortfolioState, saveDualPortfolioState } from '@/lib/supabaseStore';
import { updatePositionLevels } from '@/lib/portfolioManager';
import { MarketType } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id') || searchParams.get('userId') || 'mehmet.sahin';
    const body = await request.json();
    const { market, positionId, stopLoss, target1, target2 } = body as {
      market: MarketType;
      positionId: string;
      stopLoss?: number;
      target1?: number;
      target2?: number;
    };

    if (!market || !positionId) {
      return NextResponse.json({ success: false, error: 'Eksik parametre.' }, { status: 400 });
    }

    const dualState = await getDualPortfolioState(userId);
    const targetPortfolio = market === 'BIST' ? dualState.bist : market === 'CRYPTO' ? dualState.crypto : dualState.us;

    if (!targetPortfolio) {
      return NextResponse.json({ success: false, error: 'Portföy bulunamadı.' }, { status: 404 });
    }

    const { portfolio: updatedPortfolio, success, message } = updatePositionLevels(
      targetPortfolio,
      positionId,
      stopLoss,
      target1,
      target2
    );

    if (success) {
      if (market === 'BIST') dualState.bist = updatedPortfolio;
      else if (market === 'CRYPTO') dualState.crypto = updatedPortfolio;
      else dualState.us = updatedPortfolio;

      await saveDualPortfolioState(dualState, userId);
      return NextResponse.json({ success: true, message, portfolio: updatedPortfolio });
    } else {
      return NextResponse.json({ success: false, message }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Update position levels error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Hata oluştu' }, { status: 500 });
  }
}
