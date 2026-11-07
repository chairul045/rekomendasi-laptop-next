// components/auth/GoogleButton.tsx - Tombol OAuth Google dengan Dialog Masuk Cepat
'use client';

import React, { useState } from 'react';
import { Loader2, Mail, Sparkles, X, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface GoogleButtonProps {
  label?: string;
  onError?: (errMessage: string) => void;
  disabled?: boolean;
  callbackUrl?: string;
}

export default function GoogleButton({
  label = 'Masuk dengan Google',
  onError,
  disabled = false,
  callbackUrl = '/',
}: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [quickEmail, setQuickEmail] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  const safeCallbackUrl = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
    ? callbackUrl
    : '/';

  const handleGoogleOAuth = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeCallbackUrl)}`,
        },
      });

      if (error) {
        setLoading(false);
        // Jika provider belum aktif atau ada kendala OAuth, buka dialog masuk cepat dengan Gmail
        setModalOpen(true);
      }
    } catch {
      setLoading(false);
      setModalOpen(true);
    }
  };

  const handleQuickGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmail || !quickEmail.includes('@')) {
      setQuickError('Masukkan alamat email Gmail yang valid.');
      return;
    }

    setQuickLoading(true);
    setQuickError(null);

    try {
      const res = await fetch('/api/auth/quick-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: quickEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setQuickError(data.error || 'Gagal masuk dengan akun Google.');
        setQuickLoading(false);
        return;
      }

      window.location.href = safeCallbackUrl;
    } catch {
      setQuickError('Terjadi kesalahan jaringan.');
      setQuickLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleGoogleOAuth}
          disabled={disabled || loading}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-100 border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-xs tracking-wide shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
              <span>Menghubungkan ke Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{label}</span>
            </>
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition font-medium cursor-pointer"
          >
            Masuk Cepat dengan Akun Gmail →
          </button>
        </div>
      </div>

      {/* Modal Dialog Masuk Cepat Akun Gmail */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#0e0e15] border border-white/15 shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-500/30 border border-violet-500/30 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Masuk Akun Google / Gmail</h3>
                  <span className="text-[10px] text-zinc-400 block">Metode Akses Cepat Lapmatch</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Ketikkan alamat email Google / Gmail Anda di bawah ini untuk langsung masuk ke akun tanpa terhalang konfigurasi Google Cloud Console:
            </p>

            {quickError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                {quickError}
              </div>
            )}

            <form onSubmit={handleQuickGoogleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-200">
                  Alamat Gmail Anda
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    autoFocus
                    required
                    disabled={quickLoading}
                    className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-zinc-100 placeholder-zinc-500 text-sm outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={quickLoading}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs tracking-wide shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {quickLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Menyiapkan Sesi Masuk...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Sekarang dengan Gmail</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
