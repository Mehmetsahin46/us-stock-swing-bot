'use client';

import React, { useState } from 'react';
import { StockScanResult, MarketType, Signal, StockNewsItem } from '@/lib/types';
import { Newspaper, Sparkles, TrendingUp, AlertTriangle, ExternalLink, Filter, Building2, Zap, Clock, ShieldCheck } from 'lucide-react';

interface NewsViewProps {
  results: StockScanResult[];
  onOpenTrade: (signal: Signal) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({ results, onOpenTrade }) => {
  const [selectedMarket, setSelectedMarket] = useState<'ALL' | MarketType>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'BILANCO' | 'YATIRIM' | 'SOZLESME' | 'ANALIST'>('ALL');

  // Collect all news from results
  const allNews: Array<StockNewsItem & { resultRef: StockScanResult }> = [];

  for (const r of results) {
    if (r.news && r.news.length > 0) {
      for (const n of r.news) {
        allNews.push({
          ...n,
          resultRef: r
        });
      }
    }
  }

  const filteredNews = allNews.filter((item) => {
    if (selectedMarket !== 'ALL' && item.resultRef.market !== selectedMarket) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryBadge = (cat: StockNewsItem['category']) => {
    switch (cat) {
      case 'BILANCO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">📊 Bilanço / Kâr</span>;
      case 'SOZLESME':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">🤝 Yeni Sözleşme</span>;
      case 'YATIRIM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">🚀 Yatırım / Büyüme</span>;
      case 'ANALIST':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">🎯 Analist Hedef</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/60 text-slate-300">📰 Piyasa Akışı</span>;
    }
  };

  const formatNewsDate = (dateStr?: string) => {
    if (!dateStr) return 'Bugün';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-indigo-400" />
              <span>Piyasa Haberleri & Bilanço Katalizörleri</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              FOMO / Tepe Tuzağı Korumalı
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Haberler tek başına alım yaptırmaz. Şişmiş (RSI &gt; 72) hisselerde iyi haber gelse bile tepe mal kilitleme riskine karşı alım engellenir.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Market Filter */}
          <div className="flex items-center bg-card border border-border rounded-xl p-1 text-xs">
            <button
              onClick={() => setSelectedMarket('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedMarket === 'ALL' ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tümü ({allNews.length})
            </button>
            <button
              onClick={() => setSelectedMarket('BIST')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedMarket === 'BIST' ? 'bg-red-500/30 text-white border border-red-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇹🇷 BIST ({allNews.filter(n => n.resultRef.market === 'BIST').length})
            </button>
            <button
              onClick={() => setSelectedMarket('US')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedMarket === 'US' ? 'bg-blue-500/30 text-white border border-blue-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇺🇸 ABD ({allNews.filter(n => n.resultRef.market === 'US').length})
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center bg-card border border-border rounded-xl p-1 text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedCategory === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tüm Kategoriler
            </button>
            <button
              onClick={() => setSelectedCategory('BILANCO')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedCategory === 'BILANCO' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 Bilanço
            </button>
            <button
              onClick={() => setSelectedCategory('SOZLESME')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedCategory === 'SOZLESME' ? 'bg-emerald-500/30 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              🤝 Sözleşme
            </button>
            <button
              onClick={() => setSelectedCategory('YATIRIM')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedCategory === 'YATIRIM' ? 'bg-blue-500/30 text-blue-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              🚀 Yatırım
            </button>
          </div>
        </div>
      </div>

      {/* News Cards Grid */}
      {filteredNews.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl space-y-2">
          <Newspaper className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">Şu an filtrelere uygun haber akışı bulunamadı.</p>
          <p className="text-xs text-slate-400">Üst menüdeki "Tara & Oto-Trade" butonuna basarak tüm piyasayı canlı haberleriyle tarayabilirsiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map((item, idx) => {
            const hasSignal = Boolean(item.resultRef.signal);
            const sig = item.resultRef.signal;

            return (
              <div
                key={`${item.id}_${idx}`}
                className="p-4 rounded-2xl bg-surface border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3 shadow-lg group"
              >
                {/* Top Info */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {item.resultRef.market === 'BIST' ? '🇹🇷' : '🇺🇸'}
                      </span>
                      <span className="font-extrabold text-white font-mono text-sm">
                        {item.displayTicker}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {item.resultRef.currency === 'TRY' ? '₺' : '$'}{item.resultRef.technicals.price.toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-mono font-semibold ${item.resultRef.technicals.changePercent >= 0 ? 'text-emerald-400' : 'text-danger-400'}`}>
                        {item.resultRef.technicals.changePercent >= 0 ? '+' : ''}{item.resultRef.technicals.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getCategoryBadge(item.category)}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        item.impactScore > 0
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : item.impactScore < 0
                          ? 'bg-danger-500/15 text-danger-400 border border-danger-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.impactScore > 0 ? `+${item.impactScore} Skor` : `${item.impactScore} Skor`}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Bottom Action & Signal Link */}
                <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-mono">{formatNewsDate(item.publishedAt)}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[10px] text-slate-500 font-medium">{item.source}</span>
                  </div>

                  {hasSignal && sig ? (
                    <button
                      onClick={() => onOpenTrade(sig)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white font-bold border border-emerald-500/40 transition-all cursor-pointer shadow-sm text-xs"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Alım Sinyali Aç (Skor: {sig.score})</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Teknik Destek Onayı Bekleniyor</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};