'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, PhoneCall, ArrowRight, ShieldCheck, Wrench } from 'lucide-react';

const SESSION_KEY = 'lapmatch_banner_v3_dismissed';

export default function ShopAdBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {}
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Pengumuman LapMatch"
      className="relative z-50 w-full px-2 sm:px-4 pt-2 pb-1 bg-white/80 dark:bg-[#09090d]/80 backdrop-blur-md transition-colors"
    >
      {/* ── 21st.dev Style Floating Glass Announcement Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/25 dark:border-violet-500/30 bg-gradient-to-r from-zinc-950 via-[#0e1122] to-zinc-950 text-white shadow-[0_4px_30px_rgba(139,92,246,0.18)]">
        {/* Animated Moving Light Beam (21st.dev signature) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, transparent 20%, rgba(139,92,246,0.12) 35%, rgba(6,182,212,0.18) 50%, rgba(139,92,246,0.12) 65%, transparent 80%)',
            backgroundSize: '200% 100%',
            animation: 'beamSlide 5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }}
        />

        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/70 to-violet-500/70 pointer-events-none" />

        {/* Inner Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-5 py-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4">
            {/* Left Block: LapMatch Brand & Message */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {/* Brand & Live Status Badge */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-inner">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-black text-white text-xs sm:text-sm tracking-wide bg-gradient-to-r from-white via-cyan-100 to-violet-200 bg-clip-text">
                    LapMatch
                  </span>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 border border-amber-400/40 text-amber-300 font-bold text-[10px] sm:text-[11px] tracking-wide">
                  <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>Pusat Servis &amp; Laptop Resmi</span>
                </div>
              </div>

              {/* Tagline / Value Proposition */}
              <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-300">
                <span className="text-zinc-600 dark:text-zinc-500">|</span>
                <span className="inline-flex items-center gap-1 text-zinc-300">
                  <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Servis Kilat &amp; Ganti Sparepart</span>
                </span>
                <span className="text-zinc-600 dark:text-zinc-500">•</span>
                <span className="inline-flex items-center gap-1 text-zinc-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Garansi Resmi QC 30+ Titik</span>
                </span>
              </div>
            </div>

            {/* Right Block: Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-end md:self-auto">
              <a
                href="https://wa.me/6287851164239?text=Halo%20LapMatch,%20saya%20ingin%20konsultasi%20mengenai%20rekomendasi%20laptop%20atau%20servis."
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 shadow-[0_2px_15px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.5)] active:scale-95 transition-all whitespace-nowrap border border-emerald-400/30"
              >
                <PhoneCall className="w-3.5 h-3.5 text-white shrink-0 group-hover:rotate-12 transition-transform" />
                <span>Konsultasi WA</span>
                <span className="hidden sm:inline font-mono font-normal opacity-90 text-[11px]">(087851164239)</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Tutup pengumuman"
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition active:scale-90 cursor-pointer border border-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes beamSlide {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </aside>
  );
}
