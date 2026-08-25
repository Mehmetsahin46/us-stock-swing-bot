import { NextRequest, NextResponse } from 'next/server';
import { scanUniverse } from '@/lib/marketData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketParam = (searchParams.get('market') || 'ALL').toUpperCase() as 'ALL' | 'US' | 'BIST';
    const marketFilter = ['US', 'BIST'].includes(marketParam) ? marketParam : 'ALL';

    const results = await scanUniverse(marketFilter);
    const signals = results.filter(r => r.signal !== null);

    return NextResponse.json({
      success: true,
      market: marketFilter,
      timestamp: new Date().toISOString(),
      totalScanned: results.length,
      signalsFound: signals.length,
      data: results
    });
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { success: false, error: 'Piyasa taraması sırasında hata oluştu.' },
      { status: 500 }
    );
  }
}
