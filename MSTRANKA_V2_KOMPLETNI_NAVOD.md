# KOMPLETNÍ NÁVOD: mStranka V2

**Pro:** Všechny agenty pracující s mStranka V2  
**Datum:** 2026-03-16  
**Autor:** Damiaan (main agent)

---

## 📋 OBSAH

1. [🚨 DŮLEŽITÁ PRAVIDLA](#-důležitá-pravidla)
2. [📁 SPRÁVA PROJEKTŮ A GIT](#-správa-projektů-a-git)
3. [🔌 MCP PŘIPOJENÍ A PRÁCE](#-mcp-připojení-a-práce)
4. [📝 NAHRÁVÁNÍ OBSAHU PŘES MCP](#-nahrávání-obsahu-přes-mcp)
5. [🏗️ PRÁCE SE STRÁNKAMI A SEKCE](#️-práce-se-stránkami-a-sekce)
6. [🔧 TROUBLESHOOTING MCP](#-troubleshooting-mcp)
7. [🤖 KOMUNIKACE MEZI AGENTY](#-komunikace-mezi-agenty)

---

## 🚨 DŮLEŽITÁ PRAVIDLA

### **1. WORKSPACE**
**Všechny projekty mStranka V2 se ukládají do:**
```
/home/openclaw/.openclaw/workspace-mstrankaV2/
```

**NE do osobního workspace!** Toto je centrální adresář pro všechny projekty.

### **2. STRUKTURA PROJEKTŮ**
```
projects/
├── bondsky/                    # Projekt Bondsky
│   ├── index.html             # Hlavní HTML stránka
│   ├── styles.css             # CSS soubory
│   ├── images/                # Obrázky projektu
│   └── README.md              # Dokumentace projektu
├── iqfan/                     # Projekt IQfan
│   ├── articles/              # Články pro IQfan
│   └── templates/             # Šablony
└── README.md                  # Dokumentace všech projektů
```

### **3. GIT COMMITOVÁNÍ**
**Po každé změně commitni na GitHub:**
```bash
cd /home/openclaw/.openclaw/workspace-mstrankaV2
git add projects/bondsky/   # nebo git add . pro všechny změny
git commit -m "Bondsky: přidán ROUNDHEAT section a CSS"
git push origin main
```

**Repozitář:** https://github.com/Matkalcz/mstrankaV2

---

## 🔌 PŘIPOJENÍ MCP

### **1.1 Kontrola připojení**
```bash
# Zkontroluj, zda je mcporter nainstalovaný
which mcporter
mcporter --version

# Zobraz seznam dostupných MCP serverů
mcporter list

# Očekávaný výstup:
# mcporter 0.7.3 — Listing 1 server(s) (per-server timeout: 30s)
# - mstranka (31 tools, 0.8s)
# ✔ Listed 1 server (1 healthy).
```

### **1.2 Konfigurace MCP**
**Potřebuješ:**
- API klíč ve formátu `msk_...` (získat od administrátora)
- URL MCP serveru: `https://mcp.v2.mstranka.cz/`

**Globální konfigurace (doporučeno):**
```bash
mkdir -p ~/.mcporter

cat > ~/.mcporter/mcporter.json << EOF
{
  "servers": {
    "mstranka": {
      "transport": "http",
      "url": "https://mcp.v2.mstranka.cz/",
      "headers": {
        "X-Api-Key": "msk_tvoje_api_klic"
      }
    }
  }
}
EOF
```

---

## 📁 SPRÁVA PROJEKTŮ

### **2.1 Vytvoření nového projektu**
```bash
# 1. Vytvoř složku projektu
mkdir -p /home/openclaw/.openclaw/workspace-mstrankaV2/projects/muj_projekt

# 2. Vytvoř základní strukturu
cd /home/openclaw/.openclaw/workspace-mstrankaV2/projects/muj_projekt
mkdir -p images styles articles
```

### **2.2 Git workflow**
```bash
# Před prací vždy synchronizuj
cd /home/openclaw/.openclaw/workspace-mstrankaV2
git pull origin main

# Po dokončení práce
git add projects/muj_projekt/
git commit -m "Můj projekt: popis změn"
git push origin main
```

---

## 📝 NAHRÁVÁNÍ OBSAHU

### **3.1 Příprava HTML obsahu**
**Obsah musí být v ČISTÉM HTML formátu** (bez doctype, html, head, body tagů).

**ŠPATNĚ:**
```html
<!DOCTYPE html>
<html>
<head><title>Článek</title></head>
<body>
  <h1>Nadpis</h1>
  <p>Text...</p>
</body>
</html>
```

**SPRÁVNĚ:**
```html
<h1>Nadpis článku</h1>
<p>První odstavec textu...</p>
<h2>Podnadpis</h2>
<p>Další text...</p>
<ul>
  <li>Položka 1</li>
  <li>Položka 2</li>
</ul>
```

### **3.2 Formátování HTML pro MCP (DŮLEŽITÉ!)**
**⚠️ POZOR: HTML se NEMÁ escapovat pro `htmlContent`!**

**Správně (čisté HTML):**
```bash
# Čisté HTML, žádné escapování!
htmlContent="<p>Testovací obsah</p>"
```

**Špatně (escapované HTML):**
```bash
# TOTO NEFUNGUJE! Rozbíjí HTML
htmlContent="&lt;p&gt;Testovací obsah&lt;/p&gt;"
```

**Co se ve skutečnosti potřebuje:**
1. **HTML zůstává čisté** - `<p>Text</p>`
2. **JSON serializaci řeší nástroje** - `mcporter` nebo framework
3. **Pokud voláš přes shell**, použij uvozovky: `htmlContent="<p>Text</p>"`

**Příklad správného použití:**
```bash
# Správně: čisté HTML v uvozovkách
mcporter call mstranka.edit_section \
  websiteId="..." \
  sectionId="..." \
  htmlContent="<h2>Nadpis</h2><p>Obsah článku s <strong>tučným</strong> textem.</p>"
```

**Proč původní sekce byla špatně:**
- Escapování HTML entit (`<` → `&lt;`) je pro zobrazení HTML jako textu na webové stránce
- Pro `htmlContent` v API potřebujeme surové HTML
- JSON speciální znaky (`"`, `\`, `\n`) řeší JSON serializer automaticky

### **3.3 Vytvoření nového článku**
```bash
mcporter call mstranka.create_post \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  title="IQOS ILUMA i Electric Purple: Fialová revoluce" \
  slug="iqos-iluma-i-electric-purple-fialova-revoluce" \
  perex="Philip Morris představuje nejžhavější novinku roku..." \
  htmlContent="$HTML_CONTENT"
```

---

## 🏗️ PRÁCE SE STRÁNKAMI A SEKCE

### **4.1 Získání kontextu webu**
```bash
# Získej kompletní informace o webu
mcporter call mstranka.get_context \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  --output json > context.json
```

### **4.2 Přidání nové sekce (add_section)**
```bash
mcporter call mstranka.add_section \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  pageId="92b390da-dc3b-45f4-91f9-73e17e7d005e" \
  name="nova-sekce" \
  htmlContent="$HTML_CONTENT" \
  title="Nová sekce" \
  showOnPage=true
```

### **4.3 Úprava existující sekce (edit_section) - SPRÁVNÝ FORMÁT**
**✅ SPRÁVNĚ (funguje!):**
```bash
mcporter call mstranka.edit_section \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  sectionId="70254035-7b13-461e-97a1-cc81e4a0130c" \
  name="hero" \
  htmlContent="<p>Testovací obsah</p>" \
  title="Testovací nadpis" \
  showOnPage=true
```

**❌ ŠPATNĚ (nefunguje!):**
```bash
# TOTO NEFUNGUJE!
mcporter bondsky edit_section --id 70254035-7b13-461e-97a1-cc81e4a0130c --data '{"title": "Test", "content": "Test"}'
```

### **4.4 Všechny sekce Bondsky s ID:**
```
Hero: 70254035-7b13-461e-97a1-cc81e4a0130c
ROUNDHEAT: e0aad26f-b1d7-4f49-8ac5-6a2f34c8d9e4
Why Bonds: 946ea13d-5e9b-4132-8e5d-ded98432ef20
Blends: 3f5d729e-7420-4a8e-8d8e-87ff434e2c6e
News: 2bd91bb2-437a-46c9-a53c-7918d6c16228
Tips & Guides: 9f9bfcdd-4c77-47be-88ce-a6ab670b9d0f
CTA: 413d0a1f-51ef-4848-be54-3d8195d28642
```

---

## 🔧 TROUBLESHOOTING

### **5.1 Časté chyby a řešení**

**Chyba: "Unauthorized" nebo "Authentication failed"**
```bash
# Řešení: Zkontroluj API klíč
openclaw config get mcp.servers.mstranka
```

**Chyba: "Website not found"**
```bash
# Řešení: Získej správné ID
mcporter call mstranka.list_websites --output json
```

**Chyba: "Invalid HTML content" nebo JSON parse error**
```bash
# Řešení: Escape HTML
HTML_CONTENT=$(cat muj_clanek.html | jq -Rs . | sed 's/^"//;s/"$//')
```

**Chyba: "An error occurred invoking 'edit_section'"**
**Příčina:** Špatný formát příkazu nebo chybějící parametry
```bash
# SPRÁVNÉ řešení:
mcporter call mstranka.edit_section \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  sectionId="SPRÁVNÉ_ID" \
  name="název-sekce" \
  htmlContent="<p>Obsah</p>" \
  title="Nadpis" \
  showOnPage=true
```

### **5.2 Diagnostika edit_section problému (pro Kristiana)**
**Pokud edit_section nefunguje:**
1. **Získej kontext:** `mcporter call mstranka.get_context websiteId="..." --output json`
2. **Najdi správné sectionId:** `cat context.json | jq -r '.pages[].sections[] | "\(.name): \(.id)"'`
3. **Použij správný formát příkazu** (viz 4.3)
4. **Zkontroluj všechny parametry:** websiteId, sectionId, name, htmlContent, title, showOnPage

**Testovací příkaz (funguje!):**
```bash
mcporter call mstranka.edit_section \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  sectionId="70254035-7b13-461e-97a1-cc81e4a0130c" \
  name="hero-test" \
  htmlContent="<p>Test</p>" \
  title="Test" \
  showOnPage=true
```

---

## 🤖 KOMUNIKACE MEZI AGENTY

### **6.1 Main agent koordinace**
**Jako main agent (Damiaan) mohu:**
1. **Spouštět sub-agenty:** `sessions_spawn(agentId: "kristiaan", task: "...")`
2. **Posílat zprávy:** `sessions_send(sessionKey: "agent:kristiaan:...", message: "...")`
3. **Řídit workflow** mezi agenty

### **6.2 Reportování práce**
**Formát reportu (cron job):**
```
1) Dokončeno (konkrétní úkoly, projekty)
2) Aktuálně (co právě řešíš)
3) Plán (co budeš dělat dál)
```

**Příklad správného reportu:**
```
1) Dokončeno:
- Bondsky: oprava edit_section problému
- mstrankaV2: aktualizace dokumentace
- Testování: ověření MCP serveru

2) Aktuálně:
- Příprava článku pro IQfan.cz
- Ladění importu dat

3) Plán:
- Dokončit článek
- Připravit batch upload
- Testovat nové MCP endpointy
```

### **6.3 Řešení problémů mezi agenty**
**Pokud agent má problém:**
1. **Hlásí main agentovi** (Damiaan)
2. **Main agent diagnostikuje** problém
3. **Main agent koordinuje řešení** s ostatními agenty
4. **Vytvoří dokumentaci** pro budoucí použití

---

## 🎯 SHRNUTÍ

### **Klíčové body:**
1. ✅ **Pracuj v workspace-mstrankaV2** - ne v osobním workspace
2. ✅ **Commituj na GitHub** po každé změně
3. ✅ **Escapeuj HTML** před odesláním přes MCP
4. ✅ **Používej správný formát příkazu** pro edit_section
5. ✅ **Reportuj skutečnou práci** - ne technické detaily
6. ✅ **Komunikuj s main agentem** při problémech

### **Kontakt:**
- **Main agent:** Damiaan (koordinuje všechny agenty)
- **GitHub:** https://github.com/Matkalcz/mstrankaV2
- **MCP server:** https://mcp.v2.mstranka.cz/

---

*Tento kompletní návod pro mStranka V2 vytvořil Damiaan jako main agent. Poslední aktualizace: 2026-03-16*