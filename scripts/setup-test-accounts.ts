// scripts/setup-test-accounts.ts - Setup dedicated QA test accounts in Supabase Auth & Prisma
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { createAdminClient } from '../src/lib/supabase/admin';
import prisma from '../src/lib/prisma';

export const QA_USER = {
  email: 'qa-user-test@lapmatch.id',
  password: 'LapmatchTestUser123!',
  name: 'QA Regular Student',
  role: 'mahasiswa',
};

export const QA_ADMIN = {
  email: 'qa-admin-test@lapmatch.id',
  password: 'LapmatchTestAdmin123!',
  name: 'QA System Administrator',
  role: 'admin',
};

export async function setupAccounts() {
  console.log('--- Setting up dedicated QA test accounts in Supabase Auth & PostgreSQL ---');
  const admin = createAdminClient();

  const accounts = [QA_USER, QA_ADMIN];

  for (const acc of accounts) {
    try {
      const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
      let user = listData?.users?.find((u) => u.email?.toLowerCase() === acc.email.toLowerCase());

      if (!user) {
        console.log(`Creating ${acc.email} in Supabase Auth...`);
        const { data: created, error: createError } = await admin.auth.admin.createUser({
          email: acc.email,
          password: acc.password,
          email_confirm: true,
          user_metadata: {
            name: acc.name,
            role: acc.role,
          },
        });
        if (createError) throw createError;
        user = created.user;
      } else {
        console.log(`Updating password & confirmation for existing ${acc.email}...`);
        const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(user.id, {
          password: acc.password,
          email_confirm: true,
          user_metadata: {
            name: acc.name,
            role: acc.role,
          },
        });
        if (updateError) throw updateError;
        user = updated.user;
      }

      // Sync with Prisma database
      const existingDb = await prisma.user.findUnique({ where: { id: user.id } });
      if (!existingDb) {
        await prisma.user.create({
          data: {
            id: user.id,
            email: acc.email,
            name: acc.name,
            role: acc.role,
          },
        });
        console.log(`  -> Synced ${acc.email} to PostgreSQL prisma.user (role: ${acc.role})`);
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: acc.role,
            name: acc.name,
          },
        });
        console.log(`  -> Updated ${acc.email} in PostgreSQL prisma.user (role: ${acc.role})`);
      }
    } catch (err: any) {
      console.error(`Failed to setup account ${acc.email}:`, err.message);
      throw err;
    }
  }

  await prisma.$disconnect();
  console.log('✅ QA test accounts configured successfully!\n');
}

if (require.main === module) {
  setupAccounts().catch(async (e) => {
    console.error('Fatal setup error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
}
