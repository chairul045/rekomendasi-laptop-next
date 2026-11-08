// scripts/seed-fase2.ts - Seeding Banner & Review ke PostgreSQL
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing in environment or .env.local');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEFAULT_BANNERS = [
  {
    title: 'ASUS ROG STRIX G16 AI - Ryzen 9 7845HX + RTX 4070 8GB',
    brand: 'ASUS',
    subtitle:
      'Monster performa generasi terkini dengan pendingin Liquid Metal. Siap libas komputasi teknik, rendering 3D, dan gaming rata kanan.',
    price: BigInt(25999000),
    originalPrice: BigInt(28999000),
    discount: 'Hemat 10%',
    badge: '🔥 Flagship Terlaris 2026',
    processor: 'AMD Ryzen 9 7845HX (16 Cores, 5.4GHz Max)',
    vga: 'NVIDIA GeForce RTX 4070 8GB GDDR6 (140W TGP)',
    ramGb: 32,
    storageGb: 1000,
    display: '16" QHD+ 240Hz 3ms 100% DCI-P3 Nebula Display',
    imageUrl:
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    tokopediaUrl: 'https://www.tokopedia.com/search?q=asus+rog+strix+g16',
    shopeeUrl: 'https://shopee.co.id/search?keyword=asus+rog+strix+g16',
    isActive: true,
    sortOrder: 1,
  },
  {
    title: 'Apple MacBook Air M3 15-inch - Layar Liquid Retina & 18 Jam Baterai',
    brand: 'Apple',
    subtitle:
      'Desain ultra-tipis tanpa kipas yang senyap dengan efisiensi energi luar biasa. Standar emas laptop produktivitas mahasiswa dan profesional modern.',
    price: BigInt(19499000),
    originalPrice: BigInt(21999000),
    discount: 'Hemat 11%',
    badge: '✨ Pilihan Terbaik Desain & Kuliah',
    processor: 'Apple M3 Chip (8-Core CPU, 10-Core GPU, 16-Core Neural Engine)',
    vga: 'Apple 10-Core Integrated GPU with Hardware Ray Tracing',
    ramGb: 16,
    storageGb: 512,
    display: '15.3" Liquid Retina True Tone (500 nits, P3 Wide Color)',
    imageUrl:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    tokopediaUrl: 'https://www.tokopedia.com/search?q=macbook+air+m3',
    shopeeUrl: 'https://shopee.co.id/search?keyword=macbook+air+m3',
    isActive: true,
    sortOrder: 2,
  },
  {
    title: 'Lenovo Legion Pro 5i AI - Intel Core i7 14700HX + RTX 4060',
    brand: 'Lenovo',
    subtitle:
      'Laptop bertenaga Lenovo AI Engine+ dengan keyboard TrueStrike legendaris. Kombinasi harga dan performa paling rasional tahun ini.',
    price: BigInt(22499000),
    originalPrice: BigInt(24999000),
    discount: 'Hemat 10%',
    badge: '⚡ Best Price to Performance',
    processor: 'Intel Core i7-14700HX (20 Cores, 28 Threads)',
    vga: 'NVIDIA GeForce RTX 4060 8GB GDDR6 (140W TGP)',
    ramGb: 16,
    storageGb: 1000,
    display: '16" WQXGA 240Hz 500 nits 100% sRGB HDR400',
    imageUrl:
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    tokopediaUrl: 'https://www.tokopedia.com/search?q=lenovo+legion+pro+5i',
    shopeeUrl: 'https://shopee.co.id/search?keyword=lenovo+legion+pro+5i',
    isActive: true,
    sortOrder: 3,
  },
  {
    title: 'Lapmatch Care: Promo Servis & Upgrade SSD RAM Laptop Mahasiswa',
    brand: 'Lapmatch Care',
    subtitle:
      'Laptop lemot, panas berlebih, atau mati total? Konsultasikan kerusakan gratis dan nikmati diskon servis kilat bergaransi 90 hari.',
    price: BigInt(75000),
    originalPrice: BigInt(150000),
    discount: 'Diskon 50%',
    badge: '🛠️ Layanan Servis Resmi',
    processor: 'Semua Merek: ASUS, Lenovo, Acer, HP, Apple, MSI, Dell',
    vga: 'Teknisi Tersertifikasi & Sparepart Original Bergaransi',
    ramGb: 16,
    storageGb: 512,
    display: 'Diagnosa Kerusakan Cepat & Bisa Ditengok',
    imageUrl:
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
    tokopediaUrl: '/service-laptop',
    shopeeUrl: '/service-laptop',
    isActive: true,
    sortOrder: 4,
  },
];

