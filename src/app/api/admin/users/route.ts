// src/app/api/admin/users/route.ts - Admin Users Management API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { isSuperAdminEmail } from '@/lib/auth-constants';

async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.user.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== 'admin' || !isSuperAdminEmail(profile.email)) {
    return null;
  }

  return profile;
}

export async function GET(request: NextRequest) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Akses ditolak: Hanya Administrator resmi yang diizinkan.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';

  try {
    const where: any = {};
    if (search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role && role !== 'all') {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            kuisionerJawaban: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      totalConsultations: u._count.kuisionerJawaban,
    }));

    return NextResponse.json({ users: formatted, total: formatted.length });
  } catch (err: any) {
    console.error('Admin users GET error:', err);
    return NextResponse.json({ error: 'Gagal mengambil data pengguna.' }, { status: 500 });
  }
}
