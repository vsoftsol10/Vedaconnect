import "dotenv/config";
import { sendWhatsAppMessage } from "../utils/whatsappNotify.js";

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const testPhone = process.argv[2]?.trim() || process.env.WHATSAPP_TEST_PHONE?.trim();

const parseOtpVariables = () => {
  const raw = process.env.WHATSAPP_TEST_OTP_VARIABLES;
  if (!raw) throw new Error("WHATSAPP_TEST_OTP_VARIABLES is required because member_onboarding_otp has no production call site to establish its template variables. Supply a JSON string array, for example '[\"123456\"]'.");
  const variables = JSON.parse(raw);
  if (!Array.isArray(variables) || variables.some((value) => typeof value !== "string")) {
    throw new Error("WHATSAPP_TEST_OTP_VARIABLES must be a JSON array of strings.");
  }
  return variables;
};

if (!testPhone) {
  console.error("Usage: npm run test:whatsapp-templates -- <test-phone>");
  console.error("Alternatively, set WHATSAPP_TEST_PHONE in backend/.env.");
  process.exitCode = 1;
} else {
  const templates = [
    {
      name: "vedaconnect_monthly_sumary",
      variables: ["September 2026", "18000", "12500", "5500", "https://member.vedacraftscommunity.in/expenses/summary?month=9&year=2026"],
    },
    {
      name: "payment_confirmation",
      variables: ["Test Member", "₹18000.00", "Founder Membership"],
    },
  ];

  try {
    templates.push({ name: "member_onboarding_otp", variables: parseOtpVariables() });
  } catch (error) {
    templates.push({ name: "member_onboarding_otp", variables: null, configurationError: error.message });
  }

  const results = [];
  for (const template of templates) {
    if (template.configurationError) {
      console.error(`[WHATSAPP_TEMPLATE_TEST] ${template.name} skipped: ${template.configurationError}`);
      results.push({ template: template.name, status: "SKIPPED", detail: template.configurationError });
      continue;
    }

    console.log(`[WHATSAPP_TEMPLATE_TEST] Sending ${template.name}`, { variables: template.variables });
    try {
      await sendWhatsAppMessage(testPhone, template.name, template.variables);
      console.log(`[WHATSAPP_TEMPLATE_TEST] ${template.name}: SUCCESS`);
      results.push({ template: template.name, status: "SUCCESS", detail: "Delivered to CRM" });
    } catch (error) {
      console.error(`[WHATSAPP_TEMPLATE_TEST] ${template.name}: FAILED - ${error.message}`);
      results.push({ template: template.name, status: "FAILED", detail: error.message });
    }
    await delay(2000);
  }

  console.table(results);
  if (results.some((result) => result.status === "FAILED")) process.exitCode = 1;
}
