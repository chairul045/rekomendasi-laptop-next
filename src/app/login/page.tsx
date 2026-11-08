// app/login/page.tsx - Halaman Masuk Lapmatch
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Sparkles,
  Zap,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  X,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import Input from '@/components/auth/Input';
import PasswordInput from '@/components/auth/PasswordInput';
import AuthButton from '@/components/auth/AuthButton';
import GoogleButton from '@/components/auth/GoogleButton';
import AuthAlert from '@/components/auth/AuthAlert';
import { createClient } from '@/lib/supabase/client';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Alamat email wajib diisi')
    .email('Format alamat email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const errorMsg =
        searchParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error_description') ||
        hashParams.get('error');

      if (errorMsg) {
        if (errorMsg.includes('auth_callback_failed') || errorMsg.includes('provider')) {
          return 'Autentikasi Google gagal atau belum diaktifkan di server. Silakan gunakan email & kata sandi.';
        }
        return decodeURIComponent(errorMsg);
      }
    }
    return null;
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [activeUserEmail, setActiveUserEmail] = useState<string | null>(null);

  const [callbackUrl, setCallbackUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const cb = searchParams.get('callbackUrl') || searchParams.get('redirect');
      if (cb && cb.startsWith('/') && !cb.startsWith('//')) {
        return cb;
      }
    }
    return '/';
  });

  // Set document title untuk Bahasa Indonesia yang konsisten
  useEffect(() => {
    document.title = 'Masuk - Lapmatch';

    // Cek jika pengguna saat ini sudah memiliki sesi
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.email) {
          setActiveUserEmail(data.session.user.email);
        }
      } catch {
        // Abaikan
      }
    };
    checkSession();
  }, []);

  const handleLogoutCurrent = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {
      // Abaikan
    } finally {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
      setActiveUserEmail(null);
      window.location.href = '/';
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Kirim ke endpoint proteksi server (rate limit + secure cookie set)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(
          result.error || 'Email atau kata sandi salah. Silakan periksa kembali.'
        );
        setLoading(false);
        return;
      }

      setSuccessMessage('Login berhasil! Mengalihkan...');
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 600);
    } catch {
      setErrorMessage(
        'Terjadi kendala jaringan saat menghubungkan ke server. Silakan coba kembali.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#09090d] text-zinc-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-12 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Kolom Kiri (Desktop): Nilai Jual Lapmatch */}
          <section className="lg:col-span-5 space-y-6 text-left hidden sm:block">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_25px_rgba(124,58,237,0.4)] group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0e0e15] rounded-[14px] p-2 flex items-center justify-center">
                  <img src="/logo.svg" alt="Lapmatch Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-cyan-300 transition">
                  Lapmatch
                </span>
                <span className="block text-[11px] font-mono text-zinc-400">
                  Smart Laptop Decision Support
                </span>
              </div>
            </Link>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Temukan Laptop Idealmu Tanpa Keraguan.
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Lapmatch menganalisis kebutuhan akademis dan anggaranmu dengan algoritma multi-kriteria mutakhir, memberikan rekomendasi laptop paling objektif dan presisi.
              </p>
            </div>

            {/* 3 Poin Keunggulan Utama */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0 border border-violet-500/30">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-zinc-100">Algoritma TOPSIS & ROC Presisi</h2>
                  <p className="text-[11px] text-zinc-400 leading-normal mt-0.5">
                    Pembobotan ilmiah berdasarkan prioritas kebutuhan komputasi, bukan sekadar popularitas iklan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-zinc-100">Analisis Kinerja Cepat</h2>
                  <p className="text-[11px] text-zinc-400 leading-normal mt-0.5">
                    Evaluasi komposit CPU, GPU, RAM, baterai, dan bobot mobilitas dalam hitungan detik.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-zinc-100">Transparan & Bebas Bias</h2>
                  <p className="text-[11px] text-zinc-400 leading-normal mt-0.5">
                    Hasil ranking laptop dilengkapi kalkulasi matriks yang dapat dipelajari secara terbuka.
                  </p>
                </div>
              </div>
            </div>

            {/* Jelajahi Lapmatch Tanpa Login (Mode Pengunjung Ala Shopee) */}
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex flex-col items-start gap-1 p-3.5 rounded-2xl border border-white/10 hover:border-cyan-500/40 bg-white/[0.02] hover:bg-white/[0.05] transition-all min-h-[44px] group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 group-hover:text-cyan-300 transition">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Jelajahi Beranda &amp; Katalog Laptop (Mode Tamu)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-zinc-400">
                  Cari &amp; bandingkan spesifikasi laptop, gunakan filter, dan lihat toko servis tanpa wajib login.
                </span>
              </Link>
            </div>
          </section>

          {/* Kolom Kanan: Kartu Form Login */}
          <section className="lg:col-span-7 w-full max-w-md mx-auto">
            <div className="relative">
              {/* Glow Accent */}
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 rounded-3xl blur-xl opacity-25" />

              <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0e0e15]/95 border border-white/10 shadow-2xl backdrop-blur-2xl">
                {/* Garis Aksen Gradien Atas */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-t-3xl" />

                {/* Mobile Header Branding (Tampil jika layar kecil) */}
                <div className="sm:hidden text-center mb-5">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0e0e15] border border-white/10 p-2.5 mb-2 shadow-lg">
                    <img src="/logo.svg" alt="Lapmatch Logo" className="w-full h-full object-contain" />
                  </div>
                </div>

                <div className="text-center sm:text-left mb-6">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Masuk ke <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-300">Lapmatch</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Silakan masuk untuk mengakses rekomendasi dan riwayat konsultasi laptop Anda.
                  </p>
                </div>

                {/* Sesi Aktif Terdeteksi Banner */}
                {activeUserEmail && (
                  <div className="mb-5 p-3 rounded-2xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-between gap-3 text-xs">
                    <div className="truncate text-zinc-300">
                      <span className="text-zinc-400 block text-[10px]">Sesi Saat Ini:</span>
                      <strong className="text-white truncate">{activeUserEmail}</strong>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href="/"
                        className="px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[11px] transition shadow"
                      >
                        Ke Dashboard →
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogoutCurrent}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition cursor-pointer"
                      >
                        Keluar
                      </button>
                    </div>
                  </div>
                )}

                {/* Feedback Pesan (Aria-live) */}
                <div className="space-y-3 mb-5">
                  {errorMessage && <AuthAlert type="error" message={errorMessage} />}
                  {successMessage && <AuthAlert type="success" message={successMessage} />}
                </div>

                {/* Tombol OAuth Google */}
                <div className="mb-5">
                  <GoogleButton
                    label="Masuk dengan Google"
                    disabled={loading}
                    callbackUrl={callbackUrl}
                    onError={(err) => setErrorMessage(err)}
                  />

                  <div className="relative flex items-center justify-center my-5">
                    <div className="border-t border-white/10 w-full" />
                    <span className="bg-[#0e0e15] px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
                      atau dengan email
                    </span>
                    <div className="border-t border-white/10 w-full" />
                  </div>
                </div>

                {/* Formulir Email + Password */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <Input
                    id="email"
                    label="Alamat Email"
                    type="email"
                    autoComplete="username"
                    autoFocus
                    placeholder="nama@email.com"
                    icon={<Mail className="w-4 h-4" />}
                    error={errors.email?.message}
                    disabled={loading}
                    {...register('email')}
                  />

                  <div>
                    <PasswordInput
                      id="password"
                      label="Kata Sandi"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      error={errors.password?.message}
                      disabled={loading}
                      hint={
                        <Link
                          href="/forgot-password"
                          className="text-cyan-300 hover:text-cyan-200 font-medium hover:underline min-h-[44px] inline-flex items-center"
                        >
                          Lupa kata sandi?
                        </Link>
                      }
                      {...register('password')}
                    />
                  </div>

                  {/* Opsi Ingat Saya */}
                  <div className="flex items-center justify-between pt-1">
                    <label
                      htmlFor="rememberMe"
                      className="inline-flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer select-none min-h-[44px]"
                    >
                      <input
                        id="rememberMe"
                        type="checkbox"
                        className="w-4 h-4 rounded bg-zinc-950 border-white/20 text-violet-600 focus:ring-violet-500 focus:ring-offset-0 focus:ring-1 cursor-pointer"
                        {...register('rememberMe')}
                      />
                      <span>Ingat saya</span>
                    </label>
                  </div>

                  {/* Tombol Submit */}
                  <AuthButton
                    type="submit"
                    loading={loading}
                    loadingText="Memverifikasi Kredensial..."
                  >
                    Masuk Sekarang →
                  </AuthButton>
                </form>

                {/* Link Registrasi & Bantuan */}
                <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs text-zinc-400 space-y-3">
                  <p>
                    Belum memiliki akun?{' '}
                    <Link
                      href={callbackUrl !== '/' ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/register'}
                      className="text-cyan-300 hover:text-cyan-200 font-semibold underline decoration-cyan-500/50 underline-offset-4 ml-1 min-h-[44px] inline-flex items-center"
                    >
                      Daftar Akun Baru
                    </Link>
                  </p>

                  <div className="sm:hidden pt-2">
                    <Link
                      href="/questionnaire?guest=true"
                      className="text-xs text-cyan-400 hover:text-cyan-300 underline block min-h-[44px] flex flex-col items-center justify-center text-center py-2"
                    >
                      <span>Coba dulu tanpa akun (Versi Terbatas)</span>
                      <span className="text-xs text-zinc-400 font-normal no-underline">
                        *Pratinjau maks 3 laptop &amp; tanpa simpan riwayat
                      </span>
                    </Link>
                  </div>

                  {/* Bantuan Kontak */}
                  <div className="pt-2 flex items-center justify-center gap-2 text-xs text-zinc-400">
                    <span>Kendala akses?</span>
                    <button
                      type="button"
                      onClick={() => setContactModalOpen(true)}
                      className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline inline-flex items-center gap-1 min-h-[44px] px-2 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Hubungi Tim Dukungan</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Navigasi Sederhana */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#09090d]/80 backdrop-blur-xl py-4 text-xs text-zinc-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-center sm:text-left text-zinc-400">
            &copy; {new Date().getFullYear()} Lapmatch &bull; Rekomendasi Laptop Cerdas Mahasiswa
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/tentang" className="hover:text-white transition">
              Tentang
            </Link>
            <span>&bull;</span>
            <Link href="/kebijakan-privasi" className="hover:text-white transition">
              Kebijakan Privasi
            </Link>
            <span>&bull;</span>
            <Link href="/syarat-penggunaan" className="hover:text-white transition">
              Syarat Penggunaan
            </Link>
          </div>
        </div>
      </footer>

      {/* Modal Bantuan Kontak Tanpa Memajang Nomor Pribadi Terbuka */}
      {contactModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#0e0e15] border border-white/10 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Pusat Bantuan Lapmatch</span>
              </div>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 mb-5 leading-relaxed">
              Jika Anda mengalami kesulitan saat masuk akun, reset kata sandi, atau memerlukan bantuan teknis, silakan hubungi saluran resmi kami:
            </p>

            <div className="space-y-3">
              <a
                href="https://wa.me/6287851164239?text=Halo%20Admin%20Lapmatch,%20saya%20butuh%20bantuan%20terkait%20akun%20Lapmatch"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-600 text-emerald-200 text-xs font-semibold transition"
              >
                <span>Bantuan Cepat via WhatsApp</span>
                <span className="text-emerald-400 font-mono text-[11px]">Chat Sekarang →</span>
              </a>

              <a
                href="mailto:support@lapmatch.com?subject=Bantuan%20Akun%20Lapmatch"
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs font-semibold transition"
              >
                <span>Kirim Email Bantuan</span>
                <span className="text-cyan-400 font-mono text-[11px]">support@lapmatch.com →</span>
              </a>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 text-right">
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 min-h-[44px]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
