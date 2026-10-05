'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Shield,
  ClipboardList,
  Edit3,
  Check,
  X,
  Clock,
  Trophy,
  LogOut,
  Calendar,
  Laptop,
  ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  stats: {
    totalKonsultasi: number;
    totalLaptopDirekomendasikan: number;
  };
  lastConsultation: {
    id: number;
    judul: string | null;
    peruntukan: string;
    createdAt: string;
    topLaptop: { name: string; brand: string } | null;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Gagal memuat profil');
      }
      const data = await res.json();
      setProfile(data);
      setNameInput(data.name);
    } catch {
      toast.error('Gagal memuat data profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim() === profile?.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Gagal memperbarui nama.');
        return;
      }
      const updated = await res.json();
      setProfile((prev) => (prev ? { ...prev, name: updated.name } : prev));
      setEditingName(false);
      toast.success('Nama berhasil diperbarui!');
    } catch {
      toast.error('Terjadi kesalahan.');
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setNameInput(profile?.name ?? '');
    setEditingName(false);
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-2">
            <p className="text-zinc-400">Profil tidak ditemukan.</p>
            <Link href="/" className="text-cyan-400 text-xs hover:underline">
              Kembali ke dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#09090d] text-zinc-100">
      <Navbar user={profile} historyCount={profile.stats.totalKonsultasi} />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Card */}
        <div className="rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Header Banner Accent */}
          <div className="h-28 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 relative">
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="-mt-14 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border-4 border-[#0e0e15] shadow-2xl flex items-center justify-center font-mono font-bold text-2xl text-cyan-300">
                {profile.name.substring(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Name + Edit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                      className="text-xl font-bold text-white bg-zinc-950/80 border-b-2 border-cyan-400 focus:outline-none px-2 py-0.5 rounded-lg"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/40"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white">{profile.name}</h1>
                    <button
                      onClick={() => setEditingName(true)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-cyan-300 transition"
                      title="Ubah nama"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                      profile.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        profile.role === 'admin' ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                    />
                    {profile.role.toUpperCase()}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">ID: {profile.id.substring(0, 8)}...</span>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/30 border border-rose-800/40 hover:bg-rose-900/40 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>

            {/* Email & Join Date */}
            <div className="mt-5 pt-4 border-t border-white/10 grid sm:grid-cols-2 gap-3 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span>Terdaftar sejak {joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="font-mono uppercase text-[11px]">Total Sesi Kuisioner</span>
              <ClipboardList className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {profile.stats.totalKonsultasi}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">Riwayat evaluasi TOPSIS</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="font-mono uppercase text-[11px]">Rekomendasi Teratas (#1)</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-300 font-mono">
              {profile.stats.totalLaptopDirekomendasikan}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">Laptop peringkat 1 yang didapat</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-3xl bg-[#0e0e15]/80 border border-white/10 backdrop-blur-md space-y-3">
          <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Aksi Cepat
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/questionnaire"
              className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 hover:border-violet-500/40 transition flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                  Mulai Kuisioner Baru
                </p>
                <p className="text-xs text-zinc-400">Dapatkan rekomendasi laptop baru</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
            </Link>

            <Link
              href="/history"
              className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 hover:border-violet-500/40 transition flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                  Riwayat Konsultasi
                </p>
                <p className="text-xs text-zinc-400">Lihat semua sesi perhitungan</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
