# Laporan Audit Pra-Migrasi Basis Data (Pre-Migration Audit Report)
## Fase 2: Database Improvement & Hardening - Proyek Lapmatch

**Tanggal Audit:** 8 November 2026  
**Auditor:** Antigravity AI Backend Assistant (`/replica-backend`)  
**Status Kesiapan Migrasi:** 🟢 **READY (Siap Eksekusi Menunggu Persetujuan Final)**  
**Target Basis Data:** PostgreSQL (Supabase Hosted via Transaction/Session Pooler)  
**Dokumen & Komponen yang Diaudit:**
- `replica/database-improvement-report.md`
- `prisma/migrations/20261108063601_fase2_banner_review_indexes/migration.sql`
- `scripts/apply-fase2-migration.ts`
- `scripts/backup-db.ts` & `scripts/restore-db.ts`
- `scripts/seed-fase2.ts`
- `prisma/schema.prisma`
- `src/lib/banner-store.ts`
- `src/app/api/reviews/route.ts` & `src/app/api/admin/reviews/route.ts`
- `src/app/admin/AdminReviewManager.tsx`

---

## 1. Ringkasan Hasil Audit

Audit pra-migrasi ini dilakukan untuk menjamin keandalan, keamanan, integritas data, dan kesiapan arsitektur sebelum berkas DDL SQL diterapkan ke basis data produksi. Pemeriksaan dilakukan secara statis dan non-intrusif (tanpa eksekusi DDL ke basis data produksi).

### Matriks Verifikasi Utama

| No | Parameter Verifikasi | Status | Catatan / Hasil Uji |
| :--- | :--- | :--- | :--- |
| 1 | **Kesesuaian `migration.sql` vs `schema.prisma`** | ✅ **IDENTIK (100%)** | Hasil `prisma migrate diff` dari live DB ke schema menghasilkan SQL yang identik persis dengan berkas migrasi |
| 2 | **Sifat Migrasi (Destruktif vs Non-Destruktif)** | ✅ **100% ADITIF** | Tidak ada `DROP TABLE`, `DROP COLUMN`, atau `ALTER TYPE`. Hanya `CREATE TABLE`, `CREATE INDEX`, dan `ADD FOREIGN KEY` |
| 3 | **Perlindungan Data Eksisting (2.284 Laptop, dsb.)** | ✅ **AMAN** | Data laptop, pengguna, kuesioner, bobot ROC, dan TOPSIS sama sekali tidak dimodifikasi oleh skrip migrasi |
| 4 | **Keabsahan & Uji Pemulihan Cadangan (Backup)** | ✅ **TERVERIFIKASI** | Format serialisasi `Date` telah diperbaiki menjadi ISO string valid, dan skrip pemulihan `scripts/restore-db.ts` telah diuji |
| 5 | **Keamanan Endpoint Review (Publik & Admin)** | ✅ **TERKUNCI & TERUJI** | Dilengkapi proteksi *rate limiting*, validasi panjang, sanitasi HTML, proteksi *role spoofing*, dan pengecekan keberadaan laptop |
| 6 | **Persistensi Banner di Lingkungan Produksi** | ✅ **TERVERIFIKASI** | Mode produksi menolak fallback diam-diam (*silent fallback*); operasi tulis gagal akan memicu *exception* yang terlaporkan |
| 7 | **Analisis Indeks & Potensi Duplikasi** | ✅ **BERSIH (0 Konflik)** | Audit `pg_indexes` membuktikan database hanya memiliki indeks primary/unique key lama. Tidak ada indeks ganda |
| 8 | **Proteksi Runner Migrasi Produksi** | ✅ **TERKUNCI** | Runner default beroperasi dalam mode *dry-run* aman, menampilkan URL tersensor, dan mewajibkan argumen `--approve-production` |
| 9 | **Penegakan Eksekusi Manual (No Auto-Run)** | ✅ **TERPENUHI** | Basis data remote tidak tersentuh DDL sama sekali sebelum persetujuan pengguna |

---

## 2. Temuan Audit Terperinci

### 2.1. Verifikasi Skema & Berkas DDL SQL
Uji diferensiasi basis data dijalankan menggunakan:
```bash
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```
**Hasil Evaluasi:**
- Pernyataan DDL yang dihasilkan oleh Prisma CLI menghasilkan 81 baris SQL yang identik karakter demi karakter dengan `prisma/migrations/20261108063601_fase2_banner_review_indexes/migration.sql`.
- Tabel baru: `banners` (20 kolom, primary key CUID) dan `reviews` (10 kolom, foreign key ke `laptops` dan `users`).
- Relasi integritas:
  - `reviews` $\to$ `laptops` (`ON DELETE CASCADE`): Menghapus laptop akan membersihkan ulasan terkait tanpa meninggalkan data yatim (*orphaned rows*).
  - `reviews` $\to$ `users` (`ON DELETE SET NULL`): Menghapus akun pengguna tidak merusak histori ulasan laptop (kolom `user_id` menjadi `NULL`, namun ulasan komunitas tetap ada).

