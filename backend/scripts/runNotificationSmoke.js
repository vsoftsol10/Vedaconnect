import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = process.env.ADMIN_E2E_BASE_URL || "http://localhost:5000/api";
const ADMIN_EMAIL = process.env.ADMIN_E2E_EMAIL || "qa.admin@vedaconnect.test";
const ADMIN_PASSWORD = process.env.ADMIN_E2E_FINAL_PASSWORD || "AdminQa#2026!New";
const MEMBER_PASSWORD = "MemberQa#2026!";
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);

async function request(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = res.status === 204 ? null : await res.json();
  return { status: res.status, json };
}

async function main() {
  const passwordHash = await bcrypt.hash(MEMBER_PASSWORD, 10);
  const member = await prisma.user.create({
    data: {
      email: `qa.notifications.${stamp}@example.com`,
      fullName: `QA Notifications ${stamp}`,
      passwordHash,
      role: "MEMBER",
      status: "ACTIVE",
      memberProfile: {
        create: {
          fullName: `QA Notifications ${stamp}`,
          phone: `903${stamp.slice(-7)}`,
          location: "QA City",
          businessName: "QA Notifications Business",
          businessType: "Services",
          businessCategory: "Testing",
        },
      },
    },
  });

  const adminLogin = await request("POST", "/auth/login", {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const adminToken = adminLogin.json?.data?.token;

  const event = await request("POST", "/admin/events", {
    token: adminToken,
    body: {
      title: `QA Notifications Event ${stamp}`,
      description: "Notification smoke event",
      aboutEvent: "Notification smoke event",
      eventDate: new Date(Date.now() + 15 * 86400000).toISOString(),
      startTime: "10:00",
      endTime: "11:00",
      location: "QA City",
      schedule: [{ time: "10:00", item: "Smoke test" }],
      registrationDeadline: new Date(Date.now() + 14 * 86400000).toISOString(),
      maxMembers: 20,
      isPaid: true,
      registrationAmount: 500,
    },
  });

  const memberLogin = await request("POST", "/auth/login", {
    body: { email: member.email, password: MEMBER_PASSWORD },
  });
  const memberToken = memberLogin.json?.data?.token;
  const registration = await request("POST", `/events/${event.json.data.id}/register`, {
    token: memberToken,
  });

  const memberNotifications = await request("GET", "/notifications", { token: memberToken });
  const adminNotifications = await request("GET", "/notifications", { token: adminToken });

  console.log(JSON.stringify({
    created: {
      memberId: member.id,
      memberEmail: member.email,
      eventId: event.json.data.id,
      registrationId: registration.json.data.id,
    },
    checks: {
      adminLogin: adminLogin.status,
      eventCreate: event.status,
      memberLogin: memberLogin.status,
      register: registration.status,
      memberUnread: memberNotifications.json.data.unreadCount,
      memberLatest: memberNotifications.json.data.items[0]?.type,
      adminUnread: adminNotifications.json.data.unreadCount,
      adminLatest: adminNotifications.json.data.items[0]?.type,
    },
  }, null, 2));
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
