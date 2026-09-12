import api from "./api";

export const getAdminDashboard = async () => (await api.get("/admin/dashboard")).data.data;
export const getAdminLeaderboard = async (params = {}) => (await api.get("/admin/leaderboard", { params })).data.data;
export const listAdminMembers = async (params = {}) => (await api.get("/admin/members", { params })).data.data;
export const getAdminMemberDetail = async (userId) => (await api.get(`/admin/members/${userId}`)).data.data;
export const assignMemberHub = async (userId, hubId) => (await api.patch(`/admin/members/${userId}/hub`, { hubId })).data.data;
export const updateMemberJoinedDate = async (userId, joinedAt) => (await api.patch(`/admin/members/${userId}/joined-date`, { joinedAt })).data.data;
export const updateMember = async (userId, data) => (await api.patch(`/admin/members/${userId}`, data)).data.data;
export const suspendMember = async (userId) => (await api.patch(`/admin/members/${userId}/suspend`)).data.data;
export const reactivateMember = async (userId) => (await api.patch(`/admin/members/${userId}/reactivate`)).data.data;
export const deleteMember = async (userId) => (await api.delete(`/admin/members/${userId}`)).data.data;
export const listAdminHubs = async () => (await api.get("/admin/hubs")).data.data;
export const getMembershipPlansAdmin = async () => (await api.get("/onboarding/plans")).data.data;
export const listSubscriptions = async () => (await api.get("/admin/subscriptions")).data.data;
export const createSubscription = async (data) => (await api.post("/admin/subscriptions", data)).data.data;
export const updateSubscription = async (id, data) => (await api.put(`/admin/subscriptions/${id}`, data)).data.data;
export const toggleSubscription = async (id) => (await api.patch(`/admin/subscriptions/${id}/toggle`)).data.data;
export const listMembershipPayments = async () => (await api.get("/admin/payments/membership")).data.data;
export const verifyMembershipPayment = async (id) => (await api.patch(`/admin/payments/membership/${id}/verify`)).data.data;
export const rejectMembershipPayment = async (id) => (await api.patch(`/admin/payments/membership/${id}/reject`)).data.data;

export const listEventPayments = async () => (await api.get("/admin/payments/events")).data.data;
export const verifyEventPayment = async (id) => (await api.patch(`/admin/payments/events/${id}/verify`)).data.data;
export const rejectEventPayment = async (id) => (await api.patch(`/admin/payments/events/${id}/reject`)).data.data;

export const getAdminProfile = async () => (await api.get("/admin/profile")).data.data;
export const updateAdminProfile = async (data, profilePhotoFile) => {
  if (profilePhotoFile) {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    formData.append("profilePhoto", profilePhotoFile);
    return (await api.put("/admin/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })).data.data;
  }
  return (await api.put("/admin/profile", data)).data.data;
};
export const changeAdminPassword = async (data) => (await api.put("/admin/profile/password", data)).data.data;

export const createMember = async (formValues, certificateFile) => {
  const formData = new FormData();
  formData.append("data", JSON.stringify(formValues));
  if (certificateFile) formData.append("certificate", certificateFile);
  return (await api.post("/admin/members", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })).data.data;
};
