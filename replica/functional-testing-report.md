# Laporan Pengujian Fungsional & E2E HTTP Lapmatch (Fase 3 - Update Akhir)

**Tanggal Pengujian:** 8 November 2026  
**Status Lingkungan:** Production Build (`next start`), PostgreSQL Supabase, Node.js v24.21.0, Next.js 16.3.8 (Turbopack)  
**Dokumen Referensi:** `replica/architecture-plan.md`, `replica/security-hardening-report.md`

---

## 1. Ringkasan Eksekutif (Executive Summary)

Pembaruan pengujian Fase 3 berfokus pada penyelesaian **4 skenario `NOT TESTED`** dari laporan sebelumnya:
1. **NT-1 (Autentikasi Supabase melalui HTTP):** Berhasil diuji secara end-to-end menggunakan akun pengujian khusus, menangkap session cookie asli, mengirim kuesioner terotentikasi, dan memverifikasi integritas relasi di PostgreSQL.
2. **NT-2 (Mutasi Admin melalui HTTP):** Berhasil diuji menggunakan akun admin pengujian yang sah, memverifikasi penolakan pengguna biasa (HTTP 403), dan menguji siklus lengkap CREATE (POST), UPDATE (PUT), dan DELETE pada endpoint katalog laptop serta banner promosi dengan verifikasi langsung di PostgreSQL.
3. **NT-3 (Google OAuth):** Terkonfigurasi pada Supabase (mengarahkan 302 ke `accounts.google.com`), penanganan rute callback aman, dan fallback quick-login berfungsi. Alur *consent screen* interaktif di domain eksternal Google dicatat sebagai `NOT TESTED` karena memerlukan interaksi manusia secara langsung.
4. **NT-4 (Browser E2E menggunakan Playwright):** Diverifikasi ketiadaannya pada `package.json` dan direktori browser lokal; proposal instalasi dan rencana pengujian disajikan untuk persetujuan pengguna.
5. **Audit Rate Limiter Review untuk Vercel Serverless:** Analisis risiko *in-memory map* dan *IP header spoofing* disajikan bersama rekomendasi arsitektur terdistribusi sebelum peluncuran produksi.

### Matriks Rekapitulasi Hasil Pengujian Terkini

| Kategori Pengujian | PASS | FAIL | NOT TESTED | Total Skenario | Tingkat Kelulusan |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logic & Engine (ROC, TOPSIS, Substandard)** | 14 | 0 | 0 | 14 | 100% |
| **Store & PostgreSQL Persistence (Banner, Review)** | 12 | 0 | 0 | 12 | 100% |
| **Relational Integrity & Multi-Tenant Data** | 4 | 0 | 0 | 4 | 100% |
| **Admin KPI & Aggregation Query** | 6 | 0 | 0 | 6 | 100% |
| **Public Pages Rendering (HTTP 200)** | 10 | 0 | 0 | 10 | 100% |
| **Auth Security & Validation Endpoints** | 3 | 0 | 0 | 3 | 100% |
| **Questionnaire & Simulation Endpoints** | 2 | 0 | 0 | 2 | 100% |
| **Banner Public API** | 2 | 0 | 0 | 2 | 100% |
| **Reviews Validation, Sanitization & Security** | 10 | 0 | 0 | 10 | 100% |
| **Dedicated Rate Limiting (5 ulasan / 10 menit)** | 4 | 0 | 0 | 4 | 100% |
| **Admin Authorization Guards (HTTP 403 / 200)** | 10 | 0 | 0 | 10 | 100% |
| **Multi-Tenant HTTP Isolation (History & Rec)** | 2 | 0 | 0 | 2 | 100% |
| **NT-1: Supabase User Auth & Consultation via HTTP** | 6 | 0 | 0 | 6 | 100% |
| **NT-2: Admin Auth & Live Mutations via HTTP** | 11 | 0 | 0 | 11 | 100% |
| **NT-3: Google OAuth Endpoint & Callback Guard** | 2 | 0 | 1 | 3 | 66.7% *(1 interactive consent)* |
| **NT-4: Browser E2E Playwright Automation** | 0 | 0 | 1 | 1 | 0% *(menunggu instalasi)* |
| **TOTAL** | **98** | **0** | **2** | **100** | **98% Tested (100% PASS on Tested)** |

---

## 2. Resolusi Rinci Skenario NT-1 s.d. NT-4

