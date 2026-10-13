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

export const saveAttendance = async (req, res, next) => {
  try {
    const data = await attendanceService.saveManualAttendance(req.validatedBody);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
