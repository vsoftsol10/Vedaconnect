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

export const adminLogin = async (req, res, next) => {
  try {
    const result = await authService.loginAdmin(req.validatedBody);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await authService.requestPasswordReset(req.validatedBody);
    res.json({ success: true, message: "If an active member account matches, a reset link has been sent." });
  } catch (err) { next(err); }
};

export const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.validatedBody);
    res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (err) { next(err); }
};
