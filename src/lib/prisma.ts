// lib/prisma.ts - Singleton Prisma Client (Prisma 7 + @prisma/adapter-pg)
// Prisma 7 memerlukan adapter untuk koneksi database
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.njnvkjhnefmawskhcbdy:Chairull003_@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
