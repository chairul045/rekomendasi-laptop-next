'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, HardDrive, Battery, Gauge, Monitor, ShieldCheck, Sparkles, Scale, Heart, Star, PhoneCall } from 'lucide-react';
import { getLaptopImageUrl, formatRupiah } from '@/lib/laptop-utils';

export interface LaptopDetailItem {
  id: number;
  name: string;
  brand: string;
  price: string | number;
  condition: string;
  category?: string | null;
  ramGb?: number | null;
  storageGb?: number | null;
  batteryHours?: number | null;
  weightKg?: number | null;
  performaKomposit?: number | null;
  processorScore?: number | null;
  vgaScore?: number | null;
  displaySize?: number | null;
  mobilityScore?: number | null;
  imageUrl?: string | null;
}

interface LaptopDetailModalProps {
  laptop: LaptopDetailItem | null;
  onClose: () => void;
  onCompare?: (laptop: LaptopDetailItem) => void;
  isComparing?: boolean;
  onToggleFavorite?: (laptop: LaptopDetailItem) => void;
  isFavorite?: boolean;
  onOpenReview?: (laptop: LaptopDetailItem) => void;
}

export default function LaptopDetailModal({
  laptop,
  onClose,
  onCompare,
  isComparing,
  onToggleFavorite,
  isFavorite = false,
  onOpenReview,
}: LaptopDetailModalProps) {
  if (!laptop) return null;

  const imgUrl = getLaptopImageUrl(laptop.brand, laptop.name, laptop.imageUrl);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0e0e15] border border-slate-200 dark:border-white/15 p-6 sm:p-8 text-zinc-900 dark:text-zinc-100 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Glow Header Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />

        {/* Action Controls (Favorite & Close) */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(laptop)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isFavorite
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border-white/10'
              }`}
              title={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Info Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-white/10">
          <div className="w-28 h-28 rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src={imgUrl}
              alt={laptop.name}
              className="w-full h-full object-contain"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase">
                {laptop.brand}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase ${
                  laptop.condition === 'second'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {laptop.condition === 'second' ? 'Kondisi Second' : 'Kondisi Baru (Resmi)'}
              </span>
              {laptop.category && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-white/10">
                  {laptop.category}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {laptop.name}
            </h2>

            <div className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
              {formatRupiah(laptop.price)}
            </div>
          </div>
        </div>

        {/* Detailed Specs Grid */}
        <div className="py-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Spesifikasi Lengkap & Skor Komparatif SPK</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* RAM */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-purple-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>Kapasitas RAM</span>
              </span>
              <div className="text-base font-extrabold text-white">
                {laptop.ramGb ? `${laptop.ramGb} GB` : '—'}
              </div>
              <span className="text-[10px] text-zinc-500 block">Multitasking Cepat</span>
            </div>

            {/* Storage */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Penyimpanan SSD</span>
              </span>
              <div className="text-base font-extrabold text-white">
                {laptop.storageGb ? `${laptop.storageGb} GB` : '—'}
              </div>
              <span className="text-[10px] text-zinc-500 block">High-speed NVMe</span>
            </div>

            {/* Battery */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
              <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5" />
                <span>Daya Tahan Baterai</span>
              </span>
              <div className="text-base font-extrabold text-white">
                {laptop.batteryHours ? `${laptop.batteryHours} Jam` : 'Data belum tersedia'}
              </div>
              <span className="text-xs text-zinc-500 block">Pemakaian Normal</span>
            </div>

            {/* Weight */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
              <span className="text-xs font-mono text-pink-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Bobot Laptop</span>
              </span>
              <div className="text-base font-extrabold text-white">
                {laptop.weightKg ? `${laptop.weightKg} kg` : 'Data belum tersedia'}
              </div>
              <span className="text-xs text-zinc-500 block">Portabel ke Kampus</span>
            </div>

            {/* Processor Score */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                <span>Skor Prosesor (CPU)</span>
              </span>
              <div className="text-base font-extrabold text-cyan-300 font-mono">
                {laptop.processorScore ?? laptop.performaKomposit ?? 'Data belum tersedia'}
                {laptop.processorScore != null && <span className="text-xs text-zinc-500 font-normal"> / 100</span>}
              </div>
              <span className="text-xs text-zinc-500 block">Kekuatan Komputasi</span>
            </div>

            {/* VGA Score */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                <span>Skor Grafis (GPU/VGA)</span>
              </span>
              <div className="text-base font-extrabold text-emerald-300 font-mono">
                {laptop.vgaScore != null ? `${laptop.vgaScore} / 100` : 'Data belum tersedia'}
              </div>
              <span className="text-xs text-zinc-500 block">Gaming &amp; Rendering</span>
            </div>

            {/* Display Size */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
              <span className="text-xs font-mono text-blue-400 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" />
                <span>Ukuran Layar</span>
              </span>
              <div className="text-base font-extrabold text-white">
                {laptop.displaySize ? `${laptop.displaySize}" Inci` : 'Data belum tersedia'}
              </div>
              <span className="text-xs text-zinc-500 block">Panel Display</span>
            </div>

            {/* Mobility Score */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
              <span className="text-xs font-mono text-rose-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Skor Portabilitas</span>
              </span>
              <div className="text-base font-extrabold text-rose-300 font-mono">
                {laptop.mobilityScore ?? (laptop.weightKg ? Math.round(100 - laptop.weightKg * 20) : 'Data belum tersedia')}
                {laptop.mobilityScore != null && <span className="text-xs text-zinc-500 font-normal"> / 100</span>}
              </div>
              <span className="text-xs text-zinc-500 block">Mobilitas Mahasiswa</span>
            </div>
          </div>
        </div>

        {/* Contact & Actions */}
        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400 dark:text-zinc-400 font-mono mr-1">Mau beli? Hubungi:</span>
            <a
              href={`https://wa.me/6287851164239?text=${encodeURIComponent(`Halo, saya tertarik dengan laptop ${laptop.name} (${formatRupiah(laptop.price)}). Apakah masih tersedia?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/25 active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>WhatsApp 087851164239</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {onOpenReview && (
              <button
                type="button"
                onClick={() => onOpenReview(laptop)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Beri Ulasan</span>
              </button>
            )}

            {onCompare && (
              <button
                type="button"
                onClick={() => onCompare(laptop)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  isComparing
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md'
                }`}
              >
                {isComparing ? 'Batalkan Komparasi' : '➕ Tambah ke Komparasi'}
              </button>
            )}
          </div>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
