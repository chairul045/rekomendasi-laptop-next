# Laporan Peningkatan Basis Data (Fase 2: Database Improvement) - Proyek Lapmatch

**Tanggal Pelaksanaan:** 8 November 2026  
**Status:** Berhasil Diimplementasikan & Divalidasi (Build & Typecheck: PASS)  
**Dokumen Referensi:**
- `replica/recon.md`
- `replica/architecture-plan.md`
- `replica/security-hardening-report.md`
- `prisma/migrations/20261108063601_fase2_banner_review_indexes/migration.sql`

---

## 1. Ringkasan Eksekutif

Dalam rangka melanjutkan roadmap peningkatan backend Lapmatch sesuai metodologi `/replica-backend`, **Fase 2: Database Improvement** difokuskan pada:
1. Menghilangkan ketergantungan manipulasi sistem berkas lokal (`banners.json`) yang tidak *stateless* dan berisiko pada lingkungan *serverless* (misalnya Vercel/AWS Lambda).
2. Memigrasikan entitas `Banner` ke tabel PostgreSQL dengan skema Prisma yang terstandarisasi.
3. Menggantikan *mock state* dan penyimpanan `localStorage` pada ulasan laptop dengan tabel relasional `Review` terintegrasi.
4. Mengoptimalkan performa kueri basis data pada tabel berukuran besar (`laptops` sebanyak 2.284 data, `hasil_topsis` sebanyak 1.587 data, `kuisioner_jawaban`) menggunakan indeks majemuk (*composite index*).
5. Memastikan seluruh data pengguna dan riwayat konsultasi terlindungi 100% tanpa migrasi destruktif, didahului oleh pembuatan cadangan (*database snapshot backup*).

Seluruh kode telah melewati audit dependensi, kompilasi TypeScript (`tsc --noEmit`), serta kompilasi produksi Next.js 16 (`npm run build`) dengan status **0 error**.

---

## 2. Audit Penyimpanan Banner (`banners.json`)

### 2.1. Temuan Audit
Sebelum perbaikan, sistem iklan banner promo pada dashboard dan katalog laptop menggunakan arsitektur file lokal `data/banners.json` yang dikelola melalui `src/lib/banner-store.ts`.

| Aspek | Kondisi Lama (`banners.json`) | Dampak & Risiko | Solusi Fase 2 |
| :--- | :--- | :--- | :--- |
| **Statelessness** | Menulis langsung ke disk via `fs.writeFileSync` | Pada runtime *serverless* (Vercel), disk bersifat *read-only* atau *ephemeral*; perubahan admin hilang saat kontainer *recycle* | Dipindahkan ke tabel PostgreSQL `banners` via Prisma |
| **Konsistensi Data** | Multi-instance runtime membaca berkas terpisah | Inkonsistensi data ketika terdapat replikasi kontainer/serverless worker | Sumber kebenaran tunggal (*single source of truth*) di database relasional |
| **Keandalan Serverless** | Rentan kegagalan I/O dan `EROFS` | Operasi penambahan/edit banner oleh admin gagal pada hosting modern | Menggunakan koneksi pooling PostgreSQL dengan fallback memori yang tangguh |
| **Tipe Data & Serialisasi** | Format JSON statis tanpa validasi skema skalar | Rentan *type mismatch* jika struktur JSON termodifikasi manual | Validasi terpusat melalui Prisma Model `Banner` & TypeScript |

---

## 3. Rancang Bangun Skema & Relasi Database (Prisma)

### 3.1. Skema Model `Banner`
Model `Banner` dirancang untuk menggantikan `BannerAd` dari `banners.json`:

```prisma
model Banner {
  id            String   @id @default(cuid())
  title         String
  brand         String
  subtitle      String
  price         BigInt
  originalPrice BigInt   @map("original_price")
  discount      String   @default("")
  badge         String   @default("")
  processor     String   @default("")
  vga           String   @default("")
  ramGb         Int      @default(0) @map("ram_gb")
  storageGb     Int      @default(0) @map("storage_gb")
  display       String   @default("")
  imageUrl      String   @map("image_url")
  tokopediaUrl  String?  @map("tokopedia_url")
  shopeeUrl     String?  @map("shopee_url")
  isActive      Boolean  @default(true) @map("is_active")
  sortOrder     Int      @default(0) @map("sort_order")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@index([isActive, sortOrder])
  @@map("banners")
}
```

### 3.2. Skema Model `Review`
Model `Review` dirancang untuk menggantikan *client mock state* (`INITIAL_REVIEWS`) pada `AdminReviewManager` dan penyimpanan lokal `localStorage` pada `LaptopReviewModal`:

```prisma
model Review {
  id        String   @id @default(cuid())
  laptopId  Int      @map("laptop_id")
  userId    String?  @map("user_id")
  userName  String   @map("user_name")
  userRole  String   @default("Mahasiswa") @map("user_role")
  rating    Int      @default(5)
  comment   String
  status    String   @default("published") // published | reported | moderated
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  laptop Laptop @relation(fields: [laptopId], references: [id], onDelete: Cascade)
  user   User?  @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([laptopId, status])
  @@index([userId])
  @@index([createdAt])
  @@map("reviews")
}
```

