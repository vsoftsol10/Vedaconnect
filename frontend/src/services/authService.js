import api from "./api";

export const login = async ({ memberId, password, hub }) => {
  const { data } = await api.post("/auth/login", { memberId, password, hub });
  return data.data; // { token, user }
};

export const loginAdmin = async ({ email, password }) => {
  const { data } = await api.post("/auth/admin-login", { email, password });
  return data.data; // { token, user }
};
