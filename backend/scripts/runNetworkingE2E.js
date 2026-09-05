import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../src/config/prismaClient.js";

const BASE_URL = process.env.NETWORKING_E2E_BASE_URL || "http://localhost:5001/api";
const PASSWORD = "NetworkingQa#2026!";
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const emails = {
  giver: `qa.network.giver.${stamp}@example.com`,
  receiver: `qa.network.receiver.${stamp}@example.com`,
  admin: `qa.network.admin.${stamp}@example.com`,
};
const createdUserIds = [];
const results = [];

const record = (name, ok, note = "") => {
  results.push({ name, ok, note });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${note ? ` - ${note}` : ""}`);
};

const request = async (method, path, { token, body } = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await response.json().catch(() => null);
  return { response, json };
};

const createUser = async ({ email, role, fullName, businessName }) => {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const user = await prisma.user.create({
    data: { email, role, status: "ACTIVE", passwordHash, fullName: role === "ADMIN" ? fullName : null },
  });
  createdUserIds.push(user.id);

  if (role === "MEMBER") {
    await prisma.memberProfile.create({
      data: {
        userId: user.id,
        fullName,
        phone: "9876543210",
        location: "Tirunelveli",
        businessName,
        businessCategory: "Professional Services",
        businessLocation: "Tirunelveli",
      },
    });
    await prisma.membership.create({
      data: {
        userId: user.id,
        memberId: `QA${Date.now()}${createdUserIds.length}`,
        membershipType: "FOUNDING_MEMBER",
        membershipStatus: "ACTIVE",
        amount: 1,
        paymentStatus: "PAID",
        paymentReference: "NETWORKING_E2E",
        paidAt: new Date(),
        joinedAt: new Date(),
      },
    });
  }

  return user;
};

const login = async (email) => {
  const { response, json } = await request("POST", "/auth/login", {
    body: { email, password: PASSWORD },
  });
  if (!response.ok || !json?.data?.token) throw new Error(`Login failed for ${email}: ${json?.message}`);
  return json.data.token;
};

const main = async () => {
  await prisma.user.deleteMany({ where: { email: { in: Object.values(emails) } } });

  const [giver, receiver] = await Promise.all([
    createUser({ email: emails.giver, role: "MEMBER", fullName: "QA Referral Giver", businessName: "QA Giving Co" }),
    createUser({
      email: emails.receiver,
      role: "MEMBER",
      fullName: "QA Business Receiver",
      businessName: "QA Receiving Co",
    }),
    createUser({ email: emails.admin, role: "ADMIN", fullName: "QA Admin" }),
  ]);

  const [giverToken, receiverToken, adminToken] = await Promise.all([
    login(emails.giver),
    login(emails.receiver),
    login(emails.admin),
  ]);

  const referral = await request("POST", "/networking/referrals", {
    token: giverToken,
    body: { receiverId: receiver.id, amount: 25000, description: "QA referral" },
  });
  record("member logs referral", referral.response.ok, referral.json?.message || referral.json?.data?.id);

  const receiverNotifications = await request("GET", "/notifications", { token: receiverToken });
  record(
    "receiver gets referral notification",
    receiverNotifications.json?.data?.items?.some((item) => item.type === "REFERRAL_GIVEN"),
    `${receiverNotifications.json?.data?.unreadCount || 0} unread`
  );

  const adminReferralNotifications = await request("GET", "/notifications", { token: adminToken });
  record(
    "admin gets referral notification",
    adminReferralNotifications.json?.data?.items?.some((item) => item.type === "REFERRAL_GIVEN"),
    `${adminReferralNotifications.json?.data?.unreadCount || 0} unread`
  );

  const business = await request("POST", "/networking/business-received", {
    token: receiverToken,
    body: { referrerId: giver.id, amount: 18000, description: "QA business closed" },
  });
  record("member logs business received", business.response.ok, business.json?.message || business.json?.data?.id);

  const giverNotifications = await request("GET", "/notifications", { token: giverToken });
  record(
    "referrer gets business notification",
    giverNotifications.json?.data?.items?.some((item) => item.type === "BUSINESS_RECEIVED"),
    `${giverNotifications.json?.data?.unreadCount || 0} unread`
  );

  const weekly = await request("GET", "/networking/leaderboard/weekly", { token: giverToken });
  record(
    "weekly leaderboard reflects entries",
    weekly.json?.data?.referralsGiven?.some((row) => row.userId === giver.id && row.total >= 25000) &&
      weekly.json?.data?.businessReceived?.some((row) => row.userId === receiver.id && row.total >= 18000)
  );

  const attendance = await request("POST", "/attendance/confirm", { token: giverToken });
  record("member confirms attendance", attendance.response.ok, attendance.json?.data?.status);

  const attendanceList = await request("GET", "/attendance/week", { token: adminToken });
  record(
    "admin attendance list reflects confirmation",
    attendanceList.json?.data?.some((row) => row.userId === giver.id && row.status === "CONFIRMED")
  );

  const feeStatus = await request("GET", "/meeting-fee/status", { token: giverToken });
  record("meeting fee status loads", feeStatus.response.ok, feeStatus.json?.data?.paymentStatus);

  const order = await request("POST", "/meeting-fee/create-order", { token: giverToken });
  if (order.response.ok && order.json?.data?.orderId && process.env.RAZORPAY_KEY_SECRET) {
    const fakePaymentId = `pay_qa_${stamp}`;
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.json.data.orderId}|${fakePaymentId}`)
      .digest("hex");
    const verify = await request("POST", "/meeting-fee/verify", {
      token: giverToken,
      body: {
        razorpay_order_id: order.json.data.orderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: signature,
      },
    });
    record("meeting fee verifies as paid", verify.response.ok, verify.json?.message || verify.json?.data?.paymentStatus);

    const duplicate = await request("POST", "/meeting-fee/create-order", { token: giverToken });
    record("duplicate meeting fee payment is blocked", duplicate.response.status === 409, duplicate.json?.message);
  } else {
    record("meeting fee Razorpay order", false, order.json?.message || "No order id returned");
  }

  const adminFees = await request("GET", "/meeting-fee/month", { token: adminToken });
  record(
    "admin meeting fee table loads",
    adminFees.response.ok && adminFees.json?.data?.some((row) => row.userId === giver.id)
  );

  const failed = results.filter((result) => !result.ok);
  if (failed.length) {
    process.exitCode = 1;
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });
