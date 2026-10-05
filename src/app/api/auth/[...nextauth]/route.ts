// app/api/auth/[...nextauth]/route.ts
// Route ini tidak digunakan — Auth ditangani oleh Supabase Auth.
// File dipertahankan agar tidak muncul error saat build.
export async function GET() {
  return new Response('Not used — auth handled by Supabase', { status: 404 });
}
export async function POST() {
  return new Response('Not used — auth handled by Supabase', { status: 404 });
}
