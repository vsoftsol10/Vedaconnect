/**
 * Standard error shape thrown by services/controllers.
 * Usage: throw new AppError("Member not found", 404);
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const isOperational = err.isOperational || false;
  const statusCode = isOperational ? err.statusCode || 500 : 500;

  if (!isOperational) {
    // Unexpected error - log full detail server-side, don't leak internals to client
    console.error("[UNEXPECTED ERROR]", err);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : "Something went wrong. Please try again.",
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
