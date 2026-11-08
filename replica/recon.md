# Recon map: Lapmatch (Web)

Scope: Sistem Pendukung Keputusan (SPK) Rekomendasi Laptop Mahasiswa (Katalog Interaktif, Form Kuesioner 5 Parameter, Algoritma Pembobotan ROC, Mesin Evaluasi TOPSIS, Generator Penjelasan AI Gemini, Riwayat Konsultasi, Direktori Service & Diagnosa Mandiri, Serta Dashboard Admin Multi-Modul)
For: Mahasiswa, Pelajar, Akademisi, dan Konsumen Laptop di Indonesia
Date: 2026-11-08

---

## Sources

| # | Source | Lokasi / URL | Catatan |
|---|---|---|---|
| 1 | File Konfigurasi Project | `package.json`, `next.config.ts`, `tsconfig.json` | Next.js 16.3.8, React 19.2.8, Tailwind CSS v4, Prisma 7.10.0, Supabase SSR |
| 2 | Skema Database & Migrasi | `prisma/schema.prisma`, `prisma/migrations/` | 7 Entitas Relasional PostgreSQL via Supabase |
| 3 | Algoritma Keputusan SPK | `src/lib/roc.ts`, `src/lib/topsis.ts` | ROC (Rank Order Centroid) & TOPSIS matematis dengan penanganan imputasi |
| 4 | Integrasi AI & Utilitas | `src/lib/ai.ts`, `src/lib/laptop-utils.ts`, `src/lib/rate-limit.ts` | Google Gemini 1.5 Flash API dengan fallback naratif kontekstual cerdas |
| 5 | Rute Halaman & UI | `src/app/`, `src/components/` | 16+ Halaman/Modal antarmuka modern dark theme |
| 6 | API Endpoints & Proxy | `src/app/api/`, `src/proxy.ts` | Next.js 16 Proxy Session Handler & REST Route Handlers |
| 7 | Dokumentasi Progres Proyek | `Laporan_Progres_Pengembangan_Web_Lapmatch.docx` | Laporan komprehensif arsitektur dan fungsionalitas Lapmatch |

---

## Core Loop

Pengguna menentukan preferensi komputasi (anggaran, kebutuhan pemakaian kuliah/gaming/koding, prioritas kriteria, merek, dan preferensi baru/second), lalu sistem secara otomatis menghitung pembobotan ROC, mengevaluasi seluruh alternatif laptop dengan algoritma TOPSIS, menyajikan rekomendasi teratas terpisah antara kondisi Baru dan Second, dilengkapi transparansi matriks matematis langkah demi langkah dan penjelasan personal berbasis AI Gemini.

---

## Screens

