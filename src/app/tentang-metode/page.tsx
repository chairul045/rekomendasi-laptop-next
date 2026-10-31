// src/app/tentang-metode/page.tsx - Penjelasan Ilmiah Metode ROC & TOPSIS
import Link from 'next/link';
import { ArrowLeft, Calculator, Sparkles, Scale, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Tentang Metode ROC & TOPSIS - Lapmatch',
  description: 'Penjelasan matematis metode Rank Order Centroid (ROC) dan TOPSIS untuk penentuan rekomendasi laptop.',
};

export default function TentangMetodePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-10">
        {/* Breadcrumb / Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Header */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-violet-950/60 text-cyan-300 border border-violet-500/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Landasan Ilmiah SPK (Decision Support System)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Metode <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300">ROC &amp; TOPSIS</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
            Lapmatch menggabungkan dua metode multi-kriteria klasik yang saling melengkapi: <strong>Rank Order Centroid (ROC)</strong> untuk menetapkan bobot kepentingan kriteria secara objektif, dan <strong>TOPSIS</strong> untuk menghitung kedekatan relatif alternatif laptop dengan solusi ideal terbaik.
          </p>
        </div>

        {/* 1. Metode ROC Section */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#0e0e15]/90 border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-600/20 text-violet-300 border border-violet-500/30">
              <Scale className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">1. Metode Rank Order Centroid (ROC)</h2>
              <p className="text-xs text-zinc-400">Penentuan Bobot Kriteria Berdasarkan Urutan Prioritas Pengguna</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              Metode ROC mengonversi urutan peringkat subjektif yang disusun pengguna (dari prioritas ke-1 hingga ke-n) menjadi bobot numerik terstandarisasi. Rumus matematis bobot kriteria ke-<em>i</em> dari total <em>n</em> kriteria adalah:
            </p>
            
            <div className="p-4 rounded-2xl bg-zinc-950/90 border border-white/10 font-mono text-center text-cyan-300 font-bold text-sm sm:text-base">
              w_i = (1 / n) &times; &sum;<sub>k=i..n</sub> (1 / k)
            </div>

            <p className="text-xs text-zinc-400">
              Keterangan: <em>n</em> adalah jumlah total kriteria (dalam Lapmatch <em>n</em> = 6), dan <em>i</em> adalah posisi urutan kriteria (1, 2, ..., 6).
            </p>
          </div>

          {/* Tabel Perhitungan ROC untuk n=6 */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Contoh Hasil Perhitungan Bobot ROC (n = 6 Kriteria)
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-950 border-b border-white/10 text-zinc-400 font-mono">
                    <th className="p-3">Prioritas</th>
                    <th className="p-3">Penjabaran Rumus</th>
                    <th className="p-3">Bobot Desimal</th>
                    <th className="p-3">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-zinc-300">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-cyan-300">#1 (Tertinggi)</td>
                    <td className="p-3 text-xs">(1/6) &times; (1/1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6) = (1/6) &times; 2.45</td>
                    <td className="p-3 font-bold text-white">0.4083</td>
                    <td className="p-3 text-emerald-400">40.83%</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-cyan-300">#2</td>
                    <td className="p-3 text-xs">(1/6) &times; (1/2 + 1/3 + 1/4 + 1/5 + 1/6) = (1/6) &times; 1.45</td>
                    <td className="p-3 font-bold text-white">0.2417</td>
                    <td className="p-3 text-emerald-400">24.17%</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-cyan-300">#3</td>
                    <td className="p-3 text-xs">(1/6) &times; (1/3 + 1/4 + 1/5 + 1/6) = (1/6) &times; 0.95</td>
                    <td className="p-3 font-bold text-white">0.1583</td>
                    <td className="p-3 text-emerald-400">15.83%</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-cyan-300">#4</td>
                    <td className="p-3 text-xs">(1/6) &times; (1/4 + 1/5 + 1/6) = (1/6) &times; 0.6167</td>
                    <td className="p-3 font-bold text-white">0.1028</td>
                    <td className="p-3 text-emerald-400">10.28%</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-cyan-300">#5</td>
                    <td className="p-3 text-xs">(1/6) &times; (1/5 + 1/6) = (1/6) &times; 0.3667</td>
                    <td className="p-3 font-bold text-white">0.0611</td>
                    <td className="p-3 text-emerald-400">6.11%</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-cyan-300">#6 (Terendah)</td>
                    <td className="p-3 text-xs">(1/6) &times; (1/6) = (1/6) &times; 0.1667</td>
                    <td className="p-3 font-bold text-white">0.0278</td>
                    <td className="p-3 text-emerald-400">2.78%</td>
                  </tr>
                  <tr className="bg-zinc-950/80 font-bold border-t border-white/10 text-white">
                    <td colSpan={2} className="p-3 text-right">Total Bobot:</td>
                    <td className="p-3 text-cyan-300">1.0000</td>
                    <td className="p-3 text-cyan-300">100.00%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 2. Metode TOPSIS Section */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#0e0e15]/90 border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30">
              <Calculator className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">2. Metode TOPSIS</h2>
              <p className="text-xs text-zinc-400">Technique for Order Preference by Similarity to Ideal Solution</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              Prinsip TOPSIS adalah memilih alternatif yang memiliki <strong>jarak terpendek ke solusi ideal positif (A+)</strong> dan <strong>jarak terjauh dari solusi ideal negatif (A-)</strong>.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-mono text-xs">1</span>
                  <span>Matriks Keputusan (X) &amp; Normalisasi Vektor (R)</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Setiap elemen matriks keputusan <em>x<sub>ij</sub></em> dinormalisasi agar satuan yang berbeda (Rupiah, GB, Jam, kg) dapat dibandingkan secara seimbang:
                </p>
                <div className="p-2.5 bg-black/50 rounded-xl font-mono text-cyan-300 text-xs text-center">
                  r_ij = x_ij / &radic;(&sum; x_kj&sup2;)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-mono text-xs">2</span>
                  <span>Pembobotan Matriks Ternormalisasi (Y)</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Mengalikan matriks normalisasi <em>r<sub>ij</sub></em> dengan bobot ROC <em>w<sub>j</sub></em>:
                </p>
                <div className="p-2.5 bg-black/50 rounded-xl font-mono text-cyan-300 text-xs text-center">
                  y_ij = w_j &times; r_ij
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-mono text-xs">3</span>
                  <span>Menentukan Solusi Ideal Positif (A+) &amp; Negatif (A-)</span>
                </h4>
                <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                  <li><strong>Kriteria Benefit</strong> (Performa, RAM, SSD, Baterai): A+ = nilai maksimum, A- = nilai minimum.</li>
                  <li><strong>Kriteria Cost</strong> (Harga, Bobot): A+ = nilai minimum (paling murah &amp; paling ringan), A- = nilai maksimum.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-mono text-xs">4</span>
                  <span>Jarak Euclidean (D+ &amp; D-) dan Nilai Kecocokan (V)</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Jarak tiap laptop ke A+ (D<sub>i</sub>+) dan ke A- (D<sub>i</sub>-) dihitung dengan rumus Euclidean, kemudian nilai preferensi kecocokan <em>V<sub>i</sub></em> ditentukan:
                </p>
                <div className="p-2.5 bg-black/50 rounded-xl font-mono text-cyan-300 text-xs text-center">
                  V_i = D_i^- / (D_i^+ + D_i^-)
                </div>
                <p className="text-xs text-zinc-400">
                  Nilai <em>V<sub>i</sub></em> berada dalam rentang 0 hingga 1. Semakin tinggi <em>V<sub>i</sub></em>, semakin dekat laptop tersebut dengan kriteria ideal pengguna.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold text-white">Ingin Menguji Perhitungan Secara Langsung?</h3>
            <p className="text-xs text-zinc-300">
              Isi kuisioner kebutuhan Anda dan buka tombol &quot;Detail Langkah TOPSIS&quot; pada hasil rekomendasi untuk meninjau seluruh matriks secara transparan.
            </p>
          </div>
          <Link
            href="/questionnaire"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg transition active:scale-95 shrink-0 min-h-[44px] flex items-center gap-2"
          >
            <span>Mulai Kuisioner Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
