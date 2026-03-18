# Deployment Checklist - kviz.michaljanda.com

Tento dokument popisuje proces deploymentu a řešení problémů pro Next.js aplikaci kvízu.

## Identifikované problémy a řešení

### 🚨 **Hlavní problém: CSS/Static files 404 errors**
- **Příčina**: Next.js standalone build nekopíruje automaticky statické soubory
- **Řešení**: Manuální kopírování `.next/static/` do `.next/standalone/.next/static/`
- **Script**: `deploy.sh` automatizuje tento proces

### ⚠️ **Sekundární problémy:**
1. Nginx konfigurace - chybějící středník v `add_header Clear-Site-Data`
2. Next.js server crash - potřebuje správný restart process
3. Monitoring - chybějící health checks a error tracking

## Deployment Scripts

### 1. **deploy.sh** - Kompletní deployment
```bash
./deploy.sh
```
- Build aplikace
- Kopíruje statické soubory
- Restartuje server
- Spouští health check

### 2. **health-check.sh** - Ověření deploymentu
```bash
./health-check.sh
```
- Kontroluje admin page
- Ověřuje CSS loading
- Kontroluje Next.js server
- Verifikuje build artifacts

### 3. **verify-build.sh** - Ověření buildu
```bash
./verify-build.sh
```
- Kontroluje build artifacts
- Verifikuje CSS soubory
- Kontroluje standalone directory

### 4. **monitor-404.sh** - Monitoring chyb
```bash
./monitor-404.sh
```
- Kontroluje nginx 404 errors
- Monitoruje static file errors
- Kontroluje nginx error log

## Krok za krokem deployment

### Před deploymentem:
1. **Zkontrolovat aktuální stav**: `./health-check.sh`
2. **Zkontrolovat build**: `./verify-build.sh`
3. **Zkontrolovat chyby**: `./monitor-404.sh`

### Deployment:
1. **Spustit deployment**: `./deploy.sh`
2. **Počkat na dokončení** (cca 1-2 minuty)
3. **Ověřit výsledek**: `./health-check.sh`

### Po deploymentu:
1. **Testovat aplikaci**: https://kviz.michaljanda.com/admin
2. **Monitorovat chyby**: `./monitor-404.sh`
3. **Kontrolovat logy**: `sudo tail -f /var/log/nginx/error.log`

## Řešení problémů

### Problém: 502 Bad Gateway
```bash
# 1. Zkontrolovat jestli server běží
ps aux | grep "node server.js"

# 2. Pokud ne, restartovat
pkill -f "node server.js"
cd /home/openclaw/.openclaw/workspace-domminik/kviz-new/.next/standalone
PORT=3002 node server.js > /tmp/nextjs.log 2>&1 &

# 3. Nebo použít deploy.sh
./deploy.sh
```

### Problém: CSS 404 errors
```bash
# 1. Zkontrolovat build
./verify-build.sh

# 2. Zkontrolovat standalone directory
ls -la .next/standalone/.next/static/css/

# 3. Pokud chybí, zkopírovat manuálně
mkdir -p .next/standalone/.next/static/css/
cp .next/static/css/* .next/standalone/.next/static/css/

# 4. Restartovat server
./deploy.sh
```

### Problém: Nginx konfigurace
```bash
# 1. Zkontrolovat syntax
sudo nginx -t

# 2. Pokud OK, reload
sudo systemctl reload nginx

# 3. Pokud chyba, opravit konfiguraci
sudo nano /etc/nginx/sites-available/kviz.michaljanda.com
```

## Nginx Konfigurace (důležité části)

```nginx
# Static assets - cache with hash in filename
location ~* ^/_next/static/(css|js|media)/ {
    proxy_pass http://127.0.0.1:3002;
    # ... proxy headers ...
    
    # Cache static assets for 1 year (immutable)
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
}

# Admin pages - no cache  
location ~ ^/admin {
    proxy_pass http://127.0.0.1:3002;
    # ... proxy headers ...
    
    # No cache for admin pages
    expires 0;
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
    add_header Pragma "no-cache";
    add_header Clear-Site-Data '"cache"';  # POZOR: středník na konci!
}
```

## Monitoring a Logging

### Nginx logy:
- Access log: `/var/log/nginx/access.log`
- Error log: `/var/log/nginx/error.log`

### Next.js logy:
- Aktuální session: `/tmp/nextjs-*.log`
- Historické: `/tmp/nextjs-$(date +%Y%m%d-%H%M%S).log`

### Příkazy pro monitoring:
```bash
# Sledovat nginx errors
sudo tail -f /var/log/nginx/error.log

# Sledovat 404 errors
sudo tail -f /var/log/nginx/access.log | grep '" 404 '

# Sledovat Next.js logy
tail -f /tmp/nextjs-*.log
```

## Automatizace (cron jobs)

### Denní health check:
```bash
# V /etc/cron.d/kviz-health
0 8 * * * openclaw cd /home/openclaw/.openclaw/workspace-domminik/kviz-new && ./health-check.sh >> /var/log/kviz-health.log 2>&1
```

### Monitorování 404 errors:
```bash
# Každou hodinu
0 * * * * openclaw cd /home/openclaw/.openclaw/workspace-domminik/kviz-new && ./monitor-404.sh >> /var/log/kviz-monitor.log 2>&1
```

## Bezpečnostní doporučení

1. **Firewall**: Povolit pouze porty 80, 443
2. **Fail2ban**: Nainstalovat pro ochranu proti bruteforce
3. **Automatické updaty**: `sudo apt update && sudo apt upgrade -y`
4. **Backup**: Pravidelné zálohování aplikace a databáze
5. **Monitoring**: Uptime monitoring (UptimeRobot, etc.)

## Kontakty

- **Problémy s deploymentem**: Domminik (AI assistant)
- **Server admin**: Martin Kalian (Mates)
- **URL**: https://kviz.michaljanda.com

---

**Poslední aktualizace**: 2026-03-08  
**Stav**: Stabilní deployment s automatizovanými skripty  
**Další kroky**: Implementovat CI/CD pipeline (medium priority issue)