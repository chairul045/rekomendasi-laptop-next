import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const migrations = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    'SELECT id, migration_name, applied_steps_count, finished_at FROM _prisma_migrations'
  );
  console.log('Applied migrations:', migrations);
  await prisma.$disconnect();
}

main().catch(console.error);
