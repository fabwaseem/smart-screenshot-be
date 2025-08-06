#!/bin/bash

# Railway Deployment Script for Screenshot Backend

echo "🚀 Deploying Screenshot Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Create new project (optional - comment out if project already exists)
echo "📦 Creating new Railway project..."
railway project create

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set PUPPETEER_HEADLESS=true
railway variables set PUPPETEER_TIMEOUT=30000
railway variables set PUPPETEER_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu,--no-first-run,--no-zygote,--single-process"
railway variables set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
railway variables set PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
railway variables set DEFAULT_SCALE_FACTOR=3
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=100
railway variables set CORS_ORIGIN="*"

# Deploy the application
echo "🚢 Deploying application..."
railway up

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at the Railway-provided URL"
echo "📊 Check the Railway dashboard for logs and monitoring"
