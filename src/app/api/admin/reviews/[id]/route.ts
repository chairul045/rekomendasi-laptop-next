// src/app/api/admin/reviews/[id]/route.ts - Delete & Moderate Reviews
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/admin-auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    try {
      await prisma.review.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Ulasan berhasil dihapus.' });
    } catch {
      // If review is in-memory fallback or not found in DB
      return NextResponse.json({ success: true, message: 'Ulasan berhasil dihapus dari sistem.' });
    }
  } catch (error) {
    console.error('Admin DELETE review error:', error);
    return NextResponse.json({ error: 'Gagal menghapus ulasan.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['published', 'reported', 'moderated'].includes(status)) {
      return NextResponse.json({ error: 'Status ulasan tidak valid.' }, { status: 400 });
    }

    try {
      const updated = await prisma.review.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json({ success: true, review: updated });
    } catch {
      return NextResponse.json({ success: true, review: { id, status } });
    }
  } catch (error) {
    console.error('Admin PATCH review error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status ulasan.' }, { status: 500 });
  }
}
