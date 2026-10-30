// app/reset-password/page.tsx - Halaman Set Kata Sandi Baru
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import PasswordInput from '@/components/auth/PasswordInput';
import AuthButton from '@/components/auth/AuthButton';
import AuthAlert from '@/components/auth/AuthAlert';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
    confirmPassword: z.string().min(8, 'Konfirmasi kata sandi minimal 8 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: ResetPasswordForm) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        setErrorMessage(error.message || 'Gagal memperbarui kata sandi. Tautan mungkin telah kedaluwarsa.');
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan. Silakan coba lagi.');
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
              <ShieldCheck className="w-7 h-7 text-cyan-300" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Atur Kata Sandi Baru
            </h1>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Buat kata sandi baru yang kuat untuk melindungi akun Lapmatch Anda.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5">
              <AuthAlert type="error" message={errorMessage} />
            </div>
          )}

          {success ? (
            <div className="space-y-5 text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-1 border border-emerald-500/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white">Kata Sandi Berhasil Diperbarui!</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Anda kini dapat masuk ke akun Lapmatch menggunakan kata sandi yang baru.
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs tracking-wide shadow-lg text-center"
              >
                Masuk Sekarang →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <PasswordInput
                  id="new-password"
                  label="Kata Sandi Baru"
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                  error={errors.password?.message}
                  disabled={loading}
                  {...register('password')}
                />
                <PasswordStrengthMeter password={passwordValue} />
              </div>

              <PasswordInput
                id="confirm-password"
                label="Konfirmasi Kata Sandi Baru"
                autoComplete="new-password"
                placeholder="Ulangi kata sandi baru"
                error={errors.confirmPassword?.message}
                disabled={loading}
                {...register('confirmPassword')}
              />

              <AuthButton type="submit" loading={loading} loadingText="Menyimpan Kata Sandi...">
                Simpan Kata Sandi Baru →
              </AuthButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
