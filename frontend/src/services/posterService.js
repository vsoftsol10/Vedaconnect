import api from "./api";
export const getPosters = async () => (await api.get("/posters")).data.data;
export const getAdminPosters = async () => (await api.get("/admin/posters")).data.data;
export const createPoster = async (values, file) => { const form = new FormData(); Object.entries(values).forEach(([key, value]) => form.append(key, value || "")); form.append("file", file); return (await api.post("/admin/posters", form)).data.data; };
export const updatePoster = async (id, values) => (await api.patch(`/admin/posters/${id}`, values)).data.data;
export const posterAction = async (id, action) => (await api.post(`/admin/posters/${id}/${action}`)).data.data;
export const deletePoster = async (id) => (await api.delete(`/admin/posters/${id}`)).data.data;
