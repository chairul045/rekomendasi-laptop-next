// lib/topsis.ts - Algoritma TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)
// Dikonversi dari PHP TopsisService.php ke TypeScript

export interface LaptopData {
  id: number;
  name: string;
  brand: string;
  price: bigint | number;
  performaKomposit: number | null;
  ramGb: number | null;
  storageGb: number | null;
  batteryHours: number | null;
  weightKg: number | null;
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
 * Menjalankan algoritme TOPSIS untuk sekumpulan alternatif laptop.
 * @param laptops Array laptop yang akan dievaluasi
 * @param rocWeights Bobot ROC per kode kriteria { 'C1': 0.4490, ... }
 * @param criteriaTypes Tipe tiap kriteria dari database { 'C1': 'cost', 'C2': 'benefit', ... }
 */
export function calculateTopsis(
  laptops: LaptopData[],
  rocWeights: Record<string, number>,
  criteriaTypes: Record<string, string> = {}
): TopsisResult {
  const emptyResult: TopsisResult = {
    ranked: [],
    matrixX: {},
    matrixR: {},
    matrixY: {},
    idealPositive: {},
    idealNegative: {},
  };

  if (laptops.length === 0) return emptyResult;

  // Pemetaan 6 kriteria
  const criteriaMap: Record<string, CriteriaConfig> = {
    C1: {
      name: 'Harga',
      attribute: (l) => Number(l.price) || 10000000,
      type: (criteriaTypes['C1'] as 'benefit' | 'cost') || 'cost',
    },
    C2: {
      name: 'Performa',
      attribute: (l) => l.performaKomposit || 50,
      type: (criteriaTypes['C2'] as 'benefit' | 'cost') || 'benefit',
    },
    C3: {
      name: 'RAM',
      attribute: (l) => l.ramGb || 8,
      type: (criteriaTypes['C3'] as 'benefit' | 'cost') || 'benefit',
    },
    C4: {
      name: 'Storage',
      attribute: (l) => l.storageGb || 512,
      type: (criteriaTypes['C4'] as 'benefit' | 'cost') || 'benefit',
    },
    C5: {
      name: 'Baterai',
      attribute: (l) => l.batteryHours || 6.0,
      type: (criteriaTypes['C5'] as 'benefit' | 'cost') || 'benefit',
    },
    C6: {
      name: 'Portabilitas',
      attribute: (l) => l.weightKg || 1.6,
      type: (criteriaTypes['C6'] as 'benefit' | 'cost') || 'cost',
    },
  };

  const codes = Object.keys(criteriaMap);

  // 1. Matriks Keputusan X
  const matrixX: Record<number, Record<string, number>> = {};
  for (const laptop of laptops) {
    const row: Record<string, number> = {};
    for (const code of codes) {
      row[code] = criteriaMap[code].attribute(laptop);
    }
    matrixX[laptop.id] = row;
  }

  // 2. Normalisasi Vektor r_ij = x_ij / sqrt(sum(x_kj^2))
  const divider: Record<string, number> = {};
  for (const code of codes) {
    const sumSquares = laptops.reduce((acc, l) => acc + Math.pow(matrixX[l.id][code], 2), 0);
    divider[code] = Math.sqrt(sumSquares) || 1.0;
  }

  const matrixR: Record<number, Record<string, number>> = {};
  for (const laptop of laptops) {
    const rRow: Record<string, number> = {};
    for (const code of codes) {
      rRow[code] = matrixX[laptop.id][code] / divider[code];
    }
    matrixR[laptop.id] = rRow;
  }

  // 3. Matriks Ternormalisasi Terbobot y_ij = W_j * r_ij
  const matrixY: Record<number, Record<string, number>> = {};
  for (const laptop of laptops) {
    const yRow: Record<string, number> = {};
    for (const code of codes) {
      const w = rocWeights[code] ?? 1 / codes.length;
      yRow[code] = matrixR[laptop.id][code] * w;
    }
    matrixY[laptop.id] = yRow;
  }

  // 4. Solusi Ideal Positif (A+) dan Negatif (A-)
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
      idealPositive[code] = minVal;
      idealNegative[code] = maxVal;
    }
  }

  // 5. Hitung Jarak & Nilai Preferensi V_i
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
    const nilaiV = sumDist > 0 ? dNeg / sumDist : 0;

    return {
      laptop,
      laptopId: laptop.id,
      nama: laptop.name,
      merek: laptop.brand,
      harga: Number(laptop.price),
      kondisi: laptop.condition,
      ram: laptop.ramGb || 0,
      storage: laptop.storageGb || 0,
      baterai: laptop.batteryHours || 0,
      berat: laptop.weightKg || 0,
      performa: laptop.performaKomposit || 0,
      dPos: Math.round(dPos * 100000) / 100000,
      dNeg: Math.round(dNeg * 100000) / 100000,
      nilaiV: Math.round(nilaiV * 1000000) / 1000000,
      skorPersen: Math.round(nilaiV * 10000) / 100,
      peringkat: 0,
    };
  });

  // 6. Urutkan berdasarkan Nilai V terbesar
  results.sort((a, b) => b.nilaiV - a.nilaiV);

  // 7. Berikan nomor peringkat
  results.forEach((item, index) => {
    item.peringkat = index + 1;
  });

  return { ranked: results, matrixX, matrixR, matrixY, idealPositive, idealNegative };
}
