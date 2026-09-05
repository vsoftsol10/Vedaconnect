import "dotenv/config";
import { prisma } from "../src/config/prismaClient.js";
import { resendPaymentInvoiceEmail } from "../src/services/invoiceService.js";

const isDryRun = process.argv.includes("--dry-run");

const loadPendingInvoices = () =>
  prisma.paymentInvoice.findMany({
    where: { emailedAt: null },
    orderBy: { createdAt: "asc" },
    include: {
      user: { include: { memberProfile: true, membership: true } },
    },
  });

const main = async () => {
  const invoices = await loadPendingInvoices();
  console.log(`[PENDING_INVOICES] count=${invoices.length} dryRun=${isDryRun}`);

  for (const invoice of invoices) {
    const membershipId =
      invoice.paymentType === "MEMBERSHIP"
        ? invoice.paymentRecordId
        : invoice.user.membership?.id || "";
    const memberName = invoice.user.memberProfile?.fullName || invoice.user.fullName || invoice.user.email;

    console.log(
      [
        `invoice=${invoice.invoiceNumber}`,
        `invoiceId=${invoice.id}`,
        `paymentType=${invoice.paymentType}`,
        `membershipId=${membershipId}`,
        `email=${invoice.user.email}`,
        `member=${memberName}`,
      ].join(" ")
    );

    if (isDryRun) continue;

    const before = invoice.emailedAt;
    const updated = await resendPaymentInvoiceEmail(invoice.id);
    if (updated?.emailedAt && !before) {
      console.log(`[RESEND_OK] invoice=${invoice.invoiceNumber} email=${invoice.user.email}`);
    } else {
      console.log(`[RESEND_SKIPPED_OR_FAILED] invoice=${invoice.invoiceNumber} email=${invoice.user.email}`);
    }
  }
};

main()
  .catch((error) => {
    console.error("[RESEND_PENDING_INVOICES_FAILED]", {
      message: error?.message,
      stack: error?.stack,
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
