'use client';

import React, { useState } from 'react';
import { BotSettings } from '@/lib/types';
import { X, Save, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BotSettings;
  onSave: (newSettings: BotSettings) => void;
  onResetPortfolio: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onResetPortfolio
}) => {
  const [form, setForm] = useState<BotSettings>({ ...settings });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold text-white">Bot ve Risk Ayarları</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Başlangıç Sermayesi ($)
            </label>
            <input
              type="number"
              value={form.startingCapital}
              onChange={(e) => setForm({ ...form, startingCapital: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              İşlem Başına Risk Oranı (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={form.riskPerTradePct}
              onChange={(e) => setForm({ ...form, riskPerTradePct: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-white focus:outline-none focus:border-primary-500"
            />
            <span className="text-[11px] text-muted">Önerilen: %1.0 - %2.5 arasıdır.</span>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Maksimum Elde Tutma Süresi (Gün)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={form.maxHoldingDays}
              onChange={(e) => setForm({ ...form, maxHoldingDays: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-white focus:outline-none focus:border-primary-500"
            />
            <span className="text-[11px] text-muted">1 ila 14 gün swing standardıdır.</span>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Maksimum Eşzamanlı Pozisyon Sayısı
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={form.maxOpenPositions}
              onChange={(e) => setForm({ ...form, maxOpenPositions: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
            <div>
              <div className="font-semibold text-white">Otomatik Pozisyon Açma (Auto-Trade)</div>
              <div className="text-[11px] text-muted">Her taramada onay almadan sanal işlem aç</div>
            </div>
            <input
              type="checkbox"
              checked={form.autoTrade}
              onChange={(e) => setForm({ ...form, autoTrade: e.target.checked })}
              className="w-4 h-4 rounded text-primary-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <button
            onClick={() => {
              if (confirm('Sanal portföyü sıfırlamak istediğinize emin misiniz?')) {
                onResetPortfolio();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 border border-danger-500/30 text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Portföyü Sıfırla</span>
          </button>

          <button
            onClick={() => {
              onSave(form);
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
