'use client';

import React, { useState, useEffect } from 'react';
import { SystemHealthReport } from '@/lib/healthMonitor';
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw, X, ShieldCheck, Database, Radio, Bell, Cpu, Clock } from 'lucide-react';

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchHealth() {
    setLoading(true);
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.report) setReport(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getStatusIcon = (status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE') => {
    if (status === 'HEALTHY') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (status === 'DEGRADED') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <XCircle className="w-4 h-4 text-rose-400" />;
  };

  const getCategoryIcon = (cat: string) => {
    if (cat === 'DATA') return <Radio className="w-4 h-4 text-indigo-400" />;
    if (cat === 'DATABASE') return <Database className="w-4 h-4 text-cyan-400" />;
    if (cat === 'NOTIFICATION') return <Bell className="w-4 h-4 text-amber-400" />;
    return <Cpu className="w-4 h-4 text-primary-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#111827] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Sistem & Veri Sağlığı (Heartbeat)</h2>
              <p className="text-xs text-slate-400">Tüm kuant ve veri sağlayıcı servislerin canlı çalışma durumu</p>
            </div>
          </div>

          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all cursor-pointer mr-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Test Et</span>
          </button>
        </div>

        {/* Overall Status Banner */}
        {report && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-emerald-300 block">
                  {report.overallStatus === 'OPTIMAL' ? '🟢 Tüm Sistemler Kusursuz Çalışıyor' : '⚠️ Sistem Çalışıyor (Yedek Mod)'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Veri Akışı: <strong className="text-white font-mono">{report.dataHealth === 'LIVE' ? 'CANLI (Gecikmesiz)' : 'GECİKMELİ'}</strong>
                </span>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
              <span>{new Date(report.lastHeartbeat).toLocaleTimeString('tr-TR')}</span>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="space-y-2.5">
          {report?.services.map((srv, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  {getCategoryIcon(srv.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{srv.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400">
                      {srv.latencyMs} ms
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{srv.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {getStatusIcon(srv.status)}
                <span className="font-bold text-[11px] text-slate-200">
                  {srv.status === 'HEALTHY' ? 'ONLINE' : srv.status === 'DEGRADED' ? 'UYARI' : 'KAPALI'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};