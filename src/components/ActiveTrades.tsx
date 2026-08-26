'use client';

import React from 'react';
import { TradePosition } from '@/lib/types';
import { Clock, Target, AlertOctagon, XCircle, ArrowUpRight, ArrowDownRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ActiveTradesProps {
  positions: TradePosition[];
  onManualClose: (positionId: string) => void;
}

export const ActiveTrades: React.FC<ActiveTradesProps> = ({ positions, onManualClose }) => {
  const openPositions = positions.filter(p => p.status === 'OPEN');

  if (openPositions.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-card border border-border text-center">
        <div className="inline-flex p-3 rounded-full bg-slate-800 text-slate-400 mb-3">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white">Şu Anda Açık Demo Pozisyon Yok</h3>
        <p className="text-xs text-muted max-w-sm mx-auto mt-1">
          Canlı Piyasa Tarayıcısı üzerinden sinyal veren hisselerden sanal pozisyon açabilir veya botun piyasa açılışında otomatik işlem yapmasını bekleyebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border/80 bg-surface/50 text-muted font-medium">
            <th className="py-3 px-4">Hisse & Strateji</th>
            <th className="py-3 px-4">Giriş / Anlık</th>
            <th className="py-3 px-4">Kalan Lot / Maliyet</th>
            <th className="py-3 px-4">Kâr / Zarar (PnL)</th>
            <th className="py-3 px-4">Güvenlik & Seviyeler</th>
            <th className="py-3 px-4">Vade Süresi</th>
            <th className="py-3 px-4 text-right">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {openPositions.map((pos) => {
            const isProfit = pos.unrealizedPnL >= 0;
            const progressToTP = Math.min(100, Math.max(0, ((pos.currentPrice - pos.entryPrice) / (pos.target2 - pos.entryPrice)) * 100));
            const holdingProgress = Math.min(100, (pos.daysHeld / pos.maxHoldingDays) * 100);
            const currSign = pos.currency === 'TRY' ? '₺' : '$';

            return (
              <tr key={pos.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center font-bold text-white text-xs">
                      {pos.displayTicker.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        {pos.displayTicker}
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                          pos.market === 'BIST' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        }`}>
                          {pos.market === 'BIST' ? '🇹🇷 BIST' : '🇺🇸 US'}
                        </span>
                        {pos.tp1Hit && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> TP1 Alındı
                          </span>
                        )}
                        {pos.isBreakeven && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent-500/20 text-accent-400 border border-accent-500/30 font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Başa-Baş Stop
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">
                        {pos.strategyName} • <span className="text-slate-400">{pos.sector}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white">
                    {currSign}{pos.currentPrice.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-muted">
                    Giriş: {currSign}{pos.entryPrice.toFixed(2)}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="text-white font-medium">
                    {pos.shares} Lot {pos.shares < pos.initialShares && <span className="text-muted text-[10px]">({pos.initialShares} baştan)</span>}
                  </div>
                  <div className="text-[11px] text-muted">
                    {currSign}{(pos.shares * pos.entryPrice).toFixed(2)}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className={`font-bold flex items-center gap-0.5 ${isProfit ? 'text-primary-400' : 'text-danger-400'}`}>
                    {isProfit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>{isProfit ? '+' : ''}{currSign}{pos.unrealizedPnL.toFixed(2)}</span>
                    <span className="text-[11px] font-semibold">({isProfit ? '+' : ''}{pos.unrealizedPnLPct}%)</span>
                  </div>
                  {pos.realizedPnL > 0 && (
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      +{currSign}{pos.realizedPnL.toFixed(2)} cepte
                    </div>
                  )}
                </td>

                <td className="py-3.5 px-4 min-w-[170px]">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className={`flex items-center gap-0.5 ${pos.isBreakeven ? 'text-accent-400 font-bold' : 'text-danger-400'}`}>
                      <AlertOctagon className="w-3 h-3" /> Stop: {currSign}{pos.stopLoss.toFixed(2)}
                    </span>
                    <span className="text-primary-400 flex items-center gap-0.5">
                      <Target className="w-3 h-3" /> TP2: {currSign}{pos.target2.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                    <div
                      className={`h-full transition-all rounded-full ${isProfit ? 'bg-primary-500' : 'bg-danger-500'}`}
                      style={{ width: `${Math.max(5, progressToTP)}%` }}
                    />
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1 text-white font-medium text-xs">
                    <Clock className="w-3.5 h-3.5 text-accent-400" />
                    <span>{pos.daysHeld} Gün</span>
                  </div>
                  {pos.estimatedTimeframe ? (
                    <div className="text-[10px] text-indigo-400 font-semibold mt-0.5" title="Beklenen Hedef Süresi">
                      ⏳ {pos.estimatedTimeframe}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Maks: {pos.maxHoldingDays} Gün
                    </div>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onManualClose(pos.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-danger-500/20 text-slate-300 hover:text-danger-400 border border-border hover:border-danger-500/40 transition-colors text-[11px] font-medium cursor-pointer"
                    title="Pozisyonu Piyasa Fiyatından Kapat"
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Kapat</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
