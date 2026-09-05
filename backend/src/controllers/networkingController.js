import * as networkingService from "../services/networkingService.js";

export const createReferral = async (req, res, next) => {
  try {
    const data = await networkingService.logReferralGiven({
      giverId: req.user.userId,
      ...req.validatedBody,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getMyReferrals = async (req, res, next) => {
  try {
    const data = await networkingService.getMyReferralsGiven(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createBusinessReceived = async (req, res, next) => {
  try {
    const data = await networkingService.logBusinessReceived({
      receiverId: req.user.userId,
      ...req.validatedBody,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getMyBusinessReceived = async (req, res, next) => {
  try {
    const data = await networkingService.getMyBusinessReceived(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const weeklyLeaderboard = async (req, res, next) => {
  try {
    const data = await networkingService.getWeeklyLeaderboard(req.validatedQuery.value);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const monthlyLeaderboard = async (req, res, next) => {
  try {
    const data = await networkingService.getMonthlyLeaderboard(req.validatedQuery.value);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const leaderboard = async (req, res, next) => {
  try {
    const data = await networkingService.getLeaderboard(req.validatedQuery);
    const years = await networkingService.getLeaderboardYears();
    res.status(200).json({ success: true, data: { ...data, years } });
  } catch (err) {
    next(err);
  }
};

export const adminLeaderboard = async (req, res, next) => {
  try {
    const data = await networkingService.getAdminLeaderboard(req.validatedQuery);
    const years = await networkingService.getLeaderboardYears();
    res.status(200).json({ success: true, data: { ...data, years } });
  } catch (err) {
    next(err);
  }
};
