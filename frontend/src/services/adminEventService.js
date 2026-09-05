import api from "./api";

export const getAdminEvents = async () => {
  const res = await api.get("/admin/events");
  return res.data.data;
};

export const getAdminEventById = async (id) => {
  const res = await api.get(`/admin/events/${id}`);
  return res.data.data;
};

export const createEvent = async (payload) => {
  const res = await api.post("/admin/events", payload);
  return res.data.data;
};

export const updateEvent = async (id, payload) => {
  const res = await api.put(`/admin/events/${id}`, payload);
  return res.data.data;
};
