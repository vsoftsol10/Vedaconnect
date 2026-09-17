const getMetaWhatsAppMessagesUrl = () => {
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID?.trim();
  const graphApiVersion = process.env.META_GRAPH_API_VERSION?.trim();

  if (!accessToken) throw new Error("META_WHATSAPP_ACCESS_TOKEN is not configured");
  if (!phoneNumberId) throw new Error("META_WHATSAPP_PHONE_NUMBER_ID is not configured");
  if (!graphApiVersion) throw new Error("META_GRAPH_API_VERSION is not configured");

  return `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`;
};

const redactPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `***${digits.slice(-4)}` : "missing";
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
