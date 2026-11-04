// app/api/questionnaire/guest/route.ts - Endpoint Simulasi Terbatas Tanpa Akun (Hasil Tidak Disimpan)
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateRocWeights } from '@/lib/roc';
import { calculateTopsis, LaptopData } from '@/lib/topsis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      budgetMin = 0,
      budgetMax = 50000000,
      peruntukan = 'Kuliah',
      rankingKriteria = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
      merekPilihan = ['semua'],
      kondisiPilihan = 'keduanya',
    } = body;

    const peruntukanText = Array.isArray(peruntukan)
      ? peruntukan.filter(Boolean).join(' & ') || 'Kuliah'
      : peruntukan || 'Kuliah';

    const validRanking = Array.isArray(rankingKriteria) && rankingKriteria.length === 6
      ? rankingKriteria
      : ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];

    const minPrice = BigInt(Math.max(0, Number(budgetMin) || 0));
    const maxPrice = BigInt(Math.max(Number(budgetMin) || 0, Number(budgetMax) || 50000000));

    // Filter katalog laptop berdasarkan budget dan kondisi
    const whereClause: any = {
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
      NOT: {
        ramGb: { lt: 4 },
      },
    };

    if (kondisiPilihan && kondisiPilihan !== 'keduanya') {
      whereClause.condition = kondisiPilihan;
    }

    if (
      Array.isArray(merekPilihan) &&
      merekPilihan.length > 0 &&
      !merekPilihan.includes('semua')
    ) {
      whereClause.brand = {
        in: merekPilihan,
        mode: 'insensitive',
      };
    }

    const rawLaptops = await prisma.laptop.findMany({
      where: whereClause,
      take: 30,
      orderBy: { price: 'asc' },
    });

    if (rawLaptops.length === 0) {
      return NextResponse.json({
        previewResults: [],
        isGuest: true,
        message: 'Tidak ada laptop yang cocok dalam rentang budget ini.',
      });
    }

    // Format data laptop untuk TOPSIS
    const laptopData: LaptopData[] = rawLaptops.map((l) => ({
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
    }));

    // Hitung bobot ROC
    const rocResult = calculateRocWeights(validRanking);
    const rocWeightsMap: Record<string, number> = {};
    for (const [code, val] of Object.entries(rocResult)) {
      rocWeightsMap[code] = val.bobot;
    }

    const criteriaDb = await prisma.kriteria.findMany();
    const criteriaTypes = Object.fromEntries(criteriaDb.map((k) => [k.kode, k.tipe]));

    // Hitung TOPSIS
    const topsisResult = calculateTopsis(
      laptopData,
      rocWeightsMap,
      criteriaTypes,
      peruntukanText
    );

    // Ambil maksimal 3 teratas untuk versi pratinjau tamu (terbatas)
    const previewResults = (topsisResult.ranked || []).slice(0, 3).map((item) => {
      const laptop = rawLaptops.find((l) => l.id === item.laptopId);
      return {
        peringkat: item.peringkat,
        skor: item.nilaiV,
        laptop: laptop
          ? {
              id: laptop.id,
              name: laptop.name,
              brand: laptop.brand,
              price: Number(laptop.price),
              ramGb: laptop.ramGb,
              storageGb: laptop.storageGb,
              batteryHours: laptop.batteryHours,
              weightKg: laptop.weightKg,
              imageUrl: laptop.imageUrl || laptop.image || '/logo.svg',
            }
          : null,
      };
    });

    return NextResponse.json({
      isGuest: true,
      peruntukan,
      totalFound: rawLaptops.length,
      previewResults,
    });
  } catch {
    return NextResponse.json(
      { error: 'Gagal memproses rekomendasi simulasi tamu.' },
      { status: 500 }
    );
  }
}
