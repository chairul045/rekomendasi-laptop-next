// app/api/auth/register/route.ts - Buat akun user langsung via Supabase Admin API
// Akun langsung 100% aktif (email_confirm: true) tanpa perlu persetujuan admin atau link konfirmasi email
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { sanitizeUserRole } from '@/lib/auth-constants';

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

    const normalizedEmail = email.trim().toLowerCase();
    const userRole = sanitizeUserRole(normalizedEmail, role);
    const adminClient = createAdminClient();

    let authUserId: string | null = null;

    // 1. Buat akun baru via Admin API dengan email_confirm: true
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        role: userRole,
        email_verified: true,
      },
    });

    if (authError) {
      // Jika email sudah pernah dibuat/terdaftar di Supabase Auth
      const errMsg = authError.message.toLowerCase();
      if (
        errMsg.includes('already registered') ||
        errMsg.includes('already exists') ||
        (authError as any).code === 'email_exists' ||
        (authError as any).status === 422
      ) {
        const { data: listData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
        const existing = listData?.users?.find(
          (u) => u.email?.toLowerCase() === normalizedEmail
        );

        if (existing) {
          // Aktifkan langsung dan perbarui kata sandi baru serta metadata
          await adminClient.auth.admin.updateUserById(existing.id, {
            email_confirm: true,
            password: password,
            user_metadata: {
              ...(existing.user_metadata || {}),
              name: name.trim(),
              role: userRole,
              email_verified: true,
            },
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
      // Pastikan email_confirm benar-benar aktif
      if (!authData.user.email_confirmed_at) {
        await adminClient.auth.admin.updateUserById(authUserId, { email_confirm: true });
      }
    }

    // 2. Fallback darurat jika authUserId belum didapat
    if (!authUserId) {
      const serverClient = await createServerClient();
      const { data: fallbackData, error: fallbackError } = await serverClient.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { name: name.trim(), role: userRole, email_verified: true },
        },
      });

      if (fallbackError && !fallbackError.message.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { error: fallbackError.message || 'Gagal membuat akun.' },
          { status: 400 }
        );
      }

      if (fallbackData?.user) {
        authUserId = fallbackData.user.id;
        // Langsung konfirmasi via adminClient
        await adminClient.auth.admin.updateUserById(authUserId, { email_confirm: true });
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

    // 3. Simpan / sinkronkan ke database PostgreSQL Prisma
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
        success: true,
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