| ID | Screen | Route / How to Reach | Purpose | Key Components | States Seen |
|---|---|---|---|---|---|
| **S01** | Landing Page (Tamu) | `/` (Pengunjung belum login) | Edukasi platform, showcase fitur utama, hero banner visual, testimoni, dan CTA kuesioner | HeroSection, PerspectiveTunnel, PreviewLaptopGrid, Testimonials, Navbar, Footer | Default, Loading |
| **S02** | User Dashboard (Login) | `/` (Pengguna login) | Hub personal: konsultasi terakhir, pintasan kuesioner cepat, akses riwayat, dan katalog laptop | RecentConsultationsCard, QuickStartCard, StatsBadge, LaptopCatalog | Default, Empty history, Populated |
| **S03** | Katalog Laptop & Pencarian | `/` (Tab/Section Katalog) | Menampilkan dan memfilter ratusan laptop (merk, harga, spek, kondisi baru/second) | SearchInput, FilterBar, LaptopCard, Pagination/Sort, QuickCompareTrigger | Empty, Filtered, Populated, Modal open |
| **S04** | Modal Detail Laptop | Klik laptop pada S03 / S07 | Menampilkan spesifikasi detail teknis, skor benchmark, dan tautan belanja marketplace | ModalOverlay, BenchmarkRadar/Bar, SpecGrid, MarketplaceButton | Open, Closing |
| **S05** | Modal Komparasi Laptop | Pilih 2-3 laptop -> Klik 'Bandingkan' | Membandingkan spek, harga, dan keunggulan spesifikasi laptop berdampingan | SideBySideGrid, DiffHighlight, SpecComparisonRow | 2 items, 3 items, Empty slot |
| **S06** | Halaman Kuesioner Rekomendasi | `/questionnaire` | Mengumpulkan 5 parameter kebutuhan pengguna dan mengedukasi alur SPK | StepperGuide, BudgetSlider, PeruntukanSelector, BrandChips, AuthModalPrompt | Form Ready, Calculating/Loading, Error Validation |
| **S07** | Halaman Hasil Rekomendasi | `/recommendation/[id]` | Menyajikan ranking laptop terbaik hasil TOPSIS (Baru & Second), AI insight, dan opsi cetak | RankBadge, RecommendationCard, AiInsightBox, FilterConditionTab, ActionPrintBar | Loading Skeleton, Populated, Top Rank, No Match |
| **S08** | Modal Langkah Hitung TOPSIS | Klik 'Lihat Langkah Perhitungan' pada S07 | Menjamin transparansi ilmiah dengan menampilkan Matriks X, R, Y, Solusi Ideal A+/A-, Jarak D+/D-, dan Nilai V | FormulaExplainer, MatrixTableTabs, ValueHighlighter | Tab X, Tab R, Tab Y, Tab Ideal, Tab Preferensi |
| **S09** | Riwayat Konsultasi | `/history` | Mengelola riwayat hasil konsultasi pengguna sebelumnya | SearchInput, ConsultationCard, DeleteConfirmationModal, Pagination | Loading, Empty state, Populated, Deleting |
| **S10** | Direktori Service Laptop & Diagnosa | `/service-laptop` | Mencari toko service terverifikasi di kota pengguna serta panduan diagnosa mandiri | CityFilter, ShopCard, ProblemDiagnosisAccordion, CostEstimator | All Cities, Filtered City, Problem Expanded |
| **S11** | Halaman Masuk (Login) | `/login` | Otentikasi pengguna via Email/Password atau Google OAuth | LoginForm, PasswordInput, GoogleButton, RateLimitWarningAlert | Normal, Loading, Error (Rate Limit/Invalid Creds) |
| **S12** | Halaman Pendaftaran | `/register` | Pendaftaran akun baru dengan validasi kata sandi terstandarisasi | RegisterForm, PasswordStrengthMeter, TermsCheckbox, SubmitBtn | Normal, Password Weak, Success Redirect |
| **S13** | Lupa Sandi & Reset Password | `/forgot-password`, `/reset-password` | Pemulihan akses akun via tautan email Supabase Auth | EmailForm, ResetPasswordForm, TokenValidator | Sent Email, Expired Token, Password Updated |
| **S14** | Profil Pengguna | `/profile` | Melihat data profil, riwayat aktivitas ringkas, dan pengaturan akun | ProfileCard, ActivityStats, LogoutButton | Normal, Editing |
| **S15** | Dashboard Admin Terpadu | `/admin` (Hanya role admin & email terdaftar) | Panel kontrol admin: statistik, laptop CRUD, import Excel, kuesioner, users, banner, & ekspor | AdminSidebar, LaptopDataTable, ImportExcelModal, UserRoleManager, BannerManager, XLSXExporter | Authorized, Tab switching, Modal open, Denied (Redirect) |
| **S16** | Halaman Edukasi & Legalitas | `/tentang`, `/tentang-metode`, `/kebijakan-privasi`, `/syarat-penggunaan` | Menjelaskan latar belakang proyek, metodologi ROC-TOPSIS, dan ketentuan layanan | ContentContainer, ScientificFormulas, FAQAccordion, LegalClauses | Static Informational |

---

## Flows

### F01: Pengguna Tamu Menjelajah & Menguji Simulasi Rekomendasi
```
S01 Landing Page -> Eksplorasi Fitur & Katalog (S03) -> Klik 'Mulai Kuesioner' -> S06 Halaman Kuesioner
    -> Jika Guest: Melihat panduan lengkap -> Opsi login/daftar untuk simpan hasil atau simulasi guest
    happy path clicks: 3 clicks
    edge: Pengguna guest mencoba submit kuesioner lengkap -> Sistem memunculkan AuthPromptModal tanpa menghilangkan input yang sudah diisi
```

