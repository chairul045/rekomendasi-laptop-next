// app/api/auth/login/route.ts - Endpoint Login Terproteksi dengan Rate Limiting & SSR Cookies
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';
import { sanitizeUserRole, isSuperAdminEmail } from '@/lib/auth-constants';

export async function POST(request: NextRequest) {
  // Tangkap IP klien untuk proteksi rate limiting
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // 1. Validasi input
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    // 2. Proteksi Rate Limiting (Kombinasi IP + Email)
    const rateLimitKey = `login:${clientIp}:${normalizedEmail}`;
    const checkStatus = checkRateLimit({ key: rateLimitKey, maxAttempts: 5, windowMs: 15 * 60 * 1000 });

    if (!checkStatus.success) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan login. Silakan coba lagi dalam ${checkStatus.resetMinutes} menit.`,
        },
        { status: 429 }
      );
    }

    // 3. Setup Response & Supabase Server Client
    const response = NextResponse.json({ success: true });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Konfigurasi autentikasi server belum lengkap.' },
        { status: 500 }
      );
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Jika rememberMe dicentang, maksimalkan usia cookie (misal 30 hari), jika tidak gunakan session/default
              const cookieOptions = {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 } : {}),
              };
              response.cookies.set(name, value, cookieOptions);
            });
          },
        },
      }
    );

    // 4. Eksekusi Sign In
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    // 5. Fallback auto-confirm jika akun belum terkonfirmasi di Supabase
    if (authError) {
      const errMsg = authError.message.toLowerCase();
      if (errMsg.includes('confirm') || errMsg.includes('verif') || errMsg.includes('not confirmed')) {
        try {
          const admin = createAdminClient();
          const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
          const user = listData?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);
          if (user) {
            await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
            const retry = await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            });
            authData = retry.data;
            authError = retry.error;
          }
        } catch {
          // Lanjutkan jika admin client tidak tersedia
        }
      }
    }

    // 6. Jika login gagal
    if (authError || !authData?.user) {
      const record = recordFailedAttempt({ key: rateLimitKey, maxAttempts: 5, windowMs: 15 * 60 * 1000 });
      if (!record.success) {
        return NextResponse.json(
          {
            error: `Terlalu banyak percobaan, coba lagi dalam ${record.resetMinutes} menit.`,
          },
          { status: 429 }
        );
      }

      // Pesan error seragam untuk keamanan (tidak membocorkan status pendaftaran email)
      return NextResponse.json(
        { error: 'Email atau kata sandi salah. Silakan periksa kembali.' },
        { status: 401 }
      );
    }

    // 7. Berhasil: Reset Rate Limit
    resetRateLimit(rateLimitKey);

    // 8. Sinkronisasi User Profile ke Prisma Database
    try {
      const user = authData.user;
      const safeRole = sanitizeUserRole(user.email || normalizedEmail, user.user_metadata?.role);
      const existing = await prisma.user.findUnique({ where: { id: user.id } });
      if (!existing) {
        await prisma.user.create({
          data: {
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email || normalizedEmail,
            role: safeRole,
          },
        });
      } else {
        // Jaga agar hanya admin resmi yang memiliki role admin
        const isOfficialAdmin = isSuperAdminEmail(existing.email);
        if (isOfficialAdmin && existing.role !== 'admin') {
          await prisma.user.update({
            where: { id: existing.id },
            data: { role: 'admin' },
          });
        } else if (!isOfficialAdmin && existing.role === 'admin') {
          await prisma.user.update({
            where: { id: existing.id },
            data: { role: 'mahasiswa' },
          });
        }
      }
    } catch {
      // Abaikan jika prisma sync ada kendala non-kritis
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server. Silakan coba sesaat lagi.' },
      { status: 500 }
    );
  }
}
