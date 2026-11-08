# Laporan Pelaksanaan Fase 1: Security Hardening Proyek Lapmatch
**Dokumen Laporan Keamanan & Refactoring Arsitektur Sistem**  
*Tanggal Pelaksanaan: 8 November 2026*  
*Berdasarkan Panduan: `replica/architecture-plan.md` & Skill `/replica-backend`*

---

## 1. Ringkasan Eksekutif

Pada Fase 1 ini, telah dilakukan audit menyeluruh dan hardening keamanan (*security hardening*) terhadap basis kode sistem Lapmatch. Pekerjaan difokuskan pada eliminasi seluruh kredensial database dan API key yang sebelumnya tertanam langsung (*hardcoded*) di kode sumber, sentralisasi otorisasi administrator, penguatan validasi algoritma pembobotan ROC terhadap manipulasi duplikasi kriteria, serta pengamanan ketat endpoint autentikasi dan hak akses.

Seluruh perubahan dilakukan dengan mematuhi batasan ketat:
- **Desain UI tidak diubah** (tampilan dan interaksi pengguna tetap identik).
- **Fitur yang ada tidak dihapus** (seluruh alur SPK, konsultasi, auth, dan panel admin berfungsi normal).
- **Algoritma TOPSIS dipertahankan 100%**.
- **Tidak melakukan migrasi database**.
- **Seluruh kredensial rahasia tidak diekspos** di dalam laporan maupun terminal.
- **Kompatibilitas dan integritas sistem diverifikasi** melalui uji kompilasi TypeScript, eksekusi seed, dan produksi *Next.js 16 build* yang lulus 100%.

---

## 2. Audit Temuan Kredensial Hardcoded & Rekomendasi Rotasi

### 2.1 Temuan Audit File yang Memuat Kredensial
Sebelum proses hardening, ditemukan sejumlah file yang memuat kredensial sensitif dalam bentuk teks plaintext maupun base64 fallback:

| Lokasi Berkas | Jenis Kredensial | Tingkat Risiko | Status Perbaikan |
|---|---|---|---|
| `src/lib/prisma.ts` | Fallback connection string PostgreSQL Supabase (Port 6543 / pgBouncer) lengkap dengan username & kata sandi database | **KRITIS** | Kredensial dihapus 100%. Menggunakan `process.env.DATABASE_URL` wajib runtime throw error jika tidak disetel. |
| `prisma.config.ts` | Fallback connection string PostgreSQL Supabase Direct URL (Port 5432) lengkap dengan username & kata sandi database | **KRITIS** | Kredensial dihapus 100%. Dilengkapi pemuatan otomatis `dotenv` dari `.env.local`. |
| `prisma/seed.ts` | Fallback connection string PostgreSQL Direct URL | **KRITIS** | Kredensial dihapus 100%. Dilengkapi pemuatan otomatis `dotenv` dari `.env.local`. |
| `src/lib/supabase/admin.ts` | Fallback `SUPABASE_SERVICE_ROLE_KEY` (ber-encode base64) | **KRITIS** | Fallback base64 dihapus 100%. Wajib membaca `process.env.SUPABASE_SERVICE_ROLE_KEY` dan dilindungi guard server-side. |
| `src/lib/supabase/client.ts` | Fallback URL Supabase & Anon Key publishable | **SEDANG** | Fallback hardcoded dihapus, strictly menggunakan `process.env.NEXT_PUBLIC_SUPABASE_*`. |
| `src/lib/supabase/server.ts` | Fallback URL Supabase & Anon Key publishable | **SEDANG** | Fallback hardcoded dihapus, strictly menggunakan `process.env.NEXT_PUBLIC_SUPABASE_*`. |
| `src/lib/supabase/middleware.ts` | Fallback URL Supabase & Anon Key publishable | **SEDANG** | Fallback hardcoded dihapus. |
| Endpoint Auth (`login`, `signout`, `callback`, `logout`, `quick-google`) | Fallback URL Supabase & Anon Key publishable | **SEDANG** | Seluruh fallback string statis dihapus dan dialihkan ke environment variables. |
| `src/lib/auth-constants.ts` | Email Super Admin tertulis statis | **SEDANG** | Dialihkan ke konfigurasi `ADMIN_WHITELIST_EMAILS` dari environment variables. |

