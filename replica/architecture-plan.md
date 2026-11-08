# Rencana & Evaluasi Arsitektur Proyek Lapmatch
**Dokumen Perencanaan Arsitektur Sistem Pendukung Keputusan (SPK) Rekomendasi Laptop**  
*Berdasarkan Hasil Analisis Komprehensif Folder `replica/`*

---

## 1. Evaluasi Stack Teknologi: Next.js, Supabase, Prisma, dan Gemini AI

### 1.1 Next.js 16 (App Router & Proxy)
- **Status & Konvensi**: Proyek telah mengadopsi Next.js 16.3.8 dengan React 19. Next.js 16 memperkenalkan konvensi baru di mana file `middleware.ts` digantikan perannya oleh `proxy.ts`. Proyek telah menerapkan ini di `src/proxy.ts` yang meneruskan request ke handler sesi Supabase.
- **Kelebihan**:
  - Struktur routing modular berbasis *route groups* dan *nested layouts*.
  - Pemisahan yang jelas antara Server Components (halaman Beranda, Admin Page) dan Client Components (Kuesioner, Katalog, Modals).
  - Dynamic route handler `/api/recommendation/[id]` dan `/api/admin/*` sudah mendukung pola asynchronous params terbaru Next.js 16.
- **Catatan Arsitektural**:
  - Terdapat duplikasi pemanggilan profil user antara SSR layout dan client-side fetch (`/api/auth/profile`). Sebaiknya konteks sesi diinjeksi melalui Server Context / React Context terpusat.

### 1.2 Supabase SSR Auth
- **Status & Pola**: Menggunakan `@supabase/ssr` (versi 0.12.7) dengan pembagian:
  - `src/lib/supabase/client.ts` (Client Browser dengan `createBrowserClient`).
  - `src/lib/supabase/server.ts` (Server Component / Route Handler dengan `createServerClient`).
  - `src/lib/supabase/middleware.ts` (Session proxy handler dengan cookie sync `getAll()` dan `setAll()`).
  - `src/lib/supabase/admin.ts` (Admin Client dengan `SUPABASE_SERVICE_ROLE_KEY`).
- **Kelebihan**: Token JWT disimpan dalam cookie HTTP-only dengan atribut `sameSite: 'lax'` dan `secure: true` pada environment production, mencegah serangan XSS mencuri access token.
- **Risiko Kritis**:
  - File `src/lib/supabase/admin.ts` memuat fallback *Service Role Key* ber-encode base64 langsung di dalam kode sumber (`c2Jfc2VjcmV0...`). Ini adalah celah keamanan berisiko tinggi jika repositori diunggah ke publik.

### 1.3 Prisma ORM (v7.10.0 + `@prisma/adapter-pg`)
- **Status & Koneksi**: Menggunakan Prisma 7 yang mewajibkan driver adapter. Proyek menggunakan `@prisma/adapter-pg` yang terhubung ke port pooler Supabase (6543) dengan opsi `pgbouncer=true`.
- **Kelebihan**:
  - Koneksi singleton dikelola dengan baik pada `src/lib/prisma.ts` untuk mencegah *connection leak* pada mode development.
  - Relasi database didefinisikan dengan *foreign key cascade* yang menjamin konsistensi saat data riwayat dihapus.
- **Risiko Kritis**:
  - Terdapat connection string PostgreSQL cadangan (*fallback*) dengan kredensial kata sandi database plaintext tertulis di baris 8 `src/lib/prisma.ts`. Seluruh kredensial wajib dibaca strictly dari *environment variables*.

### 1.4 Integrasi Google Gemini AI
- **Status**: Menggunakan model `gemini-1.5-flash` melalui endpoint REST resmi Google Generative Language API dengan `AbortSignal.timeout(3500)`.
- **Kelebihan**:
  - **Fault-Tolerant Narrative Engine**: Jika panggilan API Gemini timeout, kuota habis, atau API key tidak disetel, fungsi otomatis beralih ke `generateFallbackNarrative` tanpa memunculkan error ke antarmuka pengguna.
- **Catatan Arsitektural**:
  - Pada saat kuesioner diselesaikan (`/api/questionnaire`), sistem menjalankan `Promise.all` untuk menghasilkan hingga 6 penjelasan AI secara paralel (3 laptop Baru + 3 laptop Second). Pada paket gratis (*free tier*) Gemini API, 6 request konkuren dapat memicu HTTP 429 (*Rate Limit Exceeded*).

---

## 2. Evaluasi Struktur Basis Data & Relasi Antartabel

### 2.1 Peta Skema Saat Ini (7 Entitas Relasional)

