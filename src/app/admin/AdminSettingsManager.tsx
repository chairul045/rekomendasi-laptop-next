// src/app/admin/AdminSettingsManager.tsx - Pengaturan Sistem & Konfigurasi Admin Modern
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Settings,
  Shield,
  KeyRound,
  Server,
  Cpu,
  Database,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Globe,
  RefreshCw,
} from 'lucide-react';

export default function AdminSettingsManager({ adminName }: { adminName: string }) {
  const [platformName, setPlatformName] = useState('Lapmatch - Smart Laptop Recommender');
  const [geminiStatus, setGeminiStatus] = useState('Aktif (Gemini 2.5 Flash)');
  const [saving, setSaving] = useState(false);

  const handleSaveConfig = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Konfigurasi sistem berhasil disimpan.');
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-blue-600" />
            <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
              Pengaturan &amp; Status Sistem
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Konfigurasi Administrator</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola profil administrator, periksa integritas database, dan pantau status mesin algoritma.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Status Sistem: Operasional Normal</span>
        </div>
      </div>

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profil Super Administrator */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Akun Super Administrator</h2>
              <p className="text-xs text-slate-500">Pengelola tingkat tertinggi dengan hak akses absolut</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Nama Administrator</label>
              <input
                type="text"
                disabled
                value={adminName}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold opacity-90"
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Email Resmi Super Admin</label>
              <input
                type="text"
                disabled
                value="chairulanwarr003@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 font-mono font-semibold opacity-90"
              />
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
              🛡️ Akun ini diproteksi oleh lapisan keamanan otorisasi ganda (Backend Middleware + Prisma SuperAdmin Guard) sehingga tidak dapat diubah atau dihapus oleh user mana pun.
            </div>
          </div>
        </div>

        {/* Status Mesin SPK & Database */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Integritas Mesin &amp; Database</h2>
              <p className="text-xs text-slate-500">Status konektivitas dan algoritma rekomendasi</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Algoritma TOPSIS</span>
                <span className="text-[11px] text-slate-500">Normalisasi Euclidean &amp; Solusi Ideal</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                AKTIF
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Metode ROC (Rank Order Centroid)</span>
                <span className="text-[11px] text-slate-500">Kalkulasi bobot prioritas 6 kriteria</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                AKTIF
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Database PostgreSQL (Supabase)</span>
                <span className="text-[11px] text-slate-500">Connection Pooler AWS AP-Southeast-1</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                TERHUBUNG
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
