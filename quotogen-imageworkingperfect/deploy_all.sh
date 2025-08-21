#!/bin/bash

# QuoteViral Complete Deployment Script
# This script automates the entire deployment process

echo "========================================"
echo " QuoteViral Complete Deployment Script "
echo "========================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null
then
    echo "❌ Wrangler CLI could not be found."
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js could not be found."
    echo "Please install Node.js (v18 or higher)"
    exit 1
fi

echo "✅ Prerequisites verified"
echo ""

# Navigate to project root
cd "$(dirname "$0")/quoteviral_unzipped/quoteviral" || exit 1

echo "📦 Installing dependencies..."
echo ""

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd ../workers
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"
echo ""

# Build frontend
echo "🏗️ Building frontend..."
cd ../frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build frontend"
    exit 1
fi
echo "✅ Frontend built successfully"
echo ""

# Deploy backend
echo "🚀 Deploying backend..."
cd ../workers
wrangler deploy
if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy backend"
    exit 1
fi
echo "✅ Backend deployed successfully"
echo ""

# Deploy frontend
echo "🌐 Deploying frontend..."
cd ../frontend
wrangler pages deploy dist
if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy frontend"
    exit 1
fi
echo "✅ Frontend deployed successfully"
echo ""

# Upload assets
echo "📂 Uploading assets..."
cd ..
./upload_assets.sh
if [ $? -ne 0 ]; then
    echo "❌ Failed to upload assets"
    exit 1
fi
echo "✅ Assets uploaded successfully"
echo ""

echo "========================================"
echo "🎉 Deployment completed successfully! 🎉"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Configure custom domains in Cloudflare dashboard:"
echo "   - api.quoteviral.online for the worker"
echo "   - quoteviral.online for the frontend"
echo "2. Test the deployment using test_api.sh"
echo "3. Monitor system health through the health monitoring component"
echo ""
echo "The QuoteViral platform is now ready for production use!"