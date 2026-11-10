// src/data/service-shops.ts - Data toko service laptop tunggal & diagnosis kerusakan
export interface ServiceShop {
  id: string;
  name: string;
  city: string;
  area: string;
  rating: number;
  reviewCount: number;
  phone: string;
  whatsapp: string;
  address: string;
  openHours: string;
  isVerified: boolean;
  specialties: string[];
  startingPrice?: number;
  imageUrl: string;
  mapsUrl: string;
  websiteUrl?: string;
}

export interface ServiceProblem {
  id: string;
  symptom: string;
  category: string;
  possibleCauses: string[];
  recommendedSolution: string;
  urgency: 'Ringan' | 'Sedang' | 'Kritis';
}

export const POPULAR_PROBLEMS: ServiceProblem[] = [
  {
    id: 'p1',
    symptom: 'Laptop Panas / Kipas Berisik / Tiba-tiba Mati saat Dipakai',
    category: 'Sistem Pendingin & Thermal',
    possibleCauses: [
      'Thermal paste sudah kering atau mengeras',
      'Debu tebal menyumbat heatsink dan baling-baling kipas',
      'Bearing kipas pendingin aus',
    ],
    recommendedSolution: 'Deep Cleaning debu + Re-pasting Thermal Paste kualitas tinggi (Arctic MX-4 / Thermal Grizzly).',
    urgency: 'Sedang',
  },
  {
    id: 'p2',
    symptom: 'Laptop Lemot, Booting Lambat, Sering Not Responding',
    category: 'Storage & RAM',
    possibleCauses: [
      'Masih menggunakan Hardisk (HDD) piringan lama',
      'Kapasitas RAM tidak mencukupi untuk multitasking',
      'Kesehatan SSD/HDD menurun (bad sector)',
    ],
    recommendedSolution: 'Migrasi & Upgrade ke SSD NVMe / SATA PCIe + Penambahan RAM DDR4/DDR5 dual-channel.',
    urgency: 'Ringan',
  },
  {
    id: 'p3',
    symptom: 'Layar LCD Bergaris, Flicker, Retak, atau Blank Hitam',
    category: 'Layar & Display',
    possibleCauses: [
      'Panel LCD pecah atau tertekan di dalam tas',
      'Kabel fleksibel eDP LCD terjepit / robek di engsel',
      'Jalur backlight LCD atau IC display bermasalah',
    ],
    recommendedSolution: 'Penggantian panel LCD original baru (HD / FHD IPS) atau perbaikan kabel fleksibel engsel.',
    urgency: 'Kritis',
  },
  {
    id: 'p4',
    symptom: 'Laptop Mati Total (Matot), Tidak Merespon saat Dicas',
    category: 'Motherboard & Power IC',
    possibleCauses: [
      'Konsleting pada jalur power 19V / 3V / 5V',
      'IC Charger / MOSFET terbakar akibat lonjakan arus listrik',
      'Korosi akibat terkena cairan (water damage)',
    ],
    recommendedSolution: 'Diagnosa skematik motherboard, injeksi tegangan, & penggantian komponen IC/MOSFET micro-soldering.',
    urgency: 'Kritis',
  },
  {
    id: 'p5',
    symptom: 'Baterai Cepat Habis (Drop) atau Harus Selalu Dicolok Casan',
    category: 'Baterai & Pengisian',
    possibleCauses: [
      'Health baterai sudah di bawah 50% atau siklus charging habis',
      'Salah satu cell baterai Lithium-Ion menggembung / kembung',
    ],
    recommendedSolution: 'Ganti baterai OEM / Original bergaransi baru + kalibrasi pengisian daya baterai.',
    urgency: 'Sedang',
  },
  {
    id: 'p6',
    symptom: 'Keyboard Mengetik Sendiri, Tombol Lepas, atau Tidak Berfungsi',
    category: 'Input & Aksesoris',
    possibleCauses: [
      'Jalur membran keyboard lembap / putus',
      'Kotoran remah makanan / tumpahan air',
    ],
    recommendedSolution: 'Penggantian satu set keyboard internal laptop (tipe tanam maupun clip-on).',
    urgency: 'Ringan',
  },
];

