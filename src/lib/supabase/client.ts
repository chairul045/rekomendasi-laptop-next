// lib/supabase/client.ts - Browser/Client-side Supabase client
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://njnvkjhnefmawskhcbdy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_xDgQzcDtU7unpQKeCIQRLw_IvPJUIWk'
  );
}