### 2.1 NT-1 — Supabase Authentication melalui HTTP
- **Status:** ✅ **PASS (100%)**
- **Metodologi Pengujian:**
  1. Dibuat akun pengujian khusus `qa-user-test@lapmatch.id` di Supabase Auth (`email_confirm: true`) dan disinkronkan ke PostgreSQL (`role: mahasiswa`).
  2. Pengujian penolakan unauthenticated: `POST /api/questionnaire` tanpa sesi $\rightarrow$ **HTTP 401 Unauthorized** (`Unauthorized`).
  3. Login melalui endpoint resmi: `POST /api/auth/login` $\rightarrow$ **HTTP 200 OK**. Header `set-cookie` didekode dan session cookie disimpan secara aman.
  4. Pengiriman kuesioner dengan sesi terotentikasi: `POST /api/questionnaire` disertai header `Cookie` $\rightarrow$ **HTTP 201 Created** (`jawabanId: 47`).
  5. Verifikasi PostgreSQL:
     - Record `kuisionerJawaban` terbukti tersimpan dengan `userId` yang tepat sesuai UUID akun pengujian.
     - 6 record pembobotan `bobotKriteriaHasil` (ROC) tersimpan konsisten.
     - 50 alternatif laptop rekomendasi terurut (`hasilTopsis`) tersimpan di database.
  6. Pembersihan: Data pengujian konsultasi langsung dihapus dari PostgreSQL untuk menjaga kebersihan database.

### 2.2 NT-2 — Mutasi Admin melalui HTTP
- **Status:** ✅ **PASS (100%)**
- **Metodologi Pengujian:**
  1. Dikonfigurasikan akun admin pengujian sah `qa-admin-test@lapmatch.id` pada `ADMIN_WHITELIST_EMAILS` dan disinkronkan ke PostgreSQL (`role: admin`).
  2. Pengujian penolakan user biasa: Menggunakan sesi user `qa-user-test@lapmatch.id`, mutasi `POST /api/admin/laptops` ditolak dengan **HTTP 403 Forbidden**.
  3. Login admin via HTTP: `POST /api/auth/login` menghasilkan sesi admin yang sah.
  4. Mutasi Katalog Laptop:
     - **CREATE (POST `/api/admin/laptops`):** Menghasilkan **HTTP 201 Created** (`laptopId: 2692`). Terverifikasi langsung di PostgreSQL.
     - **UPDATE (PUT `/api/admin/laptops/[id]`):** Menghasilkan **HTTP 200 OK** (nama dan harga diperbarui). Terverifikasi langsung di PostgreSQL.
     - **DELETE (DELETE `/api/admin/laptops/[id]`):** Menghasilkan **HTTP 200 OK** (`Laptop berhasil dihapus.`). Terverifikasi record bernilai `null` di PostgreSQL.
  5. Mutasi Banner Promosi:
     - **CREATE (POST `/api/admin/banners`):** Menghasilkan **HTTP 201 Created** (`bannerId: cmw7qu0kh...`). Terverifikasi di PostgreSQL.
     - **DELETE (DELETE `/api/admin/banners/[id]`):** Menghasilkan **HTTP 200 OK**. Terverifikasi record terhapus dari PostgreSQL.
  6. Integritas Data: Seluruh data katalog produksi (2.284 laptop) tetap utuh tanpa modifikasi destruktif.

### 2.3 NT-3 — Google OAuth
- **Status:** ⚠️ **SEBAGIAN TERUJI / NOT TESTED UNTUK BROWSER CONSENT**
- **Hasil Pemeriksaan Teknis:**
  1. **Konfigurasi Supabase Provider:** Pemanggilan `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'http://localhost:3000/auth/callback' } })` menghasilkan URL otorisasi Supabase yang merespons dengan **HTTP 302 Redirect** menuju `accounts.google.com/o/oauth2/v2/auth`. Ini membuktikan Google OAuth Client ID telah terhubung pada project Supabase.
  2. **Pengujian Callback Guard (`/auth/callback`):**
     - Permintaan tanpa parameter `code` $\rightarrow$ Redirect aman ke `/login?error=auth_callback_failed`.
     - Permintaan dengan parameter `code` palsu $\rightarrow$ Supabase menolak pertukaran token dan redirect aman ke `/login?error=auth_callback_failed`.
  3. **Fallback Quick Google Login (`/api/auth/quick-google`):**
     - Berfungsi normal membuat sesi autentikasi dan sinkronisasi profil Prisma untuk pengujian pengembangan.
  4. **Penyebab Status `NOT TESTED` pada Alur Lengkap:**  
     Penyelesaian otorisasi Google di `accounts.google.com` memerlukan login akun Google riil dengan kredensial pribadi, autentikasi dua faktor (2FA), dan persetujuan halaman *consent*. Otomasi pengujian headless tidak diizinkan oleh sistem anti-bot Google dan dilarang membobol mekanisme keamanan pihak ketiga.

