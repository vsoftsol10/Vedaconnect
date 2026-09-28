import { supabaseStorage } from "../src/config/supabaseStorageClient.js";
import { prisma } from "../src/config/prismaClient.js";

let page = 1;
const authUsers = [];
while (true) {
  const { data, error } = await supabaseStorage.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw error;
  authUsers.push(...data.users);
  if (data.users.length < 1000) break;
  page += 1;
}
const ids = authUsers.map((user) => user.id);
const members = await prisma.user.findMany({ where: { OR: [{ id: { in: ids } }, { email: { in: authUsers.map((user) => user.email).filter(Boolean), mode: "insensitive" } }] }, select: { id: true, email: true } });
const memberIds = new Set(members.map((member) => member.id));
const memberEmails = new Set(members.map((member) => member.email?.toLowerCase()).filter(Boolean));
console.table(authUsers.filter((user) => !memberIds.has(user.id) && !memberEmails.has(user.email?.toLowerCase())).map((user) => ({ id: user.id, email: user.email, createdAt: user.created_at })));
await prisma.$disconnect();
