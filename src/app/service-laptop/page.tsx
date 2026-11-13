'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Wrench,
  Sparkles,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  PhoneCall,
  Cpu,
  Send,
  Building2,
  X,
  HelpCircle,
} from 'lucide-react';
import {
  SERVICE_SHOPS,
  LAPTOPSEBER_SHOP,
  POPULAR_PROBLEMS,
  ServiceProblem,
  diagnoseCustomProblem,
} from '@/data/service-shops';

export default function ServiceLaptopPage() {
  // Custom input state
  const [customInput, setCustomInput] = useState<string>('');
  const [customBrand, setCustomBrand] = useState<string>('');

  // Diagnosis state - Default null agar pengguna bisa memilih & membatalkan pilihan
  const [activeProblem, setActiveProblem] = useState<ServiceProblem | null>(null);
  const [isCustomDiagnosis, setIsCustomDiagnosis] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleCustomDiagnosis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const result = diagnoseCustomProblem(customInput.trim(), customBrand.trim());
    setActiveProblem(result);
    setIsCustomDiagnosis(true);
  };

  const handleSelectPreset = (problem: ServiceProblem) => {
    if (activeProblem?.id === problem.id && !isCustomDiagnosis) {
      // Toggle off: Pengguna membatalkan pilihan (batal klik)
      setActiveProblem(null);
      setCustomInput('');
    } else {
      setActiveProblem(problem);
      setIsCustomDiagnosis(false);
      setCustomInput(problem.symptom);
    }
  };

  const shop = LAPTOPSEBER_SHOP;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090d] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Clean Hero Banner */}
        <div className="rounded-3xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 p-6 sm:p-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
              <Wrench className="w-3.5 h-3.5" />
              <span>Pusat Servis LaptopSeber Palembang</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" />
              <span>Garansi Pengerjaan &amp; Sparepart Asli</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Pusat Servis, Perbaikan &amp; Upgrade Laptop
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
            Pilih gejala kerusakan di bawah ini atau tulis keluhan laptop Anda untuk melihat kemungkinan penyebab, estimasi tindakan teknisi, dan konsultasi cepat via WhatsApp.
          </p>
        </div>

        {/* Diagnostic Tool Card - Bersih, rapi & mudah dilihat */}
        <div className="rounded-3xl bg-white dark:bg-[#0e0e15]/90 border border-slate-200 dark:border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Simulasi Diagnosa Kerusakan</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Klik gejala umum untuk melihat diagnosa, atau klik sekali lagi untuk membatalkan pilihan.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/40 px-3 py-1 rounded-xl w-fit">
              LaptopSeber Care
            </span>
          </div>

          {/* Preset Buttons: Bisa Klik dan Batal Klik */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Pilih Gejala Umum (Klik untuk pilih, klik lagi untuk batal):
              </span>
              {activeProblem && !isCustomDiagnosis && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveProblem(null);
                    setCustomInput('');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Batal Pilih</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {POPULAR_PROBLEMS.map((problem) => {
                const isSelected = !isCustomDiagnosis && activeProblem?.id === problem.id;
                return (
                  <button
                    key={problem.id}
                    type="button"
                    onClick={() => handleSelectPreset(problem)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left flex items-center gap-2 ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-sm ring-2 ring-violet-400/50'
                        : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <span>{problem.symptom.split('/')[0]}</span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Ketik Masalah Sendiri */}
          <form onSubmit={handleCustomDiagnosis} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-white/10 space-y-3">
            <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Atau Tulis Masalah Laptop Anda Sendiri:</span>
            </span>

            <div className="space-y-1">
              <input
                ref={inputRef}
                id="masalah-laptop-input"
                type="text"
                required
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Contoh: Laptop mati total pas dicolok casan, engsel patah, atau layar bergaris"
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
                <span>Analisis Masalah</span>
              </button>
            </div>
          </form>

          {/* Diagnostic Result Box - Muncul presisi jika ada problem dipilih */}
          <AnimatePresence mode="wait">
            {activeProblem ? (
              <motion.div
                key={activeProblem.id + (isCustomDiagnosis ? '-custom' : '-preset')}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-violet-500/40 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-violet-600 dark:text-violet-400 font-bold tracking-wider">
                      Hasil Analisis: {activeProblem.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                      &ldquo;{activeProblem.symptom}&rdquo;
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                        activeProblem.urgency === 'Kritis'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                          : activeProblem.urgency === 'Sedang'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      Urgensi: {activeProblem.urgency}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-2">
                    <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 text-[11px] uppercase font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Kemungkinan Penyebab:</span>
                    </div>
                    <ul className="space-y-1 text-zinc-600 dark:text-zinc-300 list-disc list-inside">
                      {activeProblem.possibleCauses.map((cause, i) => (
                        <li key={i}>{cause}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-2">
                    <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 text-[11px] uppercase font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Tindakan Solusi Teknisi:</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {activeProblem.recommendedSolution}
                    </p>
                  </div>
                </div>

                {/* Direct Consultation Button */}
                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                      Konsultasikan Masalah Ini ke Teknisi Resmi
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Tanyakan estimasi biaya dan booking pengerjaan cepat via WhatsApp.
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(
                      `Halo ${shop.name}, saya ingin konsultasi servis laptop dengan kendala: "${activeProblem.symptom}". Apakah bisa dibantu cek?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition active:scale-95 cursor-pointer shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat WhatsApp Toko (087851164239)</span>
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center space-y-2 bg-slate-50/60 dark:bg-zinc-950/40">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
                  <Wrench className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Pilih Gejala atau Tulis Masalah Laptop</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  Klik salah satu gejala umum di atas (bisa klik ulang untuk batal), atau isi keluhan Anda sendiri untuk melihat kemungkinan penyebab dan solusi perbaikan.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Directory Section - Clean, High Contrast, Easy to Read */}
        <div id="direktori-semua" className="space-y-4 pt-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <span>Workshop &amp; Lokasi Fisik LaptopSeber Palembang</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Kunjungi workshop kami di Palembang atau hubungi teknisi untuk konsultasi langsung.
            </p>
          </div>

          {/* Clean Shop Feature Card */}
          <div className="rounded-3xl bg-white dark:bg-[#0e0e15]/90 border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm grid md:grid-cols-12 gap-0">
            {/* Left: Image Banner */}
            <div className="relative md:col-span-5 aspect-[16/10] md:aspect-auto w-full overflow-hidden bg-slate-100 dark:bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shop.imageUrl}
                alt={shop.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
                  📍 {shop.city}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{shop.rating}</span>
                  <span className="text-zinc-300 font-normal text-[11px]">({shop.reviewCount} ulasan Google)</span>
                </div>
              </div>
            </div>

            {/* Right: Detailed Info */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono uppercase text-violet-600 dark:text-violet-400 font-bold tracking-wider">
                    Official Workshop &amp; Care Hub
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
                    {shop.name}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5 mt-2">
                    <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span>{shop.address}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-600 dark:text-zinc-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span>{shop.openHours}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{shop.phone}</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10">
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase font-semibold">
                    Layanan Servis &amp; Keunggulan:
                  </span>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {shop.specialties.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                <a
                  href={`https://wa.me/${shop.whatsapp}?text=Halo%20LaptopSeber%20Palembang,%20saya%20ingin%20konsultasi%20servis%20laptop.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Hubungi via WhatsApp (087851164239)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
