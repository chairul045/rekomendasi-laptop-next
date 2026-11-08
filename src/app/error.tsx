'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home, Terminal } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Lapmatch Application Error]:', error);
  }, [error]);

  const isConfigError =
    error.message?.includes('DATABASE_URL') ||
    error.message?.includes('SUPABASE') ||
    error.message?.includes('environment variable');

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl p-8 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Terjadi Kesalahan pada Server
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            {isConfigError
              ? 'Konfigurasi environment database atau autentikasi server belum terhubung dengan lengkap.'
              : 'Sistem mengalami kendala saat memuat halaman ini. Silakan coba muat ulang atau kembali ke beranda.'}
          </p>
        </div>

        {error.message && (
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/5 text-left space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Detail Kesalahan:</span>
            </div>
            <p className="text-xs font-mono text-rose-300 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-zinc-600">
                Digest Code: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition shadow-lg shadow-violet-600/25 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Coba Muat Ulang</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-sm font-semibold transition"
          >
            <Home className="w-4 h-4" />
            <span>Ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
