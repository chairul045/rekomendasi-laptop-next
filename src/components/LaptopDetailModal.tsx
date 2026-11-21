'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, HardDrive, Battery, Gauge, Monitor, ShieldCheck, Sparkles, Scale, Heart, Star, PhoneCall } from 'lucide-react';
import { getLaptopImageUrl, formatRupiah, isNewLaptopArrival } from '@/lib/laptop-utils';

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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-slate-900 dark:text-slate-100 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Top Accent Line: Navy & Blue */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500" />

        {/* Action Controls (Favorite & Close) */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(laptop)}
              className={`p-2.5 rounded-xl border transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${
                isFavorite
                  ? 'bg-rose-50 text-rose-500 border-rose-200 dark:bg-rose-950/60 dark:border-rose-800'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 hover:text-rose-500 border-slate-200 dark:border-slate-700'
              }`}
              title={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-700 transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Info Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-28 h-28 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center p-2">
            <img
              src={imgUrl}
              alt={laptop.name}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
                {laptop.brand}
              </span>
              {isNewLaptopArrival(laptop) && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Baru Masuk
                </span>
              )}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                  laptop.condition === 'second'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {laptop.condition === 'second' ? 'Kondisi Second' : 'Kondisi Baru'}
              </span>
              {laptop.category && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {laptop.category}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {laptop.name}
            </h2>

            <div className="text-2xl font-black text-blue-700 dark:text-blue-400">
              {formatRupiah(laptop.price)}
            </div>
          </div>
        </div>

        {/* Detailed Specs Grid */}
        <div className="py-6 space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Spesifikasi Lengkap &amp; Skor Performa</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* RAM */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-xs text-blue-600 font-semibold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                <span>Kapasitas RAM</span>
              </span>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {laptop.ramGb ? `${laptop.ramGb} GB` : 'Data belum tersedia'}
              </div>
              <span className="text-xs text-slate-500 block">Multitasking</span>
            </div>

            {/* Storage */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Penyimpanan SSD</span>
              </span>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {laptop.storageGb ? `${laptop.storageGb} GB` : 'Data belum tersedia'}
              </div>
              <span className="text-xs text-slate-500 block">Ruang Simpan Data</span>
            </div>

            {/* Battery */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5" />
                <span>Daya Tahan Baterai</span>
              </span>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {laptop.batteryHours ? `${laptop.batteryHours} Jam` : 'Standar'}
              </div>
              <span className="text-xs text-slate-500 block">Ketahanan Kuliah</span>
            </div>

            {/* Weight */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Bobot Laptop</span>
              </span>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {laptop.weightKg ? `${laptop.weightKg} kg` : 'Standar'}
              </div>
              <span className="text-xs text-slate-500 block">Kemudahan Dibawa</span>
            </div>

            {/* Display */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" />
                <span>Ukuran Layar</span>
              </span>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {laptop.displaySize ? `${laptop.displaySize}" Inci` : 'Standar'}
              </div>
              <span className="text-xs text-slate-500 block">Panel Display</span>
            </div>

            {/* Mobility Score */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Skor Portabilitas</span>
              </span>
              <div className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                {laptop.mobilityScore ?? (laptop.weightKg ? Math.round(100 - laptop.weightKg * 20) : 'Tersedia')}
                {laptop.mobilityScore != null && <span className="text-xs text-slate-500 font-normal"> / 100</span>}
              </div>
              <span className="text-xs text-slate-500 block">Mobilitas Mahasiswa</span>
            </div>
          </div>
        </div>

        {/* Contact & Actions - Consistent, Clear Buttons */}
        <div className="pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium mr-1">Mau beli? Hubungi:</span>
            <a
              href={`https://wa.me/6287851164239?text=${encodeURIComponent(`Halo, saya tertarik dengan laptop ${laptop.name} (${formatRupiah(laptop.price)}). Apakah masih tersedia?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs min-h-[42px]"
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
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition flex items-center gap-1.5 cursor-pointer min-h-[42px]"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Beri Ulasan</span>
              </button>
            )}

            {onCompare && (
              <button
                type="button"
                onClick={() => onCompare(laptop)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[42px] cursor-pointer ${
                  isComparing
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
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
