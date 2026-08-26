'use client';

import React from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 rounded-2xl bg-[#131B2E] border border-slate-800 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Sistem Koruma Modunda</h2>
          <p className="text-xs text-slate-400 mt-1">
            Güvenli oturumunuz devam ediyor. Piyasa verileri anlık senkronizasyon sırasında korumaya alındı.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-primary-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Yeniden Dene</span>
          </button>

          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ana Sayfa</span>
          </a>
        </div>
      </div>
    </div>
  );
}