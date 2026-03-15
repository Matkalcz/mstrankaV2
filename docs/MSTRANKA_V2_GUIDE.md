# mStranka V2 - Kompletní průvodce

## Co je mStranka V2?

Moderní CMS systém s MCP (Model Context Protocol) serverem pro automatizovanou správu webů prostřednictvím AI agentů.

## Základní informace

- **Admin panel**: https://admin.v2.mstranka.cz/admin
- **MCP server**: https://mcp.v2.mstranka.cz/
- **API klíč**: Formát `msk_...` (získat od administrátora)

## Požadavky

1. **Podporovaní klienti**:
   - Claude Code (CLI)
   - Claude Desktop
   - OpenAI Codex (CLI/IDE) s podporou MCP

2. **API klíč** ve formátu `msk_...`

## Konfigurace klientů

### Claude Code
Soubor `.mcp.json` v kořenu projektu nebo `~/.claude/.mcp.json` pro globální nastavení:

```json
{
  "mcpServers": {
    "mstranka": {
      "type": "sse",
      "url": "https://mcp.v2.mstranka.cz/sse",
      "headers": {
        "X-Api-Key": "msk_VÁŠ_API_KLÍČ"
      }
    }
  }
}
```

### Claude Desktop
Nastavení → Developer → Edit Config, přidat do `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mstranka": {
      "type": "sse",
      "url": "https://mcp.v2.mstranka.cz/sse",
      "headers": {
        "X-Api-Key": "msk_VÁŠ_API_KLÍČ"
      }
    }
  }
}
```

### OpenAI Codex
TOML konfigurace v `~/.codex/config.toml` (globální) nebo `.codex/config.toml` (projekt):

```toml
[mcp_servers.mstranka]
url = "https://mcp.v2.mstranka.cz/"
http_headers = { "X-Api-Key" = "msk_VÁŠ_API_KLÍČ" }
```

## Ověření připojení

Po konfiguraci požádejte agenta:
```
Zavolej list_websites a ukaž mi dostupné weby.
```

Měli byste dostat seznam webů s jejich ID a doménou.

## Dostupné nástroje (23 MCP nástrojů)

### Workflow
- `list_websites` - Seznam dostupných webů
- `get_context` - Načte kompletní stav webu (stránky, sekce, příspěvky, kategorie, styly, dokumentace smart tagů)
- `preview` - Vygeneruje dočasnou URL pro kontrolu
- `publish` - Zveřejní změny na živém webu
- `export` - Exportuje data webu
- `import` - Importuje data do webu
- `validate` - Validuje data před importem

### Stránky
- `create_page` - Vytvoří novou stránku
- `edit_page` - Upraví existující stránku
- `delete_page` - Smaže stránku

### Sekce
- `add_section` - Přidá sekci na stránku
- `edit_section` - Upraví sekci
- `delete_section` - Smaže sekci

### Příspěvky (články)
- `create_post` - Vytvoří draft blogového příspěvku
- `edit_post` - Upraví příspěvek
- `delete_post` - Smaže příspěvek
- `publish_post` - Publikuje příspěvek

### Kategorie
- `create_category` - Vytvoří kategorii
- `edit_category` - Upraví kategorii
- `delete_category` - Smaže kategorii
- `assign_post_categories` - Přiřadí příspěvek ke kategoriím

### Vzhled
- `set_styles` - Nastaví vizuální styl webu
- `manage_block` - Spravuje bloky designu

### Soubory
- `list_folders` - Zobrazí složky s obrázky/soubory
- `upload_file` - Nahraje soubor

## První kroky

1. **Zjistěte ID webu** - `list_websites` vrátí seznam dostupných webů
2. **Načtěte kontext** - `get_context` s ID webu vrátí kompletní stav
3. **Začněte editovat** - Vytvořte stránku, přidejte sekci, napište obsah
4. **Zkontrolujte náhled** - `preview` vygeneruje dočasnou URL
5. **Publikujte** - `publish` zveřejní změny

## Praktické prompty (ukázky)

### Vytvoření landing page
```
Na webu s ID [WEBSITE_ID] vytvoř novou stránku "Letní akce" se slugem "letni-akce". Přidej hero sekci s titulkem, krátkým benefitem, CTA tlačítkem a třemi hlavními výhodami. Pak mi pošli preview URL.
```

### Přidání nové obsahové sekce
```
Na stránce "Domů" doplň sekci s referencemi zákazníků. Chci nadpis, tři citace a krátký závěrečný odstavec. Zachovej současný styl webu a po změně připrav preview.
```

### Založení blogového příspěvku
```
Na webu s ID [WEBSITE_ID] vytvoř draft blogového příspěvku s názvem "Jak funguje MCP v mStránce". Přidej perex, tři sekce obsahu a zařaď ho do kategorie "novinky". Než ho publikuješ, ukaž mi návrh textu.
```

### Úprava vzhledu
```
Změň vizuální styl webu: primární barvu nastav na tmavě tyrkysovou, sekundární na teplou oranžovou, uprav header tak, aby působil jednodušeji, a zachovej čitelnost na mobilu. Nakonec vygeneruj preview.
```

### Import a validace
```
Vezmi tento JSON export, nejdřív ho validuj a vypiš případné chyby. Pokud bude validní, importuj ho režimem merge na web [WEBSITE_ID] a pak mi shrň, co se změnilo.
```

### Audit existujícího webu
```
Načti kontext webu [WEBSITE_ID], projdi stránky, sekce, příspěvky i styly a navrhni konkrétní zlepšení obsahu, navigace a konzistence designu. Neprováděj změny, nejdřív chci doporučení.
```

## Tipy

- Pokud neznáte `websiteId`, začněte promptem: `Zavolej list_websites a ukaž mi dostupné weby.`
- Vždy nejdříve načtěte kontext webu pomocí `get_context`
- Před publikováním vždy vygenerujte `preview` pro kontrolu
- Pro opakované úkony vytvářejte šablony v adresáři `templates/`