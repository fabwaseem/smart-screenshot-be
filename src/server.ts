import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { screenshotController } from "./controllers/screenshotController";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/requestLogger";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Custom middleware
app.use(requestLogger);
app.use(rateLimiter);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API routes
app.use("/api/screenshot", screenshotController);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "Screenshot Backend API",
    version: "1.0.0",
    description: "Puppeteer-based screenshot service with 3x scaling support",
    endpoints: {
      health: "/health",
      screenshot: "/api/screenshot",
      fullpage: "/api/screenshot/fullpage",
      element: "/api/screenshot/element",
      area: "/api/screenshot/area",
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Screenshot Backend Server running on port ${PORT}`);
  console.log(`📷 Ready to capture screenshots with 3x scaling`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

export default app;
