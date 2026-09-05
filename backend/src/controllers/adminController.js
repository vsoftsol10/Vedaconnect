import * as adminService from "../services/adminService.js";

export const getDashboard = async (req, res, next) => {
  try {
    const [stats, membersByHub, recentMembers, eventRegistrations] = await Promise.all([
      adminService.getDashboardStats(),
      adminService.getMembersByHub(),
      adminService.getRecentlyJoinedMembers(),
      adminService.getEventRegistrationSummary(),
    ]);
    res.status(200).json({ success: true, data: { stats, membersByHub, recentMembers, eventRegistrations } });
  } catch (err) { next(err); }
};

export const listMembers = async (req, res, next) => {
  try {
    const { search, hubId, status, membershipType } = req.query;
    res.json({ success: true, data: await adminService.listAllMembers({ search, hubId, status, membershipType }) });
  } catch (err) { next(err); }
};

export const getMemberDetail = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.getMemberDetailForAdmin(req.params.userId) });
  } catch (err) { next(err); }
};

export const assignHub = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.assignMemberHub(req.params.userId, req.body.hubId) });
  } catch (err) { next(err); }
};

export const updateJoinedDate = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.updateMemberJoinedDate(req.params.userId, req.body.joinedAt) });
  } catch (err) { next(err); }
};

export const listHubs = async (req, res, next) => {
  try {
    res.json({ success: true, data: await adminService.listHubs() });
  } catch (err) { next(err); }
};

export const createMember = async (req, res, next) => {
  try {
    const result = await adminService.createMemberByAdmin(req.validatedBody, req.file);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const listSubscriptions = async (req, res, next) => {
  try { res.json({ success: true, data: await adminService.listAllSubscriptions() }); }
  catch (err) { next(err); }
};

export const createSubscriptionHandler = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await adminService.createSubscription(req.validatedBody) }); }
  catch (err) { next(err); }
};

export const updateSubscriptionHandler = async (req, res, next) => {
  try { res.json({ success: true, data: await adminService.updateSubscription(req.params.id, req.validatedBody) }); }
  catch (err) { next(err); }
};

export const toggleSubscriptionHandler = async (req, res, next) => {
  try { res.json({ success: true, data: await adminService.toggleSubscriptionStatus(req.params.id) }); }
  catch (err) { next(err); }
};
export const listMembershipPaymentsHandler = async (req, res, next) => {
  try { res.json({ success: true, data: await adminService.listMembershipPayments() }); }
  catch (err) { next(err); }
};

export const listEventPaymentsHandler = async (req, res, next) => {
  try { res.json({ success: true, data: await adminService.listEventPayments() }); }
  catch (err) { next(err); }
};

export const verifyMembershipPaymentHandler = async (req, res, next) => {
  try { res.json({ success: true, data: await adminService.verifyMembershipPayment(req.params.id) }); }
  catch (err) { next(err); }
};

export const rejectMembershipPaymentHandler = async (req, res, next) => {
  try { res.json({ success: true, data: await adminService.rejectMembershipPayment(req.params.id) }); }
  catch (err) { next(err); }
};

export const verifyEventPaymentHandler = async (req, res, next) => {
  try { res.json({ success: true, data: await adminService.verifyEventPayment(req.params.id) }); }
  catch (err) { next(err); }
};

export const rejectEventPaymentHandler = async (req, res, next) => {
  try { res.json({ success: true, data: await adminService.rejectEventPayment(req.params.id) }); }
  catch (err) { next(err); }
};

export const getProfile = async (req, res, next) => {
  try { res.json({ success: true, data: await adminService.getAdminProfile(req.user.userId) }); }
  catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try { res.json({ success: true, data: await adminService.updateAdminProfile(req.user.userId, req.validatedBody, req.file) }); }
  catch (err) { next(err); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.validatedBody;
    res.json({ success: true, data: await adminService.changeAdminPassword(req.user.userId, currentPassword, newPassword) });
  } catch (err) { next(err); }
};
