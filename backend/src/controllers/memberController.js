import * as memberService from "../services/memberService.js";

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
    const { search, category, location } = req.query;
    const members = await memberService.listMembers({ search, category, location });
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
    const updated = await memberService.updateMyProfile(req.user.userId, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (err) { next(err); }
};