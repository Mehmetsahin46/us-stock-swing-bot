'use client';

import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Settings, CheckCircle2, Clock, CloudLightning, ShieldCheck, ShieldAlert, Bell, BellRing, Smartphone, HeartPulse, FileText, Sliders, Search } from 'lucide-react';
import { MarketRegime, MarketType } from '@/lib/types';
import { requestNotificationPermission, getNotificationPermission } from '@/lib/notificationManager';

interface HeaderProps {
  onScan: () => void;
  isScanning: boolean;
  onOpenSettings: () => void;
  onOpenSearch?: () => void;
  onOpenAddStock?: () => void;
  onOpenInstall?: () => void;
  onOpenHealth?: () => void;
  onOpenDailyReport?: () => void;
  onOpenNotifRules?: () => void;
  onOpenSecurity?: () => void;
  lastScanTime: string | null;
  activeMarket: MarketType;
  onSelectMarket: (m: MarketType) => void;
  bistAuto: boolean;
  usAuto: boolean;
  bistEquity?: number;
  usEquity?: number;
  bistRegime: MarketRegime | null;
  usRegime: MarketRegime | null;
}

export const Header: React.FC<HeaderProps> = ({
  onScan,
  isScanning,
  onOpenSettings,
  onOpenSearch,
  onOpenAddStock,
  onOpenInstall,
  onOpenHealth,
  onOpenDailyReport,
  onOpenNotifRules,
  onOpenSecurity,
  lastScanTime,
  activeMarket,
  onSelectMarket,
  bistAuto,
  usAuto,
  bistEquity = 10000,
  usEquity = 500,
  bistRegime,
  usRegime
}) => {
  const [usStatus, setUsStatus] = useState<{ isOpen: boolean; text: string }>({
    isOpen: false,
    text: 'NYSE: Kontrol...'
  });
  const [bistStatus, setBistStatus] = useState<{ isOpen: boolean; text: string }>({
    isOpen: false,
    text: 'BIST: Kontrol...'
  });
  const [notifPermission, setNotifPermission] = useState<string>('default');

  useEffect(() => {
    setNotifPermission(getNotificationPermission());

    function checkPiyasalar() {
      const now = new Date();
      const day = now.getUTCDay(); // 0 = Pazar, 6 = Cts
      const isHaftaIci = day >= 1 && day <= 5;

      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcTotal = utcHours * 60 + utcMinutes;

      // BIST (07:00 - 15:00 UTC = 10:00 - 18:00 TSİ)
      const bistAcik = isHaftaIci && utcTotal >= 420 && utcTotal < 900;
      setBistStatus({
        isOpen: bistAcik,
        text: bistAcik ? 'BIST: AÇIK 🟢' : 'BIST: KAPALI 🔴'
      });

      // NYSE (13:30 - 20:00 UTC = 16:30 - 23:00 TSİ)
      const nyseAcik = isHaftaIci && utcTotal >= 810 && utcTotal < 1200;
      setUsStatus({
        isOpen: nyseAcik,
        text: nyseAcik ? 'NYSE: AÇIK 🟢' : 'NYSE: KAPALI 🔴'
      });
    }

    checkPiyasalar();
    const interval = setInterval(checkPiyasalar, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-border/80 bg-background/95 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
      {/* Brand & Market Switcher */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-accent-500 p-0.5 shadow-lg shadow-primary-500/20 flex items-center justify-center flex-shrink-0">
          <Activity className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>SwingBot Pro</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-primary-500/20 text-primary-400 border border-primary-500/30">
                Kuant 2.0
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-muted hidden sm:block">
            BIST & ABD Çoklu Strateji & Kuant Analiz Terminali
          </p>
        </div>

        {/* Global Market Switcher (3 Piyasalı) */}
        <div className="flex items-center bg-card border border-border rounded-xl p-0.5 text-xs ml-1 sm:ml-3">
          <button
            onClick={() => onSelectMarket('BIST')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeMarket === 'BIST'
                ? 'bg-red-500/30 text-white border border-red-500/50 shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${bistStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span>🇹🇷 BIST</span>
          </button>
          <button
            onClick={() => onSelectMarket('US')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeMarket === 'US'
                ? 'bg-blue-500/30 text-white border border-blue-500/50 shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${usStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span>🇺🇸 ABD</span>
          </button>
          <button
            onClick={() => onSelectMarket('CRYPTO')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeMarket === 'CRYPTO'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50 shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>🪙 Kripto</span>
          </button>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/20 active:scale-95"
            title="500+ Hisse ve Sembol Ara"
          >
            <Search className="w-3.5 h-3.5 text-indigo-300" />
            <span>Hisse Ara</span>
            <kbd className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono">⌘K</kbd>
          </button>
        )}

        {onOpenHealth && (
          <button
            onClick={onOpenHealth}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Sistem & Veri Sağlığı (Heartbeat)"
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sistem Sağlığı</span>
          </button>
        )}

        {onOpenDailyReport && (
          <button
            onClick={onOpenDailyReport}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
            title="Günlük AI & Kuant Yönetici Raporu"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Günlük Rapor</span>
          </button>
        )}

        {onOpenAddStock && (
          <button
            onClick={onOpenAddStock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Manuel Sembol / Hisse Ekle"
          >
            <span className="text-sm font-bold">+</span>
            <span className="hidden sm:inline">Hisse Ekle</span>
          </button>
        )}

        <button
          onClick={onScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 active:scale-95 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-primary-500/20 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Taranıyor...' : 'Tara & Oto-Trade'}</span>
        </button>

        {onOpenNotifRules && (
          <button
            onClick={onOpenNotifRules}
            className="p-1.5 rounded-lg bg-card hover:bg-slate-800 border border-border text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Gelişmiş Bildirim Kuralları"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
          </button>
        )}

        {onOpenInstall && (
          <button
            onClick={onOpenInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Telefona Mobil Uygulama Olarak Yükle"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Uygulama İndir</span>
          </button>
        )}

        {onOpenSecurity && (
          <button
            onClick={onOpenSecurity}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Siber Güvenlik, Karantina & Kill Switch Merkezi"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Güvenlik Kalkanı</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-card hover:bg-slate-800 border border-border text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Bot ve Güvenlik Ayarları"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};