```
[User] (id UUID, Supabase auth.users)
  └── 1:N ──► [KuisionerJawaban] (id Serial, userId, budget, peruntukan, ranking)
                ├── 1:N ──► [BobotKriteriaHasil] (kuisionerJawabanId, kriteriaId, bobot)
                ├── 1:N ──► [HasilTopsis] (kuisionerJawabanId, laptopId, nilaiV, peringkat)
                └── 1:N ──► [PenjelasanAi] (kuisionerJawabanId, laptopId, penjelasan)

[Laptop] (id Serial, name, brand, price BigInt, specs)
  ├── 1:N ──► [HasilTopsis]
  └── 1:N ──► [PenjelasanAi]

[Kriteria] (id Serial, kode C1-C6, nama, tipe benefit/cost)
  └── 1:N ──► [BobotKriteriaHasil]
```

### 2.2 Temuan & Evaluasi Database
1. **Ketelitian Nilai Uang (BigInt)**:
   - Penggunaan tipe `BigInt` pada kolom `price`, `budget_min`, dan `budget_max` sangat tepat untuk mata uang Rupiah guna menghindari integer overflow. Serialisasi JSON manual telah diakomodasi di endpoint.
2. **Redundansi Kolom**:
   - Tabel `laptops` memiliki kolom `image` dan `imageUrl`. Salah satu kolom ini bersifat mubazir dan membingungkan pemeliharaan data.
3. **Ketiadaan Tabel untuk Fitur Aktif**:
   - **Fitur Banner**: Manajemen banner saat ini menggunakan file lokal `banners.json` via modul `src/lib/banner-store.ts`. Ini tidak *stateless* dan akan bermasalah di hosting serverless seperti Vercel (sistem file bersifat *ephemeral* / hanya-baca).
   - **Fitur Review**: Tampilan ulasan laptop di `AdminReviewManager.tsx` masih menggunakan *hardcoded mock state*, belum tersimpan di database.
   - **Fitur Toko Service**: Data direktori service laptop berada di file statis `service-shops.ts`.
4. **Ketiadaan Indeks (Performance Gap)**:
   - Skema saat ini belum mendefinisikan indeks sekunder selain Primary Key dan Unique Constraint.
   - Pada tabel `laptops`, filter yang sering dipanggil (`brand`, `price`, `condition`) berjalan dengan mekanisme *Full Table Scan*.

---

## 3. Audit Algoritma Pembobotan ROC dan Perhitungan TOPSIS

### 3.1 Audit Algoritma ROC (Rank Order Centroid)
- **Implementasi**: `src/lib/roc.ts`
- **Rumus Matematika**:
  $$W_i = \frac{1}{K} \sum_{j=i}^{K} \frac{1}{j}$$
- **Hasil Audit**:
  - Rumus matematika yang diimplementasikan **100% valid dan presisi**.
  - Normalisasi residu pembulatan (`diff = 1.0 - totalWeight`) ditambahkan ke kriteria prioritas pertama, menjamin total bobot selalu tepat bernilai `1.0000`.
- **Celah Logika / Edge Case**:
  - Fungsi `calculateRocWeights` mengasumsikan input array kode kriteria memiliki elemen yang unik (`C1` s/d `C6`). Jika terjadi manipulasi request payload dengan nilai duplikat (misal `['C1', 'C1', 'C1', 'C1', 'C1', 'C1']`), perhitungan bobot akan menimpa key objek yang sama dan merusak total bobot.
  - *Rekomendasi*: Tambahkan validasi keunikan `new Set(orderedCriterionCodes).size === 6`.

### 3.2 Audit Algoritma TOPSIS
- **Implementasi**: `src/lib/topsis.ts`
- **Langkah-langkah Komputasi**:
  1. *Matriks Keputusan ($X$)*: Mengumpulkan nilai kriteria laptop.
  2. *Normalisasi Vektor ($R$)*: Menggunakan normalisasi Euclidean $r_{ij} = \frac{x_{ij}}{\sqrt{\sum x_{kj}^2}}$.
  3. *Normalisasi Terbobot ($Y$)*: $y_{ij} = w_j \cdot r_{ij}$.
  4. *Solusi Ideal Positif ($A^+$) & Negatif ($A^-$)*: Ditentukan akurat berdasarkan tipe `benefit` vs `cost`.
  5. *Jarak Separasi ($D^+$ & $D^-$)*: Jarak Euclidean ke solusi ideal.
  6. *Nilai Preferensi ($V$)*: $V_i = \frac{D_i^-}{D_i^+ + D_i^-}$.
