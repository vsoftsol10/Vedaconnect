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
    "products_services" TEXT,
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
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "razorpay_signature" TEXT,
    "paid_at" TIMESTAMP(3),
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
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "about_event" TEXT,
    "image_url" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "event_date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "location" TEXT NOT NULL,
    "registration_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "registration_status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "payment_status" TEXT NOT NULL DEFAULT 'PENDING',
    "attendance_status" TEXT NOT NULL DEFAULT 'NOT_MARKED',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "event_registrations_user_id_event_id_key" ON "event_registrations"("user_id", "event_id");

-- AddForeignKey
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_certificates" ADD CONSTRAINT "business_certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

