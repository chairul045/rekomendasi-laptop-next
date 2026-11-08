import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const indexes = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
    SELECT
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
  `);

  console.log('--- CURRENT DATABASE INDEXES ---');
  indexes.forEach((idx) => {
    console.log(`[${idx.tablename}] ${idx.indexname}: ${idx.indexdef}`);
  });

  const columns = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
    SELECT
      table_name,
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `);

  console.log('\n--- CURRENT COLUMNS PER TABLE ---');
  const tableCols: Record<string, string[]> = {};
  columns.forEach((c) => {
    const t = String(c.table_name);
    if (!tableCols[t]) tableCols[t] = [];
    tableCols[t].push(`${String(c.column_name)} (${String(c.data_type)})`);
  });
  console.log(JSON.stringify(tableCols, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
