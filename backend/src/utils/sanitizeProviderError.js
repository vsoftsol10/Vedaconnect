const MAX_PROVIDER_ERROR_TEXT_LENGTH = 500;

export const sanitizeProviderErrorText = (value, maxLength = MAX_PROVIDER_ERROR_TEXT_LENGTH) => String(value || "Unknown provider error")
  .replace(/Bearer\s+[^\s,;"']+/gi, "Bearer [REDACTED]")
  .replace(/\b(access_token|token|authorization)\b\s*(?:[:=]\s*|:\s*)(?:"[^"]*"|'[^']*'|[^\s,}&]+)/gi, "$1: [REDACTED]")
  .replace(/\d{8,}/g, (digits) => `XXXX${digits.slice(-4)}`)
  .slice(0, maxLength);
