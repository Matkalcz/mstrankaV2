#!/bin/bash
# Build verification script for Next.js static export
# Checks that all required static files are generated correctly

set -e

BUILD_DIR="${1:-.next}"
EXPORT_DIR="${2:-/var/www/kviz-export}"

echo "=== Build Verification ==="
echo "Build directory: $BUILD_DIR"
echo "Export directory: $EXPORT_DIR"
echo

# Function to check file or directory
check_exists() {
    local path="$1"
    local description="$2"
    
    echo -n "Checking $description... "
    if [ -e "$path" ]; then
        echo "✓ OK"
        return 0
    else
        echo "✗ MISSING"
        return 1
    fi
}

# Function to check non-empty directory
check_nonempty_dir() {
    local path="$1"
    local description="$2"
    
    echo -n "Checking $description (non-empty)... "
    if [ -d "$path" ] && [ "$(ls -A "$path" 2>/dev/null | wc -l)" -gt 0 ]; then
        echo "✓ OK ($(ls -A "$path" 2>/dev/null | wc -l) files)"
        return 0
    else
        echo "✗ EMPTY or missing"
        return 1
    fi
}

# Function to check for specific file patterns
check_file_pattern() {
    local pattern="$1"
    local description="$2"
    
    echo -n "Checking $description... "
    local count=$(find . -name "$pattern" 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "✓ Found $count file(s)"
        return 0
    else
        echo "✗ Not found"
        return 1
    fi
}

# Check build directory structure
ERRORS=0

echo "--- Build Directory Checks ---"
check_exists "$BUILD_DIR" "build directory" || ERRORS=$((ERRORS + 1))
check_exists "$BUILD_DIR/static" "static directory" || ERRORS=$((ERRORS + 1))
check_nonempty_dir "$BUILD_DIR/static/css" "CSS directory" || ERRORS=$((ERRORS + 1))
check_nonempty_dir "$BUILD_DIR/static/chunks" "JS chunks directory" || ERRORS=$((ERRORS + 1))

# Check for required file types
echo "--- File Type Checks ---"
check_file_pattern "*.css" "CSS files" || ERRORS=$((ERRORS + 1))
check_file_pattern "*.js" "JavaScript files" || ERRORS=$((ERRORS + 1))

# If export directory is specified, check it too
if [ -n "$EXPORT_DIR" ] && [ "$EXPORT_DIR" != "." ]; then
    echo "--- Export Directory Checks ---"
    check_exists "$EXPORT_DIR" "export directory" || ERRORS=$((ERRORS + 1))
    check_exists "$EXPORT_DIR/_next" "_next directory in export" || ERRORS=$((ERRORS + 1))
    check_nonempty_dir "$EXPORT_DIR/_next/static/css" "export CSS directory" || ERRORS=$((ERRORS + 1))
    
    # Check if index.html exists
    check_exists "$EXPORT_DIR/index.html" "index.html" || ERRORS=$((ERRORS + 1))
    
    # Check if admin directory exists
    check_exists "$EXPORT_DIR/admin" "admin directory" || ERRORS=$((ERRORS + 1))
fi

# Summary
echo
echo "=== Summary ==="
echo "Total checks: Various"
echo "Failures: $ERRORS"

if [ "$ERRORS" -eq 0 ]; then
    echo "✓ Build verification PASSED"
    exit 0
else
    echo "✗ Build verification FAILED"
    echo
    echo "Troubleshooting tips:"
    echo "1. Run 'npm run build' to rebuild"
    echo "2. Check Next.js build logs for errors"
    echo "3. Verify next.config.js settings"
    echo "4. Check disk space and permissions"
    exit 1
fi