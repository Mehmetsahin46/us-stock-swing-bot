'use client';

import React from 'react';
import { DailyExecutiveReport, generateDailyExecutiveReport } from '@/lib/quantEngine';
import { Signal, MarketPortfolio, GlobalMacroRegime } from '@/lib/types';
import { FileText, X, Sparkles, TrendingUp, Layers, Award, ShieldCheck, CheckCircle2, Flame, ArrowRight } from 'lucide-react';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  signals: Signal[];
  bistPortfolio: MarketPortfolio;
  usPortfolio: MarketPortfolio;
  macro?: GlobalMacroRegime | null;
  onOpenTrade?: (signal: any) => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  signals,
  bistPortfolio,
  usPortfolio,
  macro,
  onOpenTrade
}) => {
  if (!isOpen) return null;

  const report = generateDailyExecutiveReport(signals, bistPortfolio, usPortfolio, macro || undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#111827] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">Günlük AI & Kuant Yönetici Raporu</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {report.date}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Borsa İstanbul ve ABD pazarlarının günlük özet analizi</p>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/30 space-y-2">
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Yönetici Özeti (Executive Briefing)</span>
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Taranan Hisse</span>
            <span className="text-white font-bold text-sm">200 Adet</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Aktif Fırsat</span>
            <span className="text-emerald-400 font-bold text-sm">{report.totalSignals} Adet</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">A+ Elit Kalite</span>
            <span className="text-amber-400 font-bold text-sm">{report.eliteSignalsCount} Adet</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Lider Sektör</span>
            <span className="text-indigo-300 font-bold text-sm">Teknoloji</span>
          </div>
        </div>

        {/* Market & Volatility Regimes */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span>{report.marketRegimeVerdict}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span>{report.vixVerdict}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
        </div>

        {/* Top 3 Recommendations */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Günün En Yüksek Potansiyelli A+ Seçimleri</span>
          </h3>

          <div className="space-y-2">
            {report.topRecommendations.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Günün A+ seçimi bulunamadı.</p>
            ) : (
              report.topRecommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-surface border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-white font-mono text-sm">{rec.displayTicker}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {rec.grade} • {rec.score}p
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-emerald-400 font-bold">+{rec.targetGainPct}% Hedef</span>
                    <span className="text-slate-400 text-[11px]">{rec.timeframe}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-right pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:opacity-90 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Raporu Kapat
          </button>
        </div>
      </div>
    </div>
  );
};