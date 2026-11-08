// prisma.config.ts - Prisma 7 configuration file
// Prisma 7 memindahkan connection URL dari schema.prisma ke sini
import path from 'node:path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

// URL direct untuk prisma migrate & prisma engine (bukan pgBouncer)
const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!directUrl) {
  throw new Error(
    'DIRECT_URL or DATABASE_URL environment variable is required. Please define it in .env.local or your environment.'
  );
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: directUrl,
  },
});
