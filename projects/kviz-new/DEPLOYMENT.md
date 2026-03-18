# Deployment Kviz New na kviz.michaljanda.com

## Přehled
Tento dokument popisuje proces nasazení aplikace Kviz New na produkční server.

## Požadavky
- Server s Ubuntu 20.04+
- Node.js 18+
- Nginx
- Systemd
- Let's Encrypt certifikát pro `kviz.michaljanda.com`

## Struktura deploymentu
```
/var/www/kviz-new/          # Aplikace
├── server.js              # Next.js standalone server
├── .next/                 # Build artifacts
├── public/                # Statické soubory
└── package.json

/etc/nginx/sites-available/kviz-new  # Nginx konfigurace
/etc/systemd/system/kviz-new.service # Systemd služba
```

## Krok 1: Příprava serveru

### 1.1 Instalace závislostí
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Nginx
sudo apt install -y nginx

# Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
```

### 1.2 Vytvoření uživatele a adresářů
```bash
# Vytvořit uživatele pro aplikaci
sudo useradd -r -s /bin/false kviz-user

# Vytvořit deployment adresář
sudo mkdir -p /var/www/kviz-new
sudo chown -R kviz-user:kviz-user /var/www/kviz-new
sudo chmod -R 755 /var/www/kviz-new
```

## Krok 2: Konfigurace

### 2.1 Nginx konfigurace
```bash
# Zkopírovat konfiguraci
sudo cp nginx-kviz-new.conf /etc/nginx/sites-available/kviz-new

# Vytvořit symlink
sudo ln -s /etc/nginx/sites-available/kviz-new /etc/nginx/sites-enabled/

# Testovat konfiguraci
sudo nginx -t

# Restartovat Nginx
sudo systemctl restart nginx
```

### 2.2 SSL certifikát
```bash
# Získat Let's Encrypt certifikát
sudo certbot --nginx -d kviz.michaljanda.com

# Automatické obnovování
sudo certbot renew --dry-run
```

### 2.3 Systemd služba
```bash
# Zkopírovat service file
sudo cp kviz-new.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Povolit službu
sudo systemctl enable kviz-new.service
```

## Krok 3: Deployment aplikace

### 3.1 Build aplikace
```bash
# V development prostředí
npm run build
```

### 3.2 Kopírování na server
```bash
# Metoda 1: SCP
scp -r .next/standalone/* user@server:/var/www/kviz-new/
scp -r .next/static user@server:/var/www/kviz-new/.next/
scp -r public user@server:/var/www/kviz-new/

# Metoda 2: Git (pokud je repo na serveru)
git pull origin main
npm install
npm run build
```

### 3.3 Spuštění služby
```bash
# Nastavit práva
sudo chown -R kviz-user:kviz-user /var/www/kviz-new

# Spustit službu
sudo systemctl start kviz-new.service

# Zkontrolovat status
sudo systemctl status kviz-new.service

# Zobrazit logy
sudo journalctl -u kviz-new.service -f
```

## Krok 4: Automatický deployment

### 4.1 Použití deploy.sh scriptu
```bash
# Udělat script spustitelný
chmod +x deploy.sh

# Spustit deployment
./deploy.sh
```

### 4.2 GitHub Actions (volitelné)
Vytvořit `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: ".next/standalone/*,.next/static,public"
          target: "/var/www/kviz-new/"
          
      - name: Restart service
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            sudo chown -R kviz-user:kviz-user /var/www/kviz-new
            sudo systemctl restart kviz-new.service
```

## Krok 5: Monitorování a údržba

### 5.1 Health check
Aplikace poskytuje health check endpoint:
```
GET /health
```

### 5.2 Logy
```bash
# Aplikační logy
sudo journalctl -u kviz-new.service -f

# Nginx access logy
sudo tail -f /var/log/nginx/kviz-new.access.log

# Nginx error logy
sudo tail -f /var/log/nginx/kviz-new.error.log
```

### 5.3 Backup
```bash
# Backup adresáře s aplikací
tar -czf kviz-new-backup-$(date +%Y%m%d).tar.gz /var/www/kviz-new/

# Backup databáze (pokud bude)
# (zatím není potřeba)
```

## Krok 6: Administrační rozhraní

### 6.1 Přístup
Administrační rozhraní je dostupné na:
```
http://kviz.michaljanda.com/admin
```

### 6.2 Funkce
- Spuštění/zastavení serveru
- Deployment aplikace
- Zobrazení logů
- Monitorování zdrojů
- Rychlé odkazy

## Řešení problémů

### Aplikace se nespustí
```bash
# Zkontrolovat logy
sudo journalctl -u kviz-new.service -n 50

# Zkontrolovat práva
sudo ls -la /var/www/kviz-new/

# Zkontrolovat port
sudo netstat -tlnp | grep :3000
```

### Nginx vrací 502
```bash
# Zkontrolovat jestli aplikace běží
sudo systemctl status kviz-new.service

# Zkontrolovat firewall
sudo ufw status

# Testovat připojení k aplikaci
curl http://localhost:3000/health
```

### SSL certifikát nefunguje
```bash
# Obnovit certifikát
sudo certbot renew --force-renewal

# Zkontrolovat Nginx konfiguraci
sudo nginx -t
```

## Bezpečnostní doporučení

1. **Firewall**: Povolit pouze porty 80, 443
2. **Fail2ban**: Nainstalovat pro ochranu proti bruteforce
3. **Automatické updaty**: `sudo apt update && sudo apt upgrade -y`
4. **Monitorování**: Nastavit uptime monitoring
5. **Backup**: Pravidelné zálohování

## Kontakty
- **Problémy s deploymentem**: Domminik (AI assistant)
- **Server admin**: Martin Kalian (Mates)
- **URL**: https://kviz.michaljanda.com

---

**Poslední aktualizace**: 2026-03-07  
**Verze**: 1.0.0  
**Stav**: Připraveno k nasazení