'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          toast.error('Email belum dikonfirmasi. Hubungi admin atau daftar ulang.');
        } else if (
          error.message.toLowerCase().includes('invalid login') ||
          error.message.toLowerCase().includes('invalid credentials')
        ) {
          toast.error('Email atau password salah.');
        } else {
          toast.error(error.message || 'Gagal login. Coba lagi.');
        }
      } else {
        toast.success('Login berhasil! Selamat datang 👋');
        window.location.href = '/';
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan. Periksa koneksi internet Anda.');
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
              <LogIn className="w-6 h-6 text-cyan-300" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Masuk ke{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-indigo-200 to-cyan-300">
                Akun Anda
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Sistem Pendukung Keputusan Pemilihan Laptop Mahasiswa
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Alamat Email (Gmail)
                </label>
                <span className="text-[11px] text-zinc-400">Akun terdaftar</span>
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  disabled={loading}
                />
                <svg
                  className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Masuk Sekarang →'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs text-zinc-400 space-y-3">
            <p>
              Belum memiliki akun?{' '}
              <Link
                href="/register"
                className="text-cyan-300 hover:text-cyan-200 font-semibold ml-1 underline decoration-cyan-500/50 underline-offset-4"
              >
                Daftar Akun Baru
              </Link>
            </p>

            {/* Kontak Bantuan Cepat */}
            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-zinc-400">
              <span>Butuh bantuan?</span>
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
