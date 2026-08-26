'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle, Share, PlusSquare, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if already installed / standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Capture beforeinstallprompt for Chrome / Android / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.error('ServiceWorker registration failed:', err);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        onClose();
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#111827] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* App Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 border border-slate-700 p-1.5 shadow-xl flex items-center justify-center flex-shrink-0">
            <img src="/icon.svg" alt="App Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>SwingBot Mobil Uygulama</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Borsa İstanbul & ABD 7/24 Ticaret Portalı
            </p>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Tarayıcı çubuğu olmadan tam ekran native mobil deneyimi</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Kilit ekranında anlık sesli & titreşimli alım-satım bildirimleri</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Tek tıkla doğrudan telefon ana ekranından hızlı erişim</span>
          </div>
        </div>

        {/* Platform Specific Action */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
            <p className="text-xs font-bold text-emerald-400">🎉 Uygulama Zaten Cihazınızda Yüklü!</p>
            <p className="text-[11px] text-slate-400">Ana ekranınızdaki SwingBot simgesinden doğrudan açabilirsiniz.</p>
          </div>
        ) : isIOS ? (
          /* iOS Instructions */
          <div className="space-y-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
            <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>iPhone (iOS) Kurulum Adımları:</span>
            </div>

            <ol className="space-y-2.5 text-xs text-slate-300 pl-1">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                <span>Safari ekranının altındaki <strong>Paylaş ( <Share className="w-3 h-3 inline text-indigo-400" /> )</strong> simgesine dokunun.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                <span>Aşağı kaydırıp <strong>"Ana Ekrana Ekle" ( <PlusSquare className="w-3 h-3 inline text-indigo-400" /> )</strong> seçeneğine tıklayın.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">3</span>
                <span>Sağ üstteki <strong>"Ekle"</strong> butonuna basın. İşlem tamam!</span>
              </li>
            </ol>
          </div>
        ) : (
          /* Android / Chrome One-Click Install */
          <div className="space-y-3">
            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-primary-500 to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-primary-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Tek Tıkla Telefona Yükle</span>
              </button>
            ) : (
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <p className="font-semibold text-white">Android / Chrome Kurulumu:</p>
                <p>Chrome sağ üstteki <strong>Üç Nokta (⋮)</strong> menüsüne dokunun ve <strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> butonuna basın.</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer font-medium"
          >
            Daha Sonra
          </button>
        </div>
      </div>
    </div>
  );
};