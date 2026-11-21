// src/app/admin/AdminDashboardLayout.tsx - Minimalist Admin Dashboard Layout with Sidebar & Responsive Controls
'use client';

import { useState } from 'react';
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
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminLaptopManager, { LaptopItem } from './AdminLaptopManager';
import AdminUserManager from './AdminUserManager';
import AdminQuestionnaireManager from './AdminQuestionnaireManager';
import AdminReviewManager from './AdminReviewManager';
import AdminBannerManager from './AdminBannerManager';
import AdminReportsManager from './AdminReportsManager';
import AdminSettingsManager from './AdminSettingsManager';
import { useTheme } from '@/components/ThemeProvider';

interface AdminDashboardLayoutProps {
  initialLaptops: LaptopItem[];
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
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        return tabParam === 'banner' || tabParam === 'banners' ? 'banners' : tabParam;
      }
    }
    return 'overview';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0a0f1d] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* ── SIDEBAR DESKTOP & TABLET LANDSCAPE: MINIMALIS DENGAN IKON ────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1527] shrink-0 h-screen sticky top-0 z-30 transition-colors">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-sm group-hover:shadow-md transition duration-200 shrink-0">
              <div className="w-full h-full bg-white dark:bg-[#0f172a] rounded-[10px] flex items-center justify-center p-1">
                <img src="/logo.svg" alt="Lapmatch" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  Lapmatch
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  ADMIN
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Control Management Suite</span>
            </div>
          </Link>
        </div>

        {/* Minimalist Navigation Menu */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] uppercase text-slate-400 dark:text-slate-500 tracking-wider font-bold">
            Menu Utama
          </div>
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'banners' && activeTab === 'banner');

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
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
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-[1px] shrink-0">
                <div className="w-full h-full rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-bold font-mono text-blue-700 dark:text-blue-300">
                  {adminName ? adminName.substring(0, 2).toUpperCase() : 'AD'}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{adminName}</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-medium">Super Admin</div>
              </div>
            </div>

            <Link
              href="/"
              target="_blank"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition"
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
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0a0f1d]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile & Tablet Toggle */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Title */}
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-slate-500">Admin</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-900 dark:text-white font-bold">{currentMenu.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Online</span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition min-h-[38px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Website</span>
            </Link>
          </div>
        </header>

        {/* Main Body with Clean Spacing */}
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

          {(activeTab === 'banners' || activeTab === 'banner') && <AdminBannerManager />}

          {activeTab === 'reports' && <AdminReportsManager />}

          {activeTab === 'settings' && <AdminSettingsManager adminName={adminName} />}
        </main>
      </div>

      {/* ── MOBILE & TABLET DRAWER SIDEBAR: MINIMALIS DENGAN IKON ───────────────── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0d1527] border-r border-slate-200 dark:border-slate-800 h-full flex flex-col p-4 z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Admin Suite Lapmatch</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (item.id === 'banners' && activeTab === 'banner');

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[44px] ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition min-h-[44px]"
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
