#!/bin/bash
# Rychlý deploy script pro kviz-new

set -e

echo "🚀 Spouštím deploy..."

# 1. Git pull
echo "📦 Stahuji změny z Gitu..."
git pull origin main-new

# 2. Install dependencies
echo "📦 Instaluji závislosti..."
npm ci

# 3. Build
echo "🔨 Buildím projekt..."
npm run build

# 4. Restart API server (pokud běží)
echo "🔄 Restartuji API server..."
pkill -f "api-final-port" || true
sleep 1
node /tmp/api-final-port.js > /tmp/api-deploy.log 2>&1 &

# 5. Zkontrolovat
echo "✅ Hotovo!"
echo "📊 Stav:"
ps aux | grep -E "(node.*3004|next)" | grep -v grep
curl -s http://localhost:3004/api/questions | jq '.[0].category_name' 2>/dev/null || echo "API test"
