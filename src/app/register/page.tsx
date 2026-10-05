'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Format email tidak valid'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(8, 'Konfirmasi password minimal 8 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      // 1. Buat akun lewat endpoint server (admin.createUser)
      // Bebas dari batasan rate limit email Supabase
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal membuat akun.');
        if (res.status === 409) {
          router.push('/login');
        }
        return;
      }

      // 2. Langsung sign-in otomatis
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (!signInError) {
        toast.success('Pendaftaran berhasil! Selamat datang 👋');
        window.location.href = '/';
      } else {
        toast.success('Akun berhasil dibuat! Silakan masuk.');
        router.push('/login');
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md relative">
        {/* 21st.dev glow effect background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500" />

        {/* Auth Card */}
        <div className="relative p-8 rounded-3xl bg-[#0e0e15]/90 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden">
          {/* Top colorful line accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-cyan-500/30 border border-violet-500/30 text-white mb-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              <UserPlus className="w-6 h-6 text-cyan-300" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Buat{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-indigo-200 to-cyan-300">
                Akun Baru
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Daftar langsung menggunakan email / Gmail Anda untuk menyimpan seluruh riwayat konsultasi laptop
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Contoh: Budi Pratama"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  disabled={loading}
                />
                <svg
                  className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Alamat Email (Gmail)
                </label>
                <span className="text-[11px] text-zinc-400">Wajib valid</span>
              </div>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  placeholder="nama@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  disabled={loading}
                />
                <svg
                  className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  No. HP / WhatsApp
                </label>
                <span className="text-[11px] text-zinc-400 font-mono">Opsional</span>
              </div>
              <div className="relative">
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="081234567890"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  disabled={loading}
                />
                <svg
                  className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 karakter"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                    disabled={loading}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Ulangi Sandi
                </label>
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ulangi sandi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang →'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs text-zinc-400 space-y-3">
            <p>
              Sudah memiliki akun?{' '}
              <Link
                href="/login"
                className="text-cyan-300 hover:text-cyan-200 font-semibold ml-1 underline decoration-cyan-500/50 underline-offset-4"
              >
                Masuk di sini
              </Link>
            </p>

            {/* Kontak Bantuan Cepat */}
            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-zinc-400">
              <span>Bantuan kontak:</span>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>WhatsApp</span>
              </a>
              <span>&bull;</span>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
