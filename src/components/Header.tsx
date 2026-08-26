'use client';

import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Settings, CheckCircle2, Clock, CloudLightning, ShieldCheck, ShieldAlert } from 'lucide-react';
import { MarketRegime, MarketType } from '@/lib/types';

interface HeaderProps {
  onScan: () => void;
  isScanning: boolean;
  onOpenSettings: () => void;
  onOpenAddStock?: () => void;
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
  onOpenAddStock,
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

  useEffect(() => {
    function checkHours() {
      const now = new Date();

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

  const currentRegime = activeMarket === 'BIST' ? bistRegime : usRegime;

  return (
    <header className="border-b border-border bg-surface/95 backdrop-blur-lg sticky top-0 z-40 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 via-primary-500 to-indigo-600 shadow-lg shadow-primary-500/25">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg text-white tracking-tight">Global & BIST Swing Bot</h1>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Canlıda Aktif
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            🇹🇷 BIST (10:00-18:00) & 🇺🇸 NYSE/NASDAQ (16:30-23:00) Otomatik Ticaret
          </p>
        </div>
      </div>

      {/* Modern High-End Market Switcher */}
      <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1.5 shadow-inner gap-1.5">
        <button
          onClick={() => onSelectMarket('BIST')}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeMarket === 'BIST'
              ? 'bg-gradient-to-r from-red-600/30 to-red-500/20 text-white border border-red-500/50 shadow-md shadow-red-500/10 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span className="text-base leading-none">🇹🇷</span>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span>Borsa İstanbul</span>
              {bistAuto && <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30" />}
            </div>
            <div className="text-[10px] text-red-400 font-mono font-medium">
              ₺{bistEquity.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </button>

        <div className="w-px h-6 bg-slate-700/60" />

        <button
          onClick={() => onSelectMarket('US')}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeMarket === 'US'
              ? 'bg-gradient-to-r from-blue-600/30 to-indigo-500/20 text-white border border-blue-500/50 shadow-md shadow-blue-500/10 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span className="text-base leading-none">🇺🇸</span>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span>ABD Borsaları</span>
              {usAuto && <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30" />}
            </div>
            <div className="text-[10px] text-blue-400 font-mono font-medium">
              ${usEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </button>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        {currentRegime && (
          <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
            currentRegime.trend === 'BULLISH'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-danger-500/10 border-danger-500/30 text-danger-400'
          }`} title={currentRegime.reason}>
            {currentRegime.trend === 'BULLISH' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            <span>{currentRegime.trend === 'BULLISH' ? 'Endeks: Boğa' : 'Endeks: Ayı (Korumada)'}</span>
          </div>
        )}

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

        {onOpenAddStock && (
          <button
            onClick={onOpenAddStock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Manuel Sembol / Hisse Ekle"
          >
            <span className="text-sm font-bold">+</span>
            <span>Hisse Ekle</span>
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
