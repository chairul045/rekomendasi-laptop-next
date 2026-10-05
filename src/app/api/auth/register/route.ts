// app/api/auth/register/route.ts - Buat akun user langsung via Supabase Admin API
// Menghindari "email rate limit exceeded" karena tidak perlu kirim email verifikasi bawaan Supabase
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter.' },
        { status: 400 }
      );
    }

    // 1. Cek apakah email sudah ada di DB kita
    const emailInDb = await prisma.user.findUnique({ where: { email } });
    if (emailInDb) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan langsung masuk.' },
        { status: 409 }
      );
    }

    const serviceClient = getServiceClient();

    // 2. Buat user langsung di Supabase Auth dengan email_confirm: true
    // Cara ini TIDAK mengirimkan email verifikasi sehingga tidak terkena rate limit email Supabase
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      if (
        authError.message.toLowerCase().includes('already registered') ||
        authError.message.toLowerCase().includes('already exists')
      ) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar di sistem. Silakan langsung masuk.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: authError.message || 'Gagal membuat akun di auth service.' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Gagal membuat akun pengguna.' },
        { status: 500 }
      );
    }

    // 3. Simpan ke database PostgreSQL (Prisma)
    const newUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        name,
        email,
        role: 'mahasiswa',
      },
    });

    return NextResponse.json(
      {
        message: 'Akun berhasil dibuat.',
        userId: newUser.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat mendaftar.' },
      { status: 500 }
    );
  }
}
