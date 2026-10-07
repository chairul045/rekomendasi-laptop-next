// app/api/auth/signout/route.ts - Supabase sign out
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(
    new URL('/login', request.nextUrl.origin),
    { status: 302 }
  );
}
