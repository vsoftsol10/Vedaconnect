import "dotenv/config";
import crypto from "crypto";
import { prisma } from "../src/config/prismaClient.js";

const BASE_URL = process.env.MEMBERSHIP_REGRESSION_BASE_URL || "http://localhost:5001/api";
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const email = `qa.membership.${stamp}@example.com`;
const results = [];
let userId;

const record = (name, ok, note = "") => {
  results.push({ name, ok, note });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${note ? ` - ${note}` : ""}`);
};

const request = async (method, path, body) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json().catch(() => null);
  return { response, json };
};

const main = async () => {
  const personal = await request("POST", "/onboarding/personal-details", {
    fullName: "QA Membership Regression",
    email,
    phone: "9876543210",
    location: "Tirunelveli",
  });
  userId = personal.json?.data?.userId;
  record("step 1 personal details", personal.response.ok && Boolean(userId), personal.json?.message || userId);

  const business = await request("PUT", "/onboarding/business-details", {
    userId,
    businessName: "QA Membership Co",
    businessCategory: "Professional Services",
    businessLocation: "Tirunelveli",
    businessDescription: "Regression test business",
  });
  record("step 2 business details", business.response.ok, business.json?.message || userId);

  const membership = await request("POST", "/onboarding/membership", {
    userId,
    planCode: "FOUNDING_MEMBER",
  });
  record("step 4 membership selection", membership.response.ok, membership.json?.message || membership.json?.data?.planCode);

  const order = await request("POST", "/onboarding/payment/create-order", { userId });
  const orderId = order.json?.data?.orderId;
  record("step 5 creates Razorpay order", order.response.ok && Boolean(orderId), order.json?.message || orderId);

  if (!orderId) return;

  const fakePaymentId = `pay_membership_${stamp}`;
  const signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${fakePaymentId}`)
    .digest("hex");

  const verify = await request("POST", "/onboarding/payment/verify", {
    userId,
    razorpay_order_id: orderId,
    razorpay_payment_id: fakePaymentId,
    razorpay_signature: signature,
  });
  record(
    "step 5 verifies payment and activates membership",
    verify.response.ok && verify.json?.data?.paymentStatus === "PAID",
    verify.json?.message || verify.json?.data?.memberId
  );

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { membership: true } });
  record(
    "welcome credentials generated",
    Boolean(user?.passwordHash && user?.membership?.memberId),
    user?.membership?.memberId || "missing credentials"
  );

  console.log("INFO login with the emailed temporary password was not API-tested; the password is not returned by the API.");
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (userId) await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
    if (results.some((result) => !result.ok)) process.exitCode = 1;
  });
