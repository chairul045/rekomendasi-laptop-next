// components/auth/GoogleButton.tsx - Tombol OAuth Google dengan State Loading & Tap Target >= 44px
'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface GoogleButtonProps {
  label?: string;
  onError?: (errMessage: string) => void;
  disabled?: boolean;
}

export default function GoogleButton({
  label = 'Masuk dengan Google',
  onError,
  disabled = false,
}: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const origin = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setLoading(false);
        onError?.(error.message || 'Gagal menghubungkan ke akun Google.');
      }
    } catch {
      setLoading(false);
      onError?.('Terjadi kesalahan saat memulai autentikasi Google.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || loading}
      className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-100 border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-xs tracking-wide shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
          <span>Membuka Google...</span>
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
  );
}
