// app/auth/callback/route.ts - Handler Pertukaran Kode Autentikasi (OAuth & Reset Password)
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (code) {
    const response = NextResponse.redirect(new URL(next, origin));

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL('/login?error=auth_config_missing', origin));
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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Pastikan data user tersinkronisasi di Prisma saat login Google
      try {
        const u = data.user;
        const existing = await prisma.user.findUnique({ where: { id: u.id } });
        if (!existing) {
          await prisma.user.create({
            data: {
              id: u.id,
              name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
              email: u.email!,
              role: u.user_metadata?.role || 'mahasiswa',
            },
          });
        }
      } catch {
        // Abaikan kegagalan sync non-fatal
      }

      return response;
    }
  }

  // Jika gagal exchange code, arahkan ke login dengan status error
  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', origin));
}