- **Hasil Audit**:
  - Seluruh tahapan matematis TOPSIS telah diimplementasikan sesuai literatur ilmiah standar (*Hwang & Yoon, 1981*).
  - Telah dilengkapi pelindung pembagian nol (*division by zero guard*) pada pembagi normalisasi dan jarak separasi identik.
  - Kasus khusus ketika hanya ada 1 laptop kandidat yang lolos filter ditangani dengan elegan (menetapkan $V = 1.0$).
  - Fitur imputasi spesifikasi kategori (`getCategoryImputedSpecs`) dan estimasi performa gaming/desain (`estimatePerformanceScore`) bekerja sangat baik dalam mencegah distorsi skor akibat data spesifikasi kosong.

---

## 4. Evaluasi Keamanan Autentikasi, API, dan Dashboard Admin

| Komponen | Status Saat Ini | Tingkat Risiko | Temuan & Rekomendasi |
|---|---|---|---|
| **Kredensial Database** | Tercatat fallback URI dengan password di `prisma.ts` | **KRITIS** | Hapus string koneksi fallback; wajibkan runtime throw error jika `DATABASE_URL` tidak ada di environment. |
| **Service Role Key** | Fallback key hardcoded di `admin.ts` | **KRITIS** | Hapus fallback base64; pastikan `SUPABASE_SERVICE_ROLE_KEY` hanya diisi melalui secret manager server. |
| **Rate Limiting** | In-memory sliding window di `rate-limit.ts` | **SEDANG** | In-memory map akan reset saat server restart dan tidak berbagi state antar serverless instance. Disarankan menggunakan Redis/Upstash untuk skala produksi. |
| **Email Super Admin** | Hardcoded di `SUPER_ADMIN_EMAIL = 'chairulanwarr003@gmail.com'` | **SEDANG** | Pindahkan daftar email admin ke environment variable (`ADMIN_EMAILS=email1,email2`). |
| **Otorisasi API Admin** | Pengecekan sesi + role di setiap route handler | **BAIK** | Logika otorisasi sudah memeriksa `profile.role === 'admin' && isSuperAdminEmail(email)`, namun kodenya terduplikasi di banyak file API. |
| **Proteksi CSRF & XSS** | Cookie Supabase Auth bertipe HTTP-only | **SANGAT BAIK** | Cookie aman dari akses script sisi klien. |

---

## 5. Identifikasi Potensi Bug, Duplikasi Kode, dan Masalah Performa

### 5.1 Duplikasi Kode (Code Duplication)
1. **Helper Otorisasi Admin**:
   - Fungsi `checkAdmin()` dan `checkAdminAuth()` ditulis ulang secara identik di 5 file API berbeda:
     - `src/app/api/admin/laptops/route.ts`
     - `src/app/api/admin/users/route.ts`
     - `src/app/api/admin/banners/route.ts`
     - `src/app/api/admin/questionnaire/route.ts`
     - `src/app/api/admin/stats/route.ts`
   - *Solusi Arsitektur*: Ekstraksi ke modul terpusat `src/lib/admin-auth.ts`.
2. **Serialisasi BigInt JSON**:
   - Fungsi helper `serializeBigInt` / mapping `.toString()` diulang-ulang di beberapa route handler (`api/recommendation/[id]`, `api/admin/page.tsx`, `api/admin/laptops`).

### 5.2 Masalah Performa (Performance Bottlenecks)
1. **Ketiadaan Database Indexes**:
   - Pencarian laptop dengan kondisi dan rentang harga (`WHERE condition = 'baru' AND price BETWEEN min AND max`) melakukan *full table scan*. Hal ini akan memperlambat response time seiring bertambahnya data katalog.
2. **Panggilan AI Tanpa Batasan Konkurensi**:
   - Melakukan 6 panggilan bersamaan ke Google Gemini API dapat menghabiskan kuota rate limit API key gratis.
3. **Penyimpanan File Lokal `banners.json`**:
   - Operasi `fs.readFileSync` dan `fs.writeFileSync` bersifat synchronous blocking I/O dan tidak kompatibel dengan deployment serverless (Vercel).

---

## 6. Rekomendasi Pengembangan Paling Prioritas

Berikut urutan prioritas pembenahan arsitektur (*Actionable Architecture Recommendations*):

### Prioritas 1: Hardening Keamanan & Pembersihan Kredensial (Wajib Segera)
1. Hapus seluruh *hardcoded fallback credentials* dari `src/lib/prisma.ts` dan `src/lib/supabase/admin.ts`.
2. Pindahkan konstanta `SUPER_ADMIN_EMAIL` ke *environment variable* `ADMIN_WHITELIST_EMAILS`.
3. Sentralisasi fungsi otorisasi `verifyAdminSession()` ke `src/lib/auth-server.ts`.

### Prioritas 2: Penyempurnaan Skema Database & Persistensi
1. Tambahkan indeks performa pada `prisma/schema.prisma`:
   ```prisma
   // Pada model Laptop
   @@index([condition, price])
   @@index([brand])

   // Pada model KuisionerJawaban
   @@index([userId, createdAt])
   ```
