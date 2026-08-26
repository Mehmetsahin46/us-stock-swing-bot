'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, ShieldCheck, Zap, Sliders, Volume2 } from 'lucide-react';
import { requestNotificationPermission } from '@/lib/notificationManager';

interface NotificationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RULES_STORAGE_KEY = 'swingbot_notification_rules_v1';

export const NotificationRulesModal: React.FC<NotificationRulesModalProps> = ({ isOpen, onClose }) => {
  const [minScore, setMinScore] = useState<number>(85);
  const [onlyElite, setOnlyElite] = useState<boolean>(false);
  const [notifyOnTp1, setNotifyOnTp1] = useState<boolean>(true);
  const [notifyOnInvalidated, setNotifyOnInvalidated] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RULES_STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.minScore !== undefined) setMinScore(p.minScore);
        if (p.onlyElite !== undefined) setOnlyElite(p.onlyElite);
        if (p.notifyOnTp1 !== undefined) setNotifyOnTp1(p.notifyOnTp1);
        if (p.notifyOnInvalidated !== undefined) setNotifyOnInvalidated(p.notifyOnInvalidated);
        if (p.soundEnabled !== undefined) setSoundEnabled(p.soundEnabled);
      }
    } catch (e) {}
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify({
        minScore,
        onlyElite,
        notifyOnTp1,
        notifyOnInvalidated,
        soundEnabled
      }));
    } catch (e) {}
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#111827] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">Gelişmiş Bildirim Kuralları</h2>
            <p className="text-xs text-slate-400">Hangi sinyallerde telefonunuza bildirim geleceğini özelleştirin</p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 text-xs">
          {/* Rule 1: Min Score */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Minimum Sinyal Skoru Eşiği</span>
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300">
                {minScore} Puan
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="95"
              step="1"
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              className="w-full accent-primary-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Sadece bu puan ve üzerindeki fırsatlarda anlık bildirim tetiklenir.</p>
          </div>

          {/* Rule 2: Only A+ Elite */}
          <label className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-bold text-white block">Sadece A+ Elit Fırsatları Bildir</span>
              <span className="text-[11px] text-slate-400">Bilanço ve hacim katalizörü olan en yüksek kaliteli sinyaller.</span>
            </div>
            <input
              type="checkbox"
              checked={onlyElite}
              onChange={e => setOnlyElite(e.target.checked)}
              className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
            />
          </label>

          {/* Rule 3: TP Hit Notifications */}
          <label className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-bold text-white block">Hedefe Ulaşma (TP1 / TP2) Bildirimleri</span>
              <span className="text-[11px] text-slate-400">Pozisyon kâr hedefine ulaştığında bildirim gönder.</span>
            </div>
            <input
              type="checkbox"
              checked={notifyOnTp1}
              onChange={e => setNotifyOnTp1(e.target.checked)}
              className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
            />
          </label>

          {/* Rule 4: Signal Invalidation Alerts */}
          <label className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-bold text-white block">Sinyal İptal (Invalidated) Uyarıları</span>
              <span className="text-[11px] text-slate-400">Teknik destek kırıldığında anında uyar.</span>
            </div>
            <input
              type="checkbox"
              checked={notifyOnInvalidated}
              onChange={e => setNotifyOnInvalidated(e.target.checked)}
              className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={async () => {
              await requestNotificationPermission();
            }}
            className="text-xs text-indigo-400 hover:underline font-semibold cursor-pointer"
          >
            İzinleri Kontrol Et
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition-all cursor-pointer"
          >
            Kuralları Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};