'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Trophy,
  Sparkles,
  ExternalLink,
  RotateCcw,
  History,
  Clock,
  ChevronDown,
  ChevronUp,
  Printer,
  Calculator,
  Scale,
  Info,
  Star,
  CheckCircle,
  MessageSquare,
  Link2,
  Copy,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import { getLaptopImageUrl, formatRupiah, getMarketplaceLinks, formatTanggal } from '@/lib/laptop-utils';
import type { LaptopDetailItem } from '@/components/LaptopDetailModal';
import type { TopsisCalculationData } from '@/components/TopsisStepByStepModal';

// Lazy-loaded modals to minimize initial bundle size and speed up page load
const LaptopDetailModal = dynamic(() => import('@/components/LaptopDetailModal'), { ssr: false });
const LaptopCompareModal = dynamic(() => import('@/components/LaptopCompareModal'), { ssr: false });
const TopsisStepByStepModal = dynamic(() => import('@/components/TopsisStepByStepModal'), { ssr: false });

interface LaptopData {
  id: number;
  name: string;
  brand: string;
  price: string;
  condition: string;
  category?: string | null;
  ramGb: number | null;
  storageGb: number | null;
  batteryHours: number | null;
  weightKg: number | null;
  performaKomposit: number | null;
  processorScore?: number | null;
  vgaScore?: number | null;
  displaySize?: number | null;
  mobilityScore?: number | null;
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
  user: { id: string; name: string; email: string };
  bobotHasil: BobotHasil[];
}