export function diagnoseCustomProblem(description: string, brand?: string): ServiceProblem {
  const text = (description + ' ' + (brand || '')).toLowerCase();

  if (
    text.includes('panas') ||
    text.includes('hangat') ||
    text.includes('kipas') ||
    text.includes('berisik') ||
    text.includes('thermal') ||
    text.includes('pasta') ||
    text.includes('overheat') ||
    text.includes('mati sendiri') ||
    text.includes('mati mendadak')
  ) {
    return {
      id: 'custom-thermal',
      symptom: description,
      category: 'Sistem Pendingin & Thermal Overheat',
      possibleCauses: [
        'Thermal paste processor/GPU sudah kering mengeras',
        'Sirip heatsink dan lubang pembuangan tersumbat gumpalan debu',
        'Kipas pendingin kotor atau putaran RPM melemah',
      ],
      recommendedSolution:
        'Deep Cleaning sistem pendingin & ganti thermal paste konduktivitas tinggi (Arctic MX-4/Thermal Grizzly).',
      urgency: 'Sedang',
    };
  }

  if (
    text.includes('mati') ||
    text.includes('matot') ||
    text.includes('konslet') ||
    text.includes('gak nyala') ||
    text.includes('tidak nyala') ||
    text.includes('air') ||
    text.includes('tumpah') ||
    text.includes('ic') ||
    text.includes('motherboard') ||
    text.includes('bau gosong') ||
    text.includes('asap')
  ) {
    return {
      id: 'custom-power',
      symptom: description,
      category: 'Motherboard, Power IC & Korsleting',
      possibleCauses: [
        'Konsleting pada jalur power supply 19V / 3.3V / 5V',
        'IC Power / MOSFET terbakar akibat lonjakan arus atau adaptor rusak',
        'Korosi jalur tembaga motherboard akibat kelembapan / tumpahan cairan',
      ],
      recommendedSolution:
        'Pemeriksaan skematik motherboard, injeksi tegangan, perbaikan jalur putus, dan micro-soldering IC.',
      urgency: 'Kritis',
    };
  }

  if (
    text.includes('layar') ||
    text.includes('lcd') ||
    text.includes('garis') ||
    text.includes('retak') ||
    text.includes('pecah') ||
    text.includes('flicker') ||
    text.includes('kedip') ||
    text.includes('blank') ||
    text.includes('gelap') ||
    text.includes('bintik')
  ) {
    return {
      id: 'custom-lcd',
      symptom: description,
      category: 'Layar LCD & Kabel Fleksibel',
      possibleCauses: [
        'Panel LCD rusak/retak akibat tekanan atau benturan',
        'Kabel fleksibel eDP terjepit di engsel laptop',
        'Komponen backlight atau inverter LED mati',
      ],
      recommendedSolution: 'Ganti panel LCD original bergaransi baru atau perbaikan kabel fleksibel engsel.',
      urgency: 'Kritis',
    };
  }

  if (
    text.includes('baterai') ||
    text.includes('battery') ||
    text.includes('drop') ||
    text.includes('bocor') ||
    text.includes('kembung') ||
    text.includes('colok terus') ||
    text.includes('charger') ||
    text.includes('ngecas')
  ) {
    return {
      id: 'custom-battery',
      symptom: description,
      category: 'Baterai & Sistem Pengisian Daya',
      possibleCauses: [
        'Kesehatan baterai (battery health) sudah di bawah 50%',
        'Cell baterai membengkak dan kehilangan kapasitas simpan daya',
        'Port colokan charging (DC Jack / USB-C) longgar atau pin bengkok',
      ],
      recommendedSolution: 'Penggantian unit baterai baru original / OEM grade A+ bergaransi resmi toko.',
      urgency: 'Sedang',
    };
  }

  if (
    text.includes('lemot') ||
    text.includes('lambat') ||
    text.includes('lelet') ||
    text.includes('hang') ||
    text.includes('not responding') ||
    text.includes('hardisk') ||
    text.includes('hdd') ||
    text.includes('ssd') ||
    text.includes('ram') ||
    text.includes('penuh') ||
    text.includes('loading')
  ) {
    return {
      id: 'custom-storage',
      symptom: description,
      category: 'Upgrade Kecepatan Storage & RAM',
      possibleCauses: [
        'Masih menggunakan Hard Disk Drive (HDD) mekanik yang lambat',
        'Kapasitas RAM penuh akibat aplikasi kuliah/browsing modern',
        'File sampah cache sistem dan penumpukan aplikasi startup',
      ],
      recommendedSolution:
        'Upgrade ke SSD M.2 NVMe PCIe / SATA SSD + Tambah RAM 8GB/16GB dual-channel (laptop terasa jauh lebih responsif).',
      urgency: 'Ringan',
    };
  }

  if (
    text.includes('keyboard') ||
    text.includes('tombol') ||
    text.includes('ngetik sendiri') ||
    text.includes('macet') ||
    text.includes('touchpad') ||
    text.includes('kursor')
  ) {
    return {
      id: 'custom-keyboard',
      symptom: description,
      category: 'Keyboard & Input Device',
      possibleCauses: [
        'Jalur membran sirkuit keyboard korslet / kemasukan debu',
        'Keycaps patah atau switch karet mengeras',
      ],
      recommendedSolution: 'Ganti keyboard laptop original baru (tersedia tipe tanam maupun modular).',
      urgency: 'Ringan',
    };
  }

  if (
    text.includes('engsel') ||
    text.includes('casing') ||
    text.includes('baut') ||
    text.includes('patah') ||
    text.includes('mangap') ||
    text.includes('renggang')
  ) {
    return {
      id: 'custom-hinge',
      symptom: description,
      category: 'Struktur Engsel & Casing Body',
      possibleCauses: [
        'Dudukan baut engsel plastik pecah akibat engsel terlalu kencang',
        'Laptop pernah terbentur atau dibuka paksa dari satu sisi',
      ],
      recommendedSolution: 'Rekonstruksi dudukan engsel dengan lem resin baja & kalibrasi kelenturan engsel agar awet.',
      urgency: 'Sedang',
    };
  }

  // General fallback
  return {
    id: 'custom-general',
    symptom: description,
    category: 'Pemeriksaan Kerusakan Menyeluruh (General Checkup)',
    possibleCauses: [
      'Kemungkinan gangguan software/driver atau degradasi komponen hardware internal',
      'Perlu pengecekan fisik langsung oleh teknisi menggunakan multimeter & software diagnostik',
    ],
    recommendedSolution:
      'Pemeriksaan komponen secara menyeluruh oleh teknisi LaptopSeber Palembang untuk memastikan titik kendala.',
    urgency: 'Sedang',
  };
}

