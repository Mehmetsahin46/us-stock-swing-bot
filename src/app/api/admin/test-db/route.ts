import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const results: Record<string, { ok: boolean; message: string; rowCount?: number }> = {};

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      success: false,
      configured: false,
      message: '⚠️ NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY tanımlanmamış. Lütfen Vercel Environment Variables kısmına ekleyip Redeploy yapın.'
    });
  }

  // 1. Test portfolio_state
  try {
    const { data, error, count } = await supabase
      .from('portfolio_state')
      .select('id', { count: 'exact' });
    if (error) {
      results['portfolio_state'] = { ok: false, message: `Hata: ${error.message}` };
    } else {
      results['portfolio_state'] = { ok: true, message: 'Tablo aktif ve erişilebilir.', rowCount: count || 0 };
    }
  } catch (e: any) {
    results['portfolio_state'] = { ok: false, message: e.message };
  }

  // 2. Test trade_history
  try {
    const { data, error, count } = await supabase
      .from('trade_history')
      .select('id', { count: 'exact' });
    if (error) {
      results['trade_history'] = { ok: false, message: `Hata: ${error.message}` };
    } else {
      results['trade_history'] = { ok: true, message: 'Tablo aktif ve erişilebilir.', rowCount: count || 0 };
    }
  } catch (e: any) {
    results['trade_history'] = { ok: false, message: e.message };
  }

  // 3. Test universe_bist
  try {
    const { data, error, count } = await supabase
      .from('universe_bist')
      .select('symbol', { count: 'exact' });
    if (error) {
      results['universe_bist'] = { ok: false, message: `Hata: ${error.message}` };
    } else {
      results['universe_bist'] = { ok: true, message: 'Tablo aktif ve erişilebilir.', rowCount: count || 0 };
    }
  } catch (e: any) {
    results['universe_bist'] = { ok: false, message: e.message };
  }

  // 4. Test universe_us
  try {
    const { data, error, count } = await supabase
      .from('universe_us')
      .select('symbol', { count: 'exact' });
    if (error) {
      results['universe_us'] = { ok: false, message: `Hata: ${error.message}` };
    } else {
      results['universe_us'] = { ok: true, message: 'Tablo aktif ve erişilebilir.', rowCount: count || 0 };
    }
  } catch (e: any) {
    results['universe_us'] = { ok: false, message: e.message };
  }

  // 5. Test universe_revision_log
  try {
    const { data, error, count } = await supabase
      .from('universe_revision_log')
      .select('id', { count: 'exact' });
    if (error) {
      results['universe_revision_log'] = { ok: false, message: `Hata: ${error.message}` };
    } else {
      results['universe_revision_log'] = { ok: true, message: 'Tablo aktif ve erişilebilir.', rowCount: count || 0 };
    }
  } catch (e: any) {
    results['universe_revision_log'] = { ok: false, message: e.message };
  }

  const allOk = Object.values(results).every(r => r.ok);

  return NextResponse.json({
    success: allOk,
    configured: true,
    allTablesHealthy: allOk,
    tables: results,
    timestamp: new Date().toISOString()
  });
}
