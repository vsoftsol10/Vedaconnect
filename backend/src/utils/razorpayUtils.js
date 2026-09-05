import { AppError } from "../middleware/errorHandler.js";

export const createRazorpayOrder = async (payload) => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new AppError("Razorpay credentials are not configured.", 500);
  }

  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data?.error?.description ||
      data?.description ||
      (response.status === 401
        ? "Razorpay rejected the payment credentials. Check backend/.env and restart the backend server."
        : "Could not create Razorpay order.");
    throw new AppError(message, response.status === 401 ? 502 : response.status);
  }

  return data;
};
