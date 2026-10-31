import { calculateTopsis, LaptopData } from '../src/lib/topsis';

const rocWeights = { C1: 0.4083, C2: 0.2417, C3: 0.1583, C4: 0.1028, C5: 0.0611, C6: 0.0278 };
const types = { C1: 'cost', C2: 'benefit', C3: 'benefit', C4: 'benefit', C5: 'benefit', C6: 'cost' };

// Test 1: Single laptop
const singleLaptop: LaptopData[] = [{
  id: 1, name: 'Single Test', brand: 'Test', price: 8000000,
  performaKomposit: 70, ramGb: 16, storageGb: 512, batteryHours: 8, weightKg: 1.5,
  condition: 'baru'
}];
const singleRes = calculateTopsis(singleLaptop, rocWeights, types);
console.log('Test 1 (Single laptop):', {
  count: singleRes.ranked.length,
  rank: singleRes.ranked[0]?.peringkat,
  score: singleRes.ranked[0]?.skorPersen,
  nilaiV: singleRes.ranked[0]?.nilaiV
});

// Test 2: Low spec laptop (RAM 2GB, null performa)
const lowSpecLaptop: LaptopData[] = [
  {
    id: 1, name: 'Latitude 2100', brand: 'Dell', price: 399000,
    performaKomposit: null, ramGb: 2, storageGb: 160, batteryHours: null, weightKg: null,
    condition: 'second'
  },
  {
    id: 2, name: 'Modern Laptop', brand: 'ASUS', price: 7000000,
    performaKomposit: 70, ramGb: 8, storageGb: 512, batteryHours: 8, weightKg: 1.5,
    condition: 'baru'
  }
];
const lowSpecRes = calculateTopsis(lowSpecLaptop, rocWeights, types);
console.log('\nTest 2 (Low spec comparison):');
for (const r of lowSpecRes.ranked) {
  console.log(`- ${r.nama}: RAM=${r.ram}GB, Perf=${r.performa}, Skor=${r.skorPersen}%, Substandard=${r.isSubstandard}, ImputedBattery=${r.isBatteryEstimated}`);
}

// Test 3: Zero values (division by zero guard)
const zeroLaptops: LaptopData[] = [
  { id: 1, name: 'A', brand: 'A', price: 5000000, performaKomposit: 0, ramGb: 8, storageGb: 256, batteryHours: 0, weightKg: 1.5, condition: 'baru' },
  { id: 2, name: 'B', brand: 'B', price: 5000000, performaKomposit: 0, ramGb: 8, storageGb: 256, batteryHours: 0, weightKg: 1.5, condition: 'baru' }
];
const zeroRes = calculateTopsis(zeroLaptops, rocWeights, types);
console.log('\nTest 3 (Division by zero guard):', {
  rankedCount: zeroRes.ranked.length,
  v1: zeroRes.ranked[0]?.nilaiV,
  v2: zeroRes.ranked[1]?.nilaiV,
  isFinite: Number.isFinite(zeroRes.ranked[0]?.nilaiV)
});

process.exit(0);
