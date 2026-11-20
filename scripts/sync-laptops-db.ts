import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log('🔄 Memulai sinkronisasi database laptop...');

  // 1. Update image and imageUrl paths in DB from /laptopseber/ to /lapmatch/
  const laptops = await prisma.laptop.findMany();
  console.log(`Ditemukan ${laptops.length} laptop di database.`);

  let updatedCount = 0;
  for (const laptop of laptops) {
    let newImage = laptop.image;
    let newImageUrl = laptop.imageUrl;
    let needsUpdate = false;

    if (newImage && newImage.includes('laptopseber')) {
      newImage = newImage.replace('/laptopseber/', '/lapmatch/');
      needsUpdate = true;
    }
    if (newImageUrl && newImageUrl.includes('laptopseber')) {
      newImageUrl = newImageUrl.replace('/laptopseber/', '/lapmatch/');
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.laptop.update({
        where: { id: laptop.id },
        data: {
          image: newImage,
          imageUrl: newImageUrl,
        },
      });
      updatedCount++;
    }
  }
  console.log(`✅ ${updatedCount} laptop diperbarui path gambarnya (laptopseber -> lapmatch).`);

  // 2. Load all laptops from final_laptops.json and insert new ones
  const jsonPath = path.join(__dirname, '..', 'final_laptops.json');
  if (fs.existsSync(jsonPath)) {
    const catalogData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📂 Memeriksa ${catalogData.length} laptop dari katalog JSON...`);

    let insertedCount = 0;
    for (const item of catalogData) {
      const existing = await prisma.laptop.findFirst({
        where: {
          name: {
            equals: item.name,
            mode: 'insensitive',
          },
        },
      });

      if (!existing) {
        await prisma.laptop.create({
          data: {
            name: item.name,
            brand: item.brand,
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
        console.log(`➕ Menambahkan laptop baru: ${item.name} (${item.brand})`);
        insertedCount++;
      }
    }
    console.log(`✅ ${insertedCount} laptop baru berhasil ditambahkan.`);
  }

  // 3. Verify all laptops in DB
  const finalLaptops = await prisma.laptop.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, name: true, brand: true, price: true, image: true, imageUrl: true },
  });

  console.log(`\n🎉 Total laptop aktif di database: ${finalLaptops.length}`);
  finalLaptops.forEach((l) => {
    console.log(`- [ID: ${l.id}] ${l.brand} ${l.name} | Rp ${Number(l.price).toLocaleString('id-ID')} | ${l.imageUrl}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Gagal sinkronisasi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
