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
import LaptopCatalog, { LaptopCatalogItem } from '@/components/catalog/LaptopCatalog';
import FeaturedLaptopAdBanner from '@/components/FeaturedLaptopAdBanner';
import { BannerAd } from '@/lib/banner-store';
import dynamic from 'next/dynamic';

const PerspectiveTunnelHero = dynamic(
  () => import('@/components/ui/perspective-tunnel-hero'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Memuat 3D Visualizer...</span>
        </div>
      </div>
    ),
  }
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function LandingPage({
  previewLaptops = [],
  initialBanners = [],
}: {
  previewLaptops?: LaptopCatalogItem[];
  initialBanners?: BannerAd[];
}) {
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0a0f1d] text-slate-900 dark:text-slate-100 overflow-x-hidden transition-colors">
      <Navbar user={null} />

      <main className="flex-grow space-y-20 sm:space-y-28 pb-20">
        {/* HERO SECTION */}
        <section className="relative pt-12 sm:pt-20 pb-12 overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
          {/* Subtle Ambient Decorative Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[340px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none -z-10 animate-pulse-glow" />

          <motion.div
            className="max-w-3xl mx-auto space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Top Badge */}
            <motion.div variants={itemVariants} className="inline-block">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-xs backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Sistem Rekomendasi Cerdas Berbasis TOPSIS, ROC &amp; Gemini AI</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.18]"
            >
              Temukan Laptop Kuliah Terbaik Sesuai{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                Kebutuhan &amp; Anggaran
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Bukan sekadar tebak-tebakan. Lapmatch menggunakan metode ilmiah multi-kriteria{' '}
              <strong className="text-slate-900 dark:text-slate-200 font-bold">ROC</strong> &amp;{' '}
              <strong className="text-slate-900 dark:text-slate-200 font-bold">TOPSIS</strong>{' '}
              yang dipadukan dengan kecerdasan <strong className="text-blue-600 dark:text-blue-400 font-bold">AI</strong> untuk menghasilkan rekomendasi paling tepat untuk kuliah Anda.
            </motion.p>

            {/* Call to Actions - Clear, Consistent Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4"
            >
              <div className="w-full sm:w-auto">
                <Link
                  href="/questionnaire"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition shadow-sm hover:shadow-md cursor-pointer min-h-[46px]"
                >
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Mulai Konsultasi Gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="w-full sm:w-auto">
                <a
                  href="#katalog"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-sm transition shadow-xs cursor-pointer min-h-[46px]"
                >
                  <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Lihat Katalog Laptop</span>
                </a>
              </div>
            </motion.div>

            {/* Quick Metrics Bar */}
            <motion.div
              variants={itemVariants}
              className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-center"
            >
              {[
                { val: '100+', label: 'Database Laptop', color: 'text-blue-600 dark:text-blue-400' },
                { val: '6 Kriteria', label: 'Pembobotan ROC', color: 'text-indigo-600 dark:text-indigo-400' },
                { val: 'Baru & 2nd', label: 'Pilihan Fleksibel', color: 'text-emerald-600 dark:text-emerald-400' },
                { val: '100%', label: 'Objektif & Ilmiah', color: 'text-amber-600 dark:text-amber-400' },
              ].map((metric, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
                >
                  <div className={`text-xl font-black ${metric.color} font-mono`}>{metric.val}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{metric.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* 3 LANGKAH MUDAH */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-2 max-w-xl mx-auto"
          >
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Alur Rekomendasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              3 Langkah Mudah Menemukan Laptop Tepat
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Proses interaktif dan transparan untuk ranking alternatif terbaik.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Tentukan Kebutuhan & Budget',
                desc: 'Pilih peruntukan utama Anda (Kuliah, Koding, Desain, Gaming) serta tentukan rentang anggaran yang realistis.',
                badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
              },
              {
                step: '02',
                title: 'Urutkan Prioritas Kriteria',
                desc: 'Urutkan kriteria seperti Harga, Prosesor, RAM, SSD, Baterai, dan Portabilitas dengan mudah sesuai preferensi pribadi.',
                badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
              },
              {
                step: '03',
                title: 'Hasil Rekomendasi & Analisis AI',
                desc: 'Sistem menghitung nilai preferensi TOPSIS secara presisi dan AI menyajikan analisis humanis mengenai kesesuaian unit.',
                badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={cardVariants}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-200 shadow-xs hover:shadow-md"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-black text-lg font-mono shadow-xs ${item.badge}`}>
                  {item.step}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* METODE ILMIAH SPK */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1e293b] text-white p-8 sm:p-12 shadow-lg relative overflow-hidden"
          >
            <div className="max-w-2xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Metodologi Ilmiah &amp; Teruji</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Mengapa Memadukan ROC + TOPSIS?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong>Rank Order Centroid (ROC)</strong> mengubah urutan prioritas subjektif menjadi bobot numerik yang adil dan konsisten.
                Selanjutnya, <strong>TOPSIS</strong> mengukur jarak setiap alternatif laptop terhadap solusi ideal positif (kinerja terbaik) dan solusi ideal negatif (kinerja terendah).
              </p>

              <div className="pt-2 flex flex-wrap gap-2.5">
                <div className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-medium text-slate-200">
                  ✓ Tanpa Bias Subjektif
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-medium text-slate-200">
                  ✓ Transparansi Langkah Matriks
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-medium text-slate-200">
                  ✓ Sesuai Kaidah Akademik &amp; Skripsi
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 3D PERSPECTIVE TUNNEL SHOWCASE */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-2 max-w-xl mx-auto"
          >
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Eksplorasi Interaktif
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Visualisasi Laptop 3D Lapmatch
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Gunakan trackpad atau scroll mouse pada area 3D interaktif di bawah untuk menjelajah model visual.
            </p>
          </motion.div>

          <PerspectiveTunnelHero />
        </section>

        {/* BANNER IKLAN PROMO PILIHAN */}
        {initialBanners && initialBanners.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="space-y-1"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Rekomendasi Terpilih
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Rekomendasi Laptop Pilihan Editor
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Laptop pilihan terbaik dengan harga promo spesial dan spesifikasi siap pakai untuk mahasiswa.
              </p>
            </motion.div>

            <FeaturedLaptopAdBanner initialBanners={initialBanners} userEmail={null} />
          </section>
        )}

        {/* PREVIEW KATALOG */}
        {previewLaptops.length > 0 && (
          <section id="katalog" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <LaptopCatalog laptops={previewLaptops} />
          </section>
        )}

        {/* FAQ SECTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-2"
          >
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Pertanyaan yang Sering Diajukan
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-colors duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-blue-50/50 dark:bg-slate-900 border-blue-300 dark:border-blue-700'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer min-h-[48px]"
                  >
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{item.q}</span>
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-800 pt-3">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white space-y-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                Siap Memilih Laptop Terbaik untuk Perkuliahan Anda?
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
                Hanya butuh 2 menit untuk mengisi preferensi kriteria dan mendapatkan rekomendasi akurat berbasis data ilmiah.
              </p>
              <div className="pt-2">
                <Link
                  href="/questionnaire"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm transition shadow-sm cursor-pointer min-h-[46px]"
                >
                  <span>Mulai Sekarang - Gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
