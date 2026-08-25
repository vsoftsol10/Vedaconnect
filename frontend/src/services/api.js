import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vedaconnect_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
