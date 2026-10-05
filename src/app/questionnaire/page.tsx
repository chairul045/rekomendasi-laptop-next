'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Send,
  Calendar,
  DollarSign,
  Tag,
  Laptop as LaptopIcon,
  Check,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ── Kriteria Definitions ──────────────────────────────────────────────────────

const ALL_CRITERIA = [
  {
    code: 'C1',
    label: 'Efisiensi Anggaran (Harga)',
    desc: 'Laptop harga terjangkau dan sesuai budget',
    emoji: '💰',
    color: 'from-emerald-950/40 to-zinc-900/60 border-emerald-500/30 text-emerald-300',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  },
  {
    code: 'C2',
    label: 'Performa Komputasi',
    desc: 'Kecepatan prosesor & kartu grafis (GPU) untuk komputasi berat',
    emoji: '⚡',
    color: 'from-blue-950/40 to-zinc-900/60 border-blue-500/30 text-blue-300',
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  },
  {
    code: 'C3',
    label: 'Kapasitas RAM',
    desc: 'Kelancaran multitasking dan pembukaan banyak aplikasi sekaligus',
    emoji: '🧠',
    color: 'from-purple-950/40 to-zinc-900/60 border-purple-500/30 text-purple-300',
    badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  },
  {
    code: 'C4',
    label: 'Kecepatan & Kapasitas Storage SSD',
    desc: 'Waktu booting cepat dan ruang penyimpanan file perkuliahan',
    emoji: '💾',
    color: 'from-indigo-950/40 to-zinc-900/60 border-indigo-500/30 text-indigo-300',
    badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  },
  {
    code: 'C5',
    label: 'Daya Tahan Baterai',
    desc: 'Ketahanan pemakaian tanpa harus bergantung pada colokan charger',
    emoji: '🔋',
    color: 'from-amber-950/40 to-zinc-900/60 border-amber-500/30 text-amber-300',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  },
  {
    code: 'C6',
    label: 'Portabilitas & Bobot Ringan',
    desc: 'Kenyamanan dibawa ke kampus dan mobilitas harian',
    emoji: '🎒',
    color: 'from-pink-950/40 to-zinc-900/60 border-pink-500/30 text-pink-300',
    badge: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  },
];

const BRANDS = ['ASUS', 'Lenovo', 'HP', 'Acer', 'MSI', 'Apple', 'Dell', 'Huawei', 'Axioo', 'ADVAN'];

const PERUNTUKAN_OPTIONS = [
  { value: 'Kuliah', label: 'Kuliah & Tugas Harian', desc: 'Office, browsing, presentasi, dan riset' },
  { value: 'Programming', label: 'Programming & Coding', desc: 'VS Code, Docker, kompilasi, emulator' },
  { value: 'Desain Grafis', label: 'Desain Grafis & Multimedia', desc: 'Photoshop, Illustrator, video editing' },
  { value: 'Gaming', label: 'Gaming & Render 3D', desc: 'Game AAA, Blender, CAD, performa tinggi' },
  { value: 'Bisnis', label: 'Bisnis & Mobilitas Tinggi', desc: 'Baterai awet, tipis, profesional' },
];

const BUDGET_PRESETS = [
  { label: 'Rp 3 - 6 Juta', min: 3000000, max: 6000000 },
  { label: 'Rp 6 - 10 Juta', min: 6000000, max: 10000000 },
  { label: 'Rp 10 - 15 Juta', min: 10000000, max: 15000000 },
  { label: 'Rp 15 - 30 Juta', min: 15000000, max: 30000000 },
];

// ── Sortable Item ─────────────────────────────────────────────────────────────

