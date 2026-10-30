// app/kebijakan-privasi/page.tsx - Kebijakan Privasi Lapmatch
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Kebijakan Privasi - Lapmatch',
  description: 'Kebijakan Privasi Lapmatch mengenai keamanan dan pengelolaan data pengguna.',
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="p-8 sm:p-10 rounded-3xl bg-[#0e0e15]/90 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Kebijakan Privasi</h1>
              <p className="text-xs text-zinc-400">Terakhir diperbarui: Oktober 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/10 pt-6">
            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-white">1. Informasi yang Kami Kumpulkan</h2>
              <p>
                Kami mengumpulkan data akun (nama dan alamat email) saat Anda mendaftar atau masuk melalui Google OAuth, serta preferensi kuisioner (rentang anggaran, peruntukan laptop, dan preferensi kriteria komputasi) untuk memproses kalkulasi rekomendasi TOPSIS.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-white">2. Penggunaan Informasi</h2>
              <p>
                Informasi Anda hanya digunakan untuk menyediakan layanan rekomendasi laptop yang dipersonalisasi, menyimpan riwayat konsultasi agar dapat diakses kembali oleh Anda, dan meningkatkan performa algoritma platform Lapmatch. Kami tidak menjual data pengguna kepada pihak ketiga.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-white">3. Keamanan Kata Sandi & Sesi</h2>
              <p>
                Kata sandi pengguna dienkripsi secara satu arah (*salted & hashed*) menggunakan standar kriptografi mutakhir dan tidak pernah disimpan dalam format teks polos. Cookie sesi dilindungi dengan atribut keamanan tingkat tinggi (HttpOnly, Secure, SameSite=Lax).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-white">4. Hak Pengguna</h2>
              <p>
                Anda berhak memperbarui data profil Anda atau menghapus riwayat konsultasi laptop kapan saja melalui menu Pengaturan Profil di Lapmatch.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