async function seed() {
  console.log('--- Checking & Seeding Banners and Reviews ---');

  // Check if tables exist
  const tables = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
  );
  const tableNames = new Set(tables.map((t) => String(t.table_name)));

  if (!tableNames.has('banners')) {
    console.log('Notice: Table "banners" does not exist yet. Please run migration first.');
  } else {
    const bannerCount = await prisma.banner.count();
    if (bannerCount === 0) {
      console.log('Seeding default banners into PostgreSQL...');
      for (const b of DEFAULT_BANNERS) {
        await prisma.banner.create({ data: b });
      }
      console.log(`Seeded ${DEFAULT_BANNERS.length} banners successfully.`);
    } else {
      console.log(`Table "banners" already has ${bannerCount} records.`);
    }
  }

  if (!tableNames.has('reviews')) {
    console.log('Notice: Table "reviews" does not exist yet. Please run migration first.');
  } else {
    const reviewCount = await prisma.review.count();
    if (reviewCount === 0) {
      console.log('Seeding initial student reviews...');
      const sampleLaptops = await prisma.laptop.findMany({ take: 6 });
      if (sampleLaptops.length > 0) {
        const sampleReviews = [
          {
            rating: 5,
            userName: 'Dimas Pratama',
            userRole: 'Mahasiswa TI',
            comment:
              'Laptop idaman koding dan desain! Baterai awet banget untuk ukuran laptop berspek monster. Layar jernih.',
          },
          {
            rating: 5,
            userName: 'Siti Rahmawati',
            userRole: 'Mahasiswa Manajemen',
            comment:
              'Sangat pas dengan budget 6 jutaan. Ngetik skripsi berjam-jam keyboardnya empuk banget. Rekomendasi buat kuliah.',
          },
          {
            rating: 5,
            userName: 'Rian Hidayat',
            userRole: 'Mahasiswa DKV',
            comment:
              'Editing video dan render di DaVinci Resolve mulus tanpa kipas berisik. Baterai tahan seharian.',
          },
          {
            rating: 4,
            userName: 'Fajar Nugraha',
            userRole: 'Mahasiswa Sistem Informasi',
            comment:
              'Performa kencang untuk game online dan render tugas 3D. Agak sedikit hangat saat tugas berat tapi wajar.',
          },
          {
            rating: 5,
            userName: 'Anisa Putri',
            userRole: 'Mahasiswa Akuntansi',
            comment:
              'Bodi tipis dan elegan, mudah dibawa ke perpustakaan. Speaker jernih buat dengerin webinar kuliah online.',
          },
          {
            rating: 4,
            userName: 'Budi Santoso',
            userRole: 'Mahasiswa Teknik Elektro',
            comment:
              'Laptop lokal yang sangat worth it untuk harga terjangkau. RAM lega buat simulasi MATLAB.',
          },
        ];

        for (let i = 0; i < sampleReviews.length; i++) {
          const l = sampleLaptops[i % sampleLaptops.length];
          const r = sampleReviews[i];
          await prisma.review.create({
            data: {
              laptopId: l.id,
              userName: r.userName,
              userRole: r.userRole,
              rating: r.rating,
              comment: r.comment,
              status: 'published',
            },
          });
        }
        console.log(`Seeded ${sampleReviews.length} reviews successfully.`);
      }
    } else {
      console.log(`Table "reviews" already has ${reviewCount} records.`);
    }
  }

  await prisma.$disconnect();
  console.log('Seeding check completed.');
}

seed().catch((e) => {
  console.error('Seeding error:', e);
  process.exit(1);
});
