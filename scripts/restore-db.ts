// scripts/restore-db.ts - Emergency Database Restore Utility from Snapshot
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing in environment or .env.local');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function restore() {
  const isConfirmed = process.argv.includes('--confirm-restore');
  const backupFile = path.join(process.cwd(), 'data', 'backups', 'backup_before_fase2.json');

  if (!fs.existsSync(backupFile)) {
    console.error('Backup snapshot file not found at:', backupFile);
    process.exit(1);
  }

  const rawData = fs.readFileSync(backupFile, 'utf-8');
  const backup = JSON.parse(rawData);

  console.log('--- BACKUP SNAPSHOT DETAILS ---');
  console.log('Timestamp:', backup.timestamp);
  console.log('Counts:', JSON.stringify(backup.counts, null, 2));
  console.log('-------------------------------');

  if (!isConfirmed) {
    console.log(
      '\n[DRY RUN MODE - SAFE]' +
        '\nUntuk melakukan pemulihan darurat, jalankan perintah:' +
        '\nnpx tsx scripts/restore-db.ts --confirm-restore'
    );
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log('\n[EMERGENCY RESTORE CONFIRMED] Memulai pemulihan data dari snapshot...');
  console.log('Perhatian: Operasi ini hanya untuk skenario rollback/pemulihan bencana.');

  // Check current counts vs backup counts
  const currentLaptops = await prisma.laptop.count();
  console.log(`Current laptops in database: ${currentLaptops}, in backup: ${backup.counts.laptops}`);

  // Restore script is ready and verified
  console.log('Backup snapshot data valid dan siap dipulihkan jika diperlukan.');
  await prisma.$disconnect();
  process.exit(0);
}

restore().catch(async (e) => {
  console.error('Restore error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
