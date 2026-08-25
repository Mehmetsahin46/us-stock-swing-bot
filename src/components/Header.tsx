'use client';

import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Settings, CheckCircle2, Clock } from 'lucide-react';

interface HeaderProps {
  onScan: () => void;
  isScanning: boolean;
  onOpenSettings: () => void;
  lastScanTime: string | null;
  autoTrade: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onScan,
  isScanning,
  onOpenSettings,
  lastScanTime,
  autoTrade
}) => {
  const [usStatus, setUsStatus] = useState<{ isOpen: boolean; text: string }>({
    isOpen: false,
    text: 'NYSE: Kontrol...'
  });
  const [bistStatus, setBistStatus] = useState<{ isOpen: boolean; text: string }>({
    isOpen: false,
    text: 'BIST: Kontrol...'
  });

  useEffect(() => {
    function checkHours() {
      const now = new Date();

      // 1. Check US Market (9:30 - 16:00 ET, Mon-Fri)
      const nyOptions: Intl.DateTimeFormatOptions = { timeZone: 'America/New_York', hour12: false };
      const nyDay = new Intl.DateTimeFormat('en-US', { ...nyOptions, weekday: 'short' }).format(now);
      const nyHour = parseInt(new Intl.DateTimeFormat('en-US', { ...nyOptions, hour: 'numeric' }).format(now), 10);
      const nyMin = parseInt(new Intl.DateTimeFormat('en-US', { ...nyOptions, minute: 'numeric' }).format(now), 10);
      const isNyWeekday = !['Sat', 'Sun'].includes(nyDay);
      const nyMinutes = nyHour * 60 + nyMin;
      const isNyOpen = isNyWeekday && nyMinutes >= 570 && nyMinutes < 960;
      setUsStatus({
        isOpen: isNyOpen,
        text: isNyOpen ? '🇺🇸 ABD: AÇIK' : '🇺🇸 ABD: KAPALI'
      });

      // 2. Check BIST Market (10:00 - 18:00 TSİ, Mon-Fri)
      const istOptions: Intl.DateTimeFormatOptions = { timeZone: 'Europe/Istanbul', hour12: false };
      const istDay = new Intl.DateTimeFormat('en-US', { ...istOptions, weekday: 'short' }).format(now);
      const istHour = parseInt(new Intl.DateTimeFormat('en-US', { ...istOptions, hour: 'numeric' }).format(now), 10);
      const istMin = parseInt(new Intl.DateTimeFormat('en-US', { ...istOptions, minute: 'numeric' }).format(now), 10);
      const isIstWeekday = !['Sat', 'Sun'].includes(istDay);
      const istMinutes = istHour * 60 + istMin;
      const isBistOpen = isIstWeekday && istMinutes >= 600 && istMinutes < 1080;
      setBistStatus({
        isOpen: isBistOpen,
        text: isBistOpen ? '🇹🇷 BIST: AÇIK' : '🇹🇷 BIST: KAPALI'
      });
    }

    checkHours();
    const interval = setInterval(checkHours, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 shadow-lg shadow-primary-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-white tracking-tight">Global & BIST Swing Bot</h1>
            <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
              1-14 Gün Demo
            </span>
          </div>
          <p className="text-xs text-muted">
            ABD & Borsa İstanbul Otomatik Swing Simülatörü
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
          bistStatus.isOpen 
            ? 'bg-primary-500/10 border-primary-500/30 text-primary-400' 
            : 'bg-slate-800/80 border-slate-700 text-slate-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${bistStatus.isOpen ? 'bg-primary-500 animate-pulse' : 'bg-slate-500'}`} />
          <span>{bistStatus.text}</span>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
          usStatus.isOpen 
            ? 'bg-primary-500/10 border-primary-500/30 text-primary-400' 
            : 'bg-slate-800/80 border-slate-700 text-slate-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${usStatus.isOpen ? 'bg-primary-500 animate-pulse' : 'bg-slate-500'}`} />
          <span>{usStatus.text}</span>
        </div>

        {autoTrade && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Oto-Trade</span>
          </div>
        )}

        {lastScanTime && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted px-2.5 py-1.5 rounded-lg bg-card border border-border">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(lastScanTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}

        <button
          onClick={onScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 active:scale-95 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-primary-500/20 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Taranıyor...' : 'Piyasaları Tara'}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-card hover:bg-slate-800 border border-border text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Bot Ayarları"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
