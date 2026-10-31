// app/api/auth/profile/route.ts - GET & PATCH user profile
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
          role: user.user_metadata?.role ?? 'mahasiswa',
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
          include: { laptop: { select: { id: true, name: true, brand: true, price: true } } },
          take: 1,
        },
      },
    });

    const topItem = lastConsultation?.hasilTopsis[0];

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
            topLaptop: topItem
              ? {
                  name: topItem.laptop.name,
                  brand: topItem.laptop.brand,
                  scorePct: Math.round(topItem.nilaiV * 10000) / 100,
                }
              : null,
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
    const { name, password, role } = body;

    if (!name && !password && !role) {
      return NextResponse.json({ error: 'Tidak ada data yang diubah.' }, { status: 400 });
    }

    if (name) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Nama harus minimal 2 karakter.' },
          { status: 400 }
        );
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
      await supabase.auth.updateUser({
        data: { name: name.trim() },
      });
    }

    if (role && typeof role === 'string' && role.trim().length > 0) {
      const current = await prisma.user.findUnique({ where: { id: user.id } });
      if (current && current.role !== 'admin') {
        const formattedRole = role.trim().toLowerCase();
        await prisma.user.update({
          where: { id: user.id },
          data: { role: formattedRole },
        });
        await supabase.auth.updateUser({
          data: { role: formattedRole },
        });
      }
    }

    if (password) {
      if (typeof password !== 'string' || password.length < 6) {
        return NextResponse.json(
          { error: 'Password baru minimal 6 karakter.' },
          { status: 400 }
        );
      }
      const { error: pwdErr } = await supabase.auth.updateUser({ password });
      if (pwdErr) {
        return NextResponse.json({ error: pwdErr.message || 'Gagal mengubah password.' }, { status: 400 });
      }
    }

    const updated = await prisma.user.findUnique({ where: { id: user.id } });

    return NextResponse.json({
      id: updated?.id,
      name: updated?.name,
      email: updated?.email,
      role: updated?.role,
    });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

// DELETE user account and all associated consultation data
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 1. Hapus data pengguna di Prisma (akan cascade ke kuisioner_jawaban, hasil_topsis, dll)
    await prisma.user.delete({
      where: { id: userId },
    });

    // 2. Hapus data pengguna di Supabase Auth via admin client
    try {
      const adminClient = createAdminClient();
      await adminClient.auth.admin.deleteUser(userId);
    } catch (adminErr) {
      console.warn('Supabase admin deleteUser warning:', adminErr);
    }

    // 3. Sign out session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true, message: 'Akun Anda berhasil dihapus secara permanen.' });
  } catch (error) {
    console.error('Profile DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus akun.' }, { status: 500 });
  }
}
