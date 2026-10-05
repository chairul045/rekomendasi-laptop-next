// app/api/questionnaire/route.ts - API Proses Kuisioner (ROC + TOPSIS + AI)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { calculateRocWeights } from '@/lib/roc';
import { calculateTopsis } from '@/lib/topsis';
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
      kondisiPilihan,
      frekuensiMembawa,
      judul,
    } = body;

    // Validasi input
    if (!rankingKriteria || !Array.isArray(rankingKriteria) || rankingKriteria.length !== 6) {
      return NextResponse.json({ error: 'Ranking kriteria tidak valid.' }, { status: 400 });
    }

    const userId = user.id; // UUID string

    // Auto-create profile jika belum ada
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: userId,
          name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
          email: user.email!,
          role: 'mahasiswa',
        },
      });
    }

    // Simpan kuisioner jawaban
    const jawaban = await prisma.kuisionerJawaban.create({
      data: {
        userId,
        budgetMin: BigInt(budgetMin || 0),
        budgetMax: BigInt(budgetMax || 50000000),
        peruntukan: peruntukan || 'Kuliah',
        rankingKriteria: rankingKriteria,
        merekPilihan: merekPilihan || ['semua'],
        kondisiPilihan: kondisiPilihan || 'keduanya',
        frekuensiMembawa: frekuensiMembawa || 'Rutin',
        judul:
          judul ||
          `Konsultasi ${peruntukan} (${new Date().toLocaleDateString('id-ID')})`,
        tanggalPengisian: new Date(),
      },
    });

    // TAHAP 1: Hitung Bobot ROC
    const rocResult = calculateRocWeights(rankingKriteria);
    const rocWeightsMap: Record<string, number> = {};

    // Ambil data kriteria dari DB
    const criteriaDb = await prisma.kriteria.findMany();
    const criteriaByKode = Object.fromEntries(criteriaDb.map((k: typeof criteriaDb[0]) => [k.kode, k]));
    const criteriaTypes = Object.fromEntries(criteriaDb.map((k: typeof criteriaDb[0]) => [k.kode, k.tipe]));

    // Simpan bobot hasil
    for (const [code, data] of Object.entries(rocResult)) {
      const kriteriaModel = criteriaByKode[code];
      if (kriteriaModel) {
        await prisma.bobotKriteriaHasil.create({
          data: {
            kuisionerJawabanId: jawaban.id,
            kriteriaId: kriteriaModel.id,
            prioritas: data.prioritas,
            bobot: data.bobot,
          },
        });
      }
      rocWeightsMap[code] = data.bobot;
    }

    // TAHAP 2: Filter Laptop & Jalankan TOPSIS
    const merekArr = merekPilihan as string[];
    const isAllBrand = merekArr.includes('semua');

    let filteredLaptops = await prisma.laptop.findMany({
      where: {
        price: { gte: BigInt(budgetMin || 0), lte: BigInt(budgetMax || 50000000) },
        ...(isAllBrand ? {} : { brand: { in: merekArr } }),
      },
    });

    // Fallback jika kosong
    if (filteredLaptops.length === 0) {
      filteredLaptops = await prisma.laptop.findMany({
        where: isAllBrand ? {} : { brand: { in: merekArr } },
        take: 50,
      });
      if (filteredLaptops.length === 0) {
        filteredLaptops = await prisma.laptop.findMany({ take: 50 });
      }
    }

    const topLaptopsForAi: { laptop: (typeof filteredLaptops)[0]; peringkat: number; nilaiV: number }[] = [];

    // Konversi untuk TOPSIS
    const toLaptopData = (l: (typeof filteredLaptops)[0]) => ({
      id: l.id,
      name: l.name,
      brand: l.brand,
      price: l.price,
      performaKomposit: l.performaKomposit,
      ramGb: l.ramGb,
      storageGb: l.storageGb,
      batteryHours: l.batteryHours,
      weightKg: l.weightKg,
      condition: l.condition,
      imageUrl: l.imageUrl,
    });

    // 2A: Laptop Baru
    if (['baru', 'keduanya'].includes(kondisiPilihan)) {
      let laptopsBaru = filteredLaptops.filter((l) => l.condition === 'baru');
      if (laptopsBaru.length === 0) {
        laptopsBaru = await prisma.laptop.findMany({ where: { condition: 'baru' }, take: 30 });
      }

      if (laptopsBaru.length > 0) {
        const topsisBaru = calculateTopsis(laptopsBaru.map(toLaptopData), rocWeightsMap, criteriaTypes);
        for (const item of topsisBaru.ranked) {
          await prisma.hasilTopsis.create({
            data: {
              kuisionerJawabanId: jawaban.id,
              laptopId: item.laptopId,
              kondisi: 'baru',
              nilaiV: item.nilaiV,
              peringkat: item.peringkat,
            },
          });
        }
        topLaptopsForAi.push(
          ...topsisBaru.ranked.slice(0, 3).map((r) => ({
            laptop: laptopsBaru.find((l) => l.id === r.laptopId)!,
            peringkat: r.peringkat,
            nilaiV: r.nilaiV,
          }))
        );
      }
    }

    // 2B: Laptop Second
    if (['second', 'keduanya'].includes(kondisiPilihan)) {
      let laptopsSecond = filteredLaptops.filter((l) => l.condition === 'second');
      if (laptopsSecond.length === 0) {
        laptopsSecond = await prisma.laptop.findMany({ where: { condition: 'second' }, take: 30 });
      }

      if (laptopsSecond.length > 0) {
        const topsisSecond = calculateTopsis(laptopsSecond.map(toLaptopData), rocWeightsMap, criteriaTypes);
        for (const item of topsisSecond.ranked) {
          await prisma.hasilTopsis.create({
            data: {
              kuisionerJawabanId: jawaban.id,
              laptopId: item.laptopId,
              kondisi: 'second',
              nilaiV: item.nilaiV,
              peringkat: item.peringkat,
            },
          });
        }
        topLaptopsForAi.push(
          ...topsisSecond.ranked.slice(0, 3).map((r) => ({
            laptop: laptopsSecond.find((l) => l.id === r.laptopId)!,
            peringkat: r.peringkat,
            nilaiV: r.nilaiV,
          }))
        );
      }
    }

    // TAHAP 3: Generate AI Explanations
    const jawabanForAi = {
      peruntukan: jawaban.peruntukan,
      frekuensiMembawa: jawaban.frekuensiMembawa,
      rankingKriteria: jawaban.rankingKriteria as string[],
    };

    for (const { laptop, peringkat, nilaiV } of topLaptopsForAi.slice(0, 6)) {
      if (!laptop) continue;
      const existing = await prisma.penjelasanAi.findFirst({
        where: { kuisionerJawabanId: jawaban.id, laptopId: laptop.id },
      });
      if (!existing) {
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
        await prisma.penjelasanAi.create({
          data: { kuisionerJawabanId: jawaban.id, laptopId: laptop.id, penjelasan },
        });
      }
    }

    return NextResponse.json({ success: true, jawabanId: jawaban.id }, { status: 201 });
  } catch (error) {
    console.error('Questionnaire error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
