CREATE TABLE "posters" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" VARCHAR(150) NOT NULL,
  "caption" TEXT,
  "category" VARCHAR(32) NOT NULL,
  "audience" VARCHAR(32) NOT NULL DEFAULT 'ALL_MEMBERS',
  "file_url" TEXT NOT NULL,
  "file_path" TEXT NOT NULL,
  "file_type" VARCHAR(16) NOT NULL,
  "mime_type" VARCHAR(100),
  "file_size_bytes" INTEGER,
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "is_pinned" BOOLEAN NOT NULL DEFAULT false,
  "published_at" TIMESTAMP(3),
  "created_by" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "posters_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "posters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "posters_is_published_is_pinned_published_at_idx" ON "posters"("is_published", "is_pinned", "published_at");
