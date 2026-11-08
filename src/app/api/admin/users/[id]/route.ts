// src/app/api/admin/users/[id]/route.ts - Update Role & Delete User
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isSuperAdminEmail } from '@/lib/auth-constants';
import { checkAdminAuth } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: 'Role wajib diisi.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({ user: updated, message: 'Role pengguna berhasil diperbarui.' });
  } catch (err: unknown) {
    console.error('Update user role error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui pengguna.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    if (isSuperAdminEmail(targetUser.email)) {
      return NextResponse.json({ error: 'Akun Super Administrator utama tidak boleh dihapus.' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: 'Pengguna berhasil dihapus.' });
  } catch (err: unknown) {
    console.error('Delete user error:', err);
    return NextResponse.json({ error: 'Gagal menghapus pengguna.' }, { status: 500 });
  }
}
