'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Laptop,
  LogOut,
  Shield,
  User as UserIcon,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthPrompt } from '@/components/auth/AuthPromptModal';

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
  const { openAuthPrompt } = useAuthPrompt();
  const [currentUser, setCurrentUser] = useState(initialUser ?? null);
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser);

  if (initialUser !== undefined && initialUser !== prevInitialUser) {
    setPrevInitialUser(initialUser);
    setCurrentUser(initialUser);
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (initialUser !== undefined) {
      return;
    }

    // Auto-fetch profile jika tidak dipassing dari parent server component
    let isMounted = true;
    fetch('/api/auth/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && data.id) {
          setCurrentUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
          });
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [initialUser]);

  const handleSignOut = async () => {
    try {
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
    { href: '/', label: 'Katalog & Beranda', active: pathname === '/', guestAccessible: true },
    { href: '/questionnaire', label: 'Kuisioner', active: pathname === '/questionnaire', guestAccessible: true },
    {
      href: '/history',
      label: 'Riwayat',
      active: pathname.startsWith('/history') || pathname.startsWith('/recommendation'),
      badge: historyCount > 0 ? historyCount : null,
      guestAccessible: false,
    },
    { href: '/service-laptop', label: 'Servis Laptop', active: pathname === '/service-laptop', guestAccessible: true },
    { href: '/tentang-metode', label: 'Metode SPK', active: pathname === '/tentang-metode', guestAccessible: true },
  ];

  const handleRestrictedNavClick = (e: React.MouseEvent, link: typeof navLinks[0]) => {
    if (!currentUser && !link.guestAccessible) {
      e.preventDefault();
      setMobileMenuOpen(false);
      openAuthPrompt({
        title: 'Masuk Diperlukan',
        message: 'Silakan login terlebih dahulu untuk menggunakan fitur ini.',
        featureName: `Mengakses ${link.label}`,
        returnUrl: link.href,
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-violet-500/35 sm:border-white/20 bg-[#09090d]/90 backdrop-blur-2xl transition-all shadow-lg">
      {/* Garis Border Paling Atas - Lebih Terang, Bergradien & Mudah Dilihat */}
      <div className="w-full h-[3px] bg-gradient-to-r from-violet-500 via-cyan-400 to-indigo-500 shadow-[0_1px_16px_rgba(6,182,212,0.85)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_20px_rgba(124,58,237,0.35)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition duration-300 overflow-hidden shrink-0">
              <div className="w-full h-full bg-[#09090d] rounded-[9px] overflow-hidden flex items-center justify-center">
                <img
                  src="/logo.svg"
                  alt="Lapmatch Logo"
                  className="w-full h-full object-contain p-1 group-hover:scale-110 transition duration-300"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-violet-200 group-hover:to-cyan-300 transition">
                  Lapmatch
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI Match
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 hidden sm:inline">
                Smart Laptop Matcher & Recommender
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Bisa dilihat siapa saja, Shopee style) */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleRestrictedNavClick(e, link)}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  link.active
                    ? 'text-white bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]'
                }`}
              >
                <span>{link.label}</span>
                {link.badge !== null && link.badge !== undefined && (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      link.active
                        ? 'bg-cyan-400 text-zinc-950 font-bold'
                        : 'bg-zinc-800 text-cyan-300 border border-cyan-500/30'
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
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname.startsWith('/admin')
                    ? 'text-amber-300 bg-amber-950/40 border border-amber-500/50'
                    : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/20'
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
          {currentUser ? (
            <>
              {/* Profile Shortcut */}
              <Link
                href="/profile"
                className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-white/10 hover:opacity-90 transition group"
                title="Buka Profil Akun"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-[1px] shadow-sm shrink-0">
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-mono font-bold text-violet-300">
                    {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-medium text-zinc-200 truncate max-w-[120px] group-hover:text-cyan-300 transition">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 code-font capitalize flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        currentUser.role === 'admin' ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                    />
                    {currentUser.role}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-300 hover:bg-rose-950/30 border border-white/10 hover:border-rose-800/50 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/[0.06] border border-white/10 transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-[0_0_15px_rgba(124,58,237,0.35)] hover:shadow-[0_0_25px_rgba(124,58,237,0.55)] transition active:scale-[0.98]"
              >
                <span>Daftar</span>
                <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button (Selalu tampil di mobile) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/10 transition cursor-pointer"
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
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-white/10 bg-[#09090d]/95 backdrop-blur-2xl px-4 py-4 space-y-3 overflow-hidden shadow-2xl"
          >
            {/* Header User / Guest Card */}
            {currentUser ? (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/80 border border-white/10 active:scale-[0.98] transition"
              >
                <div className="w-9 h-9 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center font-bold text-xs text-violet-300">
                  {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{currentUser.email}</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase">
                  {currentUser.role}
                </span>
              </Link>
            ) : (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-zinc-900 to-cyan-950/40 border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Mode Pengunjung (Guest)</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Masuk atau buat akun gratis untuk memulai kuesioner dan menyimpan favorit.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md transition"
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
                  onClick={(e) => {
                    if (!currentUser && !link.guestAccessible) {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      openAuthPrompt({
                        title: 'Masuk Diperlukan',
                        message: 'Silakan login terlebih dahulu untuk menggunakan fitur ini.',
                        featureName: `Mengakses ${link.label}`,
                        returnUrl: link.href,
                      });
                    } else {
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                    link.active
                      ? 'bg-violet-600/20 text-white font-bold border border-violet-500/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge !== null && link.badge !== undefined && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-zinc-950 font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}

              {currentUser && (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl transition ${
                    pathname === '/profile'
                      ? 'bg-violet-600/20 text-white font-bold border border-violet-500/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Profil Saya
                </Link>
              )}

              {currentUser && currentUser.role === 'admin' && currentUser.email?.toLowerCase() === 'chairulanwarr003@gmail.com' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-amber-300 font-bold bg-amber-950/30 border border-amber-500/30"
                >
                  Admin Control Panel
                </Link>
              )}
            </div>

            {/* Logout Button */}
            {currentUser && (
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/30 border border-rose-800/40 hover:bg-rose-900/40 transition cursor-pointer"
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
