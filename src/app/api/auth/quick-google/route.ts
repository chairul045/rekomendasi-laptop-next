// app/api/auth/quick-google/route.ts - Endpoint Masuk Cepat dengan Akun Gmail / Google
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Alamat email Gmail wajib diisi.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
    }

    const admin = createAdminClient();
    let authUser: any = null;

    // 1. Cari apakah akun sudah ada di Supabase
    const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existing = listData?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);

    const displayName =
      (typeof name === 'string' && name.trim().length > 0
        ? name.trim()
        : normalizedEmail.split('@')[0]) || 'User Google';

    if (existing) {
      authUser = existing;
      // Pastikan status akun aktif (email_confirm: true)
      if (!existing.email_confirmed_at) {
        await admin.auth.admin.updateUserById(existing.id, { email_confirm: true });
      }
    } else {
      // Buat akun baru langsung aktif
      const defaultPassword = `Lapmatch@${Math.random().toString(36).slice(-8)}!`;
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: normalizedEmail,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          name: displayName,
          role: 'mahasiswa',
          email_verified: true,
        },
      });

      if (createError) {
        return NextResponse.json(
          { error: createError.message || 'Gagal menyiapkan akun Google.' },
          { status: 500 }
        );
      }
      authUser = created.user;
    }

    // 2. Buat Magic Link / Session Token untuk langsung sign in
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
    });

    // 3. Setup Response & Cookies Sesi
    const response = NextResponse.json({ success: true, email: normalizedEmail });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://njnvkjhnefmawskhcbdy.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_xDgQzcDtU7unpQKeCIQRLw_IvPJUIWk',
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              });
            });
          },
        },
      }
    );

    // Tukar token jika linkData tersedia atau set session
    if (linkData?.properties?.hashed_token) {
      const { data: verifyData } = await supabase.auth.verifyOtp({
        token_hash: linkData.properties.hashed_token,
        type: 'magiclink',
      });
      if (verifyData?.session) {
        // Session berhasil di-set via cookies
      }
    }

    // 4. Sinkronisasi User Profile ke Prisma
    try {
      const uId = authUser.id;
      const profile = await prisma.user.findUnique({ where: { id: uId } });
      if (!profile) {
        await prisma.user.create({
          data: {
            id: uId,
            name: displayName,
            email: normalizedEmail,
            role: 'mahasiswa',
          },
        });
      }
    } catch {
      // Abaikan kendala sync non-kritis
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses login Google.' },
      { status: 500 }
    );
  }
}
