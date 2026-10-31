import prisma from '../src/lib/prisma';

async function investigate() {
  // 1. Find "baru" laptops with suspiciously low prices (< 5M IDR) but high specs (RAM >= 16GB or SSD >= 512GB)
  const suspicious = await prisma.laptop.findMany({
    where: {
      condition: 'baru',
      price: { lt: BigInt(5000000) },
      OR: [
        { ramGb: { gte: 16 } },
        { storageGb: { gte: 512 } },
      ]
    },
    select: {
      id: true, name: true, brand: true, price: true, ramGb: true, 
      storageGb: true, condition: true, category: true, batteryHours: true, weightKg: true
    }
  });
  
  console.log('=== SUSPICIOUS LAPTOPS (Baru, price < 5M, high specs) ===');
  for (const l of suspicious) {
    console.log(`ID:${l.id} | ${l.brand} ${l.name} | Rp ${l.price.toString()} | RAM:${l.ramGb}GB | SSD:${l.storageGb}GB | ${l.condition}`);
  }

  // 2. Find laptops with very low specs that might not be suitable for students
  const lowSpec = await prisma.laptop.findMany({
    where: {
      OR: [
        { ramGb: { lt: 4 } },
        { ramGb: null },
      ]
    },
    select: {
      id: true, name: true, brand: true, price: true, ramGb: true, 
      storageGb: true, category: true, condition: true
    },
    take: 30
  });
  
  console.log('\n=== LOW SPEC LAPTOPS (RAM < 4GB or null) ===');
  for (const l of lowSpec) {
    console.log(`ID:${l.id} | ${l.brand} ${l.name} | Rp ${l.price.toString()} | RAM:${l.ramGb ?? 'null'}GB | SSD:${l.storageGb ?? 'null'}GB | ${l.condition}`);
  }

  // 3. Count laptops with null battery/weight
  const nullBattery = await prisma.laptop.count({ where: { batteryHours: null } });
  const nullWeight = await prisma.laptop.count({ where: { weightKg: null } });
  const total = await prisma.laptop.count();
  
  console.log(`\n=== NULL DATA STATS ===`);
  console.log(`Total laptops: ${total}`);
  console.log(`Null battery: ${nullBattery} (${Math.round(nullBattery/total*100)}%)`);
  console.log(`Null weight: ${nullWeight} (${Math.round(nullWeight/total*100)}%)`);

  // 4. Check for Latitude 5420 specifically
  const latitude = await prisma.laptop.findMany({
    where: { name: { contains: 'Latitude', mode: 'insensitive' } },
    select: { id: true, name: true, brand: true, price: true, ramGb: true, storageGb: true, condition: true }
  });
  
  console.log('\n=== LATITUDE LAPTOPS ===');
  for (const l of latitude) {
    console.log(`ID:${l.id} | ${l.brand} ${l.name} | Rp ${l.price.toString()} | RAM:${l.ramGb}GB | SSD:${l.storageGb}GB | ${l.condition}`);
  }

  // 5. Chromebook / very old models
  const chromebook = await prisma.laptop.findMany({
    where: {
      OR: [
        { name: { contains: 'Chromebook', mode: 'insensitive' } },
        { name: { contains: 'Latitude 2100', mode: 'insensitive' } },
        { category: { contains: 'Chromebook', mode: 'insensitive' } },
      ]
    },
    select: { id: true, name: true, brand: true, price: true, ramGb: true, storageGb: true, condition: true, category: true }
  });
  
  console.log('\n=== CHROMEBOOK / VERY OLD MODELS ===');
  for (const l of chromebook) {
    console.log(`ID:${l.id} | ${l.brand} ${l.name} | Rp ${l.price.toString()} | RAM:${l.ramGb}GB | SSD:${l.storageGb}GB | ${l.condition} | cat:${l.category}`);
  }
  
  // 6. Get median battery and weight by category for imputation
  const allLaptops = await prisma.laptop.findMany({
    select: { batteryHours: true, weightKg: true, category: true }
  });
  
  const withBattery = allLaptops.filter(l => l.batteryHours != null).map(l => l.batteryHours!);
  const withWeight = allLaptops.filter(l => l.weightKg != null).map(l => l.weightKg!);
  
  withBattery.sort((a, b) => a - b);
  withWeight.sort((a, b) => a - b);
  
  const medianBattery = withBattery[Math.floor(withBattery.length / 2)] || 0;
  const medianWeight = withWeight[Math.floor(withWeight.length / 2)] || 0;
  
  console.log(`\n=== MEDIAN VALUES ===`);
  console.log(`Median battery: ${medianBattery} hours (from ${withBattery.length} records)`);
  console.log(`Median weight: ${medianWeight} kg (from ${withWeight.length} records)`);
}

investigate().catch(console.error).finally(() => process.exit(0));
