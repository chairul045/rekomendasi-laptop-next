// src/app/api/reviews/route.ts - Public & User API untuk Ulasan dan Rating Laptop
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import type { Prisma } from '@prisma/client';
import { checkReviewRateLimit } from '@/lib/review-rate-limiter';

function sanitizeText(str: string): string {
  return str.replace(/<[^>]*>?/gm, '').trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const laptopIdParam = searchParams.get('laptopId');
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);

    const whereClause: Prisma.ReviewWhereInput = {
      status: 'published',
    };

    if (laptopIdParam) {
      const laptopId = parseInt(laptopIdParam, 10);
      if (!isNaN(laptopId)) {
        whereClause.laptopId = laptopId;
      }
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        laptop: {
          select: {
            id: true,
            name: true,
            brand: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('GET reviews error:', error);
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(request: NextRequest) {
  // 1. Ekstraksi status autentikasi pengguna lebih awal untuk menentukan basis rate limit (userId vs IP)
  let authUserId: string | null = null;
  let reviewerName = 'Mahasiswa Pengguna';
  let reviewerRole = 'Mahasiswa'; // Default role aman, tidak bisa dispoof via body

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      authUserId = user.id;
      const profile = await prisma.user.findUnique({ where: { id: user.id } });
      if (profile) {
        reviewerName = profile.name;
        reviewerRole = profile.role === 'admin' ? 'Admin Lapmatch' : 'Mahasiswa Terverifikasi';
      }
    }
  } catch {
    // Guest reviewer fallback
  }

  // 2. Pemeriksaan Rate Limiting (Upstash Redis Sliding Window 5 review / 10 menit + Strict Fallback)
  const rateLimitResult = await checkReviewRateLimit(request, authUserId);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan pengiriman ulasan. Silakan coba 10 menit lagi.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfterSeconds),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimitResult.resetTime),
        },
      }
    );
  }

  // 3. Validasi Payload Review
  try {
    const body = await request.json();
    const { laptopId, rating, comment, userName } = body;

    const parsedLaptopId = Number(laptopId);
    const parsedRating = Number(rating);

    if (!parsedLaptopId || isNaN(parsedLaptopId)) {
      return NextResponse.json({ error: 'ID laptop wajib disertakan.' }, { status: 400 });
    }

    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: 'Rating harus bernilai antara 1 hingga 5 bintang.' },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
      return NextResponse.json(
        { error: 'Ulasan wajib diisi minimal 3 karakter.' },
        { status: 400 }
      );
    }

    if (comment.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Ulasan maksimal 1000 karakter.' },
        { status: 400 }
      );
    }

    // Periksa apakah laptop ada di basis data
    const laptopExists = await prisma.laptop.findUnique({
      where: { id: parsedLaptopId },
      select: { id: true },
    });

    if (!laptopExists) {
      return NextResponse.json(
        { error: 'Laptop tidak ditemukan dalam basis data.' },
        { status: 404 }
      );
    }

    // Terapkan nama khusus guest jika bukan pengguna terautentikasi
    if (!authUserId && userName) {
      const cleanGuestName = sanitizeText(userName);
      if (cleanGuestName.length > 0) {
        reviewerName = cleanGuestName.substring(0, 60);
      }
    }

    const cleanComment = sanitizeText(comment);

    const newReview = await prisma.review.create({
      data: {
        laptopId: parsedLaptopId,
        userId: authUserId,
        userName: reviewerName,
        userRole: reviewerRole,
        rating: Math.round(parsedRating),
        comment: cleanComment,
        status: 'published',
      },
      include: {
        laptop: {
          select: {
            id: true,
            name: true,
            brand: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, review: newReview },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.resetTime),
        },
      }
    );
  } catch (error: unknown) {
    console.error('POST review error:', error);
    return NextResponse.json(
      { error: 'Gagal mengirimkan ulasan. Silakan coba beberapa saat lagi.' },
      { status: 500 }
    );
  }
}
