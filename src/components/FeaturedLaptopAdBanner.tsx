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
    { icon: <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />, label: 'Processor', value: currentBanner.processor, color: 'text-slate-800 dark:text-white' },
    { icon: <Monitor className="w-3.5 h-3.5 text-amber-500" />, label: 'GPU / Layanan', value: currentBanner.vga, color: 'text-slate-700 dark:text-amber-300' },
    { icon: <Tag className="w-3.5 h-3.5 text-emerald-600" />, label: 'RAM', value: `${currentBanner.ramGb}GB RAM`, color: 'text-slate-700 dark:text-emerald-300' },
    { icon: <HardDrive className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />, label: 'Storage', value: `${currentBanner.storageGb}GB SSD`, color: 'text-slate-700 dark:text-indigo-300' },
  ];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
    >
      {/* ── Top accent line: Navy & Blue ── */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500" />

      <div className="relative z-10 p-5 sm:p-7">
        {/* ── Top Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Hot badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Rekomendasi Laptop Pilihan
              </span>
            </div>

            {/* Editor pick badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                {currentBanner.badge || 'Pilihan Editor'}
              </span>
            </div>

            {isSuperAdmin && (
              <Link
                href="/admin?tab=banners"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] hover:bg-slate-200 transition"
              >
                <Settings className="w-3 h-3" />
                Kelola Iklan
              </Link>
            )}
          </div>

          {/* Slide controls */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-slate-500">
              <strong className="text-slate-800 dark:text-slate-200">{currentIndex + 1}</strong>/{banners.length}
            </span>
            <div className="flex gap-1">
              <button onClick={handlePrev} aria-label="Sebelumnya" className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleNext} aria-label="Berikutnya" className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Slide ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0, x: direction === 'next' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'next' ? -20 : 20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="grid lg:grid-cols-12 gap-5 sm:gap-7 pt-5 items-center"
          >
            {/* ── LEFT: Info & CTA ── */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] uppercase font-bold border border-blue-200 dark:border-blue-800 tracking-wider">
                    {currentBanner.brand}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {isServisBanner ? 'Layanan Servis Resmi LapMatch' : 'QC 30+ Titik Siap Pakai'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight break-words">
                  {currentBanner.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {currentBanner.subtitle}
                </p>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-2">
                {specItems.map((spec, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase mb-0.5 font-semibold">
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
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Harga Penawaran</div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400">
                        {formatRupiah(currentBanner.price)}
                      </span>
                      {currentBanner.originalPrice > currentBanner.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatRupiah(currentBanner.originalPrice)}
                        </span>
                      )}
                      {currentBanner.discount && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          {currentBanner.discount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Garansi QC</span>
                  </div>
                </div>

                {/* WA Button - Consistent, prominent */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-bold text-sm text-white transition active:scale-98 cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-xs min-h-[44px]"
                >
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Konsultasi WhatsApp (087851164239)</span>
                </a>

                {isServisBanner && (
                  <Link
                    href="/service-laptop"
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition min-h-[40px]"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Info Servis Laptop
                  </Link>
                )}
              </div>
            </div>

            {/* ── RIGHT: Laptop Showcase ── */}
            <div className="lg:col-span-7">
              <div className="relative group rounded-2xl overflow-hidden p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                {/* Badge top-right */}
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wide bg-blue-600 shadow-xs">
                    {currentBanner.badge}
                  </span>
                </div>

                {/* Image area */}
                <div className="relative w-full rounded-xl overflow-hidden flex items-center justify-center p-4 bg-white dark:bg-slate-900" style={{ aspectRatio: '16/9' }}>
                  <motion.img
                    src={imgSrc || getLaptopImageUrl(currentBanner.brand, currentBanner.title)}
                    alt={currentBanner.title}
                    onError={() => {
                      const fallback = getLaptopImageUrl(currentBanner.brand, currentBanner.title);
                      if (imgSrc !== fallback) {
                        setImgSrc(fallback);
                      }
                    }}
                    className="relative z-10 w-full h-full object-contain"
                    loading="lazy"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                  />

                  {/* Bottom info bar */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] pointer-events-none z-20">
                    <span className="px-2.5 py-1 rounded-lg bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs">
                      {currentBanner.display}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/95 dark:bg-slate-800/95 text-blue-700 dark:text-blue-300 font-bold border border-slate-200 dark:border-slate-700 shadow-xs">
                      {currentIndex + 1} / {banners.length}
                    </span>
                  </div>
                </div>
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
                width: idx === currentIndex ? '1.75rem' : '0.5rem',
                height: '0.5rem',
                backgroundColor: idx === currentIndex ? '#2563eb' : '#cbd5e1',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
