import { prisma } from "../src/config/prismaClient.js";

// Read-only review of application rows that point at a user which no longer
// exists. The fixed table/column list is derived from prisma/schema.prisma.
const relationships = [
  ["member_profiles", "user_id"],
  ["memberships", "user_id"],
  ["business_certificates", "user_id"],
  ["event_registrations", "user_id"],
  ["notifications", "user_id"],
  ["notifications", "related_user_id"],
  ["birthday_reminders", "member_id"],
  ["manual_payment_submissions", "user_id"],
  ["referrals_given", "giver_id"],
  ["referrals_given", "receiver_id"],
  ["business_received", "receiver_id"],
  ["business_received", "referrer_id"],
  ["meeting_attendance", "user_id"],
  ["meeting_fee_payments", "user_id"],
  ["payment_invoices", "user_id"],
  ["expenses", "created_by"],
  ["notification_logs", "member_id"],
  ["whatsapp_delivery_logs", "member_id"],
  ["email_delivery_logs", "member_id"],
];

try {
  const results = [];
  for (const [table, column] of relationships) {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT t."id"::text AS "id", t."${column}"::text AS "missingUserId" FROM "${table}" t LEFT JOIN "users" u ON u."id" = t."${column}" WHERE t."${column}" IS NOT NULL AND u."id" IS NULL ORDER BY t."id" LIMIT 100`
    );
    if (rows.length) results.push({ table, column, rows });
  }
  console.log(JSON.stringify({ orphanRelationships: results, note: "No output rows means no orphan foreign-key references were found. memberships.member_id is a legacy member-code field, not a User foreign key." }, null, 2));
} finally {
  await prisma.$disconnect();
}
