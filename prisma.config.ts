// prisma.config.ts - Prisma 7 configuration file
// Prisma 7 memindahkan connection URL dari schema.prisma ke sini
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// URL direct untuk prisma migrate (bukan pgBouncer)
const directUrl =
  process.env.DIRECT_URL ??
  'postgresql://postgres.njnvkjhnefmawskhcbdy:Chairull003_@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: directUrl,
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      return new PrismaPg({ connectionString: directUrl });
    },
  },
});
