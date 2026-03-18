#!/bin/bash
# Health check script for kviz-new project
# Usage: ./scripts/health-check.sh

set -e

echo "🩺 Health Check - kviz-new"
echo "=========================="
echo "Time: $(date)"
echo ""

# 1. Check system
echo "1. 📊 System Status"
echo "------------------"
echo "Uptime: $(uptime -p)"
echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo ""

# 2. Check running processes
echo "2. 🔄 Running Processes"
echo "----------------------"
echo "API Server:"
ps aux | grep "api-final-port" | grep -v grep || echo "  ❌ Not running"
echo ""
echo "Node/Next.js:"
ps aux | grep -E "(node|next)" | grep -v grep | grep -v "api-final-port" || echo "  ⚠️  No Node processes"
echo ""
echo "Nginx:"
sudo systemctl status nginx --no-pager | head -5 || echo "  ❌ Nginx not running"
echo ""

# 3. Check ports
echo "3. 🔌 Port Check"
echo "---------------"
echo "Port 3004 (API):"
sudo netstat -tlnp | grep ":3004" || echo "  ❌ Port 3004 not listening"
echo ""
echo "Port 80/443 (Nginx):"
sudo netstat -tlnp | grep -E ":80|:443" || echo "  ⚠️  HTTP/HTTPS ports not found"
echo ""

# 4. Check API
echo "4. 🌐 API Test"
echo "-------------"
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/api/questions || echo "FAIL")
if [ "$API_RESPONSE" = "200" ]; then
    echo "  ✅ API responding (HTTP 200)"
    # Test data
    curl -s http://localhost:3004/api/questions | jq -r '"[API] Questions: \(length), First category: \(.[0].category_name)"' 2>/dev/null || echo "  ⚠️  Could not parse API response"
else
    echo "  ❌ API not responding (HTTP $API_RESPONSE)"
fi
echo ""

# 5. Check database
echo "5. 🗄️ Database Check"
echo "------------------"
if [ -f "data/kviz.db" ]; then
    echo "  ✅ Database file exists ($(du -h data/kviz.db | cut -f1))"
    
    # Count records
    QUESTIONS_COUNT=$(sqlite3 data/kviz.db "SELECT COUNT(*) FROM questions;" 2>/dev/null || echo "0")
    CATEGORIES_COUNT=$(sqlite3 data/kviz.db "SELECT COUNT(*) FROM categories;" 2>/dev/null || echo "0")
    
    echo "  📊 Questions: $QUESTIONS_COUNT"
    echo "  📊 Categories: $CATEGORIES_COUNT"
    
    # Test query
    if [ "$QUESTIONS_COUNT" -gt 0 ]; then
        FIRST_CAT=$(sqlite3 data/kviz.db "SELECT name FROM categories LIMIT 1;" 2>/dev/null || echo "Unknown")
        echo "  📍 First category: $FIRST_CAT"
    fi
else
    echo "  ❌ Database file not found"
fi
echo ""

# 6. Check website
echo "6. 🌍 Website Check"
echo "------------------"
WEB_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://kviz.michaljanda.com || echo "FAIL")
if [ "$WEB_RESPONSE" = "200" ]; then
    echo "  ✅ Website responding (HTTP 200)"
    
    # Check admin page
    ADMIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://kviz.michaljanda.com/admin || echo "FAIL")
    if [ "$ADMIN_RESPONSE" = "200" ]; then
        echo "  ✅ Admin page accessible"
    else
        echo "  ⚠️  Admin page: HTTP $ADMIN_RESPONSE"
    fi
else
    echo "  ❌ Website not responding (HTTP $WEB_RESPONSE)"
fi
echo ""

# 7. Check disk space
echo "7. 💾 Disk Space"
echo "---------------"
df -h /home /var/www | grep -v "Filesystem" | while read line; do
    echo "  $line"
done
echo ""

# 8. Check logs
echo "8. 📝 Recent Logs"
echo "----------------"
echo "API log (last 5 lines):"
tail -5 /tmp/api.log 2>/dev/null || echo "  No API log found"
echo ""
echo "Nginx error log (last 3 lines):"
sudo tail -3 /var/log/nginx/error.log 2>/dev/null || echo "  No nginx error log"
echo ""

# 9. Git status
echo "9. 📦 Git Status"
echo "---------------"
git status --short 2>/dev/null || echo "  Not a git repository"
echo ""

# 10. Build status
echo "10. 🔨 Build Status"
echo "------------------"
if [ -d ".next" ]; then
    BUILD_TIME=$(stat -c %y .next/BUILD_ID 2>/dev/null | cut -d' ' -f1) || BUILD_TIME="Unknown"
    echo "  ✅ Build exists (created: $BUILD_TIME)"
    
    # Check BUILD_ID
    if [ -f ".next/BUILD_ID" ]; then
        BUILD_ID=$(cat .next/BUILD_ID 2>/dev/null || echo "Unknown")
        echo "  📋 Build ID: $BUILD_ID"
    fi
else
    echo "  ⚠️  No .next directory - project not built?"
fi

echo ""
echo "=========================="
echo "✅ Health check completed"
echo ""

# Summary
echo "📋 SUMMARY"
echo "----------"
if [ "$API_RESPONSE" = "200" ] && [ "$WEB_RESPONSE" = "200" ] && [ -f "data/kviz.db" ]; then
    echo "🎉 All systems operational!"
    exit 0
else
    echo "⚠️  Some issues detected"
    echo ""
    echo "Issues:"
    [ "$API_RESPONSE" != "200" ] && echo "  ❌ API not responding"
    [ "$WEB_RESPONSE" != "200" ] && echo "  ❌ Website not responding"
    [ ! -f "data/kviz.db" ] && echo "  ❌ Database missing"
    exit 1
fi