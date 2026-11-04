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

export const SERVICE_SHOPS: ServiceShop[] = [
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
