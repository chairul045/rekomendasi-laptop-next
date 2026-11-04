'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Check,
  Send,
  Sparkles,
  Sliders,
  DollarSign,
  Laptop as LaptopIcon,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ── Kriteria Standar SPK ──────────────────────────────────────────────────────
const PERUNTUKAN_PRESETS: Record<string, string[]> = {
  Kuliah: ['C1', 'C5', 'C6', 'C3', 'C4', 'C2'],
  Programming: ['C3', 'C2', 'C4', 'C5', 'C6', 'C1'],
  'Desain Grafis': ['C2', 'C3', 'C4', 'C5', 'C1', 'C6'],
  Gaming: ['C2', 'C3', 'C4', 'C1', 'C5', 'C6'],
  Bisnis: ['C6', 'C5', 'C2', 'C3', 'C4', 'C1'],
};

// Hitung urutan prioritas kriteria otomatis berdasarkan kebutuhan & frekuensi pakai
function computeRankingKriteria(selectedPeruntukan: string[], frekuensi: string): string[] {
  const allCodes = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
  if (!selectedPeruntukan || selectedPeruntukan.length === 0) {
    return PERUNTUKAN_PRESETS.Kuliah;
  }

  const scores: Record<string, number> = { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 };

  selectedPeruntukan.forEach((p) => {
    const preset = PERUNTUKAN_PRESETS[p] || PERUNTUKAN_PRESETS.Kuliah;
    preset.forEach((code, idx) => {
      scores[code] += idx;
    });
  });

  allCodes.forEach((code) => {
    scores[code] /= selectedPeruntukan.length;
  });

  // Jika frekuensi tinggi, naikkan prioritas baterai (C5) dan portabilitas (C6)
  if (frekuensi.includes('Setiap') || frekuensi.includes('5 - 6')) {
    scores['C5'] -= 0.6;
    scores['C6'] -= 0.4;
  }

  return [...allCodes].sort((a, b) => scores[a] - scores[b]);
}

// Rekomendasi Pilihan Anggaran Populer
const BUDGET_RECOMMENDATIONS = [
  { label: 'Rp 3 - 6 Juta', desc: 'Hemat & Kebutuhan Dasar', min: 3000000, max: 6000000 },
  { label: 'Rp 6 - 10 Juta', desc: 'Standar Mahasiswa (Terpopuler)', min: 6000000, max: 10000000 },
  { label: 'Rp 10 - 15 Juta', desc: 'Performa Menengah / Koding', min: 10000000, max: 15000000 },
  { label: 'Rp 15 - 25 Juta', desc: 'Performa Tinggi & Gaming', min: 15000000, max: 25000000 },
  { label: '> Rp 25 Juta', desc: 'Spesifikasi Flagship / Maksimal', min: 25000000, max: 50000000 },
];

// Opsi Kebutuhan Pemakaian (Bisa Pilih Hingga 2)
const PERUNTUKAN_OPTIONS = [
  {
    value: 'Kuliah',
    emoji: '📚',
    title: 'Kuliah & Tugas Harian',
    desc: 'Ketik makalah/skripsi (Word & Excel), browsing materi, Zoom kuliah online, dan presentasi.',
  },
  {
    value: 'Programming',
    emoji: '💻',
    title: 'Programming & Koding',
    desc: 'VS Code, web & mobile development, Python, Git, Docker, dan kompilasi software.',
  },
  {
    value: 'Desain Grafis',
    emoji: '🎨',
    title: 'Desain Grafis & Edit Video',
    desc: 'Photoshop, Illustrator, Canva, Figma, Premiere Pro, dan pembuatan konten kreatif.',
  },
  {
    value: 'Gaming',
    emoji: '🎮',
    title: 'Gaming & Render 3D',
    desc: 'Main game online lancar, simulasi, rendering 3D Blender, AutoCAD, dan grafis berat.',
  },
  {
    value: 'Bisnis',
    emoji: '💼',
    title: 'Bisnis & Kerja Fleksibel',
    desc: 'Baterai tahan lama, bodi tipis ringan, meeting di mana saja, dan multitasking lancar.',
  },
];

