#!/bin/bash

echo "🔍 Image Scraping System Status Check"
echo "===================================="

echo ""
echo "1. Environment Configuration:"
cd /workspaces/freerooom-proplist
grep -E "(NODE_ENV|STORAGE_TYPE|UPLOAD_PROVIDER)" .env || echo "Missing environment variables"

echo ""
echo "2. Recent Image Downloads:"
find public/uploads/properties -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" | head -10

echo ""
echo "3. Directory Structure:"
ls -la public/uploads/properties/ | tail -5

echo ""
echo "4. Latest Property with Images:"
LATEST_PROP=$(ls -t public/uploads/properties/prop-* | head -1)
if [ -d "$LATEST_PROP" ]; then
    echo "Latest property: $LATEST_PROP"
    echo "Image count: $(ls $LATEST_PROP | wc -l)"
    echo "Sample images: $(ls $LATEST_PROP | head -3)"
else
    echo "No recent property directories found"
fi

echo ""
echo "5. Server Status:"
if pgrep -f "next dev" > /dev/null; then
    echo "✅ Next.js development server is running"
else
    echo "❌ Next.js development server is not running"
fi
