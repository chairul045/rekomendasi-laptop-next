'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Trophy,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Plus,
  History,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getLaptopImageUrl, formatRupiah, getMarketplaceLinks } from '@/lib/laptop-utils';

interface LaptopData {
  id: number;
  name: string;
  brand: string;
  price: string;
  condition: string;
  ramGb: number | null;
  storageGb: number | null;
  batteryHours: number | null;
  weightKg: number | null;
  performaKomposit: number | null;
  imageUrl: string | null;
}

interface HasilTopsis {
  id: number;
  laptopId: number;
  kondisi: string;
  nilaiV: number;
  peringkat: number;
  laptop: LaptopData;
}

interface BobotHasil {
  id: number;
  prioritas: number;
  bobot: number;
  kriteria: { kode: string; nama: string; tipe: string };
}

interface JawabanData {
  id: number;
  judul: string | null;
  peruntukan: string;
  budgetMin: string;
  budgetMax: string;
  kondisiPilihan: string;
  frekuensiMembawa: string | null;
  rankingKriteria: string[];
  merekPilihan: string[];
  tanggalPengisian: string;
  user: { id: number; name: string; email: string };
  bobotHasil: BobotHasil[];
}

interface RecommendationData {
  jawaban: JawabanData;
  hasilBaru: HasilTopsis[];
  hasilSecond: HasilTopsis[];
  explanations: Record<number, string>;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono shadow-[0_0_15px_rgba(251,191,36,0.2)]">
        🥇 #1 Rekomendasi Teratas
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-300/20 text-zinc-200 border border-zinc-300/40 font-mono">
        🥈 #2 Alternatif Unggulan
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-700/20 text-amber-400 border border-amber-600/40 font-mono">
        🥉 #3 Pilihan Terbaik
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-zinc-800 text-zinc-400 border border-white/5">
      #{rank}
    </span>
  );
}

