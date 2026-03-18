#!/bin/bash
# Health check script for kviz.michaljanda.com
# Checks CSS loading and application health

set -e

URL="https://kviz.michaljanda.com"
ADMIN_URL="$URL/admin"

echo "=== Health Check for kviz.michaljanda.com ==="
echo "Timestamp: $(date)"
echo ""

# Check 1: Admin page loads
echo "1. Checking admin page..."
if curl -s -f "$ADMIN_URL" > /dev/null; then
    echo "   ✅ Admin page loads successfully"
else
    echo "   ❌ Admin page failed to load"
    exit 1
fi

# Check 2: Extract and verify CSS
echo "2. Checking CSS file..."
CSS_PATH=$(curl -s "$ADMIN_URL" | grep -o '/_next/static/css/[^"]*\.css' | head -1)

if [ -z "$CSS_PATH" ]; then
    echo "   ❌ No CSS path found in HTML"
    exit 1
fi

echo "   Found CSS: $CSS_PATH"

if curl -s -f "$URL$CSS_PATH" > /dev/null; then
    echo "   ✅ CSS loads successfully"
else
    echo "   ❌ CSS failed to load"
    exit 1
fi

# Check 3: Verify CSS is not empty
CSS_CONTENT=$(curl -s "$URL$CSS_PATH" | head -c 100)
if [ -n "$CSS_CONTENT" ]; then
    echo "   ✅ CSS contains content (first 100 chars): ${CSS_CONTENT:0:50}..."
else
    echo "   ❌ CSS is empty"
    exit 1
fi

# Check 4: Check Next.js server is running
echo "3. Checking Next.js server..."
if curl -s -f "http://localhost:3002" > /dev/null; then
    echo "   ✅ Next.js server is running on port 3002"
else
    echo "   ❌ Next.js server not responding on port 3002"
    exit 1
fi

# Check 5: Verify static files directory
echo "4. Checking build artifacts..."
if [ -d "/home/openclaw/.openclaw/workspace-domminik/kviz-new/.next/static/css" ]; then
    CSS_COUNT=$(find /home/openclaw/.openclaw/workspace-domminik/kviz-new/.next/static/css -name "*.css" | wc -l)
    echo "   ✅ CSS directory exists with $CSS_COUNT CSS file(s)"
else
    echo "   ❌ CSS directory not found"
    exit 1
fi

echo ""
echo "=== All health checks passed ==="
echo "Application is healthy and serving static files correctly."