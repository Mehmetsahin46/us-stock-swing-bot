'use client';

import React, { useState } from 'react';
import { BacktestResult } from '@/lib/types';
import { Play } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const BacktestView: React.FC = () => {
  const [periodMonths, setPeriodMonths] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  async function handleRunBacktest() {
    setLoading(true);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodMonths,
          initialBalance: 10000,
          riskPerTradePct: 2.0,
          maxHoldingDays: 14
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-xl bg-card border border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Geçmişe Dönük Strateji Testi (Backtester)</h2>
          <p className="text-xs text-muted mt-0.5">
            Botun 1-14 günlük Swing algoritmalarını geçmiş gerçek ABD borsa verileri üzerinde test edin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface border border-border rounded-lg p-1 text-xs">
            <button
              onClick={() => setPeriodMonths(3)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${periodMonths === 3 ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Son 3 Ay
            </button>
            <button
              onClick={() => setPeriodMonths(6)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${periodMonths === 6 ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Son 6 Ay
            </button>
            <button
              onClick={() => setPeriodMonths(12)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${periodMonths === 12 ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Son 1 Yıl
            </button>
          </div>

          <button
            onClick={handleRunBacktest}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-accent-500/20 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-pulse' : ''}`} />
            <span>{loading ? 'Simüle Ediliyor...' : 'Backtest Çalıştır'}</span>
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted">Toplam Getiri</span>
              <div className={`text-base font-bold mt-1 ${result.summary.totalReturnPct >= 0 ? 'text-primary-400' : 'text-danger-400'}`}>
                {result.summary.totalReturnPct >= 0 ? '+' : ''}%{result.summary.totalReturnPct}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted">Kazanma Oranı</span>
              <div className="text-base font-bold text-white mt-1">
                %{result.summary.winRate}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted">Toplam İşlem</span>
              <div className="text-base font-bold text-white mt-1">
                {result.summary.totalTrades} ({result.summary.winningTrades}K / {result.summary.losingTrades}Z)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted">Kâr Faktörü</span>
              <div className="text-base font-bold text-purple-400 mt-1">
                {result.summary.profitFactor}x
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted">Maks. Düşüş (DD)</span>
              <div className="text-base font-bold text-danger-400 mt-1">
                -%{result.summary.maxDrawdownPct}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border">
              <span className="text-xs text-muted">Ortalama Tutma</span>
              <div className="text-base font-bold text-accent-400 mt-1">
                {result.summary.avgTradeDays} Gün
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border">
            <h3 className="text-xs font-semibold text-white mb-3">Simüle Edilen Sermaye Eğrisi ($)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.equityCurve}>
                  <defs>
                    <linearGradient id="backtestGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Sermaye']}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#backtestGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