// Opsi Frekuensi Pemakaian dalam Seminggu
const FREKUENSI_PEMAKAIAN_OPTIONS = [
  {
    value: '1 - 2 hari seminggu',
    emoji: '☕',
    title: '1 - 2 Hari Seminggu',
    desc: 'Penggunaan santai atau sesekali saat ada tugas tertentu.',
  },
  {
    value: '3 - 4 hari seminggu',
    emoji: '📖',
    title: '3 - 4 Hari Seminggu',
    desc: 'Penggunaan sedang beberapa hari dalam seminggu untuk kuliah dan belajar.',
  },
  {
    value: '5 - 6 hari seminggu',
    emoji: '🚀',
    title: '5 - 6 Hari Seminggu',
    desc: 'Hampir setiap hari untuk rutinitas kuliah, praktikum, dan mengerjakan tugas.',
  },
  {
    value: 'Setiap hari (7 hari)',
    emoji: '⚡',
    title: 'Setiap Hari (7 Hari)',
    desc: 'Penggunaan aktif dan intensif setiap hari dengan jam terbang tinggi.',
  },
];

// Daftar brand default (diperbarui dinamis dari database)
const BRANDS_DEFAULT = ['ASUS', 'Lenovo', 'HP', 'MSI', 'Acer', 'Dell', 'Razer', 'Axioo', 'ADVAN', 'Microsoft', 'MacBook', 'INFINIX'];

