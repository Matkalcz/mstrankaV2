#!/bin/bash
# Health check script for kviz.michaljanda.com - verifies static files are accessible
# Usage: ./health-check-static.sh

set -e

BASE_URL="https://kviz.michaljanda.com"
ADMIN_URL="${BASE_URL}/admin"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] === Static Files Health Check ==="

# Check 1: Main admin page
echo -n "[1] Checking admin page... "
if curl -s -f -o /dev/null --max-time 10 "$ADMIN_URL"; then
    echo "✅ OK (200)"
else
    echo "❌ FAILED"
    exit 1
fi

# Check 2: Extract and verify CSS
echo -n "[2] Extracting CSS path... "
CSS_PATH=$(curl -s "$ADMIN_URL" | grep -o '/_next/static/css/[^"]*\.css' | head -1)
if [ -n "$CSS_PATH" ]; then
    echo "✅ Found: $CSS_PATH"
else
    echo "❌ No CSS path found in HTML"
    exit 1
fi

echo -n "[3] Verifying CSS file... "
if curl -s -f -o /dev/null --max-time 10 "${BASE_URL}${CSS_PATH}"; then
    echo "✅ OK (200)"
else
    echo "❌ CSS not accessible: ${BASE_URL}${CSS_PATH}"
    exit 1
fi

# Check 4: Verify at least one JS chunk
echo -n "[4] Checking JS chunks... "
JS_PATH=$(curl -s "$ADMIN_URL" | grep -o '/_next/static/chunks/[^"]*\.js' | head -1)
if [ -n "$JS_PATH" ]; then
    echo -n "Found: $(basename "$JS_PATH") "
    if curl -s -f -o /dev/null --max-time 10 "${BASE_URL}${JS_PATH}"; then
        echo "✅ OK"
    else
        echo "❌ JS not accessible"
        exit 1
    fi
else
    echo "⚠️ No JS chunks found (might be OK for SSR pages)"
fi

# Check 5: Verify middleware (if exists)
echo -n "[5] Checking middleware... "
if curl -s -I "${BASE_URL}/" | grep -q "Location:.*/admin"; then
    echo "✅ Redirect to /admin working"
else
    echo "⚠️ No redirect detected (might be OK)"
fi

# Summary
echo "=== Summary ==="
echo "✅ All static files are accessible"
echo "✅ CSS: $CSS_PATH"
echo "✅ Admin page: 200 OK"
echo "✅ Timestamp: $TIMESTAMP"

# Additional verification for build directory (if running locally)
if [ -d ".next/static" ]; then
    echo "=== Local Build Verification ==="
    CSS_COUNT=$(find .next/static/css -name "*.css" 2>/dev/null | wc -l)
    JS_COUNT=$(find .next/static/chunks -name "*.js" 2>/dev/null | wc -l)
    echo "Local CSS files: $CSS_COUNT"
    echo "Local JS chunks: $JS_COUNT"
    
    if [ "$CSS_COUNT" -eq 0 ]; then
        echo "⚠️ WARNING: No CSS files in .next/static/css/"
    fi
    if [ "$JS_COUNT" -eq 0 ]; then
        echo "⚠️ WARNING: No JS chunks in .next/static/chunks/"
    fi
fi

exit 0