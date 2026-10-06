import { Router } from "express";
import { applyWhatsAppStatus, statusEventsFromPayload, verifyWhatsAppChallenge, verifyWhatsAppSignature } from "../services/whatsappWebhookService.js";

const router = Router();

router.get("/whatsapp", (req, res) => {
  const challenge = verifyWhatsAppChallenge({ mode: req.query["hub.mode"], token: req.query["hub.verify_token"], challenge: req.query["hub.challenge"] });
  if (challenge === null) return res.sendStatus(403);
  return res.status(200).type("text/plain").send(challenge);
});

router.post("/whatsapp", async (req, res) => {
  const rawBody = req.body;
  if (!Buffer.isBuffer(rawBody) || !verifyWhatsAppSignature({ rawBody, signature: req.get("X-Hub-Signature-256") })) return res.sendStatus(401);
  res.sendStatus(200);
  let payload;
  try { payload = JSON.parse(rawBody.toString("utf8")); } catch { return; }
  for (const event of statusEventsFromPayload(payload)) {
    try {
      const result = await applyWhatsAppStatus(event);
      if (result.unknown) console.warn("[WHATSAPP_WEBHOOK_UNKNOWN_WAMID]", { metaMessageId: event.id });
    } catch (error) {
      console.error("[WHATSAPP_WEBHOOK_STATUS_UPDATE_FAILED]", { metaMessageId: event.id, message: error?.message });
    }
  }
});

export default router;
