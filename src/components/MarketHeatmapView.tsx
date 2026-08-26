'use client';

import React, { useState } from 'react';
import { StockScanResult, SectorType } from '@/lib/types';
import { LayoutGrid, TrendingUp, TrendingDown, Layers, Zap, ShoppingCart } from 'lucide-react';

interface MarketHeatmapViewProps {
  results: StockScanResult[];
  onOpenTrade?: (signal: any) => void;
}

export const MarketHeatmapView: React.FC<MarketHeatmapViewProps> = ({ results, onOpenTrade }) => {
  const [selectedMarket, setSelectedMarket] = useState<'BIST' | 'US'>('BIST');
  const [colorMode, setColorMode] = useState<'CHANGE' | 'SCORE'>('CHANGE');

  const marketResults = results.filter(r => r.market === selectedMarket);

  // Group by sector
  const sectorsMap = new Map<SectorType, StockScanResult[]>();
  for (const r of marketResults) {
    if (!sectorsMap.has(r.sector)) {
      sectorsMap.set(r.sector, []);
    }
    sectorsMap.get(r.sector)!.push(r);
  }

  const getTileBg = (item: StockScanResult) => {
    if (colorMode === 'CHANGE') {
      const chg = item.technicals.changePercent;
      if (chg >= 4.0) return 'bg-emerald-600/90 text-white';
      if (chg >= 2.0) return 'bg-emerald-700/80 text-white';
      if (chg >= 0.5) return 'bg-emerald-900/60 text-emerald-200 border border-emerald-500/30';
      if (chg >= -0.5) return 'bg-slate-800 text-slate-300 border border-slate-700';
      if (chg >= -2.0) return 'bg-rose-900/60 text-rose-200 border border-rose-500/30';
      if (chg >= -4.0) return 'bg-rose-800/80 text-white';
      return 'bg-rose-700/90 text-white';
    } else {
      const score = item.signal?.score || 50;
      if (score >= 88) return 'bg-gradient-to-tr from-amber-500/80 to-yellow-600/80 text-white shadow-lg shadow-amber-500/20';
      if (score >= 78) return 'bg-indigo-600/80 text-white';
      if (score >= 68) return 'bg-blue-800/70 text-blue-100';
      return 'bg-slate-800/80 text-slate-400';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-extrabold text-white tracking-tight">Piyasa Sektörel Isı Haritası (Heatmap)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Sektör & Para Girişi Takibi
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hangi sektörlerin yükseliş trendinde olduğunu ve kurumsal para girişinin hangi hisselere aktığını tek bakışta görün.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Market Switcher */}
          <div className="flex items-center bg-card border border-border rounded-xl p-1">
            <button
              onClick={() => setSelectedMarket('BIST')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedMarket === 'BIST' ? 'bg-red-500/30 text-white border border-red-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇹🇷 BIST
            </button>
            <button
              onClick={() => setSelectedMarket('US')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedMarket === 'US' ? 'bg-blue-500/30 text-white border border-blue-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇺🇸 ABD
            </button>
          </div>

          {/* Color Mode */}
          <div className="flex items-center bg-card border border-border rounded-xl p-1">
            <button
              onClick={() => setColorMode('CHANGE')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                colorMode === 'CHANGE' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              📈 Fiyat Değişimi %
            </button>
            <button
              onClick={() => setColorMode('SCORE')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                colorMode === 'SCORE' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⭐ Kuant Skoru
            </button>
          </div>
        </div>
      </div>

      {/* Sector Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from(sectorsMap.entries()).map(([sectorName, items]) => {
          const avgChange = items.reduce((acc, it) => acc + it.technicals.changePercent, 0) / items.length;

          return (
            <div
              key={sectorName}
              className="p-4 rounded-2xl bg-surface border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
            >
              {/* Sector Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5 font-extrabold text-white">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{sectorName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({items.length})</span>
                </div>
                <div className={`font-mono font-bold text-[11px] ${avgChange >= 0 ? 'text-emerald-400' : 'text-danger-400'}`}>
                  {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
                </div>
              </div>

              {/* Ticker Tiles Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {items.map(item => {
                  const hasSignal = Boolean(item.signal);
                  const isA = item.signal?.grade === 'A+' || item.signal?.grade === 'A';

                  return (
                    <div
                      key={item.ticker}
                      className={`p-2 rounded-xl text-center transition-all flex flex-col justify-center items-center relative group cursor-pointer hover:scale-105 ${getTileBg(item)}`}
                      title={`${item.displayTicker}: ${item.technicals.changePercent}% | Skor: ${item.signal?.score || 'Nötr'}`}
                    >
                      {isA && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900 animate-pulse" />
                      )}
                      <span className="font-extrabold font-mono text-[11px] block leading-tight">
                        {item.displayTicker}
                      </span>
                      <span className="text-[10px] font-mono font-bold block mt-0.5 opacity-90">
                        {colorMode === 'CHANGE'
                          ? `${item.technicals.changePercent >= 0 ? '+' : ''}${item.technicals.changePercent.toFixed(1)}%`
                          : `${item.signal?.score || 50}p`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};