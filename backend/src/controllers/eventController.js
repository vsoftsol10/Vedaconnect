import * as eventService from "../services/eventService.js";

export const listUpcoming = async (req, res, next) => {
  try {
    res.json({ success: true, data: await eventService.getUpcomingEvents(req.user.userId) });
  } catch (err) { next(err); }
};

export const listPast = async (req, res, next) => {
  try {
    res.json({ success: true, data: await eventService.getPastEvents(req.user.userId) });
  } catch (err) { next(err); }
};

export const listMine = async (req, res, next) => {
  try {
    res.json({ success: true, data: await eventService.getMyEvents(req.user.userId) });
  } catch (err) { next(err); }
};

export const getDetail = async (req, res, next) => {
  try {
    res.json({ success: true, data: await eventService.getEventDetail(req.params.eventId, req.user.userId) });
  } catch (err) { next(err); }
};

export const register = async (req, res, next) => {
  try {
    const result = await eventService.registerForEvent({
      userId: req.user.userId,
      eventId: req.params.eventId,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};