### 2.2 Peringatan Penting: Rekomendasi Rotasi Kredensial
> [!WARNING]
> Karena kata sandi PostgreSQL dan Supabase Service Role Key sebelumnya pernah tersimpan di berkas kode sumber dan commit riwayat Git sebelumnya, kredensial tersebut **berpotensi telah terekspos** jika repositori pernah diunggah atau diakses pihak ketiga.
>
> **Langkah Mitigasi Wajib bagi Pemilik Akun Supabase:**
> 1. Masuk ke **Supabase Dashboard** -> Proyek Lapmatch.
> 2. Buka menu **Project Settings** -> **Database** -> **Database password** -> Pilih **Reset database password**.
> 3. Buka menu **Project Settings** -> **API** -> Pada bagian **Project API keys**, lakukan rotasi/regenerasi untuk `service_role secret`.
> 4. Perbarui nilai rahasia baru tersebut di berkas `.env.local` lokal Anda dan pada dashboard platform hosting produksi (misalnya Vercel / Cloudflare).

---

## 3. Pemindahan Kredensial ke Environment Variables & Template `.env.example`

1. **Berkas `.env.local`**:
   - Seluruh variabel sensitif disimpan di berkas `.env.local` lokal mesin pengembang.
   - Ditambahkan variabel `ADMIN_WHITELIST_EMAILS="chairulanwarr003@gmail.com"` untuk mendukung multi-admin secara dinamis tanpa hardcode.
2. **Perlindungan `.gitignore`**:
   - Pola aturan `.gitignore` diperbarui untuk menjamin seluruh variasi file env (`.env*`, `.env.local`) tidak akan pernah ter-commit ke Git.
   - Diberikan pengecualian whitelist (`!.env.example`) agar template environment dapat dibagikan kepada pengembang lain dengan aman.
3. **Penyediaan Berkas `.env.example`**:
   - Berkas `.env.example` dibuat dengan menyajikan daftar variabel lengkap tanpa mencantumkan nilai rahasia asli (menggunakan placeholder semantik seperti `[PROJECT_REF]`, `[DB_PASSWORD]`, dll).

---

## 4. Isolasi Supabase Service Role Key di Sisi Server

Untuk menjamin bahwa `SUPABASE_SERVICE_ROLE_KEY` tidak akan pernah terekspos ke bundle JavaScript browser klien (*client-side leak*):
1. **Konvensi Penamaan Tanpa Prefix `NEXT_PUBLIC_`**:
   - Variabel didefinisikan murni sebagai `SUPABASE_SERVICE_ROLE_KEY`. Next.js secara otomatis tidak memasukkan variabel non-`NEXT_PUBLIC_` ke dalam build bundle browser.
2. **Runtime Guard Sisi Server**:
   - Ditambahkan pengecekan `if (typeof window !== 'undefined')` di dalam `src/lib/supabase/admin.ts`. Jika modul ini diimpor secara tidak sengaja di komponen client, aplikasi langsung memunculkan error fatal sebelum runtime browser sempat membaca kunci.
3. **Pemberian Error Deskriptif**:
   - Jika `SUPABASE_SERVICE_ROLE_KEY` tidak tersedia di environment server, sistem melempar pesan kesalahan yang jelas dan tidak lagi menggunakan fallback kunci cadangan.

---

## 5. Sentralisasi Otorisasi Administrator di `src/lib/admin-auth.ts`

### 5.1 Masalah Sebelumnya (Code Duplication & Inconsistency)
Sebelumnya, logika pengecekan hak akses admin diduplikasi secara identik pada 9 rute API admin yang berbeda (`banners`, `banners/[id]`, `laptops`, `laptops/[id]`, `laptops/import`, `questionnaire`, `stats`, `users`, `users/[id]`), serta di halaman SSR `src/app/admin/page.tsx`. Beberapa rute mengembalikan Supabase User, sementara yang lain mengembalikan objek Prisma User, dan beberapa endpoint detail kuesioner tidak memvalidasi whitelist email Super Admin.

