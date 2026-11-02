'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import LaptopCatalog, { LaptopCatalogItem } from '@/app/LaptopCatalog';
import PerspectiveTunnelHero from '@/components/ui/perspective-tunnel-hero';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function LandingPage({ previewLaptops = [] }: { previewLaptops?: LaptopCatalogItem[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqItems = [
    {
      q: 'Apakah sistem rekomendasi ini gratis?',
      a: 'Ya, 100% gratis untuk seluruh mahasiswa. Anda dapat melakukan konsultasi sebanyak yang Anda butuhkan dan menyimpan riwayat rekomendasi.',
    },
    {
      q: 'Bagaimana laptop second (bekas) dinilai dalam sistem ini?',
      a: 'Sistem memisahkan evaluasi laptop baru dan laptop second dalam tab terpisah. Alternatif laptop second dinilai berdasarkan spesifikasi riil dan harga pasar second yang wajar sehingga mahasiswa berbudget terbatas tetap mendapatkan performa maksimal.',
    },
    {
      q: 'Apakah saya bisa mencetak atau mengunduh hasil rekomendasi ke PDF?',
      a: 'Bisa. Pada halaman rekomendasi terdapat tombol "Cetak / PDF" dengan format dokumen yang sudah dioptimalkan untuk laporan resmi.',
    },
    {
      q: 'Bagaimana kecerdasan Gemini AI membantu dalam hasil keputusan?',
      a: 'Gemini AI menganalisis hasil perhitungan ranking matematis TOPSIS dan memberikan analisis naratif humanis tentang keunggulan, potensi kompromi, dan kesesuaian laptop tersebut dengan jurusan kuliah Anda.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100 overflow-x-hidden">
      <Navbar user={null} />

      <main className="flex-grow space-y-28 pb-20">
        {/* HERO SECTION */}
        <section className="relative pt-12 sm:pt-24 pb-12 overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
          {/* Ambient decorative glow with fluid breathing animation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-violet-600/25 via-cyan-500/20 to-indigo-600/10 blur-[130px] pointer-events-none -z-10 animate-pulse-glow" />

          <motion.div
            className="max-w-3xl mx-auto space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Top Badge */}
            <motion.div variants={itemVariants} className="inline-block">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-semibold bg-gradient-to-r from-violet-950/70 via-indigo-950/60 to-cyan-950/70 border border-violet-500/30 text-cyan-300 shadow-lg shadow-violet-500/15 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Sistem Pendukung Keputusan Berbasis TOPSIS, ROC & Gemini AI</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]"
            >
              Temukan Laptop Kuliah Terbaik Sesuai{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 animate-gradient-shift">
                Kebutuhan & Anggaranmu
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed"
            >
              Bukan sekadar tebak-tebakan. Lapmatch menggunakan metode matematis ilmiah{' '}
              <strong className="text-zinc-200">ROC</strong> & <strong className="text-zinc-200">TOPSIS</strong>{' '}
              yang dipadukan dengan analisis cerdas <strong className="text-cyan-300">AI</strong> untuk menghasilkan rekomendasi laptop yang paling presisi untuk perkuliahanmu.
            </motion.p>

            {/* Call to Actions */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/questionnaire"
                  className="shimmer-button w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-sm transition shadow-xl shadow-violet-600/30"
                >
                  <span>Mulai Konsultasi Gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-bold text-sm transition shadow-sm"
                >
                  <span>Masuk ke Akun</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Quick Metrics Bar */}
            <motion.div
              variants={itemVariants}
              className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-center"
            >
              {[
                { val: '100+', label: 'Database Laptop', color: 'text-cyan-300' },
                { val: '6 Kriteria', label: 'Pembobotan ROC', color: 'text-violet-300' },
                { val: 'Baru & 2nd', label: 'Pilihan Fleksibel', color: 'text-emerald-300' },
                { val: '100%', label: 'Transparan & Objektif', color: 'text-amber-300' },
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 backdrop-blur-sm card-interactive"
                >
                  <div className={`text-xl font-black ${metric.color} font-mono`}>{metric.val}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">{metric.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* 3 LANGKAH MUDAH */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2 max-w-xl mx-auto"
          >
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Alur Rekomendasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              3 Langkah Menemukan Laptop Tepat
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Proses cepat, interaktif, dan langsung memberikan ranking alternatif terbaik.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Tentukan Kebutuhan & Budget',
                desc: 'Pilih bidang studi/kebutuhan utama Anda (Coding, Desain, Gaming, atau Kuliah harian) serta rentang anggaran yang realistis.',
                color: 'violet',
                glow: 'from-violet-600/20 text-violet-300 border-violet-500/30',
              },
              {
                step: '02',
                title: 'Urutkan Prioritas Kriteria (Drag & Drop)',
                desc: 'Urutkan kriteria seperti Harga, Kecepatan Prosesor, RAM, SSD, Daya Baterai, atau Bobot Ringan secara interaktif.',
                color: 'indigo',
                glow: 'from-indigo-600/20 text-indigo-300 border-indigo-500/30',
              },
              {
                step: '03',
                title: 'Dapatkan Rekomendasi & Analisis AI',
                desc: 'Algoritma TOPSIS menghitung nilai preferensi Vi dan Gemini AI menyusun narasi mengapa laptop tersebut paling pas untuk Anda.',
                color: 'cyan',
                glow: 'from-cyan-600/20 text-cyan-300 border-cyan-500/30',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                className="group p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 space-y-4 hover:border-violet-500/40 transition duration-300 shadow-lg relative overflow-hidden"
              >
                {/* Subtle top light bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.glow} border flex items-center justify-center font-black text-lg font-mono shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* METODE ILMIAH SPK */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl bg-gradient-to-br from-violet-950/40 via-zinc-950 to-cyan-950/30 border border-white/10 p-8 sm:p-12 overflow-hidden shadow-2xl"
          >
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-2xl space-y-4 relative z-10">
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
                <div className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs font-mono text-zinc-200 hover:border-violet-500/40 transition">
                  ✓ Tanpa Bias Subjektif
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs font-mono text-zinc-200 hover:border-cyan-500/40 transition">
                  ✓ Transparansi Langkah Matriks
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs font-mono text-zinc-200 hover:border-indigo-500/40 transition">
                  ✓ Kompatibel Skripsi / Tugas Akhir
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 3D PERSPECTIVE TUNNEL SHOWCASE */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2 max-w-xl mx-auto"
          >
            <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
              3D Spatial Exploration
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Jelajahi Universe Laptop Lapmatch
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Gunakan trackpad atau scroll mouse pada area 3D interaktif di bawah untuk terbang melintasi dimensi laptop perkuliahan.
            </p>
          </motion.div>

          <PerspectiveTunnelHero />
        </section>

        {/* PREVIEW KATALOG */}
        {previewLaptops.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <LaptopCatalog laptops={previewLaptops} />
          </section>
        )}

        {/* FAQ SECTION WITH ACCORDION ANIMATION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2"
          >
            <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Pertanyaan yang Sering Diajukan
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  className={`rounded-2xl border transition-colors duration-200 overflow-hidden ${
                    isOpen ? 'bg-[#12121b] border-violet-500/40' : 'bg-[#0e0e15]/80 border-white/10 hover:border-white/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm font-bold text-white flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{item.q}</span>
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                      >
                        <div className="px-5 pb-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-violet-900/30 via-indigo-900/20 to-cyan-900/30 border border-white/15 space-y-6 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                Siap Memilih Laptop Terbaik untuk Perkuliahanmu?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
                Hanya butuh 2 menit untuk mengisi preferensi kriteria dan mendapatkan rekomendasi akurat berbasis data ilmiah.
              </p>
              <div className="pt-2">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
                  <Link
                    href="/questionnaire"
                    className="shimmer-button inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-sm transition shadow-xl shadow-violet-600/30"
                  >
                    <span>Mulai Sekarang - Gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
