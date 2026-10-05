// app/api/recommendation/[id]/route.ts - GET hasil rekomendasi
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jawabanId = parseInt(id);

    const jawaban = await prisma.kuisionerJawaban.findUnique({
      where: { id: jawabanId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        bobotHasil: { include: { kriteria: true }, orderBy: { prioritas: 'asc' } },
        hasilTopsis: {
          include: { laptop: true },
          orderBy: [{ kondisi: 'asc' }, { peringkat: 'asc' }],
        },
        penjelasanAi: true,
      },
    });

    if (!jawaban) {
      return NextResponse.json({ error: 'Data tidak ditemukan.' }, { status: 404 });
    }

    // Cek akses: hanya pemilik atau admin
    const userId = user.id;

    // Check user role from DB
    const userProfile = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = userProfile?.role === 'admin';

    if (jawaban.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    // Pisahkan hasil baru dan second, top 5 masing-masing
    const hasilBaru = jawaban.hasilTopsis
      .filter((h: (typeof jawaban.hasilTopsis)[0]) => h.kondisi === 'baru')
      .slice(0, 5);
    const hasilSecond = jawaban.hasilTopsis
      .filter((h: (typeof jawaban.hasilTopsis)[0]) => h.kondisi === 'second')
      .slice(0, 5);

    const explanations = Object.fromEntries(
      jawaban.penjelasanAi.map((p: (typeof jawaban.penjelasanAi)[0]) => [p.laptopId, p.penjelasan])
    );

    // Serialisasi BigInt
    const serialize = (obj: unknown): unknown => {
      if (typeof obj === 'bigint') return obj.toString();
      if (Array.isArray(obj)) return obj.map(serialize);
      if (obj && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, serialize(v)])
        );
      }
      return obj;
    };

    return NextResponse.json(
      serialize({
        jawaban: {
          id: jawaban.id,
          judul: jawaban.judul,
          peruntukan: jawaban.peruntukan,
          budgetMin: jawaban.budgetMin,
          budgetMax: jawaban.budgetMax,
          kondisiPilihan: jawaban.kondisiPilihan,
          frekuensiMembawa: jawaban.frekuensiMembawa,
          rankingKriteria: jawaban.rankingKriteria,
          merekPilihan: jawaban.merekPilihan,
          tanggalPengisian: jawaban.tanggalPengisian,
          user: jawaban.user,
          bobotHasil: jawaban.bobotHasil,
        },
        hasilBaru,
        hasilSecond,
        explanations,
      })
    );
  } catch (error) {
    console.error('Recommendation GET error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

// DELETE riwayat
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jawabanId = parseInt(id);
    const userId = user.id;

    // Check user role
    const userProfile = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = userProfile?.role === 'admin';

    const jawaban = await prisma.kuisionerJawaban.findUnique({ where: { id: jawabanId } });
    if (!jawaban) {
      return NextResponse.json({ error: 'Data tidak ditemukan.' }, { status: 404 });
    }
    if (jawaban.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    await prisma.kuisionerJawaban.delete({ where: { id: jawabanId } });
    return NextResponse.json({ message: 'Riwayat berhasil dihapus.' });
  } catch (error) {
    console.error('Recommendation DELETE error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