### 2.2. Audit Indeks Basis Data (`pg_indexes`)
Pemeriksaan kueri langsung terhadap katalog sistem PostgreSQL `pg_indexes` menghasilkan data berikut:
- **Indeks Lama di Database:** Hanya terdapat 10 indeks yang merupakan `_pkey` (primary key) dan `unique` constraint (misalnya `users_email_key` dan `kriteria_kode_key`).
- **11 Indeks Baru yang Diusulkan:**
  1. `banners_is_active_sort_order_idx` (`is_active`, `sort_order`)
  2. `reviews_laptop_id_status_idx` (`laptop_id`, `status`)
  3. `reviews_user_id_idx` (`user_id`)
  4. `reviews_created_at_idx` (`created_at`)
  5. `bobot_kriteria_hasil_kuisioner_jawaban_id_idx` (`kuisioner_jawaban_id`)
  6. `hasil_topsis_kuisioner_jawaban_id_peringkat_idx` (`kuisioner_jawaban_id`, `peringkat`)
  7. `hasil_topsis_laptop_id_idx` (`laptop_id`)
  8. `kuisioner_jawaban_user_id_createdAt_idx` (`user_id`, `"createdAt"`)
  9. `laptops_condition_price_idx` (`condition`, `price`)
  10. `laptops_brand_idx` (`brand`)
  11. `penjelasan_ai_kuisioner_jawaban_id_idx` (`kuisioner_jawaban_id`)
- **Kesimpulan:** Tidak ada duplikasi atau konflik penamaan indeks. Penulisan nama kolom camelCase pada tabel lama (seperti `"createdAt"` pada `kuisioner_jawaban`) telah diproteksi dengan tanda petik ganda persis sesuai skema aslinya.

### 2.3. Audit Data Eksisting (2.284 Laptop & Riwayat TOPSIS)
- Jumlah laptop yang tercatat dalam database: **2.284 rekaman**.
- Jumlah pengguna aktif: **17 akun**.
- Jumlah riwayat kuesioner: **26 sesi**.
- Jumlah hasil kalkulasi TOPSIS: **1.587 rekaman**.
- Jumlah penjelasan AI: **123 rekaman**.
- **Kesimpulan:** Seluruh data ini 100% aman karena migrasi tidak menyentuh struktur data atau mengubah tipe data pada tabel-tabel di atas.

---

## 3. Daftar Masalah yang Ditemukan & Telah Diperbaiki

Selama proses audit pra-migrasi, tim mendeteksi 4 potensi kerentanan/masalah yang langsung diperbaiki sebelum migrasi dinyatakan layak:

