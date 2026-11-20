'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Flame,
  Tag,
  ChevronLeft,
  ChevronRight,
  Settings,
  Wrench,
  ShieldCheck,
  Cpu,
  HardDrive,
  Monitor,
} from 'lucide-react';
import { formatRupiah, getLaptopImageUrl } from '@/lib/laptop-utils';
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

  const currentBanner = banners[currentIndex] || banners[0];
  const [imgSrc, setImgSrc] = useState(currentBanner?.imageUrl || '');

  useEffect(() => {
    if (currentBanner?.imageUrl) {
      setImgSrc(currentBanner.imageUrl);
    }
  }, [currentBanner?.imageUrl]);

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

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    timerRef.current = setInterval(() => {
      setDirection('next');
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length, isPaused]);

  if (!banners || banners.length === 0) return null;

  const isSuperAdmin = userEmail?.toLowerCase() === 'chairulanwarr003@gmail.com';
  const isServisBanner = currentBanner.brand.toLowerCase().includes('care') || currentBanner.brand.toLowerCase().includes('servis');

  const waUrl = `https://wa.me/6287851164239?text=${encodeURIComponent(
    isServisBanner
      ? `Halo LapMatch, saya ingin konsultasi mengenai layanan servis dan upgrade laptop.`
      : `Halo LapMatch, saya tertarik dengan unit ${currentBanner.title} (${formatRupiah(currentBanner.price)}). Apakah masih tersedia?`
  )}`;

  const handlePrev = () => { setDirection('prev'); setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length); };
  const handleNext = () => { setDirection('next'); setCurrentIndex((prev) => (prev + 1) % banners.length); };

  const specItems = [
    { icon: <Cpu className="w-3.5 h-3.5 text-cyan-400" />, label: 'Processor', value: currentBanner.processor, color: 'text-zinc-800 dark:text-white' },
    { icon: <Monitor className="w-3.5 h-3.5 text-amber-400" />, label: 'GPU / Layanan', value: currentBanner.vga, color: 'text-zinc-700 dark:text-amber-300' },
    { icon: <Tag className="w-3.5 h-3.5 text-emerald-500" />, label: 'RAM', value: `${currentBanner.ramGb}GB RAM`, color: 'text-zinc-700 dark:text-emerald-300' },
    { icon: <HardDrive className="w-3.5 h-3.5 text-violet-400" />, label: 'Storage', value: `${currentBanner.storageGb}GB SSD`, color: 'text-zinc-700 dark:text-violet-300' },
  ];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-violet-500/30 bg-white dark:bg-transparent shadow-xl dark:shadow-[0_0_60px_rgba(124,58,237,0.15)]"
    >
      {/* ── Dark mode: gradient background ── */}
      <div
        className="absolute inset-0 hidden dark:block pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #0f0a1e 0%, #0d1535 40%, #091220 100%)',
        }}
      />

      {/* ── Dark mode: animated gradient border ── */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none hidden dark:block"
        style={{
          padding: '1.5px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.8) 0%, rgba(6,182,212,0.6) 50%, rgba(139,92,246,0.4) 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* ── Background glow blobs (dark only) ── */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none hidden dark:block" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/25 rounded-full blur-[80px] pointer-events-none hidden dark:block" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none hidden dark:block" />
      <div className="absolute top-0 right-1/3 w-64 h-64 bg-indigo-500/15 rounded-full blur-[60px] pointer-events-none hidden dark:block" />

      {/* ── Light mode: subtle gradient accent at top ── */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 dark:hidden" />

      <div className="relative z-10 p-5 sm:p-7">
        {/* ── Top Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            {/* Hot badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-gradient-to-r dark:from-amber-500/30 dark:to-orange-500/20 border border-amber-300 dark:border-amber-400/50 shadow-sm dark:shadow-[0_0_16px_rgba(251,191,36,0.3)]">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 dark:fill-amber-300 dark:text-amber-300 animate-pulse" />
              <span className="text-[11px] font-black text-amber-700 dark:text-amber-200 uppercase tracking-wider">
                Rekomendasi Laptop Pilihan
              </span>
            </div>

            {/* Editor pick badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/20 border border-violet-300 dark:border-violet-500/40">
              <Sparkles className="w-3 h-3 text-violet-500 dark:text-violet-400" />
              <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-300 font-mono">
                {currentBanner.badge || 'Pilihan Editor 2026'}
              </span>
            </div>

            {isSuperAdmin && (
              <Link
                href="/admin?tab=banners"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-[10px] font-mono hover:bg-cyan-100 dark:hover:bg-cyan-500/30 transition"
              >
                <Settings className="w-3 h-3" />
                Kelola Iklan
              </Link>
            )}
          </div>

          {/* Slide controls */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-zinc-500">
              <strong className="text-zinc-800 dark:text-zinc-300">{currentIndex + 1}</strong>/{banners.length}
            </span>
            <div className="flex gap-1">
              <button onClick={handlePrev} aria-label="Sebelumnya" className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleNext} aria-label="Berikutnya" className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Slide ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0, x: direction === 'next' ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'next' ? -30 : 30 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="grid lg:grid-cols-12 gap-5 sm:gap-7 pt-5 items-center"
          >
            {/* ── LEFT: Info & CTA ── */}
            <div className="lg:col-span-5 space-y-4">
              {/* Title area */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/25 text-cyan-700 dark:text-cyan-300 font-mono text-[10px] uppercase font-bold border border-cyan-200 dark:border-cyan-500/40 tracking-widest">
                    {currentBanner.brand}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                    {isServisBanner ? 'Layanan Servis & Reparasi Resmi LapMatch' : 'Kurasi Resmi LapMatch • QC 30+ Titik'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight break-words">
                  {currentBanner.title}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {currentBanner.subtitle}
                </p>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-2">
                {specItems.map((spec, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/35 backdrop-blur-sm">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono uppercase mb-0.5">
                      {spec.icon}
                      <span>{spec.label}</span>
                    </div>
                    <div className={`text-xs font-bold line-clamp-1 ${spec.color}`} title={spec.value}>
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price + CTA */}
              <div className="space-y-3">
                {/* Price card */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 backdrop-blur-xl flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-0.5">Harga Penawaran</div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400" style={{ textShadow: '0 0 20px rgba(52,211,153,0.2)' }}>
                        {formatRupiah(currentBanner.price)}
                      </span>
                      {currentBanner.originalPrice > currentBanner.price && (
                        <span className="text-xs text-zinc-400 dark:text-zinc-600 line-through font-mono">
                          {formatRupiah(currentBanner.originalPrice)}
                        </span>
                      )}
                      {currentBanner.discount && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 dark:bg-rose-500/25 text-rose-600 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40">
                          {currentBanner.discount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                    <span>Garansi Resmi QC</span>
                  </div>
                </div>

                {/* WA Button */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-black text-sm text-white transition active:scale-95 cursor-pointer bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-600/30"
                >
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Konsultasi WhatsApp LapMatch (087851164239)</span>
                </a>

                {isServisBanner && (
                  <Link
                    href="/service-laptop"
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-slate-200 dark:border-white/10 text-xs font-semibold transition"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Info Servis Laptop
                  </Link>
                )}
              </div>
            </div>

            {/* ── RIGHT: Laptop Showcase ── */}
            <div className="lg:col-span-7">
              <div className="relative group rounded-3xl overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-white/[0.07] dark:via-black/50 dark:to-black/70 border border-slate-200 dark:border-white/12 backdrop-blur-xl">
                {/* Badge top-right */}
                <div className="absolute top-4 right-4 z-20">
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wide shadow-lg"
                    style={{
                      background: 'linear-gradient(90deg, #ef4444, #f97316, #f59e0b)',
                      boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
                    }}
                  >
                    {currentBanner.badge}
                  </span>
                </div>

                {/* Image area */}
                <div className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center p-4" style={{ aspectRatio: '16/9' }}>
                  {/* Light mode radial bg */}
                  <div className="absolute inset-0 dark:hidden" style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, rgba(248,250,252,1) 70%)' }} />
                  {/* Dark mode radial bg */}
                  <div className="absolute inset-0 hidden dark:block" style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, rgba(0,0,0,0.6) 70%)' }} />

                  <motion.img
                    src={imgSrc || getLaptopImageUrl(currentBanner.brand, currentBanner.title)}
                    alt={currentBanner.title}
                    onError={() => {
                      const fallback = getLaptopImageUrl(currentBanner.brand, currentBanner.title);
                      if (imgSrc !== fallback) {
                        setImgSrc(fallback);
                      }
                    }}
                    className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                    loading="lazy"
                    whileHover={{ scale: 1.06, y: -6 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  />

                  {/* Floor glow */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-10 bg-violet-500/10 dark:bg-violet-500/20 blur-2xl rounded-full pointer-events-none" />

                  {/* Bottom info bar */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono pointer-events-none z-20">
                    <span className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-black/75 text-zinc-600 dark:text-zinc-300 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm">
                      {currentBanner.display}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-black/75 text-cyan-600 dark:text-cyan-300 font-bold backdrop-blur-md border border-slate-200 dark:border-cyan-500/30 shadow-sm">
                      {currentIndex + 1} / {banners.length}
                    </span>
                  </div>
                </div>

                {/* Scan lines decoration (dark only) */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none opacity-[0.03] hidden dark:block"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)',
                  }}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Dot Navigation ── */}
        <div className="flex items-center justify-center gap-2 pt-5">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => { setDirection(idx > currentIndex ? 'next' : 'prev'); setCurrentIndex(idx); }}
              aria-label={`Slide ${idx + 1}`}
              className="transition-all rounded-full cursor-pointer"
              style={{
                width: idx === currentIndex ? '2rem' : '0.5rem',
                height: '0.5rem',
                background: idx === currentIndex
                  ? 'linear-gradient(90deg, #8b5cf6, #06b6d4)'
                  : 'rgba(148,163,184,0.3)',
                boxShadow: idx === currentIndex ? '0 0 8px rgba(139,92,246,0.5)' : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
