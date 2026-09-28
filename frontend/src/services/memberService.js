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
export const getBirthdayToday = async () => (await api.get("/members/birthday-today")).data.data;
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
export const changeMyPassword = async (payload) => (await api.put("/members/me/password", payload)).data.data;
export const listMyDocuments = async () => (await api.get("/members/documents")).data.data;
export const uploadMyDocument = async ({ title, documentType, file }) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("documentType", documentType);
  formData.append("file", file);
  return (await api.post("/members/documents", formData, { headers: { "Content-Type": "multipart/form-data" } })).data.data;
};
export const getMyDocumentUrl = async (id) => (await api.get(`/members/documents/${id}/url`)).data.data;
export const deleteMyDocument = async (id) => (await api.delete(`/members/documents/${id}`)).data.data;
