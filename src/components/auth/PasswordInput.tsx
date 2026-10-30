// components/auth/PasswordInput.tsx - Password Input Reusable dengan Tombol Toggle Eye (>= 44px Tap Target)
'use client';

import React, { useState, forwardRef } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  id: string;
  error?: string;
  hint?: React.ReactNode;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, id, error, hint, className = '', disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-xs font-semibold text-zinc-200 cursor-pointer">
            {label}
          </label>
          {hint && <div className="text-[11px] text-zinc-400">{hint}</div>}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Lock className="w-4 h-4" />
          </div>

          <input
            ref={ref}
            id={id}
            type={showPassword ? 'text' : 'password'}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`w-full min-h-[44px] pl-10 pr-12 py-2.5 rounded-xl bg-zinc-950/90 border text-zinc-100 placeholder-zinc-400 text-sm transition-all outline-none ${
              error
                ? 'border-rose-500/70 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                : 'border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 hover:border-white/20'
            } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            className="absolute inset-y-0 right-0 px-3.5 flex items-center justify-center text-zinc-400 hover:text-zinc-100 focus:outline-none focus:text-cyan-300 transition-colors disabled:opacity-50 cursor-pointer min-w-[44px] min-h-[44px]"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-zinc-300 hover:text-white" />
            ) : (
              <Eye className="w-4 h-4 text-zinc-300 hover:text-white" />
            )}
          </button>
        </div>

        {error && (
          <p id={`${id}-error`} className="text-xs text-rose-300 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
