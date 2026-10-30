// app/forgot-password/page.tsx - Halaman Lupa Kata Sandi Lapmatch
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/auth/Input';
import AuthButton from '@/components/auth/AuthButton';
import AuthAlert from '@/components/auth/AuthAlert';

const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    setStatusMessage(null);

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(data.email.trim(), {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        // Jangan membocorkan error teknis spesifik ke publik
        setStatusMessage({
          type: 'error',
          message: error.message || 'Gagal mengirim instruksi pemulihan. Silakan coba lagi.',
        });
      } else {
        setStatusMessage({
          type: 'success',
          message:
            'Tautan pemulihan kata sandi telah dikirimkan ke email Anda. Tautan ini berlaku selama 30 menit. Silakan periksa folder kotak masuk atau spam.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        message: 'Terjadi kesalahan jaringan. Silakan periksa koneksi Anda dan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative z-10">
      <div className="w-full max-w-md relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 rounded-3xl blur-xl opacity-20" />

        <div className="relative p-8 rounded-3xl bg-[#0e0e15]/95 border border-white/10 shadow-2xl backdrop-blur-2xl">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-t-3xl" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/30 to-cyan-500/20 border border-violet-500/30 p-3 mb-3 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              <KeyRound className="w-7 h-7 text-cyan-300" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Lupa Kata Sandi?
            </h1>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Masukkan alamat email akun Lapmatch Anda. Kami akan mengirimkan tautan aman untuk mengatur ulang kata sandi (berlaku 30 menit).
            </p>
          </div>

          {/* Form Alert */}
          {statusMessage && (
            <div className="mb-5">
              <AuthAlert type={statusMessage.type} message={statusMessage.message} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              id="forgot-email"
              label="Alamat Email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="nama@email.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              disabled={loading}
              {...register('email')}
            />

            <AuthButton type="submit" loading={loading} loadingText="Mengirim Tautan...">
              Kirim Tautan Pemulihan →
            </AuthButton>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition py-2 px-3 rounded-lg hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
