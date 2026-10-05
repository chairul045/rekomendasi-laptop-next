// app/admin/page.tsx - Halaman Admin: Manajemen Laptop
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminLaptopManager from './AdminLaptopManager';

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const profile = await prisma.user.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== 'admin') {
    redirect('/');
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
    <AdminLaptopManager
      initialLaptops={laptopsSerialized}
      stats={{ totalUsers, totalConsultations, totalLaptops: laptops.length }}
      adminName={profile.name}
    />
  );
}
