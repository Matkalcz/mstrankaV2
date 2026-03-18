#!/bin/bash
# Monitor 404 errors in nginx logs for kviz.michaljanda.com
# Usage: ./monitor-404.sh [--follow] [--hours N]

set -e

# Configuration
LOG_FILE="/var/log/nginx/access.log"
ERROR_LOG="/var/log/nginx/error.log"
SITE="kviz.michaljanda.com"
HOURS=24
FOLLOW=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --follow|-f)
            FOLLOW=true
            shift
            ;;
        --hours|-h)
            HOURS="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--follow] [--hours N]"
            exit 1
            ;;
    esac
done

echo "=== 404 Error Monitor for $SITE ==="
echo "Start time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Monitoring last $HOURS hours"
echo ""

# Function to analyze logs
analyze_logs() {
    echo "📊 Analysis of 404 errors in last $HOURS hours:"
    echo ""
    
    # Get 404 errors
    echo "🔴 Top 404 errors:"
    sudo grep "$SITE" "$LOG_FILE" 2>/dev/null | grep "404" | awk '{print $7}' | sort | uniq -c | sort -rn | head -10 | while read count url; do
        echo "  $count× $url"
    done
    
    echo ""
    
    # Get 404 by referrer
    echo "🔗 Top referrers for 404 errors:"
    sudo grep "$SITE" "$LOG_FILE" 2>/dev/null | grep "404" | awk -F'"' '{print $4}' | sort | uniq -c | sort -rn | head -5 | while read count referrer; do
        if [ -z "$referrer" ]; then
            referrer="(direct)"
        fi
        echo "  $count× $referrer"
    done
    
    echo ""
    
    # Get timing of 404 errors
    echo "⏰ 404 errors by hour:"
    sudo grep "$SITE" "$LOG_FILE" 2>/dev/null | grep "404" | awk '{print $4}' | cut -d: -f2 | sort | uniq -c | while read count hour; do
        printf "  %02d:00 - %02d:59: %3d errors\n" $hour $hour $count
    done
    
    echo ""
    
    # Check for static file 404s specifically
    echo "📁 Static file 404 errors:"
    sudo grep "$SITE" "$LOG_FILE" 2>/dev/null | grep "404" | grep -E "_next/static|next/static|\.(css|js|png|jpg|woff2)" | awk '{print $7}' | sort | uniq -c | sort -rn | head -5 | while read count file; do
        echo "  $count× $file"
    done
    
    echo ""
    
    # Summary counts
    TOTAL_404=$(sudo grep "$SITE" "$LOG_FILE" 2>/dev/null | grep -c "404" || echo "0")
    TOTAL_REQUESTS=$(sudo grep -c "$SITE" "$LOG_FILE" 2>/dev/null || echo "0")
    
    if [ "$TOTAL_REQUESTS" -gt 0 ]; then
        PERCENTAGE=$(echo "scale=2; $TOTAL_404 * 100 / $TOTAL_REQUESTS" | bc)
        echo "📈 Summary:"
        echo "  Total requests: $TOTAL_REQUESTS"
        echo "  404 errors: $TOTAL_404"
        echo "  Error rate: $PERCENTAGE%"
        
        if (( $(echo "$PERCENTAGE > 1.0" | bc -l) )); then
            echo "  ⚠️  High error rate (>1%) - investigation recommended"
        else
            echo "  ✅ Error rate acceptable (<1%)"
        fi
    fi
    
    echo ""
    
    # Check nginx error log
    echo "📋 Recent nginx error log entries:"
    sudo tail -20 "$ERROR_LOG" 2>/dev/null | grep -i "error\|failed" | head -5 || echo "  No recent errors found"
}

# Run initial analysis
analyze_logs

# Follow mode
if [ "$FOLLOW" = true ]; then
    echo "👀 Following logs (Ctrl+C to exit)..."
    echo ""
    
    sudo tail -f "$LOG_FILE" 2>/dev/null | grep --line-buffered "$SITE" | while read line; do
        if echo "$line" | grep -q "404"; then
            TIMESTAMP=$(echo "$line" | awk '{print $4}' | tr -d '[]')
            URL=$(echo "$line" | awk '{print $7}')
            REFERRER=$(echo "$line" | awk -F'"' '{print $4}')
            echo "🚨 404 detected: $URL"
            echo "   Time: $TIMESTAMP"
            echo "   From: ${REFERRER:-(direct)}"
            echo ""
            
            # Alert for critical static files
            if echo "$URL" | grep -q -E "_next/static|\.(css|js)"; then
                echo "   ⚠️  CRITICAL: Static file not found!"
                echo "   💡 Check:"
                echo "      - Build completed successfully?"
                echo "      - Static files copied to server?"
                echo "      - Nginx configuration correct?"
                echo ""
            fi
        fi
    done
else
    echo ""
    echo "To monitor in real-time, run: $0 --follow"
    echo "To check different time range: $0 --hours 48"
fi

exit 0