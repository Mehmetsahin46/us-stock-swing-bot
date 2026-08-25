'use client';

import React from 'react';
import { DollarSign, TrendingUp, Percent, BarChart3, ShieldAlert, Wallet } from 'lucide-react';
import { MarketPortfolio } from '@/lib/types';

interface PortfolioCardsProps {
  portfolio: MarketPortfolio;
}

export const PortfolioCards: React.FC<PortfolioCardsProps> = ({ portfolio }) => {
  const isNetProfit = portfolio.totalEquity >= portfolio.initialBalance;
  const netReturnPct = Number((((portfolio.totalEquity - portfolio.initialBalance) / portfolio.initialBalance) * 100).toFixed(2));
  const openPositionsCount = portfolio.positions.filter(p => p.status === 'OPEN').length;
  const sym = portfolio.currencySymbol;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* 1. Total Equity */}
      <div className="p-4 rounded-xl bg-card/90 border border-border flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-medium">{portfolio.market === 'BIST' ? 'BIST Bakiye' : 'ABD Bakiye'}</span>
          <Wallet className="w-4 h-4 text-accent-400" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {sym}{portfolio.totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${isNetProfit ? 'text-primary-400' : 'text-danger-400'}`}>
            <span>{isNetProfit ? '+' : ''}{netReturnPct}%</span>
            <span className="text-muted font-normal text-[10px]">başlangıçtan</span>
          </div>
        </div>
      </div>

      {/* 2. Available Cash */}
      <div className="p-4 rounded-xl bg-card/90 border border-border flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-medium">Kullanılabilir Nakit</span>
          <DollarSign className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {sym}{portfolio.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            %{((portfolio.cash / Math.max(portfolio.totalEquity, 1)) * 100).toFixed(0)} likit
          </div>
        </div>
      </div>

      {/* 3. Unrealized PnL */}
      <div className="p-4 rounded-xl bg-card/90 border border-border flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-medium">Açık Kâr / Zarar</span>
          <TrendingUp className="w-4 h-4 text-primary-400" />
        </div>
        <div>
          <div className={`text-lg sm:text-xl font-bold tracking-tight ${portfolio.unrealizedPnL >= 0 ? 'text-primary-400' : 'text-danger-400'}`}>
            {portfolio.unrealizedPnL >= 0 ? '+' : ''}{sym}{portfolio.unrealizedPnL.toFixed(2)}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            {openPositionsCount} açık işlem
          </div>
        </div>
      </div>

      {/* 4. Realized PnL */}
      <div className="p-4 rounded-xl bg-card/90 border border-border flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-medium">Gerçekleşen Kâr</span>
          <BarChart3 className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className={`text-lg sm:text-xl font-bold tracking-tight ${portfolio.realizedPnL >= 0 ? 'text-primary-400' : 'text-danger-400'}`}>
            {portfolio.realizedPnL >= 0 ? '+' : ''}{sym}{portfolio.realizedPnL.toFixed(2)}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            {portfolio.history.length} kapanan işlem
          </div>
        </div>
      </div>

      {/* 5. Win Rate */}
      <div className="p-4 rounded-xl bg-card/90 border border-border flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-medium">Kazanma Oranı</span>
          <Percent className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            %{portfolio.winRate}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            {portfolio.winningTrades}K / {portfolio.losingTrades}Z
          </div>
        </div>
      </div>

      {/* 6. Profit Factor */}
      <div className="p-4 rounded-xl bg-card/90 border border-border flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-medium">Kâr Faktörü</span>
          <ShieldAlert className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {portfolio.profitFactor > 0 ? `${portfolio.profitFactor}x` : '—'}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            Risk: %{portfolio.riskPerTradePct} / işlem
          </div>
        </div>
      </div>
    </div>
  );
};
