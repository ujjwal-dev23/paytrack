import type { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

/**
 * Global Error Handler Middleware
 * Must be placed after all routes in the app stack.
 */
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log the error for the developer
  console.error(`[Error] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    // Only show stack trace in development mode
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export { errorHandler };
