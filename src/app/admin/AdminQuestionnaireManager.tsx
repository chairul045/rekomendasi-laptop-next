// src/app/admin/AdminQuestionnaireManager.tsx - Manajemen Kuesioner, Kriteria & Riwayat
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  ClipboardList,
  Sliders,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Save,
  X,
  Search,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatRupiah } from '@/lib/laptop-utils';
import { formatTanggal } from '@/lib/date-utils';

interface KriteriaItem {
  id: number;
  kode: string;
  nama: string;
  tipe: string;
  deskripsi: string | null;
}

interface ConsultationItem {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  judul: string | null;
  peruntukan: string;
  budgetMin: string;
  budgetMax: string;
  kondisiPilihan: string;
  frekuensiMembawa: string | null;
  createdAt: string;
  topLaptop: {
    id: number;
    name: string;
    brand: string;
    price: string;
    condition: string;
    nilaiV: number;
  } | null;
}

export default function AdminQuestionnaireManager() {
  const [subTab, setSubTab] = useState<'kriteria' | 'riwayat'>('kriteria');
  const [kriteria, setKriteria] = useState<KriteriaItem[]>([]);
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchHistory, setSearchHistory] = useState('');

  // Edit Kriteria State
  const [editKriteria, setEditKriteria] = useState<KriteriaItem | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editTipe, setEditTipe] = useState('benefit');
  const [editDeskripsi, setEditDeskripsi] = useState('');
  const [savingKriteria, setSavingKriteria] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/questionnaire');
        if (!res.ok) throw new Error('Gagal memuat data kuesioner');
        const data = await res.json();
        if (!ignore) {
          setKriteria(data.kriteria || []);
          setConsultations(data.consultations || []);
        }
      } catch {
        if (!ignore) {
          toast.error('Gagal mengambil data kuesioner.');
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

  const handleSaveKriteria = async () => {
    if (!editKriteria) return;
    setSavingKriteria(true);
    try {
      const res = await fetch('/api/admin/questionnaire', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editKriteria.id,
          nama: editNama,
          tipe: editTipe,
          deskripsi: editDeskripsi,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui kriteria');

      toast.success(`Kriteria ${editKriteria.kode} berhasil diperbarui.`);
      setKriteria((prev) =>
        prev.map((k) =>
          k.id === editKriteria.id
            ? { ...k, nama: editNama, tipe: editTipe, deskripsi: editDeskripsi }
            : k
        )
      );
      setEditKriteria(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      toast.error(msg);
    } finally {
      setSavingKriteria(false);
    }
  };

  const filteredConsultations = consultations.filter((c) => {
    const q = searchHistory.toLowerCase();
    return (
      c.userName.toLowerCase().includes(q) ||
      c.userEmail.toLowerCase().includes(q) ||
      c.peruntukan.toLowerCase().includes(q) ||
      (c.topLaptop && c.topLaptop.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs text-emerald-300 font-bold uppercase tracking-wider">
              Manajemen Kuesioner &amp; Kriteria SPK
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Parameter Keputusan &amp; Riwayat Pengguna</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Atur 6 kriteria utama TOPSIS, pembobotan ROC, dan pantau seluruh riwayat konsultasi mahasiswa.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-950 border border-white/10">
          <button
            type="button"
            onClick={() => setSubTab('kriteria')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              subTab === 'kriteria'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Kriteria TOPSIS ({kriteria.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('riwayat')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              subTab === 'riwayat'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Riwayat Pengisian ({consultations.length})
          </button>
        </div>
      </div>

      {subTab === 'kriteria' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kriteria.map((k) => {
              const isCost = k.tipe.toLowerCase() === 'cost';

              return (
                <div
                  key={k.id}
                  className="p-5 rounded-3xl bg-[#0e0e15]/90 border border-white/10 space-y-3 relative hover:border-violet-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-gradient-to-r from-violet-600/30 to-cyan-600/30 border border-violet-500/40 text-cyan-300">
                        {k.kode}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                          isCost
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {k.tipe} (Semakin {isCost ? 'Kecil' : 'Besar'} Lebih Baik)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditKriteria(k);
                        setEditNama(k.nama);
                        setEditTipe(k.tipe);
                        setEditDeskripsi(k.deskripsi || '');
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800 transition cursor-pointer"
                      title="Edit Kriteria"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{k.nama}</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {k.deskripsi || 'Belum ada deskripsi kriteria.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-5 rounded-3xl bg-zinc-950/70 border border-white/10 space-y-2">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              ℹ️ Mekanisme Pembobotan ROC (Rank Order Centroid)
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Algoritma Lapmatch secara otomatis menghitung bobot kriteria setiap kali mahasiswa menentukan urutan prioritas di kuesioner. Rumus ROC memastikan bobot bernilai ilmiah, adil, dan objektif tanpa bias subjektif manual.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search bar history */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              placeholder="Cari nama pengisi, email, peruntukan, atau laptop..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-950/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* History Table */}
          <div className="rounded-3xl bg-[#0e0e15]/90 border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-zinc-400 font-mono uppercase text-[11px]">
                    <th className="py-3.5 px-6">Pengguna &amp; Role</th>
                    <th className="py-3.5 px-6">Kebutuhan &amp; Anggaran</th>
                    <th className="py-3.5 px-6">Laptop Rekomendasi #1 (TOPSIS)</th>
                    <th className="py-3.5 px-6">Tanggal Pengisian</th>
                    <th className="py-3.5 px-6 text-right">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400">
                        Memuat riwayat pengisian kuesioner...
                      </td>
                    </tr>
                  ) : filteredConsultations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500">
                        Belum ada riwayat kuesioner yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredConsultations.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-white text-sm">{c.userName}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{c.userEmail}</div>
                          <span className="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-cyan-300 uppercase">
                            {c.userRole}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 font-mono text-[11px] font-bold border border-violet-500/30">
                            {c.peruntukan}
                          </span>
                          <div className="text-[11px] text-zinc-400 font-mono mt-1">
                            {formatRupiah(c.budgetMin)} - {formatRupiah(c.budgetMax)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {c.topLaptop ? (
                            <div>
                              <div className="font-bold text-white text-sm line-clamp-1">
                                {c.topLaptop.brand} {c.topLaptop.name}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono">
                                <span className="text-emerald-400 font-bold">
                                  {formatRupiah(c.topLaptop.price)}
                                </span>
                                <span>•</span>
                                <span className="text-cyan-300 font-semibold">
                                  Skor V: {(c.topLaptop.nilaiV * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-500 italic">Belum ada hasil ranking</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-zinc-400 font-mono text-[11px]">
                          {formatTanggal(c.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <a
                            href={`/recommendation/${c.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/40 transition"
                          >
                            <span>Lihat Hasil</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Kriteria */}
      {editKriteria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0e0e15] border border-white/15 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Ubah Kriteria {editKriteria.kode}</span>
              </h3>
              <button
                onClick={() => setEditKriteria(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nama Kriteria
                </label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Tipe Kriteria (Benefit / Cost)
                </label>
                <select
                  value={editTipe}
                  onChange={(e) => setEditTipe(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="benefit">Benefit (Nilai lebih besar lebih bagus)</option>
                  <option value="cost">Cost (Nilai lebih kecil lebih bagus, misal Harga/Bobot)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Deskripsi Kriteria
                </label>
                <textarea
                  rows={3}
                  value={editDeskripsi}
                  onChange={(e) => setEditDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditKriteria(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-semibold hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingKriteria}
                onClick={handleSaveKriteria}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {savingKriteria ? 'Menyimpan...' : 'Simpan Kriteria'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
