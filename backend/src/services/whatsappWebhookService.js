import crypto from "node:crypto";
import { prisma } from "../config/prismaClient.js";

const STATUS_RANK = { accepted: 0, sent: 1, failed: 1, delivered: 2, read: 3 };
const TRACKED_STATUSES = new Set(["sent", "delivered", "read", "failed"]);

export const verifyWhatsAppSignature = ({ rawBody, signature, appSecret = process.env.META_APP_SECRET }) => {
  if (!appSecret || !signature?.startsWith("sha256=")) return false;
  const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  const supplied = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return supplied.length === expectedBuffer.length && crypto.timingSafeEqual(supplied, expectedBuffer);
};

export const verifyWhatsAppChallenge = ({ mode, token, challenge, verifyToken = process.env.WA_VERIFY_TOKEN }) =>
  mode === "subscribe" && Boolean(verifyToken) && token === verifyToken ? challenge : null;

export const mapWhatsAppStatus = (status) => TRACKED_STATUSES.has(status) ? { status, rank: STATUS_RANK[status] } : null;

const statusTimestamp = (timestamp) => {
  const seconds = Number(timestamp);
  return Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000) : new Date();
};

export const statusEventsFromPayload = (payload) => (payload?.entry || []).flatMap((entry) =>
  (entry?.changes || []).flatMap((change) => (change?.value?.statuses || []).map((status) => ({
    id: status.id,
    mapped: mapWhatsAppStatus(status.status),
    statusAt: statusTimestamp(status.timestamp),
    errors: Array.isArray(status.errors) ? status.errors : [],
  })))
);

const isNewer = (current, incoming) => {
  if (incoming.rank < (current.statusRank ?? 0)) return false;
  if (current.statusAt && incoming.statusAt < current.statusAt) return false;
  return incoming.rank > (current.statusRank ?? 0) || !current.statusAt || incoming.statusAt > current.statusAt || current.status !== incoming.status;
};

export const applyWhatsAppStatus = async (event, prismaClient = prisma) => {
  if (!event.id || !event.mapped) return { ignored: true };
  let log = prismaClient.notificationLog;
  let row = await log.findUnique({ where: { metaMessageId: event.id } });
  if (!row) {
    log = prismaClient.whatsAppDeliveryLog;
    row = await log.findFirst({ where: { metaMessageId: event.id }, orderBy: { sentAt: "desc" } });
  }
  if (!row) return { unknown: true };
  if (!isNewer(row, { ...event.mapped, statusAt: event.statusAt })) return { ignored: true };
  const providerError = event.errors[0] || {};
  await log.update({
    where: { id: row.id },
    data: {
      status: event.mapped.status,
      statusAt: event.statusAt,
      statusRank: event.mapped.rank,
      ...(event.mapped.status === "failed" ? {
        errorCode: providerError.code == null ? null : String(providerError.code),
        errorTitle: providerError.title || null,
        errorDetails: providerError.details || null,
        errorMessage: providerError.details || providerError.title || null,
      } : {}),
    },
  });
  return { updated: true };
};
