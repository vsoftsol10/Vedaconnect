-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT,
    "profile_photo" TEXT,
    "business_name" TEXT,
    "business_category" TEXT,
    "business_description" TEXT,
    "business_location" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_plans" (
    "id" UUID NOT NULL,
    "plan_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "badge" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "billing_cycle" TEXT NOT NULL DEFAULT 'LIFETIME',
    "benefits" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "member_id" TEXT,
    "membership_type" TEXT NOT NULL DEFAULT 'FOUNDING_MEMBER',
    "membership_status" "MembershipStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_reference" TEXT,
    "joined_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_certificates" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "member_profiles_user_id_key" ON "member_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_plans_plan_code_key" ON "membership_plans"("plan_code");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_user_id_key" ON "memberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_member_id_key" ON "memberships"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_certificates_user_id_key" ON "business_certificates"("user_id");

-- AddForeignKey
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_certificates" ADD CONSTRAINT "business_certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
