'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PortfolioCards } from '@/components/PortfolioCards';
import { ActiveTrades } from '@/components/ActiveTrades';
import { ScannerView } from '@/components/ScannerView';
import { TradeHistory } from '@/components/TradeHistory';
import { BacktestView } from '@/components/BacktestView';
import { EquityChart } from '@/components/EquityChart';
import { SettingsModal } from '@/components/SettingsModal';
import { 
  PortfolioState, 
  StockScanResult, 
  Signal, 
  BotSettings 
} from '@/lib/types';
import { 
  INITIAL_PORTFOLIO_STATE, 
  openPaperPosition, 
  updatePositionsWithQuotes, 
  manuallyClosePosition 
} from '@/lib/portfolioManager';
import { LayoutDashboard, Radio, History, PlayCircle } from 'lucide-react';

const STORAGE_KEY = 'us_stock_swing_portfolio_state_v1';

export default function HomePage() {
  const [state, setState] = useState<PortfolioState>(INITIAL_PORTFOLIO_STATE);
  const [scanResults, setScanResults] = useState<StockScanResult[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SCANNER' | 'HISTORY' | 'BACKTEST'>('DASHBOARD');
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setState(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load portfolio state from storage:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  async function handleScanMarket() {
    setIsScanning(true);
    try {
      const res = await fetch('/api/market/scan');
      const data = await res.json();

      if (data.success && data.data) {
        setScanResults(data.data);

        const quotesMap = new Map<string, number>();
        for (const item of data.data) {
          quotesMap.set(item.ticker, item.technicals.price);
        }

        const { state: updatedState, events } = updatePositionsWithQuotes(state, quotesMap);
        updatedState.lastScanTime = new Date().toISOString();

        if (updatedState.settings.autoTrade) {
          const signals: Signal[] = data.data
            .map((d: StockScanResult) => d.signal)
            .filter((s: Signal | null): s is Signal => s !== null);

          for (const sig of signals) {
            const { state: afterTrade, success, message } = openPaperPosition(sig, updatedState);
            if (success) {
              events.push(message);
              Object.assign(updatedState, afterTrade);
            }
          }
        }

        setState({ ...updatedState });
        showToast(
          events.length > 0 
            ? `${data.data.length} hisse güncellendi. ${events.join(' | ')}`
            : `${data.data.length} hisse güncellendi ve seviyeler kontrol edildi.`
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Piyasa taranırken bir bağlantı hatası oluştu.');
    } finally {
      setIsScanning(false);
    }
  }

  useEffect(() => {
    handleScanMarket();
  }, []);

  function handleOpenPaperTrade(signal: Signal) {
    const { state: newState, success, message } = openPaperPosition(signal, state);
    if (success) {
      setState(newState);
      showToast(message);
    } else {
      showToast(`Uyarı: ${message}`);
    }
  }

  function handleManualClose(positionId: string) {
    const { state: newState, success, message } = manuallyClosePosition(state, positionId);
    if (success) {
      setState(newState);
      showToast(message);
    }
  }

  function handleSaveSettings(newSettings: BotSettings) {
    setState((prev) => ({
      ...prev,
      settings: newSettings
    }));
    showToast('Ayarlar başarıyla kaydedildi.');
  }

  function handleResetPortfolio() {
    setState({
      ...INITIAL_PORTFOLIO_STATE,
      settings: state.settings
    });
    showToast('Portföy ve işlem geçmişi sıfırlandı.');
  }

  const openPositionTickers = state.positions
    .filter(p => p.status === 'OPEN')
    .map(p => p.ticker);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onScan={handleScanMarket}
        isScanning={isScanning}
        onOpenSettings={() => setSettingsOpen(true)}
        lastScanTime={state.lastScanTime}
        autoTrade={state.settings.autoTrade}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-surface border border-primary-500/40 text-primary-300 text-xs font-medium shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-border/80 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'DASHBOARD'
                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-card'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Portföy & Açık İşlemler</span>
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
            <span>İşlem Geçmişi & Doğrulama</span>
            {state.history.length > 0 && (
              <span className="text-[10px] text-muted">({state.history.length})</span>
            )}
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

        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <PortfolioCards state={state} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Açık Demo Pozisyonlar (1-14 Günlük Swing)</h2>
                  <span className="text-xs text-muted">
                    {openPositionTickers.length} / {state.settings.maxOpenPositions} Pozisyon
                  </span>
                </div>
                <ActiveTrades
                  positions={state.positions}
                  onManualClose={handleManualClose}
                />
              </div>

              <div className="space-y-4">
                <EquityChart data={state.equityCurve} />

                <div className="p-4 rounded-xl bg-card border border-border text-xs space-y-2.5">
                  <h3 className="font-semibold text-white">📌 1-14 Gün Swing Kuralları</h3>
                  <ul className="text-muted space-y-1.5 list-disc pl-4 text-[11px]">
                    <li>İşlem başına maksimum %{state.settings.riskPerTradePct} sermaye riski.</li>
                    <li>Stop-Loss veya Hedef 2 seviyesine ulaşıldığında pozisyon otomatik kapanır.</li>
                    <li>{state.settings.maxHoldingDays} gün içinde hedefe varmayan işlemler süre dolumuyla piyasa fiyatından kapatılır.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SCANNER' && (
          <ScannerView
            results={scanResults}
            onOpenTrade={handleOpenPaperTrade}
            openPositionTickers={openPositionTickers}
          />
        )}

        {activeTab === 'HISTORY' && (
          <TradeHistory history={state.history} />
        )}

        {activeTab === 'BACKTEST' && (
          <BacktestView />
        )}
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={state.settings}
        onSave={handleSaveSettings}
        onResetPortfolio={handleResetPortfolio}
      />
    </div>
  );
}
