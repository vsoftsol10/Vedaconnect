import { prisma } from "../src/config/prismaClient.js";
import { getMyFullProfile, updateMyProfile } from "../src/services/memberService.js";

const [userId] = process.argv.slice(2);
if (!userId) {
  console.error("Usage: node scripts/verifyMemberProfileRoundTrip.js <member-user-id>");
  process.exitCode = 1;
} else {
  const profile = await prisma.memberProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Member profile not found.");

  const original = {
    birthMonth: profile.dateOfBirth?.getUTCMonth() + 1 || null,
    birthDay: profile.dateOfBirth?.getUTCDate() || null,
    businessLocation: profile.businessLocation || "",
  };

  try {
    await updateMyProfile(userId, { birthMonth: 9, birthDay: 16, businessLocation: "Round-trip Business Location" });
    const updated = await getMyFullProfile(userId);
    if (updated.birthMonth !== 9 || updated.birthDay !== 16 || updated.businessLocation !== "Round-trip Business Location") {
      throw new Error(`Round-trip mismatch: ${JSON.stringify({ birthMonth: updated.birthMonth, birthDay: updated.birthDay, businessLocation: updated.businessLocation })}`);
    }
    console.log("PASS: birthday and business location persisted and were returned by GET /members/me/full.");
  } finally {
    await updateMyProfile(userId, original);
    await prisma.$disconnect();
  }
}
