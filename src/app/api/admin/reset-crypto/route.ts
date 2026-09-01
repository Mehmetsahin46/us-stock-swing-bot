import { NextResponse } from 'next/server';
import { getDualPortfolioState, saveDualPortfolioState } from '@/lib/supabaseStore';
import { INITIAL_CRYPTO_PORTFOLIO } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const dualState = await getDualPortfolioState();
    dualState.crypto = JSON.parse(JSON.stringify(INITIAL_CRYPTO_PORTFOLIO));
    await saveDualPortfolioState(dualState);

    return NextResponse.json({
      success: true,
      message: '✅ Kripto portföyü ve bakiyesi başarıyla 100 USDT olarak sıfırlandı!',
      crypto: dualState.crypto
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
