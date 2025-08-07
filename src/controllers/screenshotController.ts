import { Router, Request, Response } from "express";
import { PuppeteerService } from "../services/PuppeteerService";
import { ScreenshotRequest, ScreenshotResponse } from "../types";
import { validateUrl, validateScreenshotRequest } from "../utils/validators";

const router = Router();
const puppeteerService = new PuppeteerService();

// Generic screenshot endpoint
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const request: ScreenshotRequest = req.body;

    // Validate request
    const validation = validateScreenshotRequest(request);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: {
          message: "Invalid request",
          code: "VALIDATION_ERROR",
          details: validation.errors,
        },
      });
      return;
    }

    const screenshotBuffer = await puppeteerService.takeScreenshot(request);
    const base64Image = screenshotBuffer.toString("base64");

    const response: ScreenshotResponse = {
      success: true,
      data: {
        image: base64Image,
        format: request.options?.format || "png",
        width: 0, // Will be calculated from buffer if needed
        height: 0, // Will be calculated from buffer if needed
        timestamp: Date.now(),
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Screenshot error:", error);

    const response: ScreenshotResponse = {
      success: false,
      error: {
        message: error.message || "Screenshot failed",
        code: "SCREENSHOT_ERROR",
      },
    };

    res.status(500).json(response);
  }
});

// Full page screenshot
router.post("/fullpage", async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, options } = req.body;

    if (!validateUrl(url)) {
      res.status(400).json({
        success: false,
        error: {
          message: "Invalid URL provided",
          code: "INVALID_URL",
        },
      });
      return;
    }

    const request: ScreenshotRequest = {
      url,
      type: "fullpage",
      options: {
        scaleFactor: parseInt(process.env.DEFAULT_SCALE_FACTOR || "3"),
        fullPage: true,
        ...options,
      },
    };

    const screenshotBuffer = await puppeteerService.takeScreenshot(request);
    const base64Image = screenshotBuffer.toString("base64");

    const response: ScreenshotResponse = {
      success: true,
      data: {
        image: base64Image,
        format: request.options?.format || "png",
        width: 0,
        height: 0,
        timestamp: Date.now(),
      },
      ...req.body,
    };

    res.json(response);
  } catch (error: any) {
    console.error("Full page screenshot error:", error);

    res.status(500).json({
      success: false,
      error: {
        message: error.message || "Full page screenshot failed",
        code: "SCREENSHOT_ERROR",
      },
    });
  }
});

// Area/region screenshot
router.post("/area", async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, area, options } = req.body;

    if (!validateUrl(url)) {
      res.status(400).json({
        success: false,
        error: {
          message: "Invalid URL provided",
          code: "INVALID_URL",
        },
      });
      return;
    }

    if (
      !area ||
      typeof area.x !== "number" ||
      typeof area.y !== "number" ||
      typeof area.width !== "number" ||
      typeof area.height !== "number"
    ) {
      res.status(400).json({
        success: false,
        error: {
          message: "Valid area coordinates (x, y, width, height) are required",
          code: "MISSING_AREA",
        },
      });
      return;
    }

    const request: ScreenshotRequest = {
      url,
      type: "area",
      area,
      options: {
        scaleFactor: parseInt(process.env.DEFAULT_SCALE_FACTOR || "3"),
        ...options,
      },
      ...req.body,
    };

    const screenshotBuffer = await puppeteerService.takeScreenshot(request);
    const base64Image = screenshotBuffer.toString("base64");

    const response: ScreenshotResponse = {
      success: true,
      data: {
        image: base64Image,
        format: request.options?.format || "png",
        width: 0,
        height: 0,
        timestamp: Date.now(),
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Area screenshot error:", error);

    res.status(500).json({
      success: false,
      error: {
        message: error.message || "Area screenshot failed",
        code: "SCREENSHOT_ERROR",
      },
    });
  }
});

// Get page dimensions
router.post(
  "/dimensions",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.body;

      if (!validateUrl(url)) {
        res.status(400).json({
          success: false,
          error: {
            message: "Invalid URL provided",
            code: "INVALID_URL",
          },
        });
        return;
      }

      const dimensions = await puppeteerService.getPageDimensions(url);

      res.json({
        success: true,
        data: {
          ...dimensions,
          timestamp: Date.now(),
        },
      });
    } catch (error: any) {
      console.error("Get dimensions error:", error);

      res.status(500).json({
        success: false,
        error: {
          message: error.message || "Failed to get page dimensions",
          code: "DIMENSIONS_ERROR",
        },
      });
    }
  }
);

// Graceful shutdown handler
process.on("SIGTERM", async () => {
  console.log("Closing Puppeteer service...");
  await puppeteerService.close();
});

process.on("SIGINT", async () => {
  console.log("Closing Puppeteer service...");
  await puppeteerService.close();
});

export { router as screenshotController };
