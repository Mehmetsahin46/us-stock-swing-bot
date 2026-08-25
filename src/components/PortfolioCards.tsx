'use client';

import React from 'react';
import { DollarSign, TrendingUp, Percent, BarChart3, ShieldAlert, Wallet } from 'lucide-react';
import { PortfolioState } from '@/lib/types';

interface PortfolioCardsProps {
  state: PortfolioState;
}

export const PortfolioCards: React.FC<PortfolioCardsProps> = ({ state }) => {
  const isNetProfit = state.totalEquity >= state.initialBalance;
  const netReturnPct = Number((((state.totalEquity - state.initialBalance) / state.initialBalance) * 100).toFixed(2));
  const openPositionsCount = state.positions.filter(p => p.status === 'OPEN').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      <div className="p-4 rounded-xl bg-card/90 border border-border flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-medium">Toplam Bakiye</span>
          <Wallet className="w-4 h-4 text-accent-400" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            ${state.totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${isNetProfit ? 'text-primary-400' : 'text-danger-400'}`}>
            <span>{isNetProfit ? '+' : ''}{netReturnPct}%</span>
            <span className="text-muted font-normal text-[10px]">başlangıçtan</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-card/90 border border-border flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-medium">Kullanılabilir Nakit</span>
          <DollarSign className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            ${state.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            %{((state.cash / Math.max(state.totalEquity, 1)) * 100).toFixed(0)} likit
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-card/90 border border-border flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-medium">Açık Kâr / Zarar</span>
          <TrendingUp className="w-4 h-4 text-primary-400" />
        </div>
        <div>
          <div className={`text-lg sm:text-xl font-bold tracking-tight ${state.unrealizedPnL >= 0 ? 'text-primary-400' : 'text-danger-400'}`}>
            {state.unrealizedPnL >= 0 ? '+' : ''}${state.unrealizedPnL.toFixed(2)}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            {openPositionsCount} açık pozisyon
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-card/90 border border-border flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-medium">Gerçekleşen Kâr</span>
          <BarChart3 className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className={`text-lg sm:text-xl font-bold tracking-tight ${state.realizedPnL >= 0 ? 'text-primary-400' : 'text-danger-400'}`}>
            {state.realizedPnL >= 0 ? '+' : ''}${state.realizedPnL.toFixed(2)}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            {state.history.length} kapanan işlem
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-card/90 border border-border flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-medium">Kazanma Oranı</span>
          <Percent className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            %{state.winRate}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            {state.winningTrades}K / {state.losingTrades}Z
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-card/90 border border-border flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-medium">Kâr Faktörü</span>
          <ShieldAlert className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {state.profitFactor > 0 ? `${state.profitFactor}x` : '—'}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            Risk: %{state.settings.riskPerTradePct} / işlem
          </div>
        </div>
      </div>
    </div>
  );
};
