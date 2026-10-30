// app/api/auth/signout/route.ts - Supabase sign out menyeluruh & penghapusan cookies
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

async function handleSignOut(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const response = NextResponse.redirect(new URL('/login', origin), { status: 302 });

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
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    await supabase.auth.signOut();
  } catch {
    // Lanjutkan penghapusan cookie manual
  }

  // Hapus semua cookies auth yang ada di browser
  const allCookies = request.cookies.getAll();
  for (const c of allCookies) {
    if (c.name.includes('sb-') || c.name.includes('auth') || c.name.includes('supabase')) {
      response.cookies.delete(c.name);
      response.cookies.set(c.name, '', { maxAge: 0, path: '/' });
    }
  }

  return response;
}

export async function POST(request: NextRequest) {
  return handleSignOut(request);
}

export async function GET(request: NextRequest) {
  return handleSignOut(request);
}
