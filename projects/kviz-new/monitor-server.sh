#!/bin/bash

# Monitoring script for kviz-nextjs server
SERVER_URL="https://kviz.michaljanda.com"
LOG_FILE="/home/openclaw/.openclaw/workspace-domminik/kviz-new/server-monitor.log"
MAX_RETRIES=3
RETRY_DELAY=5

# Function to check server status
check_server() {
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$SERVER_URL" --max-time 10)
    
    if [ "$response_code" -eq 200 ] || [ "$response_code" -eq 302 ]; then
        echo "$(date): Server is UP (HTTP $response_code)" >> "$LOG_FILE"
        return 0
    else
        echo "$(date): Server is DOWN (HTTP $response_code)" >> "$LOG_FILE"
        return 1
    fi
}

# Function to restart server
restart_server() {
    echo "$(date): Attempting to restart server..." >> "$LOG_FILE"
    
    # Check if pm2 process exists
    if pm2 list | grep -q "kviz-nextjs"; then
        echo "$(date): Restarting kviz-nextjs via pm2..." >> "$LOG_FILE"
        pm2 restart kviz-nextjs
    else
        echo "$(date): Starting kviz-nextjs via pm2..." >> "$LOG_FILE"
        cd /home/openclaw/.openclaw/workspace-domminik/kviz-new
        pm2 start "npx next start -p 3002 --hostname 0.0.0.0" --name kviz-nextjs
    fi
    
    sleep 10  # Wait for server to start
}

# Main monitoring logic
check_server
if [ $? -ne 0 ]; then
    echo "$(date): Server check failed, attempting restart..." >> "$LOG_FILE"
    
    for i in $(seq 1 $MAX_RETRIES); do
        restart_server
        
        if check_server; then
            echo "$(date): Server restarted successfully on attempt $i" >> "$LOG_FILE"
            exit 0
        fi
        
        if [ $i -lt $MAX_RETRIES ]; then
            echo "$(date): Retry $i failed, waiting $RETRY_DELAY seconds..." >> "$LOG_FILE"
            sleep $RETRY_DELAY
        fi
    done
    
    echo "$(date): ERROR: Failed to restart server after $MAX_RETRIES attempts" >> "$LOG_FILE"
    # Send alert (could be extended to send email/notification)
    exit 1
fi

exit 0