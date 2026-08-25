import api from "./api";

export const getUpcomingEvents = async () => (await api.get("/events/upcoming")).data.data;
export const getPastEvents = async () => (await api.get("/events/past")).data.data;
export const getMyEvents = async () => (await api.get("/events/mine")).data.data;
export const getEventDetail = async (eventId) => (await api.get(`/events/${eventId}`)).data.data;
export const registerForEvent = async (eventId) => (await api.post(`/events/${eventId}/register`)).data.data;