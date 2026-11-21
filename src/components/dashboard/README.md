# 📁 Folder Dashboard (`src/components/dashboard/`)

Folder ini berisi seluruh komponen antarmuka (UI) untuk **Dashboard Panel Admin Lapmatch**.

Semua file dikelompokkan di sini agar mudah ditemukan, dipahami, dan dimodifikasi tanpa mengotori folder routing Next.js (`src/app/admin/`).

---

## 🗂️ Daftar File & Fungsinya

| File | Fungsi & Deskripsi |
| :--- | :--- |
| **`AdminDashboardLayout.tsx`** | **Layout Utama**: Sidebar navigasi (Desktop & Mobile Drawer), header profil admin, dark mode toggle, dan logika perpindahan tab menu. |
| **`AdminOverview.tsx`** | **Tab Ringkasan**: Kartu metrik KPI (Total Laptop, Pengguna, Konsultasi SPK), progress bar sebaran kategori, statistik brand, dan laptop terpopuler. |
| **`AdminLaptopManager.tsx`** | **Tab Manajemen Laptop**: Tabel data laptop, fitur pencarian, filter merek & kondisi, form modal tambah/edit laptop, dan tombol pemicu import spreadsheet. |
| **`ImportLaptopModal.tsx`** | **Modal Impor Spreadsheet**: Fitur drag-and-drop untuk upload file `.xlsx`, `.xls`, `.csv`, tombol download template resmi, dan preview tabel validasi. |
| **`AdminUserManager.tsx`** | **Tab Manajemen Pengguna**: Tabel daftar user terdaftar, pencarian nama/email, filter role (Admin/User), ubah role modal, dan konfirmasi hapus user. |
| **`AdminQuestionnaireManager.tsx`** | **Tab Kuisioner & TOPSIS**: Sub-tab Kriteria TOPSIS (bobot ROC & Benefit/Cost), riwayat hasil rekomendasi user/tamu, dan modal edit bobot kriteria. |
| **`AdminReviewManager.tsx`** | **Tab Ulasan & Rating**: Header rata-rata bintang, filter rating 1★–5★, kartu ulasan pengguna, dan moderasi/hapus ulasan. |
| **`AdminBannerManager.tsx`** | **Tab Slider Promo/Iklan**: Manajemen banner di homepage, template preset laptop, urutan slide, mini live preview, toggle aktif/nonaktif, dan link Shopee/Tokopedia. |
| **`AdminReportsManager.tsx`** | **Tab Laporan Akademik**: Ekspor laporan data lengkap ke format Excel (.xlsx) dan CSV (.csv) untuk kebutuhan riset skripsi/akademik. |
| **`AdminSettingsManager.tsx`** | **Tab Pengaturan Sistem**: Kartu identitas SuperAdmin, status integritas database PostgreSQL, dan ringkasan mesin algoritma TOPSIS. |
| **`index.ts`** | Pusat *export* untuk memudahkan import komponen dashboard dari `@/components/dashboard`. |

---

## 💡 Cara Menambah atau Mengubah Fitur Dashboard

1. **Ingin mengubah tampilan salah satu tab?**
   - Buka langsung file manajer yang bersangkutan (misal: ingin ubah form laptop -> buka `AdminLaptopManager.tsx`).
2. **Ingin menambah tab menu baru di Sidebar?**
   - Buka `AdminDashboardLayout.tsx`.
   - Tambahkan menu baru pada array `NAV_ITEMS` (sertakan `id`, `label`, dan `icon`).
   - Buat komponen manajer baru di folder ini (misal `AdminLogManager.tsx`).
   - Panggil komponen tersebut di dalam `renderContent()` pada `AdminDashboardLayout.tsx`.
3. **Endpoint API yang digunakan:**
   - Semua panggilan API admin terhubung ke `src/app/api/admin/` (`/api/admin/laptops`, `/api/admin/users`, `/api/admin/banners`, `/api/admin/reviews`, dll.).
