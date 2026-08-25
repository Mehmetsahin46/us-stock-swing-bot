'use client';

import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Settings, CheckCircle2, Clock, CloudLightning } from 'lucide-react';
import { MarketType } from '@/lib/types';

interface HeaderProps {
  onScan: () => void;
  isScanning: boolean;
  onOpenSettings: () => void;
  lastScanTime: string | null;
  activeMarket: MarketType;
  onSelectMarket: (m: MarketType) => void;
  bistAuto: boolean;
  usAuto: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onScan,
  isScanning,
  onOpenSettings,
  lastScanTime,
  activeMarket,
  onSelectMarket,
  bistAuto,
  usAuto
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

      // US Market (9:30 - 16:00 ET, Mon-Fri)
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

      // BIST Market (10:00 - 18:00 TSİ, Mon-Fri)
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
    <header className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 shadow-lg shadow-primary-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-white tracking-tight">Global & BIST Swing Bot</h1>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CloudLightning className="w-3 h-3 text-emerald-400" />
              Canlıda Aktif
            </span>
          </div>
          <p className="text-xs text-muted">
            🇹🇷 10.000 TL BIST & 🇺🇸 500$ ABD Otomatik Swing Botu
          </p>
        </div>
      </div>

      {/* Center Market Switcher */}
      <div className="flex items-center bg-card border border-border rounded-xl p-1 text-xs">
        <button
          onClick={() => onSelectMarket('BIST')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeMarket === 'BIST'
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🇹🇷 Borsa İstanbul</span>
          <span className="text-[10px] opacity-80">(₺10.000)</span>
          {bistAuto && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        </button>

        <button
          onClick={() => onSelectMarket('US')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeMarket === 'US'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🇺🇸 ABD Borsası</span>
          <span className="text-[10px] opacity-80">($500)</span>
          {usAuto && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center flex-wrap gap-2">
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

        {lastScanTime && (
          <div className="hidden xl:flex items-center gap-1 text-xs text-muted px-2 py-1 rounded-lg bg-card border border-border">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(lastScanTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}

        <button
          onClick={onScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 active:scale-95 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-primary-500/20 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Taranıyor...' : 'Piyasaları Tara'}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-card hover:bg-slate-800 border border-border text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Bot Ayarları"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
