@echo off
REM QuoteViral Complete Deployment Script for Windows
REM This script automates the entire deployment process

echo ========================================
echo  QuoteViral Complete Deployment Script 
echo ========================================
echo.

REM Check if wrangler is installed
where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Wrangler CLI could not be found.
    echo Please install it with: npm install -g wrangler
    pause
    exit /b 1
)

REM Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js could not be found.
    echo Please install Node.js (v18 or higher)
    pause
    exit /b 1
)

echo ✅ Prerequisites verified
echo.

REM Navigate to project root
cd /d "%~dp0quoteviral_unzipped\quoteviral"

echo 📦 Installing dependencies...
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd ../workers
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
echo.

REM Build frontend
echo 🏗️ Building frontend...
cd ../frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)
echo ✅ Frontend built successfully
echo.

REM Deploy backend
echo 🚀 Deploying backend...
cd ../workers
wrangler deploy
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy backend
    pause
    exit /b 1
)
echo ✅ Backend deployed successfully
echo.

REM Deploy frontend
echo 🌐 Deploying frontend...
cd ../frontend
wrangler pages deploy dist
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy frontend
    pause
    exit /b 1
)
echo ✅ Frontend deployed successfully
echo.

REM Upload assets
echo 📂 Uploading assets...
cd ..
call upload_assets.bat
if %errorlevel% neq 0 (
    echo ❌ Failed to upload assets
    pause
    exit /b 1
)
echo ✅ Assets uploaded successfully
echo.

echo ========================================
echo 🎉 Deployment completed successfully! 🎉
echo ========================================
echo.
echo Next steps:
echo 1. Configure custom domains in Cloudflare dashboard:
echo    - api.quoteviral.online for the worker
echo    - quoteviral.online for the frontend
echo 2. Test the deployment using test_api.bat
echo 3. Monitor system health through the health monitoring component
echo.
echo The QuoteViral platform is now ready for production use!
pause