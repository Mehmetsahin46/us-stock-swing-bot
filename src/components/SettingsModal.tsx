'use client';

import React, { useState } from 'react';
import { MarketPortfolio } from '@/lib/types';
import { X, Save, RotateCcw, ShieldCheck, DollarSign, Percent, Lock, Sliders } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bistPortfolio: MarketPortfolio;
  usPortfolio: MarketPortfolio;
  cryptoPortfolio?: MarketPortfolio;
  onSave: (bist: MarketPortfolio, us: MarketPortfolio, crypto?: MarketPortfolio) => void;
  onResetMarket: (market: 'BIST' | 'US' | 'CRYPTO') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  bistPortfolio,
  usPortfolio,
  cryptoPortfolio,
  onSave,
  onResetMarket
}) => {
  const [bist, setBist] = useState<MarketPortfolio>({ ...bistPortfolio });
  const [us, setUs] = useState<MarketPortfolio>({ ...usPortfolio });
  const [crypto, setCrypto] = useState<MarketPortfolio>(
    cryptoPortfolio ? { ...cryptoPortfolio } : { ...usPortfolio, market: 'CRYPTO', currency: 'USDT', currencySymbol: '₮' }
  );
  const [activeTab, setActiveTab] = useState<'BIST' | 'US' | 'CRYPTO'>('BIST');

  if (!isOpen) return null;

  const currentPort = activeTab === 'BIST' ? bist : activeTab === 'US' ? us : crypto;
  const updateCurrentPort = (updater: Partial<MarketPortfolio>) => {
    if (activeTab === 'BIST') setBist(prev => ({ ...prev, ...updater }));
    else if (activeTab === 'US') setUs(prev => ({ ...prev, ...updater }));
    else setCrypto(prev => ({ ...prev, ...updater }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#0f172a] border border-slate-700/80 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Kişiselleştirilmiş Robot Ayarları</h2>
              <p className="text-xs text-slate-400">Nakit tamponu ve risk parametrelerini özelleştirin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Market Selector Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs gap-1">
          <button
            onClick={() => setActiveTab('BIST')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'BIST' ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🇹🇷 BIST
          </button>
          <button
            onClick={() => setActiveTab('US')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'US' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🇺🇸 ABD
          </button>
          <button
            onClick={() => setActiveTab('CRYPTO')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'CRYPTO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🪙 Kripto (7/24)
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 text-xs">
          {/* 1. Safe Cash Buffer Slider */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Güvenli Nakit Tamponu (Safe Cash Buffer)</span>
              </label>
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300">
                %{currentPort.cashReservePct ?? 25} Nakitte Sakla
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={currentPort.cashReservePct ?? 25}
              onChange={e => updateCurrentPort({ cashReservePct: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>%0 (Tüm Kasayı Kullan)</span>
              <span>%25 (Önerilen)</span>
              <span>%50 (Maksimum Koruma)</span>
            </div>
          </div>

          {/* 2. Capital & Risk */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <label className="text-slate-300 font-semibold">Başlangıç Sermayesi ({currentPort.currencySymbol})</label>
              <input
                type="number"
                value={currentPort.initialBalance}
                onChange={e => updateCurrentPort({ initialBalance: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold outline-none focus:border-primary-500"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <label className="text-slate-300 font-semibold">Tek İşlem Risk Payı (%)</label>
              <input
                type="number"
                step="0.5"
                value={currentPort.riskPerTradePct}
                onChange={e => updateCurrentPort({ riskPerTradePct: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* 3. Toggles */}
          <div className="space-y-2">
            <label className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-white block">🤖 Otomatik Alım (Auto-Trade)</span>
                <span className="text-[11px] text-slate-400">Sinyal geldiğinde otomatik pozisyon açılsın.</span>
              </div>
              <input
                type="checkbox"
                checked={currentPort.autoTrade}
                onChange={e => updateCurrentPort({ autoTrade: e.target.checked })}
                className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-white block">🎯 Kademeli Kâr Alma (%50 TP1)</span>
                <span className="text-[11px] text-slate-400">TP1 seviyesinde yarısını satıp stopu maliyete çek.</span>
              </div>
              <input
                type="checkbox"
                checked={currentPort.usePartialTakeProfit}
                onChange={e => updateCurrentPort({ usePartialTakeProfit: e.target.checked })}
                className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-white block">🛡️ Başa-Baş Takip Eden Stop (Trailing)</span>
                <span className="text-[11px] text-slate-400">Kâra geçen işlemlerde zarara düşüşü engelle.</span>
              </div>
              <input
                type="checkbox"
                checked={currentPort.useBreakevenTrailing}
                onChange={e => updateCurrentPort({ useBreakevenTrailing: e.target.checked })}
                className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Reset Market Action */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm(`${activeTab} portföyünü ve işlem geçmişini sıfırlamak istediğinize emin misiniz?`)) {
                  onResetMarket(activeTab);
                }
              }}
              className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{activeTab} Portföyünü Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
          >
            İptal
          </button>
          <button
            onClick={() => {
              onSave(bist, us, crypto);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-md shadow-primary-500/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Ayarları Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
