#!/bin/bash
# Cloudflare Deployment Script
# Run this script in your local environment with CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID set

set -e

echo "🚀 Starting Cloudflare deployment..."

# Check required environment variables
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN is not set"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "❌ Error: CLOUDFLARE_ACCOUNT_ID is not set"
    exit 1
fi

echo "✅ Environment variables verified"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build shared package
echo "🔨 Building shared data-ops package..."
pnpm run build-package

# Deploy user-application
echo "🌐 Deploying user-application..."
cd apps/user-application
npm run deploy
cd ../..

# Deploy data-service
echo "🌐 Deploying data-service..."
cd apps/data-service
npm run deploy
cd ../..

echo "✅ Deployment complete!"
echo ""
echo "Your applications are now live on Cloudflare:"
echo "  - user-application: https://user-application.<your-subdomain>.workers.dev"
echo "  - data-service: https://data-service.<your-subdomain>.workers.dev"
