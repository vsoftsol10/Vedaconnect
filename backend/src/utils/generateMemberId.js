import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Pulls the next value from the `member_id_seq` Postgres sequence (via the
 * `next_member_id()` SQL function - see sql/functions.sql) and formats it
 * as VC-FM-00001, VC-FM-00002, etc.
 *
 * Uses a DB sequence (not a JS counter) so IDs stay unique even under
 * concurrent requests.
 */
export const generateMemberId = async () => {
  try {
    const result = await prisma.$queryRaw`SELECT next_member_id() AS id`;
    const nextVal = result[0].id;
    const padded = String(nextVal).padStart(5, "0");
    return `VC-FM-${padded}`;
  } catch (err) {
    throw new AppError(`Failed to generate member ID: ${err.message}`, 500);
  }
};
