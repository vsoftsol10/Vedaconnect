import api from "./api";

export const getMyAttendanceStatus = async () => (await api.get("/attendance/me")).data.data;
export const confirmAttendance = async () => (await api.post("/attendance/confirm")).data.data;
export const declineAttendance = async () => (await api.post("/attendance/decline")).data.data;
export const getWeeklyAttendance = async () => (await api.get("/attendance/week")).data.data;
