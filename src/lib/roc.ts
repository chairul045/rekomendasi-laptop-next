// lib/roc.ts - Algoritma ROC (Rank Order Centroid) Weighting
// Dikonversi dari PHP RocService.php ke TypeScript

export interface RocResult {
  [criterionCode: string]: {
    prioritas: number;
    bobot: number;
  };
}

/**
 * Memeriksa apakah urutan kode kriteria valid dan tidak memuat duplikat.
 */
export function isValidCriterionCodes(codes: unknown): codes is string[] {
  if (!Array.isArray(codes) || codes.length === 0) return false;
  if (!codes.every((c) => typeof c === 'string' && c.trim().length > 0)) return false;
  return new Set(codes).size === codes.length;
}

/**
 * Menghitung bobot ROC berdasarkan urutan prioritas kriteria.
 * Rumus: W_i = (1/K) * sum_{j=i}^{K} (1/j)
 * @param orderedCriterionCodes Array kode kriteria unik dari prioritas tertinggi ke terendah
 * @throws {Error} Jika ditemukan kode kriteria duplikat atau array tidak valid
 */
export function calculateRocWeights(orderedCriterionCodes: string[]): RocResult {
  if (!Array.isArray(orderedCriterionCodes)) {
    throw new Error('Input kriteria ROC harus berupa array.');
  }

  const k = orderedCriterionCodes.length;
  if (k === 0) return {};

  // Validasi keunikan elemen kriteria (mencegah penimpaan key dan perusakan total bobot)
  const uniqueCodes = new Set(orderedCriterionCodes);
  if (uniqueCodes.size !== k) {
    throw new Error(
      'Input kriteria ROC tidak valid: ditemukan kriteria duplikat. Setiap kriteria harus unik.'
    );
  }

  const result: RocResult = {};

  orderedCriterionCodes.forEach((code, index) => {
    const rank = index + 1;
    let sum = 0;
    for (let j = rank; j <= k; j++) {
      sum += 1 / j;
    }
    const weight = sum / k;
    result[code] = {
      prioritas: rank,
      bobot: Math.round(weight * 10000) / 10000,
    };
  });

  // Normalisasi agar jumlah tepat 1.0000
  const totalWeight = Object.values(result).reduce((acc, v) => acc + v.bobot, 0);
  if (Math.abs(totalWeight - 1.0) > 0.0001) {
    const diff = 1.0 - totalWeight;
    const firstKey = orderedCriterionCodes[0];
    result[firstKey].bobot = Math.round((result[firstKey].bobot + diff) * 10000) / 10000;
  }

  return result;
}
