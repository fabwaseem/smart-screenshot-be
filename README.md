# Screenshot Backend API

A powerful Node.js Express backend service built with TypeScript and Puppeteer for capturing high-quality screenshots with 3x scaling capability. This service provides unlimited canvas size and professional screenshot functionality that overcomes browser extension limitations.

## 🚀 Features

- **4 Screenshot Modes**: Visible area, full page, custom area, and element screenshots
- **3x Scaling**: High-quality screenshots with 3x device pixel ratio
- **Unlimited Canvas Size**: No browser limitations for large page captures
- **Professional Error Handling**: Comprehensive retry logic and graceful error handling
- **Security**: Rate limiting, CORS protection, and Helmet security middleware
- **TypeScript**: Fully typed codebase for better development experience
- **Request Logging**: Comprehensive logging for debugging and monitoring
- **Flexible Configuration**: Customizable viewport, wait times, and scaling options

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Development](#development)
- [Contributing](#contributing)

## 🛠 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn or pnpm

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd screenshot-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Build the project**

   ```bash
   npm run build
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🚀 Railway Deployment

### Quick Deploy to Railway

1. **Install Railway CLI**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**

   ```bash
   railway login
   ```

3. **Deploy using our script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Manual Railway Setup

1. **Connect Repository**: Link your GitHub repository to Railway
2. **Set Environment Variables** in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=3001
   PUPPETEER_HEADLESS=true
   PUPPETEER_TIMEOUT=30000
   PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--single-process
   DEFAULT_SCALE_FACTOR=3
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CORS_ORIGIN=*
   ```
3. **Deploy**: Railway will automatically build and deploy your service

### Railway Features

- ✅ **Auto-scaling**: Handles traffic spikes automatically
- ✅ **Health monitoring**: Uses `/health` endpoint
- ✅ **SSL certificates**: Automatic HTTPS
- ✅ **Custom domains**: Easy domain configuration
- ✅ **Real-time logs**: Monitor application performance

For detailed Railway configuration, see [RAILWAY.md](./RAILWAY.md)

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Default Configuration

- **Port**: 3001
- **Puppeteer**: Headless mode enabled
- **Timeout**: 30 seconds per request
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **3x Scaling**: Enabled by default for all screenshots

## 🔌 API Endpoints

### Base URL

```
http://localhost:3001
```

### Health Check

#### GET /health

Check if the service is running and healthy.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-08-06T08:00:35.216Z",
  "uptime": 15.3594749,
  "version": "1.0.0"
}
```

---

### 1. Visible Area Screenshot

#### POST /api/screenshot/visible

Captures a screenshot of the visible viewport area.

**Request Body:**

```json
{
  "url": "https://example.com",
  "options": {
    "waitTime": 2000,
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

**Parameters:**

- `url` (string, required): The URL to capture
- `options.waitTime` (number, optional): Wait time in milliseconds before capture (default: 1000)
- `options.viewport.width` (number, optional): Viewport width (default: 1920)
- `options.viewport.height` (number, optional): Viewport height (default: 1080)

**Response:**

```json
{
  "success": true,
  "data": {
    "image": "iVBORw0KGgoAAAANSUhEUgAAA...", // Base64 encoded PNG
    "format": "png",
    "width": 5760,
    "height": 3240,
    "timestamp": 1754467377875
  }
}
```

---

### 2. Full Page Screenshot

#### POST /api/screenshot/fullpage

Captures a screenshot of the entire page including content below the fold.

**Request Body:**

```json
{
  "url": "https://example.com",
  "options": {
    "waitTime": 3000,
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

**Parameters:**

- `url` (string, required): The URL to capture
- `options.waitTime` (number, optional): Wait time in milliseconds before capture (default: 1000)
- `options.viewport.width` (number, optional): Viewport width (default: 1920)
- `options.viewport.height` (number, optional): Viewport height (default: 1080)

**Response:**

```json
{
  "success": true,
  "data": {
    "image": "iVBORw0KGgoAAAANSUhEUgAAA...", // Base64 encoded PNG
    "format": "png",
    "width": 5760,
    "height": 12960,
    "timestamp": 1754467495368
  }
}
```

---

### 3. Custom Area Screenshot

#### POST /api/screenshot/custom

Captures a screenshot of a specific rectangular area on the page.

**Request Body:**

```json
{
  "url": "https://example.com",
  "area": {
    "x": 100,
    "y": 200,
    "width": 800,
    "height": 600
  },
  "options": {
    "waitTime": 2000,
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

**Parameters:**

- `url` (string, required): The URL to capture
- `area.x` (number, required): X coordinate of the top-left corner
- `area.y` (number, required): Y coordinate of the top-left corner
- `area.width` (number, required): Width of the area to capture
- `area.height` (number, required): Height of the area to capture
- `options.waitTime` (number, optional): Wait time in milliseconds before capture (default: 1000)
- `options.viewport.width` (number, optional): Viewport width (default: 1920)
- `options.viewport.height` (number, optional): Viewport height (default: 1080)

**Response:**

```json
{
  "success": true,
  "data": {
    "image": "iVBORw0KGgoAAAANSUhEUgAAA...", // Base64 encoded PNG
    "format": "png",
    "width": 2400,
    "height": 1800,
    "timestamp": 1754467500123
  }
}
```

---

### 4. Element Screenshot

#### POST /api/screenshot/element

Captures a screenshot of a specific element identified by CSS selector.

**Request Body:**

```json
{
  "url": "https://example.com",
  "selector": "#main-content",
  "options": {
    "waitTime": 2000,
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

**Parameters:**

- `url` (string, required): The URL to capture
- `selector` (string, required): CSS selector of the element to capture
- `options.waitTime` (number, optional): Wait time in milliseconds before capture (default: 1000)
- `options.viewport.width` (number, optional): Viewport width (default: 1920)
- `options.viewport.height` (number, optional): Viewport height (default: 1080)

**Response:**

```json
{
  "success": true,
  "data": {
    "image": "iVBORw0KGgoAAAANSUhEUgAAA...", // Base64 encoded PNG
    "format": "png",
    "width": 3000,
    "height": 2100,
    "timestamp": 1754467505789
  }
}
```

## 📝 Usage Examples

### Using cURL

#### Visible Area Screenshot

```bash
curl -X POST http://localhost:3001/api/screenshot/visible \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://google.com",
    "options": {
      "waitTime": 2000
    }
  }'
```

#### Full Page Screenshot

```bash
curl -X POST http://localhost:3001/api/screenshot/fullpage \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com",
    "options": {
      "waitTime": 3000,
      "viewport": {
        "width": 1920,
        "height": 1080
      }
    }
  }'
```

#### Custom Area Screenshot

```bash
curl -X POST http://localhost:3001/api/screenshot/custom \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "area": {
      "x": 0,
      "y": 0,
      "width": 800,
      "height": 600
    },
    "options": {
      "waitTime": 2000
    }
  }'
```

#### Element Screenshot

```bash
curl -X POST http://localhost:3001/api/screenshot/element \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "selector": "header",
    "options": {
      "waitTime": 2000
    }
  }'
