import prisma from '../src/lib/prisma';

interface SuspiciousLaptop {
  id: number;
  name: string;
  brand: string;
  price: number;
  condition: string;
  ramGb: number | null;
  storageGb: number | null;
  category: string | null;
  reason: string;
}

async function checkSuspicious() {
  const allLaptops = await prisma.laptop.findMany({
    select: {
      id: true,
      name: true,
      brand: true,
      price: true,
      condition: true,
      ramGb: true,
      storageGb: true,
      category: true,
    },
    orderBy: { id: 'asc' }
  });

  const suspiciousList: SuspiciousLaptop[] = [];

  for (const l of allLaptops) {
    const priceNum = Number(l.price);
    const n = l.name.toLowerCase();
    const cond = l.condition.toLowerCase();

    // 1. Kategori Baru tetapi spesifikasi tinggi & harga sangat murah (< Rp 6.000.000 dengan RAM >= 16GB atau SSD >= 512GB)
    if (cond === 'baru' && priceNum < 6000000 && ((l.ramGb ?? 0) >= 16 || (l.storageGb ?? 0) >= 512)) {
      suspiciousList.push({
        id: l.id,
        name: l.name,
        brand: l.brand,
        price: priceNum,
        condition: l.condition,
        ramGb: l.ramGb,
        storageGb: l.storageGb,
        category: l.category,
        reason: 'Status "Baru" tapi harga < Rp 6 Jt dengan spek tinggi (RAM >= 16GB atau SSD >= 512GB). Kemungkinan unit refurbished / bekas impor.'
      });
      continue;
    }

    // 2. Kategori Baru tetapi seri enterprise bekas (contoh: Dell Latitude 5xxx/7xxx, ThinkPad T480/T470/X260/X270/X280)
    const isEnterpriseOldSeries = 
      n.includes('latitude') || 
      n.includes('t480') || n.includes('t470') || n.includes('t460') || n.includes('x280') || n.includes('x270') || n.includes('x260') ||
      n.includes('elitebook 840 g3') || n.includes('elitebook 840 g4') || n.includes('elitebook 840 g5');

    if (cond === 'baru' && isEnterpriseOldSeries && priceNum < 8000000) {
      suspiciousList.push({
        id: l.id,
        name: l.name,
        brand: l.brand,
        price: priceNum,
        condition: l.condition,
        ramGb: l.ramGb,
        storageGb: l.storageGb,
        category: l.category,
        reason: 'Model laptop enterprise generasi lama (Dell Latitude / ThinkPad lama) berstatus "Baru" dengan harga di bawah Rp 8 Jt.'
      });
      continue;
    }

    // 3. Harga sangat tidak wajar untuk laptop baru (< Rp 2.000.000)
    if (cond === 'baru' && priceNum < 2000000) {
      suspiciousList.push({
        id: l.id,
        name: l.name,
        brand: l.brand,
        price: priceNum,
        condition: l.condition,
        ramGb: l.ramGb,
        storageGb: l.storageGb,
        category: l.category,
        reason: 'Harga laptop baru di bawah Rp 2.000.000 (tidak wajar untuk laptop baru garansi resmi).'
      });
      continue;
    }

    // 4. Spesifikasi sangat rendah di bawah batas mahasiswa (RAM < 4GB)
    if ((l.ramGb != null && l.ramGb < 4) || n.includes('latitude 2100')) {
      suspiciousList.push({
        id: l.id,
        name: l.name,
        brand: l.brand,
        price: priceNum,
        condition: l.condition,
        ramGb: l.ramGb,
        storageGb: l.storageGb,
        category: l.category,
        reason: 'RAM < 4GB (Substandard untuk mahasiswa kuliah modern). Perlu ditandai tidak disarankan atau dihapus.'
      });
      continue;
    }
  }

  console.log(`\n========================================================================`);
  console.log(`LAPORAN AUDIT DATA LAPTOP MENCURIGAKAN (${suspiciousList.length} DITEMUKAN)`);
  console.log(`========================================================================\n`);

  for (const item of suspiciousList) {
    console.log(`[ID ${item.id}] ${item.brand} - ${item.name}`);
    console.log(`  Harga: Rp ${item.price.toLocaleString('id-ID')} | Kondisi: ${item.condition} | RAM: ${item.ramGb ?? '-'}GB | SSD: ${item.storageGb ?? '-'}GB`);
    console.log(`  Alasan: ${item.reason}\n`);
  }

  // Tampilkan query SQL migrasi perbaikan yang bisa dieksekusi jika diinginkan
  console.log(`-- REKOMENDASI SQL FIX KONDISI BARU -> SECOND:`);
  const idsToSecond = suspiciousList
    .filter(s => s.condition.toLowerCase() === 'baru' && s.reason.includes('refurbished'))
    .map(s => s.id);
  if (idsToSecond.length > 0) {
    console.log(`UPDATE laptops SET condition = 'second' WHERE id IN (${idsToSecond.join(', ')});`);
  }
}

checkSuspicious().catch(console.error).finally(() => process.exit(0));
