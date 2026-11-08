// prisma.config.ts - Prisma 7 configuration file
// Prisma 7 memindahkan connection URL dari schema.prisma ke sini
import path from 'node:path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

// URL direct untuk prisma migrate & prisma engine (bukan pgBouncer)
// Dibuat kondisional agar prisma generate pada fase build Vercel tidak crash saat env var belum tersedia
const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: directUrl ? { url: directUrl } : undefined,
});
