'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Shield,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/ThemeProvider';

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  historyCount?: number;
}

export default function Navbar({ user: initialUser, historyCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  
  // Inisialisasi user dari initialUser jika ada, atau fallback aman
  const [currentUser, setCurrentUser] = useState(initialUser ?? null);
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  if (initialUser !== undefined && initialUser !== prevInitialUser) {
    setPrevInitialUser(initialUser);
    setCurrentUser(initialUser);
    if (initialUser) {
      try {
        localStorage.setItem('lapmatch_user_session', JSON.stringify(initialUser));
      } catch {}
      setIsAuthLoading(false);
    }
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // 1. Baca cache lokal terlebih dahulu secara instan (0 milidetik, tanpa flicker)
    try {
      const cached = localStorage.getItem('lapmatch_user_session');
      if (cached && !currentUser?.id) {
        const parsed = JSON.parse(cached);
        if (parsed?.id) {
          setCurrentUser(parsed);
          setIsAuthLoading(false);
        }
      }
    } catch {}

    // 2. Verifikasi di background secara transparan
    let isMounted = true;
    fetch('/api/auth/profile')
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status === 401) {
          try { localStorage.removeItem('lapmatch_user_session'); } catch {}
          if (isMounted) setCurrentUser(null);
        }
        return null;
      })
      .then((data) => {
        if (isMounted && data && data.id) {
          const updatedUser = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
          };
          setCurrentUser(updatedUser);
          try {
            localStorage.setItem('lapmatch_user_session', JSON.stringify(updatedUser));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsAuthLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('lapmatch_user_session');
      const supabase = createClient();
      await supabase.auth.signOut();
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {
      // Abaikan error jaringan saat logout
    } finally {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
      window.location.href = '/';
    }
  };

  const navLinks = [
    { href: '/', label: 'Katalog & Beranda', active: pathname === '/' },
    { href: '/questionnaire', label: 'Kuesioner', active: pathname === '/questionnaire' },
    {
      href: '/history',
      label: 'Riwayat',
      active: pathname.startsWith('/history') || pathname.startsWith('/recommendation'),
      badge: historyCount > 0 ? historyCount : null,
    },
    { href: '/service-laptop', label: 'Servis Laptop', active: pathname === '/service-laptop' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0a0f1d]/90 backdrop-blur-md transition-all shadow-sm">
      {/* Top Border Accent Line: Navy & Blue */}
      <div className="w-full h-[2.5px] bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-sm group-hover:shadow-md transition duration-200 overflow-hidden shrink-0">
              <div className="w-full h-full bg-white dark:bg-[#0f172a] rounded-[10px] overflow-hidden flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.svg"
                  alt="Lapmatch Logo"
                  className="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  Lapmatch
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  AI Match
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">
                Smart Laptop Matching &amp; Recommendation
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  link.active
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{link.label}</span>
                {link.badge !== null && link.badge !== undefined && (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      link.active
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            {currentUser && currentUser.role === 'admin' && currentUser.email?.toLowerCase() === 'chairulanwarr003@gmail.com' && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  pathname.startsWith('/admin')
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 font-semibold'
                    : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          {currentUser ? (
            <>
              {/* Profile Shortcut */}
              <Link
                href="/profile"
                className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800 hover:opacity-90 transition group"
                title="Buka Profil Akun"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-[1px] shadow-sm shrink-0">
                  <div className="w-full h-full rounded-[11px] bg-slate-900 flex items-center justify-center text-xs font-mono font-bold text-blue-200">
                    {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px] group-hover:text-blue-600 transition">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1 font-medium">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        currentUser.role === 'admin' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                    />
                    {currentUser.role}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 transition cursor-pointer min-h-[38px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </>
          ) : isAuthLoading ? (
            <div className="w-14 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition whitespace-nowrap min-h-[38px] flex items-center justify-center"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm transition whitespace-nowrap min-h-[38px]"
              >
                <span>Daftar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-[#0a0f1d]/98 backdrop-blur-2xl px-4 py-4 space-y-3 overflow-hidden shadow-xl"
          >
            {/* Header User / Guest Card */}
            {currentUser ? (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 active:scale-[0.99] transition"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-900/40 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-700 dark:text-blue-300">
                  {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
                  {currentUser.role}
                </span>
              </Link>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Mode Pengunjung (Guest)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Masuk atau buat akun gratis untuk memulai kuesioner dan menyimpan riwayat rekomendasi.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-center text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xs transition"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-center text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
                  >
                    Daftar Akun
                  </Link>
                </div>
              </div>
            )}

            {/* Links List */}
            <div className="space-y-1 text-xs">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                    link.active
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge !== null && link.badge !== undefined && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}

              {currentUser && (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-3 rounded-xl transition ${
                    pathname === '/profile'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Profil Saya
                </Link>
              )}

              {currentUser && currentUser.role === 'admin' && currentUser.email?.toLowerCase() === 'chairulanwarr003@gmail.com' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-3 rounded-xl text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800"
                >
                  Admin Control Panel
                </Link>
              )}
            </div>

            {/* Theme Switcher in Mobile Menu */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-1">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Tema Tampilan</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mode Terang</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mode Gelap</span>
                  </>
                )}
              </button>
            </div>

            {/* Logout Button */}
            {currentUser && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition cursor-pointer min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
