# 📁 Folder Katalog Laptop (`src/components/catalog/`)

Folder ini berisi komponen utama untuk tampilan eksplorasi dan katalog laptop publik.

## 🗂️ Berkas & Fitur
- **`LaptopCatalog.tsx`**: Komponen utama katalog laptop dengan fitur:
  - Pencarian real-time nama laptop & spesifikasi.
  - Filter brand (ASUS, Lenovo, HP, Acer, Apple, MSI, dll.).
  - Filter kondisi (Baru vs Second).
  - Filter rentang harga (slider & dropdown preset).
  - Sorting berdasarkan: Rekomendasi AI, Harga Termurah/Termahal, Performa Tertinggi.
  - Perbandingan laptop (Comparison Dock mengambang hingga 4 laptop).
  - Tombol favorit (Wishlist) dan buka modal detail/review.
- **`index.ts`**: Pusat ekspor untuk mempermudah pemanggilan dari `@/components/catalog`.
