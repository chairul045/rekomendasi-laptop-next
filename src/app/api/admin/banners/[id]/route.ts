// app/api/admin/banners/[id]/route.ts - Update, Delete & Toggle status banner
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { isSuperAdminEmail } from '@/lib/auth-constants';
import { updateBanner, deleteBanner, toggleBannerStatus } from '@/lib/banner-store';

async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.user.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== 'admin' || !isSuperAdminEmail(profile.email)) return null;
  return profile;
}

// PUT: Perbarui data banner iklan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updated = updateBanner(id, {
      ...body,
      price: body.price !== undefined ? Number(body.price) : undefined,
      originalPrice: body.originalPrice !== undefined ? Number(body.originalPrice) : undefined,
      ramGb: body.ramGb !== undefined ? Number(body.ramGb) : undefined,
      storageGb: body.storageGb !== undefined ? Number(body.storageGb) : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Banner tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, banner: updated });
  } catch (error) {
    console.error('Admin PUT banner error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui banner.' }, { status: 500 });
  }
}

// DELETE: Hapus banner iklan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { id } = await params;
    const success = deleteBanner(id);
    if (!success) {
      return NextResponse.json({ error: 'Banner tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Banner berhasil dihapus.' });
  } catch (error) {
    console.error('Admin DELETE banner error:', error);
    return NextResponse.json({ error: 'Gagal menghapus banner.' }, { status: 500 });
  }
}

// PATCH: Toggle active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { id } = await params;
    const updated = toggleBannerStatus(id);
    if (!updated) {
      return NextResponse.json({ error: 'Banner tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, banner: updated });
  } catch (error) {
    console.error('Admin PATCH banner error:', error);
    return NextResponse.json({ error: 'Gagal mengubah status banner.' }, { status: 500 });
  }
}
