import { getAllBanners, getActiveBanners, DEFAULT_BANNERS } from '../src/lib/banner-store';

async function verify() {
  console.log('=== VERIFIKASI INTEGRITAS DATA BANNER ===');
  console.log('Total DEFAULT_BANNERS:', DEFAULT_BANNERS.length);
  
  DEFAULT_BANNERS.forEach((b, i) => {
    console.log(`[Banner ${i + 1}]`);
    console.log(`  ID          : ${b.id}`);
    console.log(`  Title       : ${b.title}`);
    console.log(`  Brand       : ${b.brand}`);
    console.log(`  Price       : Rp ${b.price.toLocaleString('id-ID')} (Asli: Rp ${b.originalPrice.toLocaleString('id-ID')})`);
    console.log(`  Discount    : ${b.discount}`);
    console.log(`  Badge       : ${b.badge}`);
    console.log(`  Specs       : ${b.processor} | ${b.vga} | RAM ${b.ramGb}GB | SSD ${b.storageGb}GB | ${b.display}`);
    console.log(`  Links       : Tokopedia: ${b.tokopediaUrl || '-'} | Shopee: ${b.shopeeUrl || '-'}`);
    console.log(`  Is Active   : ${b.isActive}`);
  });

  const allBanners = await getAllBanners();
  console.log('\n--- DATA DARI POSTGRESQL / STORE ---');
  console.log('Total Banners di Store/Database:', allBanners.length);
  const activeBanners = await getActiveBanners();
  console.log('Total Banner Aktif             :', activeBanners.length);
  
  // Verifikasi ke-6 banner terbaru ada
  const expectedTitles = [
    'ASUS VivoBook 15 OLED',
    'Lenovo LOQ 15 Gaming',
    'Apple MacBook Air M3 15-inch',
    'Acer Swift Go 14 AI',
    'Lenovo ThinkPad T490',
    'Lapmatch Care: Paket Servis Kilat'
  ];

  let allFound = true;
  for (const exp of expectedTitles) {
    const found = DEFAULT_BANNERS.some(b => b.title.includes(exp));
    if (found) {
      console.log(`✅ [FOUND] ${exp}`);
    } else {
      console.log(`❌ [MISSING] ${exp}`);
      allFound = false;
    }
  }

  if (allFound) {
    console.log('\n🎉 Seluruh 6 Banner Mahasiswa Terbaru Sempurna & Lengkap!');
  } else {
    console.error('\n⚠️ Ada banner yang hilang!');
    process.exit(1);
  }
}

verify().catch((err) => {
  console.error('Verifikasi gagal:', err);
  process.exit(1);
});
