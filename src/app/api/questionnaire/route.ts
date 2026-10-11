// app/api/questionnaire/route.ts - API Proses Kuisioner (ROC + TOPSIS + AI Cepat & Presisi)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { calculateRocWeights } from '@/lib/roc';
import { calculateTopsis, LaptopData } from '@/lib/topsis';
import { generateAiExplanation } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      budgetMin,
      budgetMax,
      peruntukan,
      rankingKriteria,
      merekPilihan,
      kondisiPilihan = 'keduanya',
      frekuensiMembawa,
      judul,
    } = body;

    // Validasi input ranking kriteria
    if (!rankingKriteria || !Array.isArray(rankingKriteria) || rankingKriteria.length !== 6) {
      return NextResponse.json({ error: 'Ranking kriteria tidak valid.' }, { status: 400 });
    }

    const userId = user.id;

    // Auto-create / pastikan user profile ada
    let existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          id: userId,
          name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
          email: user.email!,
          role: 'mahasiswa',
        },
      });
    }

    const minPrice = BigInt(Math.max(0, Number(budgetMin) || 0));
    const maxPrice = BigInt(Math.max(Number(budgetMin) || 0, Number(budgetMax) || 50000000));
    const peruntukanText = peruntukan || 'Kuliah';

    // 1. Simpan kuisioner jawaban ke DB
    const jawaban = await prisma.kuisionerJawaban.create({
      data: {
        userId,
        budgetMin: minPrice,
        budgetMax: maxPrice,
        peruntukan: peruntukanText,
        rankingKriteria: rankingKriteria,
        merekPilihan: merekPilihan || ['semua'],
        kondisiPilihan: kondisiPilihan,
        frekuensiMembawa: frekuensiMembawa || 'Rutin',
        judul:
          judul ||
          `Konsultasi ${peruntukanText} (${new Date().toLocaleDateString('id-ID')})`,
        tanggalPengisian: new Date(),
      },
    });

    // 2. Hitung Bobot ROC & Ambil Kriteria DB secara paralel
    const rocResult = calculateRocWeights(rankingKriteria);
    const rocWeightsMap: Record<string, number> = {};

    const criteriaDb = await prisma.kriteria.findMany();
    const criteriaByKode = Object.fromEntries(criteriaDb.map((k) => [k.kode, k]));
    const criteriaTypes = Object.fromEntries(criteriaDb.map((k) => [k.kode, k.tipe]));

    // Batch insert Bobot ROC menggunakan createMany (1 roundtrip)
    const bobotRecords = Object.entries(rocResult)
      .map(([code, data]) => {
        rocWeightsMap[code] = data.bobot;
        const kriteriaModel = criteriaByKode[code];
        if (!kriteriaModel) return null;
        return {
          kuisionerJawabanId: jawaban.id,
          kriteriaId: kriteriaModel.id,
          prioritas: data.prioritas,
          bobot: data.bobot,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (bobotRecords.length > 0) {
      await prisma.bobotKriteriaHasil.createMany({ data: bobotRecords });
    }

    // 3. Filter Laptop yang Akurat Sesuai Input User
    const merekArr = (Array.isArray(merekPilihan) ? merekPilihan : ['semua'])
      .filter((b) => b && b !== 'semua');
    const isAllBrand = merekArr.length === 0;

    const wantsBaru = ['baru', 'keduanya'].includes(kondisiPilihan);
    const wantsSecond = ['second', 'keduanya'].includes(kondisiPilihan);

    // Fungsi pencari laptop kandidat yang ketat menghormati budget & preferensi user
    const fetchCandidates = async (condition: 'baru' | 'second') => {
      // Step A: Cari laptop dengan budget & merek pilihan
      let laptops = await prisma.laptop.findMany({
        where: {
          condition,
          price: { gte: minPrice, lte: maxPrice },
          ...(!isAllBrand ? { brand: { in: merekArr } } : {}),
        },
      });

      // Step B: Jika merek tertentu kosong di budget tersebut (misal Apple di harga 5jt),
      // PERTAHANKAN BUDGET dan cari dari semua merek! Jangan mengorbankan budget user.
      if (laptops.length === 0 && !isAllBrand) {
        laptops = await prisma.laptop.findMany({
          where: {
            condition,
            price: { gte: minPrice, lte: maxPrice },
          },
        });
      }

      // Step C: Jika masih tidak ada laptop sama sekali di range ketat,
      // perlebar rentang harga secara proporsional (+-30%) dengan batas terdekat, BUKAN lompat ke laptop 40 juta.
      if (laptops.length === 0) {
        const expandedMin = BigInt(Math.max(0, Math.round(Number(minPrice) * 0.7)));
        const expandedMax = BigInt(Math.round(Number(maxPrice) * 1.35));
        laptops = await prisma.laptop.findMany({
          where: {
            condition,
            price: { gte: expandedMin, lte: expandedMax },
          },
          take: 30,
          orderBy: { price: 'asc' },
        });

        // Fallback darurat: ambil laptop yang terdekat dengan batas anggaran atas user
        if (laptops.length === 0) {
          laptops = await prisma.laptop.findMany({
            where: { condition },
            take: 20,
            orderBy: { price: Number(maxPrice) < 15000000 ? 'asc' : 'desc' },
          });
        }
      }

      return laptops;
    };

    // Helper mapping laptop ke tipe data TOPSIS
    const toLaptopData = (l: Awaited<ReturnType<typeof fetchCandidates>>[0]): LaptopData => ({
      id: l.id,
      name: l.name,
      brand: l.brand,
      price: l.price,
      performaKomposit: l.performaKomposit,
      processorScore: l.processorScore,
      vgaScore: l.vgaScore,
      ramGb: l.ramGb,
      storageGb: l.storageGb,
      displaySize: l.displaySize,
      batteryHours: l.batteryHours,
      weightKg: l.weightKg,
      mobilityScore: l.mobilityScore,
      category: l.category,
      condition: l.condition,
      imageUrl: l.imageUrl,
    });

    const topsisRecordsToInsert: {
      kuisionerJawabanId: number;
      laptopId: number;
      kondisi: string;
      nilaiV: number;
      peringkat: number;
    }[] = [];

    const topLaptopsForAi: {
      laptop: Awaited<ReturnType<typeof fetchCandidates>>[0];
      peringkat: number;
      nilaiV: number;
    }[] = [];

    // 4A. Hitung TOPSIS untuk Laptop Baru jika diminta
    if (wantsBaru) {
      const laptopsBaru = await fetchCandidates('baru');
      if (laptopsBaru.length > 0) {
        const topsisBaru = calculateTopsis(
          laptopsBaru.map(toLaptopData),
          rocWeightsMap,
          criteriaTypes,
          peruntukanText
        );

        for (const item of topsisBaru.ranked) {
          topsisRecordsToInsert.push({
            kuisionerJawabanId: jawaban.id,
            laptopId: item.laptopId,
            kondisi: 'baru',
            nilaiV: item.nilaiV,
            peringkat: item.peringkat,
          });
        }

        const topSlice = topsisBaru.ranked.slice(0, wantsSecond ? 3 : 5);
        for (const r of topSlice) {
          const found = laptopsBaru.find((l) => l.id === r.laptopId);
          if (found) {
            topLaptopsForAi.push({ laptop: found, peringkat: r.peringkat, nilaiV: r.nilaiV });
          }
        }
      }
    }

    // 4B. Hitung TOPSIS untuk Laptop Second jika diminta
    if (wantsSecond) {
      const laptopsSecond = await fetchCandidates('second');
      if (laptopsSecond.length > 0) {
        const topsisSecond = calculateTopsis(
          laptopsSecond.map(toLaptopData),
          rocWeightsMap,
          criteriaTypes,
          peruntukanText
        );

        for (const item of topsisSecond.ranked) {
          topsisRecordsToInsert.push({
            kuisionerJawabanId: jawaban.id,
            laptopId: item.laptopId,
            kondisi: 'second',
            nilaiV: item.nilaiV,
            peringkat: item.peringkat,
          });
        }

        const topSlice = topsisSecond.ranked.slice(0, wantsBaru ? 3 : 5);
        for (const r of topSlice) {
          const found = laptopsSecond.find((l) => l.id === r.laptopId);
          if (found) {
            topLaptopsForAi.push({ laptop: found, peringkat: r.peringkat, nilaiV: r.nilaiV });
          }
        }
      }
    }

    // Batch insert semua hasil TOPSIS (1 roundtrip menggantikan 50+ query serial)
    if (topsisRecordsToInsert.length > 0) {
      await prisma.hasilTopsis.createMany({ data: topsisRecordsToInsert });
    }

    // 5. Generate AI Explanations secara PARALEL (Promise.all) untuk kecepatan instan
    const jawabanForAi = {
      peruntukan: jawaban.peruntukan,
      frekuensiMembawa: jawaban.frekuensiMembawa,
      rankingKriteria: jawaban.rankingKriteria as string[],
    };

    const aiPromises = topLaptopsForAi.map(async ({ laptop, peringkat, nilaiV }) => {
      try {
        const penjelasan = await generateAiExplanation(
          {
            id: laptop.id,
            name: laptop.name,
            brand: laptop.brand,
            price: Number(laptop.price),
            condition: laptop.condition,
            ramGb: laptop.ramGb,
            storageGb: laptop.storageGb,
            batteryHours: laptop.batteryHours,
            weightKg: laptop.weightKg,
            performaKomposit: laptop.performaKomposit,
          },
          jawabanForAi,
          peringkat,
          nilaiV
        );
        return {
          kuisionerJawabanId: jawaban.id,
          laptopId: laptop.id,
          penjelasan,
        };
      } catch (err) {
        console.error('Error generating AI explanation for laptop', laptop.id, err);
        return null;
      }
    });

    const aiResults = (await Promise.all(aiPromises)).filter(
      (item): item is NonNullable<typeof item> => item !== null
    );

    if (aiResults.length > 0) {
      await prisma.penjelasanAi.createMany({ data: aiResults });
    }

    return NextResponse.json({ success: true, jawabanId: jawaban.id }, { status: 201 });
  } catch (error) {
    console.error('Questionnaire error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
