const DEFAULT_MEMBER_APP_BASE_URL = "http://localhost:5173";

export const getMemberAppBaseUrl = () => {
  const configuredUrl = [process.env.MEMBER_APP_BASE_URL, process.env.FRONTEND_ORIGIN, DEFAULT_MEMBER_APP_BASE_URL]
    .map((url) => url?.trim())
    .find(Boolean);

  return configuredUrl.replace(/\/$/, "");
};
