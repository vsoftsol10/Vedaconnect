import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
  if (process.env[key]) {
    const url = new URL(process.env[key]);
    if (process.env.PRISMA_SSL_MODE) {
      url.searchParams.set("sslmode", process.env.PRISMA_SSL_MODE);
    } else if (
      process.env.NODE_ENV !== "production" &&
      url.hostname.endsWith(".pooler.supabase.com") &&
      !url.searchParams.has("sslmode")
    ) {
      url.searchParams.set("sslmode", "disable");
    }
    process.env[key] = url.toString();
  }
}

const prisma = new PrismaClient();

const BASE_URL = process.env.ADMIN_E2E_BASE_URL || "http://localhost:5000/api";
const ADMIN_EMAIL = process.env.ADMIN_E2E_EMAIL || "qa.admin@vedaconnect.test";
const INITIAL_PASSWORD = process.env.ADMIN_E2E_INITIAL_PASSWORD || "AdminQa#2026!";
const FINAL_PASSWORD = process.env.ADMIN_E2E_FINAL_PASSWORD || "AdminQa#2026!New";

const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const createdData = [];
const tests = [];

function dataLabel(type, id, extra = {}) {
  createdData.push({ type, id, ...extra });
}

function shape(value) {
  if (Array.isArray(value)) return `array(${value.length})`;
  if (value && typeof value === "object") return `object(${Object.keys(value).slice(0, 8).join(",")})`;
  return typeof value;
}

async function request(method, path, { token, body, formData, expected = [200], note } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  let response;
  let json = null;
  let text = "";
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: formData || (body ? JSON.stringify(body) : undefined),
    });
    text = await response.text();
    json = text ? JSON.parse(text) : null;
  } catch (error) {
    tests.push({ endpoint: `${method} ${path}`, status: "ERR", pass: false, shape: error.message, note });
    return { response, json };
  }

  const pass = expected.includes(response.status) && (response.status === 204 || json?.success === true);
  tests.push({
    endpoint: `${method} ${path}`,
    status: response.status,
    pass,
    shape: response.status === 204 ? "no content" : shape(json?.data),
    note: note || json?.message || "",
  });
  return { response, json };
}

async function ensureAdmin() {
  const passwordHash = await bcrypt.hash(INITIAL_PASSWORD, 10);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      fullName: "QA Admin",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      email: ADMIN_EMAIL,
      fullName: "QA Admin",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
    select: { id: true, email: true, role: true, status: true },
  });
  dataLabel("admin-user", admin.id, { email: admin.email });
  return admin;
}

async function createPendingMember({ suffix, hubId, planCode, amount }) {
  const email = `qa.admin-e2e.${stamp}.${suffix}@example.com`;
  const user = await prisma.user.create({
    data: {
      email,
      fullName: `QA Pending ${suffix}`,
      role: "MEMBER",
      status: "PENDING",
      memberProfile: {
        create: {
          fullName: `QA Pending ${suffix}`,
          phone: `900${stamp.slice(-7)}`,
          location: "QA City",
          hubId,
          businessName: `QA Business ${suffix}`,
          businessType: "Services",
          businessCategory: "Testing",
          businessDescription: "Admin E2E test member",
          productsServices: "QA services",
        },
      },
      membership: {
        create: {
          membershipType: planCode,
          membershipStatus: "PENDING_PAYMENT",
          amount,
          paymentStatus: "PENDING",
          paymentReference: `QA_PENDING_${stamp}_${suffix}`,
        },
      },
    },
    include: { membership: true },
  });
  dataLabel("member-user", user.id, { email });
  dataLabel("membership", user.membership.id, { email });
  return user;
}

async function createPendingEventRegistration({ suffix, eventId }) {
  const email = `qa.admin-event-e2e.${stamp}.${suffix}@example.com`;
  const user = await prisma.user.create({
    data: {
      email,
      fullName: `QA Event Pending ${suffix}`,
      role: "MEMBER",
      status: "ACTIVE",
      memberProfile: {
        create: {
          fullName: `QA Event Pending ${suffix}`,
          phone: `901${stamp.slice(-7)}`,
          location: "QA City",
          businessName: `QA Event Business ${suffix}`,
          businessType: "Services",
          businessCategory: "Testing",
        },
      },
    },
  });
  const registration = await prisma.eventRegistration.create({
    data: {
      userId: user.id,
      eventId,
      registrationStatus: "REGISTERED",
      paymentStatus: "PENDING",
    },
  });
  dataLabel("event-payment-user", user.id, { email });
  dataLabel("event-registration", registration.id, { email });
  return registration;
}

