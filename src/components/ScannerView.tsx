'use client';

import React from 'react';
import { StockScanResult, Signal } from '@/lib/types';
import { TrendingUp, Flame, ShoppingCart, Check } from 'lucide-react';

interface ScannerViewProps {
  results: StockScanResult[];
  onOpenTrade: (signal: Signal) => void;
  openPositionTickers: string[];
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  results,
  onOpenTrade,
  openPositionTickers
}) => {
  if (results.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-card border border-border text-center text-muted">
        Piyasa verisi yükleniyor veya taranmadı. Üst menüdeki "Piyasayı Tara" butonuna tıklayabilirsiniz.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Canlı ABD Piyasa Tarayıcısı</h2>
          <p className="text-xs text-muted">S&P 500 ve Nasdaq en likit 30 hissede 1-14 günlük swing formasyonları</p>
        </div>
        <div className="text-xs text-muted">
          Toplam <span className="font-semibold text-white">{results.length}</span> hisse taranıyor
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-surface/50 text-muted font-medium">
              <th className="py-3 px-4">Hisse</th>
              <th className="py-3 px-4">Fiyat / Günlük %</th>
              <th className="py-3 px-4">RSI (14)</th>
              <th className="py-3 px-4">EMA Durumu</th>
              <th className="py-3 px-4">Hacim (RVOL)</th>
              <th className="py-3 px-4">Tespit Edilen Sinyal</th>
              <th className="py-3 px-4 text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {results.map(({ ticker, name, technicals, signal }) => {
              const isOpen = openPositionTickers.includes(ticker);
              const isGreen = technicals.changePercent >= 0;

              return (
                <tr key={ticker} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-sm">{ticker}</div>
                    <div className="text-[11px] text-muted truncate max-w-[140px]">{name}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">${technicals.price.toFixed(2)}</div>
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
                        <span className="text-primary-400 font-medium">EMA 20 Üstü (${technicals.ema20})</span>
                      ) : (
                        <span className="text-slate-400">EMA 20 Altı (${technicals.ema20})</span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted">
                      50 EMA: ${technicals.ema50}
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
                          Stop: ${signal.stopLoss} | Hedef: ${signal.target2}
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
