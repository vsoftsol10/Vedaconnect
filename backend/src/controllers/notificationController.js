import * as notificationService from "../services/notificationService.js";

export const getMine = async (req, res, next) => {
  try {
    const data = await notificationService.listMyNotifications(req.user.userId, req.query.limit);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await notificationService.getUnreadCount(req.user.userId);
    res.status(200).json({ success: true, data: { unreadCount } });
  } catch (err) {
    next(err);
  }
};

export const markOneRead = async (req, res, next) => {
  try {
    const data = await notificationService.markAsRead(req.params.id, req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const data = await notificationService.markAllAsRead(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const markMineRead = markAllRead;
