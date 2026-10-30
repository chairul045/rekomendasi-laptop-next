// components/auth/PasswordStrengthMeter.tsx - Indikator Kekuatan Kata Sandi
'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password?: string;
  name?: string;
  email?: string;
}

export function evaluatePasswordStrength(password: string = '', name: string = '', email: string = '') {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    notMatchingUserInfo: true,
  };

  const cleanPass = password.toLowerCase();
  const cleanName = (name || '').toLowerCase().trim();
  const cleanEmailName = (email || '').split('@')[0].toLowerCase().trim();

  if (
    cleanPass.length > 0 &&
    ((cleanName.length >= 3 && cleanPass.includes(cleanName)) ||
      (cleanEmailName.length >= 3 && cleanPass.includes(cleanEmailName)))
  ) {
    checks.notMatchingUserInfo = false;
  }

  if (checks.length) score += 1;
  if (checks.hasLower && checks.hasUpper) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSpecial) score += 1;
  if (!checks.notMatchingUserInfo) score = Math.min(score, 1);

  let label = 'Sangat Lemah';
  let color = 'bg-rose-500';
  let textColor = 'text-rose-400';
  let percent = 20;

  if (score <= 1) {
    label = 'Lemah';
    color = 'bg-rose-500';
    textColor = 'text-rose-400';
    percent = 25;
  } else if (score === 2) {
    label = 'Cukup';
    color = 'bg-amber-500';
    textColor = 'text-amber-400';
    percent = 50;
  } else if (score === 3) {
    label = 'Kuat';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-400';
    percent = 75;
  } else {
    label = 'Sangat Kuat';
    color = 'bg-cyan-400';
    textColor = 'text-cyan-300';
    percent = 100;
  }

  return { score, label, color, textColor, percent, checks };
}

export default function PasswordStrengthMeter({
  password = '',
  name = '',
  email = '',
}: PasswordStrengthMeterProps) {
  if (!password) return null;

  const { label, color, textColor, percent, checks } = evaluatePasswordStrength(password, name, email);

  return (
    <div className="space-y-2 pt-1 text-xs">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-zinc-400">Kekuatan Kata Sandi:</span>
        <span className={`font-semibold ${textColor}`}>{label}</span>
      </div>

      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-1 text-[11px] text-zinc-400 pt-1">
        <div className={`flex items-center gap-1.5 ${checks.length ? 'text-emerald-400' : 'text-zinc-500'}`}>
          {checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Min. 8 karakter</span>
        </div>
        <div
          className={`flex items-center gap-1.5 ${
            checks.hasNumber || checks.hasSpecial ? 'text-emerald-400' : 'text-zinc-500'
          }`}
        >
          {checks.hasNumber || checks.hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Huruf & angka/simbol</span>
        </div>
        <div
          className={`flex items-center gap-1.5 col-span-2 ${
            checks.notMatchingUserInfo ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {checks.notMatchingUserInfo ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Tidak sama dengan nama/email</span>
        </div>
      </div>
    </div>
  );
}
