// scripts/backup-db.ts - Database Snapshot Backup
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing in environment or .env.local');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function backup() {
  console.log('Starting database backup snapshot...');
  const [users, laptops, kriteria, kuisioner, bobot, topsis, ai] = await Promise.all([
    prisma.user.findMany(),
    prisma.laptop.findMany(),
    prisma.kriteria.findMany(),
    prisma.kuisionerJawaban.findMany(),
    prisma.bobotKriteriaHasil.findMany(),
    prisma.hasilTopsis.findMany(),
    prisma.penjelasanAi.findMany(),
  ]);

  const serialize = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(serialize);
    if (typeof obj === 'object') {
      return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serialize(v)]));
    }
    return obj;
  };

  const data = {
    timestamp: new Date().toISOString(),
    counts: {
      users: users.length,
      laptops: laptops.length,
      kriteria: kriteria.length,
      kuisioner: kuisioner.length,
      bobot: bobot.length,
      topsis: topsis.length,
      ai: ai.length,
    },
    tables: serialize({ users, laptops, kriteria, kuisioner, bobot, topsis, ai }),
  };

  const backupDir = path.join(process.cwd(), 'data', 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, 'backup_before_fase2.json');
  fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf-8');

  console.log('Database backup successfully created at:', backupFile);
  console.log('Record counts:', JSON.stringify(data.counts));
  await prisma.$disconnect();
  process.exit(0);
}

backup().catch(async (e) => {
  console.error('Backup failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
