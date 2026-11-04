// src/data/service-shops.ts - Data direktori toko service laptop & diagnosis kerusakan
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
  startingPrice: number;
  imageUrl: string;
  mapsUrl: string;
}

export interface ServiceProblem {
  id: string;
  symptom: string;
  category: string;
  possibleCauses: string[];
  recommendedSolution: string;
  estimatedCostRange: string;
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
    estimatedCostRange: 'Rp 75.000 - Rp 150.000',
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
    estimatedCostRange: 'Rp 250.000 - Rp 650.000 (termasuk unit SSD)',
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
    estimatedCostRange: 'Rp 650.000 - Rp 1.450.000',
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
    estimatedCostRange: 'Rp 350.000 - Rp 850.000',
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
    estimatedCostRange: 'Rp 350.000 - Rp 750.000',
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
    estimatedCostRange: 'Rp 175.000 - Rp 350.000',
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
      estimatedCostRange: 'Rp 75.000 - Rp 150.000',
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
      estimatedCostRange: 'Rp 350.000 - Rp 850.000',
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
      estimatedCostRange: 'Rp 650.000 - Rp 1.450.000',
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
      recommendedSolution: 'Penggantian unit baterai baru original / OEM grade A+ bergaransi 3-6 bulan.',
      estimatedCostRange: 'Rp 350.000 - Rp 750.000',
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
        'Upgrade ke SSD M.2 NVMe PCIe / SATA SSD + Tambah RAM 8GB/16GB dual-channel (laptop terasa 5x lebih cepat).',
      estimatedCostRange: 'Rp 250.000 - Rp 650.000 (termasuk unit SSD/RAM)',
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
      estimatedCostRange: 'Rp 175.000 - Rp 350.000',
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
      estimatedCostRange: 'Rp 150.000 - Rp 300.000',
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
      'Pemeriksaan komponen secara gratis oleh teknisi mitra untuk memastikan letak kendala sebelum tindakan perbaikan.',
    estimatedCostRange: 'Mulai Rp 50.000 (Pengecekan Awal Gratis)',
    urgency: 'Sedang',
  };
}

