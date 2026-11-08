// app/api/auth/signout/route.ts - Supabase sign out menyeluruh & penghapusan cookies
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

async function handleSignOut(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const response = NextResponse.redirect(new URL('/', origin), { status: 302 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
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
