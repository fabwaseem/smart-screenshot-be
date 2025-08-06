import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Log incoming request
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);

  // Log request body for POST requests (truncated for large payloads)
  if (req.method === "POST" && req.body) {
    const bodyStr = JSON.stringify(req.body);
    const truncatedBody =
      bodyStr.length > 200 ? bodyStr.substring(0, 200) + "..." : bodyStr;
    console.log(`[${timestamp}] Request Body: ${truncatedBody}`);
  }

  // Hook into response finish event to log completion
  res.on("finish", () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const status = res.statusCode;

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${
        req.url
      } - ${status} - ${duration}ms`
    );
  });

  next();
};
