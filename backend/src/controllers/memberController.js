import * as memberService from "../services/memberService.js";
import * as documentService from "../services/documentService.js";

export const getMe = async (req, res, next) => {
  try {
    const profile = await memberService.getMyProfile(req.user.userId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};
export const getMyStats = async (req, res, next) => {
  try {
    const stats = await memberService.getMyStats(req.user.userId);
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

export const getMyUpcomingEvents = async (req, res, next) => {
  try {
    const events = await memberService.getMyUpcomingEvents(req.user.userId);
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};
export const listMembers = async (req, res, next) => {
  try {
    const { search, category, location, membershipStatus, membershipTier } = req.query;
    const members = await memberService.listMembers({ search, category, location, membershipStatus, membershipTier });
    res.status(200).json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
};

export const getMemberDetail = async (req, res, next) => {
  try {
    const member = await memberService.getMemberDetail(req.params.userId);
    res.status(200).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};
export const getMyFullProfile = async (req, res, next) => {
  try {
    const profile = await memberService.getMyFullProfile(req.user.userId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) { next(err); }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const updated = await memberService.updateMyProfile(req.user.userId, req.validatedBody);
    res.status(200).json({ success: true, data: updated });
  } catch (err) { next(err); }
};
export const listMyDocuments = async (req, res, next) => { try { res.json({ success: true, data: await documentService.listMemberDocuments(req.user.userId) }); } catch (err) { next(err); } };
export const uploadMyDocument = async (req, res, next) => { try { res.status(201).json({ success: true, data: await documentService.uploadMemberDocument(req.user.userId, req.body, req.file) }); } catch (err) { next(err); } };
export const getMyDocumentUrl = async (req, res, next) => { try { res.json({ success: true, data: await documentService.getMemberDocumentUrl(req.user.userId, req.params.id) }); } catch (err) { next(err); } };
export const deleteMyDocument = async (req, res, next) => { try { res.json({ success: true, data: await documentService.deleteMemberDocument(req.user.userId, req.params.id) }); } catch (err) { next(err); } };
export const getBirthdayToday = async (req, res, next) => { try { res.json({ success: true, data: await memberService.getBirthdayToday(req.user.userId) }); } catch (err) { next(err); } };

export const changeMyPassword = async (req, res, next) => {
  try {
    res.json({ success: true, data: await memberService.changeMyPassword(req.user.userId, req.validatedBody) });
  } catch (err) { next(err); }
};
