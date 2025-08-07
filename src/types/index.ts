export interface Cookie {
  domain: string;
  expirationDate?: number;
  hostOnly?: boolean;
  httpOnly?: boolean;
  name: string;
  path: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  session?: boolean;
  storeId?: string;
  value: string;
}

export interface PageData {
  cookies?: Cookie[];
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;
}

export interface ScreenshotRequest {
  url: string;
  type: "fullpage" | "element" | "area";
  selector?: string;
  area?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  pageData?: PageData;
  options?: {
    scaleFactor?: number;
    quality?: number;
    format?: "png" | "jpeg" | "webp";
    fullPage?: boolean;
    omitBackground?: boolean;
    delay?: number;
    waitForSelector?: string;
    viewport?: {
      width: number;
      height: number;
    };
  };
}

export interface ScreenshotResponse {
  success: boolean;
  data?: {
    image: string; // base64 encoded image
    format: string;
    width: number;
    height: number;
    timestamp: number;
  };
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

export interface ScreenshotOptions {
  type?: "png" | "jpeg" | "webp";
  quality?: number;
  fullPage?: boolean;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  omitBackground?: boolean;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    timestamp: number;
  };
}
