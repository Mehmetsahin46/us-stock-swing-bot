'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { MarketType } from '@/lib/types';
import { UniverseItem } from '@/lib/marketData';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMarket: MarketType;
  onStockAdded?: () => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  onClose,
  defaultMarket,
  onStockAdded
}) => {
  const [symbol, setSymbol] = useState('');
  const [market, setMarket] = useState<MarketType>(defaultMarket);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [customStocks, setCustomStocks] = useState<UniverseItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    setMarket(defaultMarket);
  }, [defaultMarket]);

  useEffect(() => {
    if (isOpen) {
      fetchCustomStocks();
      setError(null);
      setSuccess(null);
      setSymbol('');
    }
  }, [isOpen]);

  async function fetchCustomStocks() {
    setLoadingList(true);
    try {
      const res = await fetch('/api/market/custom-stock');
      const data = await res.json();
      if (data.success && data.data) {
        setCustomStocks(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  }

  async function handleAddStock(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/market/custom-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol.trim(), market })
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(data.message || `"${symbol.toUpperCase()}" başarıyla eklendi!`);
        setSymbol('');
        await fetchCustomStocks();
        if (onStockAdded) onStockAdded();
      } else {
        setError(data.error || 'Doğrulama başarısız oldu.');
      }
    } catch (err: any) {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteStock(ticker: string) {
    try {
      const res = await fetch(`/api/market/custom-stock?ticker=${encodeURIComponent(ticker)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await fetchCustomStocks();
        if (onStockAdded) onStockAdded();
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Manuel Hisse / Sembol Ekle</h2>
              <p className="text-xs text-slate-400">Piyasadan canlı veri doğrulaması yapılır, sahte semboller engellenir.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Form */}
          <form onSubmit={handleAddStock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hisse Piyasası</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMarket('BIST')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    market === 'BIST'
                      ? 'bg-red-500/20 text-white border-red-500/50 shadow-sm'
                      : 'bg-card text-slate-400 border-border hover:text-white'
                  }`}
                >
                  <span>🇹🇷 Borsa İstanbul (BIST)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMarket('US')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    market === 'US'
                      ? 'bg-blue-500/20 text-white border-blue-500/50 shadow-sm'
                      : 'bg-card text-slate-400 border-border hover:text-white'
                  }`}
                >
                  <span>🇺🇸 ABD (NYSE/NASDAQ)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hisse Sembolü (Ticker)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder={market === 'BIST' ? 'Örn: PETKM, KRDMD, TUPRS...' : 'Örn: PLTR, NVDA, TSLA...'}
                  className="flex-1 px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-white text-xs font-mono font-bold tracking-wider placeholder:text-slate-500 outline-none uppercase"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !symbol.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Doğrulanıyor...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Doğrula & Ekle</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {market === 'BIST'
                  ? '💡 .IS uzantısı yazmanıza gerek yoktur, otomatik algılanır.'
                  : '💡 ABD hisseleri için doğrudan sembolü girin (örn: PLTR, BABA, COIN).'}
              </p>
            </div>
          </form>

          {/* Feedback alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-danger-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-danger-300">Geçersiz Sembol / Veri Hatası</p>
                <p className="text-danger-400/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-300">Doğrulama Başarılı!</p>
                <p className="text-emerald-400/90 mt-0.5">{success}</p>
              </div>
            </div>
          )}

          {/* User Custom Stock List */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Özel Takip Listeniz ({customStocks.length})</span>
              </h3>
              {loadingList && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
            </div>

            {customStocks.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Henüz özel eklenen hisse yok. Yukarıdaki alandan ekleyebilirsiniz.
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {customStocks.map((stock) => (
                  <div
                    key={stock.ticker}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {stock.market === 'BIST' ? '🇹🇷' : '🇺🇸'}
                      </span>
                      <span className="font-bold text-white font-mono">{stock.displayTicker}</span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                        {stock.market}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteStock(stock.ticker)}
                      className="p-1 rounded-lg text-slate-500 hover:text-danger-400 hover:bg-danger-500/10 transition-colors cursor-pointer"
                      title="Takip listesinden kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};