'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Plus,
  Clock,
  ArrowRight,
  Trash2,
  X,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getLaptopImageUrl, formatRupiah } from '@/lib/laptop-utils';

interface LaptopItem {
  id: number;
  name: string;
  brand: string;
  price: string;
  imageUrl: string | null;
  condition: string;
}

interface HasilTopsisItem {
  id: number;
  nilaiV: number;
  peringkat: number;
  laptop: LaptopItem;
}

interface ConsultationItem {
  id: number;
  judul: string | null;
  peruntukan: string;
  budgetMin: string;
  budgetMax: string;
  kondisiPilihan: string;
  frekuensiMembawa: string | null;
  createdAt: string;
  hasilTopsis: HasilTopsisItem[];
}

interface MetaData {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export default function HistoryPage() {
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [peruntukan, setPeruntukan] = useState('');
  const [kondisi, setKondisi] = useState('');
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (peruntukan) params.set('peruntukan', peruntukan);
      if (kondisi) params.set('kondisi', kondisi);
      params.set('page', page.toString());

      const res = await fetch(`/api/history?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Gagal memuat riwayat');
      }
      const json = await res.json();
      setConsultations(json.data);
      setMeta(json.meta);
    } catch {
      toast.error('Gagal mengambil data riwayat.');
    } finally {
      setLoading(false);
    }
  }, [search, peruntukan, kondisi, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat konsultasi ini?')) return;

    try {
      const res = await fetch(`/api/recommendation/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');

      toast.success('Riwayat berhasil dihapus.');
      setConsultations((prev) => prev.filter((c) => c.id !== id));
      if (meta) setMeta((m) => (m ? { ...m, total: m.total - 1 } : m));
    } catch {
      toast.error('Terjadi kesalahan saat menghapus riwayat.');
    }
  };

  const hasFilter = search || peruntukan || kondisi;

  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
      <Navbar historyCount={meta?.total ?? consultations.length} />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-950/50 text-blue-300 border border-blue-800/50">
                <HistoryIcon className="w-3.5 h-3.5" />
                <span>Multi-Session History</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {meta?.total ?? consultations.length} Sesi Kuisioner Tersimpan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Riwayat Kuisioner & Rekomendasi
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Setiap kali Anda mengirimkan kuisioner, sistem TOPSIS dan perhitungan bobot ROC dicatat secara mandiri untuk transparansi penelusuran hasil.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm transition shadow-lg shadow-violet-600/20 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Isi Kuisioner Baru</span>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari label sesi atau peruntukan..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-cyan-400 transition"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>

            <div className="sm:col-span-3">
              <select
                value={kondisi}
                onChange={(e) => {
                  setKondisi(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-cyan-400 transition cursor-pointer"
              >
                <option value="">Semua Kondisi</option>
                <option value="keduanya">Keduanya (Baru & Second)</option>
                <option value="baru">Hanya Baru</option>
                <option value="second">Hanya Second</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={peruntukan}
                onChange={(e) => {
                  setPeruntukan(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-cyan-400 transition cursor-pointer"
              >
                <option value="">Semua Peruntukan</option>
                <option value="Kuliah">Kuliah</option>
                <option value="Programming">Programming</option>
                <option value="Desain Grafis">Desain Grafis</option>
                <option value="Gaming">Gaming</option>
                <option value="Bisnis">Bisnis</option>
              </select>
            </div>

            {hasFilter && (
              <div className="sm:col-span-1 flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPeruntukan('');
                    setKondisi('');
                    setPage(1);
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs border border-zinc-800 transition flex items-center justify-center"
                  title="Reset Filter"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History Cards Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-[#0e0e15]/60 border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : consultations.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0e0e15]/80 border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700/60 mx-auto flex items-center justify-center text-zinc-400 mb-3">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              {hasFilter ? 'Tidak Ada Sesi yang Cocok' : 'Belum Ada Riwayat Kuisioner'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-5">
              {hasFilter
                ? 'Coba ganti kata kunci pencarian atau reset filter kondisi.'
                : 'Anda belum pernah mengisi kuisioner kebutuhan. Silakan isi kuisioner pertama Anda untuk mendapatkan rekomendasi berbasis TOPSIS & ROC.'}
            </p>
            {!hasFilter && (
              <Link
                href="/questionnaire"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs hover:from-violet-500 hover:to-indigo-500 transition"
              >
                Mulai Kuisioner →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultations.map((item) => {
              const best = item.hasilTopsis[0];
              const laptop = best?.laptop;
              const dateFormatted = new Date(item.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={item.id}
                  className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md p-5 flex flex-col justify-between hover:border-violet-500/40 hover:shadow-[0_0_25px_rgba(124,58,237,0.15)] transition duration-300 space-y-4"
                >
                  {/* Top Info */}
                  <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <h3 className="text-xs font-bold text-white font-mono">
                          {item.judul ?? `Konsultasi ${item.peruntukan}`}
                        </h3>
                      </div>
                      <p className="text-[11px] text-cyan-300 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{dateFormatted}</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-mono capitalize bg-violet-950/40 text-violet-300 border border-violet-800/40">
                      {item.peruntukan}
                    </span>
                  </div>

                  {/* Recommended Top Laptop with Image */}
                  <div className="space-y-2">
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                      Rekomendasi Teratas:
                    </div>
                    {laptop ? (
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getLaptopImageUrl(laptop.brand, laptop.name, laptop.imageUrl)}
                          alt={laptop.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-sm font-bold text-white leading-snug line-clamp-1">
                            {laptop.name}
                          </div>
                          <div className="flex items-baseline gap-2 text-xs font-mono">
                            <span className="text-emerald-400 font-bold">
                              {formatRupiah(laptop.price)}
                            </span>
                            {best && (
                              <span className="text-cyan-300 text-[11px]">
                                Skor: <strong>{(best.nilaiV * 100).toFixed(1)}%</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500 italic">Sesi telah dihitung</div>
                    )}
                  </div>

                  {/* Filter Parameter Badges */}
                  <div className="pt-3 border-t border-zinc-800/60">
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                        💰 {Number(item.budgetMin) / 1000000} - {Number(item.budgetMax) / 1000000} Jt
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800 uppercase">
                        🏷️ {item.kondisiPilihan}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                        🎒 {item.frekuensiMembawa ?? 'Rutin'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 transition cursor-pointer"
                      title="Hapus Sesi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/recommendation/${item.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition text-center flex items-center justify-center gap-1.5 shadow-md shadow-violet-600/20"
                    >
                      <span>Lihat Hasil Analisis</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
