'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Laptop, LogOut, Shield, ChevronRight } from 'lucide-react';

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  historyCount?: number;
}

export default function Navbar({ user, historyCount = 0 }: NavbarProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  };

  const navLinks = [
    { href: '/', label: 'Dashboard', active: pathname === '/' },
    { href: '/questionnaire', label: 'Kuisioner', active: pathname === '/questionnaire' },
    {
      href: '/history',
      label: 'Riwayat Kuisioner',
      active: pathname.startsWith('/history') || pathname.startsWith('/recommendation'),
      badge: historyCount > 0 ? historyCount : null,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#09090d]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_20px_rgba(124,58,237,0.35)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition duration-300">
              <div className="w-full h-full bg-[#09090d] rounded-[10px] flex items-center justify-center text-white">
                <Laptop className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-violet-200 group-hover:to-cyan-300 transition">
                  LaptopSPK
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  TOPSIS
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 hidden sm:inline">
                Smart Decision & AI System
              </span>
            </div>
          </Link>

          {/* Links when logged in */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    link.active
                      ? 'text-white bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
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

              {user.role === 'admin' && (
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
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-white/10 hover:opacity-90 transition group"
                title="Buka Profil"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-[1px] shadow-sm">
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-mono font-bold text-violet-300">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-medium text-zinc-200 truncate max-w-[120px] group-hover:text-cyan-300 transition">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 code-font capitalize flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.role === 'admin' ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                    />
                    {user.role}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-300 hover:bg-rose-950/30 border border-white/10 hover:border-rose-800/50 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-medium text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition active:scale-[0.98]"
              >
                <span>Daftar Akun</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
