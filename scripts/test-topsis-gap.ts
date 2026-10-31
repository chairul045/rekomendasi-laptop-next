import { calculateTopsis, LaptopData } from '../src/lib/topsis';
import prisma from '../src/lib/prisma';
import { calculateRocWeights } from '../src/lib/roc';

async function testGap() {
  // Let's fetch laptops between 4M and 15M (default budget)
  const laptops = await prisma.laptop.findMany({
    where: {
      condition: 'baru',
      price: { gte: BigInt(4000000), lte: BigInt(15000000) },
      // let's exclude Latitude 5420 or check with it
    },
    take: 15
  });

  const rocWeights: Record<string, number> = {
    C1: 0.4083,
    C2: 0.2417,
    C3: 0.1583,
    C4: 0.1028,
    C5: 0.0611,
    C6: 0.0278
  };

  const types = {
    C1: 'cost',
    C2: 'benefit',
    C3: 'benefit',
    C4: 'benefit',
    C5: 'benefit',
    C6: 'cost'
  };

  const toLaptopData = (l: any): LaptopData => ({
    id: l.id,
    name: l.name,
    brand: l.brand,
    price: l.price,
    performaKomposit: l.performaKomposit,
    processorScore: l.processorScore,
    vgaScore: l.vgaScore,
    ramGb: l.ramGb,
    storageGb: l.storageGb,
    batteryHours: l.batteryHours,
    weightKg: l.weightKg,
    category: l.category,
    condition: l.condition
  });

  const res = calculateTopsis(laptops.map(toLaptopData), rocWeights, types, 'Kuliah');

  console.log('Top 5 results:');
  for (const item of res.ranked.slice(0, 5)) {
    console.log(`Rank ${item.peringkat}: ${item.nama} | Price: Rp ${item.harga} | RAM: ${item.ram}GB | Perf: ${item.performa} | V: ${item.nilaiV} (${item.skorPersen}%) | dPos: ${item.dPos} | dNeg: ${item.dNeg}`);
  }
}

testGap().catch(console.error).finally(() => process.exit(0));
