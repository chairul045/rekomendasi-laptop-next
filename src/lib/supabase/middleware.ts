// lib/supabase/middleware.ts - Supabase middleware client helper
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://njnvkjhnefmawskhcbdy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_xDgQzcDtU7unpQKeCIQRLw_IvPJUIWk',
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

  // Rute publik yang dapat diakses siapa saja
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
    '/logout',
    '/tentang',
    '/kebijakan-privasi',
    '/syarat-penggunaan',
  ];

  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));
  const isGuestQuestionnaire =
    pathname === '/questionnaire' && searchParams.get('guest') === 'true';

  // Belum login & mencoba mengakses rute terproteksi → redirect ke /login
  if (!user && !isPublicRoute && !isGuestQuestionnaire) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
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
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    const redirectResponse = NextResponse.redirect(homeUrl);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, c);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
