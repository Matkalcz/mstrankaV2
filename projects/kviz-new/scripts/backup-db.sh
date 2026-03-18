#!/bin/bash
# Database backup script for kviz-new
# Usage: ./scripts/backup-db.sh [daily|weekly|monthly]

set -e

BACKUP_TYPE="${1:-daily}"
BACKUP_DIR="/home/openclaw/.openclaw/workspace-domminik/kviz-new/backups"
DB_PATH="/home/openclaw/.openclaw/workspace-domminik/kviz-new/data/kviz.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/kviz-${BACKUP_TYPE}-${TIMESTAMP}.db"

echo "💾 Starting database backup..."
echo "Type: $BACKUP_TYPE"
echo "Database: $DB_PATH"
echo "Backup to: $BACKUP_FILE"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ ERROR: Database file not found at $DB_PATH"
    exit 1
fi

# Get database info before backup
echo "📊 Database information:"
DB_SIZE=$(du -h "$DB_PATH" | cut -f1)
echo "  Size: $DB_SIZE"

QUESTION_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM questions;" 2>/dev/null || echo "0")
CATEGORY_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM categories;" 2>/dev/null || echo "0")
QUIZ_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM quizzes;" 2>/dev/null || echo "0")

echo "  Questions: $QUESTION_COUNT"
echo "  Categories: $CATEGORY_COUNT"
echo "  Quizzes: $QUIZ_COUNT"
echo ""

# Create backup
echo "🔧 Creating backup..."
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup created successfully!"
    echo "  Backup size: $BACKUP_SIZE"
    echo "  Backup file: $BACKUP_FILE"
    
    # Verify backup
    echo ""
    echo "🔍 Verifying backup..."
    BACKUP_QUESTION_COUNT=$(sqlite3 "$BACKUP_FILE" "SELECT COUNT(*) FROM questions;" 2>/dev/null || echo "0")
    
    if [ "$QUESTION_COUNT" = "$BACKUP_QUESTION_COUNT" ]; then
        echo "✅ Backup verification passed"
        echo "  Original questions: $QUESTION_COUNT"
        echo "  Backup questions: $BACKUP_QUESTION_COUNT"
    else
        echo "⚠️  Backup verification warning"
        echo "  Original questions: $QUESTION_COUNT"
        echo "  Backup questions: $BACKUP_QUESTION_COUNT"
    fi
else
    echo "❌ Backup failed!"
    exit 1
fi

# Cleanup old backups
echo ""
echo "🧹 Cleaning up old backups..."

case $BACKUP_TYPE in
    daily)
        # Keep 7 daily backups
        find "$BACKUP_DIR" -name "kviz-daily-*.db" -type f -mtime +7 -delete
        echo "  Kept: Last 7 days of daily backups"
        ;;
    weekly)
        # Keep 4 weekly backups
        find "$BACKUP_DIR" -name "kviz-weekly-*.db" -type f -mtime +28 -delete
        echo "  Kept: Last 4 weeks of weekly backups"
        ;;
    monthly)
        # Keep 12 monthly backups
        find "$BACKUP_DIR" -name "kviz-monthly-*.db" -type f -mtime +365 -delete
        echo "  Kept: Last 12 months of monthly backups"
        ;;
    *)
        # Keep all backups for custom types
        echo "  Keeping all backups (custom type: $BACKUP_TYPE)"
        ;;
esac

# List current backups
echo ""
echo "📋 Current backups in $BACKUP_DIR:"
ls -lh "$BACKUP_DIR"/kviz-*.db 2>/dev/null | while read line; do
    echo "  $line"
done || echo "  No backups found"

# Create restore instructions
echo ""
echo "📖 Restore instructions:"
echo "------------------------"
echo "To restore from backup:"
echo "1. Stop the application:"
echo "   pkill -f 'api-final-port'"
echo ""
echo "2. Backup current database:"
echo "   cp data/kviz.db data/kviz.db.backup.\$(date +%Y%m%d)"
echo ""
echo "3. Restore from backup:"
echo "   cp '$BACKUP_FILE' data/kviz.db"
echo ""
echo "4. Restart application:"
echo "   node /tmp/api-final-port.js > /tmp/api.log 2>&1 &"
echo ""
echo "5. Verify restore:"
echo "   curl http://localhost:3004/api/questions | jq length"

# Add to cron (if needed)
echo ""
echo "⏰ Cron setup (optional):"
echo "-----------------------"
echo "Add to crontab for automatic backups:"
echo ""
echo "# Daily backup at 2 AM"
echo "0 2 * * * cd /home/openclaw/.openclaw/workspace-domminik/kviz-new && ./scripts/backup-db.sh daily >> logs/backup.log 2>&1"
echo ""
echo "# Weekly backup on Sunday at 3 AM"
echo "0 3 * * 0 cd /home/openclaw/.openclaw/workspace-domminik/kviz-new && ./scripts/backup-db.sh weekly >> logs/backup.log 2>&1"
echo ""
echo "# Monthly backup on 1st at 4 AM"
echo "0 4 1 * * cd /home/openclaw/.openclaw/workspace-domminik/kviz-new && ./scripts/backup-db.sh monthly >> logs/backup.log 2>&1"

echo ""
echo "🎉 Backup completed successfully!"
echo "Backup saved to: $BACKUP_FILE"
echo "Time: $(date)"