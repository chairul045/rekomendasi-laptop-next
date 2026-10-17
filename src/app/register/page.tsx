'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  UserPlus,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  Briefcase,
  Award,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<string>('mahasiswa');
  const [customRole, setCustomRole] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // Role final yang akan dikirim ke server
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
    try {
      // 1. Buat akun lewat endpoint server (admin.createUser) dengan role pilihan
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

      if (!res.ok) {
        toast.error(result.error || 'Gagal membuat akun.');
        if (res.status === 409) {
          router.push('/login');
        }
        return;
      }

      // 2. Langsung sign-in otomatis tanpa izin admin
      const supabase = createClient();
      let { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError && signInError.message.toLowerCase().includes('email not confirmed')) {
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
      }

      if (!signInError) {
        toast.success(`Pendaftaran berhasil sebagai ${finalRole}! Selamat datang 👋`);
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
      <div className="w-full max-w-lg relative">
        {/* Glow effect background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500" />

        {/* Auth Card */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0e0e15]/90 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden">
          {/* Top colorful line accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />

          {/* Stepper Indicator */}
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
              <span className={`text-xs font-medium ${step === 1 ? 'text-white' : 'text-zinc-400'}`}>
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
              <span className={`text-xs font-medium ${step === 2 ? 'text-white' : 'text-zinc-500'}`}>
                Lengkapi Data Akun
              </span>
            </div>
          </div>

          {/* STEP 1: Pertanyaan Mahasiswa atau Lainnya */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-cyan-500/30 border border-violet-500/30 text-white mb-3 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  <UserPlus className="w-6 h-6 text-cyan-300" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Apa Status / Profesi Anda?
                </h1>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Sebelum membuat akun, beritahu kami status Anda agar profil dan rekomendasi disesuaikan secara tepat.
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
                      className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
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

                {/* Input tambahan jika opsi Umum / Kustom dipilih */}
                {selectedRole === 'umum' && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Sebutkan Status / Profesi Anda:
                    </label>
                    <input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="Contoh: Freelance Animator / Wiraswasta / Ibu Rumah Tangga"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-cyan-500/50 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Lanjut Isi Data Akun</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Form Isian Data Akun */}
          {step === 2 && (
            <div className="animate-in fade-in duration-200">
              <div className="text-center mb-5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Lengkapi Data Akun
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Masukkan identitas untuk akun Anda
                </p>
              </div>

              {/* Status terpilih banner */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-cyan-300">
                    <currentRoleObj.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Status Akun Terpilih:</span>
                    <span className="text-xs font-bold text-white capitalize">
                      {finalRole}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/40 cursor-pointer"
                >
                  Ubah Status
                </button>
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
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 karakter"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                      disabled={loading}
                    />
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

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang →'}
                  </button>
                </div>
              </form>
            </div>
          )}

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
                href="https://wa.me/6287851164239"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>WhatsApp (0878-5116-4239)</span>
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
