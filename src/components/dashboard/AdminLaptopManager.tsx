'use client';

import { useState, useMemo } from 'react';
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
  FileSpreadsheet,
} from 'lucide-react';
import { getLaptopImageUrl, formatRupiah } from '@/lib/laptop-utils';
import ImportLaptopModal from './ImportLaptopModal';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LaptopItem {
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
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
        <span className="uppercase text-[11px] font-bold tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
        {value.toLocaleString('id-ID')}
      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {mode === 'create' ? 'Tambah Data Laptop Baru' : `Edit: ${initial?.name}`}
            </h2>
            <p className="text-xs text-slate-500">
              Masukkan spesifikasi lengkap laptop untuk basis data rekomendasi Lapmatch.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Nama Laptop *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: ASUS TUF Gaming A15"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Brand / Merek *</label>
              <select
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
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
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Harga (Rp) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="10000000"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Kondisi *</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="baru">Baru</option>
                <option value="second">Second</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
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
              <label className="text-slate-500 block mb-1 font-medium">RAM (GB)</label>
              <input
                type="number"
                value={form.ramGb}
                onChange={(e) => setForm({ ...form, ramGb: e.target.value })}
                placeholder="16"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1 font-medium">SSD (GB)</label>
              <input
                type="number"
                value={form.storageGb}
                onChange={(e) => setForm({ ...form, storageGb: e.target.value })}
                placeholder="512"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1 font-medium">Baterai (Jam)</label>
              <input
                type="number"
                step="0.5"
                value={form.batteryHours}
                onChange={(e) => setForm({ ...form, batteryHours: e.target.value })}
                placeholder="8"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1 font-medium">Berat (kg)</label>
              <input
                type="number"
                step="0.05"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                placeholder="1.5"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-500 block mb-1 font-medium">Skor Performa (1-100)</label>
              <input
                type="number"
                value={form.performaKomposit}
                onChange={(e) => setForm({ ...form, performaKomposit: e.target.value })}
                placeholder="85"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1 font-medium">Layar (Inci)</label>
              <input
                type="number"
                step="0.1"
                value={form.displaySize}
                onChange={(e) => setForm({ ...form, displaySize: e.target.value })}
                placeholder="15.6"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1 font-medium">URL Gambar (Opsional)</label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="images/laptops/asus-tuf.jpg"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[40px] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs disabled:opacity-50 cursor-pointer min-h-[40px]"
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
  const [laptops, setLaptops] = useState<LaptopItem[]>(initialLaptops);
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<LaptopItem | undefined>(undefined);
  const [showImportModal, setShowImportModal] = useState(false);

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
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
              Katalog Alternatif SPK
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Manajemen Data Laptop Alternatif
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kelola katalog data laptop untuk algoritma pencocokan cerdas TOPSIS &amp; ROC Lapmatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition cursor-pointer min-h-[42px]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel / CSV</span>
          </button>
          <button
            onClick={() => {
              setEditTarget(undefined);
              setModalMode('create');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs transition shadow-xs cursor-pointer min-h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Laptop Baru</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Database}
          label="Total Laptop"
          value={stats.totalLaptops + (laptops.length - initialLaptops.length)}
          color="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
        />
        <StatCard
          icon={Users}
          label="Total Pengguna"
          value={stats.totalUsers}
          color="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
        />
        <StatCard
          icon={ClipboardList}
          label="Total Konsultasi"
          value={stats.totalConsultations}
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
      </div>

      {/* Search & Filter */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau brand laptop..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition min-h-[40px]"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer min-h-[38px]"
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
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer min-h-[38px]"
          >
            <option value="">Semua Kondisi</option>
            <option value="baru">Baru</option>
            <option value="second">Second</option>
          </select>
          <span className="ml-auto text-xs text-slate-500 font-mono">
            Menampilkan {filtered.length} dari {laptops.length} laptop
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-semibold">
                <th className="py-3.5 px-6">Laptop</th>
                <th className="py-3.5 px-6">Harga</th>
                <th className="py-3.5 px-6 hidden sm:table-cell">Spesifikasi</th>
                <th className="py-3.5 px-6 hidden md:table-cell">Skor</th>
                <th className="py-3.5 px-6">Kondisi</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500">
                    Tidak ada laptop yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((laptop) => {
                  const imgUrl = getLaptopImageUrl(laptop.brand, laptop.name, laptop.imageUrl);

                  return (
                    <tr key={laptop.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgUrl}
                            alt={laptop.name}
                            className="w-10 h-10 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-tight truncate max-w-[200px] sm:max-w-none">
                              {laptop.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-500 uppercase font-semibold">{laptop.brand}</span>
                              {laptop.category && (
                                <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded font-medium border border-blue-200 dark:border-blue-800">
                                  {laptop.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-blue-700 dark:text-blue-400 text-xs">
                        {formatRupiah(laptop.price)}
                      </td>
                      <td className="py-4 px-6 hidden sm:table-cell">
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                          {laptop.ramGb && <div>RAM: {laptop.ramGb}GB</div>}
                          {laptop.storageGb && <div>SSD: {laptop.storageGb}GB</div>}
                          {laptop.batteryHours && <div>🔋 {laptop.batteryHours} jam</div>}
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold text-xs">
                          <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>{laptop.performaKomposit ?? '—'} / 100</span>
                        </div>
                        {laptop.weightKg && (
                          <div className="text-[10px] text-slate-500 mt-0.5">{laptop.weightKg} kg</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${
                            laptop.condition === 'baru'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
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
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(laptop.id, laptop.name)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
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

      {/* Modal Tambah/Edit Manual */}
      {modalMode && (
        <LaptopFormModal
          mode={modalMode}
          initial={editTarget}
          onClose={() => setModalMode(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Modal Import Bulk Excel/CSV */}
      <ImportLaptopModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={(latestLaptops) => {
          setLaptops(latestLaptops);
        }}
      />
    </div>
  );
}
