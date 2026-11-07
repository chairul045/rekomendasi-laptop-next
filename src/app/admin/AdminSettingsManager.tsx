// src/app/admin/AdminSettingsManager.tsx - Pengaturan Sistem & Konfigurasi Admin
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs text-cyan-300 font-bold uppercase tracking-wider">
              Pengaturan &amp; Status Sistem
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Konfigurasi Administrator</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kelola profil administrator, periksa integritas database, dan pantau status mesin algoritma.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Status Sistem: Operasional Normal</span>
        </div>
      </div>

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profil Super Administrator */}
        <div className="p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Akun Super Administrator</h2>
              <p className="text-xs text-zinc-400">Pengelola tingkat tertinggi dengan hak akses absolut</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1">Nama Administrator</label>
              <input
                type="text"
                disabled
                value={adminName}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-semibold opacity-80"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Email Resmi Super Admin</label>
              <input
                type="text"
                disabled
                value="chairulanwarr003@gmail.com"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-cyan-300 font-mono opacity-80"
              />
            </div>
            <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
              🛡️ Akun ini diproteksi oleh lapisan keamanan otorisasi ganda (Backend Middleware + Prisma SuperAdmin Guard) sehingga tidak dapat diubah atau dihapus oleh user mana pun.
            </div>
          </div>
        </div>

        {/* Status Mesin SPK & Database */}
        <div className="p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Integritas Mesin &amp; Database</h2>
              <p className="text-xs text-zinc-400">Status konektivitas dan algoritma rekomendasi</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/70 border border-white/5">
              <div>
                <span className="font-bold text-white block">Algoritma TOPSIS</span>
                <span className="text-[11px] text-zinc-400">Normalisasi Euclidean &amp; Solusi Ideal</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AKTIF
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/70 border border-white/5">
              <div>
                <span className="font-bold text-white block">Metode ROC (Rank Order Centroid)</span>
                <span className="text-[11px] text-zinc-400">Kalkulasi bobot prioritas 6 kriteria</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AKTIF
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/70 border border-white/5">
              <div>
                <span className="font-bold text-white block">Database PostgreSQL (Supabase)</span>
                <span className="text-[11px] text-zinc-400">Connection Pooler AWS AP-Southeast-1</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                TERHUBUNG
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
