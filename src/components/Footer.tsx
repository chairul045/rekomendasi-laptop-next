// components/Footer.tsx - Footer Lapmatch
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, MessageSquare, Mail, X } from 'lucide-react';

export default function Footer() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f1d] py-8 text-xs text-slate-600 dark:text-slate-400 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Branding & Deskripsi */}
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 p-1 flex items-center justify-center">
                  <img
                    src="/logo.svg"
                    alt="Lapmatch Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-200">
                  Lapmatch &bull; Smart Laptop Matching
                </span>
              </div>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Sistem Pendukung Keputusan Pemilihan Laptop Mahasiswa Berbasis Multi-Kriteria
              </span>
            </div>

            {/* Tombol Hubungi Kami */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition shadow-xs min-h-[40px] cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Pusat Bantuan &amp; Kontak</span>
              </button>
            </div>
          </div>

          {/* Navigasi Footer Legal & Hak Cipta */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} Lapmatch. Dikembangkan untuk mahasiswa Indonesia.
            </p>

            <nav className="flex items-center gap-4 flex-wrap" aria-label="Footer Navigasi">
              <Link
                href="/service-laptop"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition py-1 text-emerald-600 dark:text-emerald-400 font-medium"
              >
                Toko Servis Laptop
              </Link>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <Link
                href="/tentang"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition py-1 font-medium"
              >
                Tentang
              </Link>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <Link
                href="/kebijakan-privasi"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition py-1 font-medium"
              >
                Kebijakan Privasi
              </Link>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <Link
                href="/syarat-penggunaan"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition py-1 font-medium"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-xl text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Hubungi Tim Lapmatch</span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              Memiliki pertanyaan mengenai rekomendasi laptop atau masukan untuk Lapmatch? Kami siap membantu melalui kontak resmi berikut:
            </p>

            <div className="space-y-3">
              <a
                href="https://wa.me/6287851164239?text=Halo%20Tim%20Lapmatch,%20saya%20ingin%20bertanya%20mengenai%20layanan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 text-emerald-800 dark:text-emerald-200 text-xs font-semibold transition min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Konsultasi Cepat via WhatsApp</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">Chat WhatsApp →</span>
              </a>

              <a
                href="mailto:support@lapmatch.com?subject=Pertanyaan%20Layanan%20Lapmatch"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-800 dark:text-slate-200 text-xs font-semibold transition min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Email Dukungan Resmi</span>
                </div>
                <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">support@lapmatch.com →</span>
              </a>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 min-h-[38px] cursor-pointer"
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
