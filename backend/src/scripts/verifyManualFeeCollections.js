import "dotenv/config";
import { prisma } from "../config/prismaClient.js";
import { createManualFeeCollection, deleteManualFeeCollection, getMonthlySummary } from "../services/expenseService.js";

// Usage: node src/scripts/verifyManualFeeCollections.js <hubId> <memberId> <adminId> [YYYY-MM]
// The script creates one temporary manual payment and always removes it before exiting.
const [hubId, memberId, adminId, month = new Date().toISOString().slice(0, 7)] = process.argv.slice(2);
if (!hubId || !memberId || !adminId) {
  console.error("Usage: node src/scripts/verifyManualFeeCollections.js <hubId> <memberId> <adminId> [YYYY-MM]");
  process.exit(1);
}

const date = `${month}-15`;
let paymentId;
try {
  const before = await getMonthlySummary(hubId, Number(month.slice(5)), Number(month.slice(0, 4)));
  const collection = await createManualFeeCollection({ hubId, memberId, date, meetingWeek: `${month}-06`, amount: 123.45, paymentMode: "CASH", note: "Temporary verification record" }, adminId);
  paymentId = collection.id;
  const after = await getMonthlySummary(hubId, Number(month.slice(5)), Number(month.slice(0, 4)));
  if (Math.round((after.manualCollected - before.manualCollected) * 100) !== 12345) throw new Error("Manual total is not decimal-safe.");
  if (Math.round((after.totalCollected - before.totalCollected) * 100) !== 12345) throw new Error("Total collected did not include the manual payment.");
  try {
    await createManualFeeCollection({ hubId, memberId, date, meetingWeek: `${month}-06`, amount: 123.45, paymentMode: "CASH" }, adminId);
    throw new Error("Duplicate manual fee was accepted.");
  } catch (error) {
    if (error.statusCode !== 409) throw error;
  }
  await deleteManualFeeCollection(paymentId);
  paymentId = null;
  const reset = await prisma.meetingFeePayment.findUnique({ where: { userId_month: { userId: memberId, month } } });
  if (reset?.paymentStatus !== "PENDING") throw new Error("Deletion did not return the fee to Pending.");
  console.log("Manual fee verification passed.");
} finally {
  if (paymentId) await deleteManualFeeCollection(paymentId).catch(() => {});
  await prisma.$disconnect();
}
