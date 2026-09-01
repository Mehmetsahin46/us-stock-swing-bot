'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, TrendingUp, TrendingDown, ArrowRight, Sparkles, HelpCircle, ShoppingCart } from 'lucide-react';
import { StockScanResult, Signal, MarketType } from '@/lib/types';
import { BIST_UNIVERSE, US_UNIVERSE, CRYPTO_UNIVERSE, UniverseItem } from '@/lib/marketData';

interface StockSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResults: StockScanResult[];
  onOpenTrade: (signal: Signal) => void;
  onOpenDetail?: (signal: Signal, result: StockScanResult) => void;
}

export const StockSearchModal: React.FC<StockSearchModalProps> = ({
  isOpen,
  onClose,
  scanResults,
  onOpenTrade,
  onOpenDetail
}) => {
  const [query, setQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<'ALL' | MarketType>('ALL');

  // Combine all universe items
  const allUniverse = useMemo(() => {
    return [...BIST_UNIVERSE, ...US_UNIVERSE, ...CRYPTO_UNIVERSE];
  }, []);

  // Quick lookup map for scanned results
  const resultMap = useMemo(() => {
    const map = new Map<string, StockScanResult>();
    for (const r of scanResults) {
      map.set(r.ticker, r);
    }
    return map;
  }, [scanResults]);

  // Filtered items
  const filteredItems = useMemo(() => {
    const q = query.trim().toUpperCase();
    return allUniverse.filter(item => {
      if (selectedMarket !== 'ALL' && item.market !== selectedMarket) return false;
      if (!q) return true;
      const tickerMatch = item.displayTicker.toUpperCase().includes(q) || item.ticker.toUpperCase().includes(q);
      const nameMatch = item.name.toUpperCase().includes(q);
      const sectorMatch = item.sector.toUpperCase().includes(q);
      return tickerMatch || nameMatch || sectorMatch;
    }).slice(0, 30); // Top 30 matches
  }, [query, selectedMarket, allUniverse]);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sembol veya Şirket Ara (örn: THYAO, Apple, NVDA, Garanti, ASELS)..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm sm:text-base outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800/80 text-xs">
          <span className="text-slate-500 font-semibold">Piyasa:</span>
          <button
            onClick={() => setSelectedMarket('ALL')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMarket === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            Tümü (500+)
          </button>
          <button
            onClick={() => setSelectedMarket('BIST')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMarket === 'BIST'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            🇹🇷 BIST ({BIST_UNIVERSE.length})
          </button>
          <button
            onClick={() => setSelectedMarket('US')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMarket === 'US'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            🇺🇸 ABD ({US_UNIVERSE.length})
          </button>
          <button
            onClick={() => setSelectedMarket('CRYPTO')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMarket === 'CRYPTO'
                ? 'bg-amber-600 text-amber-100 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            🪙 Kripto ({CRYPTO_UNIVERSE.length})
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-white">"{query}" ile eşleşen hisse bulunamadı.</p>
              <p className="text-xs text-slate-500">Sembolü doğru yazdığınızdan emin olun veya üst menüdeki "+ Hisse Ekle" butonunu kullanın.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const scanRes = resultMap.get(item.ticker);
              const hasSignal = scanRes?.signal !== null && scanRes?.signal !== undefined;
              const sig = scanRes?.signal as Signal | undefined;
              const currSign = item.currency === 'TRY' ? '₺' : '$';

              return (
                <div
                  key={item.ticker}
                  className="p-3 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
                >
                  {/* Left: Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center font-extrabold text-xs text-white border border-slate-700">
                      {item.market === 'BIST' ? '🇹🇷' : '🇺🇸'}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm tracking-tight font-mono">
                          {item.displayTicker}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                          {item.sector}
                        </span>
                        {hasSignal && sig && (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold font-mono shadow-sm ${
                            sig.grade === 'A+'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {sig.grade} Sinyal ({sig.score} Puan)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {item.name}
                      </p>
                    </div>
                  </div>

                  {/* Right: Technicals & Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {scanRes?.technicals ? (
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-white">
                          {currSign}{scanRes.technicals.price.toFixed(2)}
                        </div>
                        <div className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${
                          scanRes.technicals.changePercent >= 0 ? 'text-emerald-400' : 'text-danger-400'
                        }`}>
                          {scanRes.technicals.changePercent >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{scanRes.technicals.changePercent >= 0 ? '+' : ''}{scanRes.technicals.changePercent.toFixed(2)}%</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">Veri hazır</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      {hasSignal && sig && onOpenDetail && scanRes && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenDetail(sig, scanRes);
                          }}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-all cursor-pointer"
                          title="Kuant Analizi Gör"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      )}

                      {hasSignal && sig ? (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenTrade(sig);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>İşlem Aç</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onClose();
                            // Generate instant manual signal
                            const fallbackSignal: Signal = {
                              id: `manual_${item.ticker}_${Date.now()}`,
                              ticker: item.ticker,
                              displayTicker: item.displayTicker,
                              sector: item.sector,
                              market: item.market,
                              currency: item.currency,
                              strategy: 'MOMENTUM_TREND',
                              strategyName: 'Manuel Kuant Pozisyonu',
                              title: `${item.displayTicker} Manuel Kuant Alımı`,
                              score: 85,
                              grade: 'A',
                              reason: 'Kullanıcı araması üzerinden doğrudan işlem girişi.',
                              suggestedEntry: scanRes?.technicals?.price || 100,
                              stopLoss: Number(((scanRes?.technicals?.price || 100) * 0.95).toFixed(2)),
                              target1: Number(((scanRes?.technicals?.price || 100) * 1.08).toFixed(2)),
                              target2: Number(((scanRes?.technicals?.price || 100) * 1.15).toFixed(2)),
                              riskReward: 2.5,
                              potentialGainPct: 15.0,
                              maxRiskPct: 5.0,
                              dataConfidenceScore: 98,
                              timestamp: new Date().toISOString()
                            };
                            onOpenTrade(fallbackSignal);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                        >
                          <span>Hızlı İşlem</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Toplam <strong>{allUniverse.length}</strong> kurumsal hisse taranabilir</span>
          <span className="text-[11px] text-slate-500">Aramak için yazmaya başlayın</span>
        </div>
      </div>
    </div>
  );
};
