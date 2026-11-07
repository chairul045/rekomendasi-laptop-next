import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LaptopCatalog from './LaptopCatalog';
import LandingPage from '@/components/LandingPage';
import { getLaptopImageUrl, formatRupiah } from '@/lib/laptop-utils';
import { ClipboardList, ArrowRight, Clock, Wrench } from 'lucide-react';
import FeaturedLaptopAdBanner from '@/components/FeaturedLaptopAdBanner';
import { getActiveBanners } from '@/lib/banner-store';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch preview laptops for both guest landing and logged-in dashboard
  const laptopsRaw = await prisma.laptop.findMany({
    select: {
      id: true,
      name: true,
      brand: true,
      price: true,
      ramGb: true,
      storageGb: true,
      batteryHours: true,
      weightKg: true,
      performaKomposit: true,
      processorScore: true,
      vgaScore: true,
      displaySize: true,
      mobilityScore: true,
      condition: true,
      category: true,
      imageUrl: true,
    },
    orderBy: [{ performaKomposit: 'desc' }, { price: 'asc' }],
    take: 150,
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
    processorScore: l.processorScore,
    vgaScore: l.vgaScore,
    displaySize: l.displaySize,
    mobilityScore: l.mobilityScore,
    condition: l.condition,
    category: l.category,
    imageUrl: l.imageUrl,
  }));

  // === GUEST MODE: Show landing page ===
  if (!user) {
    return <LandingPage previewLaptops={laptops} />;
  }

  // === LOGGED-IN MODE: Fetch profile & consultation history ===
  const [profileExisting, consultations] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.kuisionerJawaban.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        judul: true,
        peruntukan: true,
        budgetMin: true,
        budgetMax: true,
        kondisiPilihan: true,
        tanggalPengisian: true,
        createdAt: true,
        hasilTopsis: {
          select: {
            id: true,
            nilaiV: true,
            peringkat: true,
            kondisi: true,
            laptop: {
              select: {
                id: true,
                name: true,
                brand: true,
                price: true,
                imageUrl: true,
                condition: true,
              },
            },
          },
          where: { peringkat: 1, kondisi: 'baru' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  let profile = profileExisting;
  if (!profile) {
    profile = await prisma.user.create({
      data: {
        id: user.id,
        name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
        email: user.email!,
        role: user.user_metadata?.role ?? 'mahasiswa',
      },
    });
  }

  // Serialize consultations - konversi BigInt ke string agar aman dipass ke JSX
  const consultationsSerialized = consultations.map((c) => ({
    ...c,
    budgetMin: c.budgetMin.toString(),
    budgetMax: c.budgetMax.toString(),
    hasilTopsis: c.hasilTopsis.map((h) => ({
      ...h,
      laptop: h.laptop ? {
        ...h.laptop,
        price: h.laptop.price.toString(),
      } : null,
    })),
  }));

  const latestSession = consultationsSerialized[0];
  const latestBest = latestSession?.hasilTopsis[0]?.laptop;

  const activeBanners = getActiveBanners();

  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
      <Navbar user={profile} historyCount={consultationsSerialized.length} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 sm:space-y-12">
        {/* Iklan Slider Laptop Terbaru & Terbaik (Multi-Slide, Editable by Admin) */}
        <FeaturedLaptopAdBanner initialBanners={activeBanners} userEmail={profile.email} />

        {/* Top Header Banner */}
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
                Platform pencocokan dan rekomendasi laptop mahasiswa presisi berbasis Smart Decision Matching &amp; AI Analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Toko Service Laptop Feature Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/40 via-zinc-900/90 to-cyan-950/40 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-violet-500/40 transition">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Wrench className="w-3.5 h-3.5" />
                <span>Fitur Baru: Lapmatch Care Service Hub</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                Terverifikasi di Berbagai Kota
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Laptop Lemot, Panas, Layar Rusak, atau Butuh Upgrade SSD &amp; RAM?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Temukan rekomendasi toko servis laptop terpercaya di kota Anda dengan simulasi diagnosa kerusakan cepat, estimasi biaya transparan, dan garansi pengerjaan 90 hari.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/service-laptop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-violet-600/25 active:scale-95"
            >
              <Wrench className="w-4 h-4" />
              <span>Buka Toko Servis Laptop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Catalog Showcase with Images */}
        <LaptopCatalog laptops={laptops} />

        {/* Riwayat Konsultasi Section */}
        <div className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Riwayat Konsultasi &amp; Rekomendasi Terakhir</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Daftar sesi kuisioner yang pernah Anda jalankan.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-mono px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                {consultationsSerialized.length} Sesi
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

          {consultationsSerialized.length === 0 ? (
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
                  {consultationsSerialized.map((item) => {
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
