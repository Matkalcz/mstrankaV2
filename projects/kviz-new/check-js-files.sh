#!/bin/bash
# Check all JS files referenced in HTML

echo "=== JavaScript Files Check ==="
echo "URL: http://localhost:3002/admin"
echo ""

# Get HTML and extract script src
HTML=$(curl -s http://localhost:3002/admin)

echo "Script tags found:"
echo "$HTML" | grep -o '<script[^>]*src="[^"]*"' | sed 's/.*src="//' | sed 's/".*//' | sort -u | while read src; do
    echo "  - $src"
done

echo ""
echo "Checking accessibility..."

# Check each JS file
echo "$HTML" | grep -o '<script[^>]*src="[^"]*"' | sed 's/.*src="//' | sed 's/".*//' | sort -u | while read src; do
    if [[ $src == /* ]]; then
        # Relative URL
        echo -n "  $src: "
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3002$src" | grep -q "200"; then
            echo "✅ OK"
        else
            echo "❌ FAILED"
        fi
    elif [[ $src == http* ]]; then
        echo "  $src: ⚠️ External (skipping)"
    else
        echo "  $src: ⚠️ Unknown format"
    fi
done

echo ""
echo "Checking Next.js specific files..."

# Check for critical Next.js files
CRITICAL_FILES=(
    "/_next/static/chunks/main.js"
    "/_next/static/chunks/webpack.js"
    "/_next/static/chunks/react-refresh.js"
    "/_next/static/chunks/polyfills.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    echo -n "  $file: "
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3002$file" | grep -q "200"; then
        echo "✅ OK"
    else
        echo "❌ MISSING"
    fi
done

echo ""
echo "Checking CSS..."
CSS_PATH=$(echo "$HTML" | grep -o '/_next/static/css/[^"]*\.css' | head -1)
if [ -n "$CSS_PATH" ]; then
    echo -n "  $CSS_PATH: "
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3002$CSS_PATH" | grep -q "200"; then
        echo "✅ OK"
    else
        echo "❌ MISSING"
    fi
else
    echo "  ⚠️ No CSS found in HTML"
fi

echo ""
echo "Checking for React hydration issues..."
# Look for __NEXT_DATA__ script
if echo "$HTML" | grep -q "__NEXT_DATA__"; then
    echo "  ✅ __NEXT_DATA__ found (React hydration should work)"
else
    echo "  ❌ __NEXT_DATA__ missing (React hydration may fail)"
fi

echo ""
echo "=== Summary ==="
echo "If all JS files are accessible, the problem might be:"
echo "1. JavaScript errors in console"
echo "2. React hydration mismatch"
echo "3. Router initialization issue"
echo "4. CSS blocking rendering"
echo ""
echo "To debug further, open browser DevTools (F12) and check:"
echo "- Console tab for errors"
echo "- Network tab for failed requests"
echo "- Elements tab to see if React rendered correctly"