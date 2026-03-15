# Konfigurace API přístupu k mStranka V2

## Získání API klíče

1. Kontaktuj administrátora mStranka V2
2. Požádej o API klíč ve formátu `msk_...`
3. Klíč začíná vždy na `msk_`

## Bezpečnost API klíče

API klíč je citlivý údaj. Chraň ho před zveřejněním:

- Nikdy necommituj klíč do Git repozitáře
- Použij environment variable nebo externí správu secretů
- Pro vývoj použij testovací klíč
- Pro produkci použij produkční klíč

## Nastavení API klíče v OpenClaw

### Metoda 1: Environment variable
```bash
export MSTRANKA_API_KEY="msk_tvuj_klíč_zde"
```

### Metoda 2: Přidat do OpenClaw konfigurace
Do `~/.openclaw/openclaw.json` přidat:
```json
{
  "env": {
    "MSTRANKA_API_KEY": "msk_tvuj_klíč_zde"
  }
}
```

### Metoda 3: Secret management (doporučeno)
Vytvořit soubor `~/.openclaw/secrets/mstranka.json`:
```json
{
  "apiKey": "msk_tvuj_klíč_zde"
}
```

## Otestování připojení

Po nakonfigurování klíče otestuj připojení:

```bash
# Použij curl nebo podobný nástroj
curl -H "X-Api-Key: msk_tvuj_klíč_zde" \
  https://mcp.v2.mstranka.cz/sse
```

Nebo přes agenta:
```
Zavolej list_websites a ukaž mi dostupné weby.
```

## Chyby a řešení problémů

### "Invalid API key"
- Zkontroluj formát klíče (musí začínat `msk_`)
- Ověř, že klíč není vypršený
- Kontaktuj administrátora pro nový klíč

### "Connection refused"
- Zkontroluj URL: `https://mcp.v2.mstranka.cz/`
- Ověř síťové připojení
- Zkontroluj firewall nastavení

### "No websites available"
- Možná nemáš přístup k žádným webům
- Kontaktuj administrátora pro přidání práv