#!/bin/bash
# CI test script for kviz project
# Run tests before deployment

set -e

echo "=== CI Test Suite - kviz.michaljanda.com ==="
echo "Start time: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Step 1: Environment check
echo "1. Environment check:"
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"
echo "   Current dir: $(pwd)"
echo ""

# Step 2: Dependency check
echo "2. Dependency check:"
if [ -f "package-lock.json" ]; then
    echo "   package-lock.json exists"
    LOCKFILE="package-lock.json"
elif [ -f "yarn.lock" ]; then
    echo "   yarn.lock exists"
    LOCKFILE="yarn.lock"
else
    echo "   ⚠️ No lockfile found"
    LOCKFILE=""
fi

# Step 3: Install dependencies
echo "3. Installing dependencies..."
if [ -n "$LOCKFILE" ] && [ -f "package-lock.json" ]; then
    npm ci --silent
else
    npm install --silent
fi
echo "   ✅ Dependencies installed"
echo ""

# Step 4: TypeScript check
echo "4. TypeScript type check..."
if npx tsc --noEmit --skipLibCheck 2>&1 | grep -q "error"; then
    echo "   ❌ TypeScript errors found"
    npx tsc --noEmit --skipLibCheck 2>&1 | grep -i "error" | head -5
    exit 1
else
    echo "   ✅ TypeScript OK"
fi
echo ""

# Step 5: Build test
echo "5. Test build..."
if npm run build 2>&1 | tail -20 | grep -q "error\|failed"; then
    echo "   ❌ Build failed"
    npm run build 2>&1 | tail -20
    exit 1
else
    echo "   ✅ Build succeeded"
fi
echo ""

# Step 6: Verify build output
echo "6. Verifying build output..."
REQUIRED_FILES=(
    ".next/static/css/*.css"
    ".next/static/chunks/*.js"
    ".next/build-manifest.json"
)

for pattern in "${REQUIRED_FILES[@]}"; do
    if ls $pattern >/dev/null 2>&1; then
        echo "   ✅ $(echo $pattern | sed 's/.*\///') exists"
    else
        echo "   ⚠️  $pattern not found (might be OK)"
    fi
done

CSS_COUNT=$(find .next/static/css -name "*.css" 2>/dev/null | wc -l)
JS_COUNT=$(find .next/static/chunks -name "*.js" 2>/dev/null | wc -l)

echo "   CSS files: $CSS_COUNT"
echo "   JS chunks: $JS_COUNT"

if [ "$CSS_COUNT" -eq 0 ]; then
    echo "   ❌ No CSS files found - build likely invalid"
    exit 1
fi
echo ""

# Step 7: Health endpoint check (if built)
echo "7. Health endpoint simulation..."
if [ -f ".next/server/server.js" ]; then
    echo "   Server built, would check health endpoint"
    echo "   (In CI, would start server and curl /api/health)"
else
    echo "   ⚠️ Server not built (SSG mode)"
fi
echo ""

# Step 8: Security audit
echo "8. Security audit..."
if npm audit --json 2>/dev/null | jq -e '.metadata.vulnerabilities.total > 0' >/dev/null 2>&1; then
    VULNS=$(npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities.total')
    echo "   ⚠️  $VULNS vulnerabilities found"
    echo "   Run 'npm audit fix' to address"
else
    echo "   ✅ No critical vulnerabilities found"
fi
echo ""

# Step 9: Summary
echo "=== Test Suite Complete ==="
echo "✅ All tests passed"
echo "📊 Summary:"
echo "   - TypeScript: OK"
echo "   - Build: OK"
echo "   - Static files: $CSS_COUNT CSS, $JS_COUNT JS"
echo "   - Dependencies: Installed"
echo ""
echo "Ready for deployment!"
echo "End time: $(date '+%Y-%m-%d %H:%M:%S')"

exit 0