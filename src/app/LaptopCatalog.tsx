'use client';

import { useState } from 'react';
import { getLaptopImageUrl, formatRupiah, getMarketplaceLinks } from '@/lib/laptop-utils';
import { Zap, ExternalLink } from 'lucide-react';

interface LaptopItem {
  id: number;
  name: string;
  brand: string;
  price: string | number;
  ramGb: number | null;
  storageGb: number | null;
  batteryHours: number | null;
  weightKg: number | null;
  performaKomposit: number | null;
  condition: string;
  category: string | null;
  imageUrl: string | null;
}

export default function LaptopCatalog({ laptops }: { laptops: LaptopItem[] }) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'gaming' | 'portable' | 'budget'>('all');

  const filtered = laptops.filter((laptop) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'gaming') {
      const name = laptop.name.toLowerCase();
      const cat = (laptop.category ?? '').toLowerCase();
      return (
        cat.includes('gaming') ||
        name.includes('gaming') ||
        name.includes('tuf') ||
        name.includes('rog') ||
        name.includes('nitro') ||
        name.includes('victus') ||
        name.includes('legion') ||
        name.includes('predator') ||
        (laptop.performaKomposit ?? 0) >= 80
      );
    }
    if (activeCategory === 'portable') {
      return (laptop.weightKg && laptop.weightKg <= 1.5) || (laptop.batteryHours && laptop.batteryHours >= 10);
    }
    if (activeCategory === 'budget') {
      return Number(laptop.price) <= 7000000;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-950/50 text-cyan-300 border border-cyan-800/60 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Katalog Pilihan Terkini
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Rekomendasi Laptop Terbaru & Terbaik
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Koleksi laptop dengan nilai performa komposit unggulan yang siap dihitung kecocokannya dengan TOPSIS.
          </p>
        </div>

        {/* Kategori Tabs Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0e0e15] p-1.5 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Semua ({laptops.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('gaming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeCategory === 'gaming'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🎮 Gaming & 3D
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('portable')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeCategory === 'portable'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🎒 Portabel & Baterai
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('budget')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeCategory === 'budget'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            💰 Hemat Anggaran
          </button>
        </div>
      </div>

      {/* Laptop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((laptop) => {
          const imgUrl = getLaptopImageUrl(laptop.brand, laptop.name, laptop.imageUrl);
          const links = getMarketplaceLinks(laptop.brand, laptop.name);

          return (
            <div
              key={laptop.id}
              className="group relative rounded-3xl bg-[#0e0e15]/80 border border-white/10 hover:border-violet-500/50 transition-all duration-300 overflow-hidden backdrop-blur-md flex flex-col justify-between shadow-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.25)] hover:-translate-y-1"
            >
              {/* Image with overlay tags */}
              <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={laptop.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500 filter brightness-95 group-hover:brightness-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e15] via-transparent to-black/30" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
                    {laptop.brand}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono capitalize ${
                      laptop.condition === 'second'
                        ? 'bg-amber-500/80 text-zinc-950 font-bold'
                        : 'bg-emerald-500/80 text-white font-bold'
                    }`}
                  >
                    {laptop.condition === 'second' ? 'Second' : 'Baru'}
                  </span>
                </div>

                {/* Performa Badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-mono font-bold bg-violet-950/80 backdrop-blur-md text-violet-300 border border-violet-500/40">
                    <Zap className="w-3 h-3 text-violet-400" />
                    <span>{laptop.performaKomposit ?? '—'} / 100</span>
                  </span>
                </div>
              </div>

              {/* Laptop Body Info */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition line-clamp-2 leading-snug">
                    {laptop.name}
                  </h3>
                  <div className="text-base font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                    {formatRupiah(laptop.price)}
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center gap-1.5 text-zinc-300">
                    <span className="text-violet-400 font-mono">RAM</span>
                    <span className="font-bold">{laptop.ramGb ?? '—'} GB</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center gap-1.5 text-zinc-300">
                    <span className="text-indigo-400 font-mono">SSD</span>
                    <span className="font-bold">{laptop.storageGb ?? '—'} GB</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center gap-1.5 text-zinc-300">
                    <span className="text-amber-400 font-mono">Bat</span>
                    <span className="font-bold">{laptop.batteryHours ?? '—'} Jam</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center gap-1.5 text-zinc-300">
                    <span className="text-cyan-400 font-mono">Berat</span>
                    <span className="font-bold">{laptop.weightKg ?? '—'} kg</span>
                  </div>
                </div>

                {/* Marketplace button */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <a
                    href={links.shopee}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>Cek Shopee</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={links.tokopedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>Tokopedia</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
