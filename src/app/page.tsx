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
  manuallyClosePositionInMarket 
} from '@/lib/portfolioManager';
import { INITIAL_DUAL_STATE } from '@/lib/constants';
import { mergeDualStates } from '@/lib/stateSync';
import { LayoutDashboard, Radio, History, PlayCircle, ShieldCheck, Bell, ShieldAlert } from 'lucide-react';

const STORAGE_KEY = 'dual_market_swing_portfolio_v5';

export default function HomePage() {
  const [dualState, setDualState] = useState<DualPortfolioState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn(e);
      }
    }
    return INITIAL_DUAL_STATE;
  });

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

  // 1. Sync & Merge with Server on initial load
  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      if (data.success && data.state) {
        setDualState((prev) => {
          const merged = mergeDualStates(prev, data.state);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch (err) {}
          return merged;
        });
      }
    } catch (e) {
      console.warn('Fallback to local storage:', e);
    }
  }, []);

  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);

  // Persist changes to both localStorage and Server
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
      console.error('Error persisting state:', err);
    }
  }

  // 2. Scan Market & Auto-Execute with Smart Merge
  async function handleScanMarket() {
    setIsScanning(true);
    try {
      // Step 1: Call cron which scans all 200 stocks, updates positions, and auto-trades
      const cronRes = await fetch('/api/cron');
      const cronData = await cronRes.json();

      // Step 2: Sync state from server (includes updated PnL, new positions, closed trades)
      await syncWithServer();

      // Step 3: Fetch scan results for the Scanner tab display
      try {
        const scanRes = await fetch('/api/market/scan?market=ALL');
        const scanData = await scanRes.json();
        if (scanData.success && scanData.data) {
          setScanResults(scanData.data);
        }
      } catch {
        // Scanner tab data is optional - don't block if it fails
      }

      if (cronData.logs && cronData.logs.length > 0) {
        showToast(`İşlem: ${cronData.logs.slice(0, 2).join(' | ')}`);
      } else {
        showToast('Piyasalar tarandı ve pozisyonlar güncellendi.');
      }
    } catch (err) {
      console.error(err);
      showToast('Piyasa taranırken bağlantı hatası oluştu.');
    } finally {
      setIsScanning(false);
    }
  }

  useEffect(() => {
    handleScanMarket();
    const interval = setInterval(handleScanMarket, 90000);
    return () => clearInterval(interval);
  }, []);

  const currentPortfolio: MarketPortfolio = activeMarket === 'BIST' ? dualState.bist : dualState.us;
  const currentRegime = activeMarket === 'BIST' ? dualState.bistRegime : dualState.usRegime;

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

  function handleSaveSettings(newBist: MarketPortfolio, newUs: MarketPortfolio) {
    const updated: DualPortfolioState = {
      ...dualState,
      bist: newBist,
      us: newUs
    };
    persistState(updated);
    showToast('Ayarlar kaydedildi.');
  }

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
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.state));
        } catch (e) {}
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
      <Header
        onScan={handleScanMarket}
        isScanning={isScanning}
        onOpenSettings={() => setSettingsOpen(true)}
        lastScanTime={dualState.lastScanTime}
        activeMarket={activeMarket}
        onSelectMarket={setActiveMarket}
        bistAuto={dualState.bist.autoTrade}
        usAuto={dualState.us.autoTrade}
        bistRegime={dualState.bistRegime}
        usRegime={dualState.usRegime}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-surface border border-primary-500/40 text-primary-300 text-xs font-medium shadow-2xl animate-fade-in flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-400" />
          <span>{toastMessage}</span>
        </div>
      )}

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

          <div className="hidden md:flex items-center gap-2 text-[11px] text-muted">
            <span className="px-2 py-0.5 rounded bg-card border border-border">
              Bütçe: <strong className="text-white">{activeMarket === 'BIST' ? '10.000 TL' : '500 USD'}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-card border border-border">
              Risk: <strong className="text-white">%{currentPortfolio.riskPerTradePct}</strong>
            </span>
          </div>
        </div>

        {/* Market Regime Warning if Bearish */}
        {currentRegime && currentRegime.trend === 'BEARISH' && (
          <div className="p-3.5 rounded-xl bg-danger-500/10 border border-danger-500/30 text-danger-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-danger-400 flex-shrink-0" />
              <div>
                <strong className="text-white">Piyasa Koruma Modu:</strong> {currentRegime.reason}
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-danger-500/20 text-danger-300 font-semibold uppercase flex-shrink-0">
              Seçici Alım
            </span>
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <PortfolioCards portfolio={currentPortfolio} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">
                    {activeMarket === 'BIST' ? '🇹🇷 BIST Açık Pozisyonlar (1-14 Gün)' : '🇺🇸 ABD Açık Pozisyonlar (1-14 Gün)'}
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

                {/* Safety & Automation Card */}
                <div className="p-4 rounded-xl bg-card border border-border text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{activeMarket === 'BIST' ? 'BIST' : 'ABD'} Güvenlik Kalkanı</span>
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                      Korumalar Aktif
                    </span>
                  </div>
                  <ul className="text-muted space-y-1.5 list-disc pl-4 text-[11px]">
                    <li><strong>Kademeli Kâr Alma:</strong> TP1'de %50 kâr cebe konur, stop maliyete çekilir.</li>
                    <li><strong>Başa-Baş Stop:</strong> Kâra geçmiş işlem asla zararla kapanmaz.</li>
                    <li><strong>Hisse Sınırı:</strong> Tek hisseye en fazla %20 sermaye bağlanır (Dengeli sepet).</li>
                    <li><strong>Sektör Sınırı:</strong> Aynı sektörden en fazla 4 hisseye izin verilir.</li>
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
