# Projekts - Záloha webů

Tento adresář slouží pro zálohu jednotlivých webů vytvořených na mStranka V2 platformě.

## Struktura

Každý web má vlastní podadresář s názvem ve formátu:
```
[WEBSITE_ID]_[DOMENA]_[DATUM_VZNIKU]
```

Příklad:
```
12345_example-com_2026-03-15
```

## Co ukládat pro každý web

### 1. Kompletní export (JSON)
- Použít MCP nástroj `export`
- Uložit jako `export.json`
- Obsahuje kompletní stav webu

### 2. Dokumentace projektu
- `PROJEKT.md` - Popis projektu, cíle, požadavky
- `TIMELINE.md` - Časová osa vývoje
- `TEAM.md` - Kdo na projektu pracoval

### 3. Design assets
- `design/` - Design mockupy, wireframy
- `images/` - Originální obrázky
- `brand/` - Loga, barvy, typografie

### 4. Content
- `content/pages/` - Export jednotlivých stránek
- `content/posts/` - Export článků
- `content/media/` - Media soubory

### 5. Konfigurace
- `config/` - Konfigurační soubory webu
- `seo/` - SEO metadata, klíčová slova
- `analytics/` - Analytics setup

## Workflow pro zálohování

### Při vytvoření nového webu:
1. Vytvořit adresář pro web
2. Uložit inicializační export
3. Přidat dokumentaci projektu
4. Commitnout do Git

### Při větších změnách:
1. Vytvořit nový export
2. Uložit jako `export_[DATUM].json`
3. Přidat changelog
4. Commitnout změny

### Při dokončení projektu:
1. Vytvořit finální export
2. Přidat `FINAL_REPORT.md`
3. Označit jako dokončené

## Příklady

### Základní struktura adresáře:
```
12345_example-com_2026-03-15/
├── export.json
├── PROJEKT.md
├── TIMELINE.md
├── TEAM.md
├── design/
│   ├── wireframes/
│   ├── mockups/
│   └── style-guide.md
├── content/
│   ├── pages/
│   ├── posts/
│   └── media/
├── config/
│   ├── settings.json
│   └── seo-config.json
└── CHANGELOG.md
```

## Automatizace

Pro automatické zálohování použijte skript `scripts/backup-website.sh`:

```bash
./scripts/backup-website.sh [WEBSITE_ID] [PROJEKT_NAZEV]
```

Skript:
1. Vytvoří export webu
2. Vytvoří adresářovou strukturu
3. Uloží export a metadata
4. Přidá commit do Git

## Best practices

1. **Pravidelné zálohování** - Po každé větší změně
2. **Verzování exportů** - Ukládat s datem v názvu
3. **Dokumentace změn** - Vždy přidat CHANGELOG
4. **Testování exportů** - Validovat před uložením
5. **Záloha media** - Ukládat originální soubory

## Obnova webu

Pro obnovu webu z zálohy:
1. Použít MCP nástroj `import`
2. Nahrát `export.json`
3. Validovat data
4. Spustit import v režimu `merge` nebo `replace`

## Přístupová práva

- **Mateej, Domminik, Kristiaan, Damian** - Plný přístup
- **Externí spolupracovníci** - Read-only přístup
- **Klienti** - Přístup pouze k jejich projektu