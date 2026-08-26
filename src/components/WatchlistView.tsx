'use client';

import React, { useState, useEffect } from 'react';
import { StockScanResult, Signal } from '@/lib/types';
import { Star, Plus, Trash2, TrendingUp, ShoppingCart, Search, Eye } from 'lucide-react';

interface WatchlistViewProps {
  results: StockScanResult[];
  onOpenTrade: (signal: Signal) => void;
  onOpenAddStock?: () => void;
}

const WATCHLIST_STORAGE_KEY = 'swingbot_user_watchlist_v1';

export const WatchlistView: React.FC<WatchlistViewProps> = ({ results, onOpenTrade, onOpenAddStock }) => {
  const [favoriteTickers, setFavoriteTickers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (saved) {
        setFavoriteTickers(JSON.parse(saved));
      } else {
        // Default favorites
        setFavoriteTickers(['THYAO.IS', 'ASELS.IS', 'TUPRS.IS', 'NVDA', 'PLTR', 'TSLA', 'AAPL']);
      }
    } catch (e) {}
  }, []);

  const saveFavorites = (list: string[]) => {
    setFavoriteTickers(list);
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  };

  const toggleFavorite = (ticker: string) => {
    if (favoriteTickers.includes(ticker)) {
      saveFavorites(favoriteTickers.filter(t => t !== ticker));
    } else {
      saveFavorites([...favoriteTickers, ticker]);
    }
  };

  const watchedResults = results.filter(r => favoriteTickers.includes(r.ticker));
  const filteredWatched = watchedResults.filter(r => 
    r.displayTicker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-base font-extrabold text-white tracking-tight">Kişisel İzleme Listesi (Watchlist)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {favoriteTickers.length} Hisse Takipte
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Önem verdiğiniz BIST ve ABD hisselerini bu ekranda özel olarak takip edebilir, sinyallerini anında yakalayabilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Listede ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-card border border-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
            />
          </div>

          {onOpenAddStock && (
            <button
              onClick={onOpenAddStock}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Hisse Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* Watchlist Table */}
      {filteredWatched.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl space-y-2">
          <Eye className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-white">İzleme listenizde henüz hisse bulunmuyor.</p>
          <p className="text-xs text-slate-400">Canlı Tarayıcı sekmesinden veya üstteki butondan listenize hisse ekleyebilirsiniz.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface text-slate-400 font-semibold">
                <th className="py-3 px-4">Hisse & Şirket</th>
                <th className="py-3 px-4">Fiyat / Günlük %</th>
                <th className="py-3 px-4">RSI (14)</th>
                <th className="py-3 px-4">Kuant Skoru & Sinyal</th>
                <th className="py-3 px-4 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {filteredWatched.map(item => {
                const currSign = item.currency === 'TRY' ? '₺' : '$';
                const hasSignal = Boolean(item.signal);
                const sig = item.signal;

                return (
                  <tr key={item.ticker} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleFavorite(item.ticker)}
                          className="text-amber-400 hover:text-slate-500 transition-colors cursor-pointer"
                          title="İzleme Listesinden Kaldır"
                        >
                          <Star className="w-4 h-4 fill-amber-400" />
                        </button>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{item.market === 'BIST' ? '🇹🇷' : '🇺🇸'}</span>
                            <span className="font-extrabold text-white font-mono text-sm">{item.displayTicker}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{item.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white">{currSign}{item.technicals.price.toFixed(2)}</div>
                      <div className={`text-[10px] font-bold ${item.technicals.changePercent >= 0 ? 'text-emerald-400' : 'text-danger-400'}`}>
                        {item.technicals.changePercent >= 0 ? '+' : ''}{item.technicals.changePercent.toFixed(2)}%
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        item.technicals.rsi14 >= 70
                          ? 'bg-amber-500/20 text-amber-300'
                          : item.technicals.rsi14 <= 35
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        RSI: {item.technicals.rsi14}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {hasSignal && sig ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-extrabold font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {sig.grade || 'A'} • {sig.score}p
                          </span>
                          <span className="text-[11px] text-white font-bold">{sig.strategyName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Nötr / Fırsat Bekleniyor</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {hasSignal && sig ? (
                        <button
                          onClick={() => onOpenTrade(sig)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white font-bold border border-emerald-500/40 transition-all cursor-pointer text-xs shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Alım Aç</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleFavorite(item.ticker)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-danger-400 transition-colors cursor-pointer"
                          title="Listeden Çıkar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};