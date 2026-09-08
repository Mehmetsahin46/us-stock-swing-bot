import { DualPortfolioState, TradePosition } from './types';
import { INITIAL_DUAL_STATE } from './constants';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// In-memory fallback for when Supabase is not configured
const memoryStates: Record<string, DualPortfolioState> = {};

export async function getDualPortfolioState(userId: string = 'mehmet.sahin'): Promise<DualPortfolioState> {
  const effectiveUser = (userId || 'mehmet.sahin').toLowerCase().trim();
  const stateId = `user_${effectiveUser}`;

  if (!isSupabaseConfigured) {
    if (!memoryStates[effectiveUser]) {
      const init = JSON.parse(JSON.stringify(INITIAL_DUAL_STATE)) as DualPortfolioState;
      init.userId = effectiveUser;
      memoryStates[effectiveUser] = init;
    }
    return memoryStates[effectiveUser];
  }

  try {
    const { data, error } = await supabase!
      .from('portfolio_state')
      .select('state')
      .eq('id', stateId)
      .single();

    if (error || !data) {
      // Eğer kullanıcıya ait kayıt yoksa ve mehmet.sahin ise eski 'main' kaydını kontrol et
      if (effectiveUser === 'mehmet.sahin') {
        const { data: mainData } = await supabase!
          .from('portfolio_state')
          .select('state')
          .eq('id', 'main')
          .single();
        if (mainData && mainData.state) {
          const s = mainData.state as DualPortfolioState;
          s.userId = effectiveUser;
          return s;
        }
      }

      const initial = JSON.parse(JSON.stringify(INITIAL_DUAL_STATE)) as DualPortfolioState;
      initial.userId = effectiveUser;
      return initial;
    }

    const state = data.state as DualPortfolioState;
    if (state && state.bist && state.us) {
      if (!state.crypto) {
        state.crypto = JSON.parse(JSON.stringify(INITIAL_DUAL_STATE.crypto));
      }
      state.userId = effectiveUser;
      memoryStates[effectiveUser] = state;
      return state;
    }

    const initial = JSON.parse(JSON.stringify(INITIAL_DUAL_STATE)) as DualPortfolioState;
    initial.userId = effectiveUser;
    return initial;
  } catch (err) {
    console.error('[SupabaseStore] Error reading state:', err);
    if (!memoryStates[effectiveUser]) {
      const init = JSON.parse(JSON.stringify(INITIAL_DUAL_STATE)) as DualPortfolioState;
      init.userId = effectiveUser;
      memoryStates[effectiveUser] = init;
    }
    return memoryStates[effectiveUser];
  }
}

export async function saveDualPortfolioState(newState: DualPortfolioState, userId?: string): Promise<void> {
  const effectiveUser = (userId || newState.userId || 'mehmet.sahin').toLowerCase().trim();
  const stateId = `user_${effectiveUser}`;
  newState.userId = effectiveUser;
  memoryStates[effectiveUser] = newState;

  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase!
      .from('portfolio_state')
      .upsert({
        id: stateId,
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
