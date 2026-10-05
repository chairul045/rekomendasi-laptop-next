'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Laptop,
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  ClipboardList,
  Database,
  X,
  Save,
  BarChart3,
  Filter,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getLaptopImageUrl, formatRupiah } from '@/lib/laptop-utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LaptopItem {
  id: number;
  name: string;
  brand: string;
  price: string;
  performaKomposit: number | null;
  processorScore: number | null;
  vgaScore: number | null;
  ramGb: number | null;
  storageGb: number | null;
  displaySize: number | null;
  batteryHours: number | null;
  weightKg: number | null;
  mobilityScore: number | null;
  category: string | null;
  condition: string;
  imageUrl: string | null;
}

interface Stats {
  totalUsers: number;
  totalConsultations: number;
  totalLaptops: number;
}

interface FormData {
  name: string;
  brand: string;
  price: string;
  condition: string;
  category: string;
  performaKomposit: string;
  processorScore: string;
  vgaScore: string;
  ramGb: string;
  storageGb: string;
  displaySize: string;
  batteryHours: string;
  weightKg: string;
  mobilityScore: string;
  imageUrl: string;
}

const EMPTY_FORM: FormData = {
  name: '',
  brand: '',
  price: '',
  condition: 'baru',
  category: 'Kuliah',
  performaKomposit: '',
  processorScore: '',
  vgaScore: '',
  ramGb: '',
  storageGb: '',
  displaySize: '',
  batteryHours: '',
  weightKg: '',
  mobilityScore: '',
  imageUrl: '',
};

const BRANDS = ['ASUS', 'Lenovo', 'HP', 'Acer', 'MSI', 'Apple', 'Dell', 'Huawei', 'Axioo', 'ADVAN', 'Lainnya'];
const CATEGORIES = ['Kuliah', 'Gaming', 'Desain Grafis', 'Programming', 'Bisnis', 'Multimedia'];

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md">
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
        <span className="font-mono uppercase text-[11px] tracking-wider text-zinc-400">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-3xl font-black text-white font-mono">{value.toLocaleString('id-ID')}</div>
    </div>
  );
}

// ── Laptop Form Modal ─────────────────────────────────────────────────────────

function LaptopFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit';
  initial?: LaptopItem;
  onClose: () => void;
  onSaved: (laptop: LaptopItem) => void;
}) {
  const [form, setForm] = useState<FormData>(() => {
    if (!initial) return EMPTY_FORM;
    return {
      name: initial.name,
      brand: initial.brand,
      price: initial.price,
      condition: initial.condition,
      category: initial.category || 'Kuliah',
      performaKomposit: initial.performaKomposit?.toString() || '',
      processorScore: initial.processorScore?.toString() || '',
      vgaScore: initial.vgaScore?.toString() || '',
      ramGb: initial.ramGb?.toString() || '',
      storageGb: initial.storageGb?.toString() || '',
      displaySize: initial.displaySize?.toString() || '',
      batteryHours: initial.batteryHours?.toString() || '',
      weightKg: initial.weightKg?.toString() || '',
      mobilityScore: initial.mobilityScore?.toString() || '',
      imageUrl: initial.imageUrl || '',
    };
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.brand || !form.price) {
      toast.error('Nama, brand, dan harga wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand,
        price: Number(form.price),
        condition: form.condition,
        category: form.category || null,
        performaKomposit: form.performaKomposit ? parseInt(form.performaKomposit) : null,
        processorScore: form.processorScore ? parseInt(form.processorScore) : null,
        vgaScore: form.vgaScore ? parseInt(form.vgaScore) : null,
        ramGb: form.ramGb ? parseInt(form.ramGb) : null,
        storageGb: form.storageGb ? parseInt(form.storageGb) : null,
        displaySize: form.displaySize ? parseFloat(form.displaySize) : null,
        batteryHours: form.batteryHours ? parseFloat(form.batteryHours) : null,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
        mobilityScore: form.mobilityScore ? parseInt(form.mobilityScore) : null,
        imageUrl: form.imageUrl.trim() || null,
      };

      const url = mode === 'create' ? '/api/admin/laptops' : `/api/admin/laptops/${initial?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Gagal menyimpan laptop.');
        return;
      }

      const data = await res.json();
      toast.success(mode === 'create' ? 'Laptop berhasil ditambahkan!' : 'Data laptop diperbarui!');
      onSaved(data.laptop);
      onClose();
    } catch {
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e0e15] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">
              {mode === 'create' ? 'Tambah Data Laptop Baru' : `Edit: ${initial?.name}`}
            </h2>
            <p className="text-xs text-zinc-400">
              Masukkan spesifikasi lengkap laptop untuk evaluasi SPK TOPSIS.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Nama Laptop *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: ASUS TUF Gaming A15"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Brand / Merek *</label>
              <select
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="">Pilih Brand</option>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Harga (Rp) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="10000000"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Kondisi *</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="baru">Baru</option>
                <option value="second">Second</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="text-zinc-400 block mb-1">RAM (GB)</label>
              <input
                type="number"
                value={form.ramGb}
                onChange={(e) => setForm({ ...form, ramGb: e.target.value })}
                placeholder="16"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">SSD (GB)</label>
              <input
                type="number"
                value={form.storageGb}
                onChange={(e) => setForm({ ...form, storageGb: e.target.value })}
                placeholder="512"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Baterai (Jam)</label>
              <input
                type="number"
                step="0.5"
                value={form.batteryHours}
                onChange={(e) => setForm({ ...form, batteryHours: e.target.value })}
                placeholder="8"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Berat (kg)</label>
              <input
                type="number"
                step="0.05"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                placeholder="1.5"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-zinc-400 block mb-1">Skor Performa (1-100)</label>
              <input
                type="number"
                value={form.performaKomposit}
                onChange={(e) => setForm({ ...form, performaKomposit: e.target.value })}
                placeholder="85"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Layar (Inci)</label>
              <input
                type="number"
                step="0.1"
                value={form.displaySize}
                onChange={(e) => setForm({ ...form, displaySize: e.target.value })}
                placeholder="15.6"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">URL Gambar (Opsional)</label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="images/laptops/asus-tuf.jpg"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-violet-600/20 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Data'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Admin Component ──────────────────────────────────────────────────────

export default function AdminLaptopManager({
  initialLaptops,
  stats,
  adminName,
}: {
  initialLaptops: LaptopItem[];
  stats: Stats;
  adminName: string;
}) {
  const router = useRouter();
  const [laptops, setLaptops] = useState<LaptopItem[]>(initialLaptops);
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<LaptopItem | undefined>(undefined);

  const filtered = useMemo(() => {
    return laptops.filter((laptop) => {
      const matchSearch =
        laptop.name.toLowerCase().includes(search.toLowerCase()) ||
        laptop.brand.toLowerCase().includes(search.toLowerCase());
      const matchBrand = filterBrand ? laptop.brand === filterBrand : true;
      const matchCondition = filterCondition ? laptop.condition === filterCondition : true;
      return matchSearch && matchBrand && matchCondition;
    });
  }, [laptops, search, filterBrand, filterCondition]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus laptop "${name}" dari database?`)) return;
    try {
      const res = await fetch(`/api/admin/laptops/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success(`"${name}" berhasil dihapus.`);
      setLaptops((prev) => prev.filter((l) => l.id !== id));
      router.refresh();
    } catch {
      toast.error('Gagal menghapus laptop.');
    }
  };

  const handleSaved = (laptop: LaptopItem) => {
    if (modalMode === 'edit') {
      setLaptops((prev) => prev.map((l) => (l.id === laptop.id ? laptop : l)));
    } else {
      setLaptops((prev) => [laptop, ...prev]);
    }
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono text-xs text-amber-300">Admin Control Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Manajemen Data Laptop Alternatif
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Kelola katalog laptop untuk komputasi algoritme TOPSIS & ROC.
            </p>
          </div>

          <button
            onClick={() => {
              setEditTarget(undefined);
              setModalMode('create');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-violet-600/25 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Laptop Baru</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Database}
            label="Total Laptop"
            value={stats.totalLaptops + (laptops.length - initialLaptops.length)}
            color="bg-blue-500/10 text-blue-400"
          />
          <StatCard
            icon={Users}
            label="Total Pengguna"
            value={stats.totalUsers}
            color="bg-indigo-500/10 text-indigo-400"
          />
          <StatCard
            icon={ClipboardList}
            label="Total Konsultasi"
            value={stats.totalConsultations}
            color="bg-emerald-500/10 text-emerald-400"
          />
        </div>

        {/* Search & Filter */}
        <div className="p-4 rounded-2xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-sm space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau brand laptop..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="text-xs bg-zinc-950/90 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="">Semua Brand</option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="text-xs bg-zinc-950/90 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="">Semua Kondisi</option>
              <option value="baru">Baru</option>
              <option value="second">Second</option>
            </select>
            <span className="ml-auto text-xs text-zinc-400 font-mono">
              Menampilkan {filtered.length} dari {laptops.length} laptop
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-zinc-400 font-mono uppercase text-[11px]">
                  <th className="py-3.5 px-6">Laptop</th>
                  <th className="py-3.5 px-6">Harga</th>
                  <th className="py-3.5 px-6 hidden sm:table-cell">Spesifikasi</th>
                  <th className="py-3.5 px-6 hidden md:table-cell">Skor</th>
                  <th className="py-3.5 px-6">Kondisi</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-zinc-500">
                      Tidak ada laptop yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((laptop) => {
                    const imgUrl = getLaptopImageUrl(laptop.brand, laptop.name, laptop.imageUrl);

                    return (
                      <tr key={laptop.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={laptop.name}
                              className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                              loading="lazy"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-white text-xs sm:text-sm leading-tight truncate max-w-[200px] sm:max-w-none">
                                {laptop.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-zinc-400 font-mono">{laptop.brand}</span>
                                {laptop.category && (
                                  <span className="text-[10px] text-cyan-300 bg-cyan-950/40 px-1.5 py-0.2 rounded font-mono border border-cyan-800/40">
                                    {laptop.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-emerald-400 text-xs">
                          {formatRupiah(laptop.price)}
                        </td>
                        <td className="py-4 px-6 hidden sm:table-cell">
                          <div className="text-xs text-zinc-400 space-y-0.5 font-mono">
                            {laptop.ramGb && <div>RAM: {laptop.ramGb}GB</div>}
                            {laptop.storageGb && <div>SSD: {laptop.storageGb}GB</div>}
                            {laptop.batteryHours && <div>🔋 {laptop.batteryHours} jam</div>}
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                          <div className="flex items-center gap-1 text-cyan-300 font-mono font-bold text-xs">
                            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{laptop.performaKomposit ?? '—'} / 100</span>
                          </div>
                          {laptop.weightKg && (
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{laptop.weightKg} kg</div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-mono capitalize font-bold ${
                              laptop.condition === 'baru'
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            }`}
                          >
                            {laptop.condition}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditTarget(laptop);
                                setModalMode('edit');
                              }}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800 transition"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(laptop.id, laptop.name)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal */}
      {modalMode && (
        <LaptopFormModal
          mode={modalMode}
          initial={editTarget}
          onClose={() => setModalMode(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
