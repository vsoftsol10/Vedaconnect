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
  const formData = new FormData();
  const { poster, ...eventData } = payload;
  formData.append("data", JSON.stringify(eventData));
  if (poster) formData.append("poster", poster);
  const res = await api.post("/admin/events", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const updateEvent = async (id, payload) => {
  const formData = new FormData();
  const { poster, ...eventData } = payload;
  formData.append("data", JSON.stringify(eventData));
  if (poster) formData.append("poster", poster);
  const res = await api.put(`/admin/events/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};
