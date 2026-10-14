'use client';

import Link from 'next/link';
import {
  Laptop,
  ArrowRight,
  Sparkles,
  Cpu,
  ShieldCheck,
  Zap,
  BarChart3,
  Scale,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import LaptopCatalog, { LaptopCatalogItem } from '@/app/LaptopCatalog';

export default function LandingPage({ previewLaptops = [] }: { previewLaptops?: LaptopCatalogItem[] }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
      <Navbar user={null} />

      <main className="flex-grow space-y-24 pb-20">
        {/* HERO SECTION */}
        <section className="relative pt-12 sm:pt-20 pb-12 overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
          {/* Ambient decorative glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/20 via-cyan-500/15 to-transparent blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-semibold bg-gradient-to-r from-violet-950/60 to-cyan-950/60 border border-violet-500/30 text-cyan-300 shadow-lg shadow-violet-500/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Sistem Pendukung Keputusan Berbasis TOPSIS, ROC & Gemini AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Temukan Laptop Kuliah Terbaik Sesuai{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300">
                Kebutuhan & Anggaranmu
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Bukan sekadar tebak-tebakan. Lapmatch menggunakan metode matematis ilmiah{' '}
              <strong className="text-zinc-200">ROC</strong> & <strong className="text-zinc-200">TOPSIS</strong>{' '}
              yang dipadukan dengan analisis cerdas <strong className="text-cyan-300">AI</strong> untuk menghasilkan rekomendasi laptop yang paling presisi untuk perkuliahanmu.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/questionnaire"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-sm transition shadow-xl shadow-violet-600/30 active:scale-[0.98]"
              >
                <span>Mulai Konsultasi Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-bold text-sm transition"
              >
                <span>Masuk ke Akun</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-center">
              <div className="p-3 rounded-2xl bg-zinc-950/70 border border-white/5">
                <div className="text-xl font-black text-cyan-300 font-mono">100+</div>
                <div className="text-[11px] text-zinc-400">Database Laptop</div>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-950/70 border border-white/5">
                <div className="text-xl font-black text-violet-300 font-mono">6 Kriteria</div>
                <div className="text-[11px] text-zinc-400">Pembobotan ROC</div>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-950/70 border border-white/5">
                <div className="text-xl font-black text-emerald-300 font-mono">Baru & 2nd</div>
                <div className="text-[11px] text-zinc-400">Pilihan Fleksibel</div>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-950/70 border border-white/5">
                <div className="text-xl font-black text-amber-300 font-mono">100%</div>
                <div className="text-[11px] text-zinc-400">Transparan & Objektif</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 LANGKAH MUDAH */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Alur Rekomendasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              3 Langkah Menemukan Laptop Tepat
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Proses cepat, interaktif, dan langsung memberikan ranking alternatif terbaik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 space-y-4 hover:border-violet-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-300 border border-violet-500/30 flex items-center justify-center font-black text-lg font-mono">
                01
              </div>
              <h3 className="text-lg font-bold text-white">Tentukan Kebutuhan & Budget</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pilih bidang studi/kebutuhan utama Anda (Coding, Desain, Gaming, atau Kuliah harian) serta rentang anggaran yang realistis.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 space-y-4 hover:border-indigo-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-black text-lg font-mono">
                02
              </div>
              <h3 className="text-lg font-bold text-white">Urutkan Prioritas Kriteria (Drag & Drop)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Urutkan kriteria seperti Harga, Kecepatan Prosesor, RAM, SSD, Daya Baterai, atau Bobot Ringan secara interaktif.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 space-y-4 hover:border-cyan-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-black text-lg font-mono">
                03
              </div>
              <h3 className="text-lg font-bold text-white">Dapatkan Rekomendasi & Analisis AI</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Algoritma TOPSIS menghitung nilai preferensi $V_i$ dan Gemini AI menyusun narasi mengapa laptop tersebut paling pas untuk Anda.
              </p>
            </div>
          </div>
        </section>

        {/* METODE ILMIAH SPK */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-950/40 via-zinc-950 to-cyan-950/30 border border-white/10 p-8 sm:p-12 overflow-hidden shadow-2xl">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Metodologi Ilmiah & Teruji</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Mengapa Menggabungkan ROC + TOPSIS?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                <strong>Rank Order Centroid (ROC)</strong> mengubah urutan prioritas subjektif pengguna menjadi bobot matematis yang konsisten dan adil.
                Kemudian, <strong>TOPSIS</strong> mengukur seberapa dekat setiap alternatif laptop dengan solusi ideal positif (kinerja terbaik) dan seberapa jauh dari solusi ideal negatif (kinerja terburuk).
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs font-mono text-zinc-200">
                  ✓ Tanpa Bias Subjektif
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs font-mono text-zinc-200">
                  ✓ Transparansi Langkah Matriks
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs font-mono text-zinc-200">
                  ✓ Kompatibel Skripsi / Tugas Akhir
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PREVIEW KATALOG */}
        {previewLaptops.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <LaptopCatalog laptops={previewLaptops} />
          </section>
        )}

        {/* FAQ SECTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0e0e15]/80 border border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Apakah sistem rekomendasi ini gratis?</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ya, 100% gratis untuk seluruh mahasiswa. Anda dapat melakukan konsultasi sebanyak yang Anda butuhkan dan menyimpan riwayat rekomendasi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e0e15]/80 border border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Bagaimana laptop second (bekas) dinilai dalam sistem ini?</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sistem memisahkan evaluasi laptop baru dan laptop second dalam tab terpisah. Alternatif laptop second dinilai berdasarkan spesifikasi riil dan harga pasar second yang wajar sehingga mahasiswa berbudget terbatas tetap mendapatkan performa maksimal.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e0e15]/80 border border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Apakah saya bisa mencetak atau mengunduh hasil rekomendasi ke PDF?</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bisa. Pada halaman rekomendasi terdapat tombol <strong>"Cetak / PDF"</strong> dengan format dokumen yang sudah dioptimalkan untuk laporan resmi.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-violet-900/30 via-indigo-900/20 to-cyan-900/30 border border-white/15 space-y-6 backdrop-blur-xl">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Siap Memilih Laptop Terbaik untuk Perkuliahanmu?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
              Hanya butuh 2 menit untuk mengisi preferensi kriteria dan mendapatkan rekomendasi akurat berbasis data ilmiah.
            </p>
            <div className="pt-2">
              <Link
                href="/questionnaire"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-sm transition shadow-xl shadow-violet-600/30"
              >
                <span>Mulai Sekarang - Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
