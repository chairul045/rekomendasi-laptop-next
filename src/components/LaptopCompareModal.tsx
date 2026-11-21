'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, CheckCircle, Scale, Trash2, PhoneCall } from 'lucide-react';
import { getLaptopImageUrl, formatRupiah, isNewLaptopArrival } from '@/lib/laptop-utils';
import { LaptopDetailItem } from './LaptopDetailModal';

interface LaptopCompareModalProps {
  laptops: LaptopDetailItem[];
  onClose: () => void;
  onRemove: (id: number) => void;
  onClear: () => void;
}

export default function LaptopCompareModal({
  laptops,
  onClose,
  onRemove,
  onClear,
}: LaptopCompareModalProps) {
  if (laptops.length === 0) return null;

  // Calculate best values for highlighting
  const validPrices = laptops.map((l) => Number(l.price)).filter((p) => p > 0);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

  const validRam = laptops.map((l) => l.ramGb ?? 0);
  const maxRam = Math.max(...validRam);

  const validStorage = laptops.map((l) => l.storageGb ?? 0);
  const maxStorage = Math.max(...validStorage);

  const validBattery = laptops.map((l) => l.batteryHours ?? 0);
  const maxBattery = Math.max(...validBattery);

  const validWeights = laptops.map((l) => l.weightKg ?? 99).filter((w) => w > 0);
  const minWeight = validWeights.length > 0 ? Math.min(...validWeights) : 99;

  const validPerforma = laptops.map((l) => l.performaKomposit ?? 0);
  const maxPerforma = Math.max(...validPerforma);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500" />

        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Komparasi Laptop Berdampingan</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
                  {laptops.length} Laptop
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Spesifikasi unggul di setiap kriteria ditandai dengan badge khusus untuk kemudahan seleksi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-600 dark:text-slate-300 hover:text-rose-600 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hapus Semua</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-700 transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Tutup komparasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table Body */}
        <div className="flex-1 overflow-x-auto p-4 sm:p-6">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 w-40 font-semibold text-slate-500 uppercase tracking-wider text-[11px] align-bottom">
                  Alternatif
                </th>
                {laptops.map((laptop) => {
                  const imgUrl = getLaptopImageUrl(laptop.brand, laptop.name, laptop.imageUrl);
                  return (
                    <th key={laptop.id} className="p-3 min-w-[200px] max-w-[260px] align-top">
                      <div className="relative p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <button
                          type="button"
                          onClick={() => onRemove(laptop.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition"
                          title="Hapus laptop ini dari komparasi"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-full h-24 rounded-lg bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center p-2">
                          <img
                            src={imgUrl}
                            alt={laptop.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                          {laptop.name}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Harga */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-500">Harga Pasar</td>
                {laptops.map((l) => {
                  const isLowest = Number(l.price) === minPrice && minPrice > 0;
                  return (
                    <td key={l.id} className="p-3">
                      <div className="font-extrabold text-blue-700 dark:text-blue-400 text-sm">
                        {formatRupiah(l.price)}
                      </div>
                      {isLowest && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Termurah
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* RAM */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-500">Kapasitas RAM</td>
                {laptops.map((l) => {
                  const isHighest = (l.ramGb ?? 0) === maxRam && maxRam > 0;
                  return (
                    <td key={l.id} className="p-3">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {l.ramGb != null ? `${l.ramGb} GB` : 'Data belum tersedia'}
                      </span>
                      {isHighest && (
                        <span className="ml-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          RAM Terbesar
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* SSD */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-500">Penyimpanan SSD</td>
                {laptops.map((l) => {
                  const isHighest = (l.storageGb ?? 0) === maxStorage && maxStorage > 0;
                  return (
                    <td key={l.id} className="p-3">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {l.storageGb != null ? `${l.storageGb} GB` : 'Data belum tersedia'}
                      </span>
                      {isHighest && (
                        <span className="ml-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          SSD Terbesar
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Baterai */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-500">Daya Baterai</td>
                {laptops.map((l) => {
                  const isHighest = (l.batteryHours ?? 0) === maxBattery && maxBattery > 0;
                  return (
                    <td key={l.id} className="p-3">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {l.batteryHours != null ? `${l.batteryHours} Jam` : 'Standar'}
                      </span>
                      {isHighest && (
                        <span className="ml-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Paling Awet
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Bobot */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-500">Bobot Laptop</td>
                {laptops.map((l) => {
                  const isLowest = (l.weightKg ?? 99) === minWeight && minWeight < 99;
                  return (
                    <td key={l.id} className="p-3">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {l.weightKg != null ? `${l.weightKg} kg` : 'Standar'}
                      </span>
                      {isLowest && (
                        <span className="ml-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Paling Ringan
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Layar */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-500">Ukuran Layar</td>
                {laptops.map((l) => (
                  <td key={l.id} className="p-3 text-slate-700 dark:text-slate-300 text-xs">
                    {l.displaySize ? `${l.displaySize}" Inci` : 'Standar'}
                  </td>
                ))}
              </tr>

              {/* Kondisi */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-500">Kondisi Fisik</td>
                {laptops.map((l) => (
                  <td key={l.id} className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${
                        l.condition === 'second'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {l.condition}
                    </span>
                  </td>
                ))}
              </tr>

              {/* WhatsApp Contact */}
              <tr>
                <td className="p-3 font-semibold text-slate-500">Pemesanan</td>
                {laptops.map((l) => (
                  <td key={l.id} className="p-3">
                    <a
                      href={`https://wa.me/6287851164239?text=${encodeURIComponent(`Halo, saya tertarik dengan laptop ${l.name} (${formatRupiah(l.price)}). Apakah masih tersedia?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 min-h-[40px] text-center"
                    >
                      <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                      <span>WhatsApp Toko</span>
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
