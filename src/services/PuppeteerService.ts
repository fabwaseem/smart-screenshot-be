import puppeteer, { Browser, Page, Viewport } from "puppeteer";
import sharp from "sharp";
import {
  ScreenshotRequest,
  ScreenshotOptions,
  PageData,
  Cookie,
} from "../types";

export class PuppeteerService {
  private browser: Browser | null = null;
  private readonly maxRetries = 3;
  private readonly timeout = 30000;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize browser immediately to avoid blocking server startup
    // this.initializeBrowser();
  }

  private async initializeBrowser(): Promise<void> {
    try {
      const args = process.env.PUPPETEER_ARGS?.split(",") || [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
      ];

      // Use system Chrome if available, otherwise use bundled Chromium
      const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

      this.browser = await puppeteer.launch({
        headless: true,
        args,
        timeout: this.timeout,
        executablePath,
      });
    } catch (error) {
      console.error("❌ Failed to initialize Puppeteer browser:", error);
      throw error;
    }
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      if (!this.initializationPromise) {
        this.initializationPromise = this.initializeBrowser();
      }
      await this.initializationPromise;
    }
    return this.browser!;
  }

  private async applyBrowserState(
    browser: Browser,
    page: Page,
    pageData: PageData,
    url: string
  ): Promise<void> {
    try {
      console.log("🔧 Applying browser state data...");
      const urlObj = new URL(url);

      // Step 1: Apply cookies first (if provided)
      if (pageData.cookies && pageData.cookies.length > 0) {
        // Convert cookies to Puppeteer format
        const puppeteerCookies = pageData.cookies.map((cookie: Cookie) => ({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path || "/",
          httpOnly: cookie.httpOnly || false,
          secure: cookie.secure || false,
          sameSite: cookie.sameSite as "Strict" | "Lax" | "None" | undefined,
          expires: cookie.expirationDate
            ? Math.floor(cookie.expirationDate)
            : undefined,
        }));

        await browser.setCookie(...puppeteerCookies);
      }

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: this.timeout,
      });

      // Step 3: Apply localStorage and sessionStorage (if provided)
      if (pageData.localStorage || pageData.sessionStorage) {
        // Apply localStorage
        if (
          pageData.localStorage &&
          Object.keys(pageData.localStorage).length > 0
        ) {
          await page.evaluate((localStorageData: Record<string, string>) => {
            try {
              for (const [key, value] of Object.entries(localStorageData)) {
                (globalThis as any).localStorage.setItem(key, value);
              }
            } catch (error) {
              console.error("Error setting localStorage:", error);
            }
          }, pageData.localStorage);
        }

        // Apply sessionStorage
        if (
          pageData.sessionStorage &&
          Object.keys(pageData.sessionStorage).length > 0
        ) {
          await page.evaluate((sessionStorageData: Record<string, string>) => {
            try {
              for (const [key, value] of Object.entries(sessionStorageData)) {
                (globalThis as any).sessionStorage.setItem(key, value);
              }
            } catch (error) {
              console.error("Error setting sessionStorage:", error);
            }
          }, pageData.sessionStorage);
        }

        // Wait a moment for storage to be fully applied
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

    } catch (error) {
      console.error("❌ Error applying browser state:", error);
      // Don't throw here, let the screenshot continue without browser state
      console.warn("⚠️ Continuing without browser state data");
    }
  }
  async takeScreenshot(request: ScreenshotRequest): Promise<Buffer> {
    let page: Page | null = null;
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        const browser = await this.getBrowser();
        page = await browser.newPage();

        // Set viewport with scaling
        const viewport: Viewport = {
          width: request.options?.viewport?.width || 1920,
          height: request.options?.viewport?.height || 1080,
          deviceScaleFactor:
            request.options?.scaleFactor ||
            parseInt(process.env.DEFAULT_SCALE_FACTOR || "3"),
          isMobile: false,
        };

        await page.setViewport(viewport);

        // Set user agent
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        // Apply browser state data if provided, otherwise navigate normally
        if (request.pageData) {
          await this.applyBrowserState(
            browser,
            page,
            request.pageData,
            request.url
          );
          // Do a final navigation with full network wait to ensure everything is loaded
          await page.goto(request.url, {
            waitUntil: "networkidle0",
            timeout: this.timeout,
          });
        } else {
          // Navigate to URL normally if no browser state data
          await page.goto(request.url, {
            waitUntil: "networkidle0",
            timeout: this.timeout,
          });
        }

        // Wait for additional selector if specified
        if (request.options?.waitForSelector) {
          await page.waitForSelector(request.options.waitForSelector, {
            timeout: this.timeout / 2,
          });
        }

        // Add delay if specified
        if (request.options?.delay && request.options.delay > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, request.options!.delay)
          );
        }

        // Take screenshot based on type
        let screenshotBuffer: Buffer;

        switch (request.type) {
          case "fullpage":
            screenshotBuffer = await this.takeFullPageScreenshot(page, request);
            break;
          case "element":
            screenshotBuffer = await this.takeElementScreenshot(page, request);
            break;
          case "area":
            screenshotBuffer = await this.takeAreaScreenshot(page, request);
            break;
          default:
            throw new Error(`Unsupported screenshot type: ${request.type}`);
        }

        await page.close();
        return screenshotBuffer;
      } catch (error) {
        if (page) {
          await page.close().catch(() => {});
        }

        retries++;
        console.error(`Screenshot attempt ${retries} failed:`, error);

        if (retries >= this.maxRetries) {
          throw new Error(
            `Screenshot failed after ${this.maxRetries} attempts: ${error}`
          );
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }

    throw new Error("Screenshot failed after all retries");
  }

  private async takeFullPageScreenshot(
    page: Page,
    request: ScreenshotRequest
  ): Promise<Buffer> {
    const options: ScreenshotOptions = {
      type: request.options?.format || "png",
      quality:
        request.options?.quality ||
        (request.options?.format === "jpeg" ? 90 : undefined),
      fullPage: true,
      omitBackground: request.options?.omitBackground || false,
    };

    return (await page.screenshot(options)) as Buffer;
  }

  private async takeElementScreenshot(
    page: Page,
    request: ScreenshotRequest
  ): Promise<Buffer> {
    if (!request.selector) {
      throw new Error("Element selector is required for element screenshots");
    }

    // Wait for element to be visible
    await page.waitForSelector(request.selector, {
      visible: true,
      timeout: this.timeout / 2,
    });

    const element = await page.$(request.selector);
    if (!element) {
      throw new Error(`Element not found: ${request.selector}`);
    }

    // Get element bounding box
    const boundingBox = await element.boundingBox();
    if (!boundingBox) {
      throw new Error("Element has no visible bounding box");
    }

    // Get scaling factor
    const scaleFactor =
      request.options?.scaleFactor ||
      parseInt(process.env.DEFAULT_SCALE_FACTOR || "3");

    // Calculate scaled coordinates and dimensions
    const scaledBox = {
      x: Math.round(boundingBox.x * scaleFactor),
      y: Math.round(boundingBox.y * scaleFactor),
      width: Math.round(boundingBox.width * scaleFactor),
      height: Math.round(boundingBox.height * scaleFactor),
    };

    // Take a full page screenshot first
    const fullScreenshotOptions: ScreenshotOptions = {
      type: request.options?.format || "png",
      quality:
        request.options?.quality ||
        (request.options?.format === "jpeg" ? 90 : undefined),
      fullPage: true,
      omitBackground: request.options?.omitBackground || false,
    };

    const fullScreenshotBuffer = (await page.screenshot(
      fullScreenshotOptions
    )) as Buffer;

    // Use Sharp to crop the image to extract the element
    try {
      const croppedBuffer = await sharp(fullScreenshotBuffer)
        .extract({
          left: scaledBox.x,
          top: scaledBox.y,
          width: scaledBox.width,
          height: scaledBox.height,
        })
        .toBuffer();

      return croppedBuffer;
    } catch (error) {
      console.error("Error cropping element image:", error);
      throw new Error(`Failed to crop element image: ${error}`);
    }
  }

  private async takeAreaScreenshot(
    page: Page,
    request: ScreenshotRequest
  ): Promise<Buffer> {
    if (!request.area) {
      throw new Error("Area coordinates are required for area screenshots");
    }

    // Get scaling factor
    const scaleFactor =
      request.options?.scaleFactor ||
      parseInt(process.env.DEFAULT_SCALE_FACTOR || "3");

    // Calculate scaled coordinates and dimensions
    const scaledArea = {
      x: Math.round(request.area.x * scaleFactor),
      y: Math.round(request.area.y * scaleFactor),
      width: Math.round(request.area.width * scaleFactor),
      height: Math.round(request.area.height * scaleFactor),
    };

    // Take a full page screenshot first
    const fullScreenshotOptions: ScreenshotOptions = {
      type: request.options?.format || "png",
      quality:
        request.options?.quality ||
        (request.options?.format === "jpeg" ? 90 : undefined),
      fullPage: true,
      omitBackground: request.options?.omitBackground || false,
    };

    const fullScreenshotBuffer = (await page.screenshot(
      fullScreenshotOptions
    )) as Buffer;
    try {
      const croppedBuffer = await sharp(fullScreenshotBuffer)
        .extract({
          left: scaledArea.x,
          top: scaledArea.y,
          width: scaledArea.width,
          height: scaledArea.height,
        })
        .toBuffer();

      return croppedBuffer;
    } catch (error) {
      console.error("Error cropping image:", error);
      throw new Error(`Failed to crop image: ${error}`);
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log("🔧 Puppeteer browser closed");
    }
  }

  async getPageDimensions(
    url: string
  ): Promise<{ width: number; height: number }> {
    let page: Page | null = null;
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();

      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: this.timeout,
      });

      const dimensions = await page.evaluate(() => {
        return {
          width: Math.max(
            (globalThis as any).document.body.scrollWidth,
            (globalThis as any).document.body.offsetWidth,
            (globalThis as any).document.documentElement.clientWidth,
            (globalThis as any).document.documentElement.scrollWidth,
            (globalThis as any).document.documentElement.offsetWidth
          ),
          height: Math.max(
            (globalThis as any).document.body.scrollHeight,
            (globalThis as any).document.body.offsetHeight,
            (globalThis as any).document.documentElement.clientHeight,
            (globalThis as any).document.documentElement.scrollHeight,
            (globalThis as any).document.documentElement.offsetHeight
          ),
        };
      });
      await page.close();
      return dimensions;
    } catch (error) {
      if (page) await page.close().catch(() => {});
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.browser) {
        return false; // Browser not initialized yet, but that's ok
      }
      return this.browser.isConnected();
    } catch (error) {
      console.error("Puppeteer health check failed:", error);
      return false;
    }
  }

  async getStatus(): Promise<{
    initialized: boolean;
    connected: boolean;
    version?: string;
  }> {
    try {
      const initialized = this.browser !== null;
      const connected = initialized ? this.browser!.isConnected() : false;
      let version;

      if (connected) {
        version = await this.browser!.version();
      }

      return { initialized, connected, version };
    } catch (error) {
      return { initialized: false, connected: false };
    }
  }
}
