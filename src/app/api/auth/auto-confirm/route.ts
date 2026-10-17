// app/api/auth/auto-confirm/route.ts - Auto-confirm user so no admin approval or email link is required
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://njnvkjhnefmawskhcbdy.supabase.co',
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'Supabase admin service key is not configured.' }, { status: 500 });
    }
    const { data, error: listError } = await serviceClient.auth.admin.listUsers();

    if (listError) {
      console.error('List users error:', listError);
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const targetUser = data.users.find(
      (u) => u.email?.trim().toLowerCase() === email.trim().toLowerCase()
    );

    if (!targetUser) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
    }

    // Konfirmasi email jika belum aktif
    if (!targetUser.email_confirmed_at) {
      const { error: updateError } = await serviceClient.auth.admin.updateUserById(
        targetUser.id,
        { email_confirm: true }
      );
      if (updateError) {
        console.error('Auto-confirm update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    // Pastikan user ada di database PostgreSQL Prisma
    await prisma.user.upsert({
      where: { email: targetUser.email! },
      update: {},
      create: {
        id: targetUser.id,
        name: targetUser.user_metadata?.name || email.split('@')[0],
        email: targetUser.email!,
        role: 'mahasiswa',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil dikonfirmasi langsung tanpa izin admin.',
    });
  } catch (error: any) {
    console.error('Auto-confirm error:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan server saat konfirmasi.' },
      { status: 500 }
    );
  }
}