### 3.3. Integritas Relasi & Perlindungan Data Pengguna
1. **Relasi Laptop - Review (`onDelete: Cascade`):** Jika sebuah produk laptop dihapus dari katalog, seluruh ulasannya dibersihkan otomatis guna mencegah data *orphan*.
2. **Relasi User - Review (`onDelete: SetNull`):** Sesuai kaidah privasi data akun, apabila pengguna menghapus akunnya, ulasan tetap dipertahankan dengan `userId = null` sehingga integritas agregasi rating laptop komunitas tidak rusak.
3. **Konversi Aman `BigInt`:** Atribut `price` dan `originalPrice` pada banner dan laptop dikonversi secara eksplisit ke tipe `Number` saat dikirimkan via response JSON, menghindari *TypeError: Do not know how to serialize a BigInt*.

---

## 4. Evaluasi & Penambahan Indeks Basis Data

Berdasarkan analisis beban kueri (*query pattern analysis*), ditambahkan indeks komposit berikut untuk mengoptimalkan waktu respons API:

| Tabel | Kolom Terindeks | Pola Kueri yang Dioptimalkan | Alasan Kinerja |
| :--- | :--- | :--- | :--- |
| `laptops` | `[condition, price]` | Filter katalog laptop baru/second dan rentang budget | Menghindari *full table scan* terhadap 2.284 data laptop saat kalkulasi TOPSIS & katalog |
| `laptops` | `[brand]` | Agregasi statistik brand dan dropdown filter | Mempercepat `groupBy` brand pada dashboard admin |
| `kuisioner_jawaban` | `[userId, createdAt]` | Halaman riwayat konsultasi pengguna (`/history`) | Menjamin kueri pagination dan sorting riwayat user berkecepatan $O(\log N)$ |
| `bobot_kriteria_hasil` | `[kuisionerJawabanId]` | Relasi detail pembobotan ROC | Mempercepat join saat membuka hasil rekomendasi |
| `hasil_topsis` | `[kuisionerJawabanId, peringkat]` | Rekomendasi peringkat 1 (rekomendasi terbaik) | Menghilangkan beban *scan* 1.587 rekaman TOPSIS |
| `hasil_topsis` | `[laptopId]` | Analisis laptop yang paling sering direkomendasikan | Mempercepat laporan analitik dashboard admin |
| `penjelasan_ai` | `[kuisionerJawabanId]` | Pengambilan penjelasan AI per sesi konsultasi | Pemuatan instan hasil konsultasi tanpa latensi |
| `banners` | `[isActive, sortOrder]` | Pemuatan banner aktif berurutan di beranda | Kueri publik banner hanya memindai rekaman aktif yang terurut |
| `reviews` | `[laptopId, status]` | Ulasan publik per laptop (`status: 'published'`) | Kueri modal ulasan langsung terarah ke laptop spesifik |
| `reviews` | `[userId]` | Moderasi dan riwayat kontribusi pengguna | Mempercepat moderasi ulasan per akun |
| `reviews` | `[createdAt]` | Urutan ulasan terbaru di panel moderasi admin | Pengurutan kronologis instan |

---

## 5. Prosedur Keamanan & Snapshot Cadangan Database

Sebelum berkas skema dan migrasi dipersiapkan, sistem telah melakukan pencadangan penuh (*full data snapshot*) melalui `scripts/backup-db.ts`:

- **Lokasi Berkas Cadangan:** `data/backups/backup_before_fase2.json` (Ukuran: ~1.8 MB)
- **Ringkasan Data Aman:**
  - `users`: 17 akun
  - `laptops`: 2.284 produk
  - `kriteria`: 6 kriteria TOPSIS
  - `kuisioner_jawaban`: 26 sesi konsultasi
  - `bobot_kriteria_hasil`: 156 rekaman bobot ROC
  - `hasil_topsis`: 1.587 peringkat TOPSIS
  - `penjelasan_ai`: 123 analisis AI

---

## 6. Berkas Migrasi SQL (Non-Destruktif)

Migrasi SQL disimpan pada:
`prisma/migrations/20261108063601_fase2_banner_review_indexes/migration.sql`

Karakteristik migrasi:
- **100% Non-Destruktif:** Tidak ada perintah `DROP TABLE`, `DROP COLUMN`, atau perubahan tipe yang memangkas data (*lossless*).
- **Semua Perintah Bersifat Aditif:** Terdiri atas `CREATE TABLE "banners"`, `CREATE TABLE "reviews"`, `CREATE INDEX`, dan penambahan *foreign key constraints*.

