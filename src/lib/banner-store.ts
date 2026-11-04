// src/lib/banner-store.ts - Penyimpanan & Pengelolaan Iklan Slider Dashboard
import fs from 'fs';
import path from 'path';

export interface BannerAd {
  id: string;
  title: string;
  brand: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  discount: string;
  badge: string;
  processor: string;
  vga: string;
  ramGb: number;
  storageGb: number;
  display: string;
  imageUrl: string;
  tokopediaUrl?: string;
  shopeeUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
}

const DEFAULT_BANNERS: BannerAd[] = [
  {
    id: 'banner-1',
    title: 'ASUS ROG STRIX G16 AI - Ryzen 9 7845HX + RTX 4070 8GB',
    brand: 'ASUS',
    subtitle: 'Monster performa generasi terkini dengan pendingin Liquid Metal. Siap libas komputasi teknik, rendering 3D, dan gaming rata kanan.',
    price: 25999000,
    originalPrice: 28999000,
    discount: 'Hemat 10%',
    badge: '🔥 Flagship Terlaris 2026',
    processor: 'AMD Ryzen 9 7845HX (16 Cores, 5.4GHz Max)',
    vga: 'NVIDIA GeForce RTX 4070 8GB GDDR6 (140W TGP)',
    ramGb: 32,
    storageGb: 1000,
    display: '16" QHD+ 240Hz 3ms 100% DCI-P3 Nebula Display',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    tokopediaUrl: 'https://www.tokopedia.com/search?q=asus+rog+strix+g16',
    shopeeUrl: 'https://shopee.co.id/search?keyword=asus+rog+strix+g16',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'banner-2',
    title: 'Apple MacBook Air M3 15-inch - Layar Liquid Retina & 18 Jam Baterai',
    brand: 'Apple',
    subtitle: 'Desain ultra-tipis tanpa kipas yang senyap dengan efisiensi energi luar biasa. Standar emas laptop produktivitas mahasiswa dan profesional modern.',
    price: 19499000,
    originalPrice: 21999000,
    discount: 'Hemat 11%',
    badge: '✨ Pilihan Terbaik Desain & Kuliah',
    processor: 'Apple M3 Chip (8-Core CPU, 10-Core GPU, 16-Core Neural Engine)',
    vga: 'Apple 10-Core Integrated GPU with Hardware Ray Tracing',
    ramGb: 16,
    storageGb: 512,
    display: '15.3" Liquid Retina True Tone (500 nits, P3 Wide Color)',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    tokopediaUrl: 'https://www.tokopedia.com/search?q=macbook+air+m3',
    shopeeUrl: 'https://shopee.co.id/search?keyword=macbook+air+m3',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'banner-3',
    title: 'Lenovo Legion Pro 5i AI - Intel Core i7 14700HX + RTX 4060',
    brand: 'Lenovo',
    subtitle: 'Laptop bertenaga Lenovo AI Engine+ dengan keyboard TrueStrike legendaris. Kombinasi harga dan performa paling rasional tahun ini.',
    price: 22499000,
    originalPrice: 24999000,
    discount: 'Hemat 10%',
    badge: '⚡ Best Price to Performance',
    processor: 'Intel Core i7-14700HX (20 Cores, 28 Threads)',
    vga: 'NVIDIA GeForce RTX 4060 8GB GDDR6 (140W TGP)',
    ramGb: 16,
    storageGb: 1000,
    display: '16" WQXGA 240Hz 500 nits 100% sRGB HDR400',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    tokopediaUrl: 'https://www.tokopedia.com/search?q=lenovo+legion+pro+5i',
    shopeeUrl: 'https://shopee.co.id/search?keyword=lenovo+legion+pro+5i',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'banner-4',
    title: 'Lapmatch Care: Promo Servis & Upgrade SSD RAM Laptop Mahasiswa',
    brand: 'Lapmatch Care',
    subtitle: 'Laptop lemot, panas berlebih, atau mati total? Konsultasikan kerusakan gratis dan nikmati diskon servis kilat bergaransi 90 hari.',
    price: 75000,
    originalPrice: 150000,
    discount: 'Diskon 50%',
    badge: '🛠️ Layanan Servis Resmi',
    processor: 'Semua Merek: ASUS, Lenovo, Acer, HP, Apple, MSI, Dell',
    vga: 'Teknisi Tersertifikasi & Sparepart Original Bergaransi',
    ramGb: 16,
    storageGb: 512,
    display: 'Diagnosa Kerusakan Cepat & Bisa Ditengok',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
    tokopediaUrl: '/service-laptop',
    shopeeUrl: '/service-laptop',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
  },
];

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'banners.json');

// Memory cache fallback in case file system has temporary read/write restrictions
let memoryBanners: BannerAd[] = [...DEFAULT_BANNERS];

function ensureFileExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_BANNERS, null, 2), 'utf-8');
      memoryBanners = [...DEFAULT_BANNERS];
    }
  } catch (err) {
    console.warn('Banner store file init notice:', err);
  }
}

export function getAllBanners(): BannerAd[] {
  ensureFileExists();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryBanners = parsed;
        return parsed.sort((a, b) => a.sortOrder - b.sortOrder);
      }
    }
  } catch (err) {
    console.warn('Error reading banners.json, falling back to cache:', err);
  }
  return memoryBanners.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getActiveBanners(): BannerAd[] {
  return getAllBanners().filter((b) => b.isActive);
}

export function saveAllBanners(banners: BannerAd[]): boolean {
  ensureFileExists();
  memoryBanners = [...banners];
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(banners, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing banners.json:', err);
    return false;
  }
}

export function addBanner(data: Omit<BannerAd, 'id' | 'createdAt'>): BannerAd {
  const banners = getAllBanners();
  const newBanner: BannerAd = {
    ...data,
    id: `banner-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  banners.push(newBanner);
  saveAllBanners(banners);
  return newBanner;
}

export function updateBanner(id: string, updates: Partial<BannerAd>): BannerAd | null {
  const banners = getAllBanners();
  const index = banners.findIndex((b) => b.id === id);
  if (index === -1) return null;

  banners[index] = { ...banners[index], ...updates };
  saveAllBanners(banners);
  return banners[index];
}

export function deleteBanner(id: string): boolean {
  const banners = getAllBanners();
  const filtered = banners.filter((b) => b.id !== id);
  if (filtered.length === banners.length) return false;
  saveAllBanners(filtered);
  return true;
}

export function toggleBannerStatus(id: string): BannerAd | null {
  const banners = getAllBanners();
  const item = banners.find((b) => b.id === id);
  if (!item) return null;
  item.isActive = !item.isActive;
  saveAllBanners(banners);
  return item;
}
