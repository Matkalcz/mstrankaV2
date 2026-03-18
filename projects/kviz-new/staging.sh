#!/bin/bash
# Staging environment setup for kviz project
# Run on port 3003 for testing before production deployment

set -e

echo "=== Staging Environment Setup ==="
echo "Port: 3003"
echo ""

# Configuration
STAGING_PORT=3003
STAGING_DIR=".next/staging"
PROD_BUILD_DIR=".next/standalone"

# Kill existing staging server
echo "1. Stopping any existing staging server..."
sudo lsof -ti:$STAGING_PORT 2>/dev/null | xargs sudo kill -9 2>/dev/null || true
sleep 2

# Create staging directory
echo "2. Preparing staging directory..."
mkdir -p "$STAGING_DIR"

# Copy production build to staging
echo "3. Copying production build to staging..."
if [ -d "$PROD_BUILD_DIR" ]; then
    rsync -a --delete "$PROD_BUILD_DIR/" "$STAGING_DIR/"
    echo "   ✅ Build copied to staging"
else
    echo "   ❌ Production build not found at $PROD_BUILD_DIR"
    echo "   Run 'npm run build' first"
    exit 1
fi

# Ensure static files are present
echo "4. Verifying static files..."
if [ -f "$STAGING_DIR/.next/static/css/"*.css ]; then
    CSS_FILE=$(basename "$STAGING_DIR/.next/static/css/"*.css | head -1)
    echo "   ✅ CSS file: $CSS_FILE"
else
    echo "   ⚠️  No CSS files found, copying from .next/static/"
    mkdir -p "$STAGING_DIR/.next/static"
    cp -r .next/static/* "$STAGING_DIR/.next/static/" 2>/dev/null || true
fi

# Start staging server
echo "5. Starting staging server..."
cd "$STAGING_DIR"
nohup node server.js --port $STAGING_PORT > /tmp/kviz-staging-$(date +%Y%m%d-%H%M%S).log 2>&1 &
STAGING_PID=$!

sleep 3

# Verify server started
echo "6. Verifying staging server..."
if curl -s http://localhost:$STAGING_PORT/admin >/dev/null 2>&1; then
    echo "   ✅ Staging server running (PID: $STAGING_PID)"
    echo "   URL: http://localhost:$STAGING_PORT/admin"
else
    echo "   ❌ Staging server failed to start"
    echo "   Check logs: tail -f /tmp/kviz-staging-*.log"
    exit 1
fi

# Health check
echo "7. Running health checks..."
cd - >/dev/null
echo "   Checking static files..."
CSS_PATH=$(curl -s http://localhost:$STAGING_PORT/admin | grep -o '/_next/static/css/[^"]*\.css' | head -1)
if [ -n "$CSS_PATH" ]; then
    if curl -s -f http://localhost:$STAGING_PORT$CSS_PATH >/dev/null; then
        echo "   ✅ CSS accessible"
    else
        echo "   ⚠️  CSS not accessible"
    fi
fi

echo ""
echo "=== Staging Environment Ready ==="
echo "Staging URL: http://localhost:$STAGING_PORT/admin"
echo "Production URL: https://kviz.michaljanda.com/admin"
echo "Staging PID: $STAGING_PID"
echo "Log file: /tmp/kviz-staging-*.log"
echo ""
echo "Next steps:"
echo "1. Test staging: http://localhost:$STAGING_PORT/admin"
echo "2. Check logs: tail -f /tmp/kviz-staging-*.log"
echo "3. Compare with production"
echo "4. Run full test suite"
echo ""
echo "To stop staging: kill -9 $STAGING_PID"

exit 0