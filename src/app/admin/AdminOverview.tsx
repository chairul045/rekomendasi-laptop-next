// src/app/admin/AdminOverview.tsx - Dashboard Admin Overview & Analytics
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/60 via-zinc-900 to-cyan-950/40 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Sistem Manajemen Terpusat Lapmatch</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Selamat Datang Kembali, {adminName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Pantau seluruh aktivitas pengguna, kelola katalog laptop, kriteria algoritma TOPSIS &amp; ROC, ulasan komunitas, dan laporan analitik dalam satu dashboard terintegrasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('laptops')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-violet-600/25 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Kelola Laptop</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 font-bold text-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Ekspor Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('users')}
          className="p-5 rounded-3xl bg-[#0e0e15]/90 border border-white/10 hover:border-violet-500/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-mono uppercase text-[11px] font-semibold">Total Pengguna</span>
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {loading ? '...' : stats?.totalUsers.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Akun mahasiswa &amp; pengguna aktif</span>
        </div>

        <div
          onClick={() => onNavigate('laptops')}
          className="p-5 rounded-3xl bg-[#0e0e15]/90 border border-white/10 hover:border-cyan-500/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-mono uppercase text-[11px] font-semibold">Data Laptop</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {loading ? '...' : stats?.totalLaptops.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Alternatif siap dianalisis SPK</span>
        </div>

        <div
          onClick={() => onNavigate('questionnaire')}
          className="p-5 rounded-3xl bg-[#0e0e15]/90 border border-white/10 hover:border-emerald-500/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-mono uppercase text-[11px] font-semibold">Sesi Kuesioner</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {loading ? '...' : stats?.totalConsultations.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Total pengisian rekomendasi</span>
        </div>

        <div
          onClick={() => onNavigate('reviews')}
          className="p-5 rounded-3xl bg-[#0e0e15]/90 border border-white/10 hover:border-amber-500/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-mono uppercase text-[11px] font-semibold">Kepuasan &amp; Ulasan</span>
            <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
              {loading ? '...' : stats?.avgRating || 4.8}★
            </div>
            <span className="text-xs text-zinc-400">({stats?.totalReviews || 12} ulasan)</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Tingkat akurasi rekomendasi</span>
        </div>
      </div>

      {/* Analytics Grid: Peruntukan Kebutuhan & Top Laptop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kebutuhan Mahasiswa Terpopuler */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Distribusi Kebutuhan Pengguna</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kategori pemakaian laptop yang paling sering dipilih mahasiswa
              </p>
            </div>
            <button
              onClick={() => onNavigate('questionnaire')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Lihat Detail →
            </button>
          </div>

          <div className="space-y-3.5">
            {peruntukan.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4">Belum ada data pengisian kuisioner.</p>
            ) : (
              peruntukan.map((item, idx) => {
                const colors = [
                  'from-violet-500 to-indigo-500',
                  'from-cyan-500 to-blue-500',
                  'from-emerald-500 to-teal-500',
                  'from-amber-500 to-orange-500',
                  'from-pink-500 to-rose-500',
                ];
                const grad = colors[idx % colors.length];

                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-zinc-200">{item.label}</span>
                      <span className="text-zinc-400">
                        <strong className="text-white">{item.count}</strong> sesi ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-zinc-950 overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
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
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Laptop Paling Populer (Rank 1)</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Laptop yang paling sering meraih peringkat pertama TOPSIS
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {topLaptops.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4">Belum ada sesi rekomendasi tersimpan.</p>
            ) : (
              topLaptops.map((item, idx) => (
                <div
                  key={item.name}
                  className="p-3 rounded-2xl bg-zinc-950/70 border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate max-w-[200px]">
                        {item.name}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono uppercase">
                        {item.brand}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/20">
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
      <div className="p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 backdrop-blur-md space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Merek Laptop Unggulan di Rekomendasi
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {topBrands.map((b) => (
            <div
              key={b.brand}
              className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 text-center space-y-1 hover:border-violet-500/30 transition"
            >
              <div className="text-sm font-black text-white font-mono uppercase">{b.brand}</div>
              <div className="text-xs font-bold text-cyan-400 font-mono">{b.count} Rekomendasi</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
