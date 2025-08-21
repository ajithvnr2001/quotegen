#!/bin/bash

# QuoteViral Asset Upload Script
# This script uploads all template assets to Cloudflare R2

echo "Starting QuoteViral asset upload..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null
then
    echo "Wrangler CLI could not be found. Please install it with: npm install -g wrangler"
    exit 1
fi

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || exit 1

echo "Uploading template preview images..."
wrangler r2 object put quoteviral-templates/templates/motivational-001-preview.jpg --file=public/templates/motivational-001-preview.jpg
wrangler r2 object put quoteviral-templates/templates/aesthetic-001-preview.jpg --file=public/templates/aesthetic-001-preview.jpg
wrangler r2 object put quoteviral-templates/templates/business-001-preview.jpg --file=public/templates/business-001-preview.jpg
wrangler r2 object put quoteviral-templates/templates/memes-001-preview.jpg --file=public/templates/memes-001-preview.jpg
wrangler r2 object put quoteviral-templates/templates/inspirational-001-preview.jpg --file=public/templates/inspirational-001-preview.jpg

echo "Uploading template JSON files..."
wrangler r2 object put quoteviral-templates/templates/motivational-001.json --file=public/templates/motivational-001.json
wrangler r2 object put quoteviral-templates/templates/aesthetic-001.json --file=public/templates/aesthetic-001.json
wrangler r2 object put quoteviral-templates/templates/business-001.json --file=public/templates/business-001.json
wrangler r2 object put quoteviral-templates/templates/memes-001.json --file=public/templates/memes-001.json
wrangler r2 object put quoteviral-templates/templates/inspirational-001.json --file=public/templates/inspirational-001.json

echo "Uploading font assets..."
wrangler r2 object put quoteviral-templates/fonts/Inter-Bold.woff2 --file=public/fonts/Inter-Bold.woff2
wrangler r2 object put quoteviral-templates/fonts/Poppins-Regular.woff2 --file=public/fonts/Poppins-Regular.woff2
wrangler r2 object put quoteviral-templates/fonts/Roboto-Bold.woff2 --file=public/fonts/Roboto-Bold.woff2

echo "Uploading overlay assets..."
wrangler r2 object put quoteviral-templates/overlays/gradient-dark.png --file=public/overlays/gradient-dark.png
wrangler r2 object put quoteviral-templates/overlays/gradient-light.png --file=public/overlays/gradient-light.png
wrangler r2 object put quoteviral-templates/overlays/texture-fabric.png --file=public/overlays/texture-fabric.png
wrangler r2 object put quoteviral-templates/overlays/texture-paper.png --file=public/overlays/texture-paper.png

echo "Uploading frame assets..."
wrangler r2 object put quoteviral-templates/frames/frame-gold.png --file=public/frames/frame-gold.png
wrangler r2 object put quoteviral-templates/frames/frame-simple.png --file=public/frames/frame-simple.png
wrangler r2 object put quoteviral-templates/frames/frame-modern.png --file=public/frames/frame-modern.png

echo "Asset upload completed successfully!"