import { sanitizeProviderErrorText } from "./sanitizeProviderError.js";

const getMetaWhatsAppMessagesUrl = () => {
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID?.trim();
  const graphApiVersion = process.env.META_GRAPH_API_VERSION?.trim();

  if (!accessToken) throw new Error("META_WHATSAPP_ACCESS_TOKEN is not configured");
  if (!phoneNumberId) throw new Error("META_WHATSAPP_PHONE_NUMBER_ID is not configured");
  if (!graphApiVersion) throw new Error("META_GRAPH_API_VERSION is not configured");

  return `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`;
};

const getMetaWhatsAppMediaUrl = () => getMetaWhatsAppMessagesUrl().replace(/\/messages$/, "/media");

const redactPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `***${digits.slice(-4)}` : "missing";
};

const notificationsDisabledResult = (templateName) => {
  console.info("[WHATSAPP_SEND_SKIPPED] skipped: notifications disabled", { template: templateName });
  return { skipped: true, reason: "notifications-disabled" };
};

export const normalizeWhatsAppPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
  return digits;
};

/**
 * Sends an approved WhatsApp template through Meta's WhatsApp Cloud API.
 * Throws on delivery failures so callers can create an admin follow-up record.
 */
export const sendWhatsAppMessage = async (phone, templateName, variables) => {
  if (process.env.ENABLE_WHATSAPP_NOTIFICATIONS !== "true") return notificationsDisabledResult(templateName);
  try {
    if (!phone?.trim()) throw new Error("Recipient phone number is required");
    if (!templateName?.trim()) throw new Error("WhatsApp template name is required");
    if (!Array.isArray(variables) || variables.some((value) => typeof value !== "string")) {
      throw new Error("WhatsApp template variables must be an array of strings");
    }

    const recipientPhone = normalizeWhatsAppPhone(phone);
    if (!/^\d+$/.test(recipientPhone)) {
      throw new Error("Recipient phone number must contain only digits with country code (no leading + or spaces)");
    }

    const response = await fetch(getMetaWhatsAppMessagesUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipientPhone,
        type: "template",
        template: {
          name: templateName.trim(),
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: variables.map((value) => ({ type: "text", text: value })),
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(`Meta WhatsApp Cloud API returned ${response.status}${responseBody ? `: ${responseBody.slice(0, 500)}` : ""}`);
    }

    return response.status === 204 ? null : response.json().catch(() => null);
  } catch (error) {
    console.error("[WHATSAPP_SEND_FAILED]", {
      template: templateName,
      phone: redactPhone(phone),
      message: error?.message,
    });
    throw error;
  }
};

/** Uploads an in-memory PDF for use by a document-header template. */
export const uploadWhatsAppPdf = async ({ buffer, filename }) => {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("file", new Blob([buffer], { type: "application/pdf" }), filename);

  const response = await fetch(getMetaWhatsAppMediaUrl(), {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN.trim()}` },
    body: form,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.id) throw new Error(sanitizeProviderErrorText(`Meta media upload returned ${response.status}: ${body?.error?.message || "No media ID returned"}`));
  return body.id;
};

/** Sends the approved document-header template. Kept separate from the legacy five-variable flow. */
export const sendWhatsAppDocumentTemplate = async ({ phone, templateName, mediaId, filename, variables }) => {
  if (process.env.ENABLE_WHATSAPP_NOTIFICATIONS !== "true") return notificationsDisabledResult(templateName);
  if (!phone?.trim()) throw new Error("Recipient phone number is required");
  if (!templateName?.trim()) throw new Error("WhatsApp document template is not configured");
  if (!mediaId || !filename || !Array.isArray(variables) || variables.length !== 4 || variables.some((value) => typeof value !== "string")) {
    throw new Error("Invalid WhatsApp document template payload");
  }
  const recipientPhone = normalizeWhatsAppPhone(phone);
  if (!/^\d+$/.test(recipientPhone)) throw new Error("Recipient phone number must contain only digits with country code");

  const response = await fetch(getMetaWhatsAppMessagesUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "template",
      template: {
        name: templateName.trim(),
        language: { code: "en_US" },
        components: [
          { type: "header", parameters: [{ type: "document", document: { id: mediaId, filename } }] },
          { type: "body", parameters: variables.map((text) => ({ type: "text", text })) },
        ],
      },
    }),
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(sanitizeProviderErrorText(`Meta WhatsApp Cloud API returned ${response.status}: ${body?.error?.message || "Unknown provider error"}`));
  return body;
};
