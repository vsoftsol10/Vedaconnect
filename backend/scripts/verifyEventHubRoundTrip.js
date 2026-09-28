import { prisma } from "../src/config/prismaClient.js";
import { listEvents } from "../src/services/adminEventService.js";

const hub = await prisma.hub.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" }, select: { id: true, name: true } });
if (!hub) throw new Error("Create an active hub before running this verification.");

let event;
try {
  event = await prisma.event.create({
    data: {
      title: `Hub round-trip verification ${Date.now()}`,
      description: "Temporary verification event",
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: "Verification location",
      eventType: "NO_FEE",
      registrationAmount: 0,
      hubId: hub.id,
    },
  });
  const listed = (await listEvents()).find((item) => item.id === event.id);
  if (!listed || listed.hubId !== hub.id || listed.hubName !== hub.name) {
    throw new Error(`Hub did not round-trip through the admin list: ${JSON.stringify(listed)}`);
  }
  console.log(`PASS: ${listed.title} returned hub ${listed.hubName}.`);
} finally {
  if (event) await prisma.event.delete({ where: { id: event.id } });
  await prisma.$disconnect();
}
