// app/api/history/route.ts - GET riwayat konsultasi user
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = 9;
    const search = searchParams.get('search') || '';
    const peruntukan = searchParams.get('peruntukan') || '';
    const kondisi = searchParams.get('kondisi') || '';

    const userId = user.id; // UUID string

    const where = {
      userId,
      ...(peruntukan ? { peruntukan } : {}),
      ...(kondisi ? { kondisiPilihan: kondisi } : {}),
      ...(search
        ? {
            OR: [
              { judul: { contains: search, mode: 'insensitive' as const } },
              { peruntukan: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, consultations] = await Promise.all([
      prisma.kuisionerJawaban.count({ where }),
      prisma.kuisionerJawaban.findMany({
        where,
        include: {
          bobotHasil: { include: { kriteria: true }, orderBy: { prioritas: 'asc' } },
          hasilTopsis: {
            include: { laptop: true },
            orderBy: { peringkat: 'asc' },
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    // Serialize BigInt
    const serialize = (obj: unknown): unknown => {
      if (typeof obj === 'bigint') return obj.toString();
      if (Array.isArray(obj)) return obj.map(serialize);
      if (obj && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, serialize(v)])
        );
      }
      return obj;
    };

    return NextResponse.json(
      serialize({
        data: consultations,
        meta: {
          total,
          page,
          perPage,
          lastPage: Math.ceil(total / perPage),
        },
      })
    );
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
