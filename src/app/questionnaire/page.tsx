'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Check,
  Send,
  Sparkles,
  Sliders,
  DollarSign,
  Laptop as LaptopIcon,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Info,
  HelpCircle,
  BookOpen,
  Cpu,
  Zap,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { useAuthPrompt } from '@/components/auth/AuthPromptModal';

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
  const { openAuthPrompt } = useAuthPrompt();

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Multi-step Wizard State: 1 soal per tampilan
  const [currentStep, setCurrentStep] = useState<number>(1);
  const TOTAL_STEPS = 5;

  // Check authentication status across API profile & Supabase client
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
          const profile = await res.json();
          if (profile && profile.id) {
            if (isMounted) {
              setCurrentUser({
                id: profile.id,
                name: profile.name || 'Pengguna',
                email: profile.email || '',
                role: profile.role || 'user',
              });
              setCheckingAuth(false);
              return;
            }
          }
        }
      } catch {}

      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          if (isMounted) {
            const u = userData.user;
            setCurrentUser({
              id: u.id,
              name: (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'Pengguna',
              email: u.email || '',
              role: (u.user_metadata?.role as string) || 'user',
            });
            setCheckingAuth(false);
            return;
          }
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          if (isMounted) {
            const u = sessionData.session.user;
            setCurrentUser({
              id: u.id,
              name: (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'Pengguna',
              email: u.email || '',
              role: (u.user_metadata?.role as string) || 'user',
            });
            setCheckingAuth(false);
            return;
          }
        }
      } catch {}

      if (isMounted) {
        setCurrentUser(null);
        setCheckingAuth(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

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
      .catch(() => {});
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

  // Step Navigation Validation
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (budgetError) {
        toast.error(budgetError);
        return;
      }
    } else if (currentStep === 2) {
      if (selectedPeruntukan.length === 0) {
        toast.error('Pilih minimal 1 kebutuhan utama.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
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

    const computedRanking = computeRankingKriteria(selectedPeruntukan, frekuensiPemakaian);
    const peruntukanText = selectedPeruntukan.join(' & ');

    if (!currentUser) {
      setLoading(false);
      openAuthPrompt({
        title: 'Masuk Akun untuk Memulai Kuesioner',
        message: 'Silakan login terlebih dahulu untuk menggunakan fitur ini.',
        featureName: 'Memulai kuesioner rekomendasi laptop',
        returnUrl: '/questionnaire',
      });
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090d] text-zinc-900 dark:text-zinc-100 transition-colors">
        <Navbar user={null} />
        <main className="flex-grow flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <span className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span>Memeriksa status akun...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // === TAMPILAN PANDUAN PENJELASAN KUESIONER ===
  if (!currentUser || showExplanation) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090d] text-zinc-900 dark:text-zinc-100 transition-colors">
        <Navbar user={currentUser} />

        <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
          {currentUser && showExplanation && (
            <div>
              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-slate-200 dark:border-white/10 transition cursor-pointer"
              >
                ← Kembali ke Pengisian Kuesioner
              </button>
            </div>
          )}

          {/* Hero Header Penjelasan */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Panduan Kuesioner Rekomendasi Laptop</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
              Pencarian Laptop Kuliah Presisi &amp; Personal
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Kuesioner ini dirancang praktis: 1 soal per langkah. Anda hanya perlu menjawab 5 pertanyaan singkat untuk menemukan laptop paling ideal untuk perkuliahan Anda.
            </p>
          </div>

          {/* 5 Parameter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { num: '1', title: 'Anggaran (Budget)', desc: 'Rentang dana hemat hingga spesifikasi tinggi.' },
              { num: '2', title: 'Kebutuhan Utama', desc: 'Kuliah harian, koding, desain, gaming, atau bisnis.' },
              { num: '3', title: 'Kondisi Laptop', desc: 'Pilihan unit Baru, Bekas/Second, atau Keduanya.' },
              { num: '4', title: 'Preferensi Merek', desc: 'Pilih brand favorit Anda atau semua merek.' },
              { num: '5', title: 'Frekuensi Pakai', desc: 'Menilai prioritas baterai dan bobot portabel.' },
            ].map((p) => (
              <div key={p.num} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-violet-600/10 text-violet-600 dark:text-violet-400 font-bold font-mono flex items-center justify-center text-xs">
                  {p.num}
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">{p.title}</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Tombol Mulai Kuesioner */}
          <div className="pt-4 text-center space-y-3">
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  openAuthPrompt({
                    title: 'Masuk Akun untuk Memulai Kuesioner',
                    message: 'Silakan login terlebih dahulu untuk menggunakan fitur ini.',
                    featureName: 'Memulai kuesioner rekomendasi laptop',
                    returnUrl: '/questionnaire',
                  });
                } else {
                  setShowExplanation(false);
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-lg shadow-violet-600/25 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Mulai Kuesioner Sekarang (5 Soal Cepat)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // === TAMPILAN WIZARD MULTI-STEP: 1 SOAL HABIS ITU LANJUT SOAL BERIKUTNYA ===
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090d] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar user={currentUser} />

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Top Wizard Progress Bar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                Soal {currentStep} dari {TOTAL_STEPS}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">
                {currentStep === 1 && 'Rentang Anggaran (Budget)'}
                {currentStep === 2 && 'Kebutuhan Penggunaan Utama'}
                {currentStep === 3 && 'Pilihan Kondisi Laptop'}
                {currentStep === 4 && 'Preferensi Merek'}
                {currentStep === 5 && 'Frekuensi Pemakaian'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowExplanation(true)}
              className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-cyan-500" />
              <span>Bantuan Panduan</span>
            </button>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500"
              initial={false}
              animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            />
          </div>

          {/* Step Pill Indicators */}
          <div className="flex items-center justify-between pt-1 px-1">
            {[1, 2, 3, 4, 5].map((stepNum) => {
              const isPast = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              return (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => {
                    if (stepNum < currentStep) setCurrentStep(stepNum);
                  }}
                  disabled={stepNum > currentStep}
                  className={`flex items-center gap-1 text-[11px] font-mono transition ${
                    isCurrent
                      ? 'text-violet-600 dark:text-violet-400 font-bold'
                      : isPast
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer'
                      : 'text-zinc-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-violet-600 text-white'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {isPast ? '✓' : stepNum}
                  </span>
                  <span className="hidden sm:inline">Soal {stepNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Container */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* ── SOAL 1: ANGGARAN (BUDGET) ── */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e0e15]/90 border border-slate-200 dark:border-white/10 shadow-sm space-y-6"
              >
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 uppercase">
                    Pertanyaan #1
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white">
                    Berapa rentang anggaran (budget) yang Anda siapkan?
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Pilih salah satu rekomendasi cepat di bawah atau tentukan rentang angka sendiri secara bebas.
                  </p>
                </div>

                {/* Preset Anggaran Cepat */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Pilihan Anggaran Populer:
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
                          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-600 ring-2 ring-violet-500/30'
                              : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-slate-300 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isSelected ? 'text-violet-700 dark:text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
                              {preset.label}
                            </span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px]">
                                ✓
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-500 mt-1">{preset.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Anggaran Manual */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>Atur Rentang Anggaran Sendiri:</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-violet-600 dark:text-cyan-400">
                      {formatRupiahShort(budgetMin)} – {formatRupiahShort(budgetMax)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-500 font-medium">Anggaran Minimal (Dari)</label>
                      <input
                        type="number"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(Number(e.target.value))}
                        step="500000"
                        min="0"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-500 font-medium">Anggaran Maksimal (Sampai)</label>
                      <input
                        type="number"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(Number(e.target.value))}
                        step="500000"
                        min="0"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {budgetError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                      <span>⚠️ {budgetError}</span>
                    </div>
                  )}
                </div>

                {/* Step Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <span>Lanjut ke Soal 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── SOAL 2: KEBUTUHAN PENGGUNAAN UTAMA ── */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e0e15]/90 border border-slate-200 dark:border-white/10 shadow-sm space-y-6"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 uppercase">
                      Pertanyaan #2
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40">
                      Pilihan: {selectedPeruntukan.length} dari 2
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white">
                    Untuk apa saja laptop ini akan Anda gunakan?
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Pilih 1 atau 2 kebutuhan yang paling sering Anda lakukan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PERUNTUKAN_OPTIONS.map((opt) => {
                    const isSelected = selectedPeruntukan.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleTogglePeruntukan(opt.value)}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-600 ring-2 ring-violet-500/30'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-slate-300 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <span className="text-2xl shrink-0 mt-0.5">{opt.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-violet-700 dark:text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
                              {opt.title}
                            </span>
                            <div
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                                isSelected
                                  ? 'border-violet-600 bg-violet-600 text-white'
                                  : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Step Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Soal 1</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <span>Lanjut ke Soal 3</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── SOAL 3: KONDISI LAPTOP ── */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e0e15]/90 border border-slate-200 dark:border-white/10 shadow-sm space-y-6"
              >
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 uppercase">
                    Pertanyaan #3
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white">
                    Kondisi laptop seperti apa yang Anda inginkan?
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Tentukan apakah Anda ingin unit baru bergaransi resmi, bekas (second) hemat, atau komparasi keduanya.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      value: 'keduanya',
                      label: '✨ Bebas (Baru & Second)',
                      sub: 'Tampilkan alternatif baru maupun second terbaik yang masuk anggaran.',
                    },
                    {
                      value: 'baru',
                      label: '📦 Hanya Baru',
                      sub: 'Kondisi segel dengan garansi resmi distributor resmi.',
                    },
                    {
                      value: 'second',
                      label: '🔄 Hanya Bekas / Second',
                      sub: 'Spesifikasi lebih tinggi dengan harga yang jauh lebih hemat.',
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
                            ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-600 ring-2 ring-violet-500/30'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-slate-300 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <div className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-violet-700 dark:text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-2 leading-relaxed">{opt.sub}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Step Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Soal 2</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <span>Lanjut ke Soal 4</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── SOAL 4: PREFERENSI MEREK ── */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e0e15]/90 border border-slate-200 dark:border-white/10 shadow-sm space-y-6"
              >
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 uppercase">
                    Pertanyaan #4
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white">
                    Apakah Anda memiliki preferensi merek laptop tertentu?
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Pilih merek yang Anda sukai, atau pilih <strong>Semua Merek</strong> agar analisis memberikan rekomendasi paling objektif.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleBrand('semua')}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      selectedBrands.includes('semua')
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-slate-300'
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
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-slate-300'
                        }`}
                      >
                        {brand}
                      </button>
                    );
                  })}
                </div>

                {/* Step Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Soal 3</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <span>Lanjut ke Soal 5</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── SOAL 5: FREKUENSI PEMAKAIAN ── */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e0e15]/90 border border-slate-200 dark:border-white/10 shadow-sm space-y-6"
              >
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 uppercase">
                    Pertanyaan Terakhir (#5)
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white">
                    Seberapa sering Anda membawa laptop untuk kuliah / luar rumah?
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Membantu algoritma menilai seberapa penting daya tahan baterai dan bobot portabilitas untuk keseharian Anda.
                  </p>
                </div>

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
                            ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-600 ring-2 ring-violet-500/30'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-slate-300 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <span className="text-2xl shrink-0 mt-0.5">{f.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-violet-700 dark:text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
                              {f.title}
                            </span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px]">
                                ✓
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{f.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Step Action Buttons (Submit Final) */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Soal 4</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menganalisis Hasil Rekomendasi Presisi...</span>
                      </>
                    ) : (
                      <>
                        <span>Dapatkan Rekomendasi Laptop Sekarang</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-[#09090d] text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span>Memuat kuesioner presisi...</span>
          </div>
        </div>
      }
    >
      <QuestionnaireContent />
    </Suspense>
  );
}
