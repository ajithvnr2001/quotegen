@echo off
REM QuoteViral Asset Upload Script for Windows
REM This script uploads all template assets to Cloudflare R2

echo Starting QuoteViral asset upload...

REM Check if wrangler is installed
where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo Wrangler CLI could not be found. Please install it with: npm install -g wrangler
    pause
    exit /b 1
)

REM Navigate to frontend directory
cd /d "%~dp0frontend"

echo Uploading template preview images...
wrangler r2 object put quoteviral-templates/templates/motivational-001-preview.jpg --file=public/templates/motivational-001-preview.jpg
wrangler r2 object put quoteviral-templates/templates/aesthetic-001-preview.jpg --file=public/templates/aesthetic-001-preview.jpg
wrangler r2 object put quoteviral-templates/templates/business-001-preview.jpg --file=public/templates/business-001-preview.jpg
wrangler r2 object put quoteviral-templates/templates/memes-001-preview.jpg --file=public/templates/memes-001-preview.jpg
wrangler r2 object put quoteviral-templates/templates/inspirational-001-preview.jpg --file=public/templates/inspirational-001-preview.jpg

echo Uploading template JSON files...
wrangler r2 object put quoteviral-templates/templates/motivational-001.json --file=public/templates/motivational-001.json
wrangler r2 object put quoteviral-templates/templates/aesthetic-001.json --file=public/templates/aesthetic-001.json
wrangler r2 object put quoteviral-templates/templates/business-001.json --file=public/templates/business-001.json
wrangler r2 object put quoteviral-templates/templates/memes-001.json --file=public/templates/memes-001.json
wrangler r2 object put quoteviral-templates/templates/inspirational-001.json --file=public/templates/inspirational-001.json

echo Uploading font assets...
wrangler r2 object put quoteviral-templates/fonts/Inter-Bold.woff2 --file=public/fonts/Inter-Bold.woff2
wrangler r2 object put quoteviral-templates/fonts/Poppins-Regular.woff2 --file=public/fonts/Poppins-Regular.woff2
wrangler r2 object put quoteviral-templates/fonts/Roboto-Bold.woff2 --file=public/fonts/Roboto-Bold.woff2

echo Uploading overlay assets...
wrangler r2 object put quoteviral-templates/overlays/gradient-dark.png --file=public/overlays/gradient-dark.png
wrangler r2 object put quoteviral-templates/overlays/gradient-light.png --file=public/overlays/gradient-light.png
wrangler r2 object put quoteviral-templates/overlays/texture-fabric.png --file=public/overlays/texture-fabric.png
wrangler r2 object put quoteviral-templates/overlays/texture-paper.png --file=public/overlays/texture-paper.png

echo Uploading frame assets...
wrangler r2 object put quoteviral-templates/frames/frame-gold.png --file=public/frames/frame-gold.png
wrangler r2 object put quoteviral-templates/frames/frame-simple.png --file=public/frames/frame-simple.png
wrangler r2 object put quoteviral-templates/frames/frame-modern.png --file=public/frames/frame-modern.png

echo Asset upload completed successfully!
pause