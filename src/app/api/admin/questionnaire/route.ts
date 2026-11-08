// src/app/api/admin/questionnaire/route.ts - Kriteria & Riwayat Kuesioner Admin
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/admin-auth';

export async function GET() {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    const [kriteriaList, rawConsultations, totalCount] = await Promise.all([
      prisma.kriteria.findMany({ orderBy: { kode: 'asc' } }),
      prisma.kuisionerJawaban.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          hasilTopsis: {
            where: { peringkat: 1 },
            take: 1,
            include: {
              laptop: {
                select: {
                  id: true,
                  name: true,
                  brand: true,
                  price: true,
                  condition: true,
                },
              },
            },
          },
        },
      }),
      prisma.kuisionerJawaban.count(),
    ]);

    const consultations = rawConsultations.map((c) => ({
      id: c.id,
      userId: c.userId,
      userName: c.user?.name || 'Anonim',
      userEmail: c.user?.email || '-',
      userRole: c.user?.role || 'mahasiswa',
      judul: c.judul,
      peruntukan: c.peruntukan,
      budgetMin: c.budgetMin.toString(),
      budgetMax: c.budgetMax.toString(),
      kondisiPilihan: c.kondisiPilihan,
      frekuensiMembawa: c.frekuensiMembawa,
      createdAt: c.createdAt.toISOString(),
      topLaptop: c.hasilTopsis[0]?.laptop
        ? {
            id: c.hasilTopsis[0].laptop.id,
            name: c.hasilTopsis[0].laptop.name,
            brand: c.hasilTopsis[0].laptop.brand,
            price: c.hasilTopsis[0].laptop.price.toString(),
            condition: c.hasilTopsis[0].laptop.condition,
            nilaiV: c.hasilTopsis[0].nilaiV,
          }
        : null,
    }));

    return NextResponse.json({
      kriteria: kriteriaList,
      consultations,
      totalCount,
    });
  } catch (err: any) {
    console.error('Admin questionnaire GET error:', err);
    return NextResponse.json({ error: 'Gagal mengambil data kuesioner.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, nama, tipe, deskripsi } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID kriteria diperlukan.' }, { status: 400 });
    }

    const updated = await prisma.kriteria.update({
      where: { id: Number(id) },
      data: {
        ...(nama ? { nama } : {}),
        ...(tipe ? { tipe } : {}),
        ...(deskripsi !== undefined ? { deskripsi } : {}),
      },
    });

    return NextResponse.json({ kriteria: updated, message: 'Kriteria berhasil diperbarui.' });
  } catch (err: any) {
    console.error('Update kriteria error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui kriteria.' }, { status: 500 });
  }
}
