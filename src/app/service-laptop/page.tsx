'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Wrench,
  Sparkles,
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Cpu,
  Send,
  X,
  Laptop,
  Check,
  Phone,
} from 'lucide-react';
import {
  LAPTOPSEBER_SHOP,
  POPULAR_PROBLEMS,
  ServiceProblem,
  diagnoseCustomProblem,
} from '@/data/service-shops';

export default function ServiceLaptopPage() {
  // Custom input state
  const [customInput, setCustomInput] = useState<string>('');
  const [customBrand, setCustomBrand] = useState<string>('');

  // Multi-select diagnosis state
  const [selectedProblems, setSelectedProblems] = useState<ServiceProblem[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleCustomDiagnosis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const result = diagnoseCustomProblem(customInput.trim(), customBrand.trim());
    setSelectedProblems((prev) => {
      const exists = prev.some((p) => p.symptom.toLowerCase() === result.symptom.toLowerCase());
      if (exists) return prev;
      return [result, ...prev];
    });
    setCustomInput('');
  };

  const handleTogglePreset = (problem: ServiceProblem) => {
    setSelectedProblems((prev) => {
      const exists = prev.some((p) => p.id === problem.id);
      if (exists) {
        return prev.filter((p) => p.id !== problem.id);
      } else {
        return [...prev, problem];
      }
    });
  };

  const handleRemoveProblem = (id: string) => {
    setSelectedProblems((prev) => prev.filter((p) => p.id !== id));
  };

  const handleResetAll = () => {
    setSelectedProblems([]);
    setCustomInput('');
  };

  const shop = LAPTOPSEBER_SHOP;

  // Aggregate Urgency: Kritis > Sedang > Ringan
  const overallUrgency = selectedProblems.some((p) => p.urgency === 'Kritis')
    ? 'Kritis'
    : selectedProblems.some((p) => p.urgency === 'Sedang')
    ? 'Sedang'
    : selectedProblems.length > 0
    ? 'Ringan'
    : null;

  // Deduplicate causes & combine solutions
  const allCauses = Array.from(
    new Set(selectedProblems.flatMap((p) => p.possibleCauses))
  );

  // Generate WhatsApp message with all selected symptoms
  const waSymptomsText = selectedProblems
    .map((p, idx) => `${idx + 1}. ${p.symptom}`)
    .join('\n');
  const waUrl = `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(
    `Halo ${shop.name}, saya ingin konsultasi servis laptop dengan keluhan:\n${waSymptomsText}\n\nApakah bisa dibantu cek estimasi perbaikan?`
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090d] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* ====== IKLAN SERVICE BANNER DI ATAS ====== */}
        <div id="iklan-laptopseber" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-violet-500/30">
          {/* Ambient decorative lighting */}
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-cyan-500/15 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[250px] bg-violet-600/20 blur-[80px] pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400 text-zinc-950 shadow-md">
                  ⭐ REKOMENDASI TERPERCAYA
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/10 text-cyan-300 border border-white/20 backdrop-blur-md">
                  Layanan Servis &amp; Penjualan
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  LaptopSeber: Servis Laptop Cepat &amp; Laptop Second Bergaransi
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
                  Solusi terpercaya untuk perbaikan laptop mati total, ganti LCD &amp; baterai, upgrade performa, hingga pilihan laptop second berkualitas tinggi siap pakai untuk kuliah dan kerja.
                </p>
              </div>

              {/* Kontak */}
              <div className="flex flex-wrap gap-3 text-xs text-zinc-200">
                <a
                  href={`https://wa.me/${shop.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/20 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>WhatsApp: {shop.phone}</span>
                </a>
              </div>

              {/* Key Benefits Grid */}
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                {[
                  'Gratis Pengecekan & Konsultasi Kerusakan Awal',
                  'Garansi Servis Toko & Sparepart Original',
                  'Koleksi Laptop Second Berkualitas (ThinkPad, Dell, HP)',
                  'Tracking Servis & Respon Cepat Teknisi Handal',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-200">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px]">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Promotional Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <a
                  href={`https://wa.me/${shop.whatsapp}?text=Halo%20LaptopSeber,%20saya%20tertarik%20dengan%20layanan%20servis%20dan%20katalog%20laptop%20second%20Anda.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Konsultasi WhatsApp Langsung ({shop.phone})</span>
                </a>

                <Link
                  href="/#katalog"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition backdrop-blur-md cursor-pointer"
                >
                  <Laptop className="w-4 h-4 text-cyan-300" />
                  <span>Lihat Etalase Laptop</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Feature Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-black/40 border border-white/15 p-5 backdrop-blur-md space-y-4">
                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-zinc-950 border border-white/10 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shop.imageUrl}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{shop.name}</h3>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-mono font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>5.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Mitra terverifikasi resmi Lapmatch untuk servis dan rekomendasi laptop terpercaya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Hero - Judul Halaman Servis */}
        <div className="rounded-3xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 p-6 sm:p-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
              <Wrench className="w-3.5 h-3.5" />
              <span>Simulasi Diagnosa Kerusakan</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" />
              <span>Garansi Pengerjaan &amp; Sparepart Asli</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Pusat Servis, Perbaikan &amp; Upgrade Laptop
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
            Pilih satu atau beberapa gejala kerusakan di bawah ini (bisa memilih lebih dari satu) atau ketik keluhan Anda untuk melihat analisis kemungkinan penyebab, estimasi tindakan teknisi, dan konsultasi cepat via WhatsApp.
          </p>
        </div>

        {/* Diagnostic Tool Card */}
        <div className="rounded-3xl bg-white dark:bg-[#0e0e15]/90 border border-slate-200 dark:border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Simulasi Diagnosa Kerusakan</span>
                {selectedProblems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-violet-600 text-white">
                    {selectedProblems.length} Gejala Dipilih
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Bisa memilih beberapa masalah sekaligus. Klik gejala untuk memilih atau membatalkan pilihan.
              </p>
            </div>
            {selectedProblems.length > 0 && (
              <button
                type="button"
                onClick={handleResetAll}
                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 font-semibold cursor-pointer w-fit"
              >
                <X className="w-3.5 h-3.5" />
                <span>Batal Semua Pilihan</span>
              </button>
            )}
          </div>

          {/* Preset Buttons: Multi-Select */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Pilih Gejala Kerusakan (Bisa pilih beberapa):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {POPULAR_PROBLEMS.map((problem) => {
                const isSelected = selectedProblems.some((p) => p.id === problem.id);
                return (
                  <button
                    key={problem.id}
                    type="button"
                    onClick={() => handleTogglePreset(problem)}
                    className={`p-3 rounded-2xl text-xs font-medium transition-all cursor-pointer text-left flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400/50'
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{problem.symptom.split('/')[0]}</div>
                      <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-violet-100' : 'text-zinc-500'}`}>
                        {problem.category}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                        isSelected
                          ? 'bg-white text-violet-700 font-bold'
                          : 'border border-slate-300 dark:border-white/20 text-transparent'
                      }`}
                    >
                      ✓
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Ketik Masalah Sendiri */}
          <form onSubmit={handleCustomDiagnosis} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-white/10 space-y-3">
            <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Atau Tambahkan Keluhan Masalah Lainnya:</span>
            </span>

            <div className="space-y-1">
              <input
                ref={inputRef}
                id="masalah-laptop-input"
                type="text"
                required
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Contoh: Laptop mati total pas dicolok casan, layar bergaris, atau engsel goyang"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500 font-sans"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <input
                type="text"
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                placeholder="Merek & Tipe Laptop (Opsional, contoh: Lenovo ThinkPad T480)"
                className="w-full sm:w-2/3 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500"
              />

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition active:scale-95 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Tambahkan Masalah</span>
              </button>
            </div>
          </form>

          {/* Diagnostic Result Box - Muncul jika ada 1 atau lebih problem dipilih */}
          <AnimatePresence mode="wait">
            {selectedProblems.length > 0 ? (
              <motion.div
                key={selectedProblems.map((p) => p.id).join('-')}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-violet-500/40 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-violet-600 dark:text-violet-400 font-bold tracking-wider">
                      Hasil Analisis Terpadu ({selectedProblems.length} Kendala)
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {selectedProblems.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-violet-100 dark:bg-violet-950/50 text-violet-800 dark:text-violet-200 border border-violet-300 dark:border-violet-800/60"
                        >
                          <span>{p.symptom}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProblem(p.id)}
                            className="hover:text-rose-600 cursor-pointer p-0.5"
                            title="Hapus gejala ini"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                        overallUrgency === 'Kritis'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                          : overallUrgency === 'Sedang'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      Tingkat Urgensi: {overallUrgency}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-2">
                    <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 text-[11px] uppercase font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Kemungkinan Penyebab Utama:</span>
                    </div>
                    <ul className="space-y-1 text-zinc-600 dark:text-zinc-300 list-disc list-inside">
                      {allCauses.map((cause, i) => (
                        <li key={i}>{cause}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-3">
                    <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 text-[11px] uppercase font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Rekomendasi Tindakan Teknisi:</span>
                    </div>
                    <div className="space-y-2 text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {selectedProblems.map((p, idx) => (
                        <div key={idx} className="pb-2 border-b border-slate-100 dark:border-white/5 last:border-none last:pb-0">
                          <strong className="text-zinc-900 dark:text-white block text-[11px]">{p.symptom}:</strong>
                          <span>{p.recommendedSolution}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Consultation Button */}
                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                      Konsultasikan {selectedProblems.length} Kendala Ini ke Teknisi Resmi
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Dapatkan estimasi biaya transparan dan booking pengerjaan cepat via WhatsApp.
                    </p>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition active:scale-95 cursor-pointer shrink-0 shadow-md shadow-emerald-600/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Konsultasi Semua Kendala via WhatsApp ({shop.phone})</span>
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center space-y-2 bg-slate-50/60 dark:bg-zinc-950/40">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
                  <Wrench className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Pilih Satu atau Beberapa Gejala di Atas</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  Anda bisa memilih beberapa masalah sekaligus untuk mendapatkan ringkasan diagnosa gabungan dan estimasi solusi lengkap.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
