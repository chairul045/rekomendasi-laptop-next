// app/api/auth/profile/route.ts - GET & PATCH user profile
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let profile = await prisma.user.findUnique({ where: { id: user.id } });

    // Auto-create profile if missing (first login after Supabase signup)
    if (!profile) {
      profile = await prisma.user.create({
        data: {
          id: user.id,
          name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
          email: user.email!,
          role: 'mahasiswa',
        },
      });
    }

    // Stats: total konsultasi & laptop direkomendasikan
    const [totalKonsultasi, totalLaptopDirekomendasikan] = await Promise.all([
      prisma.kuisionerJawaban.count({ where: { userId: user.id } }),
      prisma.hasilTopsis.count({
        where: { kuisionerJawaban: { userId: user.id }, peringkat: 1 },
      }),
    ]);

    // Konsultasi terakhir
    const lastConsultation = await prisma.kuisionerJawaban.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        judul: true,
        peruntukan: true,
        createdAt: true,
        hasilTopsis: {
          where: { peringkat: 1 },
          include: { laptop: { select: { name: true, brand: true } } },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      createdAt: profile.createdAt,
      stats: {
        totalKonsultasi,
        totalLaptopDirekomendasikan,
      },
      lastConsultation: lastConsultation
        ? {
            id: lastConsultation.id,
            judul: lastConsultation.judul,
            peruntukan: lastConsultation.peruntukan,
            createdAt: lastConsultation.createdAt,
            topLaptop: lastConsultation.hasilTopsis[0]?.laptop ?? null,
          }
        : null,
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nama harus minimal 2 karakter.' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: name.trim() },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