### 5.2 Implementasi Modul Terpusat
Dibuat modul baru [`src/lib/admin-auth.ts`](file:///C:/Users/mraja/OneDrive/文档/rekomendasi-laptop-next/src/lib/admin-auth.ts) yang menyediakan:
1. `checkAdminAuth()`: Memeriksa session aktif pengguna melalui Supabase SSR, memverifikasi record di database Prisma (`role === 'admin'`), dan mencocokkan email terhadap `ADMIN_WHITELIST_EMAILS`. Mengembalikan objek sesi terpadu `AdminAuthSession` yang memuat baik `user` maupun `profile`.
2. `checkAdmin()`: Alias langsung untuk backward compatibility dengan seluruh rute admin lama.
3. `isUserAdmin(userId: string)`: Utilitas verifikasi hak akses admin berdasarkan ID pengguna untuk proteksi rute baca/hapus riwayat konsultasi.

### 5.3 Berkas API & Halaman yang Disederhanakan
Seluruh fungsi `checkAdmin` lokal yang duplikat telah dihapus dan dialihkan ke `src/lib/admin-auth.ts`:
- `src/app/api/admin/laptops/route.ts`
- `src/app/api/admin/laptops/[id]/route.ts`
- `src/app/api/admin/laptops/import/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/admin/banners/route.ts`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/questionnaire/route.ts`
- `src/app/api/admin/stats/route.ts`
- `src/app/admin/page.tsx`
- `src/app/api/recommendation/[id]/route.ts` (mengamankan otorisasi admin pada akses riwayat konsultasi silang pengguna)

---

## 6. Perbaikan Algoritma ROC & Validasi Kriteria Duplikat

### 6.1 Analisis Masalah
Algoritma pembobotan ROC (*Rank Order Centroid*) pada [`src/lib/roc.ts`](file:///C:/Users/mraja/OneDrive/文档/rekomendasi-laptop-next/src/lib/roc.ts) menggunakan rumus:
$$W_i = \frac{1}{K} \sum_{j=i}^{K} \frac{1}{j}$$
Jika sebuah request payload mengirimkan urutan kriteria yang memuat elemen duplikat (misal: `['C1', 'C1', 'C2', 'C3', 'C4', 'C5']`), perhitungan bobot akan menimpa kunci objek `result[code]` yang sama. Hal ini mengakibatkan jumlah total bobot tidak lagi mencapai `1.0000`, merusak akurasi pemeringkatan TOPSIS secara matematis.

### 6.2 Perbaikan yang Diterapkan
1. **Validasi Keunikan di `calculateRocWeights`**:
   - Ditambahkan pengecekan:
     ```typescript
     const uniqueCodes = new Set(orderedCriterionCodes);
     if (uniqueCodes.size !== k) {
       throw new Error('Input kriteria ROC tidak valid: ditemukan kriteria duplikat. Setiap kriteria harus unik.');
     }
     ```
2. **Fungsi Helper `isValidCriterionCodes`**:
   - Disediakan type guard untuk memeriksa integritas kriteria sebelum pemrosesan.
3. **Validasi Payload pada `/api/questionnaire` & `/api/questionnaire/guest`**:
   - Jika payload input memuat duplikasi kode kriteria, endpoint langsung mengembalikan respon `HTTP 400 Bad Request` dengan pesan penjelasan yang jelas kepada klien sebelum masuk ke kalkulasi database dan TOPSIS.

---

## 7. Audit Menyeluruh Endpoint Autentikasi dan Hak Akses

| Endpoint / Modul | Alur Autentikasi & Otorisasi | Status Audit |
|---|---|---|
| `POST /api/auth/register` | Input validation, validasi role via `sanitizeUserRole`, registrasi auto-confirm via Supabase Admin Client, sinkronisasi profil Prisma. | **AMAN (Verified)** |
| `POST /api/auth/login` | Validasi format email & password, rate limiting sliding window (maks. 5 percobaan per 15 menit per IP & email), Supabase cookie sync, auto-repair role. | **AMAN (Verified)** |
| `POST /api/auth/auto-confirm` | Konfirmasi otomatis email akun yang belum terverifikasi, sinkronisasi ke Prisma dengan sanitasi role. | **AMAN (Verified)** |
| `POST /api/auth/quick-google` | Simulasi login akun Google terverifikasi, role dipastikan 'mahasiswa' (non-admin), session exchange via magic link OTP. | **AMAN (Verified)** |
| `POST / GET /api/auth/signout` & `/logout` | Pembersihan session Supabase dan penghapusan menyeluruh cookie autentikasi browser (`sb-*`, `auth`, `supabase`). | **AMAN (Verified)** |
| `GET / PATCH /api/auth/profile` | Wajib login (`getUser()`), auto-create profile, proteksi integritas role admin terhadap `ADMIN_WHITELIST_EMAILS`. | **AMAN (Verified)** |
| `GET /auth/callback` | OAuth code exchange & recovery redirect handler, sinkronisasi user Google ke database Prisma. | **AMAN (Verified)** |
| `GET /api/history` | Terproteksi sesi user, query database difilter strictly dengan `where: { userId: user.id }`. Pengguna tidak dapat membaca riwayat user lain. | **AMAN (Verified)** |
| `GET / DELETE /api/recommendation/[id]` | Terproteksi sesi, memvalidasi kepemilikan konsultasi (`jawaban.userId === userId`). Jika diakses oleh pihak lain, diverifikasi menggunakan `isUserAdmin(userId)`. | **AMAN (Verified)** |
| `Route Group /api/admin/*` | Seluruh rute dilindungi `checkAdminAuth()` terpusat, wajib memiliki `profile.role === 'admin'` dan email terdaftar pada `ADMIN_WHITELIST_EMAILS`. | **AMAN (Verified)** |

---

## 8. Hasil Pengujian & Verifikasi Kestabilan Sistem

1. **Uji Algoritma ROC & Deteksi Duplikat**:
   - Uji normal: `npx tsx scripts/test-roc.ts` menghasilkan bobot tepat sesuai literatur ilmiah ($C_1=0.4083, C_2=0.2417, C_3=0.1583, C_4=0.1028, C_5=0.0611, C_6=0.0278$). Total bobot = $1.0000$.
   - Uji payload duplikat: Terverifikasi melempar error validasi yang tepat dan mencegah kalkulasi yang salah.
2. **Uji Koneksi Prisma & Supabase Admin**:
   - Inisialisasi Prisma Client berhasil membaca connection string dari environment dan membaca data 6 kriteria.
   - Inisialisasi Supabase Admin Client berhasil membaca `SUPABASE_SERVICE_ROLE_KEY` dari environment.
3. **Pemeriksaan TypeScript (`npx tsc --noEmit`)**:
   - Lulus kompilasi dengan kode exit `0` tanpa error tipe.
4. **Build Produksi Next.js 16 (`npm run build`)**:
   - Berhasil mengompilasi seluruh 35 halaman statis dan dinamis dengan lancar dalam 1.9 detik.

---

## 9. Kesimpulan & Langkah Selanjutnya

Fase 1 (Security Hardening) telah **selesai 100%** dengan seluruh objektif tercapai tanpa merusak fungsionalitas aplikasi, tanpa mengubah antarmuka pengguna, dan tanpa mengubah algoritma TOPSIS.

**Langkah Rekomendasi Berikutnya:**
1. Pengembang/pemilik proyek merotasi password database dan Service Role Key di dashboard Supabase seperti dianjurkan pada Bagian 2.2.
2. Memulai **Fase 2: Skema Basis Data & Persistensi** (penambahan indeks performa pada tabel `laptops` dan migrasi `banners.json` ke tabel database Prisma).
