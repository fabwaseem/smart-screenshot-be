import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error occurred:", err);

  // Default error response
  let statusCode = 500;
  let message = "Internal Server Error";
  let code = "INTERNAL_ERROR";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    code = "VALIDATION_ERROR";
  } else if (err.name === "TimeoutError") {
    statusCode = 408;
    message = "Request Timeout";
    code = "TIMEOUT_ERROR";
  } else if (err.message?.includes("Invalid URL")) {
    statusCode = 400;
    message = "Invalid URL provided";
    code = "INVALID_URL";
  } else if (err.message?.includes("Element not found")) {
    statusCode = 404;
    message = "Element not found";
    code = "ELEMENT_NOT_FOUND";
  } else if (err.message?.includes("Navigation failed")) {
    statusCode = 400;
    message = "Failed to navigate to URL";
    code = "NAVIGATION_FAILED";
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === "development" && {
        details: err.message,
        stack: err.stack,
      }),
    },
  });
};
