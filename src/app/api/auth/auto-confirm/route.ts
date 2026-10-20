// app/api/auth/auto-confirm/route.ts - Auto-confirm user so no admin approval or email link is required
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error: listError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });

    if (listError) {
      console.error('List users error:', listError);
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const targetUser = data?.users?.find(
      (u) => u.email?.trim().toLowerCase() === normalizedEmail
    );

    if (!targetUser) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
    }

    // Konfirmasi email dan tandai email_verified: true
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      targetUser.id,
      {
        email_confirm: true,
        user_metadata: {
          ...(targetUser.user_metadata || {}),
          email_verified: true,
        },
      }
    );

    if (updateError) {
      console.error('Auto-confirm update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Pastikan user ada di database PostgreSQL Prisma
    await prisma.user.upsert({
      where: { email: targetUser.email! },
      update: {},
      create: {
        id: targetUser.id,
        name: targetUser.user_metadata?.name || normalizedEmail.split('@')[0],
        email: targetUser.email!,
        role: targetUser.user_metadata?.role || 'mahasiswa',
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
