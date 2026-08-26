'use client';

import React, { useState } from 'react';
import { StockScanResult, Signal, MarketType } from '@/lib/types';
import { TrendingUp, Flame, ShoppingCart, Check } from 'lucide-react';

interface ScannerViewProps {
  results: StockScanResult[];
  onOpenTrade: (signal: Signal) => void;
  openPositionTickers: string[];
  onOpenAddStock?: () => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  results,
  onOpenTrade,
  openPositionTickers,
  onOpenAddStock
}) => {
  const [selectedMarket, setSelectedMarket] = useState<'ALL' | MarketType>('ALL');

  const filteredResults = results.filter(r => {
    if (selectedMarket === 'ALL') return true;
    return r.market === selectedMarket;
  });

  if (results.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-card border border-border text-center text-muted">
        Piyasa verisi yükleniyor veya taranmadı. Üst menüdeki "Piyasaları Tara" butonuna tıklayabilirsiniz.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Canlı Piyasa Tarayıcısı</h2>
          <p className="text-xs text-muted">200+ ABD ve Borsa İstanbul hissesinde canlı teknik analiz ve fırsatlar</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Market Filter Pills */}
          <div className="flex items-center bg-card border border-border rounded-lg p-1 text-xs">
            <button
              onClick={() => setSelectedMarket('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${selectedMarket === 'ALL' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Tüm Piyasalar ({results.length})
            </button>
            <button
              onClick={() => setSelectedMarket('BIST')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${selectedMarket === 'BIST' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              🇹🇷 BIST ({results.filter(r => r.market === 'BIST').length})
            </button>
            <button
              onClick={() => setSelectedMarket('US')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${selectedMarket === 'US' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              🇺🇸 ABD ({results.filter(r => r.market === 'US').length})
            </button>
          </div>

          {onOpenAddStock && (
            <button
              onClick={onOpenAddStock}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <span className="text-sm font-bold">+</span>
              <span>Özel Hisse Ekle</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-surface/50 text-muted font-medium">
              <th className="py-3 px-4">Hisse & Piyasa</th>
              <th className="py-3 px-4">Fiyat / Günlük %</th>
              <th className="py-3 px-4">RSI (14)</th>
              <th className="py-3 px-4">EMA Durumu</th>
              <th className="py-3 px-4">Hacim (RVOL)</th>
              <th className="py-3 px-4">Tespit Edilen Sinyal</th>
              <th className="py-3 px-4 text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredResults.map(({ ticker, displayTicker, name, market, currency, technicals, signal }) => {
              const isOpen = openPositionTickers.includes(ticker);
              const isGreen = technicals.changePercent >= 0;
              const currSign = currency === 'TRY' ? '₺' : '$';

              return (
                <tr key={ticker} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">{displayTicker}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                        market === 'BIST' 
                          ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                          : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      }`}>
                        {market === 'BIST' ? '🇹🇷 BIST' : '🇺🇸 US'}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted truncate max-w-[150px]">{name}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{currSign}{technicals.price.toFixed(2)}</div>
                    <div className={`text-[11px] font-medium ${isGreen ? 'text-primary-400' : 'text-danger-400'}`}>
                      {isGreen ? '+' : ''}{technicals.changePercent}%
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-semibold ${
                        technicals.rsi14 < 32 
                          ? 'text-accent-400' 
                          : technicals.rsi14 > 70 
                          ? 'text-amber-400' 
                          : 'text-slate-300'
                      }`}>
                        {technicals.rsi14}
                      </span>
                      <span className="text-[10px] text-muted">
                        {technicals.rsi14 < 32 ? '(Aşırı Satım)' : technicals.rsi14 > 70 ? '(Şişkin)' : ''}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-[11px]">
                      {technicals.price > technicals.ema20 ? (
                        <span className="text-primary-400 font-medium">EMA 20 Üstü ({currSign}{technicals.ema20})</span>
                      ) : (
                        <span className="text-slate-400">EMA 20 Altı ({currSign}{technicals.ema20})</span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted">
                      50 EMA: {currSign}{technicals.ema50}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className={`flex items-center gap-1 font-semibold ${
                      technicals.rvol >= 1.3 ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {technicals.rvol >= 1.3 && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{technicals.rvol}x</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {signal ? (
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          signal.strategy === 'BREAKOUT'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : signal.strategy === 'EMA_PULLBACK'
                            ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                            : 'bg-accent-500/10 border-accent-500/30 text-accent-400'
                        }`}>
                          <TrendingUp className="w-3 h-3" />
                          {signal.strategyName}
                        </span>
                        <div className="text-[10px] text-muted mt-0.5">
                          Stop: {currSign}{signal.stopLoss} | Hedef: {currSign}{signal.target2}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted text-[11px]">Nötr / Beklemede</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {isOpen ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-primary-400 font-medium px-2 py-1 bg-primary-500/10 rounded border border-primary-500/20">
                        <Check className="w-3 h-3" /> Portföyde
                      </span>
                    ) : signal ? (
                      <button
                        onClick={() => onOpenTrade(signal)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Sanal Al</span>
                      </button>
                    ) : (
                      <span className="text-muted text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
