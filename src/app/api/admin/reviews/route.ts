// src/app/api/admin/reviews/route.ts - Admin Reviews Moderation & Management API
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/admin-auth';
import type { Prisma } from '@prisma/client';

export const INITIAL_FALLBACK_REVIEWS = [
  {
    id: 'rev-1',
    laptopId: 1,
    laptopName: 'ASUS ROG Zephyrus G14 (2024)',
    brand: 'ASUS',
    userName: 'Dimas Pratama',
    userRole: 'Mahasiswa TI',
    rating: 5,
    comment:
      'Laptop idaman koding dan desain! Baterai awet banget untuk ukuran laptop berspek monster. Layar OLED-nya luar biasa jernih.',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev-2',
    laptopId: 2,
    laptopName: 'Lenovo IdeaPad Slim 3 14IAH8',
    brand: 'Lenovo',
    userName: 'Siti Rahmawati',
    userRole: 'Mahasiswa Manajemen',
    rating: 5,
    comment:
      'Sangat pas dengan budget 6 jutaan. Ngetik skripsi berjam-jam keyboardnya empuk banget. Sangat rekomendasi buat anak kuliah.',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'rev-3',
    laptopId: 3,
    laptopName: 'MacBook Air M2 (2022)',
    brand: 'Apple',
    userName: 'Rian Hidayat',
    userRole: 'Mahasiswa DKV',
    rating: 5,
    comment:
      'Editing video dan render di DaVinci Resolve mulus tanpa kipas berisik. Baterai tahan seharian di kampus tanpa bawa charger.',
    status: 'published',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'rev-4',
    laptopId: 4,
    laptopName: 'Acer Nitro V 15 ANV15',
    brand: 'Acer',
    userName: 'Fajar Nugraha',
    userRole: 'Mahasiswa Sistem Informasi',
    rating: 4,
    comment:
      'Performa RTX 2050-nya kencang untuk game online dan render tugas 3D. Agak sedikit hangat saat gaming berat tapi wajar.',
    status: 'published',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'rev-5',
    laptopId: 5,
    laptopName: 'HP Pavilion 14-dv2053TU',
    brand: 'HP',
    userName: 'Anisa Putri',
    userRole: 'Mahasiswa Akuntansi',
    rating: 5,
    comment:
      'Bodi tipis dan elegan, mudah dibawa ke perpustakaan. Speaker B&O jernih buat dengerin webinar kuliah online.',
    status: 'published',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 'rev-6',
    laptopId: 6,
    laptopName: 'Axioo Hype 5 AMD X3',
    brand: 'Axioo',
    userName: 'Budi Santoso',
    userRole: 'Mahasiswa Teknik Elektro',
    rating: 4,
    comment:
      'Laptop lokal yang sangat worth it untuk harga 4-5 jutaan. RAM 16GB sudah cukup banget buat simulasi Proteus dan MATLAB.',
    status: 'published',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

const inMemoryAdminReviews = [...INITIAL_FALLBACK_REVIEWS];

export async function GET(request: NextRequest) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Akses ditolak. Khusus admin.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const ratingParam = searchParams.get('rating');

    const whereClause: Prisma.ReviewWhereInput = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (ratingParam && ratingParam !== 'all') {
      const r = parseInt(ratingParam, 10);
      if (!isNaN(r)) whereClause.rating = r;
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        laptop: {
          select: {
            id: true,
            name: true,
            brand: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (reviews.length > 0) {
      const formatted = reviews.map((r) => ({
        id: r.id,
        laptopId: r.laptopId,
        laptopName: r.laptop.name,
        brand: r.laptop.brand,
        userName: r.userName,
        userRole: r.userRole,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      }));
      return NextResponse.json({ reviews: formatted });
    }

    // Fallback if table is empty
    return NextResponse.json({ reviews: inMemoryAdminReviews });
  } catch (error) {
    console.warn('Admin GET reviews db error, returning fallback reviews:', error);
    return NextResponse.json({ reviews: inMemoryAdminReviews });
  }
}
