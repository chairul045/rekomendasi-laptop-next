// prisma/seed.ts - Seed data laptop & kriteria untuk SPK Rekomendasi Laptop
// Jalankan dengan: npx tsx prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres.njnvkjhnefmawskhcbdy:Chairull003_@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log('🌱 Seeding database...');

  // ── 1. Seed Kriteria ──────────────────────────────────────────────────────────
  const kriteria = [
    { kode: 'C1', nama: 'Efisiensi Anggaran (Harga)', tipe: 'cost', deskripsi: 'Harga laptop yang terjangkau dan sesuai budget' },
    { kode: 'C2', nama: 'Performa Komputasi', tipe: 'benefit', deskripsi: 'Kecepatan prosesor dan GPU untuk tugas berat' },
    { kode: 'C3', nama: 'Kapasitas RAM', tipe: 'benefit', deskripsi: 'Multitasking dan banyak aplikasi sekaligus' },
    { kode: 'C4', nama: 'Kecepatan & Kapasitas Storage', tipe: 'benefit', deskripsi: 'SSD cepat dan ruang penyimpanan besar' },
    { kode: 'C5', nama: 'Daya Tahan Baterai', tipe: 'benefit', deskripsi: 'Tahan seharian tanpa perlu sering charge' },
    { kode: 'C6', nama: 'Portabilitas & Bobot Ringan', tipe: 'cost', deskripsi: 'Mudah dibawa ke kampus dan bepergian (semakin ringan semakin baik)' },
  ];

  for (const k of kriteria) {
    await prisma.kriteria.upsert({
      where: { kode: k.kode },
      update: k,
      create: k,
    });
  }
  console.log(`✅ ${kriteria.length} kriteria seeded`);

  // ── 2. Seed Laptop Baru ───────────────────────────────────────────────────────
  const laptopsBaru = [
    // ASUS
    { name: 'ASUS VivoBook 15 OLED K3504VA', brand: 'ASUS', price: 11999000n, performaKomposit: 72, processorScore: 75, vgaScore: 45, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 8.0, weightKg: 1.7, mobilityScore: 72, category: 'Kuliah', condition: 'baru' },
    { name: 'ASUS ZenBook 14 UM3402YA', brand: 'ASUS', price: 14499000n, performaKomposit: 78, processorScore: 80, vgaScore: 50, ramGb: 16, storageGb: 512, displaySize: 14.0, batteryHours: 10.0, weightKg: 1.39, mobilityScore: 88, category: 'Bisnis', condition: 'baru' },
    { name: 'ASUS TUF Gaming A15 FA507NUR', brand: 'ASUS', price: 16999000n, performaKomposit: 88, processorScore: 85, vgaScore: 90, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 5.5, weightKg: 2.2, mobilityScore: 52, category: 'Gaming', condition: 'baru' },
    { name: 'ASUS VivoBook 16X K3605VC', brand: 'ASUS', price: 13999000n, performaKomposit: 80, processorScore: 82, vgaScore: 75, ramGb: 16, storageGb: 512, displaySize: 16.0, batteryHours: 7.0, weightKg: 1.88, mobilityScore: 65, category: 'Programming', condition: 'baru' },
    { name: 'ASUS ExpertBook B1 B1502CVA', brand: 'ASUS', price: 9999000n, performaKomposit: 65, processorScore: 68, vgaScore: 40, ramGb: 8, storageGb: 256, displaySize: 15.6, batteryHours: 9.0, weightKg: 1.7, mobilityScore: 72, category: 'Kuliah', condition: 'baru' },
    { name: 'ASUS ROG Zephyrus G14 GA403UV', brand: 'ASUS', price: 29999000n, performaKomposit: 96, processorScore: 95, vgaScore: 98, ramGb: 16, storageGb: 1024, displaySize: 14.0, batteryHours: 7.0, weightKg: 1.65, mobilityScore: 78, category: 'Gaming', condition: 'baru' },

    // Lenovo
    { name: 'Lenovo IdeaPad Slim 5 16IRL8', brand: 'Lenovo', price: 12499000n, performaKomposit: 75, processorScore: 78, vgaScore: 48, ramGb: 16, storageGb: 512, displaySize: 16.0, batteryHours: 9.0, weightKg: 1.79, mobilityScore: 70, category: 'Kuliah', condition: 'baru' },
    { name: 'Lenovo ThinkPad E14 Gen 5', brand: 'Lenovo', price: 16999000n, performaKomposit: 82, processorScore: 85, vgaScore: 50, ramGb: 16, storageGb: 512, displaySize: 14.0, batteryHours: 11.0, weightKg: 1.55, mobilityScore: 82, category: 'Bisnis', condition: 'baru' },
    { name: 'Lenovo LOQ 15IRH8', brand: 'Lenovo', price: 14999000n, performaKomposit: 86, processorScore: 84, vgaScore: 88, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 5.0, weightKg: 2.4, mobilityScore: 45, category: 'Gaming', condition: 'baru' },
    { name: 'Lenovo Yoga Slim 7i 14IAP7', brand: 'Lenovo', price: 18499000n, performaKomposit: 80, processorScore: 82, vgaScore: 52, ramGb: 16, storageGb: 1024, displaySize: 14.0, batteryHours: 12.0, weightKg: 1.4, mobilityScore: 90, category: 'Bisnis', condition: 'baru' },
    { name: 'Lenovo IdeaPad Gaming 3 15ARH7', brand: 'Lenovo', price: 11999000n, performaKomposit: 82, processorScore: 80, vgaScore: 85, ramGb: 8, storageGb: 512, displaySize: 15.6, batteryHours: 4.5, weightKg: 2.2, mobilityScore: 52, category: 'Gaming', condition: 'baru' },
    { name: 'Lenovo V14 G4 IRU', brand: 'Lenovo', price: 7999000n, performaKomposit: 58, processorScore: 60, vgaScore: 35, ramGb: 8, storageGb: 256, displaySize: 14.0, batteryHours: 8.0, weightKg: 1.6, mobilityScore: 76, category: 'Kuliah', condition: 'baru' },

    // HP
    { name: 'HP Pavilion 15-eg3076TX', brand: 'HP', price: 13499000n, performaKomposit: 76, processorScore: 78, vgaScore: 60, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 7.5, weightKg: 1.75, mobilityScore: 68, category: 'Kuliah', condition: 'baru' },
    { name: 'HP Victus 15-fa1108TX', brand: 'HP', price: 15999000n, performaKomposit: 87, processorScore: 85, vgaScore: 89, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 5.5, weightKg: 2.29, mobilityScore: 50, category: 'Gaming', condition: 'baru' },
    { name: 'HP EliteBook 840 G11', brand: 'HP', price: 21999000n, performaKomposit: 84, processorScore: 86, vgaScore: 52, ramGb: 16, storageGb: 512, displaySize: 14.0, batteryHours: 13.0, weightKg: 1.35, mobilityScore: 92, category: 'Bisnis', condition: 'baru' },
    { name: 'HP 14s-dq5008TU', brand: 'HP', price: 8499000n, performaKomposit: 60, processorScore: 62, vgaScore: 38, ramGb: 8, storageGb: 256, displaySize: 14.0, batteryHours: 9.0, weightKg: 1.47, mobilityScore: 80, category: 'Kuliah', condition: 'baru' },
    { name: 'HP OMEN 16-wf0128TX', brand: 'HP', price: 27999000n, performaKomposit: 94, processorScore: 93, vgaScore: 96, ramGb: 16, storageGb: 1024, displaySize: 16.1, batteryHours: 4.5, weightKg: 2.7, mobilityScore: 38, category: 'Gaming', condition: 'baru' },

    // Acer
    { name: 'Acer Swift 14 AI (SF14-71T)', brand: 'Acer', price: 16999000n, performaKomposit: 82, processorScore: 84, vgaScore: 55, ramGb: 16, storageGb: 1024, displaySize: 14.0, batteryHours: 12.0, weightKg: 1.35, mobilityScore: 92, category: 'Bisnis', condition: 'baru' },
    { name: 'Acer Nitro V 15 ANV15-51', brand: 'Acer', price: 13999000n, performaKomposit: 85, processorScore: 83, vgaScore: 87, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 5.0, weightKg: 2.3, mobilityScore: 48, category: 'Gaming', condition: 'baru' },
    { name: 'Acer Aspire 5 A515-58M', brand: 'Acer', price: 9499000n, performaKomposit: 68, processorScore: 70, vgaScore: 42, ramGb: 8, storageGb: 512, displaySize: 15.6, batteryHours: 8.0, weightKg: 1.7, mobilityScore: 72, category: 'Kuliah', condition: 'baru' },
    { name: 'Acer Predator Helios 16 PH16-71', brand: 'Acer', price: 31999000n, performaKomposit: 97, processorScore: 96, vgaScore: 98, ramGb: 32, storageGb: 1024, displaySize: 16.0, batteryHours: 4.0, weightKg: 2.7, mobilityScore: 35, category: 'Gaming', condition: 'baru' },
    { name: 'Acer Chromebook Spin 714', brand: 'Acer', price: 11999000n, performaKomposit: 62, processorScore: 65, vgaScore: 40, ramGb: 8, storageGb: 256, displaySize: 14.0, batteryHours: 11.0, weightKg: 1.44, mobilityScore: 85, category: 'Kuliah', condition: 'baru' },

    // MSI
    { name: 'MSI Modern 15 B13M', brand: 'MSI', price: 12499000n, performaKomposit: 72, processorScore: 74, vgaScore: 45, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 8.0, weightKg: 1.7, mobilityScore: 72, category: 'Kuliah', condition: 'baru' },
    { name: 'MSI Cyborg 15 A13VE', brand: 'MSI', price: 14999000n, performaKomposit: 87, processorScore: 85, vgaScore: 89, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 5.5, weightKg: 2.05, mobilityScore: 58, category: 'Gaming', condition: 'baru' },
    { name: 'MSI Prestige 14 H B13U', brand: 'MSI', price: 19999000n, performaKomposit: 83, processorScore: 85, vgaScore: 55, ramGb: 32, storageGb: 1024, displaySize: 14.0, batteryHours: 10.0, weightKg: 1.29, mobilityScore: 94, category: 'Desain Grafis', condition: 'baru' },
    { name: 'MSI Raider GE78 HX 13VH', brand: 'MSI', price: 39999000n, performaKomposit: 99, processorScore: 98, vgaScore: 99, ramGb: 32, storageGb: 2048, displaySize: 17.3, batteryHours: 3.5, weightKg: 3.1, mobilityScore: 28, category: 'Gaming', condition: 'baru' },

    // Apple
    { name: 'Apple MacBook Air M3 13"', brand: 'Apple', price: 19999000n, performaKomposit: 90, processorScore: 92, vgaScore: 85, ramGb: 8, storageGb: 256, displaySize: 13.6, batteryHours: 18.0, weightKg: 1.24, mobilityScore: 96, category: 'Desain Grafis', condition: 'baru' },
    { name: 'Apple MacBook Air M2 15"', brand: 'Apple', price: 22999000n, performaKomposit: 92, processorScore: 92, vgaScore: 88, ramGb: 8, storageGb: 512, displaySize: 15.3, batteryHours: 18.0, weightKg: 1.51, mobilityScore: 84, category: 'Desain Grafis', condition: 'baru' },
    { name: 'Apple MacBook Pro M3 14"', brand: 'Apple', price: 29999000n, performaKomposit: 97, processorScore: 97, vgaScore: 95, ramGb: 18, storageGb: 512, displaySize: 14.2, batteryHours: 20.0, weightKg: 1.55, mobilityScore: 82, category: 'Desain Grafis', condition: 'baru' },

    // Dell
    { name: 'Dell Inspiron 15 3535', brand: 'Dell', price: 8999000n, performaKomposit: 62, processorScore: 65, vgaScore: 40, ramGb: 8, storageGb: 512, displaySize: 15.6, batteryHours: 7.0, weightKg: 1.65, mobilityScore: 76, category: 'Kuliah', condition: 'baru' },
    { name: 'Dell XPS 15 9530', brand: 'Dell', price: 32999000n, performaKomposit: 95, processorScore: 95, vgaScore: 92, ramGb: 32, storageGb: 1024, displaySize: 15.6, batteryHours: 10.0, weightKg: 1.86, mobilityScore: 64, category: 'Desain Grafis', condition: 'baru' },
    { name: 'Dell Latitude 5540', brand: 'Dell', price: 19999000n, performaKomposit: 80, processorScore: 82, vgaScore: 50, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 10.0, weightKg: 1.74, mobilityScore: 70, category: 'Bisnis', condition: 'baru' },
    { name: 'Dell G15 5530', brand: 'Dell', price: 16999000n, performaKomposit: 88, processorScore: 86, vgaScore: 90, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 4.5, weightKg: 2.56, mobilityScore: 42, category: 'Gaming', condition: 'baru' },

    // Huawei
    { name: 'Huawei MateBook D 16 2024', brand: 'Huawei', price: 12999000n, performaKomposit: 76, processorScore: 78, vgaScore: 50, ramGb: 16, storageGb: 512, displaySize: 16.0, batteryHours: 9.5, weightKg: 1.68, mobilityScore: 74, category: 'Kuliah', condition: 'baru' },
    { name: 'Huawei MateBook 14 2024', brand: 'Huawei', price: 11999000n, performaKomposit: 74, processorScore: 76, vgaScore: 48, ramGb: 16, storageGb: 512, displaySize: 14.2, batteryHours: 11.0, weightKg: 1.45, mobilityScore: 84, category: 'Bisnis', condition: 'baru' },
    { name: 'Huawei MateBook X Pro 2024', brand: 'Huawei', price: 23999000n, performaKomposit: 88, processorScore: 90, vgaScore: 60, ramGb: 32, storageGb: 1024, displaySize: 14.2, batteryHours: 14.0, weightKg: 1.26, mobilityScore: 95, category: 'Bisnis', condition: 'baru' },

    // Samsung
    { name: 'Samsung Galaxy Book4 Pro 360', brand: 'Samsung', price: 22999000n, performaKomposit: 86, processorScore: 88, vgaScore: 58, ramGb: 16, storageGb: 512, displaySize: 16.0, batteryHours: 13.0, weightKg: 1.68, mobilityScore: 74, category: 'Bisnis', condition: 'baru' },
    { name: 'Samsung Galaxy Book4 Ultra', brand: 'Samsung', price: 32999000n, performaKomposit: 93, processorScore: 93, vgaScore: 88, ramGb: 32, storageGb: 1024, displaySize: 16.0, batteryHours: 10.0, weightKg: 1.86, mobilityScore: 64, category: 'Desain Grafis', condition: 'baru' },
  ];

  // ── 3. Seed Laptop Second ──────────────────────────────────────────────────────
  const laptopsSecond = [
    // ASUS Second
    { name: 'ASUS VivoBook 14 A416EA (2021)', brand: 'ASUS', price: 5500000n, performaKomposit: 58, processorScore: 60, vgaScore: 38, ramGb: 8, storageGb: 512, displaySize: 14.0, batteryHours: 7.0, weightKg: 1.5, mobilityScore: 82, category: 'Kuliah', condition: 'second' },
    { name: 'ASUS ZenBook 14 UX425EA (2021)', brand: 'ASUS', price: 8500000n, performaKomposit: 68, processorScore: 70, vgaScore: 45, ramGb: 16, storageGb: 512, displaySize: 14.0, batteryHours: 9.0, weightKg: 1.17, mobilityScore: 96, category: 'Bisnis', condition: 'second' },
    { name: 'ASUS TUF Gaming F15 FX506HF (2022)', brand: 'ASUS', price: 8999000n, performaKomposit: 80, processorScore: 78, vgaScore: 82, ramGb: 8, storageGb: 512, displaySize: 15.6, batteryHours: 5.0, weightKg: 2.3, mobilityScore: 48, category: 'Gaming', condition: 'second' },
    { name: 'ASUS ROG Strix G15 G513RC (2022)', brand: 'ASUS', price: 12500000n, performaKomposit: 88, processorScore: 86, vgaScore: 90, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 5.5, weightKg: 2.3, mobilityScore: 48, category: 'Gaming', condition: 'second' },
    { name: 'ASUS VivoBook 15 S513EA (2021)', brand: 'ASUS', price: 6800000n, performaKomposit: 65, processorScore: 67, vgaScore: 42, ramGb: 8, storageGb: 512, displaySize: 15.6, batteryHours: 8.0, weightKg: 1.8, mobilityScore: 68, category: 'Kuliah', condition: 'second' },

    // Lenovo Second
    { name: 'Lenovo IdeaPad Slim 5 14IIL05 (2020)', brand: 'Lenovo', price: 5200000n, performaKomposit: 55, processorScore: 57, vgaScore: 35, ramGb: 8, storageGb: 512, displaySize: 14.0, batteryHours: 8.0, weightKg: 1.5, mobilityScore: 82, category: 'Kuliah', condition: 'second' },
    { name: 'Lenovo ThinkPad X1 Carbon Gen 9 (2021)', brand: 'Lenovo', price: 12000000n, performaKomposit: 78, processorScore: 80, vgaScore: 50, ramGb: 16, storageGb: 512, displaySize: 14.0, batteryHours: 12.0, weightKg: 1.13, mobilityScore: 98, category: 'Bisnis', condition: 'second' },
    { name: 'Lenovo Legion 5 15ACH6H (2021)', brand: 'Lenovo', price: 10500000n, performaKomposit: 87, processorScore: 85, vgaScore: 88, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 5.0, weightKg: 2.4, mobilityScore: 45, category: 'Gaming', condition: 'second' },
    { name: 'Lenovo Yoga 9i 14ITL5 (2021)', brand: 'Lenovo', price: 11000000n, performaKomposit: 76, processorScore: 78, vgaScore: 50, ramGb: 16, storageGb: 512, displaySize: 14.0, batteryHours: 10.0, weightKg: 1.45, mobilityScore: 84, category: 'Bisnis', condition: 'second' },
    { name: 'Lenovo V15 G2 ITL (2021)', brand: 'Lenovo', price: 4500000n, performaKomposit: 52, processorScore: 54, vgaScore: 32, ramGb: 8, storageGb: 256, displaySize: 15.6, batteryHours: 7.0, weightKg: 1.85, mobilityScore: 66, category: 'Kuliah', condition: 'second' },

    // HP Second
    { name: 'HP Pavilion 14-dv2026TX (2022)', brand: 'HP', price: 6500000n, performaKomposit: 62, processorScore: 64, vgaScore: 40, ramGb: 8, storageGb: 512, displaySize: 14.0, batteryHours: 8.5, weightKg: 1.41, mobilityScore: 86, category: 'Kuliah', condition: 'second' },
    { name: 'HP Victus 16-d1091TX (2022)', brand: 'HP', price: 9000000n, performaKomposit: 83, processorScore: 82, vgaScore: 85, ramGb: 16, storageGb: 512, displaySize: 16.1, batteryHours: 5.0, weightKg: 2.48, mobilityScore: 44, category: 'Gaming', condition: 'second' },
    { name: 'HP EliteBook 840 G8 (2021)', brand: 'HP', price: 10000000n, performaKomposit: 75, processorScore: 77, vgaScore: 48, ramGb: 16, storageGb: 512, displaySize: 14.0, batteryHours: 11.0, weightKg: 1.33, mobilityScore: 92, category: 'Bisnis', condition: 'second' },
    { name: 'HP 14s-dq2613TU (2022)', brand: 'HP', price: 4200000n, performaKomposit: 50, processorScore: 52, vgaScore: 32, ramGb: 4, storageGb: 256, displaySize: 14.0, batteryHours: 8.0, weightKg: 1.46, mobilityScore: 82, category: 'Kuliah', condition: 'second' },

    // Acer Second
    { name: 'Acer Swift 3 SF314-59 (2021)', brand: 'Acer', price: 6200000n, performaKomposit: 62, processorScore: 65, vgaScore: 40, ramGb: 8, storageGb: 512, displaySize: 14.0, batteryHours: 10.0, weightKg: 1.2, mobilityScore: 95, category: 'Kuliah', condition: 'second' },
    { name: 'Acer Nitro 5 AN515-57 (2021)', brand: 'Acer', price: 8200000n, performaKomposit: 82, processorScore: 80, vgaScore: 84, ramGb: 8, storageGb: 512, displaySize: 15.6, batteryHours: 5.0, weightKg: 2.3, mobilityScore: 48, category: 'Gaming', condition: 'second' },
    { name: 'Acer Aspire 5 A514-54 (2021)', brand: 'Acer', price: 5000000n, performaKomposit: 55, processorScore: 57, vgaScore: 35, ramGb: 8, storageGb: 256, displaySize: 14.0, batteryHours: 8.0, weightKg: 1.6, mobilityScore: 76, category: 'Kuliah', condition: 'second' },
    { name: 'Acer Predator Helios 300 PH315-54 (2021)', brand: 'Acer', price: 13500000n, performaKomposit: 90, processorScore: 88, vgaScore: 92, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 5.5, weightKg: 2.4, mobilityScore: 45, category: 'Gaming', condition: 'second' },

    // MSI Second
    { name: 'MSI GF63 Thin 11SC (2021)', brand: 'MSI', price: 6800000n, performaKomposit: 74, processorScore: 72, vgaScore: 76, ramGb: 8, storageGb: 512, displaySize: 15.6, batteryHours: 4.5, weightKg: 1.86, mobilityScore: 65, category: 'Gaming', condition: 'second' },
    { name: 'MSI Modern 14 B11SB (2021)', brand: 'MSI', price: 5800000n, performaKomposit: 62, processorScore: 65, vgaScore: 42, ramGb: 8, storageGb: 512, displaySize: 14.0, batteryHours: 8.0, weightKg: 1.3, mobilityScore: 92, category: 'Kuliah', condition: 'second' },
    { name: 'MSI GL65 Leopard 10SFSK (2020)', brand: 'MSI', price: 9500000n, performaKomposit: 88, processorScore: 86, vgaScore: 90, ramGb: 16, storageGb: 512, displaySize: 15.6, batteryHours: 4.5, weightKg: 2.2, mobilityScore: 52, category: 'Gaming', condition: 'second' },

    // Apple Second
    { name: 'Apple MacBook Air M1 13" (2020)', brand: 'Apple', price: 12000000n, performaKomposit: 82, processorScore: 85, vgaScore: 78, ramGb: 8, storageGb: 256, displaySize: 13.3, batteryHours: 15.0, weightKg: 1.29, mobilityScore: 93, category: 'Desain Grafis', condition: 'second' },
    { name: 'Apple MacBook Pro M1 13" (2020)', brand: 'Apple', price: 15500000n, performaKomposit: 88, processorScore: 90, vgaScore: 85, ramGb: 8, storageGb: 512, displaySize: 13.3, batteryHours: 17.0, weightKg: 1.4, mobilityScore: 88, category: 'Desain Grafis', condition: 'second' },
    { name: 'Apple MacBook Air M2 13" (2022)', brand: 'Apple', price: 16500000n, performaKomposit: 90, processorScore: 92, vgaScore: 86, ramGb: 8, storageGb: 256, displaySize: 13.6, batteryHours: 18.0, weightKg: 1.24, mobilityScore: 96, category: 'Desain Grafis', condition: 'second' },

    // Dell Second
    { name: 'Dell Inspiron 14 5410 (2021)', brand: 'Dell', price: 6500000n, performaKomposit: 65, processorScore: 68, vgaScore: 42, ramGb: 8, storageGb: 512, displaySize: 14.0, batteryHours: 8.0, weightKg: 1.61, mobilityScore: 76, category: 'Kuliah', condition: 'second' },
    { name: 'Dell XPS 13 9310 (2021)', brand: 'Dell', price: 11000000n, performaKomposit: 78, processorScore: 80, vgaScore: 52, ramGb: 16, storageGb: 512, displaySize: 13.4, batteryHours: 12.0, weightKg: 1.2, mobilityScore: 95, category: 'Bisnis', condition: 'second' },
    { name: 'Dell G15 5510 (2021)', brand: 'Dell', price: 8500000n, performaKomposit: 82, processorScore: 80, vgaScore: 84, ramGb: 8, storageGb: 512, displaySize: 15.6, batteryHours: 4.5, weightKg: 2.57, mobilityScore: 40, category: 'Gaming', condition: 'second' },

    // Huawei Second
    { name: 'Huawei MateBook D 15 (2022)', brand: 'Huawei', price: 6200000n, performaKomposit: 65, processorScore: 67, vgaScore: 42, ramGb: 8, storageGb: 512, displaySize: 15.6, batteryHours: 8.0, weightKg: 1.53, mobilityScore: 80, category: 'Kuliah', condition: 'second' },
    { name: 'Huawei MateBook 14 (2021)', brand: 'Huawei', price: 7500000n, performaKomposit: 68, processorScore: 70, vgaScore: 45, ramGb: 16, storageGb: 512, displaySize: 14.0, batteryHours: 10.0, weightKg: 1.49, mobilityScore: 82, category: 'Bisnis', condition: 'second' },
  ];

  const allLaptops = [...laptopsBaru, ...laptopsSecond];
  let seededCount = 0;

  for (const laptop of allLaptops) {
    const existing = await prisma.laptop.findFirst({
      where: { name: laptop.name },
    });
    if (!existing) {
      await prisma.laptop.create({ data: laptop });
      seededCount++;
    }
  }

  console.log(`✅ ${seededCount} laptop seeded (${allLaptops.length - seededCount} sudah ada)`);
  console.log(`📊 Total laptop baru: ${laptopsBaru.length}, second: ${laptopsSecond.length}`);
  console.log('🎉 Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
