'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { PortfolioCards } from '@/components/PortfolioCards';
import { ActiveTrades } from '@/components/ActiveTrades';
import { ScannerView } from '@/components/ScannerView';
import { TradeHistory } from '@/components/TradeHistory';
import { BacktestView } from '@/components/BacktestView';
import { EquityChart } from '@/components/EquityChart';
import { SettingsModal } from '@/components/SettingsModal';
import { 
  DualPortfolioState, 
  MarketPortfolio,
  MarketType, 
  Signal, 
  StockScanResult 
} from '@/lib/types';
import { 
  openPositionForMarket, 
  manuallyClosePositionInMarket, 
  updateMarketPositionsWithQuotes 
} from '@/lib/portfolioManager';
import { INITIAL_DUAL_STATE } from '@/lib/constants';
import { LayoutDashboard, Radio, History, PlayCircle, Activity, Bell } from 'lucide-react';

const STORAGE_KEY = 'dual_market_swing_portfolio_v3';

export default function HomePage() {
  const [dualState, setDualState] = useState<DualPortfolioState>(INITIAL_DUAL_STATE);
  const [activeMarket, setActiveMarket] = useState<MarketType>('BIST');
  const [scanResults, setScanResults] = useState<StockScanResult[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SCANNER' | 'HISTORY' | 'BACKTEST'>('DASHBOARD');
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  }

  // 1. Fetch live portfolio from Server API on load & sync with localStorage
  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      if (data.success && data.state) {
        setDualState(data.state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.state));
      }
    } catch (e) {
      console.warn('Could not sync with server, fallback to local storage:', e);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setDualState(JSON.parse(saved));
      }
    }
  }, []);

  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);

  // Persist changes to server and local storage
  async function persistState(newState: DualPortfolioState) {
    setDualState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState })
      });
    } catch (err) {
      console.error('Error persisting state to server:', err);
    }
  }

  // 2. Scan Market & Auto-Execute
  async function handleScanMarket() {
    setIsScanning(true);
    try {
      // Trigger cron endpoint to run automated server-side scan and position evaluation
      const cronRes = await fetch('/api/cron');
      const cronData = await cronRes.json();

      // Fetch latest scan data
      const scanRes = await fetch('/api/market/scan?market=ALL');
      const scanData = await scanRes.json();

      if (scanData.success && scanData.data) {
        setScanResults(scanData.data);
      }

      await syncWithServer();

      if (cronData.logs && cronData.logs.length > 0) {
        showToast(`Piyasalar güncellendi: ${cronData.logs.slice(0, 2).join(' | ')}`);
      } else {
        showToast('Piyasalar tarandı ve açık pozisyonlar güncellendi.');
      }
    } catch (err) {
      console.error(err);
      showToast('Piyasa taranırken bir bağlantı hatası oluştu.');
    } finally {
      setIsScanning(false);
    }
  }

  // Auto-scan on load and every 90 seconds while dashboard is open
  useEffect(() => {
    handleScanMarket();
    const interval = setInterval(handleScanMarket, 90000);
    return () => clearInterval(interval);
  }, []);

  // Current active portfolio
  const currentPortfolio: MarketPortfolio = activeMarket === 'BIST' ? dualState.bist : dualState.us;

  // Open manual trade
  function handleOpenPaperTrade(signal: Signal) {
    const targetPortfolio = signal.market === 'BIST' ? dualState.bist : dualState.us;
    const { portfolio: newPort, success, message } = openPositionForMarket(signal, targetPortfolio);

    if (success) {
      const updated: DualPortfolioState = {
        ...dualState,
        [signal.market === 'BIST' ? 'bist' : 'us']: newPort,
        activityLogs: [
          {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            market: signal.market,
            message,
            type: 'BUY'
          },
          ...dualState.activityLogs.slice(0, 49)
        ]
      };
      persistState(updated);
      showToast(message);
    } else {
      showToast(`Uyarı: ${message}`);
    }
  }

  // Close manual trade
  function handleManualClose(positionId: string) {
    const { portfolio: newPort, success, message } = manuallyClosePositionInMarket(currentPortfolio, positionId);
    if (success) {
      const updated: DualPortfolioState = {
        ...dualState,
        [activeMarket === 'BIST' ? 'bist' : 'us']: newPort,
        activityLogs: [
          {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            market: activeMarket,
            message,
            type: 'SELL'
          },
          ...dualState.activityLogs.slice(0, 49)
        ]
      };
      persistState(updated);
      showToast(message);
    }
  }

  // Save Settings
  function handleSaveSettings(newBist: MarketPortfolio, newUs: MarketPortfolio) {
    const updated: DualPortfolioState = {
      ...dualState,
      bist: newBist,
      us: newUs
    };
    persistState(updated);
    showToast('Ayarlar kaydedildi.');
  }

  // Reset Market
  async function handleResetMarket(market: 'BIST' | 'US') {
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_MARKET', market })
      });
      const data = await res.json();
      if (data.success && data.state) {
        setDualState(data.state);
        showToast(`${market} portföyü sıfırlandı.`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const openPositionTickers = currentPortfolio.positions
    .filter(p => p.status === 'OPEN')
    .map(p => p.ticker);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header
        onScan={handleScanMarket}
        isScanning={isScanning}
        onOpenSettings={() => setSettingsOpen(true)}
        lastScanTime={dualState.lastScanTime}
        activeMarket={activeMarket}
        onSelectMarket={setActiveMarket}
        bistAuto={dualState.bist.autoTrade}
        usAuto={dualState.us.autoTrade}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-surface border border-primary-500/40 text-primary-300 text-xs font-medium shadow-2xl animate-fade-in flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3 overflow-x-auto gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'DASHBOARD'
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-card'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{activeMarket === 'BIST' ? '🇹🇷 BIST Portföyü' : '🇺🇸 ABD Portföyü'}</span>
              {openPositionTickers.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {openPositionTickers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('SCANNER')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'SCANNER'
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-card'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Canlı Piyasa Tarayıcısı</span>
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'HISTORY'
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-card'
              }`}
            >
              <History className="w-4 h-4" />
              <span>İşlem Geçmişi ({currentPortfolio.history.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('BACKTEST')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'BACKTEST'
                  ? 'bg-accent-500/15 text-accent-400 border border-accent-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-card'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Geriye Dönük Test (Backtest)</span>
            </button>
          </div>

          {/* Quick info tag */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-muted">
            <span className="px-2 py-0.5 rounded bg-card border border-border">
              Mevcut Limit: <strong className="text-white">{activeMarket === 'BIST' ? '10.000 TL' : '500 USD'}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-card border border-border">
              Risk: <strong className="text-white">%{currentPortfolio.riskPerTradePct}</strong>
            </span>
          </div>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <PortfolioCards portfolio={currentPortfolio} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">
                    {activeMarket === 'BIST' ? '🇹🇷 BIST 30 Açık Pozisyonlar (1-14 Gün)' : '🇺🇸 ABD Açık Pozisyonlar (1-14 Gün)'}
                  </h2>
                  <span className="text-xs text-muted">
                    {openPositionTickers.length} / {currentPortfolio.maxOpenPositions} Pozisyon
                  </span>
                </div>
                <ActiveTrades
                  positions={currentPortfolio.positions}
                  onManualClose={handleManualClose}
                />
              </div>

              <div className="space-y-4">
                <EquityChart data={currentPortfolio.equityCurve} />

                {/* Automation & Rules Info */}
                <div className="p-4 rounded-xl bg-card border border-border text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>{activeMarket === 'BIST' ? 'BIST' : 'ABD'} Canlı Bot Kuralları</span>
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                      Oto-Alım Açık
                    </span>
                  </div>
                  <ul className="text-muted space-y-1.5 list-disc pl-4 text-[11px]">
                    <li>Başlangıç bütçesi: <strong className="text-white">{activeMarket === 'BIST' ? '10.000 TL' : '$500 USD'}</strong></li>
                    <li>İşlem başına maksimum %{currentPortfolio.riskPerTradePct} sermaye riski.</li>
                    <li>Stop-Loss veya TP2 gerçekleştiğinde otomatik kâr/zarar realizesi.</li>
                    <li>{currentPortfolio.maxHoldingDays} gün dolduğunda vade sonu çıkışı.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE SCANNER */}
        {activeTab === 'SCANNER' && (
          <ScannerView
            results={scanResults}
            onOpenTrade={handleOpenPaperTrade}
            openPositionTickers={openPositionTickers}
          />
        )}

        {/* TAB 3: TRADE HISTORY */}
        {activeTab === 'HISTORY' && (
          <TradeHistory history={currentPortfolio.history} />
        )}

        {/* TAB 4: BACKTEST */}
        {activeTab === 'BACKTEST' && (
          <BacktestView />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        bistPortfolio={dualState.bist}
        usPortfolio={dualState.us}
        onSave={handleSaveSettings}
        onResetMarket={handleResetMarket}
      />
    </div>
  );
}
