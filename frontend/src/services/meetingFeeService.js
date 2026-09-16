import api from "./api";

export const createMeetingFeeOrder = async () =>
  (await api.post("/meeting-fee/create-order")).data.data;
export const verifyMeetingFeePayment = async (payload) =>
  (await api.post("/meeting-fee/verify", payload)).data.data;
export const getMeetingFeeStatus = async () => (await api.get("/meeting-fee/status")).data.data;
export const getMeetingFeeHistory = async () => (await api.get("/meeting-fee/history")).data.data;
export const createMembershipRenewalOrder = async () =>
  (await api.post("/meeting-fee/renewal/create-order")).data.data;
export const verifyMembershipRenewalPayment = async (payload) =>
  (await api.post("/meeting-fee/renewal/verify", payload)).data.data;
export const getMonthlyMeetingFees = async () => (await api.get("/meeting-fee/month")).data.data;
