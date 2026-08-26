'use client';

import React, { useState } from 'react';
import { BacktestParams, BacktestResult } from '@/lib/types';
import { PlayCircle, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw, BarChart2, ShieldCheck, Microscope, Layers, Info, DollarSign, Award, Target, ArrowUpRight, Scale } from 'lucide-react';

export const BacktestView: React.FC = () => {
  const [params, setParams] = useState<BacktestParams>({
    market: 'ALL',
    periodMonths: 24,
    initialBalance: 10000,
    riskPerTradePct: 2.0,
    maxHoldingDays: 60
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrencyLabel = () => {
    if (params.market === 'BIST') return '₺ (TRY)';
    if (params.market === 'US') return '$ (USD)';
    return '₺ / $ (Normalize)';
  };

  const getCurrencySymbol = () => {
    if (params.market === 'BIST') return '₺';
    if (params.market === 'US') return '$';
    return '';
  };

  async function handleRunBacktest() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.success && data.result) {
        setResult(data.result);
      } else {
        setError(data.error || 'Backtest çalıştırılamadı.');
      }
    } catch (err: any) {
      setError(err.message || 'Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Configuration Card */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <PlayCircle className="w-5 h-5 text-accent-400" />
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              Geriye Dönük Kuant & Walk-Forward Test Motoru
            </h2>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 font-semibold">
            Gerçek Geçmiş Fiyat Verisi
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Stratejilerin geçmiş borsa döngülerindeki kâr/zarar performansını, işlem sayılarını, <strong>Benchmark (Endeks) kıyaslamasını</strong> ve <strong>Walk-Forward aşırı uyarlama (Overfitting)</strong> direncini test edin.
        </p>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Pazar Seçimi</label>
            <select
              value={params.market}
              onChange={e => setParams(p => ({ ...p, market: e.target.value as any }))}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-accent-500"
            >
              <option value="ALL">Tümü (BIST + ABD)</option>
              <option value="BIST">Sadece 🇹🇷 BIST</option>
              <option value="US">Sadece 🇺🇸 ABD</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Test Dönemi</label>
            <select
              value={params.periodMonths}
              onChange={e => setParams(p => ({ ...p, periodMonths: Number(e.target.value) }))}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-accent-500"
            >
              <option value="6">Son 6 Ay (Kısa Vade)</option>
              <option value="12">Son 1 Yıl (Orta Vade)</option>
              <option value="24">Son 2 Yıl (Standart Döngü)</option>
              <option value="36">Son 3 Yıl (Geniş Boğa/Ayı)</option>
              <option value="60">Son 5 Yıl (Tam Kurumsal Test)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400">Başlangıç Sermayesi</label>
              <span className="text-[10px] font-mono text-accent-400 font-bold">{getCurrencyLabel()}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={params.initialBalance}
                onChange={e => setParams(p => ({ ...p, initialBalance: Number(e.target.value) }))}
                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-accent-500 pr-10"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold pointer-events-none">
                {getCurrencySymbol()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">İşlem Başına Risk %</label>
            <input
              type="number"
              step="0.5"
              value={params.riskPerTradePct}
              onChange={e => setParams(p => ({ ...p, riskPerTradePct: Number(e.target.value) }))}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-accent-500"
            />
          </div>
        </div>

        {/* Currency Note Banner */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span>
            Seçili Para Birimi: <strong className="text-white">{getCurrencyLabel()}</strong>. {params.market === 'ALL' ? 'Tüm pazarlar seçildiğinde sermaye ve getiri birleşik sanal portföy üzerinden normalize hesaplanır.' : ''}
          </span>
        </div>

        {/* Run Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRunBacktest}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-500 to-indigo-600 hover:opacity-90 active:scale-95 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-accent-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Simüle Ediliyor (Kuant Analiz)...' : 'Testi Başlat & Doğrula'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/30 text-danger-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-danger-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State when no test is run yet */}
      {!result && !loading && (
        <div className="p-10 rounded-2xl bg-card border border-border text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <BarChart2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Henüz Bir Simülasyon Çalıştırılmadı</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Yukarıdan test etmek istediğiniz pazarı, geçmiş zaman dilimini ve başlangıç bakiyenizi seçip <strong>"Testi Başlat & Doğrula"</strong> butonuna tıklayın.
          </p>
        </div>
      )}

      {/* Results Section (Only rendered when result exists) */}
      {result && (
        <div className="space-y-6">
          {/* 📊 BENCHMARK & ALPHA BANNER */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Benchmark Karşılaştırması ({result.summary.benchmarkName})
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Aynı dönemde <strong>{result.summary.benchmarkName}</strong> getirisi: <span className="font-mono font-bold text-white">+{result.summary.benchmarkReturnPct}%</span> | 
                Strateji Getirisi: <span className="font-mono font-bold text-emerald-400">+{result.summary.totalReturnPct}%</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-right">
                <span className="text-[10px] text-emerald-400 font-bold block uppercase">Alpha (Endeks Üstü Ekstra)</span>
                <span className="text-sm font-bold font-mono text-emerald-300">
                  {result.summary.alphaPct >= 0 ? '+' : ''}%{result.summary.alphaPct}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Core Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted block mb-1">Toplam Kuant Getirisi</span>
              <div className={`text-xl font-bold font-mono ${result.summary.totalReturnPct >= 0 ? 'text-primary-400' : 'text-danger-400'}`}>
                {result.summary.totalReturnPct >= 0 ? '+' : ''}%{result.summary.totalReturnPct}
              </div>
              <span className="text-[10px] text-muted block mt-1 font-mono">
                {getCurrencySymbol()}{result.summary.initialCapital.toLocaleString()} ➔ {getCurrencySymbol()}{result.summary.finalCapital.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted block mb-1">Kazanma Oranı (Win Rate)</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                %{result.summary.winRate}
              </div>
              <span className="text-[10px] text-muted block mt-1">
                {result.summary.winningTrades} Kazanç / {result.summary.losingTrades} Kayıp (Toplam {result.summary.totalTrades} İşlem)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted block mb-1">Profit Factor</span>
              <div className="text-xl font-bold font-mono text-accent-400">
                {result.summary.profitFactor}x
              </div>
              <span className="text-[10px] text-muted block mt-1">Toplam Kazanç / Kayıp Oranı</span>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted block mb-1">Max Drawdown (Düşüş)</span>
              <div className="text-xl font-bold font-mono text-danger-400">
                -%{result.summary.maxDrawdownPct}
              </div>
              <span className="text-[10px] text-muted block mt-1">
                Endeks Drawdown: -%{result.summary.indexMaxDrawdownPct} ({result.summary.maxDrawdownPct < result.summary.indexMaxDrawdownPct ? 'Daha Güvenli' : 'Yüksek'})
              </span>
            </div>
          </div>

          {/* ⚖️ ASİMETRİK RİSK/ÖDÜL VE KAZANÇ BÜYÜKLÜĞÜ PANELİ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-xs">
              <span className="text-slate-500 text-[10px] block">Ortalama Kazanan İşlem</span>
              <span className="text-emerald-400 font-bold text-sm">+{result.summary.avgGainPct}%</span>
              <span className="text-[10px] text-slate-400 block font-sans">Hedefe giden kârlı işlemler</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-xs">
              <span className="text-slate-500 text-[10px] block">Ortalama Kaybeden İşlem</span>
              <span className="text-danger-400 font-bold text-sm">-%{result.summary.avgLossPct}%</span>
              <span className="text-[10px] text-slate-400 block font-sans">Stop-loss ile kesilen işlemler</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-xs">
              <span className="text-slate-500 text-[10px] block">Risk/Ödül Asimetri Çarpanı</span>
              <span className="text-indigo-300 font-bold text-sm">{result.summary.payoffRatio}x Payoff Ratio</span>
              <span className="text-[10px] text-emerald-400 block font-sans">Kazançlar kayıpları katlıyor</span>
            </div>
          </div>

          {/* 🔬 DİNAMİK WALK-FORWARD & KALİBRASYON ANALİZİ PANELİ */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Microscope className="w-4 h-4 text-indigo-400" />
                <span>Walk-Forward Doğrulama & Aşırı Uyarlama (Overfitting) Raporu</span>
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                result.walkForward.status === 'YÜKSEK TUTARLILIK (ROBUST)'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : result.walkForward.status === 'DENGELİ (GÜÇLÜ)'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                Doğrulama: {result.walkForward.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">In-Sample (%70 Eğitim Dönemi)</span>
                <span className="text-white font-bold font-mono text-sm">%{result.walkForward.inSampleWinRate} Win Rate</span>
                <span className="text-[10px] text-slate-400 block">{result.walkForward.inSampleProfitFactor}x Profit Factor</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">Out-of-Sample (%30 Canlı Doğrulama)</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">%{result.walkForward.outSampleWinRate} Win Rate</span>
                <span className="text-[10px] text-slate-400 block">{result.walkForward.outSampleProfitFactor}x Profit Factor</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">Walk-Forward Verimliliği (WFE)</span>
                <span className="text-indigo-300 font-bold font-mono text-sm">%{result.walkForward.wfePct}</span>
                <span className="text-[10px] text-emerald-400 block leading-tight">{result.walkForward.validationVerdict}</span>
              </div>
            </div>

            {/* Asymmetric Edge Explanation Banner */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>{result.walkForward.asymmetricEdgeNote}</span>
            </div>

            {/* Statistical Sample Size Note */}
            <div className="text-right text-[10px] text-slate-500 font-mono">
              📊 İstatistiksel Örneklem: Son {params.periodMonths} ayda tamamlanan {result.summary.totalTrades} adet swing trade işlemine dayanmaktadır.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};