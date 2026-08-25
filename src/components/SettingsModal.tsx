'use client';

import React, { useState } from 'react';
import { MarketPortfolio } from '@/lib/types';
import { X, Save, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bistPortfolio: MarketPortfolio;
  usPortfolio: MarketPortfolio;
  onSave: (bist: MarketPortfolio, us: MarketPortfolio) => void;
  onResetMarket: (market: 'BIST' | 'US') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  bistPortfolio,
  usPortfolio,
  onSave,
  onResetMarket
}) => {
  const [bist, setBist] = useState<MarketPortfolio>({ ...bistPortfolio });
  const [us, setUs] = useState<MarketPortfolio>({ ...usPortfolio });
  const [activeTab, setActiveTab] = useState<'BIST' | 'US'>('BIST');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold text-white">Bot ve Bütçe Ayarları</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-card border border-border rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveTab('BIST')}
            className={`flex-1 py-1.5 rounded-md font-bold transition-colors ${activeTab === 'BIST' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            🇹🇷 Borsa İstanbul (₺10.000)
          </button>
          <button
            onClick={() => setActiveTab('US')}
            className={`flex-1 py-1.5 rounded-md font-bold transition-colors ${activeTab === 'US' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            🇺🇸 ABD Borsası ($500)
          </button>
        </div>

        {activeTab === 'BIST' ? (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">BIST Başlangıç Sermayesi (TL)</label>
              <input
                type="number"
                value={bist.initialBalance}
                onChange={(e) => setBist({ ...bist, initialBalance: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">İşlem Başına Risk Oranı (%)</label>
              <input
                type="number"
                step="0.5"
                value={bist.riskPerTradePct}
                onChange={(e) => setBist({ ...bist, riskPerTradePct: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-white focus:outline-none focus:border-primary-500"
              />
              <span className="text-[11px] text-muted">10.000 TL için %2 risk = 200 TL maks zarar/işlem.</span>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Maksimum Eşzamanlı Açık Pozisyon</label>
              <input
                type="number"
                min="1"
                max="10"
                value={bist.maxOpenPositions}
                onChange={(e) => setBist({ ...bist, maxOpenPositions: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
              <div>
                <div className="font-semibold text-white">BIST Otomatik Al-Sat (Auto-Trade)</div>
                <div className="text-[11px] text-muted">Canlı piyasada BIST sinyalleriyle otomatik işlem aç</div>
              </div>
              <input
                type="checkbox"
                checked={bist.autoTrade}
                onChange={(e) => setBist({ ...bist, autoTrade: e.target.checked })}
                className="w-4 h-4 rounded text-primary-500 cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">ABD Başlangıç Sermayesi ($)</label>
              <input
                type="number"
                value={us.initialBalance}
                onChange={(e) => setUs({ ...us, initialBalance: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">İşlem Başına Risk Oranı (%)</label>
              <input
                type="number"
                step="0.5"
                value={us.riskPerTradePct}
                onChange={(e) => setUs({ ...us, riskPerTradePct: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-white focus:outline-none focus:border-primary-500"
              />
              <span className="text-[11px] text-muted">500$ için %2 risk = 10$ maks zarar/işlem.</span>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Maksimum Eşzamanlı Açık Pozisyon</label>
              <input
                type="number"
                min="1"
                max="10"
                value={us.maxOpenPositions}
                onChange={(e) => setUs({ ...us, maxOpenPositions: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
              <div>
                <div className="font-semibold text-white">ABD Otomatik Al-Sat (Auto-Trade)</div>
                <div className="text-[11px] text-muted">Canlı piyasada NYSE/NASDAQ sinyalleriyle otomatik işlem aç</div>
              </div>
              <input
                type="checkbox"
                checked={us.autoTrade}
                onChange={(e) => setUs({ ...us, autoTrade: e.target.checked })}
                className="w-4 h-4 rounded text-primary-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <button
            onClick={() => {
              if (confirm(`${activeTab} portföyünü sıfırlamak istediğinize emin misiniz?`)) {
                onResetMarket(activeTab);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 border border-danger-500/30 text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{activeTab} Portföyünü Sıfırla</span>
          </button>

          <button
            onClick={() => {
              onSave(bist, us);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold shadow-md cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
