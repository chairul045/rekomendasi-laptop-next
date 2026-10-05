-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'mahasiswa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laptops" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "performa_komposit" INTEGER,
    "processor_score" INTEGER,
    "vga_score" INTEGER,
    "ram_gb" INTEGER,
    "storage_gb" INTEGER,
    "display_size" DOUBLE PRECISION,
    "battery_hours" DOUBLE PRECISION,
    "weight_kg" DOUBLE PRECISION,
    "mobility_score" INTEGER,
    "category" TEXT,
    "image" TEXT,
    "image_url" TEXT,
    "condition" TEXT NOT NULL DEFAULT 'baru',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laptops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kriteria" (
    "id" SERIAL NOT NULL,
    "kode" VARCHAR(10) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "tipe" TEXT NOT NULL DEFAULT 'benefit',
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kuisioner_jawaban" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "budget_min" BIGINT NOT NULL DEFAULT 0,
    "budget_max" BIGINT NOT NULL DEFAULT 50000000,
    "peruntukan" TEXT NOT NULL DEFAULT 'Kuliah',
    "ranking_kriteria" JSONB NOT NULL,
    "merek_pilihan" JSONB NOT NULL,
    "kondisi_pilihan" TEXT NOT NULL DEFAULT 'keduanya',
    "frekuensi_membawa" TEXT,
    "judul" TEXT,
    "tanggal_pengisian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kuisioner_jawaban_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bobot_kriteria_hasil" (
    "id" SERIAL NOT NULL,
    "kuisioner_jawaban_id" INTEGER NOT NULL,
    "kriteria_id" INTEGER NOT NULL,
    "prioritas" INTEGER NOT NULL,
    "bobot" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bobot_kriteria_hasil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hasil_topsis" (
    "id" SERIAL NOT NULL,
    "kuisioner_jawaban_id" INTEGER NOT NULL,
    "laptop_id" INTEGER NOT NULL,
    "kondisi" TEXT NOT NULL,
    "nilai_v" DOUBLE PRECISION NOT NULL,
    "peringkat" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hasil_topsis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penjelasan_ai" (
    "id" SERIAL NOT NULL,
    "kuisioner_jawaban_id" INTEGER NOT NULL,
    "laptop_id" INTEGER NOT NULL,
    "penjelasan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penjelasan_ai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "kriteria_kode_key" ON "kriteria"("kode");

-- AddForeignKey
ALTER TABLE "kuisioner_jawaban" ADD CONSTRAINT "kuisioner_jawaban_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bobot_kriteria_hasil" ADD CONSTRAINT "bobot_kriteria_hasil_kuisioner_jawaban_id_fkey" FOREIGN KEY ("kuisioner_jawaban_id") REFERENCES "kuisioner_jawaban"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bobot_kriteria_hasil" ADD CONSTRAINT "bobot_kriteria_hasil_kriteria_id_fkey" FOREIGN KEY ("kriteria_id") REFERENCES "kriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_topsis" ADD CONSTRAINT "hasil_topsis_kuisioner_jawaban_id_fkey" FOREIGN KEY ("kuisioner_jawaban_id") REFERENCES "kuisioner_jawaban"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_topsis" ADD CONSTRAINT "hasil_topsis_laptop_id_fkey" FOREIGN KEY ("laptop_id") REFERENCES "laptops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penjelasan_ai" ADD CONSTRAINT "penjelasan_ai_kuisioner_jawaban_id_fkey" FOREIGN KEY ("kuisioner_jawaban_id") REFERENCES "kuisioner_jawaban"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penjelasan_ai" ADD CONSTRAINT "penjelasan_ai_laptop_id_fkey" FOREIGN KEY ("laptop_id") REFERENCES "laptops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
