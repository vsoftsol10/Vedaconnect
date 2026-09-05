import * as hubService from "../services/hubService.js";

export async function getHubs(req, res, next) {
  try {
    const hubs = await hubService.listHubs();
    res.json({ success: true, data: hubs });
  } catch (err) {
    next(err);
  }
}

export async function getHub(req, res, next) {
  try {
    const hub = await hubService.getHubById(req.params.id);
    res.json({ success: true, data: hub });
  } catch (err) {
    next(err);
  }
}

export async function postHub(req, res, next) {
  try {
    const hub = await hubService.createHub(req.validatedBody);
    res.status(201).json({ success: true, data: hub });
  } catch (err) {
    next(err);
  }
}

export async function putHub(req, res, next) {
  try {
    const hub = await hubService.updateHub(req.params.id, req.validatedBody);
    res.json({ success: true, data: hub });
  } catch (err) {
    next(err);
  }
}

export async function deleteHub(req, res, next) {
  try {
    const hub = await hubService.deactivateHub(req.params.id);
    res.json({ success: true, data: hub });
  } catch (err) {
    next(err);
  }
}
