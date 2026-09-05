import api from "./api";

export const getNotifications = async () => (await api.get("/notifications")).data.data;
export const markNotificationsRead = async () => (await api.patch("/notifications/read")).data.data;
export const getUnreadCount = async () => (await api.get("/notifications/unread-count")).data.data;
export const markNotificationRead = async (id) => (await api.patch(`/notifications/${id}/read`)).data.data;
export const markAllNotificationsRead = async () => (await api.patch("/notifications/read-all")).data.data;
