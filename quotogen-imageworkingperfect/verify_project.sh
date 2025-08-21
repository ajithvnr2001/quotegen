#!/bin/bash

# QuoteViral Project Verification Script
# This script verifies that all necessary files have been created

echo "=================================="
echo " QuoteViral Project Verification "
echo "=================================="
echo ""

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $2"
    else
        echo "❌ $2 (MISSING)"
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $2"
    else
        echo "❌ $2 (MISSING)"
    fi
}

# Navigate to project root
cd "$(dirname "$0")/quoteviral_unzipped/quoteviral" || exit 1

echo "📁 Checking directory structure..."
check_dir "frontend" "Frontend directory"
check_dir "workers" "Workers directory"
check_dir "frontend/src" "Frontend source directory"
check_dir "workers/src" "Workers source directory"
check_dir "frontend/public" "Frontend public directory"
echo ""

echo "📄 Checking frontend source files..."
check_file "frontend/src/App.tsx" "Main application component"
check_file "frontend/src/TextEditorPanel.tsx" "Text editor component"
check_file "frontend/src/TemplateSelector.tsx" "Template selector component"
check_file "frontend/src/BatchGenerator.tsx" "Batch generator component"
check_file "frontend/src/HealthMonitor.tsx" "Health monitor component"
check_file "frontend/src/imageProcessor.worker.ts" "Image processor worker"
echo ""

echo "📄 Checking worker source files..."
check_file "workers/src/index.ts" "Worker entry point"
check_file "workers/src/handlers.ts" "API handlers"
check_file "workers/src/templates.ts" "Templates and quotes"
check_file "workers/src/textOverlay.ts" "Text overlay system"
check_file "workers/src/outputFormats.ts" "Output formats"
check_file "workers/src/cache.ts" "Caching system"
check_file "workers/src/security.ts" "Security system"
check_file "workers/src/monitoring.ts" "Monitoring system"
check_file "workers/src/imageServing.ts" "Image serving"
check_file "workers/src/serveImage.ts" "Image serving endpoint"
echo ""

echo "📄 Checking configuration files..."
check_file "frontend/package.json" "Frontend package.json"
check_file "workers/package.json" "Workers package.json"
check_file "workers/wrangler.toml" "Wrangler configuration"
check_file "frontend/vite.config.ts" "Vite configuration"
echo ""

echo "📄 Checking documentation files..."
check_file "IMPLEMENTATION_SUMMARY.md" "Implementation summary"
check_file "deployment_plan.md" "Deployment plan"
check_file "PROJECT_STRUCTURE.md" "Project structure"
check_file "README.md" "Main README"
check_file "frontend/README.md" "Frontend README"
check_file "workers/README.md" "Workers README"
echo ""

echo "📄 Checking script files..."
check_file "../deploy_all.sh" "Deployment script (Linux/Mac)"
check_file "../deploy_all.bat" "Deployment script (Windows)"
check_file "upload_assets.sh" "Asset upload script (Linux/Mac)"
check_file "upload_assets.bat" "Asset upload script (Windows)"
check_file "test_api.sh" "API test script (Linux/Mac)"
check_file "test_api.bat" "API test script (Windows)"
echo ""

echo "📂 Checking asset directories..."
check_dir "frontend/public/templates" "Templates directory"
check_dir "frontend/public/fonts" "Fonts directory"
check_dir "frontend/public/overlays" "Overlays directory"
check_dir "frontend/public/frames" "Frames directory"
echo ""

echo "🖼️ Checking template assets..."
check_file "frontend/public/templates/motivational-001.json" "Motivational template metadata"
check_file "frontend/public/templates/motivational-001-preview.jpg" "Motivational template preview"
check_file "frontend/public/templates/aesthetic-001.json" "Aesthetic template metadata"
check_file "frontend/public/templates/aesthetic-001-preview.jpg" "Aesthetic template preview"
check_file "frontend/public/templates/business-001.json" "Business template metadata"
check_file "frontend/public/templates/business-001-preview.jpg" "Business template preview"
check_file "frontend/public/templates/memes-001.json" "Memes template metadata"
check_file "frontend/public/templates/memes-001-preview.jpg" "Memes template preview"
check_file "frontend/public/templates/inspirational-001.json" "Inspirational template metadata"
check_file "frontend/public/templates/inspirational-001-preview.jpg" "Inspirational template preview"
echo ""

echo "📄 Checking asset documentation..."
check_file "frontend/public/fonts/README.md" "Fonts documentation"
check_file "frontend/public/overlays/README.md" "Overlays documentation"
check_file "frontend/public/frames/README.md" "Frames documentation"
echo ""

echo "=================================="
echo " Verification complete "
echo "=================================="