// components/auth/PasswordInput.tsx - Password Input Reusable dengan Eye Toggle & Tap Target >= 44px
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
          <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
            {label}
          </label>
          {hint && <div className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>

          <input
            ref={ref}
            id={id}
            type={showPassword ? 'text' : 'password'}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`w-full min-h-[44px] pl-10 pr-12 py-2.5 rounded-xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white placeholder-slate-400 text-sm transition-all outline-none ${
              error
                ? 'border-rose-500 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-400'
            } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            className="absolute inset-y-0 right-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus:text-blue-600 transition-colors disabled:opacity-50 cursor-pointer min-w-[44px] min-h-[44px]"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200" />
            ) : (
              <Eye className="w-4 h-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200" />
            )}
          </button>
        </div>

        {error && (
          <p id={`${id}-error`} className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
