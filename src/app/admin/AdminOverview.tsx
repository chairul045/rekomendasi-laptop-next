// src/app/admin/AdminOverview.tsx - Dashboard Admin Overview & Analytics Modern
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Laptop,
  ClipboardList,
  Star,
  Flame,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  FileSpreadsheet,
  Layers,
  Award,
  CheckCircle2,
  Database,
  BarChart3,
} from 'lucide-react';
import { formatRupiah } from '@/lib/laptop-utils';

interface OverviewStats {
  totalUsers: number;
  totalLaptops: number;
  totalConsultations: number;
  totalBanners: number;
  totalReviews: number;
  avgRating: number;
}

interface PeruntukanItem {
  label: string;
  count: number;
  pct: number;
}

interface TopLaptopItem {
  name: string;
  brand: string;
  count: number;
}

interface BrandCountItem {
  brand: string;
  count: number;
}

export default function AdminOverview({
  adminName,
  onNavigate,
}: {
  adminName: string;
  onNavigate: (tab: string) => void;
}) {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [peruntukan, setPeruntukan] = useState<PeruntukanItem[]>([]);
  const [topLaptops, setTopLaptops] = useState<TopLaptopItem[]>([]);
  const [topBrands, setTopBrands] = useState<BrandCountItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats(data.overview);
          setPeruntukan(data.peruntukanList || []);
          setTopLaptops(data.topLaptopsList || []);
          setTopBrands(data.topBrandsList || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#0f172a] to-blue-950 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistem Manajemen Terpusat Lapmatch</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Selamat Datang Kembali, {adminName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pantau seluruh aktivitas pengguna, kelola katalog laptop, kriteria algoritma TOPSIS &amp; ROC, ulasan komunitas, dan laporan analitik dalam satu dashboard terintegrasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('laptops')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs transition shadow-xs cursor-pointer min-h-[42px]"
            >
              <Plus className="w-4 h-4" />
              <span>Kelola Laptop</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer min-h-[42px]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Ekspor Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          onClick={() => onNavigate('users')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="uppercase text-[11px] font-bold tracking-wider">Total Pengguna</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {loading ? '...' : stats?.totalUsers.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Akun mahasiswa &amp; pengguna aktif</span>
        </div>

        <div
          onClick={() => onNavigate('laptops')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="uppercase text-[11px] font-bold tracking-wider">Data Laptop</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center group-hover:scale-105 transition">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {loading ? '...' : stats?.totalLaptops.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Alternatif siap dianalisis SPK</span>
        </div>

        <div
          onClick={() => onNavigate('questionnaire')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="uppercase text-[11px] font-bold tracking-wider">Sesi Kuesioner</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center group-hover:scale-105 transition">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {loading ? '...' : stats?.totalConsultations.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Total pengisian rekomendasi</span>
        </div>

        <div
          onClick={() => onNavigate('reviews')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="uppercase text-[11px] font-bold tracking-wider">Rating &amp; Ulasan</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900 flex items-center justify-center group-hover:scale-105 transition">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
              {loading ? '...' : stats?.avgRating || 4.8}★
            </div>
            <span className="text-xs text-slate-500">({stats?.totalReviews || 12} ulasan)</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Tingkat kepuasan rekomendasi</span>
        </div>
      </div>

      {/* Analytics Grid: Peruntukan Kebutuhan & Top Laptop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kebutuhan Mahasiswa Terpopuler */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Distribusi Kebutuhan Pengguna</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kategori pemakaian laptop yang paling sering dipilih mahasiswa
              </p>
            </div>
            <button
              onClick={() => onNavigate('questionnaire')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Lihat Detail →
            </button>
          </div>

          <div className="space-y-3.5">
            {peruntukan.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">Belum ada data pengisian kuisioner.</p>
            ) : (
              peruntukan.map((item, idx) => {
                const colors = [
                  'from-blue-600 to-indigo-600',
                  'from-indigo-600 to-blue-500',
                  'from-blue-500 to-cyan-500',
                  'from-emerald-500 to-teal-500',
                  'from-amber-500 to-orange-500',
                ];
                const grad = colors[idx % colors.length];

                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-900 dark:text-white">{item.count}</strong> sesi ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-500`}
                        style={{ width: `${Math.max(item.pct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Recommended Laptops */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Laptop Paling Populer (Rank 1)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Laptop yang paling sering meraih peringkat pertama TOPSIS
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {topLaptops.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">Belum ada sesi rekomendasi tersimpan.</p>
            ) : (
              topLaptops.map((item, idx) => (
                <div
                  key={item.name}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {item.name}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">
                        {item.brand}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                      {item.count}x Juara
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Merek Laptop Paling Diminati */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
          Merek Laptop Unggulan di Rekomendasi
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {topBrands.map((b) => (
            <div
              key={b.brand}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1 hover:border-blue-300 transition"
            >
              <div className="text-sm font-black text-slate-900 dark:text-white font-mono uppercase">{b.brand}</div>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">{b.count} Rekomendasi</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
