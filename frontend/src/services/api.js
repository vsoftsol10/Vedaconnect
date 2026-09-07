import axios from "axios";

const AUTH_TOKEN_STORAGE_KEY = "vedaconnect_token";
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, "");
const apiBaseUrl = normalizedBaseUrl.endsWith("/api")
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = typeof token === "string" && token.trim() ? token.trim() : null;
};

const getAccessToken = () => accessToken || localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    if (typeof config.headers?.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const fieldErrors = data?.errors
      ? Object.values(data.errors).flat().filter(Boolean).join(" ")
      : "";
    const message =
      fieldErrors ||
      data?.message ||
      (error.code === "ECONNABORTED"
        ? "The server took too long to respond. Please try again."
        : error.message) ||
      "Something went wrong. Please try again.";

    return Promise.reject(
      Object.assign(new Error(message), {
        status: error.response?.status,
        errors: data?.errors,
      })
    );
  }
);

export default api;
