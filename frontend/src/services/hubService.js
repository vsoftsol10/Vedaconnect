import api from "./api";

export const getHubs = async () => {
  const res = await api.get("/admin/hubs");
  return res.data.data;
};

export const getHubById = async (id) => {
  const res = await api.get(`/admin/hubs/${id}`);
  return res.data.data;
};

export const createHub = async (payload) => {
  const res = await api.post("/admin/hubs", payload);
  return res.data.data;
};

export const updateHub = async (id, payload) => {
  const res = await api.put(`/admin/hubs/${id}`, payload);
  return res.data.data;
};
