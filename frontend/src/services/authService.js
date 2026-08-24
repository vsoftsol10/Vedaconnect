import api from "./api";

export const login = async ({ email, password, hub }) => {
  const { data } = await api.post("/auth/login", { email, password, hub });
  return data.data; // { token, user }
};