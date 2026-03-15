# mstrankaV2 Workspace

Sdílený workspace pro vývoj a správu webů na mStranka V2 platformě.

## Přehled

mStranka V2 je moderní CMS systém s MCP (Model Context Protocol) serverem pro automatizovanou správu webů.

## Struktura

- `docs/` - Dokumentace a návody
- `templates/` - Šablony pro různé typy webů
- `scripts/` - Utility a skripty pro MCP komunikaci
- `examples/` - Ukázkové projekty a příklady
- `configs/` - Konfigurační soubory pro různé klienty

## Klíčové odkazy

- **Admin panel**: https://admin.v2.mstranka.cz/admin
- **MCP server**: https://mcp.v2.mstranka.cz/
- **Dokumentace**: https://mcp-help.v2.mstranka.cz/

## Požadavky

1. API klíč ve formátu `msk_...` (získat od administrátora)
2. Podporovaný klient: Claude Code, Claude Desktop, nebo OpenAI Codex s MCP podporou

## Rychlý start

1. Získej API klíč `msk_...`
2. Nakonfiguruj klienta podle `docs/CONFIGURATION.md`
3. Otestuj připojení: `list_websites`
4. Začni pracovat na webech