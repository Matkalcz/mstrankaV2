#!/bin/bash
# CI/CD deployment script for kviz.michaljanda.com
# Designed to run on remote server via SSH from GitHub Actions
# Usage: ./deploy-ci.sh [environment]
#   environment: staging | production (default: production)

set -e

# Configuration
ENVIRONMENT="${1:-production}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Environment-specific settings
case "$ENVIRONMENT" in
    staging)
        PORT=3003
        SERVICE_NAME="kviz-staging"
        DEPLOY_DIR="/var/www/kviz-staging"
        BACKUP_DIR="/var/www/backups/kviz-staging"
        ;;
    production)
        PORT=3002
        SERVICE_NAME="kviz"
        DEPLOY_DIR="/var/www/kviz"
        BACKUP_DIR="/var/www/backups/kviz"
        ;;
    *)
        echo "❌ Unknown environment: $ENVIRONMENT"
        echo "Usage: $0 [staging|production]"
        exit 1
        ;;
esac

echo "=== Deploying to $ENVIRONMENT ==="
echo "Timestamp: $TIMESTAMP"
echo "Port: $PORT"
echo "Deploy dir: $DEPLOY_DIR"
echo "Backup dir: $BACKUP_DIR"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Functions
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_info() { echo -e "ℹ️  $1"; }

# Step 1: Pre-deployment checks
echo "=== Step 1: Pre-deployment Checks ==="

if [ ! -d "$DEPLOY_DIR" ]; then
    log_warning "Deploy directory doesn't exist: $DEPLOY_DIR"
    log_info "Creating directory..."
    sudo mkdir -p "$DEPLOY_DIR"
    sudo chown -R $USER:$USER "$DEPLOY_DIR"
fi

if [ ! -d "$BACKUP_DIR" ]; then
    log_info "Creating backup directory..."
    sudo mkdir -p "$BACKUP_DIR"
    sudo chown -R $USER:$USER "$BACKUP_DIR"
fi

# Check if we're in the right directory (should be project root)
if [ ! -f "package.json" ]; then
    log_error "Not in project root (package.json not found)"
    exit 1
fi

# Step 2: Backup current deployment
echo ""
echo "=== Step 2: Backup Current Deployment ==="

if [ -d "$DEPLOY_DIR/.next" ]; then
    log_info "Creating backup of current deployment..."
    BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.tar.gz"
    tar -czf "$BACKUP_FILE" -C "$DEPLOY_DIR" .
    log_success "Backup created: $BACKUP_FILE"
else
    log_warning "No existing deployment to backup"
fi

# Step 3: Stop current service
echo ""
echo "=== Step 3: Stop Current Service ==="

# Check if service is running
if sudo systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
    log_info "Stopping service: $SERVICE_NAME..."
    sudo systemctl stop "$SERVICE_NAME"
    sleep 3
    
    if sudo systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
        log_error "Failed to stop service"
        exit 1
    else
        log_success "Service stopped"
    fi
else
    log_warning "Service $SERVICE_NAME not running (or not a systemd service)"
    
    # Fallback: check if process is running on port
    if lsof -ti:$PORT >/dev/null 2>&1; then
        log_info "Found process on port $PORT, stopping..."
        sudo kill -9 $(lsof -ti:$PORT)
        sleep 2
        log_success "Process stopped"
    fi
fi

# Step 4: Deploy new files
echo ""
echo "=== Step 4: Deploy New Files ==="