### F02: Registrasi & Login Akun Mahasiswa
```
S01 Landing Page -> S11 Halaman Login (atau S12 Registrasi) -> Input Email/Password atau Google OAuth
    -> Validasi Rate Limiting & Auth Server -> Sync ke tabel User Prisma -> Redirect ke S02 User Dashboard (atau callbackUrl)
    happy path clicks: 3 clicks
    edge: Salah password 5x -> Rate limit aktif 15 menit; Google OAuth provider belum sinkron -> Fallback notifikasi informatif
```

### F03: Pengisian Kuesioner & Perhitungan Rekomendasi Lengkap (Core Loop)
```
S02 User Dashboard -> S06 Kuesioner -> Pilih Rentang Anggaran (Slider/Preset) -> Pilih Peruntukan (Kuliah/Coding/Desain/Gaming/Bisnis)
    -> Pilih Frekuensi Pemakaian -> Pilih Preferensi Kondisi (Baru/Second/Keduanya) -> Pilih Merek Laptop
    -> Klik 'Analisis Rekomendasi' -> API `/api/questionnaire` (Kalkulasi Bobot ROC -> Filter Kandidat -> Perhitungan TOPSIS Baru & Second -> Panggil AI Gemini)
    -> Redirect ke S07 Halaman Hasil Rekomendasi
    happy path clicks: 6 clicks
    edge: Budget minimum > maximum -> Validasi inline merah; Tidak ada laptop dalam range budget -> Penanganan graceful fallback kandidat
```

### F04: Eksplorasi Hasil, Komparasi, dan Verifikasi Matriks Matematis TOPSIS
```
S07 Hasil Rekomendasi -> Tinjau Peringkat 1 s/d 5 (Baru & Second) -> Baca Narasi AI Gemini -> Klik 'Bandingkan' (S05)
    -> Klik 'Lihat Langkah Perhitungan' -> S08 Modal Transparansi TOPSIS -> Pelajari Normalisasi Matriks & Jarak Solusi Ideal
    happy path clicks: 4 clicks
    edge: Gemini API timeout / limit tercapai -> Sistem fallback otomatis ke generator kontekstual tanpa error di layar pengguna
```

### F05: Manajemen Riwayat Konsultasi & Pencetakan/Ekspor Hasil
```
S02 User Dashboard -> S09 Halaman Riwayat -> Cari berdasarkan kata kunci judul/peruntukan -> Klik hasil untuk buka S07
    -> Pada S07: Klik 'Cetak Laporan / PDF' -> Mode print styling bersih tanpa elemen navigasi
    happy path clicks: 3 clicks
    edge: Menghapus riwayat konsultasi -> Modal konfirmasi -> Cascading delete bobotHasil, hasilTopsis, dan penjelasanAi
```

### F06: Pencarian Tempat Service & Diagnosis Kerusakan Laptop
```
S01/S02 Navigasi -> S10 Halaman Service Laptop -> Pilih Kota (Jakarta, Bandung, Surabaya, Yogyakarta, dll.)
    -> Klik Akordeon Masalah (Laptop Panas/Mati Total/Layar Pecah) -> Baca diagnosa & estimasi biaya -> Hubungi WhatsApp toko terverifikasi
    happy path clicks: 2 clicks
    edge: Kota belum memiliki partner -> Tampil notifikasi perluasan jaringan mitra
```

### F07: Manajemen Sistem oleh Admin (Katalog Laptop, Impor Excel, Pengguna & Laporan)
```
S15 Halaman Admin -> Tab Manajemen Laptop -> Klik 'Tambah Laptop' (Form manual) ATAU 'Import Excel'
    -> Drag & drop file .xlsx spesifikasi laptop -> Validasi header & baris data -> Batch insert ke PostgreSQL
    -> Tab Laporan -> Klik 'Ekspor Data ke XLSX' -> File terunduh otomatis
    happy path clicks: 4 clicks
    edge: Baris Excel memiliki nilai kosong pada baterai/berat -> Algoritma auto-impute kategori melengkapi data secara ilmiah
```

---

