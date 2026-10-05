import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LaptopCatalog from './LaptopCatalog';
import { getLaptopImageUrl, formatRupiah } from '@/lib/laptop-utils';
import { ClipboardList, ArrowRight, Clock, Plus } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch / auto-create user profile
  let profile = await prisma.user.findUnique({ where: { id: user.id } });
  if (!profile) {
    profile = await prisma.user.create({
      data: {
        id: user.id,
        name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Mahasiswa',
        email: user.email!,
        role: 'mahasiswa',
      },
    });
  }

  // Fetch consultations for this user
  const consultations = await prisma.kuisionerJawaban.findMany({
    where: { userId: user.id },
    include: {
      hasilTopsis: {
        include: { laptop: true },
        orderBy: { peringkat: 'asc' },
        take: 3,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Fetch featured laptops for catalog
  const laptopsRaw = await prisma.laptop.findMany({
    orderBy: [{ performaKomposit: 'desc' }, { price: 'asc' }],
    take: 24,
  });

  const laptops = laptopsRaw.map((l) => ({
    id: l.id,
    name: l.name,
    brand: l.brand,
    price: l.price.toString(),
    ramGb: l.ramGb,
    storageGb: l.storageGb,
    batteryHours: l.batteryHours,
    weightKg: l.weightKg,
    performaKomposit: l.performaKomposit,
    condition: l.condition,
    category: l.category,
    imageUrl: l.imageUrl,
  }));

  const latestSession = consultations[0];
  const latestBest = latestSession?.hasilTopsis[0]?.laptop;

  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
      <Navbar user={profile} historyCount={consultations.length} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Top Header & Action Banner (21st.dev style with glowing border) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900/90 via-violet-950/30 to-zinc-900/90 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Halo, {profile.name}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20 capitalize">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                Pusat rekomendasi laptop mahasiswa berbasis sistem pendukung keputusan multi-kriteria TOPSIS & preferensi bobot Rank Order Centroid (ROC).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/questionnaire"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-violet-600/25 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Mulai Kuisioner Baru</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-violet-500/40 transition duration-300">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
              <span className="font-mono uppercase text-[11px] tracking-wider text-zinc-400">
                Total Sesi Kuisioner
              </span>
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              {consultations.length}
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Riwayat evaluasi TOPSIS tersimpan</span>
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition duration-300">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
              <span className="font-mono uppercase text-[11px] tracking-wider text-zinc-400">
                Rekomendasi Terakhir
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            {latestBest ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getLaptopImageUrl(latestBest.brand, latestBest.name, latestBest.imageUrl)}
                  alt={latestBest.name}
                  className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition">
                    {latestBest.name}
                  </div>
                  <div className="text-xs font-mono text-emerald-400 font-bold">
                    {formatRupiah(latestBest.price)}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-base font-semibold text-zinc-400">Belum ada kuisioner</div>
                <p className="text-[11px] text-zinc-500 mt-2 font-mono">
                  Silakan isi formulir kuisioner baru
                </p>
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition duration-300">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
              <span className="font-mono uppercase text-[11px] tracking-wider text-zinc-400">
                Metode Pembobotan
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              ROC & TOPSIS
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono">
                Kategori Baru
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-amber-300 font-mono">
                Kategori Second
              </span>
            </p>
          </div>
        </div>

        {/* 6 Kriteria Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-2">
          <span className="text-xs text-zinc-400 font-mono">Kriteria Keputusan:</span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-violet-950/40 text-violet-300 border border-violet-800/40">💰 C1: Harga</span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">⚡ C2: Performa</span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">🧠 C3: RAM</span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">💾 C4: Storage SSD</span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-amber-950/40 text-amber-300 border border-amber-800/40">🔋 C5: Baterai</span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-pink-950/40 text-pink-300 border border-pink-800/40">🎒 C6: Portabilitas</span>
        </div>

        {/* Catalog Showcase with Images */}
        <LaptopCatalog laptops={laptops} />

        {/* Riwayat Konsultasi Section */}
        <div className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Riwayat Konsultasi & Rekomendasi Terakhir</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Daftar sesi kuisioner yang pernah Anda jalankan.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-mono px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                {consultations.length} Sesi
              </span>
              <Link
                href="/history"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {consultations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 mx-auto flex items-center justify-center text-zinc-400 mb-4">
                <ClipboardList className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-white">Belum Ada Riwayat Konsultasi</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
                Anda belum pernah mengisi kuisioner. Dapatkan rekomendasi laptop terbaik yang dipersonalisasi dengan mengisi preferensi Anda.
              </p>
              <Link
                href="/questionnaire"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-violet-600/20"
              >
                Isi Kuisioner Sekarang →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-zinc-400 font-mono uppercase text-[11px]">
                    <th className="py-3.5 px-6">Sesi / Tanggal Pengisian</th>
                    <th className="py-3.5 px-6">Laptop Terbaik</th>
                    <th className="py-3.5 px-6">Harga</th>
                    <th className="py-3.5 px-6">Peruntukan</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {consultations.slice(0, 5).map((item) => {
                    const best = item.hasilTopsis[0];
                    const laptop = best?.laptop;
                    const dateFormatted = new Date(item.tanggalPengisian).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-6 text-xs">
                          <div className="font-bold text-white font-mono text-sm">
                            {item.judul ?? `Konsultasi ${item.peruntukan}`}
                          </div>
                          <div className="text-[11px] text-cyan-300/90 font-mono flex items-center gap-1.5 mt-1">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>{dateFormatted}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {laptop ? (
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getLaptopImageUrl(laptop.brand, laptop.name, laptop.imageUrl)}
                                alt={laptop.name}
                                className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                                loading="lazy"
                              />
                              <div className="min-w-0">
                                <div className="font-semibold text-white truncate max-w-[220px]">
                                  {laptop.name}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                                      laptop.condition === 'second'
                                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                    }`}
                                  >
                                    {laptop.condition}
                                  </span>
                                  {best && (
                                    <span className="text-[10px] text-cyan-300 font-mono">
                                      Skor: {(best.nilaiV * 100).toFixed(1)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-500 italic text-xs">Sedang diproses</span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-emerald-400 text-xs">
                          {laptop ? formatRupiah(laptop.price) : '—'}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-violet-950/40 text-violet-300 border border-violet-800/40">
                            {item.peruntukan}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/recommendation/${item.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs transition shadow-sm"
                          >
                            <span>Lihat Hasil</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
