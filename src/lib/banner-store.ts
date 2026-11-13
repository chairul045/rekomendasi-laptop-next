// src/lib/banner-store.ts - Penyimpanan & Pengelolaan Iklan Slider Dashboard (PostgreSQL via Prisma)
import prisma from '@/lib/prisma';
import type { Banner, Prisma } from '@prisma/client';

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

export const DEFAULT_BANNERS: BannerAd[] = [
  {
    id: 'banner-1',
    title: 'Lenovo ThinkPad X13 - AMD Ryzen 5 PRO + 16GB RAM Bisnis Tangguh',
    brand: 'LaptopSeber Palembang',
    subtitle:
      'Unit second berkualitas tinggi lolos uji QC 30+ titik bergaransi resmi toko LaptopSeber Palembang. Bodi magnesium kokoh standar militer, ringan dan kencang untuk kerja & skripsi.',
    price: 5850000,
    originalPrice: 6500000,
    discount: 'Hemat 10%',
    badge: '🔥 Rekomendasi Utama LaptopSeber',
    processor: 'AMD Ryzen 5 PRO 4650U (6 Cores, 12 Threads)',
    vga: 'AMD Radeon Graphics',
    ramGb: 16,
    storageGb: 256,
    display: '13.3" FHD IPS Anti-Glare',
    imageUrl: '/images/laptops/laptopseber/thinkpad-x13-ryzen-5.jpg',
    tokopediaUrl: 'https://laptopseber.com/produk/thinkpad-x13-ryzen-5',
    shopeeUrl: 'https://s.shopee.co.id/5q720d2v3A?share_channel_code=1',
    isActive: true,
    sortOrder: 1,
    createdAt: '2026-11-07T12:00:00.000Z',
  },
  {
    id: 'banner-2',
    title: 'HP Elitebook 840 G8 - Intel Core i5 Slim Aluminium Elegan & Bertenaga',
    brand: 'LaptopSeber Palembang',
    subtitle:
      'Laptop second kelas enterprise bodi aluminium presisi dari LaptopSeber Palembang. Desain mewah, keyboard empuk ternyaman, performa responsif bergaransi toko.',
    price: 5350000,
    originalPrice: 6000000,
    discount: 'Hemat 11%',
    badge: '⭐ Pilihan Terbaik Bisnis & Kuliah',
    processor: 'Intel Core i5 (Quad-Core 8 Threads)',
    vga: 'Intel Iris / UHD Graphics',
    ramGb: 8,
    storageGb: 256,
    display: '14.0" FHD IPS Micro-Edge Display',
    imageUrl: '/images/laptops/laptopseber/hp-elitebook-840-g7.jpg',
    tokopediaUrl: 'https://laptopseber.com/produk/hp-elitebook-840-g7',
    shopeeUrl: 'https://s.shopee.co.id/5q720d2v3A?share_channel_code=1',
    isActive: true,
    sortOrder: 2,
    createdAt: '2026-11-07T12:00:00.000Z',
  },
  {
    id: 'banner-3',
    title: 'Lenovo ThinkPad L13 Yoga - Layar Sentuh Flip 360° + Intel Core i5',
    brand: 'LaptopSeber Palembang',
    subtitle:
      'Bisa mode laptop dan tablet fleksibel. Sangat praktis untuk presentasi, membuat catatan kuliah, dan multitasking dengan jaminan garansi LaptopSeber Palembang.',
    price: 5850000,
    originalPrice: 6500000,
    discount: 'Hemat 10%',
    badge: '✨ 2-in-1 Touchscreen Multiguna',
    processor: 'Intel Core i5 Turbo Boost',
    vga: 'Intel UHD Graphics 620',
    ramGb: 8,
    storageGb: 256,
    display: '13.3" FHD Touchscreen IPS 360°',
    imageUrl: '/images/laptops/laptopseber/lenovo-thinkpad-l13-yoga.jpg',
    tokopediaUrl: 'https://laptopseber.com/produk/lenovo-thinkpad-l13-yoga',
    shopeeUrl: 'https://s.shopee.co.id/5q720d2v3A?share_channel_code=1',
    isActive: true,
    sortOrder: 3,
    createdAt: '2026-11-07T12:00:00.000Z',
  },
  {
    id: 'banner-4',
    title: 'DELL LATITUDE 3390 2-in-1 - Touchscreen Fleksibel & Intel Core i5',
    brand: 'LaptopSeber Palembang',
    subtitle:
      'Layar lipat 360 derajat responsif, performa kencang dengan SSD NVMe, bodi kokoh khas seri Latitude. Solusi laptop fleksibel berkualitas dari LaptopSeber.',
    price: 5450000,
    originalPrice: 6200000,
    discount: 'Hemat 12%',
    badge: '💡 Best Value Touchscreen',
    processor: 'Intel Core i5 Quad-Core',
    vga: 'Intel UHD Graphics',
    ramGb: 8,
    storageGb: 256,
    display: '13.3" FHD IPS Touchscreen 360°',
    imageUrl: '/images/laptops/laptopseber/dell-latitude-3390-2-in-1.jpg',
    tokopediaUrl: 'https://laptopseber.com/produk/dell-latitude-3390-2-in-1',
    shopeeUrl: 'https://s.shopee.co.id/5q720d2v3A?share_channel_code=1',
    isActive: true,
    sortOrder: 4,
    createdAt: '2026-11-07T12:00:00.000Z',
  },
  {
    id: 'banner-5',
    title: 'LaptopSeber Care: Pusat Servis, Reparasi & Upgrade Laptop Palembang',
    brand: 'LaptopSeber Palembang',
    subtitle:
      'Laptop mati total, layar bergaris, panas berisik, atau lemot? Teknisi berpengalaman siap melayani perbaikan hardware, ganti sparepart original, serta tracking servis online.',
    price: 50000,
    originalPrice: 100000,
    discount: 'Cek Kerusakan',
    badge: '🛠️ Pusat Servis Resmi LaptopSeber',
    processor: 'Teknisi Handal & Profesional',
    vga: 'Mendukung ThinkPad, HP, Dell, Asus, Acer, MacBook',
    ramGb: 16,
    storageGb: 512,
    display: 'DC Kuliner Pakjo, Kota Palembang',
    imageUrl: '/images/laptops/laptopseber/lenovo-thinkpad-t480.jpg',
    tokopediaUrl: '/service-laptop',
    shopeeUrl: '/service-laptop',
    isActive: true,
    sortOrder: 5,
    createdAt: '2026-11-07T12:00:00.000Z',
  },
];

