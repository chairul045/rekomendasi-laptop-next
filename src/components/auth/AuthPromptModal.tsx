'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { LogIn, UserPlus, X, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthPromptOptions {
  title?: string;
  message?: string;
  featureName?: string;
  returnUrl?: string;
}

interface AuthPromptContextType {
  openAuthPrompt: (options?: AuthPromptOptions) => void;
  closeAuthPrompt: () => void;
  isOpen: boolean;
}

const AuthPromptContext = createContext<AuthPromptContextType | undefined>(undefined);

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext);
  if (!context) {
    throw new Error('useAuthPrompt must be used within an AuthPromptProvider');
  }
  return context;
}

export function AuthPromptProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AuthPromptOptions>({
    title: 'Perlu Masuk Akun',
    message: 'Silakan login terlebih dahulu untuk menggunakan fitur ini.',
    featureName: '',
    returnUrl: '/',
  });

  const openAuthPrompt = useCallback((opts?: AuthPromptOptions) => {
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
    setOptions({
      title: opts?.title || 'Perlu Masuk Akun',
      message: opts?.message || 'Silakan login terlebih dahulu untuk menggunakan fitur ini.',
      featureName: opts?.featureName || '',
      returnUrl: opts?.returnUrl || currentUrl,
    });
    setIsOpen(true);
  }, []);

  const closeAuthPrompt = useCallback(() => {
    setIsOpen(false);
  }, []);

  const returnUrl = options.returnUrl || '/';
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(returnUrl)}`;
  const registerUrl = `/register?callbackUrl=${encodeURIComponent(returnUrl)}`;

  return (
    <AuthPromptContext.Provider value={{ openAuthPrompt, closeAuthPrompt, isOpen }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeAuthPrompt}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-[#0e0e15] border border-violet-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(124,58,237,0.25)] overflow-hidden z-10"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />

              {/* Close Button */}
              <button
                type="button"
                onClick={closeAuthPrompt}
                className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-5 text-center sm:text-left pt-2">
                {/* Header Icon + Badge */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-cyan-500/30 border border-violet-500/40 flex items-center justify-center text-cyan-300 shadow-md">
                    <Lock className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Autentikasi Diperlukan</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white mt-1">
                      {options.title}
                    </h3>
                  </div>
                </div>

                {/* Main Message */}
                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-2 text-left">
                  <p className="text-sm font-semibold text-zinc-100 leading-snug">
                    {options.message}
                  </p>
                  {options.featureName && (
                    <p className="text-xs text-zinc-400">
                      Fitur: <strong className="text-cyan-300">{options.featureName}</strong>
                    </p>
                  )}
                </div>

                {/* Benefits List */}
                <div className="space-y-1.5 text-left text-xs text-zinc-300">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                    Keuntungan Masuk ke Akun Lapmatch:
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Mulai kuesioner rekomendasi laptop TOPSIS & Gemini AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Simpan laptop favorit & bandingkan spesifikasi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Simpan riwayat konsultasi & unduh laporan resmi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Beri ulasan dan rating pada laptop</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={loginUrl}
                    onClick={closeAuthPrompt}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl text-center text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-lg shadow-violet-600/30 transition flex items-center justify-center gap-2 active:scale-98"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login / Masuk</span>
                  </Link>

                  <Link
                    href={registerUrl}
                    onClick={closeAuthPrompt}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl text-center text-xs font-bold text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 transition flex items-center justify-center gap-2 active:scale-98"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar Akun</span>
                  </Link>
                </div>

                {/* Cancel / Dismiss button */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={closeAuthPrompt}
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition underline underline-offset-4 cursor-pointer"
                  >
                    Nanti saja, lanjutkan eksplorasi katalog
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthPromptContext.Provider>
  );
}
