// app/api/admin/banners/route.ts - Admin endpoints untuk manajemen iklan slider
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { isSuperAdminEmail } from '@/lib/auth-constants';
import { getAllBanners, addBanner } from '@/lib/banner-store';

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

// GET: Ambil semua banner (aktif maupun non-aktif) untuk panel admin
export async function GET() {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Khusus admin.' }, { status: 403 });
    }

    const banners = getAllBanners();
    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Admin GET banners error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

// POST: Tambah banner iklan baru
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Khusus admin.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      brand,
      subtitle,
      price,
      originalPrice,
      discount,
      badge,
      processor,
      vga,
      ramGb,
      storageGb,
      display,
      imageUrl,
      tokopediaUrl,
      shopeeUrl,
      isActive = true,
      sortOrder = 0,
    } = body;

    if (!title || !brand || price === undefined) {
      return NextResponse.json(
        { error: 'Judul iklan, merek laptop, dan harga wajib diisi.' },
        { status: 400 }
      );
    }

    const newBanner = addBanner({
      title: title.trim(),
      brand: brand.trim(),
      subtitle: subtitle?.trim() || '',
      price: Number(price) || 0,
      originalPrice: Number(originalPrice) || Number(price) * 1.1,
      discount: discount?.trim() || 'Best Deal',
      badge: badge?.trim() || '⭐ Rekomendasi Unggulan',
      processor: processor?.trim() || 'Performa Tinggi AI Terkini',
      vga: vga?.trim() || 'Dedicated GPU',
      ramGb: Number(ramGb) || 16,
      storageGb: Number(storageGb) || 512,
      display: display?.trim() || 'IPS High Refresh Rate Display',
      imageUrl:
        imageUrl?.trim() ||
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
      tokopediaUrl: tokopediaUrl?.trim() || '',
      shopeeUrl: shopeeUrl?.trim() || '',
      isActive: Boolean(isActive),
      sortOrder: Number(sortOrder) || 0,
    });

    return NextResponse.json({ success: true, banner: newBanner }, { status: 201 });
  } catch (error) {
    console.error('Admin POST banner error:', error);
    return NextResponse.json({ error: 'Gagal membuat banner iklan.' }, { status: 500 });
  }
}
