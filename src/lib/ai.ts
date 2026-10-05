// lib/ai.ts - AI Explanation Service menggunakan Gemini API
// Dikonversi dari PHP AiExplanationService.php

interface LaptopForAi {
  id: number;
  name: string;
  brand: string;
  price: number;
  condition: string;
  ramGb: number | null;
  storageGb: number | null;
  batteryHours: number | null;
  weightKg: number | null;
  performaKomposit: number | null;
}

interface JawabanForAi {
  peruntukan: string;
  frekuensiMembawa: string | null;
  rankingKriteria: string[];
}

const criteriaNameMap: Record<string, string> = {
  C1: 'Efisiensi Anggaran (Harga)',
  C2: 'Performa Komputasi Tinggi',
  C3: 'Kapasitas RAM Multitasking',
  C4: 'Kecepatan & Kapasitas Storage SSD',
  C5: 'Daya Tahan Baterai Seharian',
  C6: 'Portabilitas & Bobot Ringan',
};

/**
 * Generate penjelasan naratif AI untuk laptop menggunakan Gemini API.
 * Fallback ke generator kontekstual jika API key tidak tersedia.
 */
export async function generateAiExplanation(
  laptop: LaptopForAi,
  jawaban: JawabanForAi,
  peringkat: number,
  nilaiV: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const topCriteriaCode = jawaban.rankingKriteria[0];
  const topCriteriaName = criteriaNameMap[topCriteriaCode] ?? 'Spesifikasi Seimbang';
  const scorePct = Math.round(nilaiV * 1000) / 10;

  if (apiKey) {
    try {
      const prompt =
        `Hasil dari Sistem Rekomendasi Laptop Mahasiswa (SPK TOPSIS), buat penjelasan ringkas (2-3 kalimat lugas) mengapa laptop berikut cocok untuk mahasiswa:\n` +
        `- Nama Laptop: ${laptop.name} (${laptop.condition})\n` +
        `- Harga: Rp ${Number(laptop.price).toLocaleString('id-ID')}\n` +
        `- Spesifikasi: RAM ${laptop.ramGb}GB, SSD ${laptop.storageGb}GB, Baterai ${laptop.batteryHours} jam, Berat ${laptop.weightKg} kg, Skor Performa: ${laptop.performaKomposit}\n` +
        `- Peringkat Rekomendasi: Peringkat ${peringkat} (Skor TOPSIS: ${scorePct}%)\n` +
        `- Kebutuhan Mahasiswa: Peruntukan ${jawaban.peruntukan}, Frekuensi bawa: ${jawaban.frekuensiMembawa}, Prioritas Utama: ${topCriteriaName}\n` +
        `Gunakan bahasa Indonesia yang profesional, ramah, dan solutif.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          signal: AbortSignal.timeout(8000),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) return aiText.trim();
      }
    } catch {
      // Fallback ke generator kontekstual
    }
  }

  // Generator Cerdas Kontekstual (Fallback)
  return generateFallbackNarrative(laptop, jawaban, peringkat, scorePct, topCriteriaName);
}

function generateFallbackNarrative(
  laptop: LaptopForAi,
  jawaban: JawabanForAi,
  peringkat: number,
  scorePct: number,
  topCriteriaName: string
): string {
  const kondisiLabel =
    laptop.condition === 'second' ? 'kondisi second berkualitas' : 'kondisi baru bergaransi resmi';
  const hargaFormatted = `Rp ${Number(laptop.price).toLocaleString('id-ID')}`;
  const peruntukan = jawaban.peruntukan.charAt(0).toUpperCase() + jawaban.peruntukan.slice(1);

  const highlights: string[] = [];
  if ((laptop.ramGb ?? 0) >= 16) {
    highlights.push(`RAM ${laptop.ramGb}GB yang sangat lapang untuk multitasking`);
  } else {
    highlights.push(`RAM ${laptop.ramGb}GB yang responsif untuk komputasi harian`);
  }
  if ((laptop.storageGb ?? 0) >= 512) {
    highlights.push(`penyimpanan SSD ${laptop.storageGb}GB berkecepatan tinggi`);
  }
  if (laptop.weightKg && laptop.weightKg <= 1.6) {
    highlights.push(
      `bobot ultra-ringan ${laptop.weightKg} kg yang nyaman dibawa ${(jawaban.frekuensiMembawa ?? 'rutin').toLowerCase()}`
    );
  } else if (laptop.batteryHours && laptop.batteryHours >= 7) {
    highlights.push(`daya tahan baterai hingga ${laptop.batteryHours} jam pemakaian`);
  }

  const highlightText = highlights.join(', didukung ');

  if (peringkat === 1) {
    return `Laptop ini merupakan pilihan terbaik (Peringkat 1) dengan skor preferensi TOPSIS tertinggi sebesar ${scorePct}%. Ditenagai ${highlightText}, laptop ${kondisiLabel} seharga ${hargaFormatted} ini sangat optimal dalam mengakomodasi prioritas utama Anda pada ${topCriteriaName} untuk kebutuhan ${peruntukan}.`;
  }
  return `Direkomendasikan pada Peringkat ${peringkat} dengan skor kecocokan ${scorePct}%. Menawarkan kombinasi seimbang antara ${highlightText}, menjadikannya alternatif yang sangat layak dipertimbangkan untuk kebutuhan ${peruntukan} dengan banderol ${hargaFormatted}.`;
}
