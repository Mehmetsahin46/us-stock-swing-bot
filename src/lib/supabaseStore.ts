import { DualPortfolioState, TradePosition } from './types';
import { INITIAL_DUAL_STATE } from './constants';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// In-memory fallback for when Supabase is not configured
let memoryState: DualPortfolioState = JSON.parse(JSON.stringify(INITIAL_DUAL_STATE));

export async function getDualPortfolioState(): Promise<DualPortfolioState> {
  if (!isSupabaseConfigured) {
    return memoryState;
  }

  try {
    const { data, error } = await supabase!
      .from('portfolio_state')
      .select('state')
      .eq('id', 'main')
      .single();

    if (error || !data) {
      console.warn('[SupabaseStore] No state found, returning initial state:', error?.message);
      return JSON.parse(JSON.stringify(INITIAL_DUAL_STATE));
    }

    const state = data.state as DualPortfolioState;
    if (state && state.bist && state.us) {
      memoryState = state;
      return state;
    }

    return JSON.parse(JSON.stringify(INITIAL_DUAL_STATE));
  } catch (err) {
    console.error('[SupabaseStore] Error reading state:', err);
    return memoryState;
  }
}

export async function saveDualPortfolioState(newState: DualPortfolioState): Promise<void> {
  memoryState = newState;

  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase!
      .from('portfolio_state')
      .upsert({
        id: 'main',
        state: newState,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('[SupabaseStore] Error saving state:', error.message);
    }
  } catch (err) {
    console.error('[SupabaseStore] Error saving state:', err);
  }
}

export async function saveTradeToHistory(trade: TradePosition): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const { error } = await supabase!
      .from('trade_history')
      .upsert({
        id: trade.id,
        market: trade.market,
        ticker: trade.ticker,
        display_ticker: trade.displayTicker,
        strategy: trade.strategy,
        entry_date: trade.entryDate,
        exit_date: trade.exitDate || null,
        entry_price: trade.entryPrice,
        exit_price: trade.exitPrice || null,
        shares: trade.initialShares,
        realized_pnl: trade.realizedPnL,
        status: trade.status,
        exit_reason: trade.exitReason || null,
        raw_data: trade
      }, { onConflict: 'id' });

    if (error) {
      console.error('[SupabaseStore] Error saving trade history:', error.message);
    }
  } catch (err) {
    console.error('[SupabaseStore] Error saving trade:', err);
  }
}
