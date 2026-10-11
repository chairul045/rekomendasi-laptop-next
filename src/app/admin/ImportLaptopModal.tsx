'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  Check,
} from 'lucide-react';
import { formatRupiah } from '@/lib/laptop-utils';

interface LaptopItem {
  id: number;
  name: string;
  brand: string;
  price: string;
  performaKomposit: number | null;
  processorScore: number | null;
  vgaScore: number | null;
  ramGb: number | null;
  storageGb: number | null;
  displaySize: number | null;
  batteryHours: number | null;
  weightKg: number | null;
  mobilityScore: number | null;
  category: string | null;
  condition: string;
  imageUrl: string | null;
}

interface ParsedLaptop {
  name: string;
  brand: string;
  price: number | string;
  condition: string;
  category: string;
  performaKomposit: number | null;
  processorScore: number | null;
  vgaScore: number | null;
  ramGb: number | null;
  storageGb: number | null;
  displaySize: number | null;
  batteryHours: number | null;
  weightKg: number | null;
  mobilityScore: number | null;
  imageUrl: string;
  isValid: boolean;
  validationError?: string;
}

export default function ImportLaptopModal({
  isOpen,
  onClose,
  onImportSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (laptops: LaptopItem[]) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedLaptop[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Header normalizer untuk fleksibilitas nama kolom Bahasa Indonesia & Inggris
  const normalizeKey = (key: string): string => {
    const k = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (['nama', 'namalaptop', 'name', 'laptopname', 'laptop', 'model'].includes(k)) return 'name';
    if (['brand', 'merek', 'merk', 'produsen'].includes(k)) return 'brand';
    if (['harga', 'price', 'hargarp', 'biaya', 'nilairp'].includes(k)) return 'price';
    if (['kondisi', 'condition', 'status'].includes(k)) return 'condition';
    if (['kategori', 'category', 'peruntukan', 'segmen'].includes(k)) return 'category';
    if (['performa', 'skorperforma', 'performakomposit', 'performance'].includes(k)) return 'performaKomposit';
    if (['prosesor', 'processor', 'skorprosesor', 'processorscore', 'cpu'].includes(k)) return 'processorScore';
    if (['vga', 'gpu', 'skorvga', 'vgascore', 'grafis'].includes(k)) return 'vgaScore';
    if (['ram', 'ramgb', 'kapasitasram', 'memory'].includes(k)) return 'ramGb';
    if (['storage', 'ssd', 'storagegb', 'rom', 'penyimpanan'].includes(k)) return 'storageGb';
    if (['layar', 'display', 'ukuranlayar', 'displaysize', 'screen'].includes(k)) return 'displaySize';
    if (['baterai', 'battery', 'dayatahanbaterai', 'batteryhours'].includes(k)) return 'batteryHours';
    if (['berat', 'weight', 'weightkg', 'bobot'].includes(k)) return 'weightKg';
    if (['mobilitas', 'mobility', 'skormobilitas', 'mobilityscore'].includes(k)) return 'mobilityScore';
    if (['gambar', 'image', 'imageurl', 'foto', 'linkgambar', 'urlgambar'].includes(k)) return 'imageUrl';
    return key;
  };

  const handleFileProcess = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setParsedData([]);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        toast.error('File Excel/CSV tidak memiliki lembar kerja (sheet).');
        setIsProcessing(false);
        return;
      }

      const sheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

      if (rawRows.length === 0) {
        toast.error('File tidak memiliki baris data.');
        setIsProcessing(false);
        return;
      }

      const results: ParsedLaptop[] = rawRows.map((row) => {
        // Map raw row keys menggunakan normalizeKey
        const mapped: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(row)) {
          mapped[normalizeKey(k)] = v;
        }

        const name = String(mapped.name || '').trim();
        const brand = String(mapped.brand || '').trim();
        const rawPrice = String(mapped.price || '').replace(/[^0-9]/g, '');
        const priceNum = Number(rawPrice);

        const rawCond = String(mapped.condition || '').toLowerCase().trim();
        const condition = rawCond.includes('sec') || rawCond.includes('bekas') ? 'second' : 'baru';

        let isValid = true;
        let validationError = '';

        if (!name) {
          isValid = false;
          validationError = 'Nama laptop wajib diisi';
        } else if (!brand) {
          isValid = false;
          validationError = 'Brand wajib diisi';
        } else if (!priceNum || priceNum <= 0) {
          isValid = false;
          validationError = 'Harga wajib berupa angka valid';
        }

        const numVal = (v: unknown): number | null => {
          if (v === '' || v === null || v === undefined) return null;
          const n = Number(v);
          return isNaN(n) ? null : n;
        };

        return {
          name,
          brand,
          price: priceNum || mapped.price?.toString() || 0,
          condition,
          category: String(mapped.category || 'Kuliah').trim(),
          performaKomposit: numVal(mapped.performaKomposit),
          processorScore: numVal(mapped.processorScore),
          vgaScore: numVal(mapped.vgaScore),
          ramGb: numVal(mapped.ramGb),
          storageGb: numVal(mapped.storageGb),
          displaySize: numVal(mapped.displaySize),
          batteryHours: numVal(mapped.batteryHours),
          weightKg: numVal(mapped.weightKg),
          mobilityScore: numVal(mapped.mobilityScore),
          imageUrl: String(mapped.imageUrl || '').trim(),
          isValid,
          validationError,
        };
      });

      setParsedData(results);
      const validCount = results.filter((r) => r.isValid).length;
      toast.success(`${validCount} data laptop berhasil dibaca dari file!`);
    } catch (err) {
      console.error('File read error:', err);
      toast.error('Gagal membaca file Excel/CSV. Pastikan format file benar.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = (type: 'csv' | 'xlsx') => {
    const templateData = [
      {
        nama_laptop: 'ASUS VivoBook 15 OLED K3504VA',
        brand: 'ASUS',
        harga: 11999000,
        kondisi: 'baru',
        kategori: 'Kuliah',
        skor_performa: 72,
        skor_prosesor: 75,
        skor_vga: 45,
        ram_gb: 16,
        storage_gb: 512,
        ukuran_layar: 15.6,
        daya_tahan_baterai: 8.0,
        berat_kg: 1.7,
        skor_mobilitas: 72,
        image_url: '',
      },
      {
        nama_laptop: 'Lenovo ThinkPad X1 Carbon Gen 8',
        brand: 'Lenovo',
        harga: 8500000,
        kondisi: 'second',
        kategori: 'Bisnis',
        skor_performa: 68,
        skor_prosesor: 70,
        skor_vga: 40,
        ram_gb: 16,
        storage_gb: 512,
        ukuran_layar: 14.0,
        daya_tahan_baterai: 9.0,
        berat_kg: 1.09,
        skor_mobilitas: 95,
        image_url: '',
      },
      {
        nama_laptop: 'HP Victus 15-fa1108TX',
        brand: 'HP',
        harga: 15999000,
        kondisi: 'baru',
        kategori: 'Gaming',
        skor_performa: 87,
        skor_prosesor: 85,
        skor_vga: 89,
        ram_gb: 16,
        storage_gb: 512,
        ukuran_layar: 15.6,
        daya_tahan_baterai: 5.5,
        berat_kg: 2.29,
        skor_mobilitas: 50,
        image_url: '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Laptop');

    if (type === 'xlsx') {
      XLSX.writeFile(workbook, 'template_import_laptop.xlsx');
    } else {
      XLSX.writeFile(workbook, 'template_import_laptop.csv');
    }
    toast.success(`Template ${type.toUpperCase()} berhasil diunduh!`);
  };

  const handleSubmitImport = async () => {
    const validRows = parsedData.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error('Tidak ada baris data valid untuk diimpor.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/laptops/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ laptops: validRows }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Gagal mengimpor data.');
        return;
      }

      toast.success(`Berhasil menambahkan ${data.count} laptop baru ke database! 🎉`);
      if (data.laptops) {
        onImportSuccess(data.laptops);
      }
      onClose();
    } catch {
      toast.error('Terjadi kesalahan jaringan saat menyimpan import.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validItems = parsedData.filter((r) => r.isValid);
  const invalidItems = parsedData.filter((r) => !r.isValid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0e0e15] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Import Data Laptop via Excel / CSV
              </h2>
              <p className="text-xs text-zinc-400">
                Tambah banyak data laptop sekaligus dengan mengunggah file spreadsheet (.xlsx, .xls, .csv).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="overflow-y-auto space-y-5 flex-1 pr-1">
          {/* Download Template Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-zinc-950 border border-emerald-500/30 text-xs">
            <div>
              <span className="font-bold text-emerald-300 block mb-0.5">
                Belum punya format tabel yang sesuai?
              </span>
              <p className="text-zinc-400 text-[11px]">
                Unduh template resmi berikut yang sudah terisi kolom spesifikasi dan contoh data laptop:
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDownloadTemplate('xlsx')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-semibold text-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadTemplate('csv')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/40 font-semibold text-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition ${
              isDragging
                ? 'border-emerald-400 bg-emerald-950/20 scale-[1.01]'
                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-lg">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white mb-1">
              {file ? file.name : 'Tarik & letakkan file Excel / CSV di sini'}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Mendukung format <strong className="text-zinc-200">.XLSX</strong>,{' '}
              <strong className="text-zinc-200">.XLS</strong>, atau{' '}
              <strong className="text-zinc-200">.CSV</strong> (Maksimal 10 MB).
            </p>
          </div>

          {/* Status & Preview Table */}
          {isProcessing && (
            <div className="py-8 text-center text-zinc-400 text-xs">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Memproses dan memvalidasi file spreadsheet...</span>
            </div>
          )}

          {parsedData.length > 0 && (
            <div className="space-y-4 pt-2">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-400">Total Baris:</span>
                  </div>
                  <span className="font-bold font-mono text-white text-sm">{parsedData.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Baris Valid:</span>
                  </div>
                  <span className="font-bold font-mono text-emerald-400 text-sm">{validItems.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300">Bermasalah:</span>
                  </div>
                  <span className="font-bold font-mono text-amber-400 text-sm">{invalidItems.length}</span>
                </div>
              </div>

              {/* Preview Table (First 5 Rows) */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-zinc-950/60">
                <div className="p-3 bg-zinc-900/60 border-b border-white/5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">
                    Pratinjau Data (Menampilkan {Math.min(5, validItems.length)} dari {validItems.length} baris valid)
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">Format Siap Impor</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/40 text-[11px] text-zinc-400 font-mono border-b border-white/5">
                      <tr>
                        <th className="py-2.5 px-4">Nama Laptop</th>
                        <th className="py-2.5 px-3">Brand</th>
                        <th className="py-2.5 px-3">Harga</th>
                        <th className="py-2.5 px-3">Kondisi</th>
                        <th className="py-2.5 px-3">RAM / SSD</th>
                        <th className="py-2.5 px-3">Performa</th>
                        <th className="py-2.5 px-3">Kategori</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                      {validItems.slice(0, 5).map((l, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-4 font-bold text-white max-w-[200px] truncate">{l.name}</td>
                          <td className="py-2.5 px-3">{l.brand}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400 font-semibold">
                            {formatRupiah(l.price)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono capitalize font-bold ${
                                l.condition === 'second'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {l.condition}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px]">
                            {l.ramGb ?? '-'}GB / {l.storageGb ?? '-'}GB
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                            {l.performaKomposit ?? '-'}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-400">{l.category || 'Kuliah'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Warning for invalid rows */}
              {invalidItems.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Perhatian:</span> Terdapat {invalidItems.length} baris yang dilewati karena nama, brand, atau harga tidak lengkap. Baris tersebut tidak akan disimpan ke database.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={validItems.length === 0 || isSubmitting}
            onClick={handleSubmitImport}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan ke Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan {validItems.length} Data Laptop ke Database</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
