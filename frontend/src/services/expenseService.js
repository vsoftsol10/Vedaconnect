import api from "./api";

export const getExpenseSummary = async (params = {}) => (await api.get("/expenses/summary", { params })).data.data;
export const getExpenses = async (params = {}) => (await api.get("/expenses", { params })).data.data;
export const createExpense = async (payload, receipt) => {
  const data = new FormData();
  data.append("data", JSON.stringify(payload));
  if (receipt) data.append("receipt", receipt);
  return (await api.post("/expenses", data, { headers: { "Content-Type": "multipart/form-data" } })).data.data;
};
export const updateExpense = async (id, payload, receipt) => {
  const data = new FormData();
  data.append("data", JSON.stringify(payload));
  if (receipt) data.append("receipt", receipt);
  return (await api.put(`/expenses/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } })).data.data;
};
export const deleteExpense = async (id) => (await api.delete(`/expenses/${id}`)).data.data;
export const sendExpenseSummary = async (payload) => (await api.post("/expenses/notify", payload)).data.data;
export const getExpenseNotificationLogs = async (params) => (await api.get("/expenses/notification-logs", { params })).data.data;
