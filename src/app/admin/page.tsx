// src/app/admin/page.tsx - Halaman Dashboard Admin Terpusat Lapmatch
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminDashboardLayout from './AdminDashboardLayout';
import { checkAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const adminSession = await checkAdminAuth();

  if (!adminSession) {
    redirect('/login?callbackUrl=/admin');
  }

  const [laptops, totalUsers, totalConsultations] = await Promise.all([
    prisma.laptop.findMany({ orderBy: [{ brand: 'asc' }, { name: 'asc' }] }),
    prisma.user.count(),
    prisma.kuisionerJawaban.count(),
  ]);

  // Serialize BigInt
  const laptopsSerialized = laptops.map((l) => ({
    ...l,
    price: l.price.toString(),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  return (
    <AdminDashboardLayout
      initialLaptops={laptopsSerialized}
      stats={{ totalUsers, totalConsultations, totalLaptops: laptops.length }}
      adminName={adminSession.name}
    />
  );
}
