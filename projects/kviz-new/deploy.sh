#!/bin/bash
# Deployment script for kviz.michaljanda.com
# Run with: ./deploy.sh

set -e

echo "=== kviz.michaljanda.com Deployment Script ==="
echo "Start time: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Configuration
PORT=3002
SERVER_DIR="/home/openclaw/.openclaw/workspace-domminik/kviz-new/.next/standalone"
BACKUP_DIR="${SERVER_DIR}/backup"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_info() { echo -e "ℹ️  $1"; }

# Step 1: Pre-deployment checks
echo "=== Step 1: Pre-deployment Checks ==="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "Not in project root directory (package.json not found)"
    exit 1
fi

log_info "Project directory: $(pwd)"

# Check Node.js version
NODE_VERSION=$(node --version)
log_info "Node.js version: $NODE_VERSION"

# Check if build directory exists
if [ -d ".next" ]; then
    log_warning ".next directory already exists (old build)"
    read -p "Continue and overwrite? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Deployment cancelled"
        exit 1
    fi
fi

# Step 2: Build process
echo ""
echo "=== Step 2: Build Process ==="

log_info "Running npm install..."
npm ci --silent || npm install --silent
log_success "Dependencies installed"

log_info "Building Next.js application..."
npm run build
log_success "Build completed"

# Step 3: Verify build
echo ""
echo "=== Step 3: Build Verification ==="

log_info "Running build verification..."
./verify-build.sh
if [ $? -eq 0 ]; then
    log_success "Build verification passed"
else
    log_error "Build verification failed"
    exit 1
fi

# Step 4: Backup current deployment
echo ""
echo "=== Step 4: Backup Current Deployment ==="

mkdir -p "$BACKUP_DIR"

# Find current server PID
CURRENT_PID=$(sudo lsof -ti:$PORT 2>/dev/null || echo "")
if [ -n "$CURRENT_PID" ]; then
    log_info "Current server PID: $CURRENT_PID"
    # Backup the running server files
    if [ -d "$SERVER_DIR" ]; then
        BACKUP_FILE="${BACKUP_DIR}/standalone-backup-${TIMESTAMP}.tar.gz"
        tar -czf "$BACKUP_FILE" -C "$SERVER_DIR" .
        log_success "Server files backed up to: $BACKUP_FILE"
    fi
else
    log_warning "No server currently running on port $PORT"
fi

# Step 5: Stop current server
echo ""
echo "=== Step 5: Stop Current Server ==="

if [ -n "$CURRENT_PID" ]; then
    log_info "Stopping server (PID: $CURRENT_PID)..."
    sudo kill -9 "$CURRENT_PID" 2>/dev/null || true
    sleep 3
    
    # Verify server stopped
    if sudo lsof -ti:$PORT >/dev/null 2>&1; then
        log_error "Server still running on port $PORT"
        exit 1
    else
        log_success "Server stopped successfully"
    fi
fi

# Step 6: Copy static files to standalone
echo ""
echo "=== Step 6: Prepare Standalone Directory ==="

log_info "Copying static files to standalone directory..."
mkdir -p "$SERVER_DIR/.next/static"
cp -r .next/static/* "$SERVER_DIR/.next/static/" 2>/dev/null || true

# Verify copy
if [ -f "$SERVER_DIR/.next/static/css/"*.css ]; then
    log_success "CSS files copied to standalone"
else
    log_warning "No CSS files found in standalone (might be OK)"
fi

# Step 7: Start new server
echo ""
echo "=== Step 7: Start New Server ==="

log_info "Starting server on port $PORT..."
cd "$SERVER_DIR"
nohup node server.js --port "$PORT" > /tmp/next-server-${TIMESTAMP}.log 2>&1 &
NEW_PID=$!

sleep 5

# Verify server started
if sudo lsof -ti:$PORT >/dev/null 2>&1; then
    log_success "Server started successfully (PID: $NEW_PID)"
    log_info "Log file: /tmp/next-server-${TIMESTAMP}.log"
else
    log_error "Server failed to start"
    echo "Last 20 lines of log:"
    tail -20 /tmp/next-server-${TIMESTAMP}.log
    exit 1
fi

# Step 8: Health check
echo ""
echo "=== Step 8: Health Check ==="

log_info "Running health checks..."
cd - >/dev/null
./health-check-static.sh
if [ $? -eq 0 ]; then
    log_success "Health check passed"
else
    log_error "Health check failed"
    log_warning "Attempting rollback..."
    
    # Rollback: stop new server, restart old if backed up
    sudo kill -9 "$NEW_PID" 2>/dev/null || true
    if [ -n "$CURRENT_PID" ] && [ -f "$BACKUP_FILE" ]; then
        log_info "Restoring from backup..."
        rm -rf "$SERVER_DIR"/*
        tar -xzf "$BACKUP_FILE" -C "$SERVER_DIR"
        cd "$SERVER_DIR"
        nohup node server.js --port "$PORT" > /tmp/next-server-rollback.log 2>&1 &
        log_warning "Rolled back to previous version"
    fi
    exit 1
fi

# Step 9: Final verification
echo ""
echo "=== Step 9: Final Verification ==="

log_info "Checking nginx routing..."
if curl -s -o /dev/null -w "%{http_code}" https://kviz.michaljanda.com/admin | grep -q "200"; then
    log_success "Production site accessible (200 OK)"
else
    log_error "Production site not accessible"
    exit 1
fi

# Step 10: Cleanup and summary
echo ""
echo "=== Step 10: Deployment Summary ==="

log_success "Deployment completed successfully!"
echo ""
echo "Summary:"
echo "  - New server PID: $NEW_PID"
echo "  - Port: $PORT"
echo "  - Build timestamp: $TIMESTAMP"
echo "  - Backup: ${BACKUP_FILE:-No backup created}"
echo "  - Log file: /tmp/next-server-${TIMESTAMP}.log"
echo ""
echo "Next steps:"
echo "  1. Monitor logs: tail -f /tmp/next-server-${TIMESTAMP}.log"
echo "  2. Check error logs: sudo tail -f /var/log/nginx/error.log"
echo "  3. Verify user functionality in browser"
echo ""
echo "End time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Deployment completed in: $SECONDS seconds"

exit 0