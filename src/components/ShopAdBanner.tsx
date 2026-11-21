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
      className="relative z-50 w-full px-2 sm:px-4 pt-2 pb-1"
    >
      {/* ── Banner: Navy, Blue, Indigo with 16px Rounded Corners ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white shadow-sm">
        <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-5 py-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4">
            {/* Left Block */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span className="font-bold text-white text-xs sm:text-sm tracking-wide">
                    LapMatch
                  </span>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-100 font-bold text-[10px] sm:text-[11px] tracking-wide">
                  <Sparkles className="w-3 h-3 text-amber-200 shrink-0" />
                  <span>Pusat Servis &amp; Laptop Resmi</span>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-2 text-xs text-white/80">
                <span className="text-white/30">|</span>
                <span className="inline-flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                  <span>Servis Kilat &amp; Ganti Sparepart</span>
                </span>
                <span className="text-white/30">•</span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
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
                className="group relative inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl font-bold text-xs text-blue-700 bg-white hover:bg-blue-50 shadow-xs active:scale-98 transition-all whitespace-nowrap min-h-[38px]"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-600 shrink-0 group-hover:rotate-12 transition-transform" />
                <span>Konsultasi WA</span>
                <span className="hidden sm:inline font-mono font-normal opacity-70 text-[11px]">(087851164239)</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Tutup pengumuman"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition active:scale-95 cursor-pointer border border-white/20 min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