// Hanya satu toko resmi: LaptopSeber Palembang
export const LAPTOPSEBER_SHOP: ServiceShop = {
  id: 'laptopseber-palembang',
  name: 'LaptopSeber Palembang',
  city: 'Palembang',
  area: 'DC Kuliner Pakjo, Palembang',
  rating: 5.0,
  reviewCount: 385,
  phone: '081368583338',
  whatsapp: '6281368583338',
  address: 'DC Kuliner Pakjo, Kota Palembang, Sumatera Selatan',
  openHours: 'Buka Setiap Hari: 10.00 – 20.00 WIB',
  isVerified: true,
  specialties: [
    'Pusat Laptop Second Bergaransi Resmi Toko di Palembang',
    'Servis Laptop Mati Total, Korsleting & IC Power',
    'Ganti LCD Express, Baterai Original, Keyboard & Engsel',
    'Deep Cleaning Heatsink Fan & Re-pasting Thermal Paste',
    'Upgrade SSD NVMe & RAM Bergaransi',
    'Layanan Lacak Status Servis Online (Tracking Servis)',
  ],
  imageUrl: '/images/laptops/laptopseber/lenovo-thinkpad-t480.jpg',
  mapsUrl: 'https://maps.app.goo.gl/sM6fWqBBvyDjiq319',
  websiteUrl: 'https://laptopseber.com',
};

export const SERVICE_SHOPS: ServiceShop[] = [LAPTOPSEBER_SHOP];