async function main() {
  const admin = await ensureAdmin();

  const login = await request("POST", "/auth/login", {
    body: { email: ADMIN_EMAIL, password: INITIAL_PASSWORD },
    note: "expects ADMIN role and token",
  });
  const token = login.json?.data?.token;
  const loginRole = login.json?.data?.user?.role;
  if (!token || loginRole !== "ADMIN") {
    throw new Error(`Admin login failed or wrong role. role=${loginRole || "missing"}`);
  }

  await request("GET", "/admin/dashboard", { token });
  const hubsBefore = await request("GET", "/admin/hubs", { token });

  const hubPayload = {
    name: `QA Admin E2E Hub ${stamp}`,
    location: "QA City",
    description: "Created by admin portal E2E",
    coordinatorName: "QA Coordinator",
    isActive: true,
  };
  const hubCreate = await request("POST", "/admin/hubs", { token, body: hubPayload, expected: [201] });
  const hubId = hubCreate.json?.data?.id;
  if (!hubId) throw new Error("Hub create did not return an id");
  dataLabel("hub", hubId, { name: hubPayload.name });

  await request("PUT", `/admin/hubs/${hubId}`, {
    token,
    body: { ...hubPayload, description: "Updated by admin portal E2E" },
  });
  await request("GET", `/admin/hubs/${hubId}`, { token });

  const futureIso = new Date(Date.now() + 20 * 86400000).toISOString();
  const pastIso = new Date(Date.now() - 86400000).toISOString();
  const subscriptionPayload = {
    name: `QA Admin E2E Plan ${stamp}`,
    price: 1180,
    billingCycle: "YEARLY",
    description: "Created by admin portal E2E",
    isActive: true,
    benefits: ["QA benefit"],
    activeFrom: futureIso,
    activeUntil: null,
  };
  const subCreate = await request("POST", "/admin/subscriptions", {
    token,
    body: subscriptionPayload,
    expected: [201],
    note: "future activeFrom should hide it from onboarding plans",
  });
  const subscription = subCreate.json?.data;
  if (!subscription?.id || !subscription?.planCode) throw new Error("Subscription create did not return id/planCode");
  dataLabel("membership-plan", subscription.id, { planCode: subscription.planCode, name: subscription.name });

  await request("GET", "/admin/subscriptions", { token });
  const plansWhileFuture = await request("GET", "/onboarding/plans", { token: null, note: "QA future plan should be absent" });
  const futureVisible = plansWhileFuture.json?.data?.some((p) => p.planCode === subscription.planCode);
  tests.push({
    endpoint: "CHECK onboarding plan scheduling (future activeFrom)",
    status: "CHECK",
    pass: futureVisible === false,
    shape: futureVisible ? "visible" : "hidden",
    note: subscription.planCode,
  });

  await request("PUT", `/admin/subscriptions/${subscription.id}`, {
    token,
    body: { ...subscriptionPayload, name: `${subscriptionPayload.name} Updated`, activeFrom: pastIso },
  });
  const plansAfterActive = await request("GET", "/onboarding/plans", { token: null, note: "QA active plan should be present" });
  const activeVisible = plansAfterActive.json?.data?.some((p) => p.planCode === subscription.planCode);
  tests.push({
    endpoint: "CHECK onboarding plan scheduling (active window)",
    status: "CHECK",
    pass: activeVisible === true,
    shape: activeVisible ? "visible" : "hidden",
    note: subscription.planCode,
  });
  await request("PATCH", `/admin/subscriptions/${subscription.id}/toggle`, { token, note: "deactivate" });
  await request("PATCH", `/admin/subscriptions/${subscription.id}/toggle`, { token, note: "reactivate" });

  const verifyMember = await createPendingMember({
    suffix: "verify",
    hubId,
    planCode: subscription.planCode,
    amount: 1180,
  });
  const rejectMember = await createPendingMember({
    suffix: "reject",
    hubId,
    planCode: subscription.planCode,
    amount: 1180,
  });

  await request("GET", "/admin/members", { token });
  await request("GET", `/admin/members/${verifyMember.id}`, { token });
  await request("PATCH", `/admin/members/${verifyMember.id}/hub`, { token, body: { hubId } });

  const memberForm = new FormData();
  memberForm.append("data", JSON.stringify({
    fullName: `QA Added Member ${stamp}`,
    email: `qa.admin-added.${stamp}@example.com`,
    phone: `902${stamp.slice(-7)}`,
    businessName: "QA Added Business",
    businessType: "Services",
    businessCategory: "Testing",
    location: "QA City",
    businessDescription: "Created through admin add member endpoint",
    productsServices: "QA services",
    hubId,
    planCode: subscription.planCode,
  }));
  const addMember = await request("POST", "/admin/members", {
    token,
    formData: memberForm,
    expected: [201],
    note: "may fail if transactional email provider is unavailable",
  });
  if (addMember.json?.data?.userId) {
    dataLabel("admin-created-member", addMember.json.data.userId, { email: `qa.admin-added.${stamp}@example.com` });
  }

  const eventPayload = {
    title: `QA Admin E2E Event ${stamp}`,
    description: "Created by admin portal E2E",
    aboutEvent: "E2E test event",
    eventDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    startTime: "10:00",
    endTime: "11:00",
    location: "QA City",
    schedule: [{ time: "10:00", item: "QA session" }],
    registrationDeadline: new Date(Date.now() + 9 * 86400000).toISOString(),
    maxMembers: 50,
    isPaid: true,
    registrationAmount: 250,
  };
  const eventCreate = await request("POST", "/admin/events", { token, body: eventPayload, expected: [201] });
  const eventId = eventCreate.json?.data?.id;
  if (!eventId) throw new Error("Event create did not return an id");
  dataLabel("event", eventId, { title: eventPayload.title });
  await request("GET", "/admin/events", { token });
  await request("GET", `/admin/events/${eventId}`, { token });
  await request("PUT", `/admin/events/${eventId}`, {
    token,
    body: { ...eventPayload, title: `${eventPayload.title} Updated` },
  });

  const paymentEvent = await prisma.event.create({
    data: {
      title: `QA Payment Event ${stamp}`,
      description: "Payment history E2E event",
      aboutEvent: "Payment testing",
      eventDate: new Date(Date.now() + 12 * 86400000),
      startTime: "12:00",
      endTime: "13:00",
      location: "QA City",
      registrationAmount: 300,
      status: "PUBLISHED",
    },
  });
  dataLabel("payment-event", paymentEvent.id, { title: paymentEvent.title });
  const verifyRegistration = await createPendingEventRegistration({ suffix: "verify", eventId: paymentEvent.id });
  const rejectRegistration = await createPendingEventRegistration({ suffix: "reject", eventId: paymentEvent.id });

  const membershipPayments = await request("GET", "/admin/payments/membership", { token });
  tests.push({
    endpoint: "CHECK membership payments nonempty",
    status: "CHECK",
    pass: Array.isArray(membershipPayments.json?.data) && membershipPayments.json.data.length > 0,
    shape: `array(${membershipPayments.json?.data?.length ?? "?"})`,
    note: "seeded QA pending rows before this check",
  });
  await request("PATCH", `/admin/payments/membership/${verifyMember.membership.id}/verify`, { token });
  const verifiedMembership = await prisma.membership.findUnique({ where: { id: verifyMember.membership.id } });
  tests.push({
    endpoint: "CHECK membership verify status mutation",
    status: "CHECK",
    pass: verifiedMembership?.paymentStatus === "PAID" && verifiedMembership?.membershipStatus === "ACTIVE",
    shape: `${verifiedMembership?.paymentStatus}/${verifiedMembership?.membershipStatus}`,
    note: verifyMember.membership.id,
  });
  await request("PATCH", `/admin/payments/membership/${rejectMember.membership.id}/reject`, { token });

  const eventPayments = await request("GET", "/admin/payments/events", { token });
  tests.push({
    endpoint: "CHECK event payments nonempty",
    status: "CHECK",
    pass: Array.isArray(eventPayments.json?.data) && eventPayments.json.data.length > 0,
    shape: `array(${eventPayments.json?.data?.length ?? "?"})`,
    note: "seeded QA pending rows before this check",
  });
  await request("PATCH", `/admin/payments/events/${verifyRegistration.id}/verify`, { token });
  const verifiedRegistration = await prisma.eventRegistration.findUnique({ where: { id: verifyRegistration.id } });
  tests.push({
    endpoint: "CHECK event verify status mutation",
    status: "CHECK",
    pass: verifiedRegistration?.paymentStatus === "PAID" && verifiedRegistration?.registrationStatus === "CONFIRMED",
    shape: `${verifiedRegistration?.paymentStatus}/${verifiedRegistration?.registrationStatus}`,
    note: verifyRegistration.id,
  });
  await request("PATCH", `/admin/payments/events/${rejectRegistration.id}/reject`, { token });

  await request("GET", "/admin/profile", { token });
  await request("PUT", "/admin/profile", {
    token,
    body: { fullName: `QA Admin ${stamp}`, email: ADMIN_EMAIL },
  });
  await request("PUT", "/admin/profile/password", {
    token,
    body: { currentPassword: INITIAL_PASSWORD, newPassword: FINAL_PASSWORD },
    note: "password changed to final QA password",
  });
  const finalLogin = await request("POST", "/auth/login", {
    body: { email: ADMIN_EMAIL, password: FINAL_PASSWORD },
    note: "expects ADMIN role with new password",
  });
  tests.push({
    endpoint: "CHECK final admin login role",
    status: "CHECK",
    pass: finalLogin.json?.data?.user?.role === "ADMIN",
    shape: finalLogin.json?.data?.user?.role || "missing",
    note: ADMIN_EMAIL,
  });

  await request("DELETE", `/admin/events/${eventId}`, { token, expected: [204] });
  await request("DELETE", `/admin/hubs/${hubId}`, { token, note: "deactivates hub" });

  const summary = {
    baseUrl: BASE_URL,
    credentials: {
      email: ADMIN_EMAIL,
      password: FINAL_PASSWORD,
      initialPasswordUsedBeforePasswordChange: INITIAL_PASSWORD,
      adminId: admin.id,
    },
    counts: {
      passed: tests.filter((t) => t.pass).length,
      failed: tests.filter((t) => !t.pass).length,
      total: tests.length,
      hubsBefore: hubsBefore.json?.data?.length ?? null,
    },
    tests,
    createdData,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (summary.counts.failed > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(JSON.stringify({ error: error.message, tests, createdData }, null, 2));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
