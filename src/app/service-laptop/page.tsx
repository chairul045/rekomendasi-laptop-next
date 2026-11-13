'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
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
  ExternalLink,
  PhoneCall,
  Cpu,
  Send,
  Building2,
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

  // Diagnosis state
  const [activeProblem, setActiveProblem] = useState<ServiceProblem>(POPULAR_PROBLEMS[0]);
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
    setActiveProblem(problem);
    setIsCustomDiagnosis(false);
    setCustomInput(problem.symptom);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const shop = LAPTOPSEBER_SHOP;

  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/40 via-zinc-900/90 to-cyan-950/30 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Wrench className="w-3.5 h-3.5" />
                <span>Pusat Servis Laptop Terpercaya</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                <span>LaptopSeber Palembang — Bergaransi Resmi Toko</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Pusat Servis, Perbaikan &amp; Upgrade Laptop — LaptopSeber Palembang
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
              Pilih gejala umum atau tulis kendala laptop Anda di bawah ini untuk mendapatkan diagnosa penyebab dan solusi penanganan langsung dari teknisi berpengalaman LaptopSeber Palembang.
            </p>
          </div>
        </div>

        {/* Diagnostic Tool Card */}
        <div className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Diagnosa Kerusakan &amp; Solusi Perbaikan</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pilih salah satu gejala umum yang sering terjadi di bawah, atau isi masalah spesifik laptop Anda sendiri.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-xl w-fit">
              LaptopSeber Care
            </span>
          </div>

          {/* Preset Buttons DI ATAS Isi Masalah Sendiri */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-zinc-400">Atau pilih gejala umum yang sering terjadi:</span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_PROBLEMS.map((problem) => {
                const isSelected = !isCustomDiagnosis && activeProblem.id === problem.id;
                return (
                  <button
                    key={problem.id}
                    type="button"
                    onClick={() => handleSelectPreset(problem)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold shadow-md shadow-violet-600/25 border border-cyan-400/50'
                        : 'bg-zinc-900/80 text-zinc-300 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {problem.symptom.split('/')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Isi Sendiri Masalah Laptop */}
          <form onSubmit={handleCustomDiagnosis} className="p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-white/10 space-y-3.5">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Isi Masalah Laptop Anda Sendiri:</span>
            </span>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400">Deskripsi Keluhan / Gejala Kerusakan *</label>
              <input
                ref={inputRef}
                id="masalah-laptop-input"
                type="text"
                required
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Contoh: Laptop mati total pas dicolok casan, engsel patah, atau layar flicker"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <input
                type="text"
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                placeholder="Merek & Tipe Laptop (Opsional, contoh: Lenovo ThinkPad T480, HP Elitebook)"
                className="w-full sm:w-2/3 px-3.5 py-2 rounded-xl bg-zinc-900/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
              />

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs transition shadow-lg shadow-violet-600/25 active:scale-95 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Analisis &amp; Hubungi Toko</span>
              </button>
            </div>
          </form>

          {/* Diagnostic Result Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-zinc-950/95 to-zinc-900/90 border border-violet-500/30 space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-violet-400 font-bold tracking-wider">
                  Hasil Diagnosa: {activeProblem.category}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                  &ldquo;{activeProblem.symptom}&rdquo;
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    activeProblem.urgency === 'Kritis'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : activeProblem.urgency === 'Sedang'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  Tingkat Urgensi: {activeProblem.urgency}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="font-semibold text-zinc-200 flex items-center gap-1.5 text-[11px] uppercase font-mono text-zinc-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kemungkinan Penyebab:</span>
                </div>
                <ul className="space-y-1 text-zinc-300 list-disc list-inside">
                  {activeProblem.possibleCauses.map((cause, i) => (
                    <li key={i}>{cause}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="font-semibold text-zinc-200 flex items-center gap-1.5 text-[11px] uppercase font-mono text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tindakan Solusi Teknisi:</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  {activeProblem.recommendedSolution}
                </p>
              </div>
            </div>

            {/* Solusi Servis Langsung di LaptopSeber Palembang */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Konsultasikan Masalah Ini ke Toko Resmi:</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-950/90 via-[#10101b] to-zinc-950/90 border border-white/15 hover:border-cyan-500/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {shop.city}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400 font-mono text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{shop.rating}</span>
                      <span className="text-zinc-400 text-[10px]">({shop.reviewCount} ulasan)</span>
                    </div>
                  </div>
                  <h4 className="font-black text-sm sm:text-base text-white">
                    {shop.name}
                  </h4>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>{shop.address} ({shop.openHours})</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                  <a
                    href={`https://wa.me/${shop.whatsapp}?text=Halo%20${encodeURIComponent(
                      shop.name
                    )},%20laptop%20saya%20mengalami%20masalah:%20"${encodeURIComponent(
                      activeProblem.symptom
                    )}".%20Apakah%20bisa%20dibantu%20servis?`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/25 active:scale-95 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat WhatsApp Toko</span>
                  </a>


                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Section - Focused on Single Official Store */}
        <div id="direktori-semua" className="space-y-6 pt-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-violet-400" />
              <span>Pusat Servis Resmi LaptopSeber Palembang</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Kunjungi workshop fisik kami di Palembang atau hubungi teknisi untuk konsultasi dan booking servis.
            </p>
          </div>

          {/* Single Shop Feature Card */}
          <div className="rounded-3xl bg-[#0e0e15]/80 border border-white/15 overflow-hidden shadow-2xl grid md:grid-cols-12 gap-0">
            {/* Left: Image Banner */}
            <div className="relative md:col-span-5 aspect-[16/10] md:aspect-auto w-full overflow-hidden bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shop.imageUrl}
                alt={shop.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                  📍 {shop.city}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{shop.rating}</span>
                  <span className="text-zinc-400 font-normal text-[11px]">({shop.reviewCount} ulasan Google)</span>
                </div>
              </div>
            </div>

            {/* Right: Detailed Info */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono uppercase text-violet-400 font-bold tracking-wider">
                    Official Workshop &amp; Care Hub
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {shop.name}
                  </h3>
                  <p className="text-xs text-zinc-300 flex items-start gap-1.5 mt-2">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{shop.address}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{shop.openHours}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{shop.phone}</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                    Layanan Servis &amp; Keunggulan:
                  </span>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {shop.specialties.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2 text-zinc-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                <a
                  href={`https://wa.me/${shop.whatsapp}?text=Halo%20LaptopSeber%20Palembang,%20saya%20ingin%20konsultasi%20servis%20laptop.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/25 active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Hubungi via WhatsApp</span>
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
