'use client';

import React from 'react';
import { Signal, StockScanResult } from '@/lib/types';
import { analyzeSignalFactors } from '@/lib/quantEngine';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Target, 
  AlertOctagon, 
  ShoppingCart,
  Building2,
  BarChart2,
  Activity,
  Award,
  Layers
} from 'lucide-react';

interface SignalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: Signal | null;
  result: StockScanResult | null;
  onOpenTrade: (signal: Signal) => void;
}

export const SignalDetailModal: React.FC<SignalDetailModalProps> = ({
  isOpen,
  onClose,
  signal,
  result,
  onOpenTrade
}) => {
  if (!isOpen || !signal || !result) return null;

  const analysis = analyzeSignalFactors(signal, result.technicals, result.news);
  const currSign = signal.currency === 'TRY' ? '₺' : '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#111827] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-lg font-extrabold text-white font-mono">
              {signal.displayTicker.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{signal.market === 'BIST' ? '🇹🇷' : '🇺🇸'}</span>
                <h2 className="text-lg font-extrabold text-white font-mono">{signal.displayTicker}</h2>
                <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold font-mono ${
                  signal.grade === 'A+'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {signal.grade === 'A+' ? '🥇 A+ ELİT' : '🥈 A SINIFI'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {result.name} • <span className="text-indigo-400">{signal.sector}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-extrabold text-white font-mono">
              {currSign}{result.technicals.price.toFixed(2)}
            </div>
            <div className="text-xs text-indigo-400 font-bold font-mono">
              Kuant Skoru: {signal.score} / 100
            </div>
          </div>
        </div>

        {/* 🚨 SİNYAL YAŞAM DÖNGÜSÜ (SIGNAL LIFECYCLE STEPPER) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sinyal Yaşam Döngüsü (Lifecycle Tracker)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">AŞAMA: 2. ALIM BÖLGESİ</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
            {/* Step 1: Watch */}
            <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400">
              <span className="block font-mono text-[9px] text-slate-500">1. AŞAMA</span>
              <span>👁️ İZLEME (WATCH)</span>
            </div>

            {/* Step 2: Buy Entry (Active) */}
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10">
              <span className="block font-mono text-[9px] text-emerald-400">2. AŞAMA (AKTİF)</span>
              <span>⚡ ALIM (ENTRY)</span>
            </div>

            {/* Step 3: TP1 */}
            <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400">
              <span className="block font-mono text-[9px] text-slate-500">3. AŞAMA</span>
              <span>🎯 TP1 (%50 KÂR)</span>
            </div>

            {/* Step 4: TP2 */}
            <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400">
              <span className="block font-mono text-[9px] text-slate-500">4. AŞAMA</span>
              <span>🏆 TP2 (ANA HEDEF)</span>
            </div>
          </div>
        </div>

        {/* Skor Değişim Geçmişi & Finansal Sağlık Yan Yana */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Skor Geçmişi */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              🔄 Skor Değişim Trendi (Son 5 Gün)
            </span>
            <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
              {analysis.scoreHistory.map((pt, idx) => (
                <div key={idx} className="text-center">
                  <span className="text-slate-500 block text-[9px]">{pt.day.replace(' Gün Önce', 'G')}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${idx === 4 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    {pt.score}p
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Finansal Sağlık Skoru */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                💰 Finansal Sağlık Skoru
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {analysis.financialHealth.totalScore} / 100 • {analysis.financialHealth.rating}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {analysis.financialHealth.summary}
            </p>
          </div>
        </div>

        {/* "Neden Bu Sinyal?" Factor Breakdown */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Sinyali Oluşturan Temel Faktörler</span>
          </h3>

          <div className="space-y-2">
            {analysis.factors.map((f, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs"
              >
                <div className="mt-0.5 flex-shrink-0">
                  {f.impact === 'POSITIVE' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{f.title}</span>
                    <span className={`font-mono font-bold text-[10px] ${f.score > 0 ? 'text-emerald-400' : 'text-danger-400'}`}>
                      {f.score > 0 ? `+${f.score} Skor` : `${f.score} Skor`}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Trade Levels & ETA Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] block">Önerilen Giriş</span>
            <span className="text-white font-bold text-sm">{currSign}{signal.suggestedEntry.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Hedef (TP2)</span>
            <span className="text-emerald-400 font-bold text-sm">{currSign}{signal.target2.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-500 block">+{signal.potentialGainPct}%</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Stop-Loss (SL)</span>
            <span className="text-danger-400 font-bold text-sm">{currSign}{signal.stopLoss.toFixed(2)}</span>
            <span className="text-[10px] text-danger-500 block">-%{signal.maxRiskPct}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Tahmini Süre (ETA)</span>
            <span className="text-indigo-300 font-bold text-sm">{signal.estimatedTimeframe || '~1-2 Hafta'}</span>
            <span className="text-[10px] text-indigo-400 block">{signal.riskReward}x R:R</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Kapat
          </button>

          <button
            onClick={() => {
              onOpenTrade(signal);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-xl shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Sanal Pozisyon Aç</span>
          </button>
        </div>
      </div>
    </div>
  );
};