'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { getLaptopImageUrl, formatRupiah, isNewLaptopArrival } from '@/lib/laptop-utils';
import { StaggerContainer, StaggerItem } from '@/components/ScrollReveal';
import {
  Zap,
  Search,
  Scale,
  Info,
  X,
  Heart,
  Star,
  ChevronDown,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import type { LaptopDetailItem } from '@/components/LaptopDetailModal';
import { useAuthPrompt } from '@/components/auth/AuthPromptModal';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

// Lazy load modals - only fetched when opened
const LaptopDetailModal = dynamic(() => import('@/components/LaptopDetailModal'), { ssr: false });
const LaptopCompareModal = dynamic(() => import('@/components/LaptopCompareModal'), { ssr: false });
const LaptopReviewModal = dynamic(() => import('@/components/LaptopReviewModal'), { ssr: false });

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
  createdAt?: string | Date;
  isNew?: boolean;
}

const BRANDS = [
  'Semua Merek',
  'Lenovo',
  'HP',
  'Dell',
  'Acer',
  'Microsoft',
  'ASUS',
  'Apple',
  'MSI',
  'Huawei',
  'Axioo',
  'ADVAN',
];

export default function LaptopCatalog({ laptops }: { laptops: LaptopCatalogItem[] }) {
  const { openAuthPrompt } = useAuthPrompt();
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);

  const [activeCategory, setActiveCategory] = useState<'all' | 'new' | 'gaming' | 'portable' | 'budget' | 'favorites'>('all');
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Semua Merek');
  const [priceRange, setPriceRange] = useState<'all' | 'under7' | '7to12' | '12to20' | 'above20'>('all');
  const [selectedCondition, setSelectedCondition] = useState<'all' | 'baru' | 'second'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'newest' | 'priceAsc' | 'priceDesc' | 'ramDesc' | 'batteryDesc' | 'weightAsc'>('recommended');

  // Favorites state
  const [favorites, setFavorites] = useState<number[]>([]);

  // Count new arrivals
  const newArrivalCount = useMemo(() => {
    return laptops.filter((l) => isNewLaptopArrival(l)).length;
  }, [laptops]);

  // Modals & Comparison State
  const [selectedDetailLaptop, setSelectedDetailLaptop] = useState<LaptopDetailItem | null>(null);
  const [comparingLaptops, setComparingLaptops] = useState<LaptopDetailItem[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [reviewTargetLaptop, setReviewTargetLaptop] = useState<{ id: number; name: string; brand: string } | null>(null);

  // Pagination / Performance optimization - render in chunks of 16
  const [visibleCount, setVisibleCount] = useState(16);
  const filterKey = `${activeCategory}_${search}_${selectedBrand}_${priceRange}_${selectedCondition}_${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(16);
  }

  // Fetch current user & load stored favorites
  useEffect(() => {
    try {
      const guestFavs = localStorage.getItem('lapmatch_guest_favorites');
      if (guestFavs) {
        setFavorites(JSON.parse(guestFavs));
      }
    } catch {}

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        setCurrentUser({ id: u.id, email: u.email });
        try {
          const stored = localStorage.getItem(`lapmatch_favs_${u.id}`);
          if (stored) {
            setFavorites(JSON.parse(stored));
          }
        } catch {}
      }
    });
  }, []);

  // Save favorites helper
  const handleToggleFavorite = (laptopId: number, laptopName: string) => {
    let updated: number[];
    if (favorites.includes(laptopId)) {
      updated = favorites.filter((id) => id !== laptopId);
      toast.success(`${laptopName} dihapus dari favorit`);
    } else {
      updated = [...favorites, laptopId];
      toast.success(`${laptopName} ditambahkan ke favorit!`);
    }
    setFavorites(updated);

    try {
      if (currentUser?.id) {
        localStorage.setItem(`lapmatch_favs_${currentUser.id}`, JSON.stringify(updated));
      } else {
        localStorage.setItem('lapmatch_guest_favorites', JSON.stringify(updated));
      }
    } catch {}
  };

  const handleOpenReview = (laptop: { id: number; name: string; brand: string }) => {
    if (!currentUser) {
      openAuthPrompt({
        title: 'Ulasan & Rating Laptop',
        message: 'Silakan masuk atau daftar terlebih dahulu untuk memberikan ulasan dan rating pada laptop ini.',
        featureName: 'Ulasan & Rating Laptop',
      });
      return;
    }
    setReviewTargetLaptop({ id: laptop.id, name: laptop.name, brand: laptop.brand });
  };

  // Filter and sorting logic
  const filteredAndSorted = useMemo(() => {
    return laptops
      .filter((laptop) => {
        // Category Filter
        if (activeCategory === 'new' && !isNewLaptopArrival(laptop)) return false;
        if (activeCategory === 'gaming') {
          const isGaming =
            (laptop.category && laptop.category.toLowerCase().includes('gaming')) ||
            (laptop.vgaScore ?? 0) >= 70 ||
            laptop.name.toLowerCase().includes('rtx') ||
            laptop.name.toLowerCase().includes('gtx') ||
            laptop.name.toLowerCase().includes('tuf') ||
            laptop.name.toLowerCase().includes('loq') ||
            laptop.name.toLowerCase().includes('legion') ||
            laptop.name.toLowerCase().includes('rog') ||
            laptop.name.toLowerCase().includes('nitro');
          if (!isGaming) return false;
        }
        if (activeCategory === 'portable') {
          const isPortable =
            (laptop.weightKg ?? 99) <= 1.5 ||
            (laptop.batteryHours ?? 0) >= 8 ||
            laptop.name.toLowerCase().includes('air') ||
            laptop.name.toLowerCase().includes('slim') ||
            laptop.name.toLowerCase().includes('zenbook') ||
            laptop.name.toLowerCase().includes('swift');
          if (!isPortable) return false;
        }
        if (activeCategory === 'budget') {
          if (Number(laptop.price) > 7000000) return false;
        }
        if (activeCategory === 'favorites') {
          if (!favorites.includes(laptop.id)) return false;
        }

        // Search Filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = laptop.name.toLowerCase().includes(q);
          const matchBrand = laptop.brand.toLowerCase().includes(q);
          const matchCategory = laptop.category?.toLowerCase().includes(q) ?? false;
          if (!matchName && !matchBrand && !matchCategory) return false;
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
        if (sortBy === 'newest') {
          const aNew = isNewLaptopArrival(a) ? 1 : 0;
          const bNew = isNewLaptopArrival(b) ? 1 : 0;
          if (bNew !== aNew) return bNew - aNew;
        }
        if (sortBy === 'priceAsc') return Number(a.price) - Number(b.price);
        if (sortBy === 'priceDesc') return Number(b.price) - Number(a.price);
        if (sortBy === 'ramDesc') return (b.ramGb ?? 0) - (a.ramGb ?? 0);
        if (sortBy === 'batteryDesc') return (b.batteryHours ?? 0) - (a.batteryHours ?? 0);
        if (sortBy === 'weightAsc') return (a.weightKg ?? 99) - (b.weightKg ?? 99);
        return (b.performaKomposit ?? 0) - (a.performaKomposit ?? 0);
      });
  }, [laptops, activeCategory, search, selectedBrand, priceRange, selectedCondition, sortBy, favorites]);

  const displayedLaptops = useMemo(() => {
    return filteredAndSorted.slice(0, visibleCount);
  }, [filteredAndSorted, visibleCount]);

  const handleToggleCompare = (laptop: LaptopCatalogItem | LaptopDetailItem) => {
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
    <div id="katalog" className="space-y-6 overflow-x-hidden">
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Katalog Laptop Terkini
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Eksplorasi Katalog &amp; Komparasi Laptop
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Jelajahi spesifikasi, filter harga &amp; performa, simpan favorit, atau bandingkan beberapa laptop sekaligus secara bebas.
          </p>
        </div>

        {/* Preset Category Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Semua ({laptops.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('new')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'new'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Baru Masuk ({newArrivalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('gaming')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeCategory === 'gaming'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            🎮 Gaming &amp; 3D
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('portable')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeCategory === 'portable'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            🎒 Portabel
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('budget')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeCategory === 'budget'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            💰 Budget &lt; 7Jt
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('favorites')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'favorites'
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                : 'text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeCategory === 'favorites' ? 'fill-rose-500' : ''}`} />
            <span>Favorit ({favorites.length})</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter & Search Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama laptop, tipe prosesor, atau model..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition min-h-[42px]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer min-h-[42px]"
            >
              {BRANDS.map((brand) => (
                <option key={brand} value={brand} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as 'all' | 'under7' | '7to12' | '12to20' | 'above20')}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer min-h-[42px]"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Semua Rentang Harga</option>
              <option value="under7" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">&lt; Rp 7 Juta</option>
              <option value="7to12" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Rp 7 - 12 Juta</option>
              <option value="12to20" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Rp 12 - 20 Juta</option>
              <option value="above20" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">&gt; Rp 20 Juta</option>
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value as 'all' | 'baru' | 'second')}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer min-h-[42px]"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Semua Kondisi</option>
              <option value="baru" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Baru Saja</option>
              <option value="second" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Second (Bekas)</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'recommended' | 'newest' | 'priceAsc' | 'priceDesc' | 'ramDesc' | 'batteryDesc' | 'weightAsc'
                )
              }
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer min-h-[42px]"
            >
              <option value="recommended" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Performa Terbaik</option>
              <option value="newest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">✨ Baru Masuk</option>
              <option value="priceAsc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Harga: Termurah</option>
              <option value="priceDesc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Harga: Tertinggi</option>
              <option value="ramDesc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">RAM: Terbesar</option>
              <option value="batteryDesc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Baterai: Terlama</option>
              <option value="weightAsc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Bobot: Teringan</option>
            </select>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-600 dark:text-slate-400">
            Menampilkan <strong className="text-slate-900 dark:text-white">{filteredAndSorted.length}</strong> dari{' '}
            {laptops.length} laptop tersedia
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition cursor-pointer"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Laptop Cards Grid: 1 col on mobile, 2 col on tablet, 3-4 col on desktop */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedLaptops.map((laptop, index) => {
          const imgUrl = getLaptopImageUrl(laptop.brand, laptop.name, laptop.imageUrl);
          const isComparing = comparingLaptops.some((l) => l.id === laptop.id);
          const isFav = favorites.includes(laptop.id);
          const isNew = isNewLaptopArrival(laptop);

          return (
            <StaggerItem
              key={laptop.id}
              direction={index % 3 === 0 ? 'right' : index % 3 === 1 ? 'up' : 'left'}
            >
            <div
              className={`group rounded-2xl bg-white dark:bg-slate-900 border overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md ${
                isComparing
                  ? 'border-blue-600 ring-2 ring-blue-500/30'
                  : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
                      {laptop.brand}
                    </span>
                    {isNew && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                        </span>
                        Baru
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                        laptop.condition === 'second'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {laptop.condition}
                    </span>
                    {laptop.performaKomposit && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {laptop.performaKomposit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Laptop Image with Heart Favorite Button */}
                <div className="relative w-full h-40 rounded-xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden flex items-center justify-center p-3 border border-slate-100 dark:border-slate-800">
                  {isNew && (
                    <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-emerald-600 text-white shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>Baru</span>
                    </div>
                  )}
                  <motion.img
                    onClick={() => setSelectedDetailLaptop(laptop as unknown as LaptopDetailItem)}
                    src={imgUrl}
                    alt={laptop.name}
                    className="max-h-full max-w-full object-contain cursor-pointer transition-transform duration-200"
                    loading="lazy"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                  />

                  {/* Favorite Heart Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(laptop.id, laptop.name)}
                    className={`absolute top-2 right-2 p-2 rounded-xl transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                      isFav
                        ? 'bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-800'
                        : 'bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-rose-500 border border-slate-200 dark:border-slate-700'
                    }`}
                    title={isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Title & Price */}
                <div className="space-y-1">
                  <h3
                    onClick={() => setSelectedDetailLaptop(laptop as unknown as LaptopDetailItem)}
                    className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    {laptop.name}
                  </h3>
                  <div className="text-base font-extrabold text-blue-700 dark:text-blue-400">
                    {formatRupiah(laptop.price)}
                  </div>
                </div>

                {/* Specs Pill Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">RAM</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{laptop.ramGb != null ? `${laptop.ramGb} GB` : 'Tersedia'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">SSD</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{laptop.storageGb != null ? `${laptop.storageGb} GB` : 'Tersedia'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Baterai</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{laptop.batteryHours != null ? `${laptop.batteryHours} Jam` : 'Standar'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Bobot</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{laptop.weightKg != null ? `${laptop.weightKg} kg` : 'Standar'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions - Consistent, Clear Buttons */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailLaptop(laptop as unknown as LaptopDetailItem)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer min-h-[38px]"
                  >
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Spek</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenReview(laptop)}
                    className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 text-slate-600 dark:text-slate-300 hover:text-amber-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition flex items-center gap-1 cursor-pointer min-h-[38px]"
                    title="Beri Ulasan atau Rating"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Ulas</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleCompare(laptop)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer min-h-[38px] ${
                      isComparing
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Scale className={`w-3.5 h-3.5 ${isComparing ? 'text-white' : 'text-blue-600'}`} />
                    <span>{isComparing ? 'Dipilih' : 'Bandingkan'}</span>
                  </button>

                  <a
                    href={`https://wa.me/6287851164239?text=${encodeURIComponent(`Halo, saya tertarik dengan laptop ${laptop.name} (${formatRupiah(laptop.price)}). Apakah masih tersedia?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title="Hubungi via WhatsApp"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Load More Pagination Button */}
      {visibleCount < filteredAndSorted.length && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => Math.min(prev + 16, filteredAndSorted.length))}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 min-h-[44px]"
          >
            <span>Muat Lebih Banyak (+16 Laptop)</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setVisibleCount(filteredAndSorted.length)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition cursor-pointer min-h-[44px]"
          >
            Tampilkan Semua ({filteredAndSorted.length})
          </button>
        </div>
      )}

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-slate-500 text-sm">Tidak ada laptop yang cocok dengan filter yang dipilih.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer min-h-[42px]"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Floating Comparison Action Bar */}
      <AnimatePresence>
        {comparingLaptops.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-slate-700 backdrop-blur-xl rounded-2xl p-3 px-5 shadow-xl flex items-center justify-between sm:justify-start gap-4 w-[calc(100vw-2rem)] sm:w-auto max-w-lg text-white"
          >
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-xs font-bold text-white">
                {comparingLaptops.length} Laptop Dipilih
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer min-h-[38px]"
            >
              Bandingkan Sekarang
            </button>
            <button
              type="button"
              onClick={() => setComparingLaptops([])}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              Batal
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
        isFavorite={selectedDetailLaptop ? favorites.includes(selectedDetailLaptop.id) : false}
        onToggleFavorite={(laptop) => handleToggleFavorite(laptop.id, laptop.name)}
        onOpenReview={(laptop) => handleOpenReview(laptop)}
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

      {/* Review Modal */}
      {reviewTargetLaptop && (
        <LaptopReviewModal
          laptop={reviewTargetLaptop}
          onClose={() => setReviewTargetLaptop(null)}
        />
      )}
    </div>
  );
}
