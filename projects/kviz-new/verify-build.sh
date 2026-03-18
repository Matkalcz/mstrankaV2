#!/bin/bash
# Build verification script for Next.js kviz project
# Run this after 'npm run build' to verify the build output
# Usage: ./verify-build.sh

set -e

echo "=== Next.js Build Verification ==="
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"

# Check if .next directory exists
if [ ! -d ".next" ]; then
    echo "❌ ERROR: .next directory not found. Run 'npm run build' first."
    exit 1
fi

# Check build output structure
echo "1. Checking build structure..."

REQUIRED_DIRS=("static/css" "static/chunks" "server" "standalone")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d ".next/$dir" ]; then
        echo "   ✅ .next/$dir exists"
    else
        echo "   ⚠️  .next/$dir missing (might be OK depending on config)"
    fi
done

# Count static files
echo "2. Counting static files..."

CSS_COUNT=$(find .next/static/css -name "*.css" 2>/dev/null | wc -l)
JS_COUNT=$(find .next/static/chunks -name "*.js" 2>/dev/null | wc -l)
MEDIA_COUNT=$(find .next/static/media -name "*" -type f 2>/dev/null | wc -l)

echo "   CSS files: $CSS_COUNT"
echo "   JS chunks: $JS_COUNT" 
echo "   Media files: $MEDIA_COUNT"

if [ "$CSS_COUNT" -eq 0 ]; then
    echo "   ❌ ERROR: No CSS files found. Build likely failed."
    exit 1
fi

if [ "$JS_COUNT" -eq 0 ]; then
    echo "   ⚠️  WARNING: No JS chunks found. Check build configuration."
fi

# Check standalone directory (if using standalone output)
if [ -d ".next/standalone" ]; then
    echo "3. Checking standalone output..."
    
    if [ -f ".next/standalone/server.js" ]; then
        echo "   ✅ server.js exists"
    else
        echo "   ❌ server.js missing in standalone output"
    fi
    
    if [ -d ".next/standalone/.next/static" ]; then
        echo "   ✅ static files copied to standalone"
        
        STANDALONE_CSS=$(find .next/standalone/.next/static/css -name "*.css" 2>/dev/null | wc -l)
        STANDALONE_JS=$(find .next/standalone/.next/static/chunks -name "*.js" 2>/dev/null | wc -l)
        
        echo "   Standalone CSS: $STANDALONE_CSS files"
        echo "   Standalone JS: $STANDALONE_JS chunks"
        
        if [ "$STANDALONE_CSS" -eq 0 ]; then
            echo "   ⚠️  WARNING: No CSS files in standalone/.next/static"
            echo "   Running copy script..."
            cp -r .next/static .next/standalone/.next/ || echo "   ❌ Copy failed"
        fi
    else
        echo "   ⚠️  WARNING: static directory missing in standalone"
        echo "   Creating directory and copying files..."
        mkdir -p .next/standalone/.next/static
        cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || echo "   ⚠️  Copy may have failed"
    fi
fi

# Check build stats
if [ -f ".next/build-manifest.json" ]; then
    echo "4. Checking build manifest..."
    
    PAGE_COUNT=$(grep -o '"pages":' .next/build-manifest.json | wc -l 2>/dev/null || echo "0")
    echo "   Build manifest exists"
    
    # Extract and show some pages
    echo "   Built pages:"
    grep -o '"/[^"]*"' .next/build-manifest.json | head -10 | sed 's/^/     - /'
else
    echo "4. ⚠️  No build-manifest.json found"
fi

# Check for common build errors
echo "5. Checking for build errors..."
if grep -r "ERROR\|Failed\|SyntaxError" .next/build.log 2>/dev/null | head -5; then
    echo "   ⚠️  Possible errors found in build.log"
else
    echo "   ✅ No obvious errors found"
fi

# Create build info file
echo "6. Creating build info..."
BUILD_INFO=".next/build-info-$(date +%Y%m%d-%H%M%S).txt"
{
    echo "Build verification report"
    echo "========================"
    echo "Date: $(date)"
    echo "CSS files: $CSS_COUNT"
    echo "JS chunks: $JS_COUNT"
    echo "Media files: $MEDIA_COUNT"
    echo "CSS files list:"
    find .next/static/css -name "*.css" 2>/dev/null | xargs -I {} basename {} | sed 's/^/  - /'
    echo "First CSS file: $(find .next/static/css -name "*.css" 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo "none")"
} > "$BUILD_INFO"

echo "=== Verification Complete ==="
echo "✅ Build appears valid"
echo "📋 Build info saved to: $BUILD_INFO"
echo ""
echo "Next steps:"
echo "1. Run health check: ./health-check-static.sh"
echo "2. Deploy: cp -r .next/static .next/standalone/.next/ (if using standalone)"
echo "3. Restart server: sudo systemctl restart kviz-nextjs (or similar)"

exit 0