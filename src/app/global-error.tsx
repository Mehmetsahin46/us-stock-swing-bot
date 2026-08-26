'use client';

import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-[#131B2E] border border-slate-800 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Güvenli Oturum Koruması</h2>
            <p className="text-xs text-slate-400 mt-1">
              Bağlantı güvenliği sağlandı. Verileriniz şifreli olarak korunmaktadır.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-primary-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sistemi Yeniden Başlat</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}