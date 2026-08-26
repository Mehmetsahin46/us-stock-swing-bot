import { NextResponse } from 'next/server';
import { getTrackedSignals, calculateSignalPerformanceMetrics } from '@/lib/signalTracker';
import { fetchGlobalMacroRegime } from '@/lib/quantEngine';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const signals = await getTrackedSignals();
    const metrics = calculateSignalPerformanceMetrics(signals);
    const macro = await fetchGlobalMacroRegime();

    return NextResponse.json({
      success: true,
      signals,
      metrics,
      macro
    });
  } catch (error) {
    console.error('Signals API error:', error);
    return NextResponse.json({ success: false, error: 'Sinyal verileri yüklenemedi.' }, { status: 500 });
  }
}