'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  RefreshCw,
  X,
} from 'lucide-react';
import { BannerAd } from '@/lib/banner-store';
import { formatRupiah, getLaptopImageUrl } from '@/lib/laptop-utils';

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
  imageUrl: '/images/laptops/gaming-laptop.jpg',
  tokopediaUrl: '',
  shopeeUrl: '',
  isActive: true,
  sortOrder: '1',
};

const BANNER_PRESETS = [
  {
    name: 'ASUS VivoBook 15 OLED',
    data: {
      title: 'ASUS VivoBook 15 OLED - Layar 2.8K OLED Nyaman & Baterai Awet Seharian',
      brand: 'ASUS',
      subtitle: 'Rekomendasi #1 mahasiswa untuk skripsi, coding, dan multitasking. Layar OLED 100% DCI-P3 akurat dengan sertifikasi Eye Care anti mata lelah.',
      price: '11999000',
      originalPrice: '13499000',
      discount: 'Hemat 11%',
      badge: '🏆 Pilihan #1 Kuliah & Skripsi',
      processor: 'Intel Core i5-1335U (10 Cores, up to 4.6 GHz)',
      vga: 'Intel Iris Xe Graphics 80EU',
      ramGb: '16',
      storageGb: '512',
      display: '15.6" FHD OLED 100% DCI-P3 600 nits Peak',
      imageUrl: '/images/laptops/asus-vivobook.jpg',
      tokopediaUrl: 'https://www.tokopedia.com/search?q=asus+vivobook+15+oled',
      shopeeUrl: 'https://shopee.co.id/search?keyword=asus+vivobook+15+oled',
    },
  },
  {
    name: 'Lenovo LOQ 15 Gaming',
    data: {
      title: 'Lenovo LOQ 15 Gaming - Intel Core i5 13th Gen + RTX 4050 6GB',
      brand: 'Lenovo',
      subtitle: 'Performa buas paling rasional untuk mahasiswa teknik informatika & multimedia. Libas rendering Blender 3D, machine learning, dan gaming esport.',
      price: '14999000',
      originalPrice: '16999000',
      discount: 'Hemat 12%',
      badge: '⚡ Best Value Gaming & Render',
      processor: 'Intel Core i5-13420H (8 Cores, 12 Threads)',
      vga: 'NVIDIA GeForce RTX 4050 6GB GDDR6 (95W TGP)',
      ramGb: '16',
      storageGb: '512',
      display: '15.6" FHD IPS 144Hz 100% sRGB G-SYNC',
      imageUrl: '/images/laptops/gaming-laptop.jpg',
      tokopediaUrl: 'https://www.tokopedia.com/search?q=lenovo+loq+15',
      shopeeUrl: 'https://shopee.co.id/search?keyword=lenovo+loq+15',
    },
  },
  {
    name: 'Apple MacBook Air M3 15"',
    data: {
      title: 'Apple MacBook Air M3 15-inch - Desain Ultra Tipis & Baterai 18 Jam',
      brand: 'Apple',
      subtitle: 'Standar emas produktivitas mahasiswa modern. Desain elegan tanpa kipas, performa Neural Engine AI kencang, dan ketahanan baterai tembus 18 jam.',
      price: '18999000',
      originalPrice: '21499000',
      discount: 'Hemat 12%',
      badge: '✨ Favorit Desain & Mobilitas',
      processor: 'Apple M3 Chip (8-Core CPU, 10-Core GPU, 16-Core Neural Engine)',
      vga: 'Apple 10-Core Integrated GPU with Hardware Ray Tracing',
      ramGb: '16',
      storageGb: '512',
      display: '15.3" Liquid Retina True Tone (500 nits, P3 Wide Color)',
      imageUrl: '/images/laptops/macbook.jpg',
      tokopediaUrl: 'https://www.tokopedia.com/search?q=macbook+air+m3',
      shopeeUrl: 'https://shopee.co.id/search?keyword=macbook+air+m3',
    },
  },
  {
    name: 'Acer Swift Go 14 AI',
    data: {
      title: 'Acer Swift Go 14 AI - Intel Core Ultra 5 dengan Intel AI Boost NPU',
      brand: 'Acer',
      subtitle: 'Laptop bertenaga AI generasi terbaru bersertifikasi Intel Evo. Bobot super ringan hanya 1.32 kg, siap diajak kuliah seharian tanpa pusing cari colokan.',
      price: '13499000',
      originalPrice: '14999000',
      discount: 'Hemat 10%',
      badge: '🚀 Next-Gen AI Laptop 2026',
      processor: 'Intel Core Ultra 5 125H (14 Cores, 18 Threads)',
      vga: 'Intel Arc Graphics (Dedicated-Class iGPU)',
      ramGb: '16',
      storageGb: '512',
      display: '14.0" 2.8K OLED (2880x1800) 90Hz 100% DCI-P3',
      imageUrl: '/images/laptops/acer-aspire.jpg',
      tokopediaUrl: 'https://www.tokopedia.com/search?q=acer+swift+go+14',
      shopeeUrl: 'https://shopee.co.id/search?keyword=acer+swift+go+14',
    },
  },
  {
    name: 'Lenovo ThinkPad T490 (Second)',
    data: {
      title: 'Lenovo ThinkPad T490 Grade A+ - Bandel, Awet & Siap Tempur Skripsi',
      brand: 'Lenovo',
      subtitle: 'Pilihan paling cerdas mahasiswa berbudget hemat 4 jutaan. Keyboard legendaris ternyaman di dunia, bodi standar militer MIL-STD-810G tahan banting.',
      price: '4750000',
      originalPrice: '6200000',
      discount: 'Diskon 23%',
      badge: '💡 Rekomendasi Second Terlaris',
      processor: 'Intel Core i5-8365U vPro (4 Cores, 8 Threads)',
      vga: 'Intel UHD Graphics 620',
      ramGb: '16',
      storageGb: '512',
      display: '14.0" FHD IPS Anti-Glare 300 nits',
      imageUrl: '/images/laptops/thinkpad.jpg',
      tokopediaUrl: 'https://www.tokopedia.com/search?q=thinkpad+t490',
      shopeeUrl: 'https://shopee.co.id/search?keyword=thinkpad+t490',
    },
  },
  {
    name: 'Lapmatch Care: Servis & Upgrade',
    data: {
      title: 'Lapmatch Care: Paket Servis Kilat, Bersih Kipas & Upgrade SSD RAM',
      brand: 'Lapmatch Care',
      subtitle: 'Laptop lemot, cepat panas, atau baterai drop? Konsultasi kerusakan gratis, upgrade kilat ditunggu, dan garansi resmi servis 90 hari.',
      price: '75000',
      originalPrice: '150000',
      discount: 'Promo 50%',
      badge: '🛠️ Servis & Upgrade Resmi',
      processor: 'Mendukung Semua Merek: ASUS, Lenovo, HP, Acer, Apple, MSI',
      vga: 'Teknisi Profesional & Sparepart Original Bergaransi',
      ramGb: '16',
      storageGb: '512',
      display: 'Diagnosa Cepat & Estimasi Biaya Transparan',
      imageUrl: '/images/laptops/lapmatch/lenovo-thinkpad-t480.jpg',
      tokopediaUrl: '/service-laptop',
      shopeeUrl: '/service-laptop',
    },
  },
];