## Components

| Component | Variants | States | Used On |
|---|---|---|---|
| **Navbar** | Guest, Authenticated, Admin badge | Default, Sticky scrolled, Mobile menu open/close, User dropdown open | Semua halaman publik & user |
| **Footer** | Standard Dark | Default | Semua halaman publik & user |
| **LaptopCard** | Grid card, Recommendation card, Catalog card | Default, Hover scale, Badge (Baru/Second), Selected for compare | S01, S02, S03, S07 |
| **LaptopDetailModal** | Large modal overlay | Hidden, Open, Loading image, Tab specs/benchmark | S03, S07 |
| **LaptopCompareModal** | Multi-column comparison (2-3 items) | Hidden, Open, Remove item, Add item | S03, S07 |
| **TopsisStepByStepModal** | Full-width calculation audit modal | Hidden, Open, Tab switching (X, R, Y, A+/-, D+/-, V) | S07 |
| **AuthPromptModal** | Intercept modal untuk guest | Hidden, Open, Redirecting | S06, S03 |
| **Input / PasswordInput** | Text, Email, Password dengan toggle mata | Default, Focused, Filled, Error message | S11, S12, S13, S15 |
| **PasswordStrengthMeter** | Bar 4-level kekuatan (Lemah s/d Sangat Kuat) | Dynamic score (0 - 4), Hint display | S12, S13 |
| **AuthButton** | Primary Violet Gradient | Default, Hover, Loading spinner, Disabled | S11, S12, S13 |
| **GoogleButton** | Light outline dengan Google icon | Default, Hover, Loading | S11, S12 |
| **AdminSidebar** | Fixed desktop sidebar, Drawer mobile | Collapsed, Expanded, Active tab highlight | S15 |
| **ImportLaptopModal** | File dropzone Excel (.xlsx/.xls) | Idle, File selected, Parsing, Uploading, Error report | S15 |
| **FeaturedLaptopAdBanner** | Promo carousel / announcement banner | Visible, Closed, Auto-rotation | S01, S02, S03 |

---

## Inferred Data Model

```prisma
User
  id: String (UUID, matches Supabase auth.users.id)
  name: String
  email: String (unique)
  role: String (default "mahasiswa", options: "mahasiswa" | "admin")
  createdAt: DateTime
  updatedAt: DateTime
  evidence: prisma/schema.prisma, src/app/api/auth/profile/route.ts
  confidence: high

Laptop
  id: Int (autoincrement)
  name: String
  brand: String
  price: BigInt
  performaKomposit: Int?
  processorScore: Int?
  vgaScore: Int?
  ramGb: Int?
  storageGb: Int?
  displaySize: Float?
  batteryHours: Float?
  weightKg: Float?
  mobilityScore: Int?
  category: String?
  image: String?
  imageUrl: String?
  condition: String (default "baru", options: "baru" | "second")
  createdAt: DateTime
  updatedAt: DateTime
  evidence: prisma/schema.prisma, AdminLaptopManager.tsx, topsis.ts
  confidence: high

Kriteria
  id: Int (autoincrement)
  kode: String (C1 - C6)
  nama: String (Harga, Performa, RAM, Storage, Baterai, Portabilitas)
  tipe: String ("benefit" | "cost")
  deskripsi: String?
  evidence: prisma/schema.prisma, prisma/seed.ts, lib/roc.ts, lib/topsis.ts
  confidence: high

KuisionerJawaban
  id: Int (autoincrement)
  userId: String (FK -> User.id)
  budgetMin: BigInt
  budgetMax: BigInt
  peruntukan: String
  rankingKriteria: Json (array kode C1-C6 berurutan)
  merekPilihan: Json (array string merek pilihan)
  kondisiPilihan: String ("baru" | "second" | "keduanya")
  frekuensiMembawa: String?
  judul: String?
  tanggalPengisian: DateTime
  evidence: prisma/schema.prisma, src/app/api/questionnaire/route.ts
  confidence: high

BobotKriteriaHasil
  id: Int (autoincrement)
  kuisionerJawabanId: Int (FK -> KuisionerJawaban.id)
  kriteriaId: Int (FK -> Kriteria.id)
  prioritas: Int (1 - 6)
  bobot: Float (Hasil rumus ROC Centroid)
  evidence: prisma/schema.prisma, src/lib/roc.ts
  confidence: high

HasilTopsis
  id: Int (autoincrement)
  kuisionerJawabanId: Int (FK -> KuisionerJawaban.id)
  laptopId: Int (FK -> Laptop.id)
  kondisi: String ("baru" | "second")
  nilaiV: Float (Skor preferensi kedekatan relatif TOPSIS)
  peringkat: Int (Ranking 1..N)
  evidence: prisma/schema.prisma, src/lib/topsis.ts
  confidence: high

PenjelasanAi
  id: Int (autoincrement)
  kuisionerJawabanId: Int (FK -> KuisionerJawaban.id)
  laptopId: Int (FK -> Laptop.id)
  penjelasan: String (Narasi rekomendasi dari Gemini API / Generator Kontekstual)
  evidence: prisma/schema.prisma, src/lib/ai.ts
  confidence: high
```

