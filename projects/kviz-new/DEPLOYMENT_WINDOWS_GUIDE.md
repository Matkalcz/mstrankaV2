# Deployment Guide for Windows - kviz.michaljanda.com

## Stav aplikace k 17.3.2026

✅ **Build připraven** - Next.js 15.1.6 s TypeScript
✅ **Mock database** - In-memory databáze pro testování  
✅ **Admin panel** - Správa otázek a kvízů
✅ **QuizPlayer** - Hraní kvízů
✅ **API endpointy** - REST API pro otázky a kvízy
✅ **Demo data** - 3 otázky, 1 kvíz

## Problém s deploymentem

Linuxový deployment script (`deploy.sh`) nelze spustit na Windows. Script obsahuje Linux-specifické příkazy:

- `sudo`, `lsof`, `nohup`, `tar`
- Linux cesty (`/home/openclaw/...`)
- Systemd service management

## Řešení pro Windows deployment

### Varianta 1: Manuální deployment přes SSH

1. **Připravit build lokálně:**

   ```bash
   npm run build
   ```

2. **Zkopírovat build na server:**

   ```bash
   # Použijte WinSCP nebo FileZilla
   # Zkopírujte celou složku .next/standalone na server
   ```

3. **Spustit server na serveru:**

   ```bash
   # Připojte se přes SSH k serveru
   ssh openclaw@server

   # Zastavit starý server
   pkill -f "node server.js"

   # Spustit nový server
   cd /home/openclaw/.openclaw/workspace-domminik/kviz-new/.next/standalone
   PORT=3002 node server.js > /tmp/nextjs.log 2>&1 &
   ```

### Varianta 2: Použít existující Linux server script

Linux server již má deployment script `deploy.sh`. Stačí ho spustit na serveru:

```bash
# Připojit se přes SSH
ssh openclaw@server

# Přejít do adresáře projektu
cd /home/openclaw/.openclaw/workspace-domminik/kviz-new

# Spustit deployment
./deploy.sh
```

### Varianta 3: Git push a automatický deployment

1. **Pushnout změny na GitHub:**

   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Na serveru pullnout změny:**
   ```bash
   ssh openclaw@server
   cd /home/openclaw/.openclaw/workspace-domminik/kviz-new
   git pull origin main
   ./deploy.sh
   ```

## Testování deploymentu

### Lokální test (Windows):

```bash
# Build aplikace
npm run build

# Spustit produkční server
npx next start -p 3002

# Testovat:
curl http://localhost:3002/admin
curl http://localhost:3002/api/questions
curl http://localhost:3002/api/quizzes
```

### Produkční test:

```bash
# Zkontrolovat produkční web
curl -L https://kviz.michaljanda.com/admin

# Zkontrolovat API
curl -L https://kviz.michaljanda.com/api/questions
```

## Known Issues a řešení

### 1. better-sqlite3 native module

- **Problém:** Build warning kvůli native modulu
- **Řešení:** Používáme mock databázi (`lib/database-mock.ts`)
- **Stav:** ✅ Vyřešeno - všechny importy nahrazeny

### 2. CSS/Static files 404 errors

- **Problém:** Next.js standalone build nekopíruje statické soubory
- **Řešení:** Manuální kopírování `.next/static/` do `.next/standalone/.next/static/`
- **Script:** `deploy.sh` automatizuje tento proces (na Linuxu)

### 3. Nginx konfigurace

- **Problém:** Chybějící středník v `add_header Clear-Site-Data`
- **Řešení:** Opraveno v `nginx-kviz-new.conf`
- **Příkaz pro opravu:** `sudo nginx -t && sudo systemctl reload nginx`

## Instrukce pro online kontrolu

Aplikace je připravena pro online kontrolu na:

### Lokální testování:

1. **Admin panel:** http://localhost:3002/admin
2. **Demo kvíz:** http://localhost:3002/play/b2feb252-2a6d-4526-962e-9ee3c553a6e75
3. **API:** http://localhost:3002/api/questions

### Produkční testování:

1. **Admin panel:** https://kviz.michaljanda.com/admin
2. **API:** https://kviz.michaljanda.com/api/questions

## Testovací scénáře

### Scénář 1: Admin panel

1. Otevřete admin panel
2. Klikněte na "Otázky"
3. Vytvořte novou otázku
4. Ověřte, že se otázka objeví v seznamu

### Scénář 2: Vytvoření kvízu

1. V admin panelu klikněte na "Kvízy"
2. Vytvořte nový kvíz
3. Přidejte otázky do kvízu

### Scénář 3: Hraní kvízu

1. Získejte ID kvízu z admin panelu
2. Otevřete `/play/[quiz-id]`
3. Projděte všechny otázky
4. Ověřte skórování

## Kontaktní informace

- **GitHub:** https://github.com/Matkalcz/kviz_new
- **Produkční URL:** https://kviz.michaljanda.com
- **Lokální test:** http://localhost:3002

## Shrnutí

✅ **Build připraven** - funguje na Windows i Linuxu  
✅ **Mock database** - demo data pro testování  
✅ **Admin panel** - plně funkční  
✅ **QuizPlayer** - hraní kvízů funguje  
✅ **API** - všechny endpointy pracují

⚠️ **Deployment** - potřebuje manuální akci na Linux serveru  
⚠️ **Produkční databáze** - stále mock, ale funkční

**Aplikace je připravena pro online review!**
