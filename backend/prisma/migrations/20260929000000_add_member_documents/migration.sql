ALTER TABLE "business_certificates" ADD COLUMN "title" TEXT;
ALTER TABLE "business_certificates" ADD COLUMN "document_type" TEXT NOT NULL DEFAULT 'BUSINESS_CERTIFICATE';
