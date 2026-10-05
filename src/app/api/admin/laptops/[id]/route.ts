// app/api/admin/laptops/[id]/route.ts - API Admin: Update & Delete Laptop
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });

    const { id } = await params;
    const laptopId = parseInt(id);
    const body = await request.json();

    const existing = await prisma.laptop.findUnique({ where: { id: laptopId } });
    if (!existing) return NextResponse.json({ error: 'Laptop tidak ditemukan.' }, { status: 404 });

    const laptop = await prisma.laptop.update({
      where: { id: laptopId },
      data: {
        name: body.name,
        brand: body.brand,
        price: BigInt(body.price),
        condition: body.condition,
        category: body.category ?? null,
        performaKomposit: body.performaKomposit ?? null,
        processorScore: body.processorScore ?? null,
        vgaScore: body.vgaScore ?? null,
        ramGb: body.ramGb ?? null,
        storageGb: body.storageGb ?? null,
        displaySize: body.displaySize ?? null,
        batteryHours: body.batteryHours ?? null,
        weightKg: body.weightKg ?? null,
        mobilityScore: body.mobilityScore ?? null,
        imageUrl: body.imageUrl ?? null,
      },
    });

    return NextResponse.json({
      laptop: {
        ...laptop,
        price: laptop.price.toString(),
        createdAt: laptop.createdAt.toISOString(),
        updatedAt: laptop.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Admin update laptop error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });

    const { id } = await params;
    const laptopId = parseInt(id);

    const existing = await prisma.laptop.findUnique({ where: { id: laptopId } });
    if (!existing) return NextResponse.json({ error: 'Laptop tidak ditemukan.' }, { status: 404 });

    await prisma.laptop.delete({ where: { id: laptopId } });
    return NextResponse.json({ message: 'Laptop berhasil dihapus.' });
  } catch (error) {
    console.error('Admin delete laptop error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
