// app/syarat-penggunaan/page.tsx - Syarat dan Ketentuan Penggunaan Lapmatch
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Syarat Penggunaan - Lapmatch',
  description: 'Syarat dan Ketentuan Penggunaan Platform Lapmatch.',
};

export default function SyaratPenggunaanPage() {
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
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Syarat Penggunaan</h1>
              <p className="text-xs text-zinc-400">Terakhir diperbarui: Oktober 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/10 pt-6">
            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-white">1. Penerimaan Syarat</h2>
              <p>
                Dengan mengakses atau mendaftar di Lapmatch, Anda menyetujui untuk terikat oleh Syarat Penggunaan ini. Jika Anda tidak menyetujui salah satu bagian dari ketentuan ini, Anda disarankan untuk tidak melanjutkan penggunaan sistem.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-white">2. Sifat Rekomendasi & Informasi Laptop</h2>
              <p>
                Rekomendasi yang dihasilkan Lapmatch dihitung secara matematis menggunakan metode TOPSIS dan ROC berdasarkan masukan prioritas pengguna. Hasil ini merupakan referensi pendukung keputusan dan bukan jaminan mutlak atas kecocokan individual pengguna. Harga dan ketersediaan stok di toko ritel dapat berubah sewaktu-waktu.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-white">3. Tanggung Jawab Akun</h2>
              <p>
                Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi akun masing-masing. Lapmatch tidak bertanggung jawab atas kerugian yang diakibatkan oleh kelalaian pengguna dalam menjaga kredensial keamanan akunnya.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-white">4. Larangan Penggunaan Tidak Sah</h2>
              <p>
                Dilarang keras melakukan upaya peretasan, serangan *brute force*, scraping tanpa izin, atau aktivitas lain yang dapat membebani dan merusak integritas server Lapmatch.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
