@echo off
REM QuoteViral API Test Script for Windows
REM This script tests all the API endpoints to verify functionality

echo Starting QuoteViral API tests...

REM Configuration
set API_BASE=https://api.quoteviral.online
set FRONTEND_URL=https://quoteviral.online

REM Test health endpoint
echo Testing Health Monitoring...
curl -s -w "%%{http_code}" -o nul "%API_BASE%/api/health" > temp.txt
set /p response=<temp.txt
del temp.txt
if "%response%"=="200" (
    echo ✅ Health Monitoring: SUCCESS
) else (
    echo ❌ Health Monitoring: FAILED (HTTP %response%)
)
echo.

REM Test categories endpoint
echo Testing Categories List...
curl -s -w "%%{http_code}" -o nul "%API_BASE%/api/categories" > temp.txt
set /p response=<temp.txt
del temp.txt
if "%response%"=="200" (
    echo ✅ Categories List: SUCCESS
) else (
    echo ❌ Categories List: FAILED (HTTP %response%)
)
echo.

REM Test languages endpoint
echo Testing Languages List...
curl -s -w "%%{http_code}" -o nul "%API_BASE%/api/languages" > temp.txt
set /p response=<temp.txt
del temp.txt
if "%response%"=="200" (
    echo ✅ Languages List: SUCCESS
) else (
    echo ❌ Languages List: FAILED (HTTP %response%)
)
echo.

REM Test quotes endpoint
echo Testing Quotes Retrieval...
curl -s -w "%%{http_code}" -o nul "%API_BASE%/api/quotes?category=motivational^&language=en" > temp.txt
set /p response=<temp.txt
del temp.txt
if "%response%"=="200" (
    echo ✅ Quotes Retrieval: SUCCESS
) else (
    echo ❌ Quotes Retrieval: FAILED (HTTP %response%)
)
echo.

REM Test fonts endpoint
echo Testing Fonts List...
curl -s -w "%%{http_code}" -o nul "%API_BASE%/api/fonts" > temp.txt
set /p response=<temp.txt
del temp.txt
if "%response%"=="200" (
    echo ✅ Fonts List: SUCCESS
) else (
    echo ❌ Fonts List: FAILED (HTTP %response%)
)
echo.

REM Test templates endpoint
echo Testing Templates List...
curl -s -w "%%{http_code}" -o nul "%API_BASE%/api/templates" > temp.txt
set /p response=<temp.txt
del temp.txt
if "%response%"=="200" (
    echo ✅ Templates List: SUCCESS
) else (
    echo ❌ Templates List: FAILED (HTTP %response%)
)
echo.

REM Test frontend accessibility
echo Testing Frontend Accessibility...
curl -s -w "%%{http_code}" -o nul "%FRONTEND_URL%" > temp.txt
set /p response=<temp.txt
del temp.txt
if "%response%"=="200" (
    echo ✅ Frontend Accessibility: SUCCESS
) else (
    echo ❌ Frontend Accessibility: FAILED (HTTP %response%)
)
echo.

echo API testing completed. Check results above.
pause