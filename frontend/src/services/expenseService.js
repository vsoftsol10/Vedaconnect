import api from "./api";

export const getExpenseSummary = async (params = {}) => (await api.get("/expenses/summary", { params })).data.data;
export const getExpenses = async (params = {}) => (await api.get("/expenses", { params })).data.data;
const expenseFormData = (payload, receipt) => {
  const data = new FormData();
  data.append("data", JSON.stringify({ ...payload, receiptUrl: payload.receiptUrl || null }));
  if (receipt) data.append("receipt", receipt);
  return data;
};
export const createExpense = async (payload, receipt) => {
  const data = expenseFormData(payload, receipt);
  return (await api.post("/expenses", data, { headers: { "Content-Type": "multipart/form-data" } })).data.data;
};
export const updateExpense = async (id, payload, receipt) => {
  const data = expenseFormData(payload, receipt);
  return (await api.put(`/expenses/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } })).data.data;
};
export const deleteExpense = async (id) => (await api.delete(`/expenses/${id}`)).data.data;
export const sendExpenseSummary = async (payload) => (await api.post("/expenses/notify", payload)).data.data;
export const getExpenseNotificationLogs = async (params) => (await api.get("/expenses/notification-logs", { params })).data.data;
export const getExpenseCategories = async (q = "") => (await api.get("/admin/expenses/categories", { params: { q } })).data.data;
const manualFeeFormData = (payload, receipt) => { const data = new FormData(); data.append("data", JSON.stringify(payload)); if (receipt) data.append("receipt", receipt); return data; };
export const getManualFeeCollections = async (params) => (await api.get("/expenses/manual-fees", { params })).data.data;
export const createManualFeeCollection = async (payload, receipt) => (await api.post("/expenses/manual-fees", manualFeeFormData(payload, receipt), { headers: { "Content-Type": "multipart/form-data" } })).data.data;
export const updateManualFeeCollection = async (id, payload, receipt) => (await api.put(`/expenses/manual-fees/${id}`, manualFeeFormData(payload, receipt), { headers: { "Content-Type": "multipart/form-data" } })).data.data;
export const deleteManualFeeCollection = async (id) => (await api.delete(`/expenses/manual-fees/${id}`)).data.data;
export const getManualFeeReceiptUrl = async (id) => (await api.get(`/expenses/manual-fees/${id}/receipt-url`)).data.data;