### Masalah 1: Cacat Serialisasi Tanggal pada Cadangan (`backup-db.ts`)
- **Temuan:** Objek JavaScript `Date` saat di-serialize dengan `Object.entries(date)` menghasilkan array kosong `[]`, sehingga di dalam berkas `backup_before_fase2.json` kolom `createdAt` dan `updatedAt` tersimpan sebagai objek kosong `{}`.
- **Dampak:** Jika terjadi *disaster recovery*, timestamp asli record akan hilang.
- **Tindakan Perbaikan:**
  - Ditambahkan penanganan eksplisit `if (obj instanceof Date) return obj.toISOString();` pada fungsi serialisasi.
  - Snapshot cadangan telah dibuat ulang dan diverifikasi: timestamp ISO seperti `"2026-10-20T11:26:13.466Z"` kini tersimpan sempurna.
  - Dibuat skrip pemulihan darurat [`scripts/restore-db.ts`](file:///C:/Users/mraja/OneDrive/文档/rekomendasi-laptop-next/scripts/restore-db.ts).

### Masalah 2: Celah Keamanan pada Endpoint Review Publik (`/api/reviews`)
- **Temuan:**
  1. *Role Spoofing:* Pengguna tamu (guest) dapat mengirimkan `{ userRole: "Admin Lapmatch" }` di body JSON.
  2. *Payload Flooding:* Tidak ada batasan panjang ulasan (`comment`), berpotensi menyebabkan bloat data atau serangan DoS.
  3. *Unchecked Foreign Key:* Tidak ada verifikasi apakah `laptopId` benar-benar ada sebelum eksekusi insert, memicu error 500 DB raw.
  4. *Spamming:* Tidak ada pembatasan frekuensi pengiriman (rate limiting).
- **Tindakan Perbaikan di `src/app/api/reviews/route.ts`:**
  - Menetapkan default `reviewerRole = 'Mahasiswa'` untuk pengguna non-login (mencegah manipulasi role).
  - Menambahkan pembatasan panjang: `comment` maksimal 1.000 karakter, `userName` maksimal 60 karakter.
  - Menambahkan pembersihan tag HTML/XSS (`sanitizeText`).
  - Menambahkan pengecekan eksplisit `prisma.laptop.findUnique`, mengembalikan status 404 jika laptop tidak ditemukan.
  - Mengimplementasikan in-memory IP Rate Limiter (maksimal 5 ulasan per 10 menit per alamat IP).

### Masalah 3: Jebakan Silent Fallback pada `banner-store.ts` di Lingkungan Produksi
- **Temuan:** Blok `catch` pada operasi tulis (`addBanner`, `updateBanner`, `deleteBanner`, `toggleBannerStatus`) menangkap error DB dan diam-diam menyimpannya ke variabel memori lokal (`memoryBanners`), lalu mengembalikan status sukses.
- **Dampak Serverless:** Di hosting serverless seperti Vercel, memori bersifat *ephemeral*. Admin mengira banner tersimpan padahal hilang begitu instance *spin down*.
- **Tindakan Perbaikan:** Ditambahkan aturan ketat: jika `process.env.NODE_ENV === 'production'`, kegagalan operasi database ke PostgreSQL akan melempar *exception* eksplisit (`throw new Error(...)`) sehingga admin mengetahui jika terjadi gangguan koneksi database.

### Masalah 4: Sinkronisasi Status Migrasi Prisma pada Runner (`apply-fase2-migration.ts`)
- **Temuan:** Eksekusi langsung via `prisma.$executeRawUnsafe(sql)` tidak mencatatkan checksum migrasi ke tabel internal `_prisma_migrations`, berpotensi memicu *schema drift* pada deployment berikutnya.
- **Tindakan Perbaikan:** Skrip [`scripts/apply-fase2-migration.ts`](file:///C:/Users/mraja/OneDrive/文档/rekomendasi-laptop-next/scripts/apply-fase2-migration.ts) diperbarui agar mendelegasikan eksekusi resmi ke `npx prisma migrate deploy` ketika argumen `--approve-production` diberikan, sekaligus memvalidasi keberadaan file backup terlebih dahulu.

---

## 4. Potensi Risiko & Mitigasi

| Potensi Risiko | Tingkat Risiko | Dampak | Langkah Mitigasi yang Diterapkan |
| :--- | :---: | :--- | :--- |
| **Koneksi Database Timeout saat Membuat Indeks** | Rendah | Kueri pembuatan indeks pada 2.284 baris terputus | Jumlah data laptop sangat kecil (< 3.000 baris, memakan waktu < 0.2 detik). Tidak memerlukan `CONCURRENTLY` |
| **Kegagalan Eksekusi Parsial** | Rendah | Sebagian tabel terbuat, sebagian gagal | Eksekusi via `prisma migrate deploy` membungkus DDL dalam transaksi atomik PostgreSQL |
| **Tabel Banners Masih Kosong Pasca Migrasi** | Rendah | UI frontend tidak menampilkan slider iklan | Disediakan modul in-memory fallback transisi dan skrip seed [`scripts/seed-fase2.ts`](file:///C:/Users/mraja/OneDrive/文档/rekomendasi-laptop-next/scripts/seed-fase2.ts) |

---

## 5. Status Kesiapan Migrasi

> ### 🟢 KESIMPULAN: **READY** (Siap Dieksekusi)
> Seluruh prasyarat teknis, verifikasi konsistensi skema, proteksi keamanan kode, audit integritas data eksisting, dan berkas cadangan pemulihan telah **100% lengkap dan tervalidasi**.

---

## 6. Rekomendasi Langkah Eksekusi (Setelah Persetujuan)

Setelah Anda meninjau laporan ini dan memberikan persetujuan, berikut urutan eksekusi yang direkomendasikan:

```bash
# Langkah 1: Eksekusi migrasi resmi ke database PostgreSQL
npx tsx scripts/apply-fase2-migration.ts --approve-production

# Langkah 2: Lakukan verifikasi bahwa tabel baru telah terdaftar
npx tsx scripts/check-db.ts

# Langkah 3: Isi data awal banner promo dan ulasan mahasiswa
npx tsx scripts/seed-fase2.ts
```

Langkah rollback darurat (jika sewaktu-waktu dibutuhkan):
```bash
npx tsx scripts/restore-db.ts --confirm-restore
```
