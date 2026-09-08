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
import { SecurityCenterModal } from '@/components/SecurityCenterModal';
import { StockSearchModal } from '@/components/StockSearchModal';
import { LoginScreen } from '@/components/LoginScreen';
import { EditPositionModal } from '@/components/EditPositionModal';
import { 
  DualPortfolioState, 
  MarketPortfolio,
  MarketType, 
  Signal, 
  StockScanResult,
  TradePosition
} from '@/lib/types';
import { 
  openPositionForMarket, 
  manuallyClosePositionInMarket 
} from '@/lib/portfolioManager';
import { INITIAL_DUAL_STATE } from '@/lib/constants';
import { UserProfile, AUTH_STORAGE_KEY } from '@/lib/auth';
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
  Star,
  Search,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [dualState, setDualState] = useState<DualPortfolioState>(INITIAL_DUAL_STATE);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const [activeMarket, setActiveMarket] = useState<MarketType>('BIST');
  const [scanResults, setScanResults] = useState<StockScanResult[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'TOP_OPPORTUNITIES' | 'SCANNER' | 'HEATMAP' | 'SIGNAL_ANALYTICS' | 'NEWS' | 'WATCHLIST' | 'HISTORY' | 'BACKTEST'
  >('DASHBOARD');
  
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [addStockOpen, setAddStockOpen] = useState<boolean>(false);
  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [healthModalOpen, setHealthModalOpen] = useState<boolean>(false);
  const [dailyReportModalOpen, setDailyReportModalOpen] = useState<boolean>(false);
  const [notifRulesModalOpen, setNotifRulesModalOpen] = useState<boolean>(false);
  const [securityModalOpen, setSecurityModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingPosition, setEditingPosition] = useState<TradePosition | null>(null);

  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [selectedResult, setSelectedResult] = useState<StockScanResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  }

  // 1. Sync directly with Supabase server state for active user
  const syncWithServer = useCallback(async (userId?: string) => {
    const effectiveUser = userId || activeUser?.id || 'mehmet.sahin';
    try {
      const res = await fetch(`/api/portfolio?userId=${encodeURIComponent(effectiveUser)}`, {
        headers: { 'x-user-id': effectiveUser },
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success && data.state) {
        const serverState = data.state as DualPortfolioState;
        if (!serverState.crypto) {
          serverState.crypto = JSON.parse(JSON.stringify(INITIAL_DUAL_STATE.crypto));
        }
        setDualState(serverState);
      }
    } catch (err) {
      console.warn('[Sync] Offline or connection error.');
    }
  }, [activeUser]);

  // Save to Supabase
  const saveStateToServer = useCallback(async (stateToSave: DualPortfolioState) => {
    const effectiveUser = activeUser?.id || 'mehmet.sahin';
    try {
      await fetch(`/api/portfolio?userId=${encodeURIComponent(effectiveUser)}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': effectiveUser
        },
        body: JSON.stringify({ state: stateToSave, userId: effectiveUser })
      });
    } catch (err) {
      console.error('[Save Error] Supabase state update failed:', err);
    }
  }, [activeUser]);

  // Check saved session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        const u = JSON.parse(savedUser) as UserProfile;
        setActiveUser(u);
        syncWithServer(u.id);
      }
    } catch (e) {}
    setIsInitialized(true);
  }, [syncWithServer]);

  // Polling every 45 seconds for active user
  useEffect(() => {
    if (!activeUser) return;
    const interval = setInterval(() => {
      syncWithServer(activeUser.id);
    }, 45000);
    return () => clearInterval(interval);
  }, [activeUser, syncWithServer]);

  // Auto-scan on tab/load
  useEffect(() => {
    if (!activeUser) return;
    handleScanMarket();
  }, [activeUser]);

  const handleLogin = (user: UserProfile) => {
    setActiveUser(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {}
    syncWithServer(user.id);
    showToast(`Hoş geldiniz, ${user.displayName}! Portföyünüz yüklendi.`);
  };

  const handleLogout = () => {
    setActiveUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
    setDualState(INITIAL_DUAL_STATE);
  };

  // Open position from signal
  function handleOpenTrade(signal: Signal) {
    setDualState(prev => {
      const targetPortfolio = signal.market === 'BIST' ? prev.bist : signal.market === 'CRYPTO' ? (prev.crypto || INITIAL_DUAL_STATE.crypto!) : prev.us;
      const { portfolio: updated, success, message } = openPositionForMarket(signal, targetPortfolio);
      
      showToast(message);
      if (!success) return prev;

      const nextState: DualPortfolioState = {
        ...prev,
        [signal.market === 'BIST' ? 'bist' : signal.market === 'CRYPTO' ? 'crypto' : 'us']: updated
      };
      saveStateToServer(nextState);
      return nextState;
    });
  }

  // Close position manually
  function handleClosePosition(positionId: string) {
    setDualState(prev => {
      const targetPortfolio = activeMarket === 'BIST' ? prev.bist : activeMarket === 'CRYPTO' ? (prev.crypto || INITIAL_DUAL_STATE.crypto!) : prev.us;
      const { portfolio: updated, success, message } = manuallyClosePositionInMarket(targetPortfolio, positionId);
      
      showToast(message);
      if (!success) return prev;

      const nextState: DualPortfolioState = {
        ...prev,
        [activeMarket === 'BIST' ? 'bist' : activeMarket === 'CRYPTO' ? 'crypto' : 'us']: updated
      };
      saveStateToServer(nextState);
      return nextState;
    });
  }

  // Manual Stop/TP Edit Save
  async function handleSavePositionLevels(positionId: string, stopLoss: number, target1: number, target2: number) {
    try {
      const res = await fetch('/api/positions/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': activeUser?.id || 'mehmet.sahin'
        },
        body: JSON.stringify({
          market: activeMarket,
          positionId,
          stopLoss,
          target1,
          target2
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Seviyeler başarıyla güncellendi!');
        await syncWithServer();
      } else {
        showToast(`Hata: ${data.error || data.message}`);
      }
    } catch (e: any) {
      showToast(`Hata: ${e?.message}`);
    }
  }

  // Reset portfolio
  async function handleResetMarket(market: 'BIST' | 'US' | 'CRYPTO') {
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': activeUser?.id || 'mehmet.sahin'
        },
        body: JSON.stringify({ action: 'RESET_MARKET', market, userId: activeUser?.id })
      });
      const data = await res.json();
      if (data.success && data.state) {
        setDualState(data.state);
      }
      showToast(`${market} portföyü ve işlem geçmişi sıfırlandı.`);
    } catch (e) {}
  }

  // Trigger Live Scan & Auto-trade
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
        showToast(`Tarama tamamlandı (${cronData.scannedCount || 0} enstrüman).`);
      } else {
        showToast('Piyasalar tarandı ve pozisyonlar güncellendi.');
      }
    } catch (err) {
      showToast('Piyasa tarama hatası, lütfen tekrar deneyin.');
    } finally {
      setIsScanning(false);
    }
  }

  // Current active portfolio view
  const currentPortfolio: MarketPortfolio = 
    activeMarket === 'BIST' 
      ? dualState.bist 
      : activeMarket === 'CRYPTO' 
        ? (dualState.crypto || INITIAL_DUAL_STATE.crypto!) 
        : dualState.us;

  if (!isInitialized) return null;

  // Render LoginScreen if not authenticated
  if (!activeUser) {
    return <LoginScreen onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-primary-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-semibold backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-primary-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        onScan={handleScanMarket}
        isScanning={isScanning}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenAddStock={() => setAddStockOpen(true)}
        onOpenInstall={() => setInstallModalOpen(true)}
        onOpenHealth={() => setHealthModalOpen(true)}
        onOpenDailyReport={() => setDailyReportModalOpen(true)}
        onOpenNotifRules={() => setNotifRulesModalOpen(true)}
        onOpenSecurity={() => setSecurityModalOpen(true)}
        activeUser={activeUser}
        onLogout={handleLogout}
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/80 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold transition-all cursor-pointer flex-shrink-0 ${
              activeTab === 'DASHBOARD'
                ? activeMarket === 'BIST'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : activeMarket === 'CRYPTO'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-card hover:bg-slate-800 text-slate-400 hover:text-white border border-border/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>
              {activeMarket === 'BIST' ? '🇹🇷 BIST Portföyü' : activeMarket === 'CRYPTO' ? '🪙 Kripto Portföyü' : '🇺🇸 ABD Portföyü'}
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono">
              {currentPortfolio.positions.filter(p => p.status === 'OPEN').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('TOP_OPPORTUNITIES')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeTab === 'TOP_OPPORTUNITIES'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-card hover:bg-slate-800 text-slate-400 hover:text-white border border-border/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Günün Fırsatları (A+)</span>
          </button>

          <button
            onClick={() => setActiveTab('SCANNER')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeTab === 'SCANNER'
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40 shadow-sm'
                : 'bg-card hover:bg-slate-800 text-slate-400 hover:text-white border border-border/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Canlı Tarayıcı</span>
          </button>

          <button
            onClick={() => setActiveTab('HEATMAP')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeTab === 'HEATMAP'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'bg-card hover:bg-slate-800 text-slate-400 hover:text-white border border-border/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span>Isı Haritası</span>
          </button>

          <button
            onClick={() => setActiveTab('SIGNAL_ANALYTICS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeTab === 'SIGNAL_ANALYTICS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-card hover:bg-slate-800 text-slate-400 hover:text-white border border-border/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sinyal Analitiği</span>
          </button>

          <button
            onClick={() => setActiveTab('NEWS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeTab === 'NEWS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-card hover:bg-slate-800 text-slate-400 hover:text-white border border-border/60'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
            <span>Haberler & Bilanço</span>
          </button>

          <button
            onClick={() => setActiveTab('WATCHLIST')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeTab === 'WATCHLIST'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-sm'
                : 'bg-card hover:bg-slate-800 text-slate-400 hover:text-white border border-border/60'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span>İzleme Listesi</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeTab === 'HISTORY'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'bg-card hover:bg-slate-800 text-slate-400 hover:text-white border border-border/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>İşlem Geçmişi ({currentPortfolio.history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('BACKTEST')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
              activeTab === 'BACKTEST'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm'
                : 'bg-card hover:bg-slate-800 text-slate-400 hover:text-white border border-border/60'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Backtest</span>
          </button>

          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer ml-auto border border-slate-700/80"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Hisse / Sembol Ara</span>
            <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-slate-400 font-mono">⌘K</kbd>
          </button>
        </div>

        {/* Tab 1: Dashboard */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Metric Cards */}
            <PortfolioCards portfolio={currentPortfolio} />

            {/* Main Grid: Active Trades + Equity Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${activeMarket === 'BIST' ? 'bg-rose-500' : activeMarket === 'CRYPTO' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                    <h2 className="text-sm font-bold text-white">
                      {activeMarket === 'BIST'
                        ? '🇹🇷 Borsa İstanbul Açık Pozisyonlar (14 Gün Max)'
                        : activeMarket === 'CRYPTO'
                        ? '🪙 Kripto 7/24 Kaldıraçlı Açık Pozisyonlar'
                        : '🇺🇸 ABD Borsası Açık Pozisyonlar (14 Gün Max)'}
                    </h2>
                  </div>
                  <span className="text-xs text-muted font-mono">
                    {currentPortfolio.positions.filter(p => p.status === 'OPEN').length} / {currentPortfolio.maxOpenPositions} Pozisyon
                  </span>
                </div>

                <ActiveTrades
                  positions={currentPortfolio.positions}
                  onManualClose={handleClosePosition}
                  onEditPosition={pos => {
                    setEditingPosition(pos);
                    setEditModalOpen(true);
                  }}
                />
              </div>

              {/* Sidebar: Equity Chart & Risk Shields */}
              <div className="space-y-6">
                <EquityChart
                  data={currentPortfolio.equityCurve}
                  currencySymbol={currentPortfolio.currencySymbol}
                />

                {/* Safe Cash & Risk Shield Card */}
                <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between border-b border-border/80 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold text-white">Risk & Güvenli Nakit Kalkanı</h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
                      Aktif
                    </span>
                  </div>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                    <li>
                      <strong>Güvenli Nakit Tamponu:</strong> Kasanın %{currentPortfolio.cashReservePct ?? 25}'si ({currentPortfolio.currencySymbol}{((currentPortfolio.totalEquity * (currentPortfolio.cashReservePct ?? 25)) / 100).toFixed(2)}) daima nakit korunur.
                    </li>
                    <li>
                      <strong>Manuel Seviye Yönetimi:</strong> Açık pozisyonlarda <em>✏️ Düzenle</em> butonuna basarak Stop ve TP seviyelerini elle sabitleyebilirsiniz.
                    </li>
                    <li>
                      <strong>Kullanıcı İzolasyonu:</strong> Sayfanızdaki tüm işlemler ve ayarlar sadece <strong>@{activeUser.username}</strong> hesabınıza aittir.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Top Opportunities */}
        {activeTab === 'TOP_OPPORTUNITIES' && (
          <TopOpportunitiesPanel
            results={scanResults}
            onOpenTrade={handleOpenTrade}
            onOpenDetail={(sig, res) => {
              setSelectedSignal(sig);
              setSelectedResult(res);
              setDetailModalOpen(true);
            }}
          />
        )}

        {/* Tab 3: Scanner */}
        {activeTab === 'SCANNER' && (
          <ScannerView
            results={scanResults}
            onOpenTrade={handleOpenTrade}
            openPositionTickers={currentPortfolio.positions.filter(p => p.status === 'OPEN').map(p => p.ticker)}
            onOpenAddStock={() => setAddStockOpen(true)}
          />
        )}

        {/* Tab 4: Heatmap */}
        {activeTab === 'HEATMAP' && (
          <MarketHeatmapView
            results={scanResults}
            onOpenTrade={handleOpenTrade}
          />
        )}

        {/* Tab 5: Analytics */}
        {activeTab === 'SIGNAL_ANALYTICS' && (
          <SignalAnalyticsView onOpenTrade={handleOpenTrade} />
        )}

        {/* Tab 6: News */}
        {activeTab === 'NEWS' && (
          <NewsView
            results={scanResults}
            onOpenTrade={handleOpenTrade}
          />
        )}

        {/* Tab 7: Watchlist */}
        {activeTab === 'WATCHLIST' && (
          <WatchlistView
            results={scanResults}
            onOpenTrade={handleOpenTrade}
            onOpenAddStock={() => setAddStockOpen(true)}
          />
        )}

        {/* Tab 8: History */}
        {activeTab === 'HISTORY' && (
          <TradeHistory
            history={currentPortfolio.history}
            currencySymbol={currentPortfolio.currencySymbol}
          />
        )}

        {/* Tab 9: Backtest */}
        {activeTab === 'BACKTEST' && (
          <BacktestView />
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        bistPortfolio={dualState.bist}
        usPortfolio={dualState.us}
        cryptoPortfolio={dualState.crypto}
        onSave={(b, u, c) => {
          setDualState(prev => {
            const next: DualPortfolioState = { ...prev, bist: b, us: u, crypto: c || prev.crypto };
            saveStateToServer(next);
            return next;
          });
          showToast('Kişisel ayarlarınız başarıyla kaydedildi.');
        }}
        onResetMarket={handleResetMarket}
      />

      <EditPositionModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingPosition(null);
        }}
        position={editingPosition}
        market={activeMarket}
        onSave={handleSavePositionLevels}
      />

      <AddStockModal
        isOpen={addStockOpen}
        onClose={() => setAddStockOpen(false)}
        defaultMarket={activeMarket}
        onStockAdded={() => handleScanMarket()}
      />

      <StockSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        scanResults={scanResults}
        onOpenTrade={handleOpenTrade}
        onOpenDetail={(sig, res) => {
          setSelectedSignal(sig);
          setSelectedResult(res);
          setDetailModalOpen(true);
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
        onOpenTrade={handleOpenTrade}
      />

      <SystemHealthModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
      />

      <DailyReportModal
        isOpen={dailyReportModalOpen}
        onClose={() => setDailyReportModalOpen(false)}
        signals={scanResults.map(r => r.signal).filter((s): s is Signal => s !== null)}
        bistPortfolio={dualState.bist}
        usPortfolio={dualState.us}
        onOpenTrade={handleOpenTrade}
      />

      <NotificationRulesModal
        isOpen={notifRulesModalOpen}
        onClose={() => setNotifRulesModalOpen(false)}
      />

      <SecurityCenterModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />
    </div>
  );
}