```

### Using JavaScript/TypeScript

```typescript
interface ScreenshotOptions {
  waitTime?: number;
  viewport?: {
    width?: number;
    height?: number;
  };
}

interface ScreenshotResponse {
  success: boolean;
  data: {
    image: string; // Base64 encoded PNG
    format: string;
    width: number;
    height: number;
    timestamp: number;
  };
}

// Visible area screenshot
async function captureVisibleArea(
  url: string,
  options?: ScreenshotOptions
): Promise<ScreenshotResponse> {
  const response = await fetch("http://localhost:3001/api/screenshot/visible", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, options }),
  });

  return response.json();
}

// Full page screenshot
async function captureFullPage(
  url: string,
  options?: ScreenshotOptions
): Promise<ScreenshotResponse> {
  const response = await fetch(
    "http://localhost:3001/api/screenshot/fullpage",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, options }),
    }
  );

  return response.json();
}

// Custom area screenshot
async function captureCustomArea(
  url: string,
  area: { x: number; y: number; width: number; height: number },
  options?: ScreenshotOptions
): Promise<ScreenshotResponse> {
  const response = await fetch("http://localhost:3001/api/screenshot/custom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, area, options }),
  });

  return response.json();
}

// Element screenshot
async function captureElement(
  url: string,
  selector: string,
  options?: ScreenshotOptions
): Promise<ScreenshotResponse> {
  const response = await fetch("http://localhost:3001/api/screenshot/element", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, selector, options }),
  });

  return response.json();
}

