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

### **4. TECHNOLOGIE PRO NOVÉ WEBY**
**Nové weby stavěné od začátku používají Tailwind CSS:**
```html
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <title>Nový web</title>
</head>
<body class="bg-gray-50">
    <!-- Obsah s Tailwind třídami -->
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-800">Nadpis</h1>
        <p class="text-gray-600 mt-4">Text s Tailwind třídami.</p>
    </div>
</body>
</html>
```

**Pravidla:**
- **Vždy** vlož Tailwind CDN odkaz do hlavičky
- **Používej** Tailwind utility třídy (např. `text-gray-800`, `p-4`, `flex`)
- **Custom třídy** jen výjimečně, pokud jsou nezbytné
- **Responzivní design** pomocí Tailwind breakpointů (`sm:`, `md:`, `lg:`)

### **5. WORKFLOW PUBLIKACE**
**Změny na webu jdou vždy jen do Preview!**

**Pravidla publikace:**
1. **Všechny změny** se nejdříve nahrávají do **Preview** režimu
2. **Agent si musí vyžádat souhlas** s publikací na ostrý web
3. **Výjimka:** Publikace zcela nového webu (neexistujícího předtím)
4. **Před každým nahráním preview** si agent otevře tento návod a zkontroluje postup

**Workflow:**
```
1. Agent vytvoří změny → 2. Nahrání do Preview → 3. Žádost o souhlas → 4. Publikace
```

**Kontrolní seznam před nahráním:**
- [ ] Otevřel jsem tento návod a zkontroloval postup
- [ ] HTML je čisté (bez doctype/html/head/body pro obsah)
- [ ] Používám Tailwind CSS (pro nové weby)
- [ ] Nahrávám pouze do Preview
- [ ] Budu žádat o souhlas pro publikaci

### **6. ZÁSADNÍ PRAVIDLO MCP**
**Publikace přes MCP musí proběhnout VŽDY jen podle tohoto návodu!**

**ZAKÁZÁNO:**
- ❌ Zkoušet vlastní řešení nebo postupy
- ❌ Ignorovat tento návod
- ❌ Vymýšlet si alternativní metody
- ❌ Přeskakovat kontrolní seznam

**POVINNÉ:**
- ✅ Před každou publikací otevřít tento návod
- ✅ Postupovat přesně podle kroků
- ✅ Dodržet workflow publikace (Preview → souhlas → publikace)
- ✅ Používat pouze ověřené příkazy z návodu

**Důsledky porušení:**
- Chyby v publikaci
- Rozbitý obsah na webu
- Ztráta času na opravy
- Nutnost znovu publikovat

---

## 📚 VYTVÁŘENÍ OBSAHU POMOCÍ KATEGORIÍ

**Strukturovaný přístup k tvorbě webového obsahu:**

### **1. WORKFLOW PRO NOVOU KATEGORII**
**Vytváření obsahu probíhá vždy v těchto krocích:**

```
1. Založit kategorii
   ↓
2. Vytvořit univerzální articlepage pro zobrazování článku
   ↓  
3. Založit univerzální listpage pro výpis článků
   ↓
4. Přiřadit kategorii articlepage i listpage
```

### **2. PRAVIDLA PRO KATEGORIE**

**Každá kategorie musí mít:**
- ✅ **Articlepage** - univerzální šablona pro zobrazení jednotlivého článku
- ✅ **Listpage** - univerzální šablona pro výpis všech článků v kategorii
- ✅ **Přiřazení** - kategorie musí mít obě stránky explicitně přiřazené
- ✅ **Odkazy** - všechny odkazy v menu vedou na generované adresy kategorií

### **3. UNIVERZÁLNÍ VS UNIKÁTNÍ STRÁNKY**

**Univerzální stránky (používat vždy):**
- **Articlepage** - pro zobrazení jakéhokoli článku v kategorii
- **Listpage** - pro výpis všech článků v kategorii
- **Výhoda:** Jedna šablona pro všechny články/kategorie

**Unikátní stránky (používat výjimečně):**
- Pouze pro stránky které **nemohou mít kategorii**
- Např.: Kontakt, O nás, Domovská stránka
- **Pravidlo:** Pokud může mít kategorii → použít kategorii

