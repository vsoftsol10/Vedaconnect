import * as authService from "../services/authService.js";

export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.validatedBody);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};