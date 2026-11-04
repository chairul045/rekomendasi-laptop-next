// components/Footer.tsx - Footer Lapmatch
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, MessageSquare, Mail, X } from 'lucide-react';

export default function Footer() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#09090d]/80 backdrop-blur-xl py-6 text-xs text-zinc-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Branding & Deskripsi */}
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-white/10 p-0.5 flex items-center justify-center">
                  <img
                    src="/logo.svg"
                    alt="Lapmatch Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-semibold text-zinc-200">
                  Lapmatch &bull; Smart Laptop Matching
                </span>
              </div>
              <span className="hidden sm:inline text-zinc-600">|</span>
              <span className="text-zinc-400">
                Sistem Pendukung Keputusan Pemilihan Laptop Mahasiswa Berbasis Multi-Kriteria
              </span>
            </div>

            {/* Tombol Hubungi Kami */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 hover:border-white/25 transition shadow-sm min-h-[44px] cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pusat Bantuan & Kontak</span>
              </button>
            </div>
          </div>

          {/* Navigasi Footer Legal & Hak Cipta */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.05] text-[11px] text-zinc-400">
            <p>
              &copy; {new Date().getFullYear()} Lapmatch. Dikembangkan untuk mahasiswa Indonesia.
            </p>

            <nav className="flex items-center gap-4 flex-wrap" aria-label="Footer Navigasi">
              <Link
                href="/service-laptop"
                className="hover:text-white transition py-2 px-1 min-h-[44px] inline-flex items-center text-emerald-400/90 hover:text-emerald-300"
              >
                Toko Servis Laptop
              </Link>
              <span className="text-zinc-600">&bull;</span>
              <Link
                href="/tentang-metode"
                className="hover:text-white transition py-2 px-1 min-h-[44px] inline-flex items-center text-cyan-400/90 hover:text-cyan-300"
              >
                Tentang Metode (ROC & TOPSIS)
              </Link>
              <span className="text-zinc-600">&bull;</span>
              <Link
                href="/tentang"
                className="hover:text-white transition py-2 px-1 min-h-[44px] inline-flex items-center"
              >
                Tentang
              </Link>
              <span className="text-zinc-600">&bull;</span>
              <Link
                href="/kebijakan-privasi"
                className="hover:text-white transition py-2 px-1 min-h-[44px] inline-flex items-center"
              >
                Kebijakan Privasi
              </Link>
              <span className="text-zinc-600">&bull;</span>
              <Link
                href="/syarat-penggunaan"
                className="hover:text-white transition py-2 px-1 min-h-[44px] inline-flex items-center"
              >
                Syarat Penggunaan
              </Link>
            </nav>
          </div>
        </div>
      </footer>

      {/* Modal Dialog Kontak Resmi */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#0e0e15] border border-white/10 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Hubungi Tim Lapmatch</span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 mb-5 leading-relaxed">
              Memiliki pertanyaan mengenai rekomendasi laptop atau masukan untuk Lapmatch? Kami siap membantu melalui kontak resmi berikut:
            </p>

            <div className="space-y-3">
              <a
                href="https://wa.me/6287851164239?text=Halo%20Tim%20Lapmatch,%20saya%20ingin%20bertanya%20mengenai%20layanan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-600 text-emerald-200 text-xs font-semibold transition min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Konsultasi Cepat via WhatsApp</span>
                </div>
                <span className="text-emerald-400 font-mono text-[11px]">Chat Tim Kami →</span>
              </a>

              <a
                href="mailto:support@lapmatch.com?subject=Pertanyaan%20Layanan%20Lapmatch"
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs font-semibold transition min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>Email Dukungan Resmi</span>
                </div>
                <span className="text-cyan-400 font-mono text-[11px]">support@lapmatch.com →</span>
              </a>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 text-right">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 min-h-[44px] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
