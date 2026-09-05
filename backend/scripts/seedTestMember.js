import bcrypt from "bcrypt";
import { prisma } from "../src/config/prismaClient.js";
import { generateMemberId } from "../src/utils/generateMemberId.js";

const TEST_EMAIL = "test.member@vedaconnect.dev";
const TEST_PASSWORD = "TestPass123!";

const main = async () => {
  const existing = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (existing) {
    throw new Error(`Test member already exists: ${TEST_EMAIL} (${existing.id})`);
  }

  const plan = await prisma.membershipPlan.findFirst({
    where: { planCode: "FOUNDING_MEMBER", isActive: true },
  });
  if (!plan) {
    throw new Error("Active FOUNDING_MEMBER plan not found.");
  }

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const memberId = await generateMemberId();

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email: TEST_EMAIL,
        passwordHash,
        role: "MEMBER",
        status: "ACTIVE",
      },
    });

    await tx.memberProfile.create({
      data: {
        userId: createdUser.id,
        fullName: "Test Member",
        phone: "9876543210",
        location: "Chennai",
        businessName: "Test Business Co",
        businessCategory: "Herbal & Wellness",
        businessLocation: "Chennai, Tamil Nadu",
        businessDescription: "A test business for QA purposes.",
        productsServices: "Test products and services",
      },
    });

    await tx.membership.create({
      data: {
        userId: createdUser.id,
        membershipType: plan.planCode,
        membershipStatus: "ACTIVE",
        amount: plan.amount,
        paymentStatus: "PAID",
        memberId,
        paymentReference: "TEST_PAYMENT_BYPASS",
        paidAt: new Date(),
        joinedAt: new Date(),
      },
    });

    await tx.businessCertificate.create({
      data: {
        userId: createdUser.id,
        filePath: `test/${createdUser.id}/test_certificate.pdf`,
        fileName: "test_certificate.pdf",
        fileSizeBytes: 0,
        mimeType: "application/pdf",
        isVerified: true,
      },
    });

    return createdUser;
  });

  console.log(
    JSON.stringify(
      {
        success: true,
        userId: user.id,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        memberId,
        planCode: plan.planCode,
        amount: String(plan.amount),
      },
      null,
      2
    )
  );
};

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