log_info "Cleaning deploy directory..."
rm -rf "$DEPLOY_DIR"/*

log_info "Copying files..."
cp -r ./* "$DEPLOY_DIR/" 2>/dev/null || true
cp -r .[!.]* "$DEPLOY_DIR/" 2>/dev/null || true

# Ensure proper permissions
sudo chown -R $USER:$USER "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"

log_success "Files copied to $DEPLOY_DIR"

# Step 5: Install dependencies and build
echo ""
echo "=== Step 5: Install Dependencies ==="

cd "$DEPLOY_DIR"

log_info "Installing dependencies..."
npm ci --only=production --silent
log_success "Dependencies installed"

# Step 6: Build application
echo ""
echo "=== Step 6: Build Application ==="

log_info "Building Next.js application..."
npm run build
log_success "Build completed"

# Step 7: Verify build
echo ""
echo "=== Step 7: Verify Build ==="

if [ -f "scripts/verify-build.sh" ]; then
    log_info "Running build verification..."
    ./scripts/verify-build.sh
    log_success "Build verification passed"
else
    log_warning "No verify-build.sh script found, skipping verification"
fi

# Step 8: Start service
echo ""
echo "=== Step 8: Start Service ==="

# Try systemd service first
if [ -f "/etc/systemd/system/$SERVICE_NAME.service" ]; then
    log_info "Starting systemd service: $SERVICE_NAME..."
    sudo systemctl daemon-reload
    sudo systemctl start "$SERVICE_NAME"
    sudo systemctl enable "$SERVICE_NAME" 2>/dev/null || true
    
    sleep 3
    
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        log_success "Service started via systemd"
    else
        log_error "Failed to start systemd service"
        exit 1
    fi
else
    log_warning "No systemd service found, starting manually..."
    
    # Create a simple systemd service if it doesn't exist
    SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
    if [ ! -f "$SERVICE_FILE" ] && [ "$EUID" -eq 0 ]; then
        log_info "Creating systemd service..."
        cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Kviz $ENVIRONMENT - Next.js Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$DEPLOY_DIR
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
        sudo systemctl daemon-reload
        sudo systemctl start "$SERVICE_NAME"
        sudo systemctl enable "$SERVICE_NAME"
        log_success "Service created and started"
    elif [ ! -f "$SERVICE_FILE" ]; then
        log_warning "Cannot create systemd service (not root), starting with npm..."
        cd "$DEPLOY_DIR"
        nohup npm start > /tmp/$SERVICE_NAME-$TIMESTAMP.log 2>&1 &
        PID=$!
        log_info "Started with PID: $PID"
        log_info "Log file: /tmp/$SERVICE_NAME-$TIMESTAMP.log"
    fi
fi

# Step 9: Health check
echo ""
echo "=== Step 9: Health Check ==="

sleep 5  # Give server time to start

log_info "Checking service status..."
if lsof -ti:$PORT >/dev/null 2>&1; then
    log_success "Service is listening on port $PORT"
else
    log_error "Service not listening on port $PORT"
    
    # Check logs
    if [ -f "/tmp/$SERVICE_NAME-$TIMESTAMP.log" ]; then
        echo "Last 10 lines of log:"
        tail -10 "/tmp/$SERVICE_NAME-$TIMESTAMP.log"
    fi
    
    exit 1
fi

# If health check script exists, run it
if [ -f "$DEPLOY_DIR/scripts/health-check.sh" ]; then
    log_info "Running health check..."
    cd "$DEPLOY_DIR"
    ./scripts/health-check.sh
    log_success "Health check passed"
fi

# Step 10: Cleanup and summary
echo ""
echo "=== Step 10: Deployment Summary ==="

log_success "✅ Deployment to $ENVIRONMENT completed successfully!"
echo ""
echo "Summary:"
echo "  - Environment: $ENVIRONMENT"
echo "  - Port: $PORT"
echo "  - Directory: $DEPLOY_DIR"
echo "  - Backup: $BACKUP_FILE"
echo "  - Timestamp: $TIMESTAMP"
echo ""
echo "Next steps:"
echo "  1. Monitor logs: sudo journalctl -u $SERVICE_NAME -f"
echo "  2. Check website: https://kviz.michaljanda.com"
echo "  3. Verify functionality"
echo ""
echo "Rollback command:"
echo "  sudo tar -xzf $BACKUP_FILE -C $DEPLOY_DIR"
echo "  sudo systemctl restart $SERVICE_NAME"

exit 0