import api from "./api";

export const createMeetingFeeOrder = async () =>
  (await api.post("/meeting-fee/create-order")).data.data;
export const verifyMeetingFeePayment = async (payload) =>
  (await api.post("/meeting-fee/verify", payload)).data.data;
export const getMeetingFeeStatus = async () => (await api.get("/meeting-fee/status")).data.data;
export const getMonthlyMeetingFees = async () => (await api.get("/meeting-fee/month")).data.data;
