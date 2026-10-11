// app/api/admin/laptops/import/route.ts - API Bulk Import Data Laptop via Excel/CSV
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.user.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== 'admin') return null;
  return user;
}

export interface RawImportLaptop {
  name: string;
  brand: string;
  price: string | number;
  condition?: string;
  category?: string;
  performaKomposit?: string | number | null;
  processorScore?: string | number | null;
  vgaScore?: string | number | null;
  ramGb?: string | number | null;
  storageGb?: string | number | null;
  displaySize?: string | number | null;
  batteryHours?: string | number | null;
  weightKg?: string | number | null;
  mobilityScore?: string | number | null;
  imageUrl?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Khusus administrator.' }, { status: 403 });
    }

    const body = await request.json();
    const rawLaptops: RawImportLaptop[] = body?.laptops;

    if (!Array.isArray(rawLaptops) || rawLaptops.length === 0) {
      return NextResponse.json({ error: 'Data laptop kosong atau tidak valid.' }, { status: 400 });
    }

    const validLaptops: {
      name: string;
      brand: string;
      price: bigint;
      condition: string;
      category: string | null;
      performaKomposit: number | null;
      processorScore: number | null;
      vgaScore: number | null;
      ramGb: number | null;
      storageGb: number | null;
      displaySize: number | null;
      batteryHours: number | null;
      weightKg: number | null;
      mobilityScore: number | null;
      imageUrl: string | null;
    }[] = [];

    const skippedRows: { index: number; reason: string }[] = [];

    const parseNum = (val: unknown): number | null => {
      if (val === null || val === undefined || val === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    const parseCleanPrice = (val: unknown): bigint | null => {
      if (!val) return null;
      const cleaned = String(val).replace(/[^0-9]/g, '');
      if (!cleaned) return null;
      try {
        const big = BigInt(cleaned);
        return big > 0n ? big : null;
      } catch {
        return null;
      }
    };

    rawLaptops.forEach((item, idx) => {
      const name = String(item.name || '').trim();
      const brand = String(item.brand || '').trim();
      const priceBig = parseCleanPrice(item.price);

      if (!name) {
        skippedRows.push({ index: idx + 1, reason: 'Nama laptop kosong' });
        return;
      }
      if (!brand) {
        skippedRows.push({ index: idx + 1, reason: `Brand kosong untuk "${name}"` });
        return;
      }
      if (!priceBig) {
        skippedRows.push({ index: idx + 1, reason: `Harga tidak valid untuk "${name}"` });
        return;
      }

      // Normalisasi kondisi
      const rawCond = String(item.condition || '').toLowerCase().trim();
      const condition = rawCond.includes('sec') || rawCond.includes('bekas') ? 'second' : 'baru';

      // Normalisasi performa / skor
      const performa = parseNum(item.performaKomposit);
      const proc = parseNum(item.processorScore);
      const vga = parseNum(item.vgaScore);
      const ram = parseNum(item.ramGb);
      const storage = parseNum(item.storageGb);
      const display = parseNum(item.displaySize);
      const battery = parseNum(item.batteryHours);
      const weight = parseNum(item.weightKg);
      const mobility = parseNum(item.mobilityScore);

      validLaptops.push({
        name,
        brand,
        price: priceBig,
        condition,
        category: item.category ? String(item.category).trim() : null,
        performaKomposit: performa ?? (proc && vga ? Math.round(proc * 0.5 + vga * 0.5) : 50),
        processorScore: proc,
        vgaScore: vga,
        ramGb: ram,
        storageGb: storage,
        displaySize: display,
        batteryHours: battery,
        weightKg: weight,
        mobilityScore: mobility,
        imageUrl: item.imageUrl ? String(item.imageUrl).trim() : null,
      });
    });

    if (validLaptops.length === 0) {
      return NextResponse.json(
        {
          error: 'Tidak ada baris data yang valid untuk diimpor.',
          skippedRows,
        },
        { status: 400 }
      );
    }

    // Eksekusi insert bulk dengan createMany
    const insertResult = await prisma.laptop.createMany({
      data: validLaptops,
    });

    // Ambil daftar laptop terbaru untuk sinkronisasi state UI admin
    const latestLaptops = await prisma.laptop.findMany({
      orderBy: [{ brand: 'asc' }, { name: 'asc' }],
    });

    const serialized = latestLaptops.map((l) => ({
      ...l,
      price: l.price.toString(),
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      count: insertResult.count,
      skippedCount: skippedRows.length,
      skippedRows,
      laptops: serialized,
    });
  } catch (error) {
    console.error('Bulk import laptops error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server saat memproses import.' }, { status: 500 });
  }
}
