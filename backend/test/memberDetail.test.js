import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/config/prismaClient.js";
import { getMemberDetail } from "../src/services/memberService.js";

test("member detail loads and returns business certificates", async () => {
  let query;
  const originalFindUnique = prisma.user.findUnique;
  prisma.user.findUnique = async (args) => {
    query = args;
    return {
      id: "member-id",
      status: "ACTIVE",
      memberProfile: {
        fullName: "Test Member",
        profilePhoto: null,
        location: "Chennai",
        businessName: "Test Business",
        businessCategory: "Services",
        businessLocation: "Chennai",
        businessDescription: null,
        productsServices: null,
      },
      membership: { membershipType: "MEMBER", deletedAt: null },
      businessCertificates: [
        { id: "certificate-id", fileName: "certificate.pdf", isVerified: true },
      ],
    };
  };

  try {
    const member = await getMemberDetail("member-id");

    assert.equal(query.include.businessCertificates, true);
    assert.deepEqual(member.certificates, [
      { id: "certificate-id", fileName: "certificate.pdf", isVerified: true },
    ]);
    assert.equal(member.isVerified, true);
  } finally {
    prisma.user.findUnique = originalFindUnique;
  }
});