function SortableItem({ id, index }: { id: string; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const criteria = ALL_CRITERIA.find((c) => c.code === id);
  if (!criteria) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r ${criteria.color} border backdrop-blur-md ${
        isDragging ? 'shadow-2xl scale-[1.02] border-cyan-400' : 'hover:border-white/20'
      } transition duration-150 cursor-grab active:cursor-grabbing select-none`}
    >
      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${criteria.badge} shrink-0`}>
        #{index + 1}
      </span>
      <span className="text-xl shrink-0">{criteria.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-xs sm:text-sm text-white truncate">{criteria.label}</p>
        <p className="text-[11px] text-zinc-400 truncate">{criteria.desc}</p>
      </div>
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function QuestionnairePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [judul, setJudul] = useState('');
  const [tanggalPengisian, setTanggalPengisian] = useState(new Date().toISOString().split('T')[0]);
  const [budgetMin, setBudgetMin] = useState(4000000);
  const [budgetMax, setBudgetMax] = useState(15000000);
  const [peruntukan, setPeruntukan] = useState('Kuliah');
  const [kondisiPilihan, setKondisiPilihan] = useState<'baru' | 'second' | 'keduanya'>('keduanya');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['semua']);
  const [frekuensiMembawa, setFrekuensiMembawa] = useState('Rutin');
  const [rankingKriteria, setRankingKriteria] = useState(ALL_CRITERIA.map((c) => c.code));

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRankingKriteria((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const toggleBrand = (brand: string) => {
    if (brand === 'semua') {
      setSelectedBrands(['semua']);
      return;
    }
    let updated = selectedBrands.filter((b) => b !== 'semua');
    if (updated.includes(brand)) {
      updated = updated.filter((b) => b !== brand);
    } else {
      updated.push(brand);
    }
    if (updated.length === 0) {
      updated = ['semua'];
    }
    setSelectedBrands(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (budgetMin > budgetMax) {
      toast.error('Batas minimal budget tidak boleh lebih besar dari batas maksimal.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: judul || `Konsultasi ${peruntukan} (${new Date().toLocaleDateString('id-ID')})`,
          budgetMin,
          budgetMax,
          peruntukan,
          kondisiPilihan,
          merekPilihan: selectedBrands,
          frekuensiMembawa,
          rankingKriteria,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Gagal memproses kuisioner.');
        return;
      }

      toast.success('Perhitungan TOPSIS & analisis AI selesai!');
      router.push(`/recommendation/${data.jawabanId}`);
    } catch {
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-gradient-to-r from-violet-950/60 to-cyan-950/60 border border-violet-500/30 text-cyan-300 mb-3 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Kuisioner Preferensi & SPK TOPSIS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Kuisioner Kebutuhan{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">
              Laptop Mahasiswa
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed max-w-2xl">
            Isi preferensi penggunaan Anda. Sistem akan memproses perhitungan secara otomatis, menyaring katalog alternatif laptop, dan menyajikan rekomendasi terbaik lengkap dengan analisis <strong>AI</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sesi Label & Tanggal */}
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md shadow-lg space-y-4">
            <div className="grid sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    <span>Nama / Label Kuisioner (Opsional)</span>
                  </label>
                  <span className="text-[11px] text-zinc-400 font-mono">Penanda sesi riwayat</span>
                </div>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Kebutuhan Skripsi, Laptop Editing Video, atau Kuliah Harian"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                />
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Tanggal Pengisian</span>
                  </label>
                  <span className="text-[11px] text-cyan-400 font-mono">WIB</span>
                </div>
                <input
                  type="date"
                  value={tanggalPengisian}
                  onChange={(e) => setTanggalPengisian(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 text-zinc-100 font-mono text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>
          </div>

          {/* 1. Rentang Anggaran (Budget) */}
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">
                  1
                </span>
                <label className="text-sm font-semibold text-white">Rentang Anggaran (Budget)</label>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                Fungsi: Filter Data
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Tentukan batas minimal dan maksimal harga laptop yang akan diikutsertakan dalam pemeringkatan TOPSIS.
            </p>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BUDGET_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setBudgetMin(p.min);
                    setBudgetMax(p.max);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition text-center cursor-pointer ${
                    budgetMin === p.min && budgetMax === p.max
                      ? 'bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 border-emerald-500/50 text-white font-bold'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-600 text-zinc-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Batas Minimal (Rp)</label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  step="500000"
                  min="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Batas Maksimal (Rp)</label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  step="500000"
                  min="1000000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>
          </div>

          {/* 2. Peruntukan Pemakaian */}
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">
                  2
                </span>
                <label className="text-sm font-semibold text-white">Peruntukan Pemakaian Utama</label>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/50">
                Fungsi: Label & AI Persona
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERUNTUKAN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPeruntukan(opt.value)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                    peruntukan === opt.value
                      ? 'bg-gradient-to-br from-violet-950/60 to-indigo-950/40 border-violet-500/50 text-white shadow-[0_0_20px_rgba(124,58,237,0.2)]'
                      : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                      peruntukan === opt.value
                        ? 'border-cyan-400 bg-cyan-400 text-zinc-950'
                        : 'border-zinc-600'
                    }`}
                  >
                    {peruntukan === opt.value && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">{opt.label}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Kondisi Laptop */}
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">
                  3
                </span>
                <label className="text-sm font-semibold text-white">Kondisi Laptop yang Diinginkan</label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'keduanya', label: 'Semua Kondisi', sub: 'Baru & Second' },
                { value: 'baru', label: 'Hanya Baru', sub: 'Garansi Resmi' },
                { value: 'second', label: 'Hanya Second', sub: 'Harga Lebih Hemat' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setKondisiPilihan(opt.value as 'baru' | 'second' | 'keduanya')}
                  className={`p-3.5 rounded-2xl border text-center transition cursor-pointer ${
                    kondisiPilihan === opt.value
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500/50 text-white font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-bold">{opt.label}</div>
                  <div className="text-[10px] text-zinc-300 opacity-80 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Filter Merek */}
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">
                  4
                </span>
                <label className="text-sm font-semibold text-white">Filter Merek Pilihan</label>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Bisa pilih beberapa</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleBrand('semua')}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  selectedBrands.includes('semua')
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                ✨ Semua Merek
              </button>
              {BRANDS.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => toggleBrand(brand)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    selectedBrands.includes(brand)
                      ? 'bg-violet-600/30 text-violet-300 border-violet-500/50 shadow-sm'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Urutan Prioritas Kriteria (ROC Weighting) */}
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">
                  5
                </span>
                <label className="text-sm font-semibold text-white">
                  Prioritas Kriteria Keputusan (Metode ROC)
                </label>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                Drag & Drop
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tarik dan geser kartu kriteria dari <strong>paling penting (#1 di atas)</strong> hingga{' '}
              <strong>kurang penting (#6 di bawah)</strong>. Bobot matematis ROC akan dihitung secara transparan.
            </p>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={rankingKriteria} strategy={verticalListSortingStrategy}>
                <div className="space-y-2.5">
                  {rankingKriteria.map((code, index) => (
                    <SortableItem key={code} id={code} index={index} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Live ROC Weights Calculation Preview */}
            <div className="mt-4 p-4 rounded-2xl bg-zinc-950/80 border border-white/5 space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 block mb-1">
                Kalkulasi Bobot ROC (Rank Order Centroid):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                {rankingKriteria.map((code, index) => {
                  const k = 6;
                  let sum = 0;
                  for (let j = index + 1; j <= k; j++) sum += 1 / j;
                  const weightPct = ((sum / k) * 100).toFixed(1);
                  const crit = ALL_CRITERIA.find((c) => c.code === code);

                  return (
                    <div key={code} className="p-2 rounded-xl bg-zinc-900/60 border border-white/5">
                      <div className="text-[10px] font-mono text-zinc-500">#{index + 1} {crit?.code}</div>
                      <div className="text-xs font-bold text-cyan-300 font-mono mt-0.5">{weightPct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.7)] transition active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menghitung TOPSIS & Narasi AI...</span>
                </>
              ) : (
                <>
                  <span>Proses Rekomendasi TOPSIS & AI</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
