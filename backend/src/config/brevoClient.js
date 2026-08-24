import dotenv from "dotenv";

dotenv.config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const { BREVO_API_KEY } = process.env;

if (!BREVO_API_KEY) {
  console.warn("BREVO_API_KEY is missing - welcome emails will fail until .env is set.");
}

/**
 * Sends a single transactional email via Brevo's REST API.
 * Uses Node's built-in fetch (Node 18+), no extra package needed.
 */
export const sendBrevoEmail = async ({ to, subject, htmlContent }) => {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: process.env.EMAIL_FROM_NAME || "VedaConnect Community",
        email: process.env.EMAIL_FROM_ADDRESS,
      },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo email failed (${response.status}): ${errorBody}`);
  }

  return response.json();
};