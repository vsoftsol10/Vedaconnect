import api from "./api";

export const getMyProfile = async () => {
  const { data } = await api.get("/members/me");
  return data.data;
};
export const getMyStats = async () => {
  const { data } = await api.get("/members/me/stats");
  return data.data;
};

export const getMyUpcomingEvents = async () => {
  const { data } = await api.get("/members/me/upcoming-events");
  return data.data;
};
export const listMembers = async (params = {}) => {
  const { data } = await api.get("/members", { params });
  return data.data;
};

export const getMemberDetail = async (userId) => {
  const { data } = await api.get(`/members/${userId}`);
  return data.data;
};
export const getMyFullProfile = async () => (await api.get("/members/me/full")).data.data;
export const updateMyProfile = async (payload) => (await api.put("/members/me", payload)).data.data;