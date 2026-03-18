#!/bin/bash
# Health check script for static files deployment
# Checks if CSS and JS files are accessible

set -e

URL="${1:-https://kviz.michaljanda.com}"
ADMIN_URL="$URL/admin"

echo "=== Health check for static files ==="
echo "Checking URL: $URL"
echo "Admin URL: $ADMIN_URL"
echo

# Function to check URL with curl
check_url() {
    local url="$1"
    local description="$2"
    
    echo -n "Checking $description... "
    if curl -s -f -o /dev/null --max-time 10 "$url"; then
        echo "✓ OK"
        return 0
    else
        echo "✗ FAILED"
        return 1
    fi
}

# Function to extract and check CSS
check_css() {
    echo -n "Extracting CSS path from HTML... "
    
    # Get HTML and extract CSS path
    HTML=$(curl -s --max-time 10 "$ADMIN_URL" || echo "")
    if [ -z "$HTML" ]; then
        echo "✗ Failed to fetch HTML"
        return 1
    fi
    
    # Try different patterns for CSS extraction
    CSS_PATH=$(echo "$HTML" | grep -o '/_next/static/css/[^"]*\.css' | head -1)
    
    if [ -z "$CSS_PATH" ]; then
        # Try alternative pattern
        CSS_PATH=$(echo "$HTML" | grep -o 'href="[^"]*\.css"' | sed 's/href="//' | sed 's/"//' | head -1)
    fi
    
    if [ -z "$CSS_PATH" ]; then
        echo "✗ No CSS path found in HTML"
        return 1
    fi
    
    echo "Found: $CSS_PATH"
    
    # Check if CSS is accessible
    echo -n "Checking CSS file... "
    if curl -s -f -o /dev/null --max-time 10 "$URL$CSS_PATH"; then
        echo "✓ OK"
        return 0
    else
        echo "✗ FAILED"
        return 1
    fi
}

# Function to check JS chunks
check_js() {
    echo -n "Checking JS chunks... "
    
    # Check if any JS files exist in static directory
    JS_COUNT=$(find /var/www/kviz-export/_next/static -name "*.js" 2>/dev/null | wc -l)
    if [ "$JS_COUNT" -gt 0 ]; then
        echo "✓ Found $JS_COUNT JS files"
        return 0
    else
        echo "✗ No JS files found"
        return 1
    fi
}

# Function to check build directory
check_build() {
    echo -n "Checking build directory... "
    
    if [ -d "/var/www/kviz-export/_next" ]; then
        echo "✓ _next directory exists"
        
        # Check for required subdirectories
        for dir in static css chunks; do
            if [ -d "/var/www/kviz-export/_next/$dir" ] || [ -d "/var/www/kviz-export/_next/static/$dir" ]; then
                echo "  ✓ $dir directory exists"
            else
                echo "  ✗ $dir directory missing"
                return 1
            fi
        done
        
        return 0
    else
        echo "✗ _next directory missing"
        return 1
    fi
}

# Run checks
ERRORS=0

check_url "$URL" "main page" || ERRORS=$((ERRORS + 1))
check_url "$ADMIN_URL" "admin page" || ERRORS=$((ERRORS + 1))
check_css || ERRORS=$((ERRORS + 1))
check_js || ERRORS=$((ERRORS + 1))
check_build || ERRORS=$((ERRORS + 1))

echo
echo "=== Summary ==="
if [ "$ERRORS" -eq 0 ]; then
    echo "✓ All checks passed"
    exit 0
else
    echo "✗ $ERRORS check(s) failed"
    exit 1
fi