'use client';

import React, { useState } from 'react';
import { TradePosition, MarketType } from '@/lib/types';
import { X, Target, AlertOctagon, Sliders, CheckCircle2, TrendingUp } from 'lucide-react';

interface EditPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: TradePosition | null;
  market: MarketType;
  onSave: (positionId: string, stopLoss: number, target1: number, target2: number) => Promise<void>;
}

export const EditPositionModal: React.FC<EditPositionModalProps> = ({
  isOpen,
  onClose,
  position,
  market,
  onSave
}) => {
  if (!isOpen || !position) return null;

  const [stopLoss, setStopLoss] = useState<number>(position.stopLoss);
  const [target1, setTarget1] = useState<number>(position.target1);
  const [target2, setTarget2] = useState<number>(position.target2);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const currSign = position.currency === 'TRY' ? '₺' : position.currency === 'USDT' ? '₮' : '$';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(position.id, stopLoss, target1, target2);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>{position.displayTicker}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                Manuel Seviye Yönetimi
              </span>
            </h2>
            <p className="text-xs text-slate-400">Giriş: {currSign}{position.entryPrice.toFixed(2)} | Güncel: {currSign}{position.currentPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          {/* Stop Loss Input */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-rose-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Manuel Stop-Loss Seviyesi ({currSign})</span>
              </label>
              <span className="font-mono text-[11px] text-slate-400">
                Risk: %{(((position.entryPrice - stopLoss) / position.entryPrice) * 100).toFixed(1)}
              </span>
            </div>
            <input
              type="number"
              step="any"
              value={stopLoss}
              onChange={e => setStopLoss(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm outline-none focus:border-rose-500"
              required
            />
            <p className="text-[10px] text-slate-400">Fiyat bu seviyenin altına düştüğünde robot otomatik olarak pozisyonu zararı keserek kapatır.</p>
          </div>

          {/* TP1 Input */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>1. Kâr Hedefi - TP1 ({currSign})</span>
              </label>
              <span className="font-mono text-[11px] text-emerald-400">
                +%{(((target1 - position.entryPrice) / position.entryPrice) * 100).toFixed(1)}
              </span>
            </div>
            <input
              type="number"
              step="any"
              value={target1}
              onChange={e => setTarget1(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm outline-none focus:border-emerald-500"
              required
            />
            <p className="text-[10px] text-slate-400">Bu fiyata ulaşıldığında %50 kâr realize edilir ve stop maliyet seviyesine çekilir.</p>
          </div>

          {/* TP2 Input */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-amber-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Ana Tepe Noktası - TP2 ({currSign})</span>
              </label>
              <span className="font-mono text-[11px] text-amber-300 font-bold">
                +%{(((target2 - position.entryPrice) / position.entryPrice) * 100).toFixed(1)}
              </span>
            </div>
            <input
              type="number"
              step="any"
              value={target2}
              onChange={e => setTarget2(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm outline-none focus:border-amber-500"
              required
            />
            <p className="text-[10px] text-slate-400">Ana kâr hedefi ve nihai çıkış noktasıdır.</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Kaydediliyor...' : 'Seviyeleri Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
