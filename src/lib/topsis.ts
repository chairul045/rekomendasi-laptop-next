// src/lib/topsis.ts - Algoritma TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)
// Murni matematis, dilengkapi imputasi spesifikasi kategori, guard pembagian nol, dan penanganan edge case

export interface LaptopData {
  id: number;
  name: string;
  brand: string;
  price: bigint | number;
  performaKomposit: number | null;
  processorScore?: number | null;
  vgaScore?: number | null;
  ramGb: number | null;
  storageGb: number | null;
  displaySize?: number | null;
  batteryHours: number | null;
  weightKg: number | null;
  mobilityScore?: number | null;
  category?: string | null;
  condition: string;
  imageUrl?: string | null;
}

export interface TopsisResultItem {
  laptop: LaptopData;
  laptopId: number;
  nama: string;
  merek: string;
  harga: number;
  kondisi: string;
  ram: number;
  storage: number;
  baterai: number;
  berat: number;
  performa: number;
  isBatteryEstimated: boolean;
  isWeightEstimated: boolean;
  isSubstandard?: boolean;
  substandardNote?: string;
  dPos: number;
  dNeg: number;
  nilaiV: number;
  skorPersen: number;
  peringkat: number;
}

export interface TopsisResult {
  ranked: TopsisResultItem[];
  matrixX: Record<number, Record<string, number>>;
  matrixR: Record<number, Record<string, number>>;
  matrixY: Record<number, Record<string, number>>;
  idealPositive: Record<string, number>;
  idealNegative: Record<string, number>;
}

interface CriteriaConfig {
  name: string;
  attribute: (laptop: LaptopData) => number;
  type: 'benefit' | 'cost';
}

/**
 * Imputasi cerdas spesifikasi baterai dan bobot berdasarkan kategori laptop
 * Menggunakan nilai representatif/median kategori industri
 */
export function getCategoryImputedSpecs(category?: string | null): { batteryHours: number; weightKg: number } {
  const cat = (category || '').toLowerCase();
  if (cat.includes('gaming')) {
    return { batteryHours: 4.5, weightKg: 2.3 };
  }
  if (cat.includes('bisnis') || cat.includes('portabel') || cat.includes('ultrabook')) {
    return { batteryHours: 9.0, weightKg: 1.35 };
  }
  if (cat.includes('desain') || cat.includes('multimedia')) {
    return { batteryHours: 6.0, weightKg: 1.8 };
  }
  if (cat.includes('programming') || cat.includes('coding')) {
    return { batteryHours: 7.0, weightKg: 1.6 };
  }
  // Default umum / kuliah
  return { batteryHours: 6.5, weightKg: 1.55 };
}

/**
 * Estimasi skor performa laptop jika performaKomposit bernilai null.
 * Mencegah laptop lawas ber-RAM 2GB mendapatkan skor default 50 yang tidak wajar.
 */
export function estimatePerformanceScore(laptop: LaptopData, peruntukan?: string): number {
  if (laptop.performaKomposit != null && laptop.performaKomposit > 0) {
    if (peruntukan === 'Gaming' && (laptop.vgaScore || laptop.processorScore)) {
      const vga = laptop.vgaScore ?? 45;
      const proc = laptop.processorScore ?? laptop.performaKomposit;
      return Math.round(vga * 0.65 + proc * 0.35);
    }
    if (peruntukan === 'Desain Grafis' && (laptop.vgaScore || laptop.processorScore)) {
      const vga = laptop.vgaScore ?? 45;
      const proc = laptop.processorScore ?? laptop.performaKomposit;
      return Math.round(vga * 0.45 + proc * 0.55);
    }
    return laptop.performaKomposit;
  }

  // Jika skor komposit kosong, estimasi proporsional berdasarkan RAM dan prosesor
  const ram = laptop.ramGb ?? 4;
  if (ram <= 2) return 15; // Netbook / spek sangat rendah
  if (ram <= 4) return 35; // Entry-level lawas
  if (ram <= 8) return 55; // Standar mainstream
  if (ram <= 16) return 75; // Mid-high
  return 85; // High-end
}

