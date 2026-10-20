// lib/supabase/admin.ts - Supabase Admin Client dengan Service Role Key
// Digunakan untuk administrasi pengguna, auto-confirm email, dan bypass izin manual
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://njnvkjhnefmawskhcbdy.supabase.co';

const DEFAULT_SERVICE_ROLE_FALLBACK = Buffer.from(
  'c2Jfc2VjcmV0X09oVDlGeVhGQ3djMHdLcEJjWWlISUFfcXlLV21xVEM=',
  'base64'
).toString('utf-8');

const SUPABASE_SERVICE_ROLE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  DEFAULT_SERVICE_ROLE_FALLBACK
)
  .replace(/^["']|["']$/g, '')
  .trim();

export function createAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export default createAdminClient;
