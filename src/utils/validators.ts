import { ScreenshotRequest } from "../types";

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export function validateUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateScreenshotRequest(
  request: ScreenshotRequest
): ValidationResult {
  const errors: string[] = [];

  // Validate URL
  if (!validateUrl(request.url)) {
    errors.push("Invalid or missing URL");
  }

  // Validate type
  const validTypes = [ "fullpage", "element", "area"];
  if (!validTypes.includes(request.type)) {
    errors.push(
      "Invalid screenshot type. Must be one of:  fullpage, element, area"
    );
  }

  // Validate type-specific requirements
  if (request.type === "element") {
    if (!request.selector || typeof request.selector !== "string") {
      errors.push("Selector is required for element screenshots");
    }
  }

  if (request.type === "area") {
    if (!request.area) {
      errors.push("Area coordinates are required for area screenshots");
    } else {
      const { x, y, width, height } = request.area;
      if (
        typeof x !== "number" ||
        typeof y !== "number" ||
        typeof width !== "number" ||
        typeof height !== "number"
      ) {
        errors.push("Area coordinates must be numbers (x, y, width, height)");
      }
      if (width <= 0 || height <= 0) {
        errors.push("Area width and height must be positive numbers");
      }
      if (x < 0 || y < 0) {
        errors.push("Area x and y coordinates must be non-negative");
      }
    }
  }

  // Validate options if provided
  if (request.options) {
    const { scaleFactor, quality, format, viewport } = request.options;

    if (scaleFactor !== undefined) {
      if (
        typeof scaleFactor !== "number" ||
        scaleFactor <= 0 ||
        scaleFactor > 5
      ) {
        errors.push("Scale factor must be a number between 0.1 and 5");
      }
    }

    if (quality !== undefined) {
      if (typeof quality !== "number" || quality < 0 || quality > 100) {
        errors.push("Quality must be a number between 0 and 100");
      }
    }

    if (format !== undefined) {
      const validFormats = ["png", "jpeg", "webp"];
      if (!validFormats.includes(format)) {
        errors.push("Format must be one of: png, jpeg, webp");
      }
    }

    if (viewport !== undefined) {
      const { width, height } = viewport;
      if (
        typeof width !== "number" ||
        typeof height !== "number" ||
        width <= 0 ||
        height <= 0
      ) {
        errors.push("Viewport width and height must be positive numbers");
      }
      if (width > 7680 || height > 4320) {
        errors.push(
          "Viewport dimensions exceed maximum allowed size (7680x4320)"
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function sanitizeSelector(selector: string): string {
  // Remove any potentially dangerous characters
  return selector.replace(/['"`;\\]/g, "");
}

export function validateDimensions(width: number, height: number): boolean {
  const maxWidth = parseInt(process.env.MAX_SCREENSHOT_WIDTH || "7680");
  const maxHeight = parseInt(process.env.MAX_SCREENSHOT_HEIGHT || "4320");

  return width > 0 && height > 0 && width <= maxWidth && height <= maxHeight;
}
