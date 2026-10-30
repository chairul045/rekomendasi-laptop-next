// components/auth/AuthButton.tsx - Tombol Utama Auth dengan Spinner & Tap Target >= 44px
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export default function AuthButton({
  loading = false,
  loadingText = 'Memproses...',
  variant = 'primary',
  children,
  disabled,
  className = '',
  ...props
}: AuthButtonProps) {
  const baseStyles =
    'w-full min-h-[44px] py-3 px-5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0e0e15] disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const variants = {
    primary:
      'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] focus:ring-violet-500',
    secondary:
      'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-white/10 hover:border-white/20 focus:ring-zinc-500',
    ghost:
      'bg-transparent hover:bg-white/5 text-zinc-300 hover:text-white border border-transparent focus:ring-zinc-500',
  }[variant];

  return (
    <button
      disabled={loading || disabled}
      className={`${baseStyles} ${variants} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
