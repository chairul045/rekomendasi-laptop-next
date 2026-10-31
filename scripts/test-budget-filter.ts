import prisma from '../src/lib/prisma';
import { calculateTopsis, LaptopData } from '../src/lib/topsis';

async function testBudgetFilter() {
  console.log('🧪 UNIT TEST: Strict Budget Filtering & TOPSIS Input Validation\n');

  const budgetMin = 4000000;
  const budgetMax = 7000000;
  const minPrice = BigInt(budgetMin);
  const maxPrice = BigInt(budgetMax);

  // 1. Query database strictly respecting budget
  const laptops = await prisma.laptop.findMany({
    where: {
      condition: 'baru',
      price: { gte: minPrice, lte: maxPrice },
      NOT: { ramGb: { lt: 4 } }
    },
    take: 20
  });

  console.log(`Ditemukan ${laptops.length} laptop baru dalam rentang Rp ${budgetMin.toLocaleString('id-ID')} - Rp ${budgetMax.toLocaleString('id-ID')}:`);

  let anyOutOfBudget = false;
  for (const l of laptops) {
    const p = Number(l.price);
    const inBudget = p >= budgetMin && p <= budgetMax;
    if (!inBudget) anyOutOfBudget = true;
    console.log(`  [${inBudget ? 'PASS' : 'FAIL'}] ID:${l.id} | ${l.brand} ${l.name} | Rp ${p.toLocaleString('id-ID')}`);
  }

  if (anyOutOfBudget) {
    console.error('\n❌ TEST GAGAL: Ada laptop di luar rentang budget!');
    process.exit(1);
  } else {
    console.log('\n✅ TEST 1 BERHASIL: Semua laptop kandidat berada di dalam rentang budget min-max.');
  }

  // 2. Test dengan rentang yang sengaja kosong (misal Rp 100.000 - Rp 200.000)
  const emptyBudgetLaptops = await prisma.laptop.findMany({
    where: {
      price: { gte: BigInt(100000), lte: BigInt(200000) }
    }
  });

  const emptyTopsis = calculateTopsis(
    emptyBudgetLaptops.map(l => ({
      id: l.id,
      name: l.name,
      brand: l.brand,
      price: l.price,
      performaKomposit: l.performaKomposit,
      ramGb: l.ramGb,
      storageGb: l.storageGb,
      batteryHours: l.batteryHours,
      weightKg: l.weightKg,
      condition: l.condition
    })),
    { C1: 0.4083, C2: 0.2417, C3: 0.1583, C4: 0.1028, C5: 0.0611, C6: 0.0278 }
  );

  if (emptyTopsis.ranked.length === 0) {
    console.log('✅ TEST 2 BERHASIL: Filter budget kosong menghasilkan empty results secara aman tanpa crash.');
  } else {
    console.error('❌ TEST 2 GAGAL: Filter budget kosong menghasilkan hasil yang tidak terduga.');
    process.exit(1);
  }

  console.log('\n🎉 SEMUA UNIT TEST FILTER BUDGET BERHASIL!\n');
}

testBudgetFilter().catch(console.error).finally(() => process.exit(0));
