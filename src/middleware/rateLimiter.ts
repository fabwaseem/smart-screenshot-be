import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};
const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientIp = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();

  // Clean up expired entries
  Object.keys(store).forEach((ip) => {
    if (store[ip].resetTime < now) {
      delete store[ip];
    }
  });

  // Initialize or get current count for this IP
  if (!store[clientIp]) {
    store[clientIp] = {
      count: 0,
      resetTime: now + WINDOW_SIZE,
    };
  }

  const clientData = store[clientIp];

  // Reset if window has expired
  if (clientData.resetTime < now) {
    clientData.count = 0;
    clientData.resetTime = now + WINDOW_SIZE;
  }

  // Increment request count
  clientData.count++;

  // Set rate limit headers
  res.set({
    "X-RateLimit-Limit": MAX_REQUESTS.toString(),
    "X-RateLimit-Remaining": Math.max(
      0,
      MAX_REQUESTS - clientData.count
    ).toString(),
    "X-RateLimit-Reset": new Date(clientData.resetTime).toISOString(),
  });

  // Check if limit exceeded
  if (clientData.count > MAX_REQUESTS) {
    res.status(429).json({
      success: false,
      error: {
        message: "Rate limit exceeded",
        code: "RATE_LIMIT_EXCEEDED",
        timestamp: new Date().toISOString(),
        details: {
          limit: MAX_REQUESTS,
          windowSize: WINDOW_SIZE / 1000,
          resetTime: new Date(clientData.resetTime).toISOString(),
        },
      },
    });
    return;
  }

  next();
};
