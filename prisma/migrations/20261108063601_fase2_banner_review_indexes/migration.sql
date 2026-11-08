-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "original_price" BIGINT NOT NULL,
    "discount" TEXT NOT NULL DEFAULT '',
    "badge" TEXT NOT NULL DEFAULT '',
    "processor" TEXT NOT NULL DEFAULT '',
    "vga" TEXT NOT NULL DEFAULT '',
    "ram_gb" INTEGER NOT NULL DEFAULT 0,
    "storage_gb" INTEGER NOT NULL DEFAULT 0,
    "display" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT NOT NULL,
    "tokopedia_url" TEXT,
    "shopee_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "laptop_id" INTEGER NOT NULL,
    "user_id" TEXT,
    "user_name" TEXT NOT NULL,
    "user_role" TEXT NOT NULL DEFAULT 'Mahasiswa',
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banners_is_active_sort_order_idx" ON "banners"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "reviews_laptop_id_status_idx" ON "reviews"("laptop_id", "status");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_created_at_idx" ON "reviews"("created_at");

-- CreateIndex
CREATE INDEX "bobot_kriteria_hasil_kuisioner_jawaban_id_idx" ON "bobot_kriteria_hasil"("kuisioner_jawaban_id");

-- CreateIndex
CREATE INDEX "hasil_topsis_kuisioner_jawaban_id_peringkat_idx" ON "hasil_topsis"("kuisioner_jawaban_id", "peringkat");

-- CreateIndex
CREATE INDEX "hasil_topsis_laptop_id_idx" ON "hasil_topsis"("laptop_id");

-- CreateIndex
CREATE INDEX "kuisioner_jawaban_user_id_createdAt_idx" ON "kuisioner_jawaban"("user_id", "createdAt");

-- CreateIndex
CREATE INDEX "laptops_condition_price_idx" ON "laptops"("condition", "price");

-- CreateIndex
CREATE INDEX "laptops_brand_idx" ON "laptops"("brand");

-- CreateIndex
CREATE INDEX "penjelasan_ai_kuisioner_jawaban_id_idx" ON "penjelasan_ai"("kuisioner_jawaban_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_laptop_id_fkey" FOREIGN KEY ("laptop_id") REFERENCES "laptops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
