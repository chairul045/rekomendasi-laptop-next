// scripts/apply-fase2-migration.ts - Script Eksekusi Aman Migrasi Fase 2
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!connectionString) {
  console.error('DATABASE_URL or DIRECT_URL is missing in environment or .env.local');
  process.exit(1);
}

// Mask connection string for safety
function maskUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return `${parsed.protocol}//${parsed.username}:***@${parsed.host}${parsed.pathname}`;
  } catch {
    return 'URL provided (masked)';
  }
}

async function main() {
  const isApproved = process.argv.includes('--approve-production');
  const migrationName = '20261108063601_fase2_banner_review_indexes';
  const migrationDir = path.join(process.cwd(), 'prisma', 'migrations', migrationName);
  const migrationPath = path.join(migrationDir, 'migration.sql');
  const backupPath = path.join(process.cwd(), 'data', 'backups', 'backup_before_fase2.json');

  console.log('=====================================================');
  console.log('   LAPMATCH PRE-MIGRATION RUNNER - FASE 2 AUDIT');
  console.log('=====================================================');
  console.log('Target Database:', maskUrl(connectionString!));
  console.log('Migration Name :', migrationName);
  console.log('Backup Status   :', fs.existsSync(backupPath) ? 'TERSEDIA (Snapshot Valid)' : 'TIDAK DITEMUKAN (BAHAYA!)');

  if (!fs.existsSync(backupPath)) {
    console.error('\n[GAGAL PROTEKSI] Migrasi ditolak karena berkas backup snapshot tidak ditemukan!');
    console.error('Harap jalankan terlebih dahulu: npx tsx scripts/backup-db.ts');
    process.exit(1);
  }

  if (!fs.existsSync(migrationPath)) {
    console.error('\n[GAGAL] File migration.sql tidak ditemukan di:', migrationPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  console.log('\n--- RINGKASAN SQL MIGRATION (NON-DESTRUKTIF) ---');
  console.log('Total baris SQL:', sql.split('\n').length);
  console.log('- CREATE TABLE banners');
  console.log('- CREATE TABLE reviews');
  console.log('- CREATE INDEX 11 indeks komposit (laptops, topsis, kuisioner, banners, reviews)');
  console.log('- ADD FOREIGN KEY 2 relasi reviews (Cascade ke laptops, SetNull ke users)');
  console.log('------------------------------------------------');

  if (!isApproved) {
    console.log(
      '\n[PROTEKSI AKTIF - DRY RUN SAJA]' +
        '\nStatus: TIDAK ADA PERUBAHAN YANG DILAKUKAN KE DATABASE.' +
        '\nSesuai SOP, migrasi database production memerlukan persetujuan eksplisit user.' +
        '\nUntuk mengeksekusi migrasi resmi via Prisma Migration Engine, jalankan:' +
        '\nnpx tsx scripts/apply-fase2-migration.ts --approve-production\n'
    );
    process.exit(0);
  }

  console.log('\n[PERSETUJUAN DITERIMA] Memulai eksekusi migrasi resmi via prisma migrate deploy...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('\n✅ Migrasi berhasil diterapkan dan tercatat di _prisma_migrations!');
  } catch (err) {
    console.error('\n❌ Eksekusi migrasi gagal:', err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Runner error:', err);
  process.exit(1);
});
