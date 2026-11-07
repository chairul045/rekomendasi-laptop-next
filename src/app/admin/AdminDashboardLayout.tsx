// src/app/admin/AdminDashboardLayout.tsx - Master Admin Dashboard Layout with Sidebar
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Laptop,
  Users,
  ClipboardList,
  Star,
  Flame,
  FileSpreadsheet,
  Settings,
  ExternalLink,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Database,
  BarChart3,
} from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminLaptopManager from './AdminLaptopManager';
import AdminUserManager from './AdminUserManager';
import AdminQuestionnaireManager from './AdminQuestionnaireManager';
import AdminReviewManager from './AdminReviewManager';
import AdminBannerManager from './AdminBannerManager';
import AdminReportsManager from './AdminReportsManager';
import AdminSettingsManager from './AdminSettingsManager';

interface AdminDashboardLayoutProps {
  initialLaptops: any[];
  stats: {
    totalUsers: number;
    totalConsultations: number;
    totalLaptops: number;
  };
  adminName: string;
}

export default function AdminDashboardLayout({
  initialLaptops,
  stats,
  adminName,
}: AdminDashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Baca URL query param ?tab=xxx saat load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const navMenuItems = [
    { id: 'overview', label: 'Dashboard Utama', icon: LayoutDashboard, badge: null },
    { id: 'laptops', label: 'Manajemen Laptop', icon: Laptop, badge: `${initialLaptops.length}` },
    { id: 'users', label: 'Manajemen Pengguna', icon: Users, badge: `${stats.totalUsers}` },
    { id: 'questionnaire', label: 'Kuesioner & Kriteria', icon: ClipboardList, badge: `${stats.totalConsultations}` },
    { id: 'reviews', label: 'Ulasan & Rating', icon: Star, badge: 'Baru' },
    { id: 'banners', label: 'Iklan & Konten Banner', icon: Flame, badge: null },
    { id: 'reports', label: 'Laporan & Ekspor Data', icon: FileSpreadsheet, badge: 'XLSX' },
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings, badge: null },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileSidebarOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.pushState({}, '', url.toString());
    }
  };

  const currentMenu = navMenuItems.find((m) => m.id === activeTab) || navMenuItems[0];

  return (
    <div className="min-h-screen flex bg-[#07070a] text-zinc-100 selection:bg-violet-500 selection:text-white">
      {/* ── SIDEBAR DESKTOP ───────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-white/10 bg-[#09090d]/95 backdrop-blur-2xl shrink-0 h-screen sticky top-0 z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-violet-600/30 group-hover:scale-105 transition duration-300">
              <div className="w-full h-full bg-[#09090d] rounded-[9px] flex items-center justify-center p-1">
                <img src="/logo.svg" alt="Lapmatch" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-cyan-300 transition">
                  Lapmatch
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ADMIN
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Control Management Suite</span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold">
            Menu Utama
          </div>
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25 border border-violet-400/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-800 text-cyan-300 border border-white/5'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Profile Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-950/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-[1px] shrink-0">
                <div className="w-full h-full rounded-xl bg-zinc-900 flex items-center justify-center text-xs font-bold font-mono text-amber-300">
                  {adminName ? adminName.substring(0, 2).toUpperCase() : 'AD'}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{adminName}</div>
                <div className="text-[10px] text-amber-300/80 font-mono">Super Admin</div>
              </div>
            </div>

            <Link
              href="/"
              target="_blank"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-cyan-300 transition"
              title="Buka Website Pengguna"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT WRAPPER ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 border-b border-white/10 bg-[#09090d]/90 backdrop-blur-2xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-white/10 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Title */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500">Admin</span>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-white font-bold">{currentMenu.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistem Online</span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Website</span>
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'overview' && (
            <AdminOverview adminName={adminName} onNavigate={handleSelectTab} />
          )}

          {activeTab === 'laptops' && (
            <div className="space-y-6">
              <AdminLaptopManager
                initialLaptops={initialLaptops}
                stats={stats}
                adminName={adminName}
              />
            </div>
          )}

          {activeTab === 'users' && <AdminUserManager />}

          {activeTab === 'questionnaire' && <AdminQuestionnaireManager />}

          {activeTab === 'reviews' && <AdminReviewManager />}

          {activeTab === 'banners' && <AdminBannerManager />}

          {activeTab === 'reports' && <AdminReportsManager />}

          {activeTab === 'settings' && <AdminSettingsManager adminName={adminName} />}
        </main>
      </div>

      {/* ── MOBILE DRAWER SIDEBAR ────────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-[#09090d] border-r border-white/10 h-full flex flex-col p-4 z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Suite Lapmatch</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-zinc-800 text-cyan-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-white/10">
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-zinc-300 text-xs font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Kunjungi Website Utama</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
