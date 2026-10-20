// app/api/auth/register/route.ts - Buat akun user langsung via Supabase Admin API
// Langsung aktif (email_confirm: true) tanpa perlu verifikasi email atau izin admin manual
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import { createClient as createServerClient } from '@/lib/supabase/server';

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
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter.' },
        { status: 400 }
      );
    }

    const userRole =
      typeof role === 'string' && role.trim().length > 0
        ? role.trim().toLowerCase()
        : 'mahasiswa';

    const normalizedEmail = email.trim().toLowerCase();
    const serviceClient = getServiceClient();

    // Pastikan user dibuat via Supabase Admin API dengan email_confirm: true (langsung aktif)
    let authUserId: string | null = null;

    if (serviceClient) {
      const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { name: name.trim(), role: userRole },
      });

      if (authError) {
        // Jika akun sudah pernah dibuat sebelumnya di Supabase Auth tapi mungkin belum aktif
        if (
          authError.message.toLowerCase().includes('already registered') ||
          authError.message.toLowerCase().includes('already exists')
        ) {
          const { data: listData } = await serviceClient.auth.admin.listUsers({ perPage: 1000 });
          const existing = listData?.users?.find(
            (u) => u.email?.toLowerCase() === normalizedEmail
          );

          if (existing) {
            // Aktifkan langsung dan perbarui kata sandi baru
            await serviceClient.auth.admin.updateUserById(existing.id, {
              email_confirm: true,
              password: password,
              user_metadata: { name: name.trim(), role: userRole },
            });
            authUserId = existing.id;
          }
        } else {
          return NextResponse.json(
            { error: authError.message || 'Gagal membuat akun di sistem autentikasi.' },
            { status: 400 }
          );
        }
      } else if (authData?.user) {
        authUserId = authData.user.id;
      }
    }

    // Fallback jika serviceClient gagal
    if (!authUserId) {
      const serverClient = await createServerClient();
      const { data: authData, error: authError } = await serverClient.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { name: name.trim(), role: userRole },
        },
      });

      if (authError && !authError.message.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { error: authError.message || 'Gagal membuat akun.' },
          { status: 400 }
        );
      }

      if (authData?.user) {
        authUserId = authData.user.id;
        if (serviceClient) {
          await serviceClient.auth.admin.updateUserById(authUserId, { email_confirm: true });
        }
      }
    }

    if (!authUserId) {
      const dbUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (dbUser) {
        authUserId = dbUser.id;
      } else {
        return NextResponse.json(
          { error: 'Gagal membuat atau mengonfirmasi akun pengguna.' },
          { status: 500 }
        );
      }
    }

    // Simpan / update ke database PostgreSQL Prisma
    const savedUser = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: { name: name.trim(), role: userRole },
      create: {
        id: authUserId,
        name: name.trim(),
        email: normalizedEmail,
        role: userRole,
      },
    });

    return NextResponse.json(
      {
        message: 'Akun berhasil dibuat dan langsung aktif!',
        userId: savedUser.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan pada server saat mendaftar.' },
      { status: 500 }
    );
  }
}
