'use client';

import React from 'react';
import { TradePosition } from '@/lib/types';
import { CheckCircle2, XCircle, Clock, Award } from 'lucide-react';

interface TradeHistoryProps {
  history: TradePosition[];
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-card border border-border text-center text-muted text-xs">
        Henüz tamamlanmış/kapanmış bir işlem bulunmuyor. Açılan demo işlemler hedefe veya stop seviyesine ulaştığında burada analiz başarısı listelenecektir.
      </div>
    );
  }

  const winningCount = history.filter(h => h.realizedPnL > 0).length;
  const totalPnL = history.reduce((sum, h) => sum + h.realizedPnL, 0);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-gradient-to-r from-card to-surface border border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Strateji Doğrulama & Performans Özeti</h3>
            <p className="text-xs text-muted">Tamamlanan {history.length} işlem üzerinden analiz sonuçları</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-muted">Kazanma Oranı:</span>{' '}
            <span className="font-bold text-primary-400">%{((winningCount / history.length) * 100).toFixed(1)}</span>
          </div>
          <div>
            <span className="text-muted">Net K/Z:</span>{' '}
            <span className={`font-bold ${totalPnL >= 0 ? 'text-primary-400' : 'text-danger-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-surface/50 text-muted font-medium">
              <th className="py-3 px-4">Hisse & Piyasa</th>
              <th className="py-3 px-4">Tarihler</th>
              <th className="py-3 px-4">Süre</th>
              <th className="py-3 px-4">Giriş / Çıkış</th>
              <th className="py-3 px-4">Sonuç (PnL)</th>
              <th className="py-3 px-4">Kapanış Nedeni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {history.map((trade) => {
              const isWin = trade.realizedPnL > 0;
              const currSign = trade.currency === 'TRY' ? '₺' : '$';

              return (
                <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">{trade.displayTicker}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                        trade.market === 'BIST' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      }`}>
                        {trade.market === 'BIST' ? '🇹🇷 BIST' : '🇺🇸 US'}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted">{trade.strategyName}</div>
                  </td>

                  <td className="py-3 px-4 text-muted">
                    <div>Giriş: {trade.entryDate}</div>
                    <div>Çıkış: {trade.exitDate || '—'}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-slate-300 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trade.daysHeld} Gün</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-white font-medium">
                      {currSign}{trade.entryPrice.toFixed(2)} ➔ {currSign}{(trade.exitPrice || trade.currentPrice).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-muted">{trade.shares} Lot</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className={`font-bold flex items-center gap-1 ${isWin ? 'text-primary-400' : 'text-danger-400'}`}>
                      {isWin ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-danger-400" />}
                      <span>{isWin ? '+' : ''}{currSign}{trade.realizedPnL.toFixed(2)}</span>
                      <span className="text-[11px]">({isWin ? '+' : ''}{trade.realizedPnLPct}%)</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-slate-300 text-[11px]">
                      {trade.exitReason || '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
