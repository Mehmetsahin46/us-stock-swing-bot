'use client';

import React, { useState } from 'react';
import { UserProfile, authenticate, USERS } from '@/lib/auth';
import { ShieldCheck, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [selectedUsername, setSelectedUsername] = useState<string>('mehmet.sahin');
  const [password, setPassword] = useState<string>('mehmet.sahin');
  const [error, setError] = useState<string | null>(null);

  const handleSelectUser = (uname: string) => {
    setSelectedUsername(uname);
    setPassword(uname); // Kolaylık için şifre kullanıcı adıyla aynı
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authenticate(selectedUsername, password);
    if (user) {
      onLoginSuccess(user);
    } else {
      setError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/30 mb-1">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">SwingBot Pro</h1>
          <p className="text-xs text-slate-400">Kişiselleştirilmiş BIST, ABD & Kripto Kuant Terminali</p>
        </div>

        {/* Quick User Selection Cards */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Giriş Yapılacak Hesap:</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(USERS).map((u, idx) => {
              const isSelected = selectedUsername === u.profile.username;
              return (
                <button
                  key={u.profile.id}
                  type="button"
                  onClick={() => handleSelectUser(u.profile.username)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-primary-500/20 border-primary-500 text-white shadow-md shadow-primary-500/20 ring-1 ring-primary-500'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl">{u.profile.avatar}</span>
                  <span className="text-xs font-bold truncate w-full">Hesap {idx + 1}</span>
                  <span className="text-[10px] text-slate-400 font-mono truncate w-full">***</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary-400" />
              <span>Kullanıcı Adı</span>
            </label>
            <input
              type="text"
              value={selectedUsername}
              onChange={e => setSelectedUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs outline-none focus:border-primary-500 font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary-400" />
              <span>Şifre</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs outline-none focus:border-primary-500 font-mono"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-primary-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Panele Giriş Yap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Her kullanıcının portföyü, bakiyesi, nakit tamponu ve robot ayarları tamamen izoledir.</span>
        </div>
      </div>
    </div>
  );
};
