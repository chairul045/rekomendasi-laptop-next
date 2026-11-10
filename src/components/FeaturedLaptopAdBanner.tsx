'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  ShoppingBag,
  ExternalLink,
  Flame,
  Star,
  CheckCircle2,
  Tag,
  ChevronLeft,
  ChevronRight,
  Settings,
  Wrench,
} from 'lucide-react';
import { formatRupiah, getMarketplaceLinks } from '@/lib/laptop-utils';
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

  const mpLinks = getMarketplaceLinks(currentBanner.brand, currentBanner.title);
  const tokopediaTarget = currentBanner.tokopediaUrl || mpLinks.tokopedia;
  const shopeeTarget = currentBanner.shopeeUrl || mpLinks.shopee;

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
          {/* Left Col: Laptop Details & Specs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] uppercase font-bold border border-cyan-500/30">
                  {currentBanner.brand}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {currentBanner.brand.toLowerCase().includes('care') || currentBanner.brand.toLowerCase().includes('servis')
                    ? 'Layanan Servis & Reparasi Resmi'
                    : 'Unit Pilihan Resmi Toko LaptopSeber Palembang'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                {currentBanner.title}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
                {currentBanner.subtitle}
              </p>
            </div>

            {/* Key Specs Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Processor</span>
                </div>
                <div className="text-xs font-bold text-white mt-1 line-clamp-1" title={currentBanner.processor}>
                  {currentBanner.processor}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>GPU / Layanan</span>
                </div>
                <div className="text-xs font-bold text-amber-300 mt-1 line-clamp-1" title={currentBanner.vga}>
                  {currentBanner.vga}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <span>Kapasitas RAM</span>
                </div>
                <div className="text-xs font-bold text-emerald-300 mt-1">
                  {currentBanner.ramGb}GB RAM
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <span>Penyimpanan</span>
                </div>
                <div className="text-xs font-bold text-violet-300 mt-1">
                  {currentBanner.storageGb}GB SSD
                </div>
              </div>
            </div>

            {/* Pricing & CTA Row */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-white font-mono">
                    {formatRupiah(currentBanner.price)}
                  </span>
                  {currentBanner.originalPrice > currentBanner.price && (
                    <span className="text-xs sm:text-sm text-zinc-500 line-through font-mono">
                      {formatRupiah(currentBanner.originalPrice)}
                    </span>
                  )}
                  {currentBanner.discount && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {currentBanner.discount}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>
                    {currentBanner.brand.toLowerCase().includes('care') || currentBanner.brand.toLowerCase().includes('servis')
                      ? 'Garansi Servis Toko + Lacak Status Online'
                      : 'Garansi Resmi Toko LaptopSeber + Lolos Uji QC 30+ Titik'}
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {tokopediaTarget.startsWith('http') ? (
                  <a
                    href={tokopediaTarget}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/25 active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Lihat Unit di Web Toko</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </a>
                ) : (
                  <Link
                    href={tokopediaTarget}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/25 active:scale-95 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Pusat Servis LaptopSeber</span>
                  </Link>
                )}

                {shopeeTarget.startsWith('http') ? (
                  <a
                    href={shopeeTarget}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs transition shadow-lg shadow-orange-600/25 active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Beli di Shopee Toko</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </a>
                ) : (
                  <Link
                    href="/service-laptop"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-violet-600/25 active:scale-95 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Konsultasi Servis</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: High-Impact Image Card */}
          <div className="lg:col-span-5">
            <div className="relative group rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-white/10 to-black/60 p-4 backdrop-blur-md shadow-2xl">
              <div className="absolute top-3 right-3 z-20">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/40 uppercase">
                  {currentBanner.badge}
                </span>
              </div>

              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black/60 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10">
                    {currentBanner.display}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-cyan-300 font-bold">
                    Slide {currentIndex + 1}
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