// Fallback in-memory state for local testing or when database migration is pending
let memoryBanners: BannerAd[] = [...DEFAULT_BANNERS];

function toBannerAd(b: Banner | BannerAd): BannerAd {
  return {
    id: String(b.id),
    title: b.title,
    brand: b.brand,
    subtitle: b.subtitle,
    price: Number(b.price),
    originalPrice: Number(b.originalPrice),
    discount: b.discount ?? '',
    badge: b.badge ?? '',
    processor: b.processor ?? '',
    vga: b.vga ?? '',
    ramGb: Number(b.ramGb) || 0,
    storageGb: Number(b.storageGb) || 0,
    display: b.display ?? '',
    imageUrl: b.imageUrl,
    tokopediaUrl: b.tokopediaUrl ?? undefined,
    shopeeUrl: b.shopeeUrl ?? undefined,
    isActive: Boolean(b.isActive),
    sortOrder: Number(b.sortOrder) || 0,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt),
  };
}

export async function getAllBanners(): Promise<BannerAd[]> {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    if (banners.length > 0) {
      return banners.map(toBannerAd);
    }
    // Return memory banners if table is empty
    return memoryBanners.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (err) {
    console.warn('PostgreSQL banner fetch fallback to in-memory:', err);
    return memoryBanners.sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

export async function getActiveBanners(): Promise<BannerAd[]> {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (banners.length > 0) {
      return banners.map(toBannerAd);
    }
    return memoryBanners.filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (err) {
    console.warn('PostgreSQL active banner fetch fallback to in-memory:', err);
    return memoryBanners.filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

export async function addBanner(data: Omit<BannerAd, 'id' | 'createdAt'>): Promise<BannerAd> {
  try {
    const created = await prisma.banner.create({
      data: {
        title: data.title,
        brand: data.brand,
        subtitle: data.subtitle,
        price: BigInt(Math.round(data.price)),
        originalPrice: BigInt(Math.round(data.originalPrice)),
        discount: data.discount ?? '',
        badge: data.badge ?? '',
        processor: data.processor ?? '',
        vga: data.vga ?? '',
        ramGb: Number(data.ramGb) || 0,
        storageGb: Number(data.storageGb) || 0,
        display: data.display ?? '',
        imageUrl: data.imageUrl,
        tokopediaUrl: data.tokopediaUrl || null,
        shopeeUrl: data.shopeeUrl || null,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
    const result = toBannerAd(created);
    memoryBanners.push(result);
    return result;
  } catch (err) {
    console.error('Database addBanner error:', err);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Gagal menyimpan banner ke database PostgreSQL.');
    }
    const newBanner: BannerAd = {
      ...data,
      id: `banner-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    memoryBanners.push(newBanner);
    return newBanner;
  }
}

export async function updateBanner(
  id: string,
  updates: Partial<BannerAd>
): Promise<BannerAd | null> {
  try {
    const dataToUpdate: Prisma.BannerUpdateInput = {};
    if (updates.title !== undefined) dataToUpdate.title = updates.title;
    if (updates.brand !== undefined) dataToUpdate.brand = updates.brand;
    if (updates.subtitle !== undefined) dataToUpdate.subtitle = updates.subtitle;
    if (updates.price !== undefined) dataToUpdate.price = BigInt(Math.round(updates.price));
    if (updates.originalPrice !== undefined)
      dataToUpdate.originalPrice = BigInt(Math.round(updates.originalPrice));
    if (updates.discount !== undefined) dataToUpdate.discount = updates.discount;
    if (updates.badge !== undefined) dataToUpdate.badge = updates.badge;
    if (updates.processor !== undefined) dataToUpdate.processor = updates.processor;
    if (updates.vga !== undefined) dataToUpdate.vga = updates.vga;
    if (updates.ramGb !== undefined) dataToUpdate.ramGb = Number(updates.ramGb);
    if (updates.storageGb !== undefined) dataToUpdate.storageGb = Number(updates.storageGb);
    if (updates.display !== undefined) dataToUpdate.display = updates.display;
    if (updates.imageUrl !== undefined) dataToUpdate.imageUrl = updates.imageUrl;
    if (updates.tokopediaUrl !== undefined) dataToUpdate.tokopediaUrl = updates.tokopediaUrl || null;
    if (updates.shopeeUrl !== undefined) dataToUpdate.shopeeUrl = updates.shopeeUrl || null;
    if (updates.isActive !== undefined) dataToUpdate.isActive = updates.isActive;
    if (updates.sortOrder !== undefined) dataToUpdate.sortOrder = Number(updates.sortOrder);

    const updated = await prisma.banner.update({
      where: { id },
      data: dataToUpdate,
    });
    const result = toBannerAd(updated);
    const idx = memoryBanners.findIndex((b) => b.id === id);
    if (idx !== -1) memoryBanners[idx] = result;
    return result;
  } catch (err) {
    console.error('Database updateBanner error:', err);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Gagal memperbarui banner di database PostgreSQL.');
    }
    const idx = memoryBanners.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    memoryBanners[idx] = { ...memoryBanners[idx], ...updates };
    return memoryBanners[idx];
  }
}

export async function deleteBanner(id: string): Promise<boolean> {
  try {
    await prisma.banner.delete({
      where: { id },
    });
    memoryBanners = memoryBanners.filter((b) => b.id !== id);
    return true;
  } catch (err) {
    console.error('Database deleteBanner error:', err);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Gagal menghapus banner dari database PostgreSQL.');
    }
    const lenBefore = memoryBanners.length;
    memoryBanners = memoryBanners.filter((b) => b.id !== id);
    return memoryBanners.length !== lenBefore;
  }
}

export async function toggleBannerStatus(id: string): Promise<BannerAd | null> {
  try {
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Banner tidak ditemukan di database.');
      }
      const mem = memoryBanners.find((b) => b.id === id);
      if (!mem) return null;
      mem.isActive = !mem.isActive;
      return mem;
    }
    const updated = await prisma.banner.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    const result = toBannerAd(updated);
    const idx = memoryBanners.findIndex((b) => b.id === id);
    if (idx !== -1) memoryBanners[idx] = result;
    return result;
  } catch (err) {
    console.error('Database toggleBannerStatus error:', err);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Gagal mengubah status banner di database PostgreSQL.');
    }
    const mem = memoryBanners.find((b) => b.id === id);
    if (!mem) return null;
    mem.isActive = !mem.isActive;
    return mem;
  }
}
