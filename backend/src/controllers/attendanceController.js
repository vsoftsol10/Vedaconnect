import * as attendanceService from "../services/attendanceService.js";
import { getCurrentWeekStart } from "../utils/weekUtils.js";

export const confirm = async (req, res, next) => {
  try {
    const data = await attendanceService.confirmAttendance(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const decline = async (req, res, next) => {
  try {
    const data = await attendanceService.declineAttendance(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getMine = async (req, res, next) => {
  try {
    const data = await attendanceService.getMyAttendanceStatus(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getWeek = async (req, res, next) => {
  try {
    const weekStart = req.validatedQuery.weekStart || getCurrentWeekStart();
    const data = await attendanceService.getWeeklyAttendanceList(weekStart);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
