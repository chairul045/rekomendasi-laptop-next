'use client';

import { useState, useMemo } from 'react';
import { getLaptopImageUrl, formatRupiah, getMarketplaceLinks } from '@/lib/laptop-utils';
import {
  Zap,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  Scale,
  Info,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import LaptopDetailModal, { LaptopDetailItem } from '@/components/LaptopDetailModal';
import LaptopCompareModal from '@/components/LaptopCompareModal';
import toast from 'react-hot-toast';

export interface LaptopCatalogItem {
  id: number;
  name: string;
  brand: string;
  price: string | number;
  ramGb: number | null;
  storageGb: number | null;
  batteryHours: number | null;
  weightKg: number | null;
  performaKomposit: number | null;
  processorScore?: number | null;
  vgaScore?: number | null;
  displaySize?: number | null;
  mobilityScore?: number | null;
  condition: string;
  category: string | null;
  imageUrl: string | null;
}

const BRANDS = [
  'Semua Merek',
  'ASUS',
  'Lenovo',
  'HP',
  'Acer',
  'Apple',
  'MSI',
  'Dell',
  'Huawei',
  'Axioo',
  'ADVAN',
];

export default function LaptopCatalog({ laptops }: { laptops: LaptopCatalogItem[] }) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'gaming' | 'portable' | 'budget'>('all');
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Semua Merek');
  const [priceRange, setPriceRange] = useState<'all' | 'under7' | '7to12' | '12to20' | 'above20'>('all');
  const [selectedCondition, setSelectedCondition] = useState<'all' | 'baru' | 'second'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'priceAsc' | 'priceDesc' | 'ramDesc' | 'batteryDesc' | 'weightAsc'>('recommended');

  // Modals & Comparison State
  const [selectedDetailLaptop, setSelectedDetailLaptop] = useState<LaptopDetailItem | null>(null);
  const [comparingLaptops, setComparingLaptops] = useState<LaptopDetailItem[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Filter & Sort calculation
  const filteredAndSorted = useMemo(() => {
    return laptops
      .filter((laptop) => {
        // Category Tab Filter
        if (activeCategory === 'gaming') {
          const name = laptop.name.toLowerCase();
          const cat = (laptop.category ?? '').toLowerCase();
          const isGaming =
            cat.includes('gaming') ||
            name.includes('gaming') ||
            name.includes('tuf') ||
            name.includes('rog') ||
            name.includes('nitro') ||
            name.includes('victus') ||
            name.includes('legion') ||
            name.includes('predator') ||
            (laptop.performaKomposit ?? 0) >= 80;
          if (!isGaming) return false;
        } else if (activeCategory === 'portable') {
          const isPortable =
            (laptop.weightKg && laptop.weightKg <= 1.5) ||
            (laptop.batteryHours && laptop.batteryHours >= 10);
          if (!isPortable) return false;
        } else if (activeCategory === 'budget') {
          if (Number(laptop.price) > 7000000) return false;
        }

        // Search Filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = laptop.name.toLowerCase().includes(q);
          const matchBrand = laptop.brand.toLowerCase().includes(q);
          const matchCat = (laptop.category ?? '').toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchCat) return false;
        }

        // Brand Filter
        if (selectedBrand !== 'Semua Merek') {
          if (laptop.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
        }

        // Price Range Filter
        const p = Number(laptop.price);
        if (priceRange === 'under7' && p > 7000000) return false;
        if (priceRange === '7to12' && (p < 7000000 || p > 12000000)) return false;
        if (priceRange === '12to20' && (p < 12000000 || p > 20000000)) return false;
        if (priceRange === 'above20' && p < 20000000) return false;

        // Condition Filter
        if (selectedCondition !== 'all') {
          if (laptop.condition.toLowerCase() !== selectedCondition.toLowerCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return Number(a.price) - Number(b.price);
        if (sortBy === 'priceDesc') return Number(b.price) - Number(a.price);
        if (sortBy === 'ramDesc') return (b.ramGb ?? 0) - (a.ramGb ?? 0);
        if (sortBy === 'batteryDesc') return (b.batteryHours ?? 0) - (a.batteryHours ?? 0);
        if (sortBy === 'weightAsc') return (a.weightKg ?? 99) - (b.weightKg ?? 99);
        // Default recommended: by performance score desc, then price asc
        return (b.performaKomposit ?? 0) - (a.performaKomposit ?? 0);
      });
  }, [laptops, activeCategory, search, selectedBrand, priceRange, selectedCondition, sortBy]);

  const handleToggleCompare = (laptop: LaptopCatalogItem) => {
    const exists = comparingLaptops.some((l) => l.id === laptop.id);
    if (exists) {
      setComparingLaptops(comparingLaptops.filter((l) => l.id !== laptop.id));
      toast('Laptop dihapus dari komparasi', { icon: '🗑️' });
    } else {
      if (comparingLaptops.length >= 4) {
        toast.error('Maksimal komparasi 4 laptop sekaligus.');
        return;
      }
      setComparingLaptops([...comparingLaptops, laptop as unknown as LaptopDetailItem]);
      toast.success(`${laptop.name} ditambahkan ke komparasi`);
    }
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearch('');
    setSelectedBrand('Semua Merek');
    setPriceRange('all');
    setSelectedCondition('all');
    setSortBy('recommended');
  };

  const hasActiveFilters =
    activeCategory !== 'all' ||
    search !== '' ||
    selectedBrand !== 'Semua Merek' ||
    priceRange !== 'all' ||
    selectedCondition !== 'all' ||
    sortBy !== 'recommended';

  return (
    <div className="space-y-6">
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-950/50 text-cyan-300 border border-cyan-800/60 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Katalog Laptop Terkini
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Eksplorasi Katalog & Perbandingan Laptop
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Gunakan filter cerdas untuk menemukan spesifikasi ideal atau pilih beberapa laptop untuk dibandingkan.
          </p>
        </div>

        {/* Preset Category Switcher */}
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
            🎒 Portabel
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
            💰 Budget &lt; 7Jt
          </button>
        </div>
      </div>

      {/* Advanced Filter & Search Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0e0e15]/90 border border-white/10 backdrop-blur-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama laptop, tipe prosesor, atau model..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 transition cursor-pointer"
            >
              {BRANDS.map((b) => (
                <option key={b} value={b} className="bg-zinc-950 text-white">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value as typeof selectedCondition)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 transition cursor-pointer"
            >
              <option value="all" className="bg-zinc-950 text-white">Baru &amp; Second</option>
              <option value="baru" className="bg-zinc-950 text-white">✨ Laptop Baru</option>
              <option value="second" className="bg-zinc-950 text-white">♻️ Laptop Second</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 transition cursor-pointer"
            >
              <option value="all" className="bg-zinc-950 text-white">Semua Rentang Harga</option>
              <option value="under7" className="bg-zinc-950 text-white">&lt; Rp 7 Juta</option>
              <option value="7to12" className="bg-zinc-950 text-white">Rp 7 - 12 Juta</option>
              <option value="12to20" className="bg-zinc-950 text-white">Rp 12 - 20 Juta</option>
              <option value="above20" className="bg-zinc-950 text-white">&gt; Rp 20 Juta</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 transition cursor-pointer"
            >
              <option value="recommended" className="bg-zinc-950 text-white">Urut: Rekomendasi</option>
              <option value="priceAsc" className="bg-zinc-950 text-white">Harga: Termurah</option>
              <option value="priceDesc" className="bg-zinc-950 text-white">Harga: Tertinggi</option>
              <option value="ramDesc" className="bg-zinc-950 text-white">RAM: Terbesar</option>
              <option value="batteryDesc" className="bg-zinc-950 text-white">Baterai: Terlama</option>
              <option value="weightAsc" className="bg-zinc-950 text-white">Bobot: Teringan</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges & Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
          <div className="text-zinc-400 font-mono text-[11px] flex items-center gap-1.5">
            <span>Ditemukan:</span>
            <span className="text-cyan-300 font-bold">{filteredAndSorted.length}</span>
            <span>dari {laptops.length} laptop</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-mono transition cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Laptop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAndSorted.map((laptop) => {
          const imgUrl = getLaptopImageUrl(laptop.brand, laptop.name, laptop.imageUrl);
          const links = getMarketplaceLinks(laptop.brand, laptop.name);
          const isComparing = comparingLaptops.some((c) => c.id === laptop.id);

          return (
            <div
              key={laptop.id}
              className={`rounded-3xl bg-[#0e0e15]/90 border transition-all duration-300 overflow-hidden backdrop-blur-xl flex flex-col justify-between shadow-lg group hover:border-violet-500/50 hover:shadow-2xl ${
                isComparing ? 'border-cyan-500/60 ring-1 ring-cyan-500/30' : 'border-white/10'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase">
                    {laptop.brand}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-md capitalize font-bold ${
                        laptop.condition === 'second'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {laptop.condition}
                    </span>
                    {laptop.performaKomposit && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-cyan-300 border border-white/5 font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        {laptop.performaKomposit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Laptop Image */}
                <div
                  onClick={() => setSelectedDetailLaptop(laptop as unknown as LaptopDetailItem)}
                  className="w-full h-40 rounded-2xl bg-zinc-950 overflow-hidden flex items-center justify-center p-3 border border-white/5 group-hover:border-violet-500/30 transition cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={laptop.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Title & Price */}
                <div className="space-y-1">
                  <h3
                    onClick={() => setSelectedDetailLaptop(laptop as unknown as LaptopDetailItem)}
                    className="font-bold text-sm text-white line-clamp-2 leading-snug cursor-pointer group-hover:text-cyan-300 transition"
                  >
                    {laptop.name}
                  </h3>
                  <div className="text-base font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                    {formatRupiah(laptop.price)}
                  </div>
                </div>

                {/* Specs Pill Summary */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-white/5">
                    <span className="text-[9px] text-zinc-500 block font-mono">RAM</span>
                    <span className="font-bold text-zinc-200">{laptop.ramGb ?? '—'} GB</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-white/5">
                    <span className="text-[9px] text-zinc-500 block font-mono">SSD</span>
                    <span className="font-bold text-zinc-200">{laptop.storageGb ?? '—'} GB</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-white/5">
                    <span className="text-[9px] text-zinc-500 block font-mono">Baterai</span>
                    <span className="font-bold text-zinc-200">{laptop.batteryHours ?? '—'} Jam</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-white/5">
                    <span className="text-[9px] text-zinc-500 block font-mono">Bobot</span>
                    <span className="font-bold text-zinc-200">{laptop.weightKg ?? '—'} kg</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-zinc-950/60 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDetailLaptop(laptop as unknown as LaptopDetailItem)}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3 h-3 text-cyan-400" />
                  <span>Spek</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleCompare(laptop)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition flex items-center gap-1 cursor-pointer ${
                    isComparing
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10'
                  }`}
                >
                  <Scale className="w-3 h-3 text-violet-400" />
                  <span>{isComparing ? 'Dipilih' : 'Bandingkan'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={links.shopee}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl bg-orange-950/40 text-orange-300 hover:bg-orange-900/60 border border-orange-800/40 transition"
                    title="Cek di Shopee"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={links.tokopedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/40 transition"
                    title="Cek di Tokopedia"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-16 rounded-3xl bg-[#0e0e15]/80 border border-white/10 space-y-3">
          <p className="text-zinc-400 text-sm">Tidak ada laptop yang cocok dengan filter yang dipilih.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Floating Comparison Action Bar */}
      {comparingLaptops.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0e0e15]/95 border border-white/20 backdrop-blur-2xl rounded-2xl p-3 px-5 shadow-2xl flex items-center gap-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-300" />
            <span className="text-xs font-bold text-white">
              {comparingLaptops.length} Laptop Dipilih
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCompareModal(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition shadow-md"
          >
            Bandingkan Sekarang
          </button>
          <button
            type="button"
            onClick={() => setComparingLaptops([])}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Batal
          </button>
        </div>
      )}

      {/* Laptop Detail Modal */}
      <LaptopDetailModal
        laptop={selectedDetailLaptop}
        onClose={() => setSelectedDetailLaptop(null)}
        onCompare={(laptop) => {
          handleToggleCompare(laptop as unknown as LaptopCatalogItem);
          setSelectedDetailLaptop(null);
        }}
        isComparing={
          selectedDetailLaptop
            ? comparingLaptops.some((c) => c.id === selectedDetailLaptop.id)
            : false
        }
      />

      {/* Laptop Compare Modal */}
      {showCompareModal && (
        <LaptopCompareModal
          laptops={comparingLaptops}
          onClose={() => setShowCompareModal(false)}
          onRemove={(id) => setComparingLaptops(comparingLaptops.filter((l) => l.id !== id))}
          onClear={() => setComparingLaptops([])}
        />
      )}
    </div>
  );
}
