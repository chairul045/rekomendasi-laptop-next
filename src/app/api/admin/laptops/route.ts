// app/api/admin/laptops/route.ts - API Admin: Create Laptop + GET Brands
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.user.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== 'admin') return null;
  return user;
}

// GET: Ambil daftar brand unik dari database (dipakai di form kuisioner)
export async function GET() {
  try {
    const brands = await prisma.laptop.groupBy({
      by: ['brand'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
    return NextResponse.json({
      brands: brands.map((b) => ({ name: b.brand, count: b._count.id })),
    });
  } catch (error) {
    console.error('GET brands error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });

    const body = await request.json();
    const {
      name, brand, price, condition, category,
      performaKomposit, processorScore, vgaScore,
      ramGb, storageGb, displaySize, batteryHours,
      weightKg, mobilityScore, imageUrl,
    } = body;

    if (!name || !brand || !price) {
      return NextResponse.json({ error: 'Nama, brand, dan harga wajib diisi.' }, { status: 400 });
    }

    const laptop = await prisma.laptop.create({
      data: {
        name, brand, price: BigInt(price), condition: condition || 'baru',
        category: category || null,
        performaKomposit: performaKomposit ?? null,
        processorScore: processorScore ?? null,
        vgaScore: vgaScore ?? null,
        ramGb: ramGb ?? null,
        storageGb: storageGb ?? null,
        displaySize: displaySize ?? null,
        batteryHours: batteryHours ?? null,
        weightKg: weightKg ?? null,
        mobilityScore: mobilityScore ?? null,
        imageUrl: imageUrl ?? null,
      },
    });

    return NextResponse.json({
      laptop: { ...laptop, price: laptop.price.toString(), createdAt: laptop.createdAt.toISOString(), updatedAt: laptop.updatedAt.toISOString() },
    }, { status: 201 });
  } catch (error) {
    console.error('Admin create laptop error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
