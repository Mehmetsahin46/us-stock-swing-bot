'use client';

import React, { useState } from 'react';
import { StockScanResult, Signal } from '@/lib/types';
import { Flame, Sparkles, TrendingUp, Zap, Clock, ShieldCheck, HelpCircle, ArrowRight, ShoppingCart } from 'lucide-react';

interface TopOpportunitiesPanelProps {
  results: StockScanResult[];
  onOpenTrade: (signal: Signal) => void;
  onOpenDetail?: (signal: Signal, result: StockScanResult) => void;
}

export const TopOpportunitiesPanel: React.FC<TopOpportunitiesPanelProps> = ({ results, onOpenTrade, onOpenDetail }) => {
  const [activeMarket, setActiveMarket] = useState<'BIST' | 'US'>('BIST');

  // Filter signals and sort by score & grade
  const signalsWithResults = results
    .filter(r => r.signal !== null && r.market === activeMarket)
    .map(r => ({
      result: r,
      signal: r.signal as Signal
    }))
    .sort((a, b) => b.signal.score - a.signal.score)
    .slice(0, 8); // Top 8 best opportunities

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Günün En Güçlü Fırsatları (Top Opportunities)</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              A+ & A Sınıfı Kuant Seçimleri
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            200+ hisse arasından teknik güç, kurumsal hacim ve bilanço/haber katalizörlerinin birleştiği en yüksek potansiyelli fırsatlar.
          </p>
        </div>

        {/* Market Switcher */}
        <div className="flex items-center bg-card border border-border rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveMarket('BIST')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeMarket === 'BIST' ? 'bg-red-500/30 text-white border border-red-500/50 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇹🇷 Borsa İstanbul</span>
          </button>
          <button
            onClick={() => setActiveMarket('US')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeMarket === 'US' ? 'bg-blue-500/30 text-white border border-blue-500/50 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇺🇸 ABD Borsaları</span>
          </button>
        </div>
      </div>

      {/* Grid of Top Opportunity Cards */}
      {signalsWithResults.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl space-y-2">
          <Flame className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-white">Bu pazarda şu an A+ kriterlerine uyan aktif fırsat bulunamadı.</p>
          <p className="text-xs text-slate-400">Üst menüdeki "Tara & Oto-Trade" butonuna basarak tüm piyasayı yeniden tarayabilirsiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {signalsWithResults.map(({ result, signal }, idx) => {
            const currSign = signal.currency === 'TRY' ? '₺' : '$';
            const isTop1 = idx === 0;

            return (
              <div
                key={signal.id}
                className={`p-5 rounded-2xl bg-surface border transition-all flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden group ${
                  isTop1 
                    ? 'border-amber-500/50 hover:border-amber-400 shadow-amber-500/10' 
                    : 'border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                {/* Glow Backdrop for #1 */}
                {isTop1 && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                )}

                {/* Top Row: Symbol, Grade, Score */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{signal.market === 'BIST' ? '🇹🇷' : '🇺🇸'}</span>
                      <span className="text-base font-extrabold text-white font-mono tracking-tight">
                        {signal.displayTicker}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {currSign}{result.technicals.price.toFixed(2)}
                      </span>
                      <span className={`text-[11px] font-mono font-bold ${result.technicals.changePercent >= 0 ? 'text-emerald-400' : 'text-danger-400'}`}>
                        {result.technicals.changePercent >= 0 ? '+' : ''}{result.technicals.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold font-mono shadow-sm ${
                        signal.grade === 'A+'
                          ? 'bg-gradient-to-r from-amber-400/30 to-yellow-500/30 text-amber-300 border border-amber-400/50'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {signal.grade === 'A+' ? '🥇 A+ ELİT' : '🥈 A SINIFI'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        {signal.score} Skor
                      </span>
                    </div>
                  </div>

                  {/* Strategy Title */}
                  <h3 className="text-xs font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors">
                    {signal.title}
                  </h3>

                  {/* Reason & Catalyst */}
                  <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {signal.reason}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Hedef (TP2)</span>
                    <span className="text-emerald-400 font-bold">{currSign}{signal.target2.toFixed(2)}</span>
                    <span className="text-[9px] text-emerald-500 block">+{signal.potentialGainPct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Stop-Loss</span>
                    <span className="text-danger-400 font-bold">{currSign}{signal.stopLoss.toFixed(2)}</span>
                    <span className="text-[9px] text-danger-500 block">-%{signal.maxRiskPct}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Risk / Ödül</span>
                    <span className="text-indigo-300 font-bold">{signal.riskReward}x</span>
                    <span className="text-[9px] text-indigo-400 block">+{signal.expectedValuePct || 4.5}% EV</span>
                  </div>
                </div>

                {/* Bottom Row: ETA & Action Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-xs">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{signal.estimatedTimeframe || '~1-2 Hafta'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenDetail && (
                      <button
                        onClick={() => onOpenDetail(signal, result)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                        title="Neden Bu Sinyal? Faktör Analizi"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Analiz</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenTrade(signal)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>İşlem Aç</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};