### Relasi Antar Entitas:
- `User` 1-N `KuisionerJawaban`
- `KuisionerJawaban` 1-N `BobotKriteriaHasil` (N=6 tiap konsultasi)
- `Kriteria` 1-N `BobotKriteriaHasil`
- `KuisionerJawaban` 1-N `HasilTopsis`
- `Laptop` 1-N `HasilTopsis`
- `KuisionerJawaban` 1-N `PenjelasanAi`
- `Laptop` 1-N `PenjelasanAi`

---

## Feature Matrix Summary

Lihat rincian lengkap pada file `replica/features.csv`.
- **Must Have**: 24 fitur (Otentikasi, Kuesioner, ROC Weighting, TOPSIS Engine, Hasil Pemeringkatan, Detail Laptop, Komparasi, Riwayat, Admin CRUD).
- **Should Have**: 12 fitur (Penjelasan AI Gemini, Fallback Naratif Cerdas, Transparansi Matriks Matematis, Import Excel, Export XLSX, Diagnosa Kerusakan Laptop, Rate Limiting).
- **Could Have**: 8 fitur (Ad Banner Manager, Quick Google Login, Password Strength Meter, Cetak PDF Styling, Filter Multi-Merek).
- **Skip / Out of Scope**: 2 fitur (Direct Payment Gateway e-Commerce, Live Real-time Web Scraping E-commerce tanpa API).

---

## Out of Scope (Cannot or Should not be cloned)

1. **Direct E-commerce Checkout / Payment Gateway**: Lapmatch diposisikan sebagai platform Decision Support System (DSS/SPK) dan agregator rekomendasi, bukan toko daring dengan proses checkout dan pembayaran langsung. Transaksi dialihkan ke tautan marketplace resmi (Tokopedia/Shopee/Blibli/Official Store).
2. **Scraping Real-Time E-commerce Tanpa Izin**: Pembaruan harga dilakukan melalui katalog kurasi berkala via fitur Impor Excel admin, menghindari scraping web ilegal yang rentan diblokir IP dan melanggar ToS marketplace.

---

## Sizing

- **Screens**: 16 layar & modal interaktif
- **Flows**: 7 alur kerja terstruktur
- **Entities**: 7 model database relasional
- **Hard Parts**:
  1. *Perhitungan SPK Komposit*: Implementasi ROC + TOPSIS dengan imputasi otomatis data spesifikasi kosong dan pemisahan komparasi kondisi Baru vs Second.
  2. *Auditability & Transparansi*: Pembuatan modal interaktif matriks matematika TOPSIS multi-langkah (X, R, Y, A+, A-, D+, D-, V) untuk validitas akademis.
  3. *AI Reasoning Resilience*: Integrasi Gemini API dengan timeout 3.5 detik dan fallback dinamis ke rule-based narrative engine tanpa interrupting user flow.
  4. *Next.js 16 SSR & Session Management*: Sinkronisasi Supabase SSR session via `src/proxy.ts` dan rate limiting login terdistribusi.
- **Size**: **M (Medium)** — Aplikasi sistem pendukung keputusan yang solid, memiliki fondasi arsitektur bersih, modern, dan fungsional penuh.
