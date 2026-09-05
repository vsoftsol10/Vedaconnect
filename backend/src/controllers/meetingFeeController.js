import * as meetingFeeService from "../services/meetingFeeService.js";
import { getCurrentMonthKey } from "../utils/weekUtils.js";

export const createOrder = async (req, res, next) => {
  try {
    const data = await meetingFeeService.createMeetingFeeOrder(req.user.userId);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const verify = async (req, res, next) => {
  try {
    const data = await meetingFeeService.verifyMeetingFeePayment({
      userId: req.user.userId,
      ...req.validatedBody,
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getStatus = async (req, res, next) => {
  try {
    const data = await meetingFeeService.getMyMeetingFeeStatus(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getMonth = async (req, res, next) => {
  try {
    const data = await meetingFeeService.getMonthlyMeetingFeeList(
      req.validatedQuery.month || getCurrentMonthKey()
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