interface RecommendationData {
  jawaban: JawabanData;
  hasilBaru: HasilTopsis[];
  hasilSecond: HasilTopsis[];
  explanations: Record<number, string>;
  topsisCalculation?: {
    baru: TopsisCalculationData | null;
    second: TopsisCalculationData | null;
  };
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
  onViewDetail,
  onToggleCompare,
  isComparing,
}: {
  item: HasilTopsis;
  rank: number;
  explanation?: string;
  onViewDetail: (laptop: LaptopData) => void;
  onToggleCompare: (laptop: LaptopData) => void;
  isComparing: boolean;
}) {
  const [showExplain, setShowExplain] = useState(true);
  const scorePct = Math.round(item.nilaiV * 10000) / 100;
  const imgUrl = getLaptopImageUrl(item.laptop.brand, item.laptop.name, item.laptop.imageUrl);
  const links = getMarketplaceLinks(item.laptop.brand, item.laptop.name, item.laptop.price);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className={`rounded-3xl bg-[#0e0e15]/90 border transition-colors duration-300 overflow-hidden backdrop-blur-xl flex flex-col justify-between shadow-2xl card-interactive ${
        rank === 1
          ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/40'
          : 'border-white/10 hover:border-violet-500/30'
      }`}
    >
      {/* Top Banner for Rank 1 */}
      {rank === 1 && (
        <div className="shimmer-button bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 text-xs font-extrabold text-center py-1.5 flex items-center justify-center gap-1.5 tracking-wider font-mono shadow-md">
          <Trophy className="w-3.5 h-3.5" />
          <span>REKOMENDASI TERBAIK LAPMATCH</span>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* Header with Image & Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Laptop Image */}
          <div
            onClick={() => onViewDetail(item.laptop)}
            className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shrink-0 cursor-pointer hover:border-violet-500/50 transition flex items-center justify-center p-1"
            title="Klik untuk lihat detail spesifikasi"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={item.laptop.name}
              className="max-h-full max-w-full object-contain"
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

            <h3
              onClick={() => onViewDetail(item.laptop)}
              className="font-extrabold text-base sm:text-lg text-white leading-snug cursor-pointer hover:text-cyan-300 transition"
            >
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
            <div className="text-xs text-zinc-400 font-mono">
              Skor Kecocokan
            </div>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
            <span>Tingkat Kecocokan Laptop (Lapmatch Score)</span>
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

        {/* Substandard warning if RAM < 4GB */}
        {item.laptop.ramGb != null && item.laptop.ramGb < 4 && (
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-2 text-amber-300 text-xs">
            <span>⚠️</span>
            <span>Spesifikasi sangat rendah (RAM &lt; 4GB) — <strong>Tidak disarankan untuk perkuliahan aktif</strong>.</span>
          </div>
        )}

        {/* Specs 4-Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5">
            <span className="text-xs font-mono text-violet-400 block mb-0.5">RAM</span>
            <span className="font-bold text-white text-xs">{item.laptop.ramGb != null ? `${item.laptop.ramGb} GB` : 'Data belum tersedia'}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5">
            <span className="text-xs font-mono text-indigo-400 block mb-0.5">Storage SSD</span>
            <span className="font-bold text-white text-xs">{item.laptop.storageGb != null ? `${item.laptop.storageGb} GB` : 'Data belum tersedia'}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5">
            <span className="text-xs font-mono text-amber-400 block mb-0.5">Baterai</span>
            <span className="font-bold text-white text-xs">
              {item.laptop.batteryHours != null
                ? `${item.laptop.batteryHours} Jam`
                : 'Data belum tersedia'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5">
            <span className="text-xs font-mono text-pink-400 block mb-0.5">Bobot</span>
            <span className="font-bold text-white text-xs">
              {item.laptop.weightKg != null
                ? `${item.laptop.weightKg} kg`
                : 'Data belum tersedia'}
            </span>
          </div>
        </div>

        {/* AI Explanation Box */}
        {explanation && (
          <div className="rounded-2xl bg-gradient-to-br from-violet-950/40 via-indigo-950/20 to-zinc-950 border border-violet-500/30 p-4 space-y-2 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowExplain(!showExplain)}
              className="w-full flex items-center justify-between text-xs font-bold text-violet-300 hover:text-white transition cursor-pointer min-h-[40px]"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                <span>Analisis & Penjelasan Naratif AI</span>
              </div>
              <motion.div animate={{ rotate: showExplain ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </button>
            <AnimatePresence>
              {showExplain && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                  className="text-xs text-zinc-300 leading-relaxed pt-1 border-t border-white/5"
                >
                  {explanation}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Card Actions & Marketplace */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewDetail(item.laptop)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer min-h-[40px] active:scale-95"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Detail Spek</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleCompare(item.laptop)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer min-h-[40px] active:scale-95 ${
                isComparing
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10'
              }`}
            >
              <Scale className="w-4 h-4 text-violet-400" />
              <span>{isComparing ? 'Dihapus dari Komparasi' : 'Bandingkan'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline mr-1">Beli:</span>
            {links.shopee && (
              <a
                href={links.shopee}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-orange-950/40 text-orange-300 hover:bg-orange-900/60 border border-orange-800/40 text-xs font-medium transition min-h-[40px] hover:scale-105 active:scale-95"
              >
                <span>Shopee</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {links.tokopedia && (
              <a
                href={links.tokopedia}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/40 text-xs font-medium transition min-h-[40px] hover:scale-105 active:scale-95"
              >
                <span>Tokopedia</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {links.facebook && (
              <a
                href={links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 border border-blue-800/40 text-xs font-medium transition min-h-[40px] hover:scale-105 active:scale-95"
              >
                <span>FB</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function RecommendationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'baru' | 'second'>('baru');

  // Modals & Comparison State
  const [selectedDetailLaptop, setSelectedDetailLaptop] = useState<LaptopDetailItem | null>(null);
  const [comparingLaptops, setComparingLaptops] = useState<LaptopDetailItem[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showTopsisModal, setShowTopsisModal] = useState(false);
  const [showRocGuide, setShowRocGuide] = useState(false);

  // Feedback State
  const [rating, setRating] = useState<number>(5);
  const [satisfaction, setSatisfaction] = useState<'sangat' | 'cukup' | 'kurang'>('sangat');
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

        // Check stored feedback for this session
        const storedFeedback = localStorage.getItem(`lapmatch_feedback_${id}`);
        if (storedFeedback) {
          setFeedbackSubmitted(true);
        }
      } catch {
        toast.error('Terjadi kesalahan memuat data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleToggleCompare = (laptop: LaptopData) => {
    const exists = comparingLaptops.some((l) => l.id === laptop.id);
    if (exists) {
      setComparingLaptops(comparingLaptops.filter((l) => l.id !== laptop.id));
      toast('Laptop dihapus dari komparasi', { icon: '🗑️' });
    } else {
      if (comparingLaptops.length >= 4) {
        toast.error('Maksimal komparasi 4 laptop sekaligus.');
        return;
      }
      setComparingLaptops([...comparingLaptops, laptop]);
      toast.success(`${laptop.name} ditambahkan ke komparasi`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    localStorage.setItem(
      `lapmatch_feedback_${id}`,
      JSON.stringify({ rating, satisfaction, comment, submittedAt: new Date().toISOString() })
    );
    setFeedbackSubmitted(true);
    toast.success('Terima kasih! Feedback Anda sangat bermanfaat untuk kalibrasi SPK.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_25px_rgba(124,58,237,0.5)]" />
            <p className="text-sm font-semibold text-white">Menganalisis rekomendasi Lapmatch...</p>
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

  const { jawaban, hasilBaru, hasilSecond, explanations, topsisCalculation } = data;
  const currentResults = activeTab === 'baru' ? hasilBaru : hasilSecond;
  const currentTopsisData = activeTab === 'baru' ? topsisCalculation?.baru : topsisCalculation?.second;

  const dateFormatted = formatTanggal(jawaban.tanggalPengisian || (jawaban as unknown as { createdAt?: string }).createdAt);

  const criteriaFormatted = jawaban.bobotHasil.map((b) => ({
    kode: b.kriteria.kode,
    nama: b.kriteria.nama,
    tipe: b.kriteria.tipe,
    bobot: b.bobot,
    prioritas: b.prioritas,
  }));

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
                Pencocokan Lapmatch & Analisis AI Selesai
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
            {/* Tombol Cetak / PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>

            {/* Tombol Transparansi TOPSIS */}
            <button
              type="button"
              onClick={() => setShowTopsisModal(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Buka transparansi perhitungan matriks TOPSIS"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Detail Langkah TOPSIS</span>
            </button>

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
              <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Kebutuhan Utama</span>
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
              <span className="text-[10px] text-zinc-500 block mb-0.5 font-mono">Frekuensi Pemakaian</span>
              <span className="font-bold text-white">{jawaban.frekuensiMembawa ?? 'Rutin'}</span>
            </div>
          </div>
        </div>

        {/* Transparansi Perhitungan Bobot ROC */}
        {(() => {
          const sortedBobot = [...jawaban.bobotHasil].sort((a, b) => a.prioritas - b.prioritas);
          const topPriority = sortedBobot.find((b) => b.prioritas === 1) || sortedBobot[0];

          return (
            <div className="p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 backdrop-blur-md space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Transparansi Bobot ROC (Rank Order Centroid)</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Bagaimana tingkat kepentingan kriteria Anda dikonversi menjadi bobot persentase matematis.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRocGuide(!showRocGuide)}
                    className="text-xs text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-xl font-mono flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>💡 {showRocGuide ? 'Tutup Penjelasan' : 'Kenapa Bobotnya Berbeda?'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTopsisModal(true)}
                    className="text-xs text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-xl font-mono flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>Matriks TOPSIS</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Grid 6 Kriteria & Bobot */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-center text-xs">
                {sortedBobot.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3 rounded-2xl border transition ${
                      b.prioritas === 1
                        ? 'bg-gradient-to-b from-amber-500/15 to-zinc-950/90 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'bg-zinc-950/70 border-zinc-800'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between mb-1">
                      <span className={b.prioritas === 1 ? 'font-black text-amber-300' : ''}>
                        Prioritas #{b.prioritas}
                      </span>
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
                    <div className="text-xs font-bold text-white truncate" title={b.kriteria.nama}>
                      {b.kriteria.nama}
                    </div>
                    <div
                      className={`text-base font-extrabold font-mono mt-1 ${
                        b.prioritas === 1 ? 'text-amber-300' : 'text-cyan-300'
                      }`}
                    >
                      {(b.bobot * 100).toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">w = {b.bobot.toFixed(4)}</span>
                  </div>
                ))}
              </div>

              {/* Penjelasan Intuitif Sederhana (Highlight Prioritas 1) */}
              {topPriority && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-zinc-950 to-cyan-950/30 border border-violet-500/20 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <h4 className="font-bold text-white text-xs sm:text-sm">
                      Mengapa &ldquo;{topPriority.kriteria.nama}&rdquo; Berbobot Paling Besar ({(topPriority.bobot * 100).toFixed(1)}%)?
                    </h4>
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-[11px] sm:text-xs">
                    Kriteria <strong className="text-cyan-300">{topPriority.kriteria.nama}</strong> memperoleh porsi bobot paling besar yaitu <strong className="text-emerald-400">{(topPriority.bobot * 100).toFixed(1)}%</strong> karena kriteria ini berada di <strong className="text-amber-300">Peringkat #1 (Prioritas Utama)</strong> berdasarkan preferensi kuesioner Anda.
                    Metode ilmiah <strong className="text-white">Rank Order Centroid (ROC)</strong> memastikan kriteria peringkat pertama memiliki pengaruh paling dominan dalam menyaring laptop terbaik, disusul prioritas #2 (~24.2%), #3 (~15.8%), hingga kriteria terendah (~2.8%).
                  </p>
                </div>
              )}

              {/* Expandable Panduan Lengkap ROC */}
              {showRocGuide && (
                <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 space-y-3 text-xs animate-in fade-in">
                  <h4 className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm text-amber-300">
                    <span>📚 Cara Kerja Perhitungan Bobot ROC (Rank Order Centroid)</span>
                  </h4>
                  <p className="text-zinc-300 leading-relaxed text-[11px] sm:text-xs">
                    Metode ROC digunakan agar penentuan bobot kriteria tidak dilakukan secara subjektif atau tebak-tebakan. Ketika Anda mengurutkan 6 kriteria dari yang paling penting ke yang paling rendah, metode ROC membagi total bobot 100% secara terstandarisasi menggunakan rumus titik berat (*centroid*):
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5">
                      <span className="text-amber-300 font-bold block">Prioritas #1: 40.83%</span>
                      <span className="text-zinc-400 text-[10px]">Penentu utama perankingan</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5">
                      <span className="text-cyan-300 font-bold block">Prioritas #2: 24.17%</span>
                      <span className="text-zinc-400 text-[10px]">Pembeda kedua terkuat</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5">
                      <span className="text-zinc-300 font-bold block">Prioritas #3: 15.83%</span>
                      <span className="text-zinc-400 text-[10px]">Pertimbangan penyeimbang</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5">
                      <span className="text-zinc-400 font-bold block">Prioritas #4: 10.28%</span>
                      <span className="text-zinc-400 text-[10px]">Faktor pendukung</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5">
                      <span className="text-zinc-400 font-bold block">Prioritas #5: 6.11%</span>
                      <span className="text-zinc-400 text-[10px]">Pengaruh kecil</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5">
                      <span className="text-zinc-500 font-bold block">Prioritas #6: 2.78%</span>
                      <span className="text-zinc-400 text-[10px]">Toleransi tertinggi</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Total akumulasi seluruh bobot = 100.00%</span>
                    <Link
                      href="/tentang-metode"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Pelajari Landasan Teori Ilmiah Lengkap</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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
                  onViewDetail={(l) => setSelectedDetailLaptop(l)}
                  onToggleCompare={(l) => handleToggleCompare(l)}
                  isComparing={comparingLaptops.some((c) => c.id === item.laptop.id)}
                />
              ))
            ) : (
              <div className="text-center py-12 px-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700 mx-auto flex items-center justify-center text-xl">
                  🔍
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Tidak Ada Laptop yang Cocok di Kategori Ini</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Tidak ditemukan unit {activeTab === 'baru' ? 'laptop baru' : 'laptop second'} dalam rentang budget {formatRupiah(jawaban.budgetMin)} - {formatRupiah(jawaban.budgetMax)} dengan filter merek saat ini.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-violet-950/30 border border-violet-500/20 max-w-md mx-auto text-xs text-violet-300 text-left space-y-1">
                  <span className="font-bold text-white block">💡 Saran untuk Anda:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-300">
                    <li>Coba perlebar rentang anggaran (naikkan batas maksimal).</li>
                    <li>Ubah filter merek menjadi &quot;Semua Merek&quot; agar lebih banyak opsi tersedia.</li>
                    <li>Periksa tab kondisi lainnya di atas ({activeTab === 'baru' ? 'Laptop Second' : 'Laptop Baru'}).</li>
                  </ul>
                </div>
                <div className="pt-2">
                  <Link
                    href="/questionnaire"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-md shadow-violet-600/20 min-h-[40px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ubah Kriteria Kuisioner</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feedback / Evaluation Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0e0e15]/90 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <MessageSquare className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Evaluasi Kepuasan Rekomendasi
              </h3>
              <p className="text-xs text-zinc-400">
                Bantu evaluasi dan akurasi sistem SPK Lapmatch dengan memberikan penilaian singkat terhadap hasil ini.
              </p>
            </div>
          </div>

          {feedbackSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>
                Ulasan Anda telah tersimpan. Terima kasih atas kontribusi Anda dalam pengujian akurasi sistem ini!
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Rating Kecocokan Rekomendasi:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 rounded-lg hover:bg-zinc-800 text-amber-400 transition"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-amber-400 ml-2">
                      {rating} / 5 Bintang
                    </span>
                  </div>
                </div>

                <div className="space-y-1 sm:pl-6 sm:border-l sm:border-zinc-800">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Tingkat Keselarasan Kebutuhan:
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { val: 'sangat', label: 'Sangat Sesuai' },
                      { val: 'cukup', label: 'Cukup Sesuai' },
                      { val: 'kurang', label: 'Kurang Pas' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setSatisfaction(opt.val as typeof satisfaction)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                          satisfaction === opt.val
                            ? 'bg-amber-400 text-zinc-950 font-bold'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Catatan / Saran untuk Sistem (Opsional):
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Contoh: Rekomendasi #1 sangat pas dengan budget dan kebutuhan coding saya..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-950 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-md active:scale-95"
                >
                  Kirim Evaluasi Sistem
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Floating Comparison Action Bar */}
      {comparingLaptops.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0e0e15]/95 border border-white/20 backdrop-blur-2xl rounded-2xl p-3 px-5 shadow-2xl flex items-center gap-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-300" />
            <span className="text-xs font-bold text-white">
              {comparingLaptops.length} Laptop Dipilih
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCompareModal(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition shadow-md"
          >
            Bandingkan Sekarang
          </button>
          <button
            type="button"
            onClick={() => setComparingLaptops([])}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Batal
          </button>
        </div>
      )}

      {/* Laptop Detail Modal */}
      <LaptopDetailModal
        laptop={selectedDetailLaptop}
        onClose={() => setSelectedDetailLaptop(null)}
        onCompare={(laptop) => {
          handleToggleCompare(laptop as unknown as LaptopData);
          setSelectedDetailLaptop(null);
        }}
        isComparing={
          selectedDetailLaptop
            ? comparingLaptops.some((c) => c.id === selectedDetailLaptop.id)
            : false
        }
      />

      {/* Laptop Compare Modal */}
      {showCompareModal && (
        <LaptopCompareModal
          laptops={comparingLaptops}
          onClose={() => setShowCompareModal(false)}
          onRemove={(id) => setComparingLaptops(comparingLaptops.filter((l) => l.id !== id))}
          onClear={() => setComparingLaptops([])}
        />
      )}

      {/* TOPSIS Step-by-Step Transparency Modal */}
      {showTopsisModal && (
        <TopsisStepByStepModal
          data={currentTopsisData ?? null}
          criteria={criteriaFormatted}
          conditionLabel={activeTab === 'baru' ? 'Laptop Baru' : 'Laptop Second'}
          onClose={() => setShowTopsisModal(false)}
        />
      )}

      <Footer />
    </div>
  );
}
