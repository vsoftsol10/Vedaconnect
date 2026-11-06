import * as attendanceService from "../services/attendanceService.js";
import * as networkingService from "../services/networkingService.js";

export const saveWeeklyAward = async (req, res, next) => {
  try {
    const data = await networkingService.saveManualWeeklyAward(req.validatedBody);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyAwardActivity = async (req, res, next) => {
  try {
    const data = await networkingService.getManualWeeklyAwardActivity(req.validatedQuery);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateWeeklyAward = async (req, res, next) => {
  try {
    const data = await networkingService.updateManualWeeklyAward(req.params.id, req.validatedBody);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteWeeklyAward = async (req, res, next) => {
  try {
    const data = await networkingService.deleteManualWeeklyAward(req.validatedParams.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateMemberAwardActivity = async (req, res, next) => {
  try {
    const data = await networkingService.updateMemberAwardActivity(
      req.validatedParams.type,
      req.validatedParams.id,
      req.validatedBody.amount,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteMemberAwardActivity = async (req, res, next) => {
  try {
    const data = await networkingService.deleteMemberAwardActivity(
      req.validatedParams.type,
      req.validatedParams.id,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const saveAttendance = async (req, res, next) => {
  try {
    const data = await attendanceService.saveManualAttendance(req.validatedBody);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
