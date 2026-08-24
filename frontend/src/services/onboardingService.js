import api from "./api";

const unwrap = (response) => response.data?.data;

export const submitPersonalDetails = async (payload) => {
  const response = await api.post("/onboarding/personal-details", payload);
  return unwrap(response);
};

export const submitBusinessDetails = async (payload) => {
  const response = await api.put("/onboarding/business-details", payload);
  return unwrap(response);
};

export const uploadBusinessCertificate = async ({ userId, certificates }) => {
  const formData = new FormData();
  formData.append("userId", userId);
  certificates.forEach((certificate) => {
    formData.append("certificates", certificate);
  });

  const response = await api.post("/onboarding/business-certificate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(response);
};

export const getMembershipPlans = async () => {
  const response = await api.get("/onboarding/plans");
  return unwrap(response);
};

export const submitMembershipSelection = async (payload) => {
  const response = await api.post("/onboarding/membership", payload);
  return unwrap(response);
};

export const createRazorpayOrder = async (payload) => {
  const response = await api.post("/onboarding/payment/create-order", payload);
  return unwrap(response);
};

export const verifyRazorpayPayment = async (payload) => {
  const response = await api.post("/onboarding/payment/verify", payload);
  return unwrap(response);
};

export const confirmPayment = async (payload) => {
  const response = await api.post("/onboarding/confirm-payment", payload);
  return unwrap(response);
};
