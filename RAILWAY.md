# Railway Deployment for Screenshot Backend API

## Environment Variables

Set these environment variables in your Railway project:

```
NODE_ENV=production
PORT=3001
PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--single-process
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
DEFAULT_SCALE_FACTOR=3
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*
```

## Deployment Steps

1. **Connect Repository**: Link your GitHub repository to Railway
2. **Set Environment Variables**: Add the variables listed above
3. **Deploy**: Railway will automatically build and deploy your service

## Railway Features Used

- **Nixpacks**: Automatic build detection and optimization
- **Health Checks**: Uses `/health` endpoint for monitoring
- **Auto Restart**: Configured to restart on failure with retry policy
- **Scaling**: Railway handles auto-scaling based on traffic

## Production Considerations

### Memory Usage

- Puppeteer can be memory-intensive
- Consider upgrading to Railway Pro for higher memory limits
- Monitor memory usage through Railway dashboard

### Performance Optimization

- The service uses connection pooling for Puppeteer browser instances
- Rate limiting prevents abuse and resource exhaustion
- 3x scaling provides high-quality screenshots but uses more memory

### Security

- All security headers configured via Helmet.js
- Rate limiting prevents API abuse
- CORS properly configured for production use

## Monitoring

Railway provides built-in monitoring:

- **Logs**: View application logs in real-time
- **Metrics**: CPU, memory, and network usage
- **Health Checks**: Automatic monitoring via `/health` endpoint
- **Alerts**: Set up notifications for downtime or errors

## Custom Domain

To use a custom domain:

1. Go to your Railway project settings
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificates are automatically provisioned

## Scaling

Railway automatically scales based on:

- CPU usage
- Memory usage
- Request volume
- Response times

For high-traffic applications, consider:

- Upgrading to Railway Pro
- Implementing request queuing
- Adding Redis for caching
- Using CDN for static assets
