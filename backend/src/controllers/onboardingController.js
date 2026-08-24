import * as onboardingService from "../services/onboardingService.js";
import { AppError } from "../middleware/errorHandler.js";

const DB_TIMEOUT_MS = 15000;
const DB_TIMEOUT_MESSAGE =
  "Database is taking too long to respond. Check the Supabase connection and try again.";

const withDatabaseTimeout = (promise) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new AppError(DB_TIMEOUT_MESSAGE, 504)), DB_TIMEOUT_MS);
    }),
  ]);

export const personalDetails = async (req, res, next) => {
  try {
    const result = await withDatabaseTimeout(
      onboardingService.submitPersonalDetails(req.validatedBody)
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const businessDetails = async (req, res, next) => {
  try {
    const result = await withDatabaseTimeout(
      onboardingService.submitBusinessDetails(req.validatedBody)
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const businessCertificate = async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: "No files uploaded." });
    }
    if (!req.body.userId) {
      return res.status(400).json({ success: false, message: "userId is required." });
    }

    const result = await withDatabaseTimeout(
      onboardingService.submitBusinessCertificates({
        userId: req.body.userId,
        files: req.files,
      })
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const listBusinessCertificates = async (req, res, next) => {
  try {
    const certificates = await withDatabaseTimeout(
      onboardingService.getBusinessCertificates(req.params.userId)
    );
    res.status(200).json({ success: true, data: certificates });
  } catch (err) {
    next(err);
  }
};

export const deleteBusinessCertificate = async (req, res, next) => {
  try {
    const result = await withDatabaseTimeout(
      onboardingService.removeBusinessCertificate(req.params.certificateId)
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getPlans = async (req, res, next) => {
  try {
    const plans = await withDatabaseTimeout(onboardingService.getActiveMembershipPlans());
    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

export const selectMembership = async (req, res, next) => {
  try {
    const result = await withDatabaseTimeout(
      onboardingService.submitMembershipSelection(req.validatedBody)
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const result = await withDatabaseTimeout(
      onboardingService.createRazorpayMembershipOrder(req.validatedBody)
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const result = await withDatabaseTimeout(
      onboardingService.verifyRazorpayMembershipPayment(req.validatedBody)
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const confirmPayment = async (req, res, next) => {
  try {
    const result = await withDatabaseTimeout(
      onboardingService.confirmPaymentSubmitted(req.validatedBody)
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
