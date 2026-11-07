// app/api/banners/route.ts - Public endpoint untuk banner iklan slider aktif
import { NextResponse } from 'next/server';
import { getActiveBanners } from '@/lib/banner-store';

export async function GET() {
  try {
    const banners = getActiveBanners();
    return NextResponse.json(
      { banners },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('GET banners error:', error);
    return NextResponse.json({ error: 'Gagal memuat banner iklan.' }, { status: 500 });
  }
}
