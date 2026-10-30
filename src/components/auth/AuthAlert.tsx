// components/auth/AuthAlert.tsx - Komponen Notifikasi Dekat Form (aria-live="polite")
'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AuthAlertProps {
  type?: 'error' | 'success' | 'info';
  message?: string | null;
  className?: string;
}

export default function AuthAlert({ type = 'error', message, className = '' }: AuthAlertProps) {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-rose-950/40 border-rose-500/40 text-rose-200',
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200',
      icon: <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />,
    },
  }[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed backdrop-blur-md shadow-sm transition-all duration-200 ${styles.bg} ${className}`}
    >
      {styles.icon}
      <div className="flex-1 font-medium">{message}</div>
    </div>
  );
}
