'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface EquityChartProps {
  data: { date: string; equity: number }[];
}

export const EquityChart: React.FC<EquityChartProps> = ({ data }) => {
  if (data.length <= 1) {
    return null;
  }

  const isProfit = data[data.length - 1].equity >= data[0].equity;
  const strokeColor = isProfit ? '#10b981' : '#ef4444';
  const gradientId = isProfit ? 'equityProfitGradient' : 'equityLossGradient';

  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-white">Sanal Portföy Büyüme Eğrisi ($)</h3>
        <span className="text-[11px] text-muted">Zaman İçindeki Değer</span>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Portföy Değeri']}
            />
            <Area type="monotone" dataKey="equity" stroke={strokeColor} strokeWidth={2} fillOpacity={1} fill={`url(#${gradientId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
