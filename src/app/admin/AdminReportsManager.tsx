// src/app/admin/AdminReportsManager.tsx - Laporan Analitik & Ekspor Data Excel/CSV
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet,
  Download,
  TrendingUp,
  BarChart3,
  Award,
  Layers,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminReportsManager() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExportExcel = async (format: 'xlsx' | 'csv') => {
    setExporting(true);
    try {
      // Fetch data lengkap laptop dan riwayat kuesioner
      const [resLaptops, resUsers, resQuest] = await Promise.all([
        fetch('/api/admin/laptops').then((r) => r.json()),
        fetch('/api/admin/users').then((r) => r.json()),
        fetch('/api/admin/questionnaire').then((r) => r.json()),
      ]);

      const wb = XLSX.utils.book_new();

      // Sheet 1: Data Laptop
      if (resLaptops.laptops && Array.isArray(resLaptops.laptops)) {
        const laptopRows = resLaptops.laptops.map((l: any) => ({
          'ID': l.id,
          'Nama Laptop': l.name,
          'Merek': l.brand,
          'Harga (IDR)': Number(l.price),
          'Kondisi': l.condition,
          'Kategori': l.category || '-',
          'RAM (GB)': l.ramGb || '-',
          'SSD (GB)': l.storageGb || '-',
          'Layar (Inci)': l.displaySize || '-',
          'Baterai (Jam)': l.batteryHours || '-',
          'Bobot (kg)': l.weightKg || '-',
          'Skor Performa': l.performaKomposit || '-',
        }));
        const wsLaptops = XLSX.utils.json_to_sheet(laptopRows);
        XLSX.utils.book_append_sheet(wb, wsLaptops, 'Katalog Laptop');
      }

      // Sheet 2: Data Pengguna
      if (resUsers.users && Array.isArray(resUsers.users)) {
        const userRows = resUsers.users.map((u: any) => ({
          'User ID': u.id,
          'Nama': u.name,
          'Email': u.email,
          'Role': u.role,
          'Total Sesi Kuisioner': u.totalConsultations,
          'Tanggal Bergabung': u.createdAt,
        }));
        const wsUsers = XLSX.utils.json_to_sheet(userRows);
        XLSX.utils.book_append_sheet(wb, wsUsers, 'Pengguna Terdaftar');
      }

      // Sheet 3: Riwayat Konsultasi
      if (resQuest.consultations && Array.isArray(resQuest.consultations)) {
        const questRows = resQuest.consultations.map((q: any) => ({
          'ID Sesi': q.id,
          'Nama Pengisi': q.userName,
          'Email': q.userEmail,
          'Kebutuhan': q.peruntukan,
          'Budget Min': Number(q.budgetMin),
          'Budget Max': Number(q.budgetMax),
          'Laptop Juara #1': q.topLaptop ? `${q.topLaptop.brand} ${q.topLaptop.name}` : '-',
          'Skor Kecocokan': q.topLaptop ? `${(q.topLaptop.nilaiV * 100).toFixed(1)}%` : '-',
          'Tanggal Pengisian': q.createdAt,
        }));
        const wsQuest = XLSX.utils.json_to_sheet(questRows);
        XLSX.utils.book_append_sheet(wb, wsQuest, 'Riwayat Kuesioner');
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Laporan_Lapmatch_${timestamp}.${format}`;

      if (format === 'csv') {
        XLSX.writeFile(wb, filename, { bookType: 'csv' });
      } else {
        XLSX.writeFile(wb, filename, { bookType: 'xlsx' });
      }

      toast.success(`Laporan ${format.toUpperCase()} berhasil diunduh! 🎉`);
    } catch (err: any) {
      toast.error('Gagal membuat laporan: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs text-emerald-300 font-bold uppercase tracking-wider">
              Laporan &amp; Ekspor Data Sistem
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Ekspor Data &amp; Ringkasan Analitik</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Unduh seluruh database katalog laptop, akun pengguna, dan riwayat kuesioner ke Excel (.xlsx) atau CSV.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExportExcel('xlsx')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/25 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Memproses...' : 'Ekspor ke Excel (.xlsx)'}</span>
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExportExcel('csv')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Data yang Akan Diekspor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 space-y-2">
          <span className="text-xs font-mono text-zinc-400 uppercase">Sheet 1</span>
          <h3 className="text-base font-bold text-white">Katalog Laptop Alternatif</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Mencakup ID, merek, spesifikasi teknis prosesor, RAM, SSD, skor performa, baterai, berat, dan harga pasar.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 space-y-2">
          <span className="text-xs font-mono text-zinc-400 uppercase">Sheet 2</span>
          <h3 className="text-base font-bold text-white">Akun Pengguna Terdaftar</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Mencakup profil nama mahasiswa/user, alamat email, role akun, tanggal bergabung, dan frekuensi konsultasi.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0e0e15]/90 border border-white/10 space-y-2">
          <span className="text-xs font-mono text-zinc-400 uppercase">Sheet 3</span>
          <h3 className="text-base font-bold text-white">Riwayat Perhitungan TOPSIS</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Mencakup rentang anggaran mahasiswa, prioritas kriteria, laptop pemenang peringkat 1, dan nilai preferensi Vi.
          </p>
        </div>
      </div>

      {/* Informasi Kesesuaian Laporan */}
      <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/10 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Format Laporan Standar Akademik</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            File Excel yang diekspor diformat dengan header kolom yang rapi sehingga siap digunakan sebagai lampiran data penelitian, skripsi, tugas akhir, atau laporan berkala pengelola sistem rekomendasi laptop Lapmatch.
          </p>
        </div>
      </div>
    </div>
  );
}