// Usage examples
async function examples() {
  // Capture visible area
  const visibleResult = await captureVisibleArea("https://google.com", {
    waitTime: 2000,
    viewport: { width: 1920, height: 1080 },
  });

  // Capture full page
  const fullPageResult = await captureFullPage("https://github.com", {
    waitTime: 3000,
  });

  // Capture custom area
  const customResult = await captureCustomArea(
    "https://example.com",
    { x: 100, y: 200, width: 800, height: 600 },
    { waitTime: 2000 }
  );

  // Capture element
  const elementResult = await captureElement(
    "https://example.com",
    "#main-content",
    { waitTime: 2000 }
  );

  // Convert base64 to image file (browser environment)
  function downloadImage(base64Data: string, filename: string) {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${base64Data}`;
    link.download = filename;
    link.click();
  }

  // Download the screenshots
  if (visibleResult.success) {
    downloadImage(visibleResult.data.image, "visible-screenshot.png");
  }
}
```

### Using Python

```python
import requests
import base64
from typing import Optional, Dict, Any

class ScreenshotAPI:
    def __init__(self, base_url: str = "http://localhost:3001"):
        self.base_url = base_url

    def capture_visible_area(self, url: str, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Capture visible area screenshot"""
        payload = {"url": url}
        if options:
            payload["options"] = options

        response = requests.post(
            f"{self.base_url}/api/screenshot/visible",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        return response.json()

    def capture_full_page(self, url: str, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Capture full page screenshot"""
        payload = {"url": url}
        if options:
            payload["options"] = options

        response = requests.post(
            f"{self.base_url}/api/screenshot/fullpage",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        return response.json()

    def capture_custom_area(self, url: str, area: Dict[str, int], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Capture custom area screenshot"""
        payload = {"url": url, "area": area}
        if options:
            payload["options"] = options

        response = requests.post(
            f"{self.base_url}/api/screenshot/custom",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        return response.json()

    def capture_element(self, url: str, selector: str, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Capture element screenshot"""
        payload = {"url": url, "selector": selector}
        if options:
            payload["options"] = options

        response = requests.post(
            f"{self.base_url}/api/screenshot/element",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        return response.json()

    def save_screenshot(self, base64_data: str, filename: str):
        """Save base64 screenshot data to file"""
        image_data = base64.b64decode(base64_data)
        with open(filename, 'wb') as f:
            f.write(image_data)

# Usage example
def main():
    api = ScreenshotAPI()

    # Capture visible area
    result = api.capture_visible_area(
        "https://google.com",
        {"waitTime": 2000, "viewport": {"width": 1920, "height": 1080}}
    )

    if result["success"]:
        api.save_screenshot(result["data"]["image"], "google_visible.png")
        print(f"Screenshot saved: {result['data']['width']}x{result['data']['height']}")

    # Capture full page
    result = api.capture_full_page("https://github.com", {"waitTime": 3000})

    if result["success"]:
        api.save_screenshot(result["data"]["image"], "github_fullpage.png")
        print(f"Full page screenshot saved: {result['data']['width']}x{result['data']['height']}")

    # Capture custom area
    result = api.capture_custom_area(
        "https://example.com",
        {"x": 0, "y": 0, "width": 800, "height": 600},
        {"waitTime": 2000}
    )

    if result["success"]:
        api.save_screenshot(result["data"]["image"], "example_custom.png")
        print(f"Custom area screenshot saved: {result['data']['width']}x{result['data']['height']}")

    # Capture element
    result = api.capture_element(
        "https://example.com",
        "header",
        {"waitTime": 2000}
    )

    if result["success"]:
        api.save_screenshot(result["data"]["image"], "example_header.png")
        print(f"Element screenshot saved: {result['data']['width']}x{result['data']['height']}")

if __name__ == "__main__":
    main()
```

## 🚨 Error Handling

The API returns consistent error responses with appropriate HTTP status codes.

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common Error Codes

| Status Code | Error Code            | Description                    |
| ----------- | --------------------- | ------------------------------ |
| 400         | `VALIDATION_ERROR`    | Invalid request parameters     |
| 404         | `ELEMENT_NOT_FOUND`   | CSS selector element not found |
| 408         | `TIMEOUT_ERROR`       | Request timeout exceeded       |
| 429         | `RATE_LIMIT_EXCEEDED` | Too many requests              |
| 500         | `INTERNAL_ERROR`      | Server internal error          |
| 503         | `PUPPETEER_ERROR`     | Browser automation error       |

### Example Error Responses

#### Validation Error

```json
{
  "success": false,
  "error": {
    "message": "Invalid URL provided",
    "code": "VALIDATION_ERROR",
    "details": "URL must be a valid HTTP or HTTPS URL"
  }
}
```

#### Element Not Found

```json
{
  "success": false,
  "error": {
    "message": "Element not found",
    "code": "ELEMENT_NOT_FOUND",
    "details": "No element found with selector: #non-existent-element"
  }
}
```

#### Rate Limit Exceeded

```json
{
  "success": false,
  "error": {
    "message": "Too many requests",
    "code": "RATE_LIMIT_EXCEEDED",
    "details": "Rate limit: 100 requests per 15 minutes"
  }
}
```

## 🛡️ Rate Limiting

The API implements rate limiting to prevent abuse and ensure fair usage.

### Default Limits

- **100 requests per 15 minutes** per IP address
- Configurable via environment variables
- Returns `429 Too Many Requests` when exceeded

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1754468395
```

### Configuring Rate Limits

```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # Max requests per window
```

## 🔧 Development

### Prerequisites

- Node.js 18+
- TypeScript 5+
- npm/yarn/pnpm

### Development Setup

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd screenshot-backend
   npm install
   ```

2. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Development mode**

   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Project Structure

```
screenshot-backend/
├── src/
│   ├── server.ts              # Main server file
│   ├── services/
│   │   └── PuppeteerService.ts # Screenshot service
│   ├── controllers/
│   │   └── screenshotController.ts # API controllers
│   ├── middleware/
│   │   ├── cors.ts            # CORS configuration
│   │   ├── rateLimit.ts       # Rate limiting
│   │   ├── security.ts        # Security headers
│   │   └── logging.ts         # Request logging
│   └── types/
│       └── index.ts           # TypeScript types
├── dist/                      # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run test     # Run tests
```

### Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Puppeteer Configuration
PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=*
```

## 🌟 Key Features Explained

### 3x Scaling Technology

The backend uses Puppeteer's `deviceScaleFactor: 3` to capture screenshots at 3 times the normal resolution, providing crisp, high-quality images suitable for high-DPI displays and detailed analysis.

### Unlimited Canvas Size

Unlike browser extensions which are limited by canvas size restrictions, this backend service can capture screenshots of any size, including very long pages or high-resolution custom areas.

### Professional Error Handling

- **Retry Logic**: Automatic retries for transient failures
- **Graceful Degradation**: Fallback mechanisms for edge cases
- **Comprehensive Logging**: Detailed logs for debugging and monitoring
- **Type Safety**: Full TypeScript coverage for reliable operation

### Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: Helmet.js for security hardening
- **Input Validation**: Comprehensive request validation
- **Error Sanitization**: Safe error responses without sensitive data

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please:

1. Check the [documentation](#api-endpoints)
2. Review [common errors](#error-handling)
3. Open an issue on GitHub
4. Contact the development team

## 🔄 Changelog

### v1.0.0 (Current)

- ✅ Initial release
- ✅ 4 screenshot modes implementation
- ✅ 3x scaling capability
- ✅ Professional error handling
- ✅ Rate limiting and security
- ✅ Comprehensive documentation
- ✅ TypeScript support
- ✅ Production-ready architecture

---

**Made with ❤️ using TypeScript, Express, and Puppeteer**
"width": 800,
"height": 600
},
"options": {
"scaleFactor": 3,
"format": "png"
}
}

```

### Get Page Dimensions
```

POST /api/screenshot/dimensions
Content-Type: application/json

{
"url": "https://example.com"
}

````

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "image": "base64-encoded-image-data",
    "format": "png",
    "width": 2400,
    "height": 1800,
    "timestamp": 1703001600000
  }
}
````

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "timestamp": "2023-12-19T12:00:00.000Z"
  }
}
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd screenshot-be
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment (optional):

```bash
cp .env.example .env
# Edit .env with your settings
```

4. Start development server:

```bash
npm run dev
```

5. Start production server:

```bash
npm run build
npm start
```

## Environment Variables

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
MAX_SCREENSHOT_WIDTH=7680
MAX_SCREENSHOT_HEIGHT=4320
DEFAULT_SCALE_FACTOR=3
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage
```

## Configuration Options

### Screenshot Options

- `scaleFactor`: Scale factor for high-resolution screenshots (1-5, default: 3)
- `format`: Image format - 'png', 'jpeg', 'webp' (default: 'png')
- `quality`: JPEG/WebP quality 0-100 (default: 90)
- `viewport`: Browser viewport size
- `delay`: Wait time in milliseconds before screenshot
- `waitForSelector`: Wait for specific element before screenshot
- `omitBackground`: Remove page background (transparent PNG)

### Browser Options

- Headless Chrome with optimized flags
- No sandbox mode for Docker compatibility
- 30-second timeout for page loads
- Automatic retry on failures (3 attempts)

## Rate Limiting

- 30 requests per minute per IP address
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## Error Codes

- `VALIDATION_ERROR`: Invalid request parameters
- `INVALID_URL`: Malformed or unsupported URL
- `ELEMENT_NOT_FOUND`: CSS selector matched no elements
- `NAVIGATION_FAILED`: Failed to load the page
- `TIMEOUT_ERROR`: Request exceeded timeout
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SCREENSHOT_ERROR`: General screenshot failure

## Integration with Browser Extension

The browser extension can call this backend to overcome browser limitations:

```javascript
// Extension background script
async function takeScreenshotViaBackend(request) {
  const response = await fetch("http://localhost:3001/api/screenshot/visible", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: tabs[0].url,
      options: {
        scaleFactor: 3,
        format: "png",
      },
    }),
  });

  const result = await response.json();
  return result.data.image; // base64 image
}
```

## Development

### Project Structure

```
src/
├── controllers/     # Express route controllers
├── middleware/      # Express middleware
├── services/        # Business logic services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── server.ts       # Main server file
```

### Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm test`: Run tests

## Production Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### PM2

```bash
npm install -g pm2
pm2 start dist/server.js --name screenshot-api
```

## Performance

- **Concurrent Requests**: Handles multiple screenshot requests simultaneously
- **Memory Management**: Automatic browser instance cleanup
- **Caching**: Browser instance reuse for better performance
- **Optimized Flags**: Chrome flags optimized for server environments

## Security

- CORS protection with configurable origins
- Helmet.js security headers
- Request rate limiting
- Input validation and sanitization
- No arbitrary code execution
- Sandboxed browser environment

## Troubleshooting

### Common Issues

1. **Puppeteer Installation**: If Puppeteer fails to install:

```bash
npm install puppeteer --unsafe-perm=true
```

2. **Docker Permission Issues**: Add browser flags:

```env
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu
```

3. **Memory Issues**: Increase Node.js memory:

```bash
node --max-old-space-size=4096 dist/server.js
```

4. **CORS Issues**: Update CORS_ORIGIN environment variable:

```env
CORS_ORIGIN=https://your-extension-id.chromium.org
```

## License

MIT License - see LICENSE file for details.
