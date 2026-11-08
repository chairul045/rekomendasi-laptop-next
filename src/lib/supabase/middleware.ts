// lib/supabase/middleware.ts - Supabase middleware client helper
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — DO NOT remove this call
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;

  // Jangan redirect request API ke halaman login
  if (pathname.startsWith('/api')) {
    return supabaseResponse;
  }

  // Rute yang wajib login (Protected Routes ala Shopee)
  // Pengunjung bebas menjelajahi Beranda (/), Katalog, Servis Laptop, Metode SPK, dan Penjelasan Kuesioner
  const protectedRoutes = [
    '/profile',
    '/history',
    '/recommendation',
    '/admin',
  ];

  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));

  // Belum login & mencoba mengakses rute terproteksi → redirect ke /login dengan callbackUrl
  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    const currentQuery = searchParams.toString();
    const callbackTarget = pathname + (currentQuery ? `?${currentQuery}` : '');
    loginUrl.searchParams.set('callbackUrl', callbackTarget);

    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, c);
    });
    return redirectResponse;
  }

  // Sudah login & mencoba membuka halaman login atau register (kecuali jika minta switch/logout)
  const isSwitchingAccount = searchParams.get('switch') === 'true' || searchParams.get('logout') === 'true';
  const authOnlyPages = ['/login', '/register'];
  if (user && authOnlyPages.some((r) => pathname.startsWith(r)) && !isSwitchingAccount) {
    const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('redirect') || '/';
    const targetUrl = request.nextUrl.clone();
    // Cegah open redirect: pastikan hanya path lokal yang valid
    if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
      const [targetPath, targetSearch] = callbackUrl.split('?');
      targetUrl.pathname = targetPath;
      targetUrl.search = targetSearch ? `?${targetSearch}` : '';
    } else {
      targetUrl.pathname = '/';
      targetUrl.search = '';
    }

    const redirectResponse = NextResponse.redirect(targetUrl);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, c);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
