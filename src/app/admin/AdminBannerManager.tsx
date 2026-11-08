'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowUpDown,
  ShoppingBag,
} from 'lucide-react';
import { BannerAd } from '@/lib/banner-store';
import { formatRupiah } from '@/lib/laptop-utils';

interface BannerFormData {
  title: string;
  brand: string;
  subtitle: string;
  price: string;
  originalPrice: string;
  discount: string;
  badge: string;
  processor: string;
  vga: string;
  ramGb: string;
  storageGb: string;
  display: string;
  imageUrl: string;
  tokopediaUrl: string;
  shopeeUrl: string;
  isActive: boolean;
  sortOrder: string;
}

const EMPTY_FORM: BannerFormData = {
  title: '',
  brand: '',
  subtitle: '',
  price: '',
  originalPrice: '',
  discount: 'Hemat 10%',
  badge: '🔥 Promo Terbaru',
  processor: 'Intel Core i7 / AMD Ryzen 7 AI',
  vga: 'Dedicated Graphics RTX Series',
  ramGb: '16',
  storageGb: '512',
  display: '15.6" IPS High Refresh Rate',
  imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
  tokopediaUrl: '',
  shopeeUrl: '',
  isActive: true,
  sortOrder: '1',
};

export default function AdminBannerManager() {
  const [banners, setBanners] = useState<BannerAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/banners');
        if (!res.ok) throw new Error('Gagal memuat banner.');
        const data = await res.json();
        if (!ignore) {
          setBanners(data.banners || []);
        }
      } catch {
        if (!ignore) {
          toast.error('Gagal mengambil daftar banner iklan.');
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

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      sortOrder: String(banners.length + 1),
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b: BannerAd) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      brand: b.brand,
      subtitle: b.subtitle,
      price: String(b.price),
      originalPrice: String(b.originalPrice || ''),
      discount: b.discount || '',
      badge: b.badge || '',
      processor: b.processor || '',
      vga: b.vga || '',
      ramGb: String(b.ramGb || 16),
      storageGb: String(b.storageGb || 512),
      display: b.display || '',
      imageUrl: b.imageUrl || '',
      tokopediaUrl: b.tokopediaUrl || '',
      shopeeUrl: b.shopeeUrl || '',
      isActive: b.isActive,
      sortOrder: String(b.sortOrder || 1),
    });
    setShowModal(true);
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBanners((prev) => prev.map((b) => (b.id === id ? data.banner : b)));
      toast.success(data.banner.isActive ? 'Banner diaktifkan! ✅' : 'Banner dinonaktifkan.');
    } catch {
      toast.error('Gagal mengubah status banner.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus banner "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success('Banner iklan berhasil dihapus! 🗑️');
    } catch {
      toast.error('Gagal menghapus banner.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.brand.trim() || !form.price.trim()) {
      toast.error('Judul, merek, dan harga wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          ramGb: Number(form.ramGb) || 16,
          storageGb: Number(form.storageGb) || 512,
          sortOrder: Number(form.sortOrder) || 1,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan banner.');
      }

      const result = await res.json();
      toast.success(editingId ? 'Banner berhasil diperbarui! 🎉' : 'Banner baru berhasil ditambahkan! 🚀');

      if (editingId) {
        setBanners((prev) => prev.map((b) => (b.id === editingId ? result.banner : b)));
      } else {
        setBanners((prev) => [...prev, result.banner]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs text-cyan-300">Pengaturan Slider Iklan Dashboard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Kelola Banner &amp; Iklan Slide
          </h2>
          <p className="text-xs text-zinc-400">
            Iklan aktif akan langsung tayang pada carousel slider di dashboard utama pengguna.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-violet-600/25 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Slide Iklan Baru</span>
        </button>
      </div>

      {/* Banner Cards List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 mt-3 font-mono">Memuat daftar slide iklan...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0e0e15]/80 border border-white/10">
          <Layers className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Belum Ada Banner Iklan</h3>
          <p className="text-xs text-zinc-400 mt-1 mb-4">Tambahkan slide pertama Anda sekarang.</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs"
          >
            + Buat Slide Baru
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {banners.map((b, idx) => (
            <div
              key={b.id}
              className={`p-5 rounded-3xl border transition duration-200 flex flex-col justify-between ${
                b.isActive
                  ? 'bg-[#0e0e15]/90 border-white/10 hover:border-violet-500/40'
                  : 'bg-zinc-950/40 border-white/5 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {b.brand}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Urutan: <strong>#{b.sortOrder}</strong>
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      b.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${b.isActive ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                    <span>{b.isActive ? 'Tayang' : 'Nonaktif'}</span>
                  </span>
                </div>

                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-20 h-16 rounded-xl object-cover border border-white/10 shrink-0 bg-zinc-900"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-white line-clamp-1">{b.title}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{b.subtitle}</p>
                    <div className="text-sm font-mono font-black text-emerald-400 mt-1">
                      {formatRupiah(b.price)}
                    </div>
                  </div>
                </div>

                {/* Specs Pill List */}
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono text-zinc-300">
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                    {b.processor}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-300">
                    {b.vga}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-cyan-300">
                    {b.ramGb}GB RAM / {b.storageGb}GB SSD
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => handleToggle(b.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                    b.isActive
                      ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/40'
                  }`}
                >
                  {b.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{b.isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(b)}
                    className="p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-800/40 transition cursor-pointer"
                    title="Edit banner"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id, b.title)}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 transition cursor-pointer"
                    title="Hapus banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit Banner */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-[#0e0e15] border border-cyan-500/40 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-lg text-white">
                {editingId ? 'Edit Slide Iklan Banner' : 'Tambah Slide Iklan Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Judul Banner Laptop *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Contoh: ASUS ROG Strix G16 AI 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Merek / Brand *</label>
                  <input
                    type="text"
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="Contoh: ASUS, Apple, Lenovo, MSI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Deskripsi / Subtitle Iklan</label>
                <textarea
                  rows={2}
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Deskripsi keunggulan laptop untuk memikat pengguna..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Harga Promo (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="Contoh: 21999000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Harga Asli Coret (Rp)</label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    placeholder="Contoh: 24999000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Label Diskon</label>
                  <input
                    type="text"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    placeholder="Contoh: Hemat 15%"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Processor</label>
                  <input
                    type="text"
                    value={form.processor}
                    onChange={(e) => setForm({ ...form, processor: e.target.value })}
                    placeholder="Contoh: AMD Ryzen 9 7845HX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">VGA / GPU</label>
                  <input
                    type="text"
                    value={form.vga}
                    onChange={(e) => setForm({ ...form, vga: e.target.value })}
                    placeholder="Contoh: NVIDIA RTX 4070 8GB"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">RAM (GB)</label>
                  <input
                    type="number"
                    value={form.ramGb}
                    onChange={(e) => setForm({ ...form, ramGb: e.target.value })}
                    placeholder="16"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Storage SSD (GB)</label>
                  <input
                    type="number"
                    value={form.storageGb}
                    onChange={(e) => setForm({ ...form, storageGb: e.target.value })}
                    placeholder="1000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Urutan Slide (1, 2, ...)</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">URL Gambar Banner</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Link Tokopedia (Opsional)</label>
                  <input
                    type="text"
                    value={form.tokopediaUrl}
                    onChange={(e) => setForm({ ...form, tokopediaUrl: e.target.value })}
                    placeholder="Kosongkan untuk otomatis cari di Tokopedia"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Link Shopee (Opsional)</label>
                  <input
                    type="text"
                    value={form.shopeeUrl}
                    onChange={(e) => setForm({ ...form, shopeeUrl: e.target.value })}
                    placeholder="Kosongkan untuk otomatis cari di Shopee"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <label htmlFor="isActive" className="text-zinc-300 font-semibold cursor-pointer">
                  Langsung Tayangkan Slide ini di Dashboard
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Slide Iklan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
