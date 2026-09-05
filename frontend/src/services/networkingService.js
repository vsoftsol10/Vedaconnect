import api from "./api";

export const logReferral = async (payload) => (await api.post("/networking/referrals", payload)).data.data;
export const getMyReferrals = async () => (await api.get("/networking/referrals/mine")).data.data;

export const logBusinessReceived = async (payload) =>
  (await api.post("/networking/business-received", payload)).data.data;
export const getMyBusinessReceived = async () =>
  (await api.get("/networking/business-received/mine")).data.data;

export const getLeaderboard = async (params = {}) =>
  (await api.get("/leaderboard", { params })).data.data;
export const getWeeklyLeaderboard = async () => getLeaderboard({ period: "week" });
export const getMonthlyLeaderboard = async () => getLeaderboard({ period: "month" });
