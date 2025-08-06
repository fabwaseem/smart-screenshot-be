import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { screenshotController } from "./controllers/screenshotController";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/requestLogger";
import { PuppeteerService } from "./services/PuppeteerService";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// Create a global Puppeteer service instance for health checks
const globalPuppeteerService = new PuppeteerService();

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

// Basic health check endpoint for Railway (no dependencies)
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0"
  });
});

// Detailed health check with Puppeteer status
app.get("/health/detailed", async (req: Request, res: Response) => {
  try {
    const puppeteerStatus = await globalPuppeteerService.getStatus();

    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0",
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      puppeteer: puppeteerStatus
    });
  } catch (error) {
    console.error("Detailed health check error:", error);
    res.status(500).json({
      status: "error",
      message: "Detailed health check failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});// API routes
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

// Start server with error handling
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Screenshot Backend Server running on port ${PORT}`);
  console.log(`📷 Ready to capture screenshots with 3x scaling`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check available at: http://0.0.0.0:${PORT}/health`);
});

server.on('error', (error: any) => {
  console.error('❌ Server startup error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Keep server alive
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

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
