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
import { AddStockModal } from '@/components/AddStockModal';
import { NewsView } from '@/components/NewsView';
import { InstallPwaModal } from '@/components/InstallPwaModal';
import { SignalAnalyticsView } from '@/components/SignalAnalyticsView';
import { TopOpportunitiesPanel } from '@/components/TopOpportunitiesPanel';
import { MarketHeatmapView } from '@/components/MarketHeatmapView';
import { SignalDetailModal } from '@/components/SignalDetailModal';
import { WatchlistView } from '@/components/WatchlistView';
import { SystemHealthModal } from '@/components/SystemHealthModal';
import { DailyReportModal } from '@/components/DailyReportModal';
import { NotificationRulesModal } from '@/components/NotificationRulesModal';
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
import { sendLocalNotification } from '@/lib/notificationManager';
import { isBISTOpen, isUSOpen } from '@/lib/marketHours';
import { 
  LayoutDashboard, 
  Radio, 
  History, 
  PlayCircle, 
  ShieldCheck, 
  Bell, 
  ShieldAlert, 
  Plus, 
  Newspaper,
  Flame,
  BarChart3,
  LayoutGrid,
  Star
} from 'lucide-react';

const STORAGE_KEY = 'dual_market_swing_portfolio_v7_supabase';

export default function HomePage() {
  const [dualState, setDualState] = useState<DualPortfolioState>(INITIAL_DUAL_STATE);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const [activeMarket, setActiveMarket] = useState<MarketType>('BIST');
  const [scanResults, setScanResults] = useState<StockScanResult[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'TOP_OPPORTUNITIES' | 'SCANNER' | 'HEATMAP' | 'SIGNAL_ANALYTICS' | 'NEWS' | 'WATCHLIST' | 'HISTORY' | 'BACKTEST'
  >('DASHBOARD');
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [addStockOpen, setAddStockOpen] = useState<boolean>(false);
  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [healthModalOpen, setHealthModalOpen] = useState<boolean>(false);
  const [dailyReportModalOpen, setDailyReportModalOpen] = useState<boolean>(false);
  const [notifRulesModalOpen, setNotifRulesModalOpen] = useState<boolean>(false);

  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [selectedResult, setSelectedResult] = useState<StockScanResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  }

  // 1. Sync directly with Supabase server state (Single Source of Truth)
  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      if (data.success && data.state) {
        setDualState(data.state);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.state));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('[Sync] Offline or connection error, using local state.');
    }
  }, []);

  // Save to Supabase
  const saveStateToServer = async (stateToSave: DualPortfolioState) => {
    try {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stateToSave)
      });
    } catch (err) {
      console.error('[Sync] Error posting state to server:', err);
    }
  };

  // Initial Load: local fallback first, then immediate Supabase fetch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bist && parsed.us) {
          setDualState(mergeDualStates(parsed, INITIAL_DUAL_STATE));
        }
      }
    } catch (e) {}

    syncWithServer().finally(() => setIsInitialized(true));
  }, [syncWithServer]);

  // Handle Settings Save
  function handleSaveSettings(newBist: MarketPortfolio, newUs: MarketPortfolio) {
    setDualState(prev => {
      const updated: DualPortfolioState = {
        ...prev,
        bist: newBist,
        us: newUs
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      saveStateToServer(updated);
      return updated;
    });
    showToast('Ayarlar Supabase bulutuna ve yerel hafızaya kaydedildi.');
  }

  // Reset Market
  function handleResetMarket(market: MarketType) {
    setDualState(prev => {
      const updated = JSON.parse(JSON.stringify(prev)) as DualPortfolioState;
      if (market === 'BIST') {
        updated.bist = JSON.parse(JSON.stringify(INITIAL_DUAL_STATE.bist));
      } else {
        updated.us = JSON.parse(JSON.stringify(INITIAL_DUAL_STATE.us));
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      saveStateToServer(updated);
      return updated;
    });
    showToast(`${market} portföyü ve işlem geçmişi sıfırlandı.`);
  }

  // Trigger Live Scan
  async function handleScanMarket() {
    setIsScanning(true);
    try {
      const scanRes = await fetch('/api/market/scan', { cache: 'no-store' });
      const scanData = await scanRes.json();

      if (scanData.success && scanData.results) {
        setScanResults(scanData.results);
      }

      const cronRes = await fetch('/api/cron', { cache: 'no-store' });
      const cronData = await cronRes.json();

      await syncWithServer();

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
    const interval = setInterval(() => {
      if (isBISTOpen() || isUSOpen()) {
        handleScanMarket();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentPortfolio: MarketPortfolio = activeMarket === 'BIST' ? dualState.bist : dualState.us;
  const currentRegime = activeMarket === 'BIST' ? dualState.bistRegime : dualState.usRegime;

  function handleOpenPaperTrade(signal: Signal) {
    const targetPortfolio = signal.market === 'BIST' ? dualState.bist : dualState.us;
    const { portfolio: newPort, success, message } = openPositionForMarket(signal, targetPortfolio);

    if (success) {
      setDualState(prev => {
        const updated = {
          ...prev,
          bist: signal.market === 'BIST' ? newPort : prev.bist,
          us: signal.market === 'US' ? newPort : prev.us,
          activityLogs: [
            {
              id: `log_${Date.now()}_${signal.ticker}`,
              timestamp: new Date().toISOString(),
              market: signal.market,
              message,
              type: 'BUY' as const
            },
            ...prev.activityLogs
          ]
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        saveStateToServer(updated);
        return updated;
      });

      sendLocalNotification(`🎯 Yeni İşlem: ${signal.displayTicker}`, {
        body: `${signal.displayTicker} için ${signal.strategyName} ile alım emri açıldı. Hedef: ${signal.target2}`
      });

      showToast(`Başarılı: ${message}`);
    } else {
      showToast(`Alım Yapılamadı: ${message}`);
    }
  }

  function handleManualClose(positionId: string) {
    const targetPortfolio = activeMarket === 'BIST' ? dualState.bist : dualState.us;
    const { portfolio: newPort, success, message } = manuallyClosePositionInMarket(targetPortfolio, positionId);

    if (success) {
      setDualState(prev => {
        const updated = {
          ...prev,
          bist: activeMarket === 'BIST' ? newPort : prev.bist,
          us: activeMarket === 'US' ? newPort : prev.us,
          activityLogs: [
            {
              id: `log_${Date.now()}_close`,
              timestamp: new Date().toISOString(),
              market: activeMarket,
              message,
              type: 'SELL' as const
            },
            ...prev.activityLogs
          ]
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        saveStateToServer(updated);
        return updated;
      });
      showToast(message);
    } else {
      showToast(message);
    }
  }

  const openPositionTickers = currentPortfolio.positions
    .filter(p => p.status === 'OPEN')
    .map(p => p.ticker);

  const allActiveSignals = scanResults.map(r => r.signal).filter((s): s is Signal => s !== null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onScan={handleScanMarket}
        isScanning={isScanning}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAddStock={() => setAddStockOpen(true)}
        onOpenInstall={() => setInstallModalOpen(true)}
        onOpenHealth={() => setHealthModalOpen(true)}
        onOpenDailyReport={() => setDailyReportModalOpen(true)}
        onOpenNotifRules={() => setNotifRulesModalOpen(true)}
        lastScanTime={dualState.lastScanTime}
        activeMarket={activeMarket}
        onSelectMarket={setActiveMarket}
        bistAuto={dualState.bist.autoTrade}
        usAuto={dualState.us.autoTrade}
        bistEquity={dualState.bist.totalEquity}
        usEquity={dualState.us.totalEquity}
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
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'DASHBOARD'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-card'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{activeMarket === 'BIST' ? '🇹🇷 BIST Portföyü' : '🇺🇸 ABD Portföyü'}</span>
              {openPositionTickers.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                  {openPositionTickers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('TOP_OPPORTUNITIES')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'TOP_OPPORTUNITIES'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/25'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-card'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Günün Fırsatları (A+)</span>
            </button>

            <button
              onClick={() => setActiveTab('SCANNER')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SCANNER'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-card'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Canlı Tarayıcı</span>
            </button>

            <button
              onClick={() => setActiveTab('HEATMAP')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'HEATMAP'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-card'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Isı Haritası</span>
            </button>

            <button
              onClick={() => setActiveTab('SIGNAL_ANALYTICS')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SIGNAL_ANALYTICS'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                  : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-card'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Sinyal Analitiği</span>
            </button>

            <button
              onClick={() => setActiveTab('NEWS')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'NEWS'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-card'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Haberler & Bilanço</span>
            </button>

            <button
              onClick={() => setActiveTab('WATCHLIST')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'WATCHLIST'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-card'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>İzleme Listesi</span>
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'HISTORY'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-card'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>İşlem Geçmişi ({currentPortfolio.history.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('BACKTEST')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'BACKTEST'
                  ? 'bg-accent-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-card'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Backtest</span>
            </button>
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
                    {activeMarket === 'BIST' ? '🇹🇷 BIST Açık Pozisyonlar (60 Gün Trend)' : '🇺🇸 ABD Açık Pozisyonlar (60 Gün Trend)'}
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
                    <li><strong>Dinamik Bütçe Tahsisi:</strong> A+ Elit sinyallere %25, normal sinyallere %10 bütçe.</li>
                    <li><strong>Kademeli Kâr Alma:</strong> TP1'de %50 kâr cebe konur, stop maliyete çekilir.</li>
                    <li><strong>Başa-Baş Stop:</strong> Kâra geçmiş işlem asla zararla kapanmaz.</li>
                    <li><strong>Sektör Sınırı:</strong> Aynı sektörden en fazla 3 hisseye izin verilir.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TOP OPPORTUNITIES */}
        {activeTab === 'TOP_OPPORTUNITIES' && (
          <TopOpportunitiesPanel
            results={scanResults}
            onOpenTrade={handleOpenPaperTrade}
            onOpenDetail={(sig, res) => {
              setSelectedSignal(sig);
              setSelectedResult(res);
              setDetailModalOpen(true);
            }}
          />
        )}

        {/* TAB 2: LIVE SCANNER */}
        {activeTab === 'SCANNER' && (
          <ScannerView
            results={scanResults}
            onOpenTrade={handleOpenPaperTrade}
            openPositionTickers={openPositionTickers}
            onOpenAddStock={() => setAddStockOpen(true)}
          />
        )}

        {/* TAB: MARKET HEATMAP */}
        {activeTab === 'HEATMAP' && (
          <MarketHeatmapView
            results={scanResults}
            onOpenTrade={handleOpenPaperTrade}
          />
        )}

        {/* TAB: SIGNAL ANALYTICS */}
        {activeTab === 'SIGNAL_ANALYTICS' && (
          <SignalAnalyticsView
            onOpenTrade={handleOpenPaperTrade}
          />
        )}

        {/* TAB 3: NEWS & CATALYSTS */}
        {activeTab === 'NEWS' && (
          <NewsView
            results={scanResults}
            onOpenTrade={handleOpenPaperTrade}
          />
        )}

        {/* TAB: WATCHLIST */}
        {activeTab === 'WATCHLIST' && (
          <WatchlistView
            results={scanResults}
            onOpenTrade={handleOpenPaperTrade}
            onOpenAddStock={() => setAddStockOpen(true)}
          />
        )}

        {/* TAB 4: TRADE HISTORY */}
        {activeTab === 'HISTORY' && (
          <TradeHistory history={currentPortfolio.history} />
        )}

        {/* TAB: BACKTEST */}
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

      <AddStockModal
        isOpen={addStockOpen}
        onClose={() => setAddStockOpen(false)}
        defaultMarket={activeMarket}
        onStockAdded={() => {
          handleScanMarket();
          showToast('Özel hisse başarıyla eklendi ve canlı taramaya dahil edildi.');
        }}
      />

      <InstallPwaModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />

      <SignalDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        signal={selectedSignal}
        result={selectedResult}
        onOpenTrade={handleOpenPaperTrade}
      />

      <SystemHealthModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
      />

      <DailyReportModal
        isOpen={dailyReportModalOpen}
        onClose={() => setDailyReportModalOpen(false)}
        signals={allActiveSignals}
        bistPortfolio={dualState.bist}
        usPortfolio={dualState.us}
        macro={null}
        onOpenTrade={handleOpenPaperTrade}
      />

      <NotificationRulesModal
        isOpen={notifRulesModalOpen}
        onClose={() => setNotifRulesModalOpen(false)}
      />
    </div>
  );
}