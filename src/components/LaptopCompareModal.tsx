'use client';

import { X, ExternalLink, Trophy, CheckCircle, Scale, Trash2 } from 'lucide-react';
import { getLaptopImageUrl, formatRupiah, getMarketplaceLinks } from '@/lib/laptop-utils';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0e0e15] border border-white/15 text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />

        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-600/20 text-violet-300 border border-violet-500/30">
              <Scale className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Komparasi Laptop Berdampingan</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-mono">
                  {laptops.length} Laptop
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Spesifikasi unggul di setiap kriteria ditandai dengan badge khusus untuk kemudahan seleksi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-300 border border-white/10 hover:border-rose-800/40 text-xs font-medium transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hapus Semua</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition"
              aria-label="Tutup komparasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table Body (Horizontally Scrollable) */}
        <div className="flex-1 overflow-x-auto p-4 sm:p-6">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 w-40 font-mono text-zinc-400 uppercase tracking-wider text-[11px] align-bottom">
                  Alternatif
                </th>
                {laptops.map((laptop) => {
                  const imgUrl = getLaptopImageUrl(laptop.brand, laptop.name, laptop.imageUrl);
                  return (
                    <th key={laptop.id} className="p-3 min-w-[200px] max-w-[260px] align-top">
                      <div className="relative p-3 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-2">
                        <button
                          type="button"
                          onClick={() => onRemove(laptop.id)}
                          className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
                          title="Hapus laptop ini dari komparasi"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-full h-24 rounded-xl bg-zinc-900 overflow-hidden flex items-center justify-center p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={laptop.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold uppercase">
                          {laptop.brand}
                        </span>
                        <h4 className="font-extrabold text-white text-xs line-clamp-2 leading-snug">
                          {laptop.name}
                        </h4>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {/* Harga */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-mono font-semibold text-zinc-400">Harga</td>
                {laptops.map((l) => {
                  const isLowest = Number(l.price) === minPrice && validPrices.length > 1;
                  return (
                    <td key={l.id} className="p-3 font-mono">
                      <div className="font-extrabold text-sm text-white">
                        {formatRupiah(l.price)}
                      </div>
                      {isLowest && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <Trophy className="w-3 h-3" /> Paling Hemat
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Performa Komposit */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-mono font-semibold text-zinc-400">Skor Performa</td>
                {laptops.map((l) => {
                  const isHighest = (l.performaKomposit ?? 0) === maxPerforma && maxPerforma > 0;
                  return (
                    <td key={l.id} className="p-3 font-mono">
                      <span className="text-sm font-extrabold text-cyan-300">
                        {l.performaKomposit ?? '—'}
                      </span>
                      <span className="text-zinc-500 text-[10px]"> / 100</span>
                      {isHighest && (
                        <span className="block mt-1 text-[10px] font-bold text-amber-300">
                          ⚡ Tertinggi
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* RAM */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-mono font-semibold text-zinc-400">RAM</td>
                {laptops.map((l) => {
                  const isHighest = (l.ramGb ?? 0) === maxRam && maxRam > 0;
                  return (
                    <td key={l.id} className="p-3">
                      <span className="font-bold text-white">{l.ramGb ?? '—'} GB</span>
                      {isHighest && (
                        <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Terbesar
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* SSD Storage */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-mono font-semibold text-zinc-400">Penyimpanan SSD</td>
                {laptops.map((l) => {
                  const isHighest = (l.storageGb ?? 0) === maxStorage && maxStorage > 0;
                  return (
                    <td key={l.id} className="p-3">
                      <span className="font-bold text-white">{l.storageGb ?? '—'} GB</span>
                      {isHighest && (
                        <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Terbesar
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Baterai */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-mono font-semibold text-zinc-400">Daya Baterai</td>
                {laptops.map((l) => {
                  const isHighest = (l.batteryHours ?? 0) === maxBattery && maxBattery > 0;
                  return (
                    <td key={l.id} className="p-3">
                      <span className="font-bold text-white">{l.batteryHours ?? '—'} Jam</span>
                      {isHighest && (
                        <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Paling Awet
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Bobot */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-mono font-semibold text-zinc-400">Bobot Laptop</td>
                {laptops.map((l) => {
                  const isLowest = (l.weightKg ?? 99) === minWeight && minWeight < 99;
                  return (
                    <td key={l.id} className="p-3">
                      <span className="font-bold text-white">{l.weightKg ?? '—'} kg</span>
                      {isLowest && (
                        <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          Paling Ringan
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Layar */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-mono font-semibold text-zinc-400">Ukuran Layar</td>
                {laptops.map((l) => (
                  <td key={l.id} className="p-3 text-zinc-200">
                    {l.displaySize ? `${l.displaySize}" Inci` : '14.0" Inci'}
                  </td>
                ))}
              </tr>

              {/* Kondisi */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-mono font-semibold text-zinc-400">Kondisi Fisik</td>
                {laptops.map((l) => (
                  <td key={l.id} className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold capitalize ${
                        l.condition === 'second'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {l.condition}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Marketplace Links */}
              <tr>
                <td className="p-3 font-mono font-semibold text-zinc-400">Beli Sekarang</td>
                {laptops.map((l) => {
                  const links = getMarketplaceLinks(l.brand, l.name);
                  return (
                    <td key={l.id} className="p-3">
                      <div className="flex flex-col gap-1.5">
                        <a
                          href={links.shopee}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-orange-950/40 hover:bg-orange-900/60 text-orange-300 border border-orange-800/40 text-[11px] font-medium transition flex items-center justify-between"
                        >
                          <span>Shopee</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={links.tokopedia}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 text-[11px] font-medium transition flex items-center justify-between"
                        >
                          <span>Tokopedia</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
