'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  ShoppingBag,
  ExternalLink,
  Flame,
  Star,
  CheckCircle2,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { formatRupiah, getMarketplaceLinks } from '@/lib/laptop-utils';

export interface FeaturedLaptopData {
  id?: number;
  name: string;
  brand: string;
  price: string | number;
  originalPrice?: string | number;
  processor?: string;
  vga?: string;
  ramGb?: number | null;
  storageGb?: number | null;
  display?: string;
  batteryHours?: number | null;
  imageUrl?: string | null;
  badge?: string;
}

const DEFAULT_FEATURED: FeaturedLaptopData = {
  name: 'ASUS ROG STRIX G16 / G17 AI - Ryzen 9 7845HX + RTX 4070 8GB 32GB 1TB QHD 240Hz',
  brand: 'ASUS',
  price: '25999000',
  originalPrice: '28999000',
  processor: 'AMD Ryzen 9 7845HX / Intel Core i9 14th Gen AI (16 Core up to 5.4GHz)',
  vga: 'NVIDIA GeForce RTX 4070 / 4060 8GB GDDR6 (140W Max TGP)',
  ramGb: 32,
  storageGb: 1000,
  display: '16-17.3" QHD+ 240Hz 3ms 100% DCI-P3 ROG Nebula Display',
  batteryHours: 8,
  imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
  badge: '👑 Flagship Terlaris 2026',
};

export default function FeaturedLaptopAdBanner({
  laptop = DEFAULT_FEATURED,
}: {
  laptop?: FeaturedLaptopData;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace'>('overview');

  const mpLinks = getMarketplaceLinks(laptop.brand, laptop.name);
  const priceNum = typeof laptop.price === 'string' ? parseInt(laptop.price) : laptop.price;
  const origPriceNum =
    typeof laptop.originalPrice === 'string'
      ? parseInt(laptop.originalPrice)
      : laptop.originalPrice || priceNum * 1.12;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#120f24] via-[#0c0d18] to-[#0a1120] border-2 border-violet-500/30 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(124,58,237,0.18)] transition-all hover:shadow-[0_0_70px_rgba(124,58,237,0.28)] hover:border-cyan-500/40">
      {/* Background Neon Blurs */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Badge Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wide shadow-sm animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>IKLAN • LAPTOP TERBARU & TERBAIK SEKARANG</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span>Pilihan Editor 2026</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-bold text-white ml-1">5.0</span>
          <span className="text-zinc-400 text-[11px]">(500+ Terjual)</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 grid lg:grid-cols-12 gap-6 pt-6 items-center">
        {/* Left Col: Laptop Details & Specs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] uppercase font-bold border border-cyan-500/30">
                {laptop.brand}
              </span>
              <span className="text-xs text-zinc-400 font-mono">Next-Gen AI High-Performance</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
              {laptop.name}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
              Performa puncak generasi terbaru bertenaga AI dengan kartu grafis RTX seri tinggi. Pilihan laptop nomor 1 untuk mahasiswa teknik, kreator konten, data science, rendering 3D, dan gaming kompetitif tanpa kompromi!
            </p>
          </div>

          {/* Key Specs Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>Processor</span>
              </div>
              <div className="text-xs font-bold text-white mt-1 line-clamp-1" title={laptop.processor || 'Ryzen 9 / Core i9'}>
                Ryzen 9 / i9 AI
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>GPU / VGA</span>
              </div>
              <div className="text-xs font-bold text-amber-300 mt-1 line-clamp-1" title={laptop.vga || 'RTX 4070 8GB'}>
                RTX 4070 8GB
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-400" />
                <span>Memory</span>
              </div>
              <div className="text-xs font-bold text-emerald-300 mt-1">
                {laptop.ramGb ?? 32}GB DDR5
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-violet-400" />
                <span>Storage</span>
              </div>
              <div className="text-xs font-bold text-violet-300 mt-1">
                {laptop.storageGb ?? 1000}GB NVMe SSD
              </div>
            </div>
          </div>

          {/* Pricing & CTA Row */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-white font-mono">
                  {formatRupiah(priceNum)}
                </span>
                {origPriceNum > priceNum && (
                  <span className="text-xs sm:text-sm text-zinc-500 line-through font-mono">
                    {formatRupiah(origPriceNum)}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Hemat 10%
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Garansi Resmi 2 Tahun + Free Windows 11 &amp; OHS</span>
              </p>
            </div>

            {/* Marketplace Link Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={mpLinks.tokopedia}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/25 active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Beli di Tokopedia</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>

              <a
                href={mpLinks.shopee}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs transition shadow-lg shadow-orange-600/25 active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Cek Shopee</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Col: High-Impact Laptop Showcase Card */}
        <div className="lg:col-span-5">
          <div className="relative group rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-white/10 to-black/60 p-4 backdrop-blur-md shadow-2xl">
            {/* Promo Floating Badge */}
            <div className="absolute top-3 right-3 z-20">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/40 uppercase">
                Best Deal 2026
              </span>
            </div>

            {/* Laptop Product Image */}
            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black/60 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  laptop.imageUrl ||
                  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80'
                }
                alt={laptop.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10">
                  ⚡ 240Hz Nebula Display
                </span>
                <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-cyan-300 font-bold">
                  Skor Performa: 95/100
                </span>
              </div>
            </div>

            {/* Quick Feature Checklist */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-zinc-300 font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Liquid Metal Cooling</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">AI Noise Canceling</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">MUX Switch + Optimus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Fast Charge 50% 30 Min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