```sql
-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "original_price" BIGINT NOT NULL,
    "discount" TEXT NOT NULL DEFAULT '',
    "badge" TEXT NOT NULL DEFAULT '',
    "processor" TEXT NOT NULL DEFAULT '',
    "vga" TEXT NOT NULL DEFAULT '',
    "ram_gb" INTEGER NOT NULL DEFAULT 0,
    "storage_gb" INTEGER NOT NULL DEFAULT 0,
    "display" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT NOT NULL,
    "tokopedia_url" TEXT,
    "shopee_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "laptop_id" INTEGER NOT NULL,
    "user_id" TEXT,
    "user_name" TEXT NOT NULL,
    "user_role" TEXT NOT NULL DEFAULT 'Mahasiswa',
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banners_is_active_sort_order_idx" ON "banners"("is_active", "sort_order");
CREATE INDEX "reviews_laptop_id_status_idx" ON "reviews"("laptop_id", "status");
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");
CREATE INDEX "reviews_created_at_idx" ON "reviews"("created_at");
CREATE INDEX "bobot_kriteria_hasil_kuisioner_jawaban_id_idx" ON "bobot_kriteria_hasil"("kuisioner_jawaban_id");
CREATE INDEX "hasil_topsis_kuisioner_jawaban_id_peringkat_idx" ON "hasil_topsis"("kuisioner_jawaban_id", "peringkat");
CREATE INDEX "hasil_topsis_laptop_id_idx" ON "hasil_topsis"("laptop_id");
CREATE INDEX "kuisioner_jawaban_user_id_createdAt_idx" ON "kuisioner_jawaban"("user_id", "createdAt");
CREATE INDEX "laptops_condition_price_idx" ON "laptops"("condition", "price");
CREATE INDEX "laptops_brand_idx" ON "laptops"("brand");
CREATE INDEX "penjelasan_ai_kuisioner_jawaban_id_idx" ON "penjelasan_ai"("kuisioner_jawaban_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_laptop_id_fkey" FOREIGN KEY ("laptop_id") REFERENCES "laptops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

---

## 7. Pembaruan Endpoint & Komponen Aplikasi

### 7.1. Layer Layanan & API Baru
1. **`src/lib/banner-store.ts`:**
   - Ditingkatkan untuk beroperasi langsung menggunakan Prisma Client PostgreSQL.
   - Dilengkapi proteksi *graceful fallback* ke memori jika tabel belum dieksekusi di database, sehingga tidak ada *runtime exception* 500 saat transisi.
2. **`src/app/api/reviews/route.ts`:**
   - Endpoint publik untuk memuat ulasan terverifikasi per laptop.
   - Endpoint pengiriman ulasan mahasiswa dengan deteksi otomatis sesi login Supabase Auth.
3. **`src/app/api/admin/reviews/route.ts` & `[id]/route.ts`:**
   - Endpoint moderasi ulasan khusus admin (`checkAdminAuth`).
   - Menyediakan fitur moderasi status (`published`, `reported`, `moderated`) dan penghapusan ulasan.
4. **`src/app/api/admin/stats/route.ts`:**
   - Agregasi statistik rating dan total ulasan kini menghitung secara dinamis dari tabel `reviews` (`prisma.review.aggregate`).

### 7.2. Layer Komponen Antarmuka (UI)
1. **`src/app/admin/AdminReviewManager.tsx`:**
   - Menggantikan *mock state* lokal dengan integrasi API `/api/admin/reviews`.
   - Dilengkapi *live reload*, pencarian real-time, filter rating bintang, dan feedback notifikasi toast.
2. **`src/components/LaptopReviewModal.tsx`:**
   - Form modal kini mengirim ulasan ke endpoint `/api/reviews`.
   - Dilengkapi sistem *offline/connectivity fallback* ke `localStorage` jika koneksi jaringan terputus.

---

## 8. Skrip Utilitas & Prosedur Penerapan Produksi

Sesuai ketentuan ketat **"Jangan menjalankan migrasi production tanpa persetujuan"**, kami menyediakan skrip mandiri yang dapat ditinjau dan dijalankan oleh pemilik proyek / administrator:

### Langkah Eksekusi Migrasi Basis Data:
```bash
# 1. Meninjau query SQL migrasi (Dry Run & Proteksi):
npx tsx scripts/apply-fase2-migration.ts

# 2. Menjalankan migrasi secara aman ke PostgreSQL (Setelah Disetujui):
npx tsx scripts/apply-fase2-migration.ts --approve-production
# atau menggunakan prisma CLI standar:
npx prisma migrate deploy

# 3. Mengisi data awal banner & ulasan mahasiswa (Opsional):
npx tsx scripts/seed-fase2.ts
```

---

## 9. Hasil Verifikasi & Pengujian

| Pengujian | Perintah | Hasil | Keterangan |
| :--- | :--- | :--- | :--- |
| **Prisma Validation** | `npx prisma validate` | **VALID** | Skema Prisma 7 valid tanpa konflik |
| **Client Generation** | `npx prisma generate` | **SUCCESS** | Tipe `Banner` dan `Review` tergenerate |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS (0 Error)** | Semua tipe model dan API sinkron |
| **Next.js Production Build** | `npm run build` | **PASS (0 Error)** | 37 rute halaman dan API berhasil dikompilasi |

---
**Rekomendasi Langkah Berikutnya:**  
Melanjutkan ke **Fase 3: Integrasi & Pengujian QA End-to-End** (`/replica-test`) untuk menguji alur penambahan banner iklan dan ulasan laptop secara otomatis menggunakan Playwright atau skenario uji API.