// Helper format Rupiah
function formatRupiahShort(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Main Page Content ─────────────────────────────────────────────────────────

function QuestionnaireContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuest = searchParams.get('guest') === 'true';

  const [loading, setLoading] = useState(false);
  const [guestResults, setGuestResults] = useState<any[] | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Brand list diambil dinamis dari database
  const [brands, setBrands] = useState<string[]>(BRANDS_DEFAULT);
  useEffect(() => {
    fetch('/api/admin/laptops')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.brands) && data.brands.length > 0) {
          setBrands(data.brands.map((b: { name: string }) => b.name));
        }
      })
      .catch(() => {
        // Tetap pakai BRANDS_DEFAULT jika gagal fetch
      });
  }, []);

  // Form State
  const [budgetMin, setBudgetMin] = useState(4000000);
  const [budgetMax, setBudgetMax] = useState(12000000);
  const [selectedPeruntukan, setSelectedPeruntukan] = useState<string[]>(['Kuliah']);
  const [kondisiPilihan, setKondisiPilihan] = useState<'baru' | 'second' | 'keduanya'>('keduanya');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['semua']);
  const [frekuensiPemakaian, setFrekuensiPemakaian] = useState('5 - 6 hari seminggu');

  // Validasi inline budget
  const isBudgetNegative = budgetMin < 0 || budgetMax < 0;
  const isBudgetInverted = budgetMin > budgetMax;
  const budgetError = isBudgetNegative
    ? 'Anggaran minimal dan maksimal tidak boleh bernilai negatif.'
    : isBudgetInverted
    ? 'Anggaran minimal tidak boleh lebih besar dari anggaran maksimal.'
    : null;

  // Toggle pilihan peruntukan (maksimal 2 pilihan)
  const handleTogglePeruntukan = (val: string) => {
    if (selectedPeruntukan.includes(val)) {
      if (selectedPeruntukan.length === 1) {
        toast('Pilih minimal 1 kebutuhan utama.', { icon: 'ℹ️' });
        return;
      }
      setSelectedPeruntukan(selectedPeruntukan.filter((item) => item !== val));
    } else {
      if (selectedPeruntukan.length >= 2) {
        toast('Maksimal memilih 2 kebutuhan utama agar rekomendasi tetap fokus.', {
          icon: '💡',
        });
        return;
      }
      setSelectedPeruntukan([...selectedPeruntukan, val]);
    }
  };

  // Toggle filter merek
  const toggleBrand = (brand: string) => {
    if (brand === 'semua') {
      setSelectedBrands(['semua']);
      return;
    }
    let updated = selectedBrands.filter((b) => b !== 'semua');
    if (updated.includes(brand)) {
      updated = updated.filter((b) => b !== brand);
    } else {
      updated.push(brand);
    }
    if (updated.length === 0) {
      updated = ['semua'];
    }
    setSelectedBrands(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (budgetError) {
      toast.error(budgetError);
      return;
    }

    if (selectedPeruntukan.length === 0) {
      toast.error('Silakan pilih minimal 1 kebutuhan penggunaan laptop.');
      return;
    }

    setLoading(true);

    // Hitung ranking kriteria otomatis secara cerdas
    const computedRanking = computeRankingKriteria(selectedPeruntukan, frekuensiPemakaian);
    const peruntukanText = selectedPeruntukan.join(' & ');

    if (isGuest) {
      try {
        const res = await fetch('/api/questionnaire/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            budgetMin,
            budgetMax,
            peruntukan: peruntukanText,
            kondisiPilihan,
            merekPilihan: selectedBrands,
            rankingKriteria: computedRanking,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || 'Gagal memproses rekomendasi.');
          return;
        }

        const results = data.previewResults || [];
        setGuestResults(results);
        setShowGuestModal(true);
        if (results.length > 0) {
          toast.success('Rekomendasi laptop berhasil ditemukan!');
        } else {
          toast('Tidak ada laptop yang cocok dalam rentang anggaran ini.', { icon: 'ℹ️' });
        }
      } catch {
        toast.error('Terjadi kendala jaringan. Silakan coba beberapa saat lagi.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budgetMin,
          budgetMax,
          peruntukan: peruntukanText,
          kondisiPilihan,
          merekPilihan: selectedBrands,
          frekuensiMembawa: frekuensiPemakaian,
          rankingKriteria: computedRanking,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Gagal memproses rekomendasi.');
        return;
      }

      toast.success('Rekomendasi laptop terbaik berhasil dianalisis!');
      router.push(`/recommendation/${data.jawabanId}`);
    } catch {
      toast.error('Terjadi gangguan jaringan saat memproses kuisioner. Silakan periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Banner Mode Tamu */}
        {isGuest && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-950/30 border border-amber-500/30 backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Mode Tamu (Tanpa Akun)</span>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Kamu dapat langsung melihat pratinjau 3 rekomendasi laptop teratas. Daftar akun gratis kapan saja untuk menyimpan riwayat dan membuka analisis AI mendalam.
              </p>
            </div>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs whitespace-nowrap shadow-md transition"
            >
              Daftar Gratis →
            </Link>
          </div>
        )}

        {/* Header Bersih & Ramah Pengguna */}
        <div className="text-center sm:text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-950/60 to-cyan-950/60 border border-violet-500/30 text-cyan-300 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pencarian Cerdas Sesuai Kebutuhan & Anggaranmu</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Temukan Laptop yang{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">
              Paling Tepat untuk Kamu
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
            Jawab 5 pertanyaan mudah di bawah ini. Sistem kami akan menyaring ratusan laptop di katalog dan memberikan rekomendasi terbaik lengkap dengan analisis keunggulannya.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Anggaran (Budget) */}
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                  1
                </span>
                <label className="text-base font-bold text-white">
                  Berapa anggaran (budget) yang kamu siapkan?
                </label>
              </div>
              <span className="text-xs text-zinc-400">
                Pilih rekomendasi cepat atau atur bebas
              </span>
            </div>

            {/* Bagian Atas: Rekomendasi Pilihan Anggaran */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-400 block">
                💡 Rekomendasi Pilihan Anggaran Cepat:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {BUDGET_RECOMMENDATIONS.map((preset) => {
                  const isSelected = budgetMin === preset.min && budgetMax === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setBudgetMin(preset.min);
                        setBudgetMax(preset.max);
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-950/50 via-cyan-950/40 to-zinc-950 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                          {preset.label}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-emerald-400 text-zinc-950 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 mt-1">
                        {preset.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bagian Bawah: Bebas Memilih Anggaran */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Atau Bebas Menentukan Rentang Anggaran Sendiri:</span>
                </span>
                <span className="text-xs font-mono text-cyan-300 font-semibold">
                  {formatRupiahShort(budgetMin)} – {formatRupiahShort(budgetMax)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 block font-medium">
                    Anggaran Minimal (Dari)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(Number(e.target.value))}
                      step="500000"
                      min="0"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950/90 border font-mono text-sm focus:outline-none transition ${
                        budgetError ? 'border-rose-500/80 text-rose-200 focus:border-rose-400' : 'border-zinc-800 text-zinc-100 focus:border-cyan-400'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500 block">
                    {formatRupiahShort(budgetMin)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 block font-medium">
                    Anggaran Maksimal (Sampai)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(Number(e.target.value))}
                      step="500000"
                      min="0"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950/90 border font-mono text-sm focus:outline-none transition ${
                        budgetError ? 'border-rose-500/80 text-rose-200 focus:border-rose-400' : 'border-zinc-800 text-zinc-100 focus:border-cyan-400'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500 block">
                    {formatRupiahShort(budgetMax)}
                  </span>
                </div>
              </div>

              {budgetError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>{budgetError}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Peruntukan Pemakaian (Bisa Pilih Hingga 2) */}
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                  2
                </span>
                <label className="text-base font-bold text-white">
                  Untuk apa saja laptop ini akan kamu gunakan?
                </label>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/50 px-2.5 py-1 rounded-full border border-cyan-800/50">
                <span>Pilih 1 atau 2 kebutuhan ({selectedPeruntukan.length}/2)</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Kamu bisa memilih maksimal <strong>2 pilihan</strong> jika laptop dipakai untuk beberapa kebutuhan sekaligus (misalnya untuk kuliah dan sesekali main game).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERUNTUKAN_OPTIONS.map((opt) => {
                const isSelected = selectedPeruntukan.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleTogglePeruntukan(opt.value)}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-br from-violet-950/70 via-indigo-950/50 to-zinc-950 border-violet-500/60 text-white shadow-[0_0_20px_rgba(124,58,237,0.25)] ring-1 ring-violet-500/40'
                        : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{opt.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                          {opt.title}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-400 text-zinc-950'
                              : 'border-zinc-700 bg-zinc-900/60'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Kondisi Laptop */}
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-4 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                3
              </span>
              <label className="text-base font-bold text-white">
                Kondisi laptop seperti apa yang kamu inginkan?
              </label>
            </div>
            <p className="text-xs text-zinc-400">
              Pilih apakah kamu mencari laptop baru bergaransi resmi atau laptop bekas (second) yang lebih hemat.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  value: 'keduanya',
                  label: '✨ Bebas (Baru & Second)',
                  sub: 'Tampilkan laptop baru maupun second terbaik yang masuk anggaran',
                },
                {
                  value: 'baru',
                  label: '📦 Hanya Baru',
                  sub: 'Kondisi segel dengan garansi resmi distributor',
                },
                {
                  value: 'second',
                  label: '🔄 Hanya Bekas / Second',
                  sub: 'Spesifikasi lebih tinggi dengan harga yang jauh lebih hemat',
                },
              ].map((opt) => {
                const isSelected = kondisiPilihan === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setKondisiPilihan(opt.value as 'baru' | 'second' | 'keduanya')}
                    className={`p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500/60 text-white font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <div className="text-sm font-bold">{opt.label}</div>
                    <div className="text-[11px] text-zinc-300/80 mt-1.5 leading-relaxed">
                      {opt.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Filter Merek Laptop */}
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                  4
                </span>
                <label className="text-base font-bold text-white">
                  Apakah ada merek laptop tertentu yang kamu sukai?
                </label>
              </div>
              <span className="text-xs text-zinc-400">Bisa pilih beberapa merek</span>
            </div>
            <p className="text-xs text-zinc-400">
              Pilih merek favoritmu, atau biarkan <strong>&quot;Semua Merek&quot;</strong> agar pilihan laptop yang dianalisis semakin beragam dan optimal.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => toggleBrand('semua')}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  selectedBrands.includes('semua')
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                ✨ Semua Merek (Rekomendasi)
              </button>
              {brands.map((brand) => {
                const isSelected = selectedBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600/30 text-violet-300 border-violet-500/50 shadow-sm'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Frekuensi Pemakaian dalam Seminggu */}
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-4 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                5
              </span>
              <label className="text-base font-bold text-white">
                Dalam seminggu, seberapa sering laptop akan kamu pakai?
              </label>
            </div>
            <p className="text-xs text-zinc-400">
              Ini membantu kami menilai seberapa penting daya tahan baterai dan kemudahan membawa laptop (bobot ringan) untuk keseharianmu.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FREKUENSI_PEMAKAIAN_OPTIONS.map((f) => {
                const isSelected = frekuensiPemakaian === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFrekuensiPemakaian(f.value)}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-950/60 to-orange-950/40 border-amber-500/50 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{f.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                          {f.title}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tombol Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="shimmer-button w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.7)] transition active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sedang Mencocokkan Laptop Terbaik untuk Kamu...</span>
                </>
              ) : (
                <>
                  <span>Lihat Rekomendasi Laptop untuk Saya</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Modal Hasil Pratinjau Terbatas Tamu */}
        {showGuestModal && guestResults && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          >
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-[#0e0e15] border border-white/10 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                    Hasil Pratinjau Cepat (Mode Tamu)
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    3 Rekomendasi Laptop Teratas untuk Kamu
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuestModal(false)}
                  className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Daftar 3 Laptop atau Empty State */}
              <div className="space-y-3">
                {guestResults.length > 0 ? (
                  guestResults.map((item, idx) => (
                    <div
                      key={item.laptop?.id || idx}
                      className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/70 border border-white/10"
                    >
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-mono font-bold flex items-center justify-center text-sm shrink-0">
                          #{item.peringkat}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">
                            {item.laptop?.name}
                          </h3>
                          <p className="text-xs text-zinc-400">
                            {item.laptop?.brand} &bull; RAM {item.laptop?.ramGb ?? '—'}GB &bull; SSD {item.laptop?.storageGb ?? '—'}GB
                          </p>
                        </div>
                      </div>

                      <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                        <div className="text-sm font-extrabold text-cyan-300">
                          Rp {Number(item.laptop?.price).toLocaleString('id-ID')}
                        </div>
                        <span className="text-xs font-mono text-zinc-400">
                          Skor Kecocokan: {(item.skor * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-2xl bg-zinc-950/70 border border-white/10 text-center space-y-2">
                    <p className="text-sm font-bold text-white">Tidak Ada Laptop yang Cocok</p>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Tidak ditemukan laptop dalam rentang budget {formatRupiahShort(budgetMin)} - {formatRupiahShort(budgetMax)}. Coba naikkan batas anggaran atau pilih opsi Semua Merek.
                    </p>
                  </div>
                )}
              </div>

              {/* Ajakan Mendaftar Akun */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/50 via-indigo-950/40 to-cyan-950/50 border border-cyan-500/30 space-y-3 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">
                      Ingin Menyimpan Hasil & Buka Analisis AI Lengkap?
                    </h3>
                    <p className="text-xs text-zinc-300">
                      Daftar akun gratis untuk melihat alasan rekomendasi AI untuk setiap laptop, membandingkan spesifikasi langsung, dan menyimpan riwayat konsultasimu.
                    </p>
                  </div>
                  <Link
                    href="/register"
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg hover:scale-105 transition shrink-0 flex items-center justify-center"
                  >
                    Daftar Sekarang →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090d] text-zinc-100 flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span>Memuat formulir rekomendasi...</span>
          </div>
        </div>
      }
    >
      <QuestionnaireContent />
    </Suspense>
  );
}