/**
 * Menjalankan algoritme TOPSIS untuk sekumpulan alternatif laptop.
 * @param laptops Array laptop yang akan dievaluasi
 * @param rocWeights Bobot ROC per kode kriteria { 'C1': 0.4083, ... }
 * @param criteriaTypes Tipe tiap kriteria { 'C1': 'cost', 'C2': 'benefit', ... }
 * @param peruntukan Peruntukan pemakaian user (Kuliah, Programming, Desain Grafis, Gaming, Bisnis)
 */
export function calculateTopsis(
  laptops: LaptopData[],
  rocWeights: Record<string, number>,
  criteriaTypes: Record<string, string> = {},
  peruntukan?: string
): TopsisResult {
  const emptyResult: TopsisResult = {
    ranked: [],
    matrixX: {},
    matrixR: {},
    matrixY: {},
    idealPositive: {},
    idealNegative: {},
  };

  if (!laptops || laptops.length === 0) return emptyResult;

  // ── Pemetaan 6 Kriteria Standar SPK Lapmatch ──────────────────────────────
  const criteriaMap: Record<string, CriteriaConfig> = {
    C1: {
      name: 'Harga',
      attribute: (l) => {
        const p = Number(l.price);
        return p > 0 ? p : 10000000;
      },
      type: (criteriaTypes['C1'] as 'benefit' | 'cost') || 'cost',
    },
    C2: {
      name: 'Performa',
      attribute: (l) => estimatePerformanceScore(l, peruntukan),
      type: (criteriaTypes['C2'] as 'benefit' | 'cost') || 'benefit',
    },
    C3: {
      name: 'RAM',
      attribute: (l) => l.ramGb ?? 8,
      type: (criteriaTypes['C3'] as 'benefit' | 'cost') || 'benefit',
    },
    C4: {
      name: 'Storage',
      attribute: (l) => l.storageGb ?? 512,
      type: (criteriaTypes['C4'] as 'benefit' | 'cost') || 'benefit',
    },
    C5: {
      name: 'Baterai',
      attribute: (l) => l.batteryHours ?? getCategoryImputedSpecs(l.category).batteryHours,
      type: (criteriaTypes['C5'] as 'benefit' | 'cost') || 'benefit',
    },
    C6: {
      name: 'Portabilitas',
      attribute: (l) => l.weightKg ?? getCategoryImputedSpecs(l.category).weightKg,
      type: (criteriaTypes['C6'] as 'benefit' | 'cost') || 'cost',
    },
  };

  const codes = Object.keys(criteriaMap);

  // ── 1. Matriks Keputusan X ────────────────────────────────────────────────
  const matrixX: Record<number, Record<string, number>> = {};
  for (const laptop of laptops) {
    const row: Record<string, number> = {};
    for (const code of codes) {
      row[code] = criteriaMap[code].attribute(laptop);
    }
    matrixX[laptop.id] = row;
  }

  // ── 2. Normalisasi Vektor r_ij = x_ij / sqrt(sum(x_kj^2)) ─────────────────
  const divider: Record<string, number> = {};
  for (const code of codes) {
    const sumSquares = laptops.reduce((acc, l) => acc + Math.pow(matrixX[l.id][code], 2), 0);
    const sqrtVal = Math.sqrt(sumSquares);
    // Guard: pembagi nol jika semua nilai nol
    divider[code] = sqrtVal > 0 ? sqrtVal : 1.0;
  }

  const matrixR: Record<number, Record<string, number>> = {};
  for (const laptop of laptops) {
    const rRow: Record<string, number> = {};
    for (const code of codes) {
      rRow[code] = matrixX[laptop.id][code] / divider[code];
    }
    matrixR[laptop.id] = rRow;
  }

  // ── 3. Matriks Ternormalisasi Terbobot y_ij = W_j * r_ij ──────────────────
  const matrixY: Record<number, Record<string, number>> = {};
  for (const laptop of laptops) {
    const yRow: Record<string, number> = {};
    for (const code of codes) {
      const w = rocWeights[code] ?? 1 / codes.length;
      yRow[code] = matrixR[laptop.id][code] * w;
    }
    matrixY[laptop.id] = yRow;
  }

  // ── 4. Solusi Ideal Positif (A+) dan Solusi Ideal Negatif (A-) ────────────
  const idealPositive: Record<string, number> = {};
  const idealNegative: Record<string, number> = {};

  for (const code of codes) {
    const values = laptops.map((l) => matrixY[l.id][code]);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);

    if (criteriaMap[code].type === 'benefit') {
      idealPositive[code] = maxVal;
      idealNegative[code] = minVal;
    } else {
      // Cost: terkecil adalah ideal positif, terbesar adalah ideal negatif
      idealPositive[code] = minVal;
      idealNegative[code] = maxVal;
    }
  }

  // ── 5. Kasus Khusus: Hanya 1 Laptop Lolos Filter ──────────────────────────
  if (laptops.length === 1) {
    const single = laptops[0];
    const imputed = getCategoryImputedSpecs(single.category);
    const isSubstandard = (single.ramGb ?? 0) < 4;
    const item: TopsisResultItem = {
      laptop: single,
      laptopId: single.id,
      nama: single.name,
      merek: single.brand,
      harga: Number(single.price),
      kondisi: single.condition,
      ram: single.ramGb ?? 0,
      storage: single.storageGb ?? 0,
      baterai: single.batteryHours ?? imputed.batteryHours,
      berat: single.weightKg ?? imputed.weightKg,
      performa: estimatePerformanceScore(single, peruntukan),
      isBatteryEstimated: single.batteryHours == null,
      isWeightEstimated: single.weightKg == null,
      isSubstandard,
      substandardNote: isSubstandard ? 'RAM di bawah 4GB (Tidak disarankan untuk kuliah)' : undefined,
      dPos: 0,
      dNeg: 1.0,
      nilaiV: 1.0,
      skorPersen: 100.0,
      peringkat: 1,
    };
    return {
      ranked: [item],
      matrixX,
      matrixR,
      matrixY,
      idealPositive,
      idealNegative,
    };
  }

  // ── 6. Hitung Jarak Euclidean & Nilai Preferensi V_i = D- / (D+ + D-) ───────
  const results: TopsisResultItem[] = laptops.map((laptop) => {
    const yRow = matrixY[laptop.id];

    let sumDPos = 0;
    let sumDNeg = 0;
    for (const code of codes) {
      sumDPos += Math.pow(yRow[code] - idealPositive[code], 2);
      sumDNeg += Math.pow(yRow[code] - idealNegative[code], 2);
    }

    const dPos = Math.sqrt(sumDPos);
    const dNeg = Math.sqrt(sumDNeg);
    const sumDist = dPos + dNeg;

    // Guard pembagian nol jika semua alternatif memiliki nilai identik di semua kriteria
    let nilaiV: number;
    if (sumDist > 0) {
      nilaiV = dNeg / sumDist;
    } else {
      nilaiV = 0.5; // Nilai netral jika semua kriteria identik
    }

    const imputed = getCategoryImputedSpecs(laptop.category);
    const isSubstandard = (laptop.ramGb ?? 0) > 0 && (laptop.ramGb ?? 0) < 4;

    return {
      laptop,
      laptopId: laptop.id,
      nama: laptop.name,
      merek: laptop.brand,
      harga: Number(laptop.price),
      kondisi: laptop.condition,
      ram: laptop.ramGb ?? 0,
      storage: laptop.storageGb ?? 0,
      baterai: laptop.batteryHours ?? imputed.batteryHours,
      berat: laptop.weightKg ?? imputed.weightKg,
      performa: estimatePerformanceScore(laptop, peruntukan),
      isBatteryEstimated: laptop.batteryHours == null,
      isWeightEstimated: laptop.weightKg == null,
      isSubstandard,
      substandardNote: isSubstandard ? 'RAM di bawah 4GB (Tidak disarankan untuk kuliah)' : undefined,
      dPos: Math.round(dPos * 100000) / 100000,
      dNeg: Math.round(dNeg * 100000) / 100000,
      nilaiV: Math.round(nilaiV * 1000000) / 1000000,
      skorPersen: Math.round(nilaiV * 10000) / 100,
      peringkat: 0,
    };
  });

  // ── 7. Urutkan berdasarkan Nilai V terbesar ───────────────────────────────
  results.sort((a, b) => b.nilaiV - a.nilaiV);

  // ── 8. Berikan nomor peringkat ────────────────────────────────────────────
  results.forEach((item, index) => {
    item.peringkat = index + 1;
  });

  return { ranked: results, matrixX, matrixR, matrixY, idealPositive, idealNegative };
}