export const SERVICE_SHOPS: ServiceShop[] = [
  // ── PALEMBANG ─────────────────────────────────────────────────────────────
  {
    id: 'shop-palembang-1',
    name: 'Palembang Laptop Specialist & Care Center',
    city: 'Palembang',
    area: 'PTC Mall & R. Sukamto',
    rating: 4.9,
    reviewCount: 320,
    phone: '081271889922',
    whatsapp: '6281271889922',
    address: 'Ruko PTC Mall Blok B No. 15, Jl. R. Sukamto No. 8, 8 Ilir, Kec. Ilir Timur II, Kota Palembang, Sumatera Selatan 30114',
    openHours: 'Setiap Hari: 09.30 - 21.00 WIB',
    isVerified: true,
    specialties: ['Mati Total & IC Power', 'Ganti LCD Express 1 Jam', 'Cleaning Thermal Paste', 'Upgrade SSD NVMe & RAM', 'Garansi Servis 90 Hari'],
    startingPrice: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80',
    mapsUrl: 'https://maps.google.com/?q=PTC+Mall+Palembang',
  },
  {
    id: 'shop-palembang-2',
    name: 'Wong Kito Laptop & Mac Specialist Palembang',
    city: 'Palembang',
    area: 'Bukit Besar & UNSRI Area',
    rating: 4.9,
    reviewCount: 265,
    phone: '082188776655',
    whatsapp: '6282188776655',
    address: 'Jl. Srijaya Negara No. 42 (Dekat Gerbang UNSRI Bukit), Bukit Lama, Kec. Ilir Barat I, Kota Palembang, Sumatera Selatan 30139',
    openHours: 'Senin - Sabtu: 09.00 - 20.30 WIB',
    isVerified: true,
    specialties: ['Spesialis Apple MacBook & Windows', 'Diskon Servis Khusus Mahasiswa', 'Ganti Keyboard & Baterai Tanam', 'Cek Kerusakan Gratis Tanpa Biaya'],
    startingPrice: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    mapsUrl: 'https://maps.google.com/?q=Srijaya+Negara+Unsri+Palembang',
  },

  // ── KOTA LAINNYA ──────────────────────────────────────────────────────────
  {
    id: 'shop-1',
    name: 'Lapmatch Partner: FixLaptop Express Center',
    city: 'Jakarta',
    area: 'Jakarta Pusat & Mangga Dua',
    rating: 4.9,
    reviewCount: 384,
    phone: '081289123456',
    whatsapp: '6281289123456',
    address: 'Mall Mangga Dua Lt. 3 Blok B No. 45-47, Sawah Besar, Jakarta Pusat',
    openHours: 'Senin - Sabtu: 10.00 - 19.30 WIB',
    isVerified: true,
    specialties: ['Mati Total & IC Power', 'Ganti LCD Express 1 Jam', 'Cleaning Thermal Paste', 'Upgrade SSD & RAM'],
    startingPrice: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80',
    mapsUrl: 'https://maps.google.com/?q=Mangga+Dua+Mall+Jakarta',
  },
  {
    id: 'shop-2',
    name: 'Bandung Laptop Specialist & Motherboard Lab',
    city: 'Bandung',
    area: 'Dago & ITB Area',
    rating: 4.9,
    reviewCount: 290,
    phone: '081398765432',
    whatsapp: '6281398765432',
    address: 'Jl. Dipati Ukur No. 88 (Dekat Kampus Unpad/ITB), Coblong, Bandung',
    openHours: 'Setiap Hari: 09.00 - 21.00 WIB',
    isVerified: true,
    specialties: ['Spesialis Motherboard Laptop Gaming', 'Ganti Engsel & Casing', 'Recovery Data Hardisk/SSD', 'Diskon Khusus Mahasiswa'],
    startingPrice: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    mapsUrl: 'https://maps.google.com/?q=Dipati+Ukur+Bandung',
  },
  {
    id: 'shop-3',
    name: 'Surabaya Tech Service & Mac Lab',
    city: 'Surabaya',
    area: 'Gubeng & ITS Area',
    rating: 4.8,
    reviewCount: 215,
    phone: '082155667788',
    whatsapp: '6282155667788',
    address: 'Jl. Dharmawangsa No. 62, Gubeng, Surabaya (Sebelah Kampus B Unair)',
    openHours: 'Senin - Sabtu: 09.00 - 20.00 WIB',
    isVerified: true,
    specialties: ['Spesialis Apple MacBook & Windows', 'Servis VGA Laptop Gaming', 'Cleaning Fan Ultra-Quiet', 'Ganti Baterai Original'],
    startingPrice: 70000,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    mapsUrl: 'https://maps.google.com/?q=Dharmawangsa+Surabaya',
  },
  {
    id: 'shop-4',
    name: 'Jogja Laptop Workshop & Upgrade Center',
    city: 'Yogyakarta',
    area: 'Sleman & UGM Area',
    rating: 4.9,
    reviewCount: 420,
    phone: '087811223344',
    whatsapp: '6287811223344',
    address: 'Jl. Kaliurang KM 5 No. 12B, Caturtunggal, Depok, Sleman, Yogyakarta',
    openHours: 'Setiap Hari: 08.30 - 21.00 WIB',
    isVerified: true,
    specialties: ['Gratis Konsultasi & Cek Kerusakan', 'Harga Mahasiswa Ramah Kantong', 'Ganti Keyboard & Baterai', 'Upgrade Dual SSD'],
    startingPrice: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    mapsUrl: 'https://maps.google.com/?q=Jl+Kaliurang+KM+5+Yogyakarta',
  },
  {
    id: 'shop-5',
    name: 'Medan Master Laptop & Component Repair',
    city: 'Medan',
    area: 'Medan Kota & USU',
    rating: 4.8,
    reviewCount: 178,
    phone: '085299887766',
    whatsapp: '6285299887766',
    address: 'Jl. Dr. Mansyur No. 40, Padang Bulan, Kec. Medan Baru, Kota Medan',
    openHours: 'Senin - Sabtu: 09.00 - 18.30 WIB',
    isVerified: true,
    specialties: ['Pengerjaan Bisa Ditunggu', 'Servis Laptop Bisnis & ThinkPad', 'Penggantian Port Charger Type-C / DC Jack', 'Garansi Service 90 Hari'],
    startingPrice: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
    mapsUrl: 'https://maps.google.com/?q=Dr+Mansyur+Medan',
  },
  {
    id: 'shop-6',
    name: 'Semarang Digital Care & Laptop Hub',
    city: 'Semarang',
    area: 'Tembalang & Undip Area',
    rating: 4.9,
    reviewCount: 192,
    phone: '081233445566',
    whatsapp: '6281233445566',
    address: 'Jl. Prof. Soedarto No. 15, Tembalang, Kota Semarang',
    openHours: 'Setiap Hari: 09.00 - 21.00 WIB',
    isVerified: true,
    specialties: ['Layanan Antar-Jemput Laptop', 'Install Ulang OS Original & Software', 'Upgrade SSD NVMe Bergaransi 3 Tahun', 'Servis Touchpad & Engsel'],
    startingPrice: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80',
    mapsUrl: 'https://maps.google.com/?q=Tembalang+Semarang',
  },
];
