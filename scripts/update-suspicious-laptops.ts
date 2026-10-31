import prisma from '../src/lib/prisma';

async function updateSuspiciousLaptops() {
  const targetIds = [655, 702, 703, 705, 706];

  console.log('Fetching laptops before update:', targetIds);
  const before = await prisma.laptop.findMany({
    where: { id: { in: targetIds } },
    select: { id: true, name: true, price: true, condition: true, ramGb: true, storageGb: true }
  });

  console.log('Current data in Supabase:');
  console.dir(before, { depth: null });

  const result = await prisma.laptop.updateMany({
    where: { id: { in: targetIds }, condition: 'baru' },
    data: { condition: 'second' }
  });

  console.log(`Updated ${result.count} laptops to condition = 'second' in Supabase.`);

  const after = await prisma.laptop.findMany({
    where: { id: { in: targetIds } },
    select: { id: true, name: true, price: true, condition: true }
  });
  console.log('Verified data after update:');
  console.dir(after, { depth: null });
}

updateSuspiciousLaptops()
  .then(() => {
    console.log('Migration finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
