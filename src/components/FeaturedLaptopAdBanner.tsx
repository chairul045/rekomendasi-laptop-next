'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Flame,
  CheckCircle2,
  Tag,
  ChevronLeft,
  ChevronRight,
  Settings,
  Wrench,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { formatRupiah } from '@/lib/laptop-utils';
import { BannerAd } from '@/lib/banner-store';

export default function FeaturedLaptopAdBanner({
  initialBanners,
  userEmail,
}: {
  initialBanners?: BannerAd[];
  userEmail?: string | null;
}) {
  const [banners, setBanners] = useState<BannerAd[]>(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active banners if not passed initially
  useEffect(() => {
    if (!initialBanners || initialBanners.length === 0) {
      fetch('/api/banners')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.banners) && data.banners.length > 0) {
            setBanners(data.banners);
          }
        })
        .catch(() => {});
    }
  }, [initialBanners]);

  // Auto-play timer
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setDirection('next');
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, isPaused]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];
  const isSuperAdmin = userEmail?.toLowerCase() === 'chairulanwarr003@gmail.com';

  const handlePrev = () => {
    setDirection('prev');
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setDirection('next');
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const isServisBanner = currentBanner.brand.toLowerCase().includes('care') || currentBanner.brand.toLowerCase().includes('servis');
  const waContactUrl = `https://wa.me/6287851164239?text=${encodeURIComponent(
    isServisBanner
      ? `Halo Lapmatch Care, saya ingin konsultasi mengenai servis/perbaikan laptop.`
      : `Halo, saya tertarik dengan unit laptop ${currentBanner.title} (${formatRupiah(currentBanner.price)}). Apakah masih tersedia?`
  )}`;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#120f24] via-[#0c0d18] to-[#0a1120] border-2 border-violet-500/30 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(124,58,237,0.18)] transition-all hover:border-cyan-500/40"
    >
      {/* Background Neon Blurs */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Badge Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wide shadow-sm animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>REKOMENDASI RESMI LAPTOPSEBER PALEMBANG</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span>{currentBanner.badge || 'Pilihan Editor 2026'}</span>
          </span>
          {isSuperAdmin && (
            <Link
              href="/admin?tab=banners"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition"
              title="Kelola banner iklan di panel admin"
            >
              <Settings className="w-3 h-3" />
              <span>Kelola Iklan (Admin)</span>
            </Link>
          )}
        </div>

        {/* Carousel Slide Indicators & Navigation Controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400">
            Slide <strong className="text-white">{currentIndex + 1}</strong> / {banners.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              aria-label="Slide sebelumnya"
              className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Slide berikutnya"
              className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Animated Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0, x: direction === 'next' ? 24 : -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === 'next' ? -24 : 24 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="relative z-10 grid lg:grid-cols-12 gap-6 pt-6 items-center"
        >
          {/* Left Col: Specs & Direct Order */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] uppercase font-bold border border-cyan-500/30">
                  {currentBanner.brand}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {isServisBanner
                    ? 'Layanan Servis & Reparasi Resmi'
                    : 'Unit Pilihan Resmi Toko LaptopSeber Palembang'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {currentBanner.title}
              </h2>

              <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                {currentBanner.subtitle}
              </p>
            </div>

            {/* Key Specs Matrix */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Processor</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5 line-clamp-1" title={currentBanner.processor}>
                  {currentBanner.processor}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>GPU / Layanan</span>
                </div>
                <div className="text-xs font-bold text-amber-300 mt-0.5 line-clamp-1" title={currentBanner.vga}>
                  {currentBanner.vga}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <span>RAM</span>
                </div>
                <div className="text-xs font-bold text-emerald-300 mt-0.5">
                  {currentBanner.ramGb}GB RAM
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <span>Storage</span>
                </div>
                <div className="text-xs font-bold text-violet-300 mt-0.5">
                  {currentBanner.storageGb}GB SSD
                </div>
              </div>
            </div>

            {/* Compact Professional Price & Contact CTA */}
            <div className="pt-2 space-y-3">
              <div className="p-3 rounded-2xl bg-zinc-950/70 border border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-zinc-400 font-mono uppercase">Harga Penawaran</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                      {formatRupiah(currentBanner.price)}
                    </span>
                    {currentBanner.originalPrice > currentBanner.price && (
                      <span className="text-xs text-zinc-500 line-through font-mono">
                        {formatRupiah(currentBanner.originalPrice)}
                      </span>
                    )}
                    {currentBanner.discount && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {currentBanner.discount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Garansi Resmi QC</span>
                </div>
              </div>

              {/* WhatsApp Action Button */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <a
                  href={waContactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                  <span>Hubungi Penjual (WhatsApp 087851164239)</span>
                </a>

                {isServisBanner && (
                  <Link
                    href="/service-laptop"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Info Servis</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Expanded High-Impact Animated Laptop Showcase */}
          <div className="lg:col-span-7">
            <div className="relative group rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-white/10 via-zinc-950/70 to-black/80 p-4 sm:p-6 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-4 right-4 z-20">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 text-white shadow-lg shadow-rose-500/40 uppercase">
                  {currentBanner.badge}
                </span>
              </div>

              {/* Large Extended Visual Area with Dynamic Floating Motion */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-black/50 flex items-center justify-center p-4">
                <motion.img
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title}
                  className="w-full h-full object-contain cursor-pointer drop-shadow-[0_20px_35px_rgba(124,58,237,0.35)]"
                  loading="lazy"
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 0.8, 0, -0.8, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  whileHover={{ scale: 1.05 }}
                />

                {/* Subtle Ambient Floor Glow */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-cyan-500/20 blur-xl rounded-full pointer-events-none" />

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-zinc-300 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10">
                    {currentBanner.display}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-cyan-300 font-bold">
                    Slide {currentIndex + 1} dari {banners.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Slide Navigation Dots */}
      <div className="relative z-10 flex items-center justify-center gap-2 pt-6">
        {banners.map((b, idx) => (
          <button
            key={b.id}
            onClick={() => {
              setDirection(idx > currentIndex ? 'next' : 'prev');
              setCurrentIndex(idx);
            }}
            aria-label={`Ke slide ${idx + 1}`}
            className={`transition-all rounded-full cursor-pointer ${
              idx === currentIndex
                ? 'w-8 h-2.5 bg-gradient-to-r from-cyan-400 to-violet-500 shadow-md shadow-cyan-400/40'
                : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
