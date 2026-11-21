# 🧭 Panduan Struktur Folder & Kode Lapmatch

Dokumen ini memandu Anda memahami struktur folder proyek sehingga Anda dapat dengan mudah menemukan, mengedit, dan menambahkan fitur baru.

---

## 🏗️ Struktur Folder Utama (`src/`)

```
src/
├── app/                  # 🌐 Routing Halaman & API (Next.js App Router)
├── components/           # 🧩 Komponen UI yang Dikelompokkan Rapi
│   ├── dashboard/        # 📊 Seluruh Komponen Halaman Admin / Dashboard
│   ├── catalog/          # 💻 Komponen Katalog Laptop & Perbandingan
│   ├── auth/             # 🔐 Form Login, Register, Auth Modal & Button
│   └── ui/               # 🎨 Visual 3D & Efek Animasi
├── lib/                  # ⚙️ Logika Bisnis, Algoritma SPK, & Database
└── types/                # 🏷️ TypeScript Type Definitions
```

---

## 📂 Rincian Folder `src/components/`

### 1. `src/components/dashboard/` (Dashboard & Admin Panel)
> Semua komponen antarmuka admin berada di sini!
- **`AdminDashboardLayout.tsx`**: Layout admin utama, sidebar navigasi, header status admin, dan switch tab aktif.
- **`AdminOverview.tsx`**: Tab ringkasan KPI (total laptop, total pengguna, total konsultasi SPK, grafik sebaran).
- **`AdminLaptopManager.tsx`**: Tab manajemen laptop (tabel laptop, filter, form modal tambah/edit laptop).
- **`ImportLaptopModal.tsx`**: Modal impor data spreadsheet Excel (`.xlsx`, `.xls`) & CSV.
- **`AdminUserManager.tsx`**: Tab manajemen pengguna (daftar akun, ubah role admin/user, hapus akun).
- **`AdminQuestionnaireManager.tsx`**: Tab kriteria TOPSIS (bobot kriteria ROC) & riwayat konsultasi kuis.
- **`AdminReviewManager.tsx`**: Tab moderasi ulasan & penilaian bintang dari pengguna.
- **`AdminBannerManager.tsx`**: Tab pengaturan slider iklan promo di beranda.
- **`AdminReportsManager.tsx`**: Tab unduh laporan akademik multi-sheet (Excel & CSV).
- **`AdminSettingsManager.tsx`**: Tab info profil SuperAdmin & status kesehatan database.

### 2. `src/components/catalog/` (Katalog Laptop Publik)
- **`LaptopCatalog.tsx`**: Komponen filter pencarian, pengurutan, grid kartu laptop, dan dock perbandingan laptop.

### 3. `src/components/auth/` (Autentikasi Pengguna)
- **`AuthButton.tsx`**: Tombol login/daftar yang responsif dengan efek visual.
- **`Input.tsx` & `PasswordInput.tsx`**: Komponen form input yang terstandardisasi.
- **`GoogleButton.tsx`**: Tombol login satu-klik dengan akun Google.
- **`AuthPromptModal.tsx`**: Modal ajakan login saat tamu mencoba fitur eksklusif (misal: wishlist, ulasan).

### 4. `src/components/` (Komponen Umum)
- **`Navbar.tsx`**: Navigasi atas dengan logo, menu navigasi, drawer mobile, dan profil user.
- **`Footer.tsx`**: Bagian bawah halaman dengan tautan cepat, info kontak, dan hak cipta.
- **`LandingPage.tsx`**: Halaman depan untuk pengunjung umum (hero section, keunggulan TOPSIS, FAQ).
- **`LaptopDetailModal.tsx`**: Modal detail lengkap spesifikasi dan skor laptop.
- **`LaptopCompareModal.tsx`**: Modal perbandingan berdampingan 2–4 laptop.
- **`LaptopReviewModal.tsx`**: Modal kirim rating & ulasan laptop.
- **`TopsisStepByStepModal.tsx`**: Modal transparansi perhitungan matriks TOPSIS langkah-demi-langkah.

---

## 🌐 Rincian Folder `src/app/` (Halaman Web)

| Rute URL | Lokasi File | Fungsi |
| :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | Halaman beranda (Landing page atau Dashboard Rekomendasi Mahasiswa) |
| `/admin` | `src/app/admin/page.tsx` | Halaman Dashboard Admin Terpusat (memanggil `AdminDashboardLayout`) |
| `/dashboard` | `src/app/dashboard/page.tsx` | Shortcut rute yang otomatis mengarahkan ke `/admin` |
| `/questionnaire` | `src/app/questionnaire/page.tsx` | Kuis konsultasi pemilihan kriteria laptop metode TOPSIS |
| `/recommendation/[id]` | `src/app/recommendation/[id]/page.tsx` | Halaman hasil rekomendasi ranking laptop hasil TOPSIS |
| `/login` | `src/app/login/page.tsx` | Halaman masuk akun |
| `/register` | `src/app/register/page.tsx` | Halaman pendaftaran mahasiswa baru |
| `/service-laptop` | `src/app/service-laptop/page.tsx` | Direktori tempat servis laptop terverifikasi |

---

## ⚙️ Rincian Folder `src/lib/` (Logika & Backend)

- **`topsis.ts`**: Mesin kalkulasi SPK metode **TOPSIS** (normalisasi vektor, matriks ternormalisasi terbobot, solusi ideal positif/negatif, jarak Euclidean, nilai preferensi $V_i$).
- **`roc.ts`**: Pembobotan kriteria otomatis menggunakan metode **Rank Order Centroid (ROC)**.
- **`prisma.ts`**: Koneksi klien Prisma ORM ke database PostgreSQL Supabase.
- **`laptop-utils.ts`**: Fungsi bantuan format rupiah (`formatRupiah`), gambar laptop fallback, dan deteksi laptop baru.
- **`admin-auth.ts`**: Verifikasi hak akses admin pada server-side.

---

## 💡 Tips Cepat Modifikasi Kode

1. **Mau ganti tampilan dashboard admin?**  
   Buka folder: 👉 `src/components/dashboard/`  
   Semua tab admin sudah terpisah per file dengan nama yang jelas.

2. **Mau ganti tampilan katalog laptop atau filter harga?**  
   Buka folder: 👉 `src/components/catalog/LaptopCatalog.tsx`

3. **Mau ganti navigasi atas atau footer?**  
   Buka: 👉 `src/components/Navbar.tsx` atau `src/components/Footer.tsx`

4. **Mau ganti perhitungan TOPSIS atau bobot kriteria?**  
   Buka: 👉 `src/lib/topsis.ts` atau `src/lib/roc.ts`
