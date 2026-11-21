// src/app/admin/AdminReviewManager.tsx - Manajemen Ulasan dan Rating Laptop Modern
'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Star,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface ReviewItem {
  id: string;
  laptopName: string;
  brand: string;
  userName: string;
  userRole: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'published' | 'reported' | 'moderated';
}

export default function AdminReviewManager() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      if (!res.ok) throw new Error('Gagal memuat ulasan');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      toast.error('Gagal mengambil daftar ulasan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/reviews');
        if (!res.ok) throw new Error('Gagal memuat ulasan');
        const data = await res.json();
        if (!ignore) {
          setReviews(data.reviews || []);
        }
      } catch {
        if (!ignore) {
          toast.error('Gagal mengambil daftar ulasan.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Hapus ulasan ini dari sistem?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Ulasan berhasil dihapus.');
    } catch {
      toast.error('Gagal menghapus ulasan.');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchRating = ratingFilter === 'all' ? true : r.rating === ratingFilter;
    const matchSearch =
      r.laptopName.toLowerCase().includes(search.toLowerCase()) ||
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    return matchRating && matchSearch;
  });

  const avgRating = (
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
              Manajemen Ulasan &amp; Rating Laptop
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Feedback &amp; Penilaian Mahasiswa</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Moderasi ulasan pengguna, kelola feedback, dan pantau rating kepuasan laptop.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchReviews}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer disabled:opacity-50 min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Muat ulang ulasan"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-xl font-black text-amber-500 font-mono flex items-center gap-1">
                <span>{avgRating}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[10px] text-slate-500">Rata-rata Rating</span>
            </div>
            <div className="w-px h-7 bg-slate-200 dark:bg-slate-700" />
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{reviews.length}</div>
              <span className="text-[10px] text-slate-500">Total Ulasan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari laptop, nama pengulas, atau ulasan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[40px]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setRatingFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[36px] ${
              ratingFilter === 'all'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Semua
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRatingFilter(star)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 min-h-[36px] ${
                ratingFilter === star
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{star}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List Grid */}
      {loading ? (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500">Memuat ulasan dari basis data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.length === 0 ? (
            <div className="col-span-2 p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
              Tidak ada ulasan yang sesuai dengan filter.
            </div>
          ) : (
            filteredReviews.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between hover:border-amber-300 transition shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
                        {r.brand}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{r.laptopName}</h3>
                    </div>

                    <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                      {r.userName.substring(0, 1)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{r.userName}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {r.userRole} • {formatDate(r.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteReview(r.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                    title="Hapus ulasan ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
