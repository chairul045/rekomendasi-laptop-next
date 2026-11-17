'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, X, Zap, PhoneCall } from 'lucide-react';

const SESSION_KEY = 'laptopseber_banner_v3_dismissed';

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
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
  };

  if (!visible) return null;

  return (
    <div className="relative z-50 w-full px-2 sm:px-4 pt-1.5 sm:pt-2 pb-1 bg-white dark:bg-[#09090d] transition-colors">
      {/* ── Kotak Iklan dengan BORDER DI SELURUH ISI DI DALAMNYA ── */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 sm:border-[3px] border-amber-400 dark:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
        style={{
          background: 'linear-gradient(90deg, #d97706 0%, #ea580c 45%, #dc2626 100%)',
        }}
      >
        {/* Animated shimmer highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)',
            backgroundSize: '200% 100%',
            animation: 'bannerShimmer 3.5s ease-in-out infinite',
          }}
        />

        {/* Inner Content dengan border keliling aksen */}
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-5 py-2 sm:py-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">

            {/* Left Block: Info Toko LaptopSeber */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {/* Badge Nama Toko */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/30 border border-white/30 backdrop-blur-sm">
                  {/* Laptop Icon SVG */}
                  <svg className="w-4 h-4 text-amber-200 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
                  </svg>
                  <span className="font-black text-white text-xs sm:text-sm tracking-wide">
                    LaptopSeber Palembang
                  </span>
                </div>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-300 text-amber-950 font-black text-[10px] tracking-wider uppercase shadow-sm">
                  <Zap className="w-3 h-3 fill-amber-950" />
                  <span>Toko Resmi</span>
                </div>
              </div>

              {/* Lokasi, Jam Buka, No Telepon */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white text-[11px] sm:text-xs font-semibold">
                <span className="inline-flex items-center gap-1 text-amber-100">
                  <MapPin className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                  <span>DC Kuliner Pakjo, Kota Palembang, Sumatera Selatan</span>
                </span>
                <span className="inline-flex items-center gap-1 text-amber-100">
                  <Clock className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                  <span>Setiap Hari: 10.00 – 20.00 WIB</span>
                </span>
                <a
                  href="https://wa.me/6281368583338"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-white font-mono hover:underline"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                  <span>081368583338</span>
                </a>
              </div>
            </div>

            {/* Right Block: Tombol WhatsApp & Dismiss */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <a
                href="https://wa.me/6281368583338"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs text-orange-700 bg-white hover:bg-amber-50 active:scale-95 transition shadow-md whitespace-nowrap border border-amber-200"
              >
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Hubungi WA</span>
              </a>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Tutup iklan"
                className="p-1 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition active:scale-95 cursor-pointer border border-white/20"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bannerShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
