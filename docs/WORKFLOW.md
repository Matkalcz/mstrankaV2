# Workflow pro práci s mStranka V2

## Přehled workflow

1. **Přijetí úkolu** - Martin zadá úkol agentovi (navrhnout/editovat web)
2. **Příprava** - Agent načte kontext webu a dokumentaci
3. **Implementace** - Agent provede změny pomocí MCP nástrojů
4. **Náhled** - Vygeneruje preview pro kontrolu
5. **Schválení** - Martin zkontroluje a schválí změny
6. **Publikace** - Agent publikuje změny na živý web

## Detailní postup

### Fáze 1: Příprava

1. **Získání websiteId**
   ```bash
   # Použij MCP nástroj list_websites
   Zavolej list_websites a ukaž mi dostupné weby.
   ```

2. **Načtení kontextu**
   ```bash
   # Použij MCP nástroj get_context
   Načti kontext webu [WEBSITE_ID] pomocí get_context.
   ```

3. **Analýza současného stavu**
   - Projdi stránky, sekce, příspěvky
   - Analyzuj design a strukturu
   - Identifikuj místa pro zlepšení

### Fáze 2: Implementace změn

#### Pro vytvoření nové stránky:
```
Na webu s ID [WEBSITE_ID] vytvoř novou stránku "[NÁZEV]" se slugem "[SLUG]".
Přidej potřebné sekce podle šablony z templates/.
Po dokončení vygeneruj preview URL.
```

#### Pro editaci existující stránky:
```
Na stránce "[NÁZEV_STRÁNKY]" uprav následující:
1. [Změna 1]
2. [Změna 2]
3. [Změna 3]
Zachovej současný styl webu a po změně připrav preview.
```

#### Pro vytvoření článku (Damianův cron job):
```
Na webu s ID [WEBSITE_ID] vytvoř draft blogového příspěvku s názvem "[NÁZEV_ČLÁNKU]".
Přidej perex, obsah podle zadání a zařaď ho do kategorie "[KATEGORIE]".
Nastav jako draft (nepublikuj).
```

### Fáze 3: Kontrola a publikace

1. **Vygenerování preview**
   ```bash
   # Použij MCP nástroj preview
   Vygeneruj preview pro kontrolu změn.
   ```

2. **Schválení Martinem**
   - Pošli Martinovi preview URL
   - Počkej na feedback
   - Proveď případné úpravy

3. **Publikování**
   ```bash
   # Použij MCP nástroj publish
   Publikuj všechny schválené změny.
   ```

## Role agentů

### Mateej (já)
- Hlavní vývojář a architekt
- Komplexní úpravy webů
- Vytváření nových funkcionalit
- Integrace s externími systémy

### Domminik
- Web development specialista
- Implementace designu
- Optimalizace pro mobilní zařízení
- SEO úpravy

### Kristiaan
- Content specialista
- Tvorba a editace obsahu
- Kategorizace a organizace
- Validace obsahu

### Damian (main)
- Automatizace pomocí cron jobs
- Pravidelné vytváření článků
- Monitorování a reporting
- Backup a export dat

## Šablony

Šablony jsou v adresáři `templates/`:

- `landing-page.md` - Šablona pro landing page
- `blog-post.md` - Šablona pro blogový příspěvek
- `product-page.md` - Šablona pro produktovou stránku
- `contact-page.md` - Šablona pro kontaktní stránku

## Best practices

1. **Vždy nejdříve načti kontext** - Použij `get_context` před jakoukoli editací
2. **Používej preview** - Vždy vygeneruj preview před publikováním
3. **Dokumentuj změny** - Při každé editaci přidej komentář k změnám
4. **Testuj na mobilech** - Ověř si, že změny fungují responzivně
5. **Backup před většími změnami** - Použij `export` před radikálními úpravami

## Error handling

### Časté chyby a řešení

#### "Website not found"
- Ověř správnost `websiteId`
- Zkontroluj přístupová práva
- Použij `list_websites` pro aktuální seznam

#### "Invalid slug"
- Slug musí obsahovat pouze malá písmena, čísla a pomlčky
- Nesmí začínat nebo končit pomlčkou
- Musí být unikátní v rámci webu

#### "Preview generation failed"
- Zkontroluj, zda jsou všechny povinné pole vyplněna
- Ověř syntaxi HTML/CSS
- Zkus zmenšit rozsah změn

## Nástroje a utility

V adresáři `scripts/` najdeš užitečné utility:

- `mcp-connect.sh` - Test připojení k MCP serveru
- `website-backup.sh` - Export webu do JSON
- `content-validator.py` - Validace obsahu před publikováním
- `bulk-upload.py` - Hromadné nahrávání souborů