export default function AdminBannerManager() {
  const [banners, setBanners] = useState<BannerAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      if (!res.ok) throw new Error('Gagal memuat banner.');
      const data = await res.json();
      setBanners(data.banners || []);
    } catch {
      toast.error('Gagal mengambil daftar banner iklan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
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

  const handleApplyPreset = (presetData: (typeof BANNER_PRESETS)[0]['data']) => {
    setForm((prev) => ({
      ...prev,
      ...presetData,
    }));
    toast.success('Template berhasil dimuat ke formulir! ✨');
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

  const activeCount = banners.filter((b) => b.isActive).length;
  const inactiveCount = banners.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Pengaturan Slider Iklan LapMatch
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Kelola Banner &amp; Iklan Slide
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Slide yang aktif akan langsung tampil di beranda utama untuk pengguna dan tamu.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Total: <strong>{banners.length}</strong> Slide</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{activeCount} Tayang Aktif</span>
            </span>
            {inactiveCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <EyeOff className="w-3.5 h-3.5" />
                <span>{inactiveCount} Nonaktif</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchBanners}
            title="Muat Ulang"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm transition shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Slide Baru</span>
          </button>
        </div>
      </div>

      {/* Banner Cards Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white dark:bg-[#0d1527] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Memuat daftar slide iklan...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <Layers className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Banner Iklan</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Tambahkan slide pertama Anda sekarang.</p>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm cursor-pointer"
          >
            + Buat Slide Baru
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`p-5 rounded-2xl border transition duration-200 flex flex-col justify-between ${
                b.isActive
                  ? 'bg-white dark:bg-[#0d1527] border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                      {b.brand}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      Urutan: <strong>#{b.sortOrder}</strong>
                    </span>
                    {b.badge && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                        {b.badge}
                      </span>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      b.isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${b.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span>{b.isActive ? 'Tayang' : 'Nonaktif'}</span>
                  </span>
                </div>

                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-24 h-20 rounded-xl object-contain border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900 p-1"
                    onError={(e) => {
                      e.currentTarget.src = getLaptopImageUrl(b.brand, b.title);
                    }}
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{b.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{b.subtitle}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(b.price)}
                      </span>
                      {b.originalPrice > b.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatRupiah(b.originalPrice)}
                        </span>
                      )}
                      {b.discount && (
                        <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                          {b.discount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specs Pill List */}
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                    {b.processor}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300">
                    {b.vga}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30 text-blue-700 dark:text-blue-300 font-medium">
                    {b.ramGb}GB RAM / {b.storageGb}GB SSD
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleToggle(b.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                    b.isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  {b.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{b.isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(b)}
                    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 transition cursor-pointer"
                    title="Edit banner"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id, b.title)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {editingId ? 'Edit Slide Iklan Banner' : 'Tambah Slide Iklan Baru'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Isi data di bawah atau muat dari template preset.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Preset Selector */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Pilih Template Cepat (Isi Otomatis):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BANNER_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset.data)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                Live Preview Mini:
              </span>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl || '/images/laptops/gaming-laptop.jpg'}
                  alt="Preview"
                  className="w-20 h-16 rounded-xl object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = getLaptopImageUrl(form.brand, form.title);
                  }}
                />
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {form.brand || 'BRAND'}
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      {form.badge || 'PROMO'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate mt-1">
                    {form.title || 'Judul Laptop Banner'}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {form.price ? formatRupiah(Number(form.price)) : 'Rp 0'}
                    </span>
                    {form.discount && (
                      <span className="text-[9px] text-rose-500 font-semibold">{form.discount}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Judul Banner Laptop *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Contoh: ASUS ROG Strix G16 AI 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Merek / Brand *</label>
                  <input
                    type="text"
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="Contoh: ASUS, Apple, Lenovo, MSI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Deskripsi / Subtitle Iklan</label>
                <textarea
                  rows={2}
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Deskripsi keunggulan laptop untuk memikat pengguna..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Harga Promo (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="Contoh: 21999000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Harga Asli Coret (Rp)</label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    placeholder="Contoh: 24999000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Label Diskon</label>
                  <input
                    type="text"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    placeholder="Contoh: Hemat 15%"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Processor</label>
                  <input
                    type="text"
                    value={form.processor}
                    onChange={(e) => setForm({ ...form, processor: e.target.value })}
                    placeholder="Contoh: AMD Ryzen 9 7845HX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">VGA / GPU</label>
                  <input
                    type="text"
                    value={form.vga}
                    onChange={(e) => setForm({ ...form, vga: e.target.value })}
                    placeholder="Contoh: NVIDIA RTX 4070 8GB"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">RAM (GB)</label>
                  <input
                    type="number"
                    value={form.ramGb}
                    onChange={(e) => setForm({ ...form, ramGb: e.target.value })}
                    placeholder="16"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Storage SSD (GB)</label>
                  <input
                    type="number"
                    value={form.storageGb}
                    onChange={(e) => setForm({ ...form, storageGb: e.target.value })}
                    placeholder="1000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Urutan Slide (1, 2, ...)</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Badge Penawaran</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="Contoh: 🔥 Promo Terbaru"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Layar / Display</label>
                  <input
                    type="text"
                    value={form.display}
                    onChange={(e) => setForm({ ...form, display: e.target.value })}
                    placeholder='Contoh: 15.6" IPS 144Hz'
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">URL Gambar Banner</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="/images/laptops/gaming-laptop.jpg atau https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-xs"
                />
                <span className="text-[10px] text-slate-500 block">
                  Tip: Gunakan gambar lokal seperti <code className="text-blue-600 dark:text-blue-400">/images/laptops/asus-vivobook.jpg</code>, <code className="text-blue-600 dark:text-blue-400">/images/laptops/gaming-laptop.jpg</code>, dll.
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Link Tokopedia (Opsional)</label>
                  <input
                    type="text"
                    value={form.tokopediaUrl}
                    onChange={(e) => setForm({ ...form, tokopediaUrl: e.target.value })}
                    placeholder="Kosongkan untuk otomatis cari di Tokopedia"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Link Shopee (Opsional)</label>
                  <input
                    type="text"
                    value={form.shopeeUrl}
                    onChange={(e) => setForm({ ...form, shopeeUrl: e.target.value })}
                    placeholder="Kosongkan untuk otomatis cari di Shopee"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="isActive" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  Langsung Tayangkan Slide ini di Dashboard &amp; Beranda
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 cursor-pointer shadow-sm active:scale-[0.98] transition"
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
