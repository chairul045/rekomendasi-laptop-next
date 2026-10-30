// components/auth/Input.tsx - Input Reusable dengan WCAG AA Compliance & Tap Target >= 44px
'use client';

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, icon, hint, className = '', disabled, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-xs font-semibold text-zinc-200 cursor-pointer">
            {label}
          </label>
          {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
        </div>

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`w-full min-h-[44px] py-2.5 rounded-xl bg-zinc-950/90 border text-zinc-100 placeholder-zinc-400 text-sm transition-all outline-none ${
              icon ? 'pl-10' : 'pl-3.5'
            } pr-3.5 ${
              error
                ? 'border-rose-500/70 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                : 'border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 hover:border-white/20'
            } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
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

Input.displayName = 'Input';
export default Input;