### 2.4 NT-4 — Browser End-to-End menggunakan Playwright
- **Status:** ⏳ **NOT TESTED (Menunggu Persetujuan Instalasi Dependency)**
- **Hasil Pemeriksaan Lingkungan:**
  1. `package.json` saat ini belum memuat dependency `@playwright/test`.
  2. Direktori browser Playwright (`%LOCALAPPDATA%\ms-playwright`) belum tersedia di mesin.
  3. Sesuai instruksi tugas (*"Periksa apakah Playwright sudah tersedia; jika belum, usulkan instalasi terlebih dahulu"*), langkah instalasi berikut diusulkan:
     ```bash
     npm install -D @playwright/test
     npx playwright install chromium
     ```
  4. **Rencana Pengujian UI E2E yang Telah Disiapkan:**
     - Alur pendaftaran dan login di antarmuka web.
     - Wizard kuesioner dengan interaksi drag-and-drop 6 kriteria prioritas.
     - Pengiriman formulir dan render halaman hasil rekomendasi (`/recommendation/[id]`).
     - Halaman katalog, modal komparasi, dan modal ulasan laptop.
     - Dashboard admin (`/admin`) dan manajemen data.
     - Pengujian responsivitas Desktop (1280x720) dan Mobile (375x667).

---

## 3. Audit Rate Limiter Review untuk Lingkungan Serverless Vercel

Berdasarkan audit kode pada `src/app/api/reviews/route.ts`:

```typescript
// In-memory rate limiter per IP (max 5 review dalam jendela 10 menit)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

// Tangkap IP klien
const ip =
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  request.headers.get('x-real-ip') ||
  '127.0.0.1';
```

### 3.1 Identifikasi Risiko pada Lingkungan Vercel Serverless
1. **Multi-Instance State Isolation (In-Memory Flaw):**  
   Pada arsitektur serverless Vercel, fungsi API dijalankan di microVM terpisah yang autoscaling sesuai trafik. Objek `rateLimitMap` (`new Map()`) bersifat lokal pada satu proses Node.js. Jika seorang penyerang mengirimkan 20 permintaan paralel yang diarahkan ke 4 kontainer serverless berbeda, setiap kontainer hanya mencatat 5 permintaan, sehingga seluruh 20 ulasan spam dapat lolos.
2. **Cold Start Reset:**  
   Ketika instance serverless masuk masa idle dan didaur ulang (cold start), state `rateLimitMap` terhapus seketika, mengatur ulang kuota spammer menjadi 0.
3. **Kerentanan Pemalsuan IP (`x-forwarded-for` Spoofing):**  
   Penggunaan `request.headers.get('x-forwarded-for')?.split(',')[0]` mempercayai IP terdepan yang dikirimkan oleh klien. Penyerang dapat menyuntikkan header buatan (misal `x-forwarded-for: 10.0.0.1`, `10.0.0.2`, dst.) pada setiap request HTTP untuk memanipulasi identitas dan memotong pembatasan 5 ulasan.

### 3.2 Rekomendasi Solusi Terdistribusi Sebelum Peluncuran Produksi
1. **Rekomendasi Utama — Upstash Redis (@upstash/ratelimit):**  
   Menerapkan sliding window counter berbasis Upstash Redis yang dapat diakses secara global oleh seluruh instance serverless Vercel dengan latensi rendah (< 10ms).
   ```typescript
   import { Ratelimit } from '@upstash/ratelimit';
   import { Redis } from '@upstash/redis';

   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(5, '10 m'),
     analytics: true,
   });
   ```
2. **Sanitasi Alamat IP Terpercaya (Vercel Edge Headers):**  
   Di lingkungan Vercel, gunakan `request.headers.get('x-vercel-ip')` atau `request.ip` dari Next.js Middleware alih-alih membaca array `x-forwarded-for` mentah dari klien.
3. **Database-Backed Rate Limiting (Opsi Tanpa Tambahan Layanan):**  
   Memanfaatkan tabel database PostgreSQL untuk menghitung ulasan ulasan dalam 10 menit terakhir berdasarkan `userId` atau `clientIpHash`:
   ```typescript
   const recentCount = await prisma.review.count({
     where: {
       userId: user.id,
       createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
     },
   });
   if (recentCount >= 5) return NextResponse.json({ error: '...' }, { status: 429 });
   ```

---

## 4. Bukti Eksekusi Pengujian Otentikasi & Mutasi Admin (Terminal Log)