### **4. PŘÍKLAD: BLOG KATEGORIE**

**Kategorie "Technologie":**
```
1. Založení kategorie:
   - Název: "Technologie"
   - Slug: "technologie"

2. Articlepage:
   - Název: "Articlepage - Technologie"
   - Šablona: univerzální_articlepage.html
   - Přiřazeno kategorii: Technologie

3. Listpage:
   - Název: "Listpage - Technologie"  
   - Šablona: univerzální_listpage.html
   - Přiřazeno kategorii: Technologie

4. Odkazy:
   - Menu: /kategorie/technologie → listpage
   - Článek: /clanek/nazev-clanku → articlepage
```

### **5. KONTROLNÍ SEZNAM PŘED VYTVOŘENÍM OBSAHU**

- [ ] Určil jsem správnou kategorii pro obsah
- [ ] Kategorie má přiřazenou articlepage i listpage
- [ ] **Listpage obsahuje smart tag `<posts>`** pro automatický výpis článků
- [ ] Používám univerzální šablony (ne vytvářím nové)
- [ ] Odkazy vedou na generované adresy kategorií
- [ ] Unikátní stránku vytvářím pouze pokud NEMŮŽE mít kategorii

### **6. CHYBY KTERÝM SE VYHNOUT**

❌ **Vytvářet unikátní stránku** pro každý článek  
❌ **Používat přímé odkazy** místo kategorií  
❌ **Zapomenout přiřadit** articlepage/listpage ke kategorii  
❌ **Vytvářet nové šablony** místo použití univerzálních  
❌ **Zapomenout na smart tag `<posts>`** v Listpage  

✅ **Vždy používat kategorie** pokud je to možné  
✅ **Používat univerzální šablony**  
✅ **Odkazovat na generované adresy** kategorií  
✅ **Přiřazovat obě stránky** ke každé kategorii  
✅ **Přidat smart tag `<posts>`** do každé Listpage  

---

## 🔌 PŘIPOJENÍ MCP

### **1.1 Aktuální rozdělení serverů**

Používej dva oddělené MCP servery:

- **Produkce (`profistranka`)**
  - `type: "sse"`
  - `url: "https://mcp.profistranka.cz/sse"`
  - používá nový produkční API klíč

- **Test / původní mStranka (`profistranka-test`)**
  - `type: "sse"`
  - `url: "https://mcp.test.profistranka.cz/sse"`
  - používá původní API klíč mStranka

### **1.2 Důležité pravidlo**

- Ostré weby a běžné produkční změny dělej přes **`profistranka`**.
- Testy, migrace a ověřování původní mStranka logiky dělej přes **`profistranka-test`**.
- Před každou úpravou si ověř, na který server a web právě míříš.

### **1.3 Konfigurace MCP**

```bash
mkdir -p ~/.mcporter

cat > ~/.mcporter/mcporter.json << EOF
{
  "mcpServers": {
    "profistranka": {
      "type": "sse",
      "url": "https://mcp.profistranka.cz/sse",
      "headers": {
        "X-Api-Key": "msk_produkcni_klic"
      }
    },
    "profistranka-test": {
      "type": "sse",
      "url": "https://mcp.test.profistranka.cz/sse",
      "headers": {
        "X-Api-Key": "msk_puvodni_klic_mstranka"
      }
    }
  }
}
EOF
```

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

**⚠️ HLAVNÍ PRAVIDLO: HTML se NEESCAPUJE! Posílej čisté HTML.**

API očekává surové HTML v poli `htmlContent`. Žádné `&lt;`, `&gt;`, `&amp;` — to by rozbilo obsah.

**✅ SPRÁVNĚ:**
```bash
mcporter call mstranka.edit_section \
  websiteId="..." \
  sectionId="..." \
  name="hero" \
  htmlContent="<h2>Nadpis</h2><p>Obsah s <strong>tučným</strong> textem.</p>" \
  title="Nadpis" \
  showOnPage=true
```

**❌ ŠPATNĚ — neescapuj HTML entity:**
```bash
# TOTO NEFUNGUJE! &lt; a &gt; se uloží jako text, ne jako HTML tagy
htmlContent="&lt;p&gt;Testovací obsah&lt;/p&gt;"
```