2. Migrasikan entitas `BannerAd` dari `banner-store.ts` (file JSON) ke tabel database Prisma (`model Banner`).
3. Tambahkan tabel database `Review` untuk menghubungkan ulasan mahasiswa ke laptop dan user secara persisten.

### Prioritas 3: Optimalisasi & Robustness SPK Engine
1. Tambahkan validasi keunikan array input kriteria pada `/api/questionnaire` sebelum diproses oleh `calculateRocWeights`.
2. Implementasikan *sliding rate limiter* atau antrean sequential (misal: panggil AI hanya untuk Peringkat 1-3, dan gunakan fallback narasi cepat untuk peringkat 4-5) guna menjaga kestabilan kuota Gemini API.

---

## 7. Roadmap Pengembangan Bertahap

```mermaid
flowchart TD
    subgraph Fase 1: Keamanan & Refactoring (Minggu 1-2)
        A1[Hapus Kredensial Hardcoded] --> A2[Sentralisasi Admin Auth Helper]
        A2 --> A3[Validasi Zod & Unik Kriteria ROC]
    end

    subgraph Fase 2: Skema DB & Persistensi (Minggu 3-4)
        B1[Indeks Performa Laptop & Jawaban] --> B2[Model Prisma: Banner & Review]
        B2 --> B3[Hapus Ketergantungan File JSON]
    end

    subgraph Fase 3: Optimasi SPK & Ekspor (Minggu 5-6)
        C1[Optimasi Concurrency Gemini AI] --> C2[Ekspor PDF Asli Sisi Klien]
        C2 --> C3[Caching Katalog Publik]
    end

    subgraph Fase 4: Ekspansi Fitur (Minggu 7-8)
        D1[Notifikasi Rekomendasi via Email] --> D2[Sistem Ulasan Komunitas Terverifikasi]
        D2 --> D3[Integrasi Redis Rate Limiting]
    end

    Fase 1 --> Fase 2 --> Fase 3 --> Fase 4
```

### Rincian Rencana Tiap Fase:

#### Fase 1: Hardening Keamanan & Refactoring (Selesai Dilaksanakan)
- [x] Membersihkan `src/lib/prisma.ts` dari string koneksi hardcoded.
- [x] Membersihkan `src/lib/supabase/admin.ts` dari base64 fallback key.
- [x] Membuat utilitas otorisasi terpusat `src/lib/admin-auth.ts` untuk menghapus duplikasi fungsi `checkAdmin`.
- [x] Menambahkan validasi integritas payload input ranking kriteria pada `/api/questionnaire/route.ts`.

#### Fase 2: Penguatan Basis Data & Persistensi (Estimasi: 2 Minggu)
- [ ] Menambahkan indeks komposit di skema Prisma untuk mempercepat filter harga dan merek.
- [ ] Merancang tabel `Banner` dan `Review` di skema database relasional.
- [ ] Menghilangkan manipulasi sistem file lokal `banners.json` agar aplikasi 100% *stateless* dan siap dijalankan di platform serverless modern.

#### Fase 3: Optimasi Kinerja SPK & Pengalaman Pengguna (Estimasi: 2 Minggu)
- [ ] Mengoptimalkan alur pemanggilan Gemini API (hanya memanggil AI untuk rekomendasi teratas dan memanfaatkan fallback narasi cerdas untuk efisiensi latensi).
- [ ] Menyediakan opsi unduh berkas laporan rekomendasi dalam format `.pdf` murni menggunakan library rendering dokumen.
- [ ] Mengimplementasikan caching revalidasi waktu (*tag-based ISR / unstable_cache*) pada katalog laptop publik.

#### Fase 4: Ekspansi Komunitas & Ekosistem (Estimasi: 2-3 Minggu)
- [ ] Integrasi pengiriman ringkasan rekomendasi langsung ke email mahasiswa.
- [ ] Penyempurnaan modul ulasan laptop oleh mahasiswa terverifikasi.
- [ ] Peningkatan rate limiter ke Redis / Upstash untuk kesiapan menghadapi lonjakan trafik masa penerimaan mahasiswa baru.

---

### Kesimpulan Evaluasi Arsitek
Aplikasi **Lapmatch** telah memiliki arsitektur fondasi yang sangat kuat, bersih, dan mematuhi kaidah akademik sistem pendukung keputusan (ROC + TOPSIS). Dengan mengimplementasikan rencana arsitektur di atas—khususnya pembersihan kredensial lingkungan, penambahan indeks basis data, dan sentralisasi persistensi data—sistem akan mencapai tingkat keamanan, keandalan, dan kesiapan produksi yang optimal.
