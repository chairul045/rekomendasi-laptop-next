// prisma/seed.ts - Seed data kriteria & laptop dari LaptopSeber Palembang
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config();

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DIRECT_URL or DATABASE_URL environment variable is required to run the seed script.'
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Seed Kriteria TOPSIS
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

  // 2. Load scraped laptops from LaptopSeber Palembang
  const jsonPath = path.join(__dirname, '..', 'final_laptopseber_laptops.json');
  if (fs.existsSync(jsonPath)) {
    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📥 Seeding ${rawData.length} laptop dari laptopseber.com...`);
    for (const item of rawData) {
      const brand = item.brand === 'Microsoft Surface' ? 'Microsoft' : item.brand;
      const existing = await prisma.laptop.findFirst({
        where: { name: item.name },
      });
      if (!existing) {
        await prisma.laptop.create({
          data: {
            name: item.name,
            brand: brand,
            price: BigInt(item.price),
            condition: item.condition || 'second',
            category: item.category || 'Kuliah',
            performaKomposit: item.performaKomposit,
            processorScore: item.processorScore,
            vgaScore: item.vgaScore,
            ramGb: item.ramGb,
            storageGb: item.storageGb,
            displaySize: item.displaySize,
            batteryHours: item.batteryHours,
            weightKg: item.weightKg,
            mobilityScore: item.mobilityScore,
            image: item.image,
            imageUrl: item.imageUrl,
          },
        });
      }
    }
  }

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
