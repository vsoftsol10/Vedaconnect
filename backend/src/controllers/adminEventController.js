import * as eventService from "../services/adminEventService.js";

export async function getEvents(req, res, next) {
  try {
    const events = await eventService.listEvents();
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
}

export async function getEvent(req, res, next) {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
}

export async function postEvent(req, res, next) {
  try {
    const event = await eventService.createEvent(req.validatedBody);
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
}

export async function putEvent(req, res, next) {
  try {
    const event = await eventService.updateEvent(req.params.id, req.validatedBody);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
}

export async function deleteEvent(req, res, next) {
  try {
    await eventService.deleteEvent(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}
