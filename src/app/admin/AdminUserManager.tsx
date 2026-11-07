// src/app/admin/AdminUserManager.tsx - Manajemen Pengguna Terdaftar
'use client';

import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Shield,
  GraduationCap,
  Trash2,
  Edit3,
  Calendar,
  CheckCircle2,
  X,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { formatTanggal } from '@/lib/date-utils';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  totalConsultations: number;
}

export default function AdminUserManager() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Edit Role Modal
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState('');
  const [savingRole, setSavingRole] = useState(false);

  // Delete User Modal
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Gagal memuat pengguna');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      toast.error('Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' ? true : u.role.toLowerCase() === roleFilter.toLowerCase();
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    setSavingRole(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah role');

      toast.success(`Role pengguna ${selectedUser.name} berhasil diperbarui.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
      );
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan.');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus pengguna');

      toast.success(`Akun ${deleteTarget.name} berhasil dihapus.`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus akun pengguna.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-violet-400" />
            <span className="font-mono text-xs text-violet-300 font-bold uppercase tracking-wider">
              Manajemen Pengguna Terdaftar
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Kelola Akun &amp; Hak Akses Pengguna</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Melihat seluruh akun mahasiswa, tanggal registrasi, serta mengatur role dan status akun.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-950/80 border border-white/10">
          <span className="text-xs text-zinc-400">Total Akun:</span>
          <span className="text-sm font-black text-white font-mono">{users.length}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e0e15]/90 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email pengguna..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950/90 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-zinc-950/90 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="all">Semua Role</option>
            <option value="mahasiswa">Mahasiswa</option>
            <option value="admin">Administrator</option>
            <option value="pelajar">Pelajar</option>
            <option value="pekerja">Pekerja</option>
            <option value="dosen">Dosen</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-[#0e0e15]/90 border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-zinc-400 font-mono uppercase text-[11px]">
                <th className="py-3.5 px-6">Nama &amp; Email Pengguna</th>
                <th className="py-3.5 px-6">Role / Status</th>
                <th className="py-3.5 px-6">Konsultasi Kuesioner</th>
                <th className="py-3.5 px-6">Terdaftar Sejak</th>
                <th className="py-3.5 px-6 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    <span className="inline-block w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mr-2" />
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    Tidak ada pengguna yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role.toLowerCase() === 'admin';
                  const isSuper = u.email.toLowerCase() === 'chairulanwarr003@gmail.com';

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
                            {u.name ? u.name.substring(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              <span>{u.name}</span>
                              {isSuper && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  SUPERADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-zinc-400 font-mono text-[11px] truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold capitalize ${
                            isAdmin
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAdmin ? 'bg-amber-400' : 'bg-cyan-400'
                            }`}
                          />
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-300">
                        <span className="font-bold text-white">{u.totalConsultations}</span> sesi tersimpan
                      </td>
                      <td className="py-4 px-6 text-zinc-400 font-mono text-[11px]">
                        {formatTanggal(u.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(u);
                              setNewRole(u.role);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800 transition cursor-pointer"
                            title="Ubah Role Akun"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {!isSuper && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(u)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                              title="Hapus Akun Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Role */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0e0e15] border border-white/15 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Atur Role &amp; Hak Akses</span>
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-zinc-400">Pengguna Terpilih:</p>
              <p className="text-sm font-bold text-white">{selectedUser.name}</p>
              <p className="text-xs font-mono text-zinc-500">{selectedUser.email}</p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-zinc-300 block">Pilih Role Baru:</label>
              <div className="grid grid-cols-2 gap-2">
                {['mahasiswa', 'pelajar', 'pekerja', 'dosen', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewRole(r)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border capitalize transition ${
                      newRole === r
                        ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                        : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-semibold hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingRole}
                onClick={handleUpdateRole}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {savingRole ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Akun */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0e0e15] border border-rose-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Konfirmasi Hapus Akun</h3>
                <p className="text-xs text-rose-300">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Anda akan menghapus akun <strong className="text-white">{deleteTarget.name}</strong> ({deleteTarget.email}). Seluruh riwayat kuisioner dan preferensi yang terkait juga akan dihapus dari sistem.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-semibold hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
