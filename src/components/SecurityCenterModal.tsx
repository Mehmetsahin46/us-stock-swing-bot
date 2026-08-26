'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  X, 
  Power, 
  Lock, 
  AlertTriangle, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Radio, 
  Layers, 
  Database,
  Hash
} from 'lucide-react';

interface SecurityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityCenterModal: React.FC<SecurityCenterModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [killSwitchLoading, setKillSwitchLoading] = useState<boolean>(false);

  async function loadSecurityData() {
    setLoading(true);
    try {
      const res = await fetch('/api/security', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadSecurityData();
    }
  }, [isOpen]);

  async function handleToggleKillSwitch() {
    if (!data) return;
    const currentState = data.securityState?.killSwitchActive;
    const newState = !currentState;
    setKillSwitchLoading(true);
    try {
      const res = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_KILL_SWITCH',
          active: newState,
          reason: newState ? 'Yönetici tarafından güvenlik kalkanı amacıyla durduruldu.' : undefined
        })
      });
      if (res.ok) {
        await loadSecurityData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setKillSwitchLoading(false);
    }
  }

  if (!isOpen) return null;

  const isKillActive = data?.securityState?.killSwitchActive;
  const quarantined = data?.securityState?.quarantinedSignals || [];
  const auditLogs = data?.auditLogs || [];
  const locked = data?.lockedConstants || {
    MAX_STOP_LOSS_PCT: 3.5,
    RSI_OVERBOUGHT_CEILING: 72,
    MIN_DATA_CONFIDENCE_THRESHOLD: 80,
    CIRCUIT_BREAKER_DRAWDOWN_PCT: 2.5
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0D1117] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
              isKillActive 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' 
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Siber Güvenlik & Manipülasyon Kalkanı</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                  Siber Savunma 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Piyasa manipülasyonu, sahte hacim ve veri anomali koruma merkezi</p>
            </div>
          </div>

          <button
            onClick={loadSecurityData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all cursor-pointer mr-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>
        </div>

        {/* 🛑 1. EMERGENCY KILL SWITCH BANNER */}
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
          isKillActive 
            ? 'bg-rose-950/60 border-rose-500/50 shadow-lg shadow-rose-500/10' 
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <Power className={`w-4 h-4 ${isKillActive ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                Acil Durum Kilit Anahtarı (Emergency Kill Switch)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isKillActive 
                ? '🛑 SİNYAL MOTORU DONDURULDU: Yeni hiçbir sinyal üretilmiyor.' 
                : '🟢 Sinyal motoru normal ve otonom modda devrede.'}
            </p>
          </div>

          <button
            onClick={handleToggleKillSwitch}
            disabled={killSwitchLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              isKillActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isKillActive ? 'Sistemi Yeniden Başlat' : 'Tüm Sinyalleri Durdur (Kill Switch)'}</span>
          </button>
        </div>

        {/* 🧱 2. SERVER-SIDE LOCKED CONSTANTS */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sunucu Tarafında Kilitli Risk Parametreleri (Server-Side Lockdown)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold">READ-ONLY (FROZEN)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-500 text-[10px] block">Maks Stop Limiti</span>
              <span className="text-white font-bold text-sm">%{locked.MAX_STOP_LOSS_PCT}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-500 text-[10px] block">FOMO / Tepe Sınırı</span>
              <span className="text-white font-bold text-sm">RSI {locked.RSI_OVERBOUGHT_CEILING}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-500 text-[10px] block">Min Veri Güveni</span>
              <span className="text-emerald-400 font-bold text-sm">%{locked.MIN_DATA_CONFIDENCE_THRESHOLD}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-500 text-[10px] block">Günlük Devre Kesici</span>
              <span className="text-danger-400 font-bold text-sm">-%{locked.CIRCUIT_BREAKER_DRAWDOWN_PCT}</span>
            </div>
          </div>
        </div>

        {/* 🟡 3. SIGNAL QUARANTINE (KARANTİNA) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Güvenlik Karantinası (Signal Quarantine)</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {quarantined.length} Sinyal Doğrulanıyor
            </span>
          </div>

          {quarantined.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              🟢 Karantinada bekleyen şüpheli sinyal bulunmuyor. Tüm sinyaller temiz.
            </div>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {quarantined.map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.signal.displayTicker}</span>
                    <span className="text-[10px] text-amber-300">🟡 SIGNAL UNDER VALIDATION</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{item.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📝 4. IMMUTABLE SECURITY AUDIT LOG */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Değiştirilemez Güvenlik Audit Günlüğü (SHA-256 Log)</span>
          </h3>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 max-h-36 overflow-y-auto space-y-1.5 text-[11px] font-mono">
            {auditLogs.length === 0 ? (
              <div className="text-slate-500 italic">Henüz kaydedilmiş güvenlik olayı yok.</div>
            ) : (
              auditLogs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-2 border-b border-slate-800/60 pb-1">
                  <span className="text-slate-500 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    log.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : log.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {log.eventType}
                  </span>
                  <span className="text-slate-300 flex-1">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-right pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Güvenlik Merkezini Kapat
          </button>
        </div>
      </div>
    </div>
  );
};