#!/bin/bash

# QuoteViral API Test Script
# This script tests all the API endpoints to verify functionality

echo "Starting QuoteViral API tests..."

# Configuration
API_BASE="https://api.quoteviral.online"
FRONTEND_URL="https://quoteviral.online"

# Test functions
test_endpoint() {
    local endpoint=$1
    local description=$2
    echo "Testing $description..."
    local response=$(curl -s -w "%{http_code}" -o /dev/null "$API_BASE$endpoint")
    if [ "$response" -eq 200 ]; then
        echo "✅ $description: SUCCESS"
    else
        echo "❌ $description: FAILED (HTTP $response)"
    fi
    echo ""
}

# Test health endpoint
test_endpoint "/api/health" "Health Monitoring"

# Test categories endpoint
test_endpoint "/api/categories" "Categories List"

# Test languages endpoint
test_endpoint "/api/languages" "Languages List"

# Test quotes endpoint
test_endpoint "/api/quotes?category=motivational&language=en" "Quotes Retrieval"

# Test fonts endpoint
test_endpoint "/api/fonts" "Fonts List"

# Test templates endpoint
test_endpoint "/api/templates" "Templates List"

# Test frontend accessibility
echo "Testing Frontend Accessibility..."
frontend_response=$(curl -s -w "%{http_code}" -o /dev/null "$FRONTEND_URL")
if [ "$frontend_response" -eq 200 ]; then
    echo "✅ Frontend Accessibility: SUCCESS"
else
    echo "❌ Frontend Accessibility: FAILED (HTTP $frontend_response)"
fi
echo ""

echo "API testing completed. Check results above."