// app/register/page.tsx - Halaman Pendaftaran Akun Lapmatch
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  Award,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mail,
  User as UserIcon,
  Phone,
} from 'lucide-react';
import Input from '@/components/auth/Input';
import PasswordInput from '@/components/auth/PasswordInput';
import AuthButton from '@/components/auth/AuthButton';
import AuthAlert from '@/components/auth/AuthAlert';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';
import { createClient } from '@/lib/supabase/client';

const ROLE_OPTIONS = [
  {
    id: 'mahasiswa',
    title: 'Mahasiswa',
    badge: 'Populer',
    desc: 'Untuk perkuliahan, tugas akhir/skripsi, praktikum lab, pemrograman & multimedia.',
    icon: GraduationCap,
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30 text-cyan-300',
  },
  {
    id: 'pelajar',
    title: 'Pelajar (SMA / SMK)',
    badge: 'Sekolah',
    desc: 'Untuk belajar harian, tugas sekolah, ujian daring, dan kreasi konten siswa.',
    icon: BookOpen,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30 text-emerald-300',
  },
  {
    id: 'pekerja',
    title: 'Pekerja / Profesional',
    badge: 'Karir',
    desc: 'Untuk produktivitas kerja kantor, software engineer, desain grafis, bisnis & freelance.',
    icon: Briefcase,
    gradient: 'from-indigo-500/20 via-violet-500/10 to-transparent border-indigo-500/30 text-indigo-300',
  },
  {
    id: 'dosen',
    title: 'Dosen / Guru',
    badge: 'Akademik',
    desc: 'Untuk kegiatan pengajaran, penelitian, evaluasi akademik, dan presentasi kuliah.',
    icon: Award,
    gradient: 'from-purple-500/20 via-pink-500/10 to-transparent border-purple-500/30 text-purple-300',
  },
  {
    id: 'umum',
    title: 'Lainnya / Umum',
    badge: 'Kustom',
    desc: 'Untuk kebutuhan umum, hobi, bisnis rumahan, atau profesi spesifik lainnya.',
    icon: Users,
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30 text-amber-300',
  },
];

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
    email: z.string().email('Format email tidak valid'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
    confirmPassword: z.string().min(8, 'Konfirmasi kata sandi minimal 8 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      const pass = data.password.toLowerCase();
      const name = data.name.toLowerCase().trim();
      const emailPrefix = data.email.split('@')[0].toLowerCase().trim();

      if (name.length >= 3 && pass.includes(name)) return false;
      if (emailPrefix.length >= 3 && pass.includes(emailPrefix)) return false;
      return true;
    },
    {
      message: 'Kata sandi tidak boleh memuat nama atau bagian email Anda',
      path: ['password'],
    }
  );

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<string>('mahasiswa');
  const [customRole, setCustomRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Daftar Akun - Lapmatch';

    const checkSession = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/');
      }
    };
    checkSession();
  }, [router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch('password', '');
  const watchedName = watch('name', '');
  const watchedEmail = watch('email', '');

  const finalRole =
    selectedRole === 'umum' && customRole.trim().length > 0
      ? customRole.trim()
      : selectedRole;

  const currentRoleObj =
    ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];

  const handleNextStep = () => {
    if (selectedRole === 'umum' && !customRole.trim()) {
      toast.error('Silakan sebutkan status atau profesi Anda.');
      return;
    }
    setStep(2);
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setFormError(null);

    try {
      // 1. Buat akun lewat endpoint server (admin.createUser) dengan role pilihan & langsung aktif
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: finalRole,
        }),
      });

      const result = await res.json();

      if (!res.ok && res.status !== 409) {
        setFormError(result.error || 'Gagal membuat akun.');
        setLoading(false);
        return;
      }

      // 2. Langsung sign-in otomatis tanpa butuh konfirmasi manual
      const supabase = createClient();
      let { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        try {
          await fetch('/api/auth/auto-confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email }),
          });
          const retry = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });
          signInError = retry.error;
        } catch {
          // Lanjutkan
        }
      }

      if (!signInError) {
        toast.success(`Pendaftaran berhasil sebagai ${finalRole}! Mengalihkan... 👋`);
        window.location.href = '/';
      } else {
        toast.success('Akun berhasil dibuat! Silakan masuk.');
        router.push('/login');
      }
    } catch {
      setFormError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#09090d] text-zinc-100 py-8 px-4 relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      <main className="flex-1 flex items-center justify-center my-auto">
        <div className="w-full max-w-lg relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 rounded-3xl blur-xl opacity-20" />

          <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0e0e15]/95 border border-white/10 shadow-2xl backdrop-blur-2xl">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-t-3xl" />

            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition ${
                    step === 1
                      ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  1
                </span>
                <span className={`text-xs font-semibold ${step === 1 ? 'text-white' : 'text-zinc-400'}`}>
                  Pilih Status / Profesi
                </span>
              </div>

              <div className="h-0.5 w-10 bg-white/10" />

              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition ${
                    step === 2
                      ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                      : 'bg-zinc-800 text-zinc-500 border border-white/5'
                  }`}
                >
                  2
                </span>
                <span className={`text-xs font-semibold ${step === 2 ? 'text-white' : 'text-zinc-500'}`}>
                  Lengkapi Data Akun
                </span>
              </div>
            </div>

            {/* STEP 1: Pilih Status / Profesi */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0e0e15] border border-white/10 p-2.5 mb-2 shadow-lg">
                    <img src="/logo.svg" alt="Lapmatch Logo" className="w-full h-full object-contain" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Apa Status / Profesi Anda?
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Pilih status Anda agar profil rekomendasi laptop disesuaikan dengan skenario beban kerja Anda.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {ROLE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedRole === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedRole(opt.id)}
                        className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 min-h-[44px] ${
                          isSelected
                            ? `bg-white/[0.07] border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/50`
                            : 'bg-zinc-950/60 border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition ${
                            isSelected
                              ? opt.gradient
                              : 'bg-zinc-900 border-white/10 text-zinc-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0 pr-6">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white tracking-tight">
                              {opt.title}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                            {opt.desc}
                          </p>
                        </div>

                        <div className="absolute top-3.5 right-3.5">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-400 text-black'
                                : 'border-zinc-700 bg-zinc-900'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {selectedRole === 'umum' && (
                    <div className="pt-2 animate-in fade-in duration-150">
                      <Input
                        id="customRole"
                        label="Sebutkan Status / Profesi Anda:"
                        placeholder="Contoh: Freelance Animator / Wiraswasta"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <AuthButton
                  type="button"
                  onClick={handleNextStep}
                  className="mt-3"
                >
                  <span>Lanjut Isi Data Akun</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </AuthButton>
              </div>
            )}

            {/* STEP 2: Lengkapi Data Akun */}
            {step === 2 && (
              <div className="animate-in fade-in duration-200">
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0e0e15] border border-white/10 p-2 mb-2 shadow-lg">
                    <img src="/logo.svg" alt="Lapmatch Logo" className="w-full h-full object-contain" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Lengkapi Data Akun
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Buat akun Lapmatch Anda dalam hitungan detik
                  </p>
                </div>

                {/* Status Terpilih */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-white/10 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-cyan-300">
                      <currentRoleObj.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Status Terpilih:</span>
                      <span className="text-xs font-bold text-white capitalize">
                        {finalRole}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/40 cursor-pointer min-h-[44px] flex items-center px-2"
                  >
                    Ubah Status
                  </button>
                </div>

                {formError && (
                  <div className="mb-4">
                    <AuthAlert type="error" message={formError} />
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <Input
                    id="register-name"
                    label="Nama Lengkap"
                    autoComplete="name"
                    placeholder="Contoh: Budi Pratama"
                    icon={<UserIcon className="w-4 h-4" />}
                    error={errors.name?.message}
                    disabled={loading}
                    {...register('name')}
                  />

                  <Input
                    id="register-email"
                    label="Alamat Email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    icon={<Mail className="w-4 h-4" />}
                    error={errors.email?.message}
                    disabled={loading}
                    {...register('email')}
                  />

                  <Input
                    id="register-phone"
                    label="No. HP / WhatsApp"
                    type="tel"
                    autoComplete="tel"
                    placeholder="081234567890"
                    hint="Opsional"
                    icon={<Phone className="w-4 h-4" />}
                    error={errors.phone?.message}
                    disabled={loading}
                    {...register('phone')}
                  />

                  <div>
                    <PasswordInput
                      id="register-password"
                      label="Kata Sandi"
                      autoComplete="new-password"
                      placeholder="Minimal 8 karakter"
                      error={errors.password?.message}
                      disabled={loading}
                      {...register('password')}
                    />
                    <PasswordStrengthMeter
                      password={watchedPassword}
                      name={watchedName}
                      email={watchedEmail}
                    />
                  </div>

                  <PasswordInput
                    id="register-confirmPassword"
                    label="Konfirmasi Kata Sandi"
                    autoComplete="new-password"
                    placeholder="Ulangi kata sandi"
                    error={errors.confirmPassword?.message}
                    disabled={loading}
                    {...register('confirmPassword')}
                  />

                  {/* Klausul Persetujuan Syarat & Privasi */}
                  <div className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                    Dengan mendaftar, kamu menyetujui{' '}
                    <Link
                      href="/syarat-penggunaan"
                      target="_blank"
                      className="text-cyan-300 hover:text-cyan-200 underline font-medium"
                    >
                      Syarat Penggunaan
                    </Link>{' '}
                    dan{' '}
                    <Link
                      href="/kebijakan-privasi"
                      target="_blank"
                      className="text-cyan-300 hover:text-cyan-200 underline font-medium"
                    >
                      Kebijakan Privasi
                    </Link>{' '}
                    Lapmatch.
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali</span>
                    </button>

                    <div className="flex-1">
                      <AuthButton
                        type="submit"
                        loading={loading}
                        loadingText="Mendaftarkan Akun..."
                      >
                        Daftar Sekarang →
                      </AuthButton>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Footer Form */}
            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs text-zinc-400">
              <p>
                Sudah memiliki akun?{' '}
                <Link
                  href="/login"
                  className="text-cyan-300 hover:text-cyan-200 font-semibold ml-1 underline decoration-cyan-500/50 underline-offset-4 min-h-[44px] inline-flex items-center"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-zinc-500 py-3 mt-auto">
        &copy; {new Date().getFullYear()} Lapmatch. All rights reserved.
      </footer>
    </div>
  );
}