function LaptopCard({
  item,
  rank,
  explanation,
}: {
  item: HasilTopsis;
  rank: number;
  explanation?: string;
}) {
  const [showExplain, setShowExplain] = useState(true);
  const scorePct = Math.round(item.nilaiV * 10000) / 100;
  const imgUrl = getLaptopImageUrl(item.laptop.brand, item.laptop.name, item.laptop.imageUrl);
  const links = getMarketplaceLinks(item.laptop.brand, item.laptop.name);

  return (
    <div
      className={`rounded-3xl bg-[#0e0e15]/90 border transition-all duration-300 overflow-hidden backdrop-blur-xl flex flex-col justify-between shadow-2xl ${
        rank === 1
          ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Top Banner for Rank 1 */}
      {rank === 1 && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 text-xs font-extrabold text-center py-1.5 flex items-center justify-center gap-1.5 tracking-wider font-mono">
          <Trophy className="w-3.5 h-3.5" />
          <span>REKOMENDASI TERBAIK BERDASARKAN TOPSIS</span>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* Header with Image & Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Laptop Image */}
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={item.laptop.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <RankBadge rank={rank} />
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-lg capitalize font-bold ${
                  item.kondisi === 'second'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {item.kondisi === 'second' ? 'Second' : 'Baru'}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {item.laptop.brand}
              </span>
            </div>

            <h3 className="font-extrabold text-base sm:text-lg text-white leading-snug">
              {item.laptop.name}
            </h3>

            <div className="text-xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
              {formatRupiah(item.laptop.price)}
            </div>
          </div>

          {/* Score Box */}
          <div className="text-right shrink-0 p-3 rounded-2xl bg-zinc-950/70 border border-white/5">
            <div className="text-2xl font-black font-mono text-cyan-300">
              {scorePct}%
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              Skor Preferensi V_i
            </div>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
            <span>Tingkat Kedekatan Solusi Ideal (TOPSIS)</span>
            <span className="text-cyan-300 font-bold">{scorePct}%</span>
          </div>
          <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                rank === 1
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400'
                  : 'bg-gradient-to-r from-violet-500 to-cyan-400'
              }`}
              style={{ width: `${scorePct}%` }}
            />
          </div>
        </div>

        {/* Specs 4-Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5">
            <span className="text-[10px] font-mono text-violet-400 block">RAM</span>
            <span className="font-bold text-white">{item.laptop.ramGb ?? '—'} GB</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5">
            <span className="text-[10px] font-mono text-indigo-400 block">Storage SSD</span>
            <span className="font-bold text-white">{item.laptop.storageGb ?? '—'} GB</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5">
            <span className="text-[10px] font-mono text-amber-400 block">Baterai</span>
            <span className="font-bold text-white">{item.laptop.batteryHours ?? '—'} Jam</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5">
            <span className="text-[10px] font-mono text-pink-400 block">Bobot</span>
            <span className="font-bold text-white">{item.laptop.weightKg ?? '—'} kg</span>
          </div>
        </div>

        {/* AI Explanation Box */}
        {explanation && (
          <div className="rounded-2xl bg-gradient-to-br from-violet-950/40 via-indigo-950/20 to-zinc-950 border border-violet-500/30 p-4 space-y-2">
            <button
              type="button"
              onClick={() => setShowExplain(!showExplain)}
              className="w-full flex items-center justify-between text-xs font-bold text-violet-300 hover:text-white transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Analisis & Penjelasan Naratif AI</span>
              </div>
              {showExplain ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showExplain && (
              <p className="text-xs text-zinc-300 leading-relaxed pt-1 border-t border-white/5">
                {explanation}
              </p>
            )}
          </div>
        )}

        {/* Marketplace Buy Links */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-[11px] text-zinc-400 font-mono">Cari & Beli di Marketplace:</span>
          <div className="flex items-center gap-2">
            <a
              href={links.shopee}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-950/40 text-orange-300 hover:bg-orange-900/60 border border-orange-800/40 text-xs font-medium transition"
            >
              <span>Shopee</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={links.tokopedia}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/40 text-xs font-medium transition"
            >
              <span>Tokopedia</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={links.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 border border-blue-800/40 text-xs font-medium transition"
            >
              <span>FB Marketplace</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'baru' | 'second'>('baru');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/recommendation/${id}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          toast.error('Gagal memuat rekomendasi.');
          router.push('/history');
          return;
        }
        const json = await res.json();
        setData(json);

        if (json.hasilBaru.length === 0 && json.hasilSecond.length > 0) {
          setActiveTab('second');
        }
      } catch {
        toast.error('Terjadi kesalahan memuat data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_25px_rgba(124,58,237,0.5)]" />
            <p className="text-sm font-semibold text-white">Memuat hasil rekomendasi TOPSIS...</p>
            <p className="text-xs text-zinc-400">Harap tunggu sebentar</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <p className="text-zinc-400">Data rekomendasi tidak ditemukan.</p>
            <Link href="/history" className="text-cyan-400 text-xs hover:underline">
              Kembali ke riwayat
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { jawaban, hasilBaru, hasilSecond, explanations } = data;
  const currentResults = activeTab === 'baru' ? hasilBaru : hasilSecond;

  const dateFormatted = new Date(jawaban.tanggalPengisian).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Analisis TOPSIS & Narasi AI Selesai
              </span>
              <span className="text-xs text-cyan-300 font-mono flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tanggal Pengisian: <strong>{dateFormatted}</strong></span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {jawaban.judul ?? `Konsultasi ${jawaban.peruntukan}`}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/history"
              className="px-3.5 py-2 rounded-xl bg-[#0e0e15] hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-medium transition flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              <span>Semua Riwayat</span>
            </Link>
            <Link
              href="/questionnaire"
              className="px-3.5 py-2 rounded-xl bg-[#0e0e15] hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-medium transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kuisioner Baru</span>
            </Link>
          </div>
        </div>

        {/* Parameter Profil & Filter Kuisioner Sesi Ini */}
        <div className="p-5 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-3">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Profil Kebutuhan & Filter Terpilih</span>
            <span className="text-zinc-500 font-mono">ID Sesi: #{jawaban.id}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Rentang Budget</span>
              <span className="font-bold text-white font-mono">
                {formatRupiah(jawaban.budgetMin)} - {formatRupiah(jawaban.budgetMax)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Peruntukan (Label)</span>
              <span className="font-bold text-white">{jawaban.peruntukan}</span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Kondisi Diproses</span>
              <span className="font-bold text-white uppercase font-mono">{jawaban.kondisiPilihan}</span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Filter Merek</span>
              <span className="font-bold text-white truncate block">
                {jawaban.merekPilihan.includes('semua') ? 'Semua Merek' : jawaban.merekPilihan.join(', ')}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Frekuensi Bawa</span>
              <span className="font-bold text-white">{jawaban.frekuensiMembawa ?? 'Rutin'}</span>
            </div>
          </div>
        </div>

        {/* Transparansi Perhitungan Bobot ROC */}
        <div className="p-5 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Transparansi Perhitungan Bobot ROC (Rank Order Centroid)
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            {jawaban.bobotHasil.map((b) => (
              <div key={b.id} className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between mb-1">
                  <span>#{b.prioritas}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase ${
                      b.kriteria.tipe === 'cost'
                        ? 'bg-amber-950/50 text-amber-300'
                        : 'bg-emerald-950/50 text-emerald-300'
                    }`}
                  >
                    {b.kriteria.tipe}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">{b.kriteria.nama}</div>
                <div className="text-base font-extrabold text-cyan-300 font-mono mt-1">
                  {(b.bobot * 100).toFixed(1)}%
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">w = {b.bobot.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs: Baru vs Second */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-1">
            {hasilBaru.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('baru')}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'baru'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <span>✨ Laptop Baru</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 font-semibold">
                  {hasilBaru.length}
                </span>
              </button>
            )}

            {hasilSecond.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('second')}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'second'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <span>♻️ Laptop Second</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 font-semibold">
                  {hasilSecond.length}
                </span>
              </button>
            )}
          </div>

          {/* Results Grid */}
          <div className="space-y-4">
            {currentResults.length > 0 ? (
              currentResults.map((item) => (
                <LaptopCard
                  key={item.id}
                  item={item}
                  rank={item.peringkat}
                  explanation={explanations[item.laptopId]}
                />
              ))
            ) : (
              <div className="text-center py-16 rounded-3xl bg-[#0e0e15]/80 border border-white/10">
                <p className="text-zinc-400 text-sm">Tidak ada alternatif laptop pada kategori ini.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
