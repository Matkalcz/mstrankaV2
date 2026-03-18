#!/bin/bash
# Rollback script for kviz.michaljanda.com
# Restores from latest backup if deployment fails

set -e

echo "=== Rollback Procedure ==="
echo "Start time: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Configuration
PORT=3002
BACKUP_DIR="/home/openclaw/.openclaw/workspace-domminik/kviz-new/.next/standalone/backup"
SERVER_DIR="/home/openclaw/.openclaw/workspace-domminik/kviz-new/.next/standalone"

# Check if backups exist
echo "1. Checking for backups..."
if [ ! -d "$BACKUP_DIR" ]; then
    echo "   ❌ Backup directory not found: $BACKUP_DIR"
    echo "   Cannot rollback - no backups available"
    exit 1
fi

# Find latest backup
LATEST_BACKUP=$(ls -td "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -1)
if [ -z "$LATEST_BACKUP" ]; then
    echo "   ❌ No backup files found in $BACKUP_DIR"
    echo "   Cannot rollback"
    exit 1
fi

BACKUP_NAME=$(basename "$LATEST_BACKUP")
BACKUP_TIME=$(echo "$BACKUP_NAME" | sed 's/standalone-backup-//' | sed 's/.tar.gz//')
echo "   ✅ Latest backup: $BACKUP_NAME"
echo "   Created: $BACKUP_TIME"
echo ""

# Stop current server
echo "2. Stopping current server..."
CURRENT_PID=$(sudo lsof -ti:$PORT 2>/dev/null || echo "")
if [ -n "$CURRENT_PID" ]; then
    echo "   Current server PID: $CURRENT_PID"
    sudo kill -9 "$CURRENT_PID" 2>/dev/null || true
    sleep 3
    echo "   ✅ Server stopped"
else
    echo "   ⚠️ No server running on port $PORT"
fi
echo ""

# Restore from backup
echo "3. Restoring from backup..."
echo "   Backup file: $LATEST_BACKUP"
echo "   Target: $SERVER_DIR"

# Create temporary restore location
TEMP_RESTORE="/tmp/kviz-restore-$(date +%s)"
mkdir -p "$TEMP_RESTORE"

echo "   Extracting backup..."
tar -xzf "$LATEST_BACKUP" -C "$TEMP_RESTORE"

# Verify extraction
if [ -f "$TEMP_RESTORE/server.js" ]; then
    echo "   ✅ Backup extracted successfully"
else
    echo "   ❌ Backup extraction failed - no server.js found"
    rm -rf "$TEMP_RESTORE"
    exit 1
fi

# Backup current files (just in case)
echo "4. Backing up current files..."
CURRENT_BACKUP="$BACKUP_DIR/rollback-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
if [ -d "$SERVER_DIR" ]; then
    tar -czf "$CURRENT_BACKUP" -C "$SERVER_DIR" . 2>/dev/null || true
    echo "   Current state saved to: $(basename "$CURRENT_BACKUP")"
fi

# Replace with backup
echo "5. Replacing with backup..."
rm -rf "$SERVER_DIR"/*
cp -r "$TEMP_RESTORE"/* "$SERVER_DIR"/
rm -rf "$TEMP_RESTORE"

echo "   ✅ Files restored from backup"
echo ""

# Start restored server
echo "6. Starting restored server..."
cd "$SERVER_DIR"
nohup node server.js --port $PORT > /tmp/kviz-rollback-$(date +%s).log 2>&1 &
RESTORED_PID=$!

sleep 5

# Verify server started
echo "7. Verifying restored server..."
if curl -s http://localhost:$PORT/admin >/dev/null 2>&1; then
    echo "   ✅ Restored server running (PID: $RESTORED_PID)"
else
    echo "   ❌ Restored server failed to start"
    echo "   Check logs: tail -f /tmp/kviz-rollback-*.log"
    exit 1
fi

# Health check
echo "8. Running health check..."
cd - >/dev/null
if ./health-check-static.sh 2>/dev/null | grep -q "✅ All static files are accessible"; then
    echo "   ✅ Health check passed"
else
    echo "   ⚠️ Health check had warnings (check manually)"
fi
echo ""

echo "=== Rollback Complete ==="
echo "✅ Successfully rolled back to backup from $BACKUP_TIME"
echo "Server PID: $RESTORED_PID"
echo "Port: $PORT"
echo "Log file: /tmp/kviz-rollback-*.log"
echo ""
echo "Next steps:"
echo "1. Verify functionality: https://kviz.michaljanda.com/admin"
echo "2. Monitor logs: tail -f /tmp/kviz-rollback-*.log"
echo "3. Investigate why deployment failed"
echo "4. Fix issues and attempt deployment again"
echo ""
echo "To restore to newer version (if available):"
echo "  ./deploy.sh  # Will use latest build"

exit 0