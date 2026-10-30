// app/tentang/page.tsx - Halaman Tentang Lapmatch
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Cpu, Sparkles, Target } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Tentang - Lapmatch',
  description: 'Mengenal Lapmatch, platform pendukung keputusan rekomendasi laptop mahasiswa berbasis TOPSIS & ROC.',
};

export default function TentangPage() {
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

        <div className="space-y-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Sistem Pendukung Keputusan Cerdas
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tentang <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">Lapmatch</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
              Lapmatch adalah platform rekomendasi laptop cerdas yang dirancang khusus untuk membantu mahasiswa, pelajar, dan profesional menemukan laptop yang paling cocok dengan kebutuhan spesifik, prioritas komputasi, dan anggaran mereka.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-[#0e0e15]/80 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Algoritma Multi-Kriteria Presisi</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Mengombinasikan metode Rank Order Centroid (ROC) untuk pembobotan objektif dan Technique for Order Preference by Similarity to Ideal Solution (TOPSIS) untuk perankingan laptop terbaik.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e0e15]/80 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Personalisasi Berbasis Kebutuhan</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Mulai dari mahasiswa teknik informatika, desain multimedia, hingga produktivitas harian, sistem memetakan kriteria hardware seperti prosesor, GPU, RAM, baterai, dan portabilitas secara transparan.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white">Keunggulan Utama Kami</h2>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Rekomendasi independen dan netral tanpa keberpihakan pada merek tertentu.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Transparansi perhitungan TOPSIS yang dapat diaudit langkah demi langkah.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Katalog spesifikasi dan estimasi harga pasar terkini yang diperbarui berkala.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
