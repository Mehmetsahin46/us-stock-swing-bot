import { NextResponse } from 'next/server';
import { scanUniverse } from '@/lib/marketData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const results = await scanUniverse();
    const signals = results.filter(r => r.signal !== null);

    return NextResponse.json({
      success: true,
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