**❌ ŠPATNĚ — nepoužívej jq/sed na escapování HTML:**
```bash
# TOTO JE ŠPATNĚ! jq -Rs escapuje pro JSON string, ale HTML tagy zůstanou.
# Problém nastane, když to kombinuješ s ručním HTML escapováním.
HTML_CONTENT=$(cat soubor.html | jq -Rs . | sed 's/^"//;s/"$//')
```

**Jak to funguje:**
- `htmlContent` posíláš jako **čisté HTML** v uvozovkách
- `mcporter` se automaticky postará o JSON serializaci (escapuje `"`, `\`, newlines)
- Ty se staráš jen o to, aby HTML bylo validní

**Načtení HTML ze souboru:**
```bash
# Přečti soubor do proměnné (HTML zůstane čisté)
HTML_CONTENT=$(cat muj_clanek.html)

# Pošli přes mcporter
mcporter call mstranka.create_post \
  websiteId="..." \
  title="Můj článek" \
  htmlContent="$HTML_CONTENT"
```

**Víceřádkové HTML přímo v příkazu:**
```bash
mcporter call mstranka.edit_section \
  websiteId="..." \
  sectionId="..." \
  name="hero" \
  htmlContent="<div class=\"hero-content\">
    <h1>Hlavní nadpis</h1>
    <p>Popis stránky</p>
  </div>" \
  title="Hero" \
  showOnPage=true
```
Poznámka: uvozovky uvnitř HTML escapuj zpětným lomítkem (`\"`) — to je jediné escapování, které potřebuješ.

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

### **4.2 ZALOŽENÍ NOVÉ STRÁNKY (create_page)**

**Kdy založit novou stránku:**
- **Unikátní stránky:** Kontakt, O nás, Domovská stránka
- **Univerzální stránky:** Articlepage, Listpage pro kategorie
- **Speciální stránky:** Landing pages, promo stránky

#### **4.2.1 Založení univerzální stránky (articlepage/listpage)**
```bash
# Založení nové stránky - SPRÁVNÉ PARAMETRY
mcporter call mstranka.create_page \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  name="articlepage-technologie" \
  slug="articlepage-technologie" \
  title="Articlepage - Technologie" \
  showInMenu=false \
  description="Univerzální articlepage pro kategorii Technologie"
```

**⚠️ DŮLEŽITÉ:** `create_page` **FUNGUJE** i když není vždy vidět v seznamu nástrojů!  
**Parametry podle API:**
- `websiteId` (povinné) - ID webu
- `name` (povinné) - interní název stránky
- `slug` (povinné) - URL adresa
- `title` (povinné) - zobrazovaný název
- `sortOrder?` (volitelné) - pořadí v menu
- `showInMenu?` (volitelné) - zobrazit v menu
- `description?` (volitelné) - popis stránky
- `language?` (volitelné) - jazyk

**NEMÁ parametry:**
- `template` - template se nastavuje jinak (přiřazením ke kategorii)
- `isPublished` - publikace se řeší jinak

#### **4.2.2 Založení unikátní stránky**
```bash
# Založení kontaktní stránky - SPRÁVNÉ PARAMETRY
mcporter call mstranka.create_page \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  name="kontakt" \
  slug="kontakt" \
  title="Kontakt" \
  showInMenu=true \
  description="Kontaktní stránka"
```

#### **4.2.3 Získání ID nové stránky**
```bash
# Po vytvoření stránky získej její ID
mcporter call mstranka.get_context \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  --output json | jq '.pages[] | select(.name=="articlepage-technologie") | .id'
```

#### **4.2.4 Přiřazení stránky ke kategorii**
```bash
# Pokud vytváříš articlepage/listpage pro kategorii, přiřaď ji
mcporter call mstranka.assign_page_to_category \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  pageId="NOVE_STRANKY_ID" \
  categoryId="KATEGORIE_ID"
```

#### **4.2.5 Kontrolní seznam před založením stránky**
- [ ] Určil jsem typ stránky (unikátní/univerzální)
- [ ] Vybral jsem správný template (articlepage/listpage/default)
- [ ] Zvolil jsem smysluplný slug (URL adresa)
- [ ] Vím ke které kategorii stránku přiřadit (pokud je univerzální)
- [ ] Získám ID stránky pro další práci

### **4.3 Přidání nové sekce (add_section)**
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
# PŘED editací: VŽDY si získej správné sectionId pro svůj web!
mcporter call mstranka.edit_section \
  websiteId="TVOJE_WEBSITE_ID" \
  sectionId="SPRÁVNÉ_SECTION_ID_PRO_TVŮJ_WEB" \
  name="název-sekce" \
  htmlContent="<p>Testovací obsah</p>" \
  title="Testovací nadpis" \
  showOnPage=true
```

**❌ ŠPATNĚ (nefunguje!):**
```bash
# TOTO NEFUNGUJE!
# 1. Používáš špatný příkaz (bondsky místo mstranka)
# 2. Používáš špatné ID (ID z jiného webu)
mcporter bondsky edit_section --id NESPRÁVNÉ_ID --data '{"title": "Test", "content": "Test"}'
```

### **4.4 ZÍSKÁNÍ SEKCÍ KONKRÉTNÍHO WEBU**

**⚠️ DŮLEŽITÉ: Každý web má jiná ID sekcí! NEPOUŽÍVEJ ID z tohoto návodu!**

#### **4.4.1 Jak získat všechny sekce webu:**
```bash
# 1. Získej kompletní kontext webu
mcporter call mstranka.get_context \
  websiteId="TVOJE_WEBSITE_ID" \
  --output json > website_context.json

# 2. Extrahuj sekce s jejich ID
cat website_context.json | jq '.pages[].sections[] | {name: .name, id: .id}'

# 3. Nebo použij grep pro konkrétní sekci
cat website_context.json | grep -A5 -B5 "Hero"  # nebo jiný název sekce
```

#### **4.4.2 Příklad výstupu (UNIVERZÁLNÍ FORMÁT):**
```
{
  "name": "Hero",
  "id": "UNIKÁTNÍ_ID_PRO_TVŮJ_WEB"
}
{
  "name": "News", 
  "id": "JINÉ_UNIKÁTNÍ_ID"
}
```

#### **4.4.3 Proč NEPOUŽÍVAT konkrétní ID z příkladů:**
- ❌ **Každý web má jiná ID** sekcí
- ❌ **ID z Bondsky** nefungují na jiných webech
- ❌ **Agent se zmate** když použije špatné ID
- ✅ **Vždy si získej aktuální ID** pro svůj web
- ✅ **Používej `get_context`** před každou editací

#### **4.4.4 Kontrolní seznam před editací sekce:**
- [ ] Získal jsem aktuální `websiteId` svého webu
- [ ] Získal jsem všechny sekce pomocí `get_context`
- [ ] Našel jsem správné `sectionId` pro sekci kterou chci editovat
- [ ] Ověřil jsem že `sectionId` patří k mému webu

### **4.5 FOOTER A HEADER - KAM NAHRÁVAT OBSAH**

**⚠️ DŮLEŽITÉ: Footer a header se NENAHRAVÁJÍ jako běžné sekce!**

#### **Footer (patička) - footerContent:**
**Kam nahrávat:** Do **globálního nastavení webu** (website settings), ne do sekcí!

**Správný postup:**
```bash
# 1. Získej aktuální nastavení webu
mcporter call mstranka.get_context \
  websiteId="0bb29aa8-00e5-4d54-ae29-83f9c9343032" \
  --output json > website_settings.json

# 2. Uprav footerContent v nastavení
# (Použij edit_website nebo update_website_settings podle API)
```

**Co je footerContent:**
- Obsah patičky (footer) celého webu
- Zobrazuje se na všech stránkách
- Obsahuje: copyright, odkazy, kontakty, logo
- **NENÍ to běžná sekce!**

#### **Header (menu) - headerContent:**
**Kam nahrávat:** Také do **globálního nastavení webu**!

**Správný postup:**
```bash
# Nahrání headerContent (menu) do globálního nastavení
# Použij stejný endpoint jako pro footer
```

**Co je headerContent:**
- Hlavní menu/navigace webu
- Zobrazuje se na všech stránkách
- Obsahuje: logo, navigační odkazy, tlačítka
- **NENÍ to běžná sekce!**

#### **⚠️ KLÍČOVÉ ROZDÍLY:**

| | **Běžné sekce** | **Footer/Header** |
|---|---|---|
| **Kam nahrávat** | `add_section` / `edit_section` | `edit_website_settings` |
| **Scope** | Konkrétní stránka | Celý web |
| **ID** | Má vlastní `sectionId` | Nemá sectionId |
| **Přístup** | Přes `websiteId` + `pageId` | Přes `websiteId` |

#### **KONTROLNÍ SEZNAM PŘED NAHRÁVÁNÍM:**
- [ ] Rozlišuji mezi běžnou sekcí a footer/header
- [ ] Footer/header nahrávám do globálního nastavení webu
- [ ] Běžné sekce nahrávám přes `add_section`/`edit_section`
- [ ] Vím které endpointy použít pro každý typ

#### **CHYBY KTERÝM SE VYHNOUT:**
❌ **Pokoušet se editovat footer** jako běžnou sekci  
❌ **Hledat `sectionId`** pro footer/header (nemají ho)  
❌ **Používat `edit_section`** pro footer/header  
✅ **Používat správné endpointy** pro globální nastavení  

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

**Chyba: "create_page not found" nebo "Unknown tool"**
```bash
# Řešení: `create_page` FUNGUJE i když není vždy vidět v seznamu!
# Použij ho přímo:
mcporter call mstranka.create_page \
  websiteId="ID_WEBU" \
  name="název-stránky" \
  slug="slug-stránky" \
  title="Název stránky"

# Nebo zkontroluj všechny dostupné nástroje:
mcporter list mstranka | grep -A5 "function create_page"
```

**Chyba: "Invalid HTML content" nebo JSON parse error**
```bash
# Řešení: Zkontroluj, že HTML NENÍ escapované (žádné &lt; &gt; &amp;)
# Správně: čisté HTML
HTML_CONTENT=$(cat muj_clanek.html)

# Ověř, že obsah vypadá jako HTML, ne jako escapovaný text:
echo "$HTML_CONTENT" | head -5
# Mělo by být: <h1>Nadpis</h1>  (ne: &lt;h1&gt;Nadpis&lt;/h1&gt;)
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

### **5.2 SMART TAGY - KLÍČOVÉ ŘEŠENÍ PRO LISTPAGE**

**⚠️ DŮLEŽITÉ: Toto je klíčové řešení které jsem našel v dokumentaci!**

#### **Smart tag `<posts>` - automatický výpis článků v kategorii**
```html
<posts category="novinky" take="5" order="date">
 <h3>[Title]</h3>
 <p>[Perex]</p>
 <a href="[Url]">Číst dále</a>
</posts>
```

#### **Atributy tagu `<posts>`:**
- `category` **(povinný)** - slug kategorie (např. "novinky", "technologie")
- `take` - počet článků k zobrazení (např. 5, 10)
- `skip` - kolik článků přeskočit
- `order` - řazení: `date` (nejnovější), `date asc` (nejstarší), `title` (abecedně)
- `paging` - zapnout stránkování (true/false)
- `pagesize` - počet článků na stránku

#### **Proměnné uvnitř tagu:**
- `[Title]` - název článku
- `[Perex]` - perex/úvod článku
- `[Content]` - celý obsah článku
- `[PublishedDate]` - datum publikace
- `[Url]` - URL článku
- `[TitleImageUrl]` - URL titulního obrázku
- `[Slug]` - slug článku
- `[CategoryName]` - název kategorie
- `[CategorySlug]` - slug kategorie
- `[ExternalUrl]` - externí URL (pokud existuje)
- `[HeaderVideoUrl]` - URL header videa
- `[TextField1]` až `[TextField4]` - custom textová pole

#### **Příklad: Listpage s výpisem článků**
```html
<div class="container mx-auto px-4">
  <h1 class="text-3xl font-bold mb-8">Novinky</h1>
  
  <!-- SMART TAG: Automatický výpis 10 nejnovějších článků v kategorii "novinky" -->
  <posts category="novinky" take="10" order="date">
    <div class="mb-8 p-6 border rounded-lg shadow">
      <h3 class="text-xl font-semibold mb-2">[Title]</h3>
      <p class="text-gray-600 mb-4">[Perex]</p>
      <div class="text-sm text-gray-500 mb-4">Publikováno: [PublishedDate]</div>
      <a href="[Url]" class="text-blue-600 hover:text-blue-800 font-medium">
        Číst celý článek →
      </a>
    </div>
  </posts>
</div>
```

#### **Kdy použít smart tag `<posts>`:**
- ✅ **Listpage** - výpis všech článků v kategorii
- ✅ **Homepage** - výpis nejnovějších článků
- ✅ **Sidebar** - výpis populárních článků
- ✅ **Různé sekce** - tematické výpisy článků

#### **Jak přidat do Listpage:**
1. **Otevři Listpage** v editoru
2. **Přidej sekci** s HTML obsahem
3. **Vlož smart tag** `<posts>` s parametry
4. **Nastav styling** kolem proměnných
5. **Ulož a publikuj**

### **5.3 KDYŽ NĚCO CHYBÍ V NÁVODU NEBO MCP SERVER NEPOMÁHÁ**

**Řešení: Otevři si dokumentaci mStranka V2 a PROJDI JI CELOU!**
```bash
# 1. Dokumentace obsahuje KLÍČOVÉ ŘEŠENÍ jako smart tagy!
#    https://mcp-help.v2.mstranka.cz/

# 2. Hledej v sekcích:
#    - Smart tagy
#    - API reference  
#    - Příklady

# 3. Hledej v GitHub historii
cd /home/openclaw/.openclaw/workspace-mstrankaV2
git log --oneline --grep="tvůj_problém" -i

# 4. Kontaktuj main agenta (Damiaan)
#    - Popiš problém
#    - Přidej chybovou zprávu
#    - Řekni co jsi už zkoušel
```

**NEVYMÝŠLEJ si řešení:**
- ❌ Nezkoušej vlastní příkazy
- ❌ Neměň formát bez ověření
- ✅ Dodržuj tento návod
- ✅ **PROJDI CELOU DOKUMENTACI:** https://mcp-help.v2.mstranka.cz/
- ✅ **HLEDEJ KLÍČOVÁ ŘEŠENÍ** jako smart tagy

### **5.3 Diagnostika edit_section problému (pro Kristiana)**
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
3. ✅ **Posílej čisté HTML** (neescapuj!) přes MCP
4. ✅ **Používej správný formát příkazu** pro edit_section
5. ✅ **Reportuj skutečnou práci** - ne technické detaily
6. ✅ **Komunikuj s main agentem** při problémech

### **Kontakt:**
- **Main agent:** Damiaan (koordinuje všechny agenty)
- **GitHub:** https://github.com/Matkalcz/mstrankaV2
- **MCP server:** https://mcp.v2.mstranka.cz/
- **Dokumentace:** https://mcp-help.v2.mstranka.cz/

### **⚠️ DŮLEŽITÉ: KDYŽ MCP SERVER NEPOMÁHÁ**
**Pokud něco chybí v návodu nebo MCP server nefunguje:**

1. **Zkus si otevřít dokumentaci:**
   - https://mcp-help.v2.mstranka.cz/
   - Kompletní API dokumentace
   - Příklady a návody

2. **Hledej v GitHub historii:**
   ```bash
   cd /home/openclaw/.openclaw/workspace-mstrankaV2
   git log --oneline --grep="tvůj_problém" -i
   ```

3. **Kontaktuj main agenta (Damiaan):**
   - Popiš problém
   - Přidej chybovou zprávu
   - Řekni co jsi už zkoušel

4. **NEVYMÝŠLEJ si řešení:**
   - ❌ Nezkoušej vlastní příkazy
   - ❌ Neměň formát bez ověření
   - ✅ Dodržuj tento návod
   - ✅ Používej dokumentaci

---

*Tento kompletní návod pro mStranka V2 vytvořil Damiaan jako main agent. Poslední aktualizace: 2026-03-16*