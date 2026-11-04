'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Wrench,
  Sparkles,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  DollarSign,
  Cpu,
  HelpCircle,
} from 'lucide-react';
import { SERVICE_SHOPS, POPULAR_PROBLEMS, ServiceProblem } from '@/data/service-shops';
import { formatRupiah } from '@/lib/laptop-utils';

export default function ServiceLaptopPage() {
  const [selectedCity, setSelectedCity] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProblem, setSelectedProblem] = useState<ServiceProblem | null>(POPULAR_PROBLEMS[0]);

  const cities = ['Semua', 'Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Medan', 'Semarang'];

  const filteredShops = SERVICE_SHOPS.filter((shop) => {
    const matchCity = selectedCity === 'Semua' ? true : shop.city.toLowerCase() === selectedCity.toLowerCase();
    const matchSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCity && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/40 via-zinc-900/90 to-cyan-950/30 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Wrench className="w-3.5 h-3.5" />
                <span>Lapmatch Care &amp; Partner Service Center</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                <span>Teknisi Tersertifikasi &amp; Bergaransi</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Pusat Servis, Perbaikan &amp; Upgrade Laptop Terpercaya
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
              Laptop mati total, panas berlebih, layar bergaris, atau lemot? Temukan rekomendasi tempat servis terverifikasi di kota Anda dengan estimasi biaya transparan dan garansi pengerjaan hingga 90 hari.
            </p>
          </div>
        </div>

        {/* Diagnostic Tool Card */}
        <div className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Diagnosa Kerusakan Cepat &amp; Estimasi Biaya</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pilih gejala kerusakan laptop Anda untuk melihat penyebab dan estimasi biaya perbaikan.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-xl w-fit">
              Simulasi Gratis
            </span>
          </div>

          {/* Symptom Selection Badges */}
          <div className="flex flex-wrap gap-2">
            {POPULAR_PROBLEMS.map((problem) => {
              const isSelected = selectedProblem?.id === problem.id;
              return (
                <button
                  key={problem.id}
                  onClick={() => setSelectedProblem(problem)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold shadow-lg shadow-violet-600/25 border border-cyan-400/50'
                      : 'bg-zinc-900/80 text-zinc-300 border border-white/10 hover:border-white/20 hover:bg-zinc-850'
                  }`}
                >
                  {problem.symptom.split('/')[0]}
                </button>
              );
            })}
          </div>

          {/* Diagnostic Result Box */}
          {selectedProblem && (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-zinc-950/90 to-zinc-900/90 border border-violet-500/20 space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-violet-400 font-bold tracking-wider">
                    Kategori: {selectedProblem.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                    {selectedProblem.symptom}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                      selectedProblem.urgency === 'Kritis'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : selectedProblem.urgency === 'Sedang'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    Tingkat Urgensi: {selectedProblem.urgency}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5 text-[11px] uppercase font-mono text-zinc-400">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kemungkinan Penyebab:</span>
                  </div>
                  <ul className="space-y-1 text-zinc-300 list-disc list-inside">
                    {selectedProblem.possibleCauses.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5 text-[11px] uppercase font-mono text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Tindakan Solusi Teknisi:</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {selectedProblem.recommendedSolution}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-zinc-400 font-mono">Kisaran Biaya:</span>
                  <span className="text-sm font-mono font-bold text-emerald-300">
                    {selectedProblem.estimatedCostRange}
                  </span>
                </div>

                <a
                  href={`https://wa.me/6281289123456?text=Halo%20Teknisi%20Lapmatch,%20laptop%20saya%20mengalami%20kendala:%20${encodeURIComponent(
                    selectedProblem.symptom
                  )}.%20Bisa%20bantu%20konsultasi%20dan%20estimasi%20servis?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/25 active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Konsultasi Kerusakan via WhatsApp Gratis</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Directory Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-violet-400" />
                <span>Direktori Toko Servis Terverifikasi</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Daftar tempat reparasi laptop yang telah lolos verifikasi keahlian dan ulasan pelanggan.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama toko, area, spesialis..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* City Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCity === city
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Shop Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 overflow-hidden flex flex-col justify-between hover:border-violet-500/40 transition duration-300 group shadow-lg"
              >
                <div>
                  {/* Shop Image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shop.imageUrl}
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                        {shop.city}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-amber-400 font-mono font-bold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{shop.rating}</span>
                        <span className="text-zinc-400 font-normal text-[10px]">({shop.reviewCount})</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                        Mulai {formatRupiah(shop.startingPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Shop Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition line-clamp-1">
                        {shop.name}
                      </h3>
                      <p className="text-xs text-zinc-400 flex items-start gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{shop.address}</span>
                      </p>
                    </div>

                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{shop.openHours}</span>
                    </div>

                    {/* Specialties */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono text-zinc-500">Layanan Unggulan:</span>
                      <div className="flex flex-wrap gap-1">
                        {shop.specialties.map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-900 border border-white/5 text-zinc-300"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${shop.whatsapp}?text=Halo%20${encodeURIComponent(
                      shop.name
                    )},%20saya%20mengetahui%20toko%20ini%20dari%20Lapmatch.%20Mau%20konsultasi%20servis%20laptop.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={shop.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 font-semibold text-xs transition"
                  >
                    <MapPin className="w-3.5 h-3.5 text-violet-400" />
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredShops.length === 0 && (
            <div className="text-center py-16 p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10">
              <MapPin className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
              <h3 className="font-bold text-base text-white">Tidak Ada Toko Servis Ditemukan</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Coba ubah kata kunci pencarian atau pilih kota lainnya.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
