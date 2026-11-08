// lib/prisma.ts - Singleton Prisma Client (Prisma 7 + @prisma/adapter-pg)
// Prisma 7 memerlukan adapter untuk koneksi database
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  if (!connectionString) {
    console.warn(
      '[Prisma] DATABASE_URL is not set. Database operations will require DATABASE_URL.'
    );
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres' }),
      log: ['error'],
    });
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