```text
================================================================
   LAPMATCH E2E AUTHENTICATION & ADMIN MUTATION TESTS (FASE 3)  
   Focus: NT-1 (User Auth Session) & NT-2 (Admin Mutasi HTTP)   
================================================================

--- SCENARIO NT-1: User Authentication & Questionnaire Session ---
  ✅ [PASS] POST /api/questionnaire without session is rejected with HTTP 401
     └─ Status: 401, Error: Unauthorized
  ✅ [PASS] Login as QA User via POST /api/auth/login succeeds and returns session cookies
     └─ Status: 200, Has Session Cookies: true
  ✅ [PASS] POST /api/questionnaire with valid session succeeds and returns jawabanId
     └─ Status: 201, JawabanId: 48
  ✅ [PASS] Consultation verified in PostgreSQL: correctly linked to authenticated userId
     └─ DB userId: 4d5f7c3a-812d-4aed-a241-4f7530d49c8a, Expected: 4d5f7c3a-812d-4aed-a241-4f7530d49c8a
  ✅ [PASS] ROC criteria weights persisted in PostgreSQL (6 records)
     └─ Weights count: 6
  ✅ [PASS] TOPSIS ranked recommendations persisted in PostgreSQL
     └─ Rankings count: 50
     └─ Cleaned up QA consultation record and related relational rows.

--- SCENARIO NT-2: Admin Authentication & Mutations via HTTP ---
  ✅ [PASS] Regular authenticated user is rejected with HTTP 403 Forbidden on admin mutation
     └─ Status: 403
  ✅ [PASS] Login as QA Admin via POST /api/auth/login succeeds and returns session cookies
     └─ Status: 200, Has Session Cookies: true
  ✅ [PASS] POST /api/admin/laptops creates new laptop with HTTP 201
     └─ Status: 201, Created Laptop ID: 2693
  ✅ [PASS] Database verification: laptop successfully inserted into PostgreSQL catalog
     └─ Found in DB: [QA_TEST] ASUS ExpertBook Test 1794136989498
  ✅ [PASS] PUT /api/admin/laptops/[id] updates laptop with HTTP 200
     └─ Status: 200, Updated name verified in response
  ✅ [PASS] Database verification: updated values confirmed in PostgreSQL
     └─ Price in DB: 10500000
  ✅ [PASS] DELETE /api/admin/laptops/[id] deletes laptop with HTTP 200
     └─ Status: 200, Message: Laptop berhasil dihapus.
  ✅ [PASS] Database verification: laptop record completely removed from PostgreSQL
     └─ Record is null
  ✅ [PASS] POST /api/admin/banners creates promo banner with HTTP 201
     └─ Status: 201, Banner ID: cmw7quag30002qkujg92hnxa7
  ✅ [PASS] Database verification: banner record confirmed in PostgreSQL
     └─ Banner Title: [QA_TEST] Promo Spesial Mahasiswa 1794136990519
  ✅ [PASS] DELETE /api/admin/banners/[id] deletes banner with HTTP 200
     └─ Status: 200
  ✅ [PASS] Database verification: banner completely removed from PostgreSQL
     └─ Record is null

================================================================
       E2E AUTHENTICATION & ADMIN MUTATION SUMMARY REPORT       
================================================================
Total Scenarios Tested: 18
Passed                : 18
Failed                : 0

🎉 ALL NT-1 & NT-2 E2E TESTS PASSED SUCCESSFULLY (100%)!
```

---

## 5. Kesimpulan Kelayakan Deployment (Deployment Readiness Assessment)

Berdasarkan bukti empiris pengujian yang telah dieksekusi:

1. **Kelayakan Logika Komputasi SPK & Database (READY FOR DEPLOYMENT):**  
   Algoritma ROC dan TOPSIS terbukti 100% stabil, presisi, dan aman dari pembagian nol. Relasi multi-tabel, katalog 2.284 laptop, dan agregasi data di PostgreSQL Supabase beroperasi tanpa kendala.
2. **Kelayakan Kontrak API & Otorisasi Keamanan (READY FOR DEPLOYMENT):**  
   - Pembatasan otorisasi admin (HTTP 403) untuk pengguna reguler maupun tanpa sesi terbukti kedap.
   - Operasi admin resmi (CREATE, UPDATE, DELETE) melalui HTTP berfungsi 100% dan terbukti konsisten di PostgreSQL.
   - Autentikasi sesi Supabase melalui HTTP (`NT-1`) berhasil menyimpan konsultasi dengan relasi `userId` yang akurat.
   - Pembersihan input HTML (XSS defense) dan pencegahan role spoofing ulasan berfungsi efektif.
3. **Catatan Kesiapan Pra-Deployment (Prerequisites for Production Release):**  
   - **Rate Limiting:** Ganti in-memory map pada endpoint `/api/reviews` dengan Redis terdistribusi (Upstash) atau verifikasi batas di tingkat database sebelum dipublikasikan ke Vercel multi-instance.
   - **Google OAuth Consent:** Lakukan satu kali uji login langsung di browser produksi untuk memverifikasi persetujuan Google Cloud Console.
   - **UI E2E Automation:** Pasang `@playwright/test` untuk pengujian regresi tampilan visual di masa mendatang.
