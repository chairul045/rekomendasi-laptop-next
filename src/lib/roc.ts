// lib/roc.ts - Algoritma ROC (Rank Order Centroid) Weighting
// Dikonversi dari PHP RocService.php ke TypeScript

export interface RocResult {
  [criterionCode: string]: {
    prioritas: number;
    bobot: number;
  };
}

/**
 * Menghitung bobot ROC berdasarkan urutan prioritas kriteria.
 * Rumus: W_i = (1/K) * sum_{j=i}^{K} (1/j)
 * @param orderedCriterionCodes Array kode kriteria dari prioritas tertinggi ke terendah
 */
export function calculateRocWeights(orderedCriterionCodes: string[]): RocResult {
  const k = orderedCriterionCodes.length;
  if (k === 0) return {};